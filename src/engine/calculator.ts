import { evaluate, isComplex } from 'mathjs';
import { parseNumericInput } from './numberInput';
import type { AngleMode, BatchRow, CalculationBatchResult, FormulaAnalysis, RowResult } from '../types';

/**
 * Memformat nilai numerik hasil perhitungan untuk tampilan:
 * - Hingga 8 angka desimal signifikan
 * - Memangkas angka nol tak perlu di akhir
 * - Notasi ilmiah untuk angka sangat besar atau sangat kecil
 * - Menangani bilangan kompleks dengan rapi
 */
export function formatResultValue(val: unknown): string {
  if (val === null || val === undefined) return '';

  if (typeof val === 'number') {
    if (isNaN(val)) return 'Tak Terdefinisi (NaN)';
    if (!isFinite(val)) return val > 0 ? '+Infinity' : '-Infinity';

    // Nol
    if (val === 0) return '0';

    const abs = Math.abs(val);
    // Gunakan notasi ilmiah untuk bilangan sangat besar atau sangat kecil
    if (abs >= 1e12 || abs < 1e-6) {
      return val.toExponential(6).replace(/\.0+e/, 'e').replace(/(\.\d+?)0+e/, '$1e');
    }

    // Pembulatan standar ke maksimal 8 desimal untuk menghindari artefak floating point
    const rounded = Number(val.toFixed(8));
    return rounded.toString();
  }

  // Cek bilangan kompleks dari mathjs
  if (isComplex(val)) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const comp = val as any;
    const re = formatResultValue(comp.re);
    const im = formatResultValue(comp.im);
    if (comp.re === 0 && comp.im === 0) return '0';
    if (comp.re === 0) return `${im}i`;
    if (comp.im === 0) return re;
    const sign = comp.im >= 0 ? '+' : '-';
    return `${re} ${sign} ${Math.abs(comp.im)}i`;
  }

  if (typeof val === 'boolean') {
    return val ? 'benar' : 'salah';
  }

  return String(val);
}

/**
 * Membuat scope evaluasi khusus untuk mode sudut (Radian default vs Derajat)
 */
function createTrigScope(angleMode: AngleMode): Record<string, unknown> {
  if (angleMode === 'rad') {
    return {};
  }

  const degToRad = (x: number) => (x * Math.PI) / 180;
  const radToDeg = (x: number) => (x * 180) / Math.PI;

  return {
    sin: (x: number) => Math.sin(degToRad(x)),
    cos: (x: number) => Math.cos(degToRad(x)),
    tan: (x: number) => Math.tan(degToRad(x)),
    asin: (x: number) => radToDeg(Math.asin(x)),
    acos: (x: number) => radToDeg(Math.acos(x)),
    atan: (x: number) => radToDeg(Math.atan(x)),
    atan2: (y: number, x: number) => radToDeg(Math.atan2(y, x)),
  };
}

/**
 * Menghitung batch hasil untuk hingga 10 baris data.
 * Setiap baris dievaluasi secara independen agar kesalahan di satu baris tidak menggagalkan baris lainnya.
 */
export function calculateBatch(
  formulaAnalysis: FormulaAnalysis,
  rows: BatchRow[],
  angleMode: AngleMode = 'rad'
): CalculationBatchResult {
  const { mathjsExpression, inputVariables } = formulaAnalysis;
  const trigScope = createTrigScope(angleMode);

  const results: RowResult[] = rows.map((row, index) => {
    const rowInputs: Record<string, number | null> = {};
    const evalScope: Record<string, unknown> = { ...trigScope };

    // 1. Validasi input setiap variabel di baris ini
    let validationError: string | null = null;

    for (const v of inputVariables) {
      const rawVal = row.values[v]?.trim();

      if (rawVal === undefined || rawVal === '') {
        rowInputs[v] = null;
        if (!validationError) {
          validationError = `Nilai untuk "${v}" belum diisi`;
        }
        continue;
      }

      // Cek apakah angka riil valid (bulat, desimal, pecahan, atau ekspresi aman)
      const num = parseNumericInput(rawVal);
      if (num === null) {
        rowInputs[v] = null;
        if (!validationError) {
          validationError = `"${rawVal}" bukan angka yang valid untuk "${v}". Gunakan angka, desimal (0,5), atau pecahan (1/2).`;
        }
      } else {
        rowInputs[v] = num;
        evalScope[v] = num;
      }
    }

    if (validationError) {
      return {
        rowIndex: index + 1,
        rowId: row.id,
        inputs: rowInputs,
        rawResult: null,
        formattedResult: '—',
        isSuccess: false,
        error: validationError,
      };
    }

    // 2. Jalankan perhitungan
    try {
      const evalResult = evaluate(mathjsExpression, evalScope);

      // Cek pembagian dengan nol atau hasil tak terdefinisi
      if (typeof evalResult === 'number') {
        if (isNaN(evalResult)) {
          return {
            rowIndex: index + 1,
            rowId: row.id,
            inputs: rowInputs,
            rawResult: null,
            formattedResult: 'Tak Terdefinisi (NaN)',
            isSuccess: false,
            error: 'Hasil tidak terdefinisi (NaN), kemungkinan 0 / 0 atau operasi tidak valid.',
          };
        }

        if (!isFinite(evalResult)) {
          return {
            rowIndex: index + 1,
            rowId: row.id,
            inputs: rowInputs,
            rawResult: evalResult,
            formattedResult: evalResult > 0 ? '+Infinity' : '-Infinity',
            isSuccess: false,
            error: 'Pembagian dengan nol atau hasil melebihi batas (Infinity).',
          };
        }

        return {
          rowIndex: index + 1,
          rowId: row.id,
          inputs: rowInputs,
          rawResult: evalResult,
          formattedResult: formatResultValue(evalResult),
          isSuccess: true,
        };
      }

      // Jika hasil bilangan kompleks
      if (isComplex(evalResult)) {
        return {
          rowIndex: index + 1,
          rowId: row.id,
          inputs: rowInputs,
          rawResult: null,
          formattedResult: formatResultValue(evalResult),
          isSuccess: true,
        };
      }

      return {
        rowIndex: index + 1,
        rowId: row.id,
        inputs: rowInputs,
        rawResult: null,
        formattedResult: String(evalResult),
        isSuccess: true,
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      return {
        rowIndex: index + 1,
        rowId: row.id,
        inputs: rowInputs,
        rawResult: null,
        formattedResult: 'Error',
        isSuccess: false,
        error: `Kesalahan perhitungan: ${msg}`,
      };
    }
  });

  return {
    formulaAnalysis,
    angleMode,
    rows,
    results,
    calculatedAt: Date.now(),
  };
}

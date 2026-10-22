import { parse, evaluate } from 'mathjs';
import { KNOWN_CONSTANTS, KNOWN_FUNCTIONS } from './mathConstants';
import { latexToMathjs } from './latexConverter';
import type { FormulaAnalysis } from '../types';

/**
 * Validates whether an identifier string is a valid variable name.
 */
export function isValidVariableName(name: string): boolean {
  return /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);
}

/**
 * Menganalisis dan memvalidasi input rumus (baik teks matematika biasa maupun LaTeX).
 * Mengekstrak nama variabel output (jika bentuk penugasan `lhs = rhs`),
 * mendeteksi seluruh variabel input sesuai urutan kemunculan,
 * dan melakukan pemeriksaan sintaksis deterministik.
 */
export function parseFormula(input: string, latexInput?: string): FormulaAnalysis {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      rawInput: '',
      latex: '',
      mathjsExpression: '',
      outputVariable: 'result',
      inputVariables: [],
      isValid: false,
      errorMessage: 'Harap masukkan rumus matematika untuk memulai.',
    };
  }

  // 1. Konversi LaTeX jika diperlukan
  let cleaned = trimmed;
  if (cleaned.includes('\\') || cleaned.includes('{') || cleaned.includes('}')) {
    cleaned = latexToMathjs(cleaned);
  }

  // 2. Identifikasi Penugasan Variabel (misalnya `s = ...` atau `Ek = ...`)
  let outputVariable = 'result';
  let exprToParse = cleaned;

  if (cleaned.includes('=')) {
    const parts = cleaned.split('=');
    if (parts.length > 2) {
      return {
        rawInput: input,
        latex: latexInput || input,
        mathjsExpression: cleaned,
        outputVariable: 'result',
        inputVariables: [],
        isValid: false,
        errorMessage: 'Rumus hanya boleh memiliki satu tanda sama dengan (=).',
      };
    }

    const lhs = parts[0].trim();
    const rhs = parts[1].trim();

    if (!lhs) {
      return {
        rawInput: input,
        latex: latexInput || input,
        mathjsExpression: cleaned,
        outputVariable: 'result',
        inputVariables: [],
        isValid: false,
        errorMessage: 'Nama variabel sebelum tanda sama dengan tidak boleh kosong.',
      };
    }

    if (!isValidVariableName(lhs)) {
      return {
        rawInput: input,
        latex: latexInput || input,
        mathjsExpression: cleaned,
        outputVariable: 'result',
        inputVariables: [],
        isValid: false,
        errorMessage: `"${lhs}" bukan nama variabel output yang valid. Gunakan nama pengenal yang benar seperti "s", "v0", atau "Ek".`,
      };
    }

    if (KNOWN_CONSTANTS.has(lhs)) {
      return {
        rawInput: input,
        latex: latexInput || input,
        mathjsExpression: cleaned,
        outputVariable: lhs,
        inputVariables: [],
        isValid: false,
        errorMessage: `"${lhs}" adalah konstanta yang dilindungi dan tidak dapat digunakan sebagai variabel output.`,
      };
    }

    outputVariable = lhs;
    exprToParse = rhs;
  }

  if (!exprToParse) {
    return {
      rawInput: input,
      latex: latexInput || input,
      mathjsExpression: cleaned,
      outputVariable,
      inputVariables: [],
      isValid: false,
      errorMessage: 'Ekspresi rumus tidak boleh kosong setelah tanda sama dengan.',
    };
  }

  // 3. Penguraian AST Deterministik dengan mathjs
  try {
    const node = parse(exprToParse);

    // Ekstrak nama fungsi yang digunakan dalam AST
    const functionNames = new Set<string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node.traverse((childNode: any) => {
      if (childNode.isFunctionNode && childNode.name) {
        functionNames.add(childNode.name);
      }
    });

    // Ekstrak semua node simbol yang merupakan variabel input
    const foundVariables: string[] = [];
    const seen = new Set<string>();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    node.traverse((childNode: any) => {
      if (childNode.isSymbolNode && childNode.name) {
        const name = childNode.name;

        // Lewati jika nama fungsi yang sedang dipanggil
        if (functionNames.has(name)) return;

        // Lewati jika nama fungsi matematika standar
        if (KNOWN_FUNCTIONS.has(name.toLowerCase())) return;

        // Lewati jika konstanta matematika (pi, e, i, dll.)
        if (KNOWN_CONSTANTS.has(name)) return;

        // Lewati jika sama dengan variabel output (LHS)
        if (name === outputVariable) return;

        if (!seen.has(name)) {
          seen.add(name);
          foundVariables.push(name);
        }
      }
    });

    // 4. Uji evaluasi dengan nilai tiruan untuk memastikan ekspresi valid
    const dummyScope: Record<string, number> = {};
    for (const v of foundVariables) {
      dummyScope[v] = 1;
    }

    try {
      const testResult = evaluate(exprToParse, dummyScope);
      if (typeof testResult !== 'number' && typeof testResult !== 'object' && typeof testResult !== 'boolean') {
        return {
          rawInput: input,
          latex: latexInput || input,
          mathjsExpression: exprToParse,
          outputVariable,
          inputVariables: foundVariables,
          isValid: false,
          errorMessage: 'Rumus tidak menghasilkan nilai numerik atau matematis yang valid.',
        };
      }
    } catch (evalErr: unknown) {
      const msg = evalErr instanceof Error ? evalErr.message : String(evalErr);
      return {
        rawInput: input,
        latex: latexInput || input,
        mathjsExpression: exprToParse,
        outputVariable,
        inputVariables: foundVariables,
        isValid: false,
        errorMessage: `Kesalahan evaluasi rumus: ${msg}`,
      };
    }

    return {
      rawInput: input,
      latex: latexInput || input,
      mathjsExpression: exprToParse,
      outputVariable,
      inputVariables: foundVariables,
      isValid: true,
    };
  } catch (parseErr: unknown) {
    const msg = parseErr instanceof Error ? parseErr.message : String(parseErr);
    return {
      rawInput: input,
      latex: latexInput || input,
      mathjsExpression: exprToParse,
      outputVariable,
      inputVariables: [],
      isValid: false,
      errorMessage: `Kesalahan sintaks: ${msg}`,
    };
  }
}

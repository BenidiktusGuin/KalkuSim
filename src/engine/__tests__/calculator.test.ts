import { describe, it, expect } from 'vitest';
import { parseFormula } from '../formulaParser';
import { calculateBatch, formatResultValue } from '../calculator';
import type { BatchRow } from '../../types';

describe('calculateBatch', () => {
  it('correctly calculates kinematics batch rows', () => {
    const analysis = parseFormula('s = v0 * t + 0.5 * a * t^2');
    const rows: BatchRow[] = [
      { id: '1', values: { v0: '0', t: '1', a: '9.8' } },
      { id: '2', values: { v0: '10', t: '2', a: '9.8' } },
      { id: '3', values: { v0: '20', t: '3', a: '-2' } },
    ];

    const batch = calculateBatch(analysis, rows);
    expect(batch.results).toHaveLength(3);

    // Row 1: 0 + 0.5 * 9.8 * 1 = 4.9
    expect(batch.results[0].isSuccess).toBe(true);
    expect(batch.results[0].rawResult).toBeCloseTo(4.9);
    expect(batch.results[0].formattedResult).toBe('4.9');

    // Row 2: 10 * 2 + 0.5 * 9.8 * 4 = 20 + 19.6 = 39.6
    expect(batch.results[1].isSuccess).toBe(true);
    expect(batch.results[1].rawResult).toBeCloseTo(39.6);
    expect(batch.results[1].formattedResult).toBe('39.6');

    // Row 3: 20 * 3 + 0.5 * -2 * 9 = 60 - 9 = 51
    expect(batch.results[2].isSuccess).toBe(true);
    expect(batch.results[2].rawResult).toBeCloseTo(51);
    expect(batch.results[2].formattedResult).toBe('51');
  });

  it('isolates errors on individual rows without failing other valid rows', () => {
    const analysis = parseFormula('r = a / b');
    const rows: BatchRow[] = [
      { id: '1', values: { a: '10', b: '2' } },
      { id: '2', values: { a: '10', b: '0' } }, // Division by zero
      { id: '3', values: { a: '10', b: '' } },  // Missing value
      { id: '4', values: { a: '10', b: 'xyz' } }, // Non-numeric
      { id: '5', values: { a: '15', b: '3' } },  // Valid row after errors
    ];

    const batch = calculateBatch(analysis, rows);

    // Row 1: 5 (valid)
    expect(batch.results[0].isSuccess).toBe(true);
    expect(batch.results[0].formattedResult).toBe('5');

    // Row 2: Div by 0
    expect(batch.results[1].isSuccess).toBe(false);
    expect(batch.results[1].error).toContain('Pembagian dengan nol');

    // Row 3: Missing
    expect(batch.results[2].isSuccess).toBe(false);
    expect(batch.results[2].error).toContain('belum diisi');

    // Row 4: Non-numeric
    expect(batch.results[3].isSuccess).toBe(false);
    expect(batch.results[3].error).toContain('bukan angka yang valid');

    // Row 5: 5 (valid)
    expect(batch.results[4].isSuccess).toBe(true);
    expect(batch.results[4].formattedResult).toBe('5');
  });

  it('respects degree mode for trigonometric calculations', () => {
    const analysis = parseFormula('y = sin(theta)');
    const rows: BatchRow[] = [
      { id: '1', values: { theta: '90' } },
      { id: '2', values: { theta: '30' } },
      { id: '3', values: { theta: '0' } },
    ];

    const batch = calculateBatch(analysis, rows, 'deg');
    expect(batch.results[0].isSuccess).toBe(true);
    expect(batch.results[0].rawResult).toBeCloseTo(1);

    expect(batch.results[1].isSuccess).toBe(true);
    expect(batch.results[1].rawResult).toBeCloseTo(0.5);

    expect(batch.results[2].isSuccess).toBe(true);
    expect(batch.results[2].rawResult).toBeCloseTo(0);
  });
});

describe('formatResultValue', () => {
  it('formats clean numbers and scientific notation', () => {
    expect(formatResultValue(42)).toBe('42');
    expect(formatResultValue(0)).toBe('0');
    expect(formatResultValue(0.1 + 0.2)).toBe('0.3');
    expect(formatResultValue(1e15)).toContain('e+15');
    expect(formatResultValue(NaN)).toBe('Tak Terdefinisi (NaN)');
    expect(formatResultValue(Infinity)).toBe('+Infinity');
  });
});

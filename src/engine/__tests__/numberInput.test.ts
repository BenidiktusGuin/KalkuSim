import { describe, it, expect } from 'vitest';
import { isValidNumericInput, parseNumericInput } from '../numberInput';

describe('parseNumericInput', () => {
  it('menerima bilangan bulat dan desimal biasa', () => {
    expect(parseNumericInput('0')).toBe(0);
    expect(parseNumericInput('42')).toBe(42);
    expect(parseNumericInput('-3.75')).toBe(-3.75);
    expect(parseNumericInput('.5')).toBe(0.5);
    expect(parseNumericInput('1e-3')).toBe(0.001);
  });

  it('menerima desimal dengan koma gaya Indonesia', () => {
    expect(parseNumericInput('0,5')).toBe(0.5);
    expect(parseNumericInput('-12,25')).toBe(-12.25);
    expect(parseNumericInput(',75')).toBe(0.75);
  });

  it('menerima pemisah ribuan', () => {
    expect(parseNumericInput('1.234,56')).toBe(1234.56);
    expect(parseNumericInput('1.234.567')).toBe(1234567);
    expect(parseNumericInput('1,234.56')).toBe(1234.56);
  });

  it('menerima pecahan dan ekspresi matematika sederhana', () => {
    expect(parseNumericInput('1/2')).toBe(0.5);
    expect(parseNumericInput('2/3')).toBeCloseTo(2 / 3);
    expect(parseNumericInput('2^3')).toBe(8);
    expect(parseNumericInput('sqrt(2)')).toBeCloseTo(Math.SQRT2);
    expect(parseNumericInput('pi/2')).toBeCloseTo(Math.PI / 2);
    expect(parseNumericInput('max(3, 7)')).toBe(7);
  });

  it('menolak input kosong, teks, variabel bebas, dan hasil tak hingga', () => {
    expect(parseNumericInput('')).toBeNull();
    expect(parseNumericInput('   ')).toBeNull();
    expect(parseNumericInput(undefined)).toBeNull();
    expect(parseNumericInput('abc')).toBeNull();
    expect(parseNumericInput('x + 1')).toBeNull();
    expect(parseNumericInput('1/0')).toBeNull();
    expect(parseNumericInput('2 +')).toBeNull();
  });
});

describe('isValidNumericInput', () => {
  it('mengembalikan status validasi yang konsisten', () => {
    expect(isValidNumericInput('0,5')).toBe(true);
    expect(isValidNumericInput('1/2')).toBe(true);
    expect(isValidNumericInput('')).toBe(false);
    expect(isValidNumericInput('bukan angka')).toBe(false);
  });
});

import { describe, it, expect } from 'vitest';
import { latexToMathjs } from '../latexConverter';

describe('latexToMathjs', () => {
  it('converts basic arithmetic and multiplication', () => {
    expect(latexToMathjs('a \\cdot b + c \\times d')).toBe('a * b + c * d');
    expect(latexToMathjs('a \\div b')).toBe('a / b');
  });

  it('converts simple fractions', () => {
    expect(latexToMathjs('\\frac{1}{2}')).toBe('((1) / (2))');
    expect(latexToMathjs('\\frac{a + b}{c}')).toBe('((a + b) / (c))');
  });

  it('converts nested fractions', () => {
    expect(latexToMathjs('\\frac{\\frac{a}{b}}{c}')).toBe('((((a) / (b))) / (c))');
  });

  it('converts roots (sqrt and nthRoot)', () => {
    expect(latexToMathjs('\\sqrt{x}')).toBe('sqrt(x)');
    expect(latexToMathjs('\\sqrt[3]{27}')).toBe('nthRoot(27, 3)');
    expect(latexToMathjs('\\sqrt{a^2 + b^2}')).toBe('sqrt(a^2 + b^2)');
  });

  it('converts powers and exponents', () => {
    expect(latexToMathjs('x^{2}')).toBe('x^(2)');
    expect(latexToMathjs('e^{x}')).toBe('e^(x)');
  });

  it('converts greek letters to ascii names', () => {
    expect(latexToMathjs('\\pi \\cdot r^2')).toBe('pi * r^2');
    expect(latexToMathjs('\\sin(\\theta) + \\cos(\\alpha)')).toBe('sin ( theta ) + cos ( alpha )');
  });

  it('converts kinematics formula with subscripts and fractions', () => {
    const raw = 's = v_0 \\cdot t + \\frac{1}{2} \\cdot a \\cdot t^2';
    const converted = latexToMathjs(raw);
    expect(converted).toContain('v_0 * t');
    expect(converted).toContain('((1) / (2)) * a * t^2');
  });
});

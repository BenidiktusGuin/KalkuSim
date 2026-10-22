import { describe, it, expect } from 'vitest';
import { parseFormula } from '../formulaParser';

describe('parseFormula', () => {
  it('parses simple formula without assignment and detects variables', () => {
    const res = parseFormula('v0 * t + 0.5 * a * t^2');
    expect(res.isValid).toBe(true);
    expect(res.outputVariable).toBe('result');
    expect(res.inputVariables).toEqual(['v0', 't', 'a']);
  });

  it('recognizes LHS in assignment and excludes it from input variables', () => {
    const res = parseFormula('s = v0*t + 0.5*a*t^2');
    expect(res.isValid).toBe(true);
    expect(res.outputVariable).toBe('s');
    expect(res.inputVariables).toEqual(['v0', 't', 'a']);
  });

  it('ignores standard math constants like pi and e', () => {
    const res = parseFormula('V = pi * r^2 * h');
    expect(res.isValid).toBe(true);
    expect(res.outputVariable).toBe('V');
    expect(res.inputVariables).toEqual(['r', 'h']);
    expect(res.inputVariables).not.toContain('pi');
  });

  it('ignores standard functions like sin, sqrt, abs', () => {
    const res = parseFormula('y = A * sin(omega * t + phi) + sqrt(offset)');
    expect(res.isValid).toBe(true);
    expect(res.outputVariable).toBe('y');
    expect(res.inputVariables).toEqual(['A', 'omega', 't', 'phi', 'offset']);
    expect(res.inputVariables).not.toContain('sin');
    expect(res.inputVariables).not.toContain('sqrt');
  });

  it('handles LaTeX formula inputs seamlessly', () => {
    const res = parseFormula('s = v_0 \\cdot t + \\frac{1}{2} \\cdot a \\cdot t^2');
    expect(res.isValid).toBe(true);
    expect(res.outputVariable).toBe('s');
    expect(res.inputVariables).toEqual(['v_0', 't', 'a']);
  });

  it('fails on syntax errors with descriptive error messages in Indonesian', () => {
    const res = parseFormula('s = v0 * + / 2');
    expect(res.isValid).toBe(false);
    expect(res.errorMessage).toBeDefined();
    expect(res.errorMessage).toContain('Kesalahan sintaks');
  });

  it('fails when LHS is an expression instead of a variable', () => {
    const res = parseFormula('a + b = c * d');
    expect(res.isValid).toBe(false);
    expect(res.errorMessage).toContain('bukan nama variabel output yang valid');
  });

  it('fails when LHS is a protected constant', () => {
    const res = parseFormula('pi = 3.1415');
    expect(res.isValid).toBe(false);
    expect(res.errorMessage).toContain('adalah konstanta yang dilindungi');
  });
});

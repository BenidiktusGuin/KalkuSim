/**
 * Robust converter from LaTeX mathematical notation to mathjs-compatible expression strings.
 * Handles nested fractions, roots, subscripts, powers, trigonometric functions, and LaTeX macros.
 */

import { parse } from 'mathjs';

/**
 * Extracts content inside balanced curly braces `{...}` starting at startIndex (which points to `{`).
 */
function extractBalancedBraces(
  str: string,
  startIndex: number
): { content: string; nextIndex: number } | null {
  if (str[startIndex] !== '{') return null;
  let depth = 0;
  let content = '';

  for (let i = startIndex; i < str.length; i++) {
    const ch = str[i];
    if (ch === '{') {
      if (depth > 0) content += ch;
      depth++;
    } else if (ch === '}') {
      depth--;
      if (depth === 0) {
        return { content, nextIndex: i + 1 };
      }
      content += ch;
    } else {
      content += ch;
    }
  }
  return null;
}

/**
 * Extracts content inside balanced brackets `[...]` starting at startIndex (which points to `[`).
 */
function extractBalancedBrackets(
  str: string,
  startIndex: number
): { content: string; nextIndex: number } | null {
  if (str[startIndex] !== '[') return null;
  let depth = 0;
  let content = '';

  for (let i = startIndex; i < str.length; i++) {
    const ch = str[i];
    if (ch === '[') {
      if (depth > 0) content += ch;
      depth++;
    } else if (ch === ']') {
      depth--;
      if (depth === 0) {
        return { content, nextIndex: i + 1 };
      }
      content += ch;
    } else {
      content += ch;
    }
  }
  return null;
}

/**
 * Recursively converts `\frac{num}{den}` into `((num) / (den))`
 */
function convertFractions(latex: string): string {
  let result = '';
  let i = 0;

  while (i < latex.length) {
    if (latex.startsWith('\\frac', i)) {
      let cursor = i + 5;
      // Skip any whitespace
      while (cursor < latex.length && /\s/.test(latex[cursor])) cursor++;

      const numMatch = extractBalancedBraces(latex, cursor);
      if (numMatch) {
        cursor = numMatch.nextIndex;
        while (cursor < latex.length && /\s/.test(latex[cursor])) cursor++;
        const denMatch = extractBalancedBraces(latex, cursor);
        if (denMatch) {
          const numConverted = convertFractions(numMatch.content);
          const denConverted = convertFractions(denMatch.content);
          result += `((${numConverted}) / (${denConverted}))`;
          i = denMatch.nextIndex;
          continue;
        }
      }
    }
    result += latex[i];
    i++;
  }

  return result;
}

/**
 * Converts `\sqrt[n]{x}` to `nthRoot(x, n)` and `\sqrt{x}` to `sqrt(x)`
 */
function convertRoots(latex: string): string {
  let result = '';
  let i = 0;

  while (i < latex.length) {
    if (latex.startsWith('\\sqrt', i)) {
      let cursor = i + 5;
      while (cursor < latex.length && /\s/.test(latex[cursor])) cursor++;

      // Check for optional `[n]`
      if (latex[cursor] === '[') {
        const rootMatch = extractBalancedBrackets(latex, cursor);
        if (rootMatch) {
          cursor = rootMatch.nextIndex;
          while (cursor < latex.length && /\s/.test(latex[cursor])) cursor++;
          const valMatch = extractBalancedBraces(latex, cursor);
          if (valMatch) {
            const val = convertRoots(valMatch.content);
            const n = convertRoots(rootMatch.content);
            result += `nthRoot(${val}, ${n})`;
            i = valMatch.nextIndex;
            continue;
          }
        }
      } else if (latex[cursor] === '{') {
        const valMatch = extractBalancedBraces(latex, cursor);
        if (valMatch) {
          const val = convertRoots(valMatch.content);
          result += `sqrt(${val})`;
          i = valMatch.nextIndex;
          continue;
        }
      }
    }
    result += latex[i];
    i++;
  }

  return result;
}

/**
 * Converts `^{...}` to `^(...)`
 */
function convertExponents(latex: string): string {
  let result = '';
  let i = 0;

  while (i < latex.length) {
    if (latex[i] === '^') {
      const nextCharIndex = i + 1;
      if (latex[nextCharIndex] === '{') {
        const match = extractBalancedBraces(latex, nextCharIndex);
        if (match) {
          const inner = convertExponents(match.content);
          result += `^(${inner})`;
          i = match.nextIndex;
          continue;
        }
      }
    }
    result += latex[i];
    i++;
  }

  return result;
}

/**
 * Converts subscripts like `v_{0}` or `v_0` to `v_0` or `v0`
 */
function convertSubscripts(latex: string): string {
  let result = '';
  let i = 0;

  while (i < latex.length) {
    if (latex[i] === '_') {
      const nextCharIndex = i + 1;
      if (latex[nextCharIndex] === '{') {
        const match = extractBalancedBraces(latex, nextCharIndex);
        if (match) {
          // Replace braces: v_{0} -> v_0
          result += `_${match.content.trim()}`;
          i = match.nextIndex;
          continue;
        }
      }
    }
    result += latex[i];
    i++;
  }

  return result;
}

/**
 * Main conversion function: takes a LaTeX string (e.g. from MathLive)
 * and returns a standard mathjs expression string.
 */
export function latexToMathjs(rawLatex: string): string {
  if (!rawLatex || !rawLatex.trim()) return '';

  let s = rawLatex.trim();

  // Strip empty MathLive placeholders / templates
  s = s.replace(/\\placeholder\{[^}]*\}/g, '0');
  s = s.replace(/#\?/g, '0');
  s = s.replace(/\\square/g, '0');

  // Convert fractions recursively
  s = convertFractions(s);

  // Convert roots
  s = convertRoots(s);

  // Convert subscripts
  s = convertSubscripts(s);

  // Convert exponents
  s = convertExponents(s);

  // Convert Greek letters to clean ascii variable names
  const greekLetters: Record<string, string> = {
    '\\alpha': 'alpha',
    '\\beta': 'beta',
    '\\gamma': 'gamma',
    '\\delta': 'delta',
    '\\Delta': 'Delta',
    '\\epsilon': 'epsilon',
    '\\zeta': 'zeta',
    '\\eta': 'eta',
    '\\theta': 'theta',
    '\\iota': 'iota',
    '\\kappa': 'kappa',
    '\\lambda': 'lambda',
    '\\mu': 'mu',
    '\\nu': 'nu',
    '\\xi': 'xi',
    '\\pi': 'pi',
    '\\rho': 'rho',
    '\\sigma': 'sigma',
    '\\tau': 'tau',
    '\\phi': 'phi',
    '\\chi': 'chi',
    '\\psi': 'psi',
    '\\omega': 'omega',
  };

  for (const [tex, name] of Object.entries(greekLetters)) {
    s = s.split(tex).join(` ${name} `);
  }

  // Common LaTeX operator replacements
  s = s.replace(/\\times/g, ' * ');
  s = s.replace(/\\cdot/g, ' * ');
  s = s.replace(/\\div/g, ' / ');
  s = s.replace(/\\pm/g, ' + '); // Note: +/- fallback to +

  // Trigonometric & logarithmic functions
  s = s.replace(/\\arcsin/g, ' asin ');
  s = s.replace(/\\arccos/g, ' acos ');
  s = s.replace(/\\arctan/g, ' atan ');
  s = s.replace(/\\sin/g, ' sin ');
  s = s.replace(/\\cos/g, ' cos ');
  s = s.replace(/\\tan/g, ' tan ');
  s = s.replace(/\\sec/g, ' sec ');
  s = s.replace(/\\csc/g, ' csc ');
  s = s.replace(/\\cot/g, ' cot ');
  s = s.replace(/\\ln/g, ' log ');
  s = s.replace(/\\log_\{10\}/g, ' log10 ');
  s = s.replace(/\\log10/g, ' log10 ');
  s = s.replace(/\\log/g, ' log10 ');
  s = s.replace(/\\exp/g, ' exp ');

  // Common math commands
  s = s.replace(/\\left\(/g, '(');
  s = s.replace(/\\right\)/g, ')');
  s = s.replace(/\\left\[/g, '(');
  s = s.replace(/\\right\]/g, ')');
  s = s.replace(/\\left\|([^\\|]+)\\right\|/g, 'abs($1)');
  s = s.replace(/\|([^|]+)\|/g, 'abs($1)');

  // Remove formatting macros
  s = s.replace(/\\operatorname\{([^}]+)\}/g, '$1');
  s = s.replace(/\\mathrm\{([^}]+)\}/g, '$1');
  s = s.replace(/\\text\{([^}]+)\}/g, '$1');
  s = s.replace(/\\mathit\{([^}]+)\}/g, '$1');
  s = s.replace(/\\mathbf\{([^}]+)\}/g, '$1');
  s = s.replace(/\\left/g, '');
  s = s.replace(/\\right/g, '');
  s = s.replace(/\\,/g, ' ');
  s = s.replace(/\\;/g, ' ');
  s = s.replace(/\\!/g, '');
  s = s.replace(/\\quad/g, ' ');
  s = s.replace(/\\qquad/g, ' ');

  // Convert standalone curly braces to parentheses or remove if redundant
  s = s.replace(/\{([^{}]+)\}/g, '($1)');

  // Normalize spaces
  s = s.replace(/\s+/g, ' ').trim();

  return s;
}

const ESCAPED_SUBSCRIPT = /\\_([A-Za-z0-9]+)/g;
const SINGLE_LETTER_MATHRM = /\\mathrm\{([A-Za-z])\}/g;

/**
 * Mengubah ekspresi mathjs menjadi LaTeX tampilan melalui AST mathjs.
 * Struktur matematika (pecahan, akar, pangkat) dihasilkan oleh toTex(),
 * bukan oleh penggantian string manual.
 */
export function expressionToLatex(expr: string): string {
  const source = expr?.trim();
  if (!source) return '';

  try {
    return parse(source)
      .toTex({ parenthesis: 'auto' })
      .replace(ESCAPED_SUBSCRIPT, '_{$1}')
      .replace(SINGLE_LETTER_MATHRM, ' $1')
      .replace(/\s+/g, ' ')
      .trim();
  } catch {
    const escaped = source.replace(/([\\{}])/g, '\\$1');
    return `\\text{${escaped}}`;
  }
}

/** Nama lama dipertahankan agar import lain tidak rusak. */
export function mathjsToLatex(expr: string): string {
  return expressionToLatex(expr);
}

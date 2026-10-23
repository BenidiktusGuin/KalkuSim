/**
 * ============================================================================
 * Komponen    : FormulaDisplay
 * Lapisan     : Komponen Bersama (Mathematical Rendering)
 *
 * Deskripsi:
 * Menampilkan rumus dan simbol matematika read-only melalui MathLive.
 * LaTeX tersimpan dipakai lebih dulu; bila tidak ada, ekspresi dikonversi
 * melalui serializer AST mathjs.
 * ============================================================================
 */

import React, { useEffect, useRef, useState } from 'react';
import 'mathlive';
import { expressionToLatex } from '../../engine/latexConverter';
import type { MathFieldElementTarget } from '../../types/mathlive';

export interface FormulaSource {
  rawInput?: string;
  latex?: string;
  mathjsExpression?: string;
}

const HAS_LATEX_COMMAND = /\\[a-zA-Z]+/;

/**
 * Memilih sumber LaTeX terbaik untuk ditampilkan.
 * LaTeX dari MathLive dipakai lebih dulu; teks biasa dikonversi via AST.
 */
export function getFormulaLatex(formula: FormulaSource): string {
  const savedLatex = formula.latex?.trim() ?? '';

  if (savedLatex && HAS_LATEX_COMMAND.test(savedLatex)) {
    return savedLatex;
  }

  const source =
    formula.rawInput?.trim() ||
    formula.mathjsExpression?.trim() ||
    savedLatex;

  return source ? expressionToLatex(source) : '';
}

interface MathFieldRendererProps {
  latex: string;
  fallback: string;
  label: string;
  className?: string;
  inline?: boolean;
}

const MathFieldRenderer: React.FC<MathFieldRendererProps> = ({
  latex,
  fallback,
  label,
  className = '',
  inline = false,
}) => {
  const mathFieldRef = useRef<MathFieldElementTarget | null>(null);
  const [renderFailed, setRenderFailed] = useState(false);

  useEffect(() => {
    if (!latex) return;

    const field = mathFieldRef.current;
    if (!field || typeof field.setValue !== 'function') {
      setRenderFailed(true);
      return;
    }

    try {
      field.setValue(latex, { silenceNotifications: true });
      setRenderFailed(false);
    } catch {
      setRenderFailed(true);
    }
  }, [latex]);

  if (!latex) return null;

  return (
    <span
      className={`${inline ? 'math-inline' : 'formula-display'} ${className}`.trim()}
      role="math"
      aria-label={label}
    >
      <math-field
        ref={mathFieldRef}
        class={renderFailed ? 'hidden' : inline ? 'math-inline-field' : 'formula-display-field'}
        read-only
        tabIndex={-1}
        aria-hidden="true"
      />
      {renderFailed && (
        <span className={inline ? 'math-inline-fallback' : 'formula-display-fallback'}>
          {fallback || label}
        </span>
      )}
    </span>
  );
};

interface FormulaDisplayProps {
  formula: FormulaSource;
  className?: string;
  label?: string;
}

export const FormulaDisplay: React.FC<FormulaDisplayProps> = ({
  formula,
  className = '',
  label = 'Rumus matematika',
}) => {
  const latex = getFormulaLatex(formula);

  return (
    <MathFieldRenderer
      latex={latex}
      fallback={formula.rawInput || latex}
      label={label}
      className={className}
    />
  );
};

interface InlineMathProps {
  latex: string;
  fallback?: string;
  label?: string;
  className?: string;
}

export const InlineMath: React.FC<InlineMathProps> = ({
  latex,
  fallback,
  label,
  className = '',
}) => (
  <MathFieldRenderer
    latex={latex}
    fallback={fallback ?? latex}
    label={label ?? fallback ?? 'Simbol matematika'}
    className={className}
    inline
  />
);

interface VariableMathProps {
  name: string;
  className?: string;
}

/** Menampilkan nama variabel sebagai notasi matematika (subscript, dsb.). */
export const VariableMath: React.FC<VariableMathProps> = ({ name, className = '' }) => (
  <InlineMath
    latex={expressionToLatex(name)}
    fallback={name}
    label={`Variabel ${name}`}
    className={className}
  />
);

export default FormulaDisplay;

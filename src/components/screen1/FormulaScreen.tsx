/**
 * ============================================================================
 * Komponen    : FormulaScreen
 * Lapisan     : Layar 1 (Layar Editor Rumus)
 *
 * Deskripsi:
 * Layar pertama untuk mendefinisikan rumus matematika. Berfokus langsung pada
 * editor rumus visual MathLive, validasi sintaks & deteksi variabel inline,
 * serta palet simbol yang tenang dan mudah diakses.
 * ============================================================================
 */

import React, { useRef } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle } from 'lucide-react';
import { MathLiveEditor } from './MathLiveEditor';
import { SymbolPalette } from './SymbolPalette';
import { VariableMath } from '../common/FormulaDisplay';
import type { AngleMode, FormulaAnalysis } from '../../types';

interface FormulaScreenProps {
  formulaInput: string;
  latexInput: string;
  onFormulaChange: (plain: string, latex: string) => void;
  analysis: FormulaAnalysis;
  onNext: () => void;
  angleMode?: AngleMode;
  onToggleAngleMode?: () => void;
}

/**
 * Layar penentuan rumus matematika KalkuSim.
 *
 * @param props Properti input rumus, status analisis, mode sudut, dan navigasi.
 * @returns Tampilan editor rumus yang terfokus dan minimalis.
 */
export const FormulaScreen: React.FC<FormulaScreenProps> = ({
  formulaInput,
  latexInput,
  onFormulaChange,
  analysis,
  onNext,
  angleMode,
  onToggleAngleMode,
}) => {
  const insertRef = useRef<((latexSnippet: string, plainSnippet: string) => void) | null>(null);

  const handleInsertSymbol = (latexSnippet: string, plainSnippet: string) => {
    if (insertRef.current) {
      insertRef.current(latexSnippet, plainSnippet);
    } else {
      const updated = formulaInput ? `${formulaInput} ${plainSnippet}` : plainSnippet;
      onFormulaChange(updated, updated);
    }
  };

  return (
    <div className="space-y-10">
      <header className="max-w-2xl">
        <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#2F3437] sm:text-4xl">
          Tentukan rumus
        </h1>
        <p className="mt-2 text-base text-[#6B7280]">
          Tulis rumus matematika. Variabel dikenali otomatis.
        </p>
      </header>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_19rem] lg:items-start">
        <section className="min-w-0 space-y-5">
          <MathLiveEditor
            value={formulaInput}
            latexValue={latexInput}
            onChange={onFormulaChange}
            onInsertRef={insertRef}
            angleMode={angleMode}
            onToggleAngleMode={onToggleAngleMode}
          />

          {formulaInput.trim() && (
            <div className="min-h-6 text-sm">
              {analysis.isValid ? (
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[#6B7280]">
                  <span className="inline-flex items-center gap-1.5 font-medium text-[#0F7B6C]">
                    <CheckCircle2 className="h-4 w-4" />
                    Rumus valid
                  </span>

                  <span className="inline-flex items-center gap-1.5">
                    <span>Hasil</span>
                    <VariableMath name={analysis.outputVariable} />
                  </span>

                  {analysis.inputVariables.length > 0 && (
                    <span className="inline-flex flex-wrap items-center gap-1.5">
                      <span>Variabel</span>
                      {analysis.inputVariables.map((v) => (
                        <VariableMath key={v} name={v} />
                      ))}
                    </span>
                  )}
                </div>
              ) : (
                <p className="flex items-start gap-2 text-[#B42318]">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  <span>{analysis.errorMessage}</span>
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end pt-2">
            <button
              type="button"
              onClick={onNext}
              disabled={!analysis.isValid}
              className={`inline-flex items-center gap-2 rounded-lg px-5 py-2.5 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D28D9]/30 focus-visible:ring-offset-2 ${
                analysis.isValid
                  ? 'bg-[#6D28D9] text-white hover:bg-[#5B21B6]'
                  : 'cursor-not-allowed bg-[#EAEAEA] text-[#9CA3AF]'
              }`}
            >
              <span>Lanjut ke variabel</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </section>

        <aside className="lg:sticky lg:top-24">
          <h2 className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#6B7280]">
            Simbol & fungsi
          </h2>
          <SymbolPalette onInsertSymbol={handleInsertSymbol} />
        </aside>
      </div>
    </div>
  );
};

export default FormulaScreen;

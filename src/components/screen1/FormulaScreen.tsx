import React, { useRef } from 'react';
import { ArrowRight, CheckCircle2, AlertTriangle, Info } from 'lucide-react';
import { MathLiveEditor } from './MathLiveEditor';
import { SymbolPalette } from './SymbolPalette';
import { PresetsBar } from './PresetsBar';
import type { FormulaAnalysis } from '../../types';
import type { FormulaPreset } from '../../engine/mathConstants';

interface FormulaScreenProps {
  formulaInput: string;
  latexInput: string;
  onFormulaChange: (plain: string, latex: string) => void;
  analysis: FormulaAnalysis;
  onNext: () => void;
  onLoadPreset: (preset: FormulaPreset) => void;
}

export const FormulaScreen: React.FC<FormulaScreenProps> = ({
  formulaInput,
  latexInput,
  onFormulaChange,
  analysis,
  onNext,
  onLoadPreset,
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
    <div className="w-full max-w-3xl mx-auto py-8 sm:py-12 px-4 sm:px-6 space-y-6">
      {/* Intro Subtitle */}
      <div className="space-y-1">
        <h1 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#37352F]">
          Tentukan Rumus Matematika
        </h1>
        <p className="text-sm text-[#787774]">
          Masukkan rumus matematika Anda. CalcBatch akan mendeteksi variabel secara otomatis untuk kalkulasi batch.
        </p>
      </div>

      {/* Main Focus: Visual Formula Editor */}
      <div className="bg-white p-5 rounded-xl border border-[#E9E9E7] shadow-sm space-y-4">
        <MathLiveEditor
          value={formulaInput}
          latexValue={latexInput}
          onChange={onFormulaChange}
          onInsertRef={insertRef}
        />

        {/* Real-time Syntax & Variable Detection Feedback */}
        {formulaInput.trim() && (
          <div
            className={`p-3.5 rounded-lg border text-xs transition-all ${
              analysis.isValid
                ? 'bg-[#EDF7F5] border-[#BCE3DA] text-[#0F7B6C]'
                : 'bg-[#FDF5F5] border-[#F8D2D2] text-[#EB5757]'
            }`}
          >
            {analysis.isValid ? (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-[#0F7B6C] shrink-0" />
                  <span className="font-medium">Ekspresi rumus valid</span>
                </div>

                <div className="flex items-center flex-wrap gap-2 text-[11px]">
                  <span className="text-[#0F7B6C]/80 font-medium">
                    Output: <code className="font-mono font-bold bg-white/70 px-1.5 py-0.5 rounded text-[#0F7B6C]">{analysis.outputVariable}</code>
                  </span>
                  <span className="text-[#0F7B6C]/40">•</span>
                  <span className="text-[#0F7B6C]/80 font-medium">
                    Input ({analysis.inputVariables.length}):
                  </span>
                  {analysis.inputVariables.length === 0 ? (
                    <span className="italic text-[#0F7B6C]/70">Tidak ada (rumus konstan)</span>
                  ) : (
                    analysis.inputVariables.map((v) => (
                      <span
                        key={v}
                        className="font-mono font-semibold bg-white/80 px-1.5 py-0.5 rounded border border-[#BCE3DA] text-[#0F7B6C]"
                      >
                        {v}
                      </span>
                    ))
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-[#EB5757] shrink-0 mt-0.5" />
                <div>
                  <span className="font-medium">Sintaks Rumus Belum Lengkap:</span>{' '}
                  <span>{analysis.errorMessage}</span>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Symbol & Function Palette */}
      <div className="space-y-2">
        <div className="flex items-center justify-between px-1 text-xs text-[#787774]">
          <span className="font-medium text-[#37352F]">Katalog Simbol & Fungsi</span>
          <span>Klik untuk menyisipkan pada kursor</span>
        </div>
        <SymbolPalette onInsertSymbol={handleInsertSymbol} />
      </div>

      {/* Presets Gallery */}
      <PresetsBar onSelectPreset={onLoadPreset} />

      {/* Primary Action Button */}
      <div className="pt-4 flex items-center justify-between border-t border-[#E9E9E7]">
        <div className="flex items-center gap-2 text-xs text-[#787774]">
          <Info className="w-3.5 h-3.5 text-[#9B9A97]" />
          <span>Mendukung penugasan (<code className="font-mono text-[#37352F]">s = ...</code>) dan ekspresi langsung</span>
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={!analysis.isValid}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium transition-all shadow-xs ${
            analysis.isValid
              ? 'bg-[#6D28D9] hover:bg-[#5B21B6] text-white cursor-pointer active:scale-[0.99]'
              : 'bg-[#EAEAEA] text-[#9B9A97] cursor-not-allowed'
          }`}
        >
          <span>Selanjutnya: Input Variabel</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

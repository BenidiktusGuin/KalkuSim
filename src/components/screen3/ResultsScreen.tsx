import React, { useState } from 'react';
import { ArrowLeft, PlusCircle, BookmarkCheck, Bookmark, Check, Layers, Edit3 } from 'lucide-react';
import { ResultsTable } from './ResultsTable';
import { PrecisionInspector } from './PrecisionInspector';
import type { CalculationBatchResult, RowResult } from '../../types';

interface ResultsScreenProps {
  batch: CalculationBatchResult;
  onNewCalculation: () => void;
  onEditInputs: () => void;
  onSaveToHistory: (batch: CalculationBatchResult) => boolean;
  isAlreadySaved?: boolean;
}

export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  batch,
  onNewCalculation,
  onEditInputs,
  onSaveToHistory,
  isAlreadySaved = false,
}) => {
  const { formulaAnalysis, angleMode, results } = batch;
  const [inspectedResult, setInspectedResult] = useState<RowResult | null>(null);
  const [saved, setSaved] = useState(isAlreadySaved);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const handleSave = () => {
    const success = onSaveToHistory(batch);
    if (success) {
      setSaved(true);
      setSaveToast('Perhitungan berhasil disimpan ke riwayat lokal.');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  const validRows = results.filter((r) => r.isSuccess).length;

  return (
    <div className="w-full max-w-4xl mx-auto py-8 sm:py-10 px-4 sm:px-6 space-y-6">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 bg-[#37352F] text-white px-4 py-2.5 rounded-lg shadow-lg text-xs font-medium animate-in fade-in slide-in-from-bottom-2 duration-200">
          <Check className="w-4 h-4 text-[#0F7B6C]" />
          <span>{saveToast}</span>
        </div>
      )}

      {/* Formula & Calculation Metadata Card */}
      <div className="bg-white p-5 rounded-xl border border-[#E9E9E7] shadow-xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs text-[#787774]">
              <Layers className="w-3.5 h-3.5 text-[#6D28D9]" />
              <span className="font-semibold text-[#37352F]">Rumus yang Dihitung</span>
              <span>•</span>
              <span className="font-mono text-[#37352F]">Mode Sudut: {angleMode.toUpperCase()}</span>
            </div>
            <div className="font-mono text-lg sm:text-xl font-bold text-[#37352F] tracking-tight">
              {formulaAnalysis.rawInput}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onEditInputs}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E9E9E7] bg-white hover:bg-[#FAF5FF] text-xs font-medium text-[#37352F] transition-colors"
            >
              <Edit3 className="w-3.5 h-3.5 text-[#787774]" />
              <span>Ubah Nilai Variabel</span>
            </button>
          </div>
        </div>

        {/* Quick summary stats */}
        <div className="pt-2 border-t border-[#F1F1EF] flex items-center flex-wrap gap-4 text-xs text-[#787774]">
          <div>
            Variabel Output:{' '}
            <span className="font-mono font-bold text-[#6D28D9]">{formulaAnalysis.outputVariable}</span>
          </div>
          <span>•</span>
          <div>
            Variabel yang Dihitung:{' '}
            <span className="font-mono text-[#37352F] font-semibold">
              {formulaAnalysis.inputVariables.join(', ') || 'tidak ada'}
            </span>
          </div>
          <span>•</span>
          <div>
            Tingkat Keberhasilan:{' '}
            <span className="font-semibold text-[#37352F]">
              {validRows} / {results.length} baris
            </span>
          </div>
        </div>
      </div>

      {/* Results Table */}
      <ResultsTable batch={batch} onInspectResult={setInspectedResult} />

      {/* Primary Bottom Actions */}
      <div className="pt-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-[#E9E9E7]">
        <button
          type="button"
          onClick={onEditInputs}
          className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#787774] hover:text-[#37352F] hover:bg-[#F1F1EF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Edit Variabel</span>
        </button>

        <div className="flex items-center gap-2.5">
          {/* Save to History Button */}
          <button
            type="button"
            onClick={handleSave}
            disabled={saved}
            className={`flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              saved
                ? 'bg-[#EDF7F5] border-[#BCE3DA] text-[#0F7B6C] cursor-default'
                : 'bg-white border-[#E9E9E7] hover:border-[#DDD6FE] hover:bg-[#FAF5FF] text-[#37352F] cursor-pointer'
            }`}
          >
            {saved ? (
              <>
                <BookmarkCheck className="w-4 h-4 text-[#0F7B6C]" />
                <span>Tersimpan di Riwayat</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4 text-[#787774]" />
                <span>Simpan ke Riwayat</span>
              </>
            )}
          </button>

          {/* New Calculation Button */}
          <button
            type="button"
            onClick={onNewCalculation}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#6D28D9] hover:bg-[#5B21B6] text-white transition-all shadow-xs cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Perhitungan Baru</span>
          </button>
        </div>
      </div>

      {/* Precision Inspector Popover/Modal */}
      <PrecisionInspector
        result={inspectedResult}
        outputVariable={formulaAnalysis.outputVariable}
        onClose={() => setInspectedResult(null)}
      />
    </div>
  );
};

/**
 * ============================================================================
 * Komponen    : ResultsScreen
 * Lapisan     : Layar 3 (Layar Hasil Batch & Inspektor Presisi)
 *
 * Deskripsi:
 * Menampilkan hasil perhitungan batch dalam format tabel responsif lengkap
 * dengan isolasi galat per baris, inspektor presisi, ekspor CSV, dan simpan riwayat.
 * ============================================================================
 */

import React, { useState } from 'react';
import { ArrowLeft, PlusCircle, BookmarkCheck, Bookmark, Check, Edit3 } from 'lucide-react';
import { FormulaDisplay } from '../common/FormulaDisplay';
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

/**
 * Layar hasil kalkulasi batch KalkuSim.
 *
 * @param props Data batch hasil kalkulasi dan aksi simpan/navigasi.
 * @returns Tampilan ringkasan eksekusi, tabel hasil, dan bilah aksi bawah.
 */
export const ResultsScreen: React.FC<ResultsScreenProps> = ({
  batch,
  onNewCalculation,
  onEditInputs,
  onSaveToHistory,
  isAlreadySaved = false,
}) => {
  const { formulaAnalysis, angleMode } = batch;
  const [inspectedResult, setInspectedResult] = useState<RowResult | null>(null);
  const [saved, setSaved] = useState(isAlreadySaved);
  const [saveToast, setSaveToast] = useState<string | null>(null);

  const handleSave = () => {
    const success = onSaveToHistory(batch);
    if (success) {
      setSaved(true);
      setSaveToast('Disimpan ke riwayat.');
      setTimeout(() => setSaveToast(null), 3000);
    }
  };

  return (
    <div className="space-y-9">
      {/* Toast Notification */}
      {saveToast && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 rounded-lg bg-[#2F3437] px-4 py-2.5 text-sm font-medium text-white shadow-lg">
          <Check className="h-4 w-4 text-[#8FD8C8]" />
          <span>{saveToast}</span>
        </div>
      )}

      <header className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6D28D9]">
              Langkah 3 — Hasil
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#2F3437] sm:text-4xl">
              Hasil perhitungan
            </h1>
          </div>

          <button
            type="button"
            onClick={onEditInputs}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#2F3437]"
          >
            <Edit3 className="h-4 w-4" />
            Ubah nilai
          </button>
        </div>

        <div className="max-w-3xl border-l-2 border-[#E9E9E7] pl-4">
          <p className="text-xs text-[#9CA3AF]">
            Sudut {angleMode === 'rad' ? 'radian' : 'derajat'}
          </p>
          <FormulaDisplay formula={formulaAnalysis} />
        </div>
      </header>

      <ResultsTable batch={batch} onInspectResult={setInspectedResult} />

      <div className="flex flex-col-reverse gap-4 border-t border-[#E9E9E7] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onEditInputs}
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#2F3437]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={saved}
            className={`inline-flex items-center justify-center gap-1.5 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-colors ${
              saved
                ? 'cursor-default border-[#BCE3DA] bg-[#EDF7F5] text-[#0F7B6C]'
                : 'border-[#E9E9E7] bg-white text-[#2F3437] hover:bg-[#F7F7F5]'
            }`}
          >
            {saved ? (
              <>
                <BookmarkCheck className="h-4 w-4" />
                Tersimpan
              </>
            ) : (
              <>
                <Bookmark className="h-4 w-4" />
                Simpan
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onNewCalculation}
            className="inline-flex items-center justify-center gap-1.5 rounded-lg bg-[#6D28D9] px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5B21B6]"
          >
            <PlusCircle className="h-4 w-4" />
            Perhitungan baru
          </button>
        </div>
      </div>

      <PrecisionInspector
        result={inspectedResult}
        outputVariable={formulaAnalysis.outputVariable}
        onClose={() => setInspectedResult(null)}
      />
    </div>
  );
};

export default ResultsScreen;

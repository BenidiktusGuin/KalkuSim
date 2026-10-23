/**
 * ============================================================================
 * Komponen    : VariableScreen
 * Lapisan     : Layar 2 (Layar Input Variabel)
 *
 * Deskripsi:
 * Layar kedua untuk mengisi nilai angka variabel batch dalam bentuk tabel
 * yang lapang, validasi baris, dan memicu kalkulasi batch.
 * ============================================================================
 */

import React from 'react';
import { ArrowLeft, Play, Edit3 } from 'lucide-react';
import { FormulaDisplay } from '../common/FormulaDisplay';
import { VariableTable } from './VariableTable';
import type { BatchRow, FormulaAnalysis } from '../../types';

interface VariableScreenProps {
  analysis: FormulaAnalysis;
  rows: BatchRow[];
  onUpdateCell: (rowId: string, variable: string, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onDuplicateRow: (rowId: string) => void;
  onClearRows: () => void;
  onBack: () => void;
  onCalculate: () => void;
}

/**
 * Layar tabel input data variabel batch.
 *
 * @param props Konfigurasi variabel, baris data, dan aksi kalkulasi/navigasi.
 * @returns Tampilan ringkasan rumus, tabel variabel, dan bilah aksi bawah.
 */
export const VariableScreen: React.FC<VariableScreenProps> = ({
  analysis,
  rows,
  onUpdateCell,
  onAddRow,
  onRemoveRow,
  onDuplicateRow,
  onClearRows,
  onBack,
  onCalculate,
}) => {
  return (
    <div className="space-y-9">
      <header className="space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#6D28D9]">
              Langkah 2 — Variabel
            </p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#2F3437] sm:text-4xl">
              Masukkan nilai
            </h1>
          </div>

          <button
            type="button"
            onClick={onBack}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#2F3437]"
          >
            <Edit3 className="h-4 w-4" />
            Ubah rumus
          </button>
        </div>

        <div className="max-w-2xl border-l-2 border-[#E9E9E7] pl-4">
          <FormulaDisplay formula={analysis} />
        </div>
      </header>

      <VariableTable
        analysis={analysis}
        rows={rows}
        onUpdateCell={onUpdateCell}
        onAddRow={onAddRow}
        onRemoveRow={onRemoveRow}
        onDuplicateRow={onDuplicateRow}
        onClearRows={onClearRows}
      />

      <div className="flex flex-col-reverse gap-4 border-t border-[#E9E9E7] pt-6 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center justify-center gap-1.5 text-sm font-medium text-[#6B7280] hover:text-[#2F3437]"
        >
          <ArrowLeft className="h-4 w-4" />
          Kembali
        </button>

        <button
          type="button"
          onClick={onCalculate}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#6D28D9] px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-[#5B21B6] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D28D9]/30 focus-visible:ring-offset-2"
        >
          Hitung
          <Play className="h-4 w-4 fill-white" />
        </button>
      </div>
    </div>
  );
};

export default VariableScreen;

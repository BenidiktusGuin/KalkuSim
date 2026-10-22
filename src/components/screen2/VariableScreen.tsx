import React from 'react';
import { ArrowLeft, Play, Edit3, Layers } from 'lucide-react';
import { VariableTable } from './VariableTable';
import type { BatchRow, FormulaAnalysis } from '../../types';

interface VariableScreenProps {
  analysis: FormulaAnalysis;
  rows: BatchRow[];
  onUpdateCell: (rowId: string, variable: string, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onDuplicateRow: (rowId: string) => void;
  onFillSampleData?: () => void;
  onClearRows: () => void;
  onBack: () => void;
  onCalculate: () => void;
}

export const VariableScreen: React.FC<VariableScreenProps> = ({
  analysis,
  rows,
  onUpdateCell,
  onAddRow,
  onRemoveRow,
  onDuplicateRow,
  onFillSampleData,
  onClearRows,
  onBack,
  onCalculate,
}) => {
  // Hitung baris yang sudah terisi valid
  const isRowFilled = (row: BatchRow) => {
    return analysis.inputVariables.every((v) => {
      const val = row.values[v]?.trim();
      return val !== undefined && val !== '' && !isNaN(Number(val));
    });
  };

  const filledCount = rows.filter(isRowFilled).length;

  return (
    <div className="w-full max-w-4xl mx-auto py-8 sm:py-10 px-4 sm:px-6 space-y-6">
      {/* Formula Summary Banner */}
      <div className="bg-white p-4 sm:p-5 rounded-xl border border-[#E9E9E7] shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs text-[#787774]">
            <Layers className="w-3.5 h-3.5 text-[#6D28D9]" />
            <span className="font-semibold text-[#37352F]">Rumus Aktif</span>
            <span>•</span>
            <span>Menghitung output <code className="font-mono font-bold text-[#6D28D9]">{analysis.outputVariable}</code></span>
          </div>
          <div className="font-mono text-base sm:text-lg font-semibold text-[#37352F] tracking-tight">
            {analysis.rawInput}
          </div>
        </div>

        <button
          type="button"
          onClick={onBack}
          className="self-start sm:self-center flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E9E9E7] bg-white hover:bg-[#F7F7F5] text-xs font-medium text-[#37352F] transition-colors"
        >
          <Edit3 className="w-3.5 h-3.5 text-[#787774]" />
          <span>Ubah Rumus</span>
        </button>
      </div>

      {/* Screen Title & Directions */}
      <div className="space-y-1">
        <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-[#37352F]">
          Masukkan Nilai Variabel
        </h1>
        <p className="text-xs sm:text-sm text-[#787774]">
          Isi nilai angka untuk setiap variabel yang terdeteksi. Setiap baris merupakan satu set perhitungan independen.
        </p>
      </div>

      {/* Editable Variable Table */}
      <VariableTable
        analysis={analysis}
        rows={rows}
        onUpdateCell={onUpdateCell}
        onAddRow={onAddRow}
        onRemoveRow={onRemoveRow}
        onDuplicateRow={onDuplicateRow}
        onFillSampleData={onFillSampleData}
        onClearRows={onClearRows}
      />

      {/* Bottom Navigation & Action Bar */}
      <div className="pt-4 flex items-center justify-between border-t border-[#E9E9E7]">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-[#787774] hover:text-[#37352F] hover:bg-[#F1F1EF] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Rumus</span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs text-[#787774] hidden sm:inline">
            {filledCount} dari {rows.length} baris siap dihitung
          </span>

          <button
            type="button"
            onClick={onCalculate}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[#6D28D9] hover:bg-[#5B21B6] text-white transition-all shadow-xs active:scale-[0.99] cursor-pointer"
          >
            <Play className="w-4 h-4 fill-white" />
            <span>Hitung Batch</span>
          </button>
        </div>
      </div>
    </div>
  );
};

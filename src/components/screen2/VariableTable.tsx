import React from 'react';
import { Plus, Trash2, Copy, Sparkles, AlertCircle } from 'lucide-react';
import type { BatchRow, FormulaAnalysis } from '../../types';

interface VariableTableProps {
  analysis: FormulaAnalysis;
  rows: BatchRow[];
  onUpdateCell: (rowId: string, variable: string, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onDuplicateRow: (rowId: string) => void;
  onFillSampleData?: () => void;
  onClearRows: () => void;
}

export const VariableTable: React.FC<VariableTableProps> = ({
  analysis,
  rows,
  onUpdateCell,
  onAddRow,
  onRemoveRow,
  onDuplicateRow,
  onFillSampleData,
  onClearRows,
}) => {
  const { inputVariables } = analysis;
  const maxRows = 10;
  const canAddRow = rows.length < maxRows;

  // Cek apakah nilai cell tidak valid (bukan angka valid)
  const isCellInvalid = (val?: string) => {
    if (!val || val.trim() === '') return false;
    return isNaN(Number(val.trim()));
  };

  // Cek apakah cell kosong
  const isCellEmpty = (val?: string) => {
    return !val || val.trim() === '';
  };

  return (
    <div className="w-full space-y-3">
      {/* Table Action Controls */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-medium text-[#37352F]">
            Baris Data ({rows.length} / {maxRows})
          </span>
          <span className="text-[#9B9A97]">•</span>
          <span className="text-[#787774]">Maksimal 10 baris untuk kalkulasi batch</span>
        </div>

        <div className="flex items-center gap-2">
          {onFillSampleData && (
            <button
              type="button"
              onClick={onFillSampleData}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#E9E9E7] bg-white hover:bg-[#F5F3FF] text-[#37352F] font-medium transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#6D28D9]" />
              <span>Isi Data Contoh</span>
            </button>
          )}

          <button
            type="button"
            onClick={onClearRows}
            className="px-2.5 py-1 rounded-md border border-[#E9E9E7] bg-white hover:bg-[#F7F7F5] text-[#787774] hover:text-[#37352F] transition-colors"
          >
            Kosongkan Semua
          </button>
        </div>
      </div>

      {/* Main Table Container */}
      <div className="w-full bg-white rounded-xl border border-[#E9E9E7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[500px]">
            <thead>
              <tr className="bg-[#F7F7F5] border-b border-[#E9E9E7] text-xs font-semibold text-[#787774]">
                <th className="py-2.5 px-4 w-14 text-center">#</th>
                {inputVariables.map((v) => (
                  <th key={v} className="py-2.5 px-4 font-mono text-[#37352F]">
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-bold text-[#6D28D9]">{v}</span>
                      <span className="text-[10px] text-[#9B9A97] font-sans font-normal">(variabel)</span>
                    </div>
                  </th>
                ))}
                <th className="py-2.5 px-4 w-24 text-right">Aksi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F1F1EF] text-sm">
              {rows.map((row, index) => (
                <tr
                  key={row.id}
                  className="group hover:bg-[#FBFBFA] transition-colors"
                >
                  {/* Row Number */}
                  <td className="py-2.5 px-4 text-center font-mono text-xs text-[#9B9A97] select-none">
                    {index + 1}
                  </td>

                  {/* Input Variable Cells */}
                  {inputVariables.map((v) => {
                    const rawVal = row.values[v] || '';
                    const invalid = isCellInvalid(rawVal);
                    const empty = isCellEmpty(rawVal);

                    return (
                      <td key={v} className="py-2 px-3">
                        <div className="relative">
                          <input
                            type="text"
                            inputMode="decimal"
                            value={rawVal}
                            onChange={(e) => onUpdateCell(row.id, v, e.target.value)}
                            placeholder="Masukkan angka..."
                            className={`w-full px-3 py-1.5 font-mono text-sm rounded-md border transition-all focus:outline-none ${
                              invalid
                                ? 'border-[#EB5757] bg-[#FDF5F5] text-[#EB5757] focus:ring-2 focus:ring-[#EB5757]/20'
                                : empty
                                ? 'border-[#E9E9E7] bg-white text-[#37352F] hover:border-[#D3D3D0] focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/15'
                                : 'border-[#E9E9E7] bg-white text-[#37352F] focus:border-[#6D28D9] focus:ring-2 focus:ring-[#6D28D9]/15'
                            }`}
                          />
                          {invalid && (
                            <span
                              title="Nilai bukan angka yang valid"
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#EB5757]"
                            >
                              <AlertCircle className="w-3.5 h-3.5" />
                            </span>
                          )}
                        </div>
                      </td>
                    );
                  })}

                  {/* Row Actions */}
                  <td className="py-2 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => onDuplicateRow(row.id)}
                        disabled={!canAddRow}
                        title="Duplikasi baris"
                        className="p-1.5 rounded-md hover:bg-[#F1F1EF] text-[#787774] hover:text-[#37352F] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onRemoveRow(row.id)}
                        disabled={rows.length <= 1}
                        title={rows.length <= 1 ? 'Tidak dapat menghapus satu-satunya baris' : 'Hapus baris'}
                        className="p-1.5 rounded-md hover:bg-[#FDEDED] text-[#787774] hover:text-[#EB5757] disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Row Button Row */}
        <div className="p-3 bg-[#FBFBFA] border-t border-[#E9E9E7] flex items-center justify-between">
          <button
            type="button"
            onClick={onAddRow}
            disabled={!canAddRow}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium text-[#6D28D9] bg-[#6D28D9]/10 hover:bg-[#6D28D9]/20 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Tambah Baris</span>
          </button>

          <span className="text-[11px] text-[#9B9A97]">
            {canAddRow ? `${10 - rows.length} baris lagi tersedia` : 'Batas maksimum baris tercapai (10)'}
          </span>
        </div>
      </div>
    </div>
  );
};

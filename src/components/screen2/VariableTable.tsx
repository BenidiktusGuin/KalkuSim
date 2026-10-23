/**
 * ============================================================================
 * Komponen    : VariableTable
 * Lapisan     : Layar 2 (Fitur Tabel Variabel)
 *
 * Deskripsi:
 * Tabel input dinamis hingga 10 baris untuk variabel matematika yang terdeteksi
 * secara otomatis dengan validasi sel instan, penambahan, duplikasi, dan penghapusan baris.
 * ============================================================================
 */

import React from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';
import { VariableMath } from '../common/FormulaDisplay';
import type { BatchRow, FormulaAnalysis } from '../../types';

interface VariableTableProps {
  analysis: FormulaAnalysis;
  rows: BatchRow[];
  onUpdateCell: (rowId: string, variable: string, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onDuplicateRow: (rowId: string) => void;
  onClearRows: () => void;
}

/**
 * Komponen tabel interaktif untuk pengisian variabel batch.
 *
 * @param props Konfigurasi variabel dan baris data serta handler operasi tabel.
 * @returns Komponen tabel variabel responsif dengan kontrol baris.
 */
export const VariableTable: React.FC<VariableTableProps> = ({
  analysis,
  rows,
  onUpdateCell,
  onAddRow,
  onRemoveRow,
  onDuplicateRow,
  onClearRows,
}) => {
  const { inputVariables } = analysis;
  const maxRows = 10;
  const canAddRow = rows.length < maxRows;

  // * Cek apakah nilai cell tidak valid (bukan angka valid)
  const isCellInvalid = (val?: string) => {
    if (!val || val.trim() === '') return false;
    return isNaN(Number(val.trim()));
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#2F3437]">Data</h2>
        <div className="flex items-center gap-4 text-sm text-[#6B7280]">
          <span className="tabular-nums">{rows.length} baris</span>
          <button
            type="button"
            onClick={onClearRows}
            className="underline-offset-4 hover:text-[#2F3437] hover:underline"
          >
            Kosongkan
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#D3D3D0]">
              <th className="w-10 pb-2 pr-3 text-xs font-medium text-[#9CA3AF]">#</th>
              {inputVariables.map((v) => (
                <th key={v} className="pb-2 pr-4 text-sm font-semibold text-[#2F3437]">
                  <VariableMath name={v} />
                </th>
              ))}
              <th className="w-24 pb-2 text-right text-xs font-medium text-[#9CA3AF]">
                Aksi
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row, index) => (
              <tr
                key={row.id}
                className="group border-b border-[#F1F1EF] align-middle"
              >
                <td className="py-2 pr-3 text-sm tabular-nums text-[#9CA3AF]">
                  {index + 1}
                </td>

                {inputVariables.map((v) => {
                  const rawVal = row.values[v] || '';
                  const invalid = isCellInvalid(rawVal);

                  return (
                    <td key={v} className="py-2 pr-4">
                      <input
                        type="text"
                        inputMode="decimal"
                        value={rawVal}
                        onChange={(e) => onUpdateCell(row.id, v, e.target.value)}
                        placeholder="0"
                        aria-label={`${v} baris ${index + 1}`}
                        aria-invalid={invalid}
                        className={`w-full border-0 border-b bg-transparent px-0 py-2 text-base tabular-nums text-[#2F3437] placeholder:text-[#C7C7C4] focus:outline-none ${
                          invalid
                            ? 'border-[#EB5757] text-[#B42318]'
                            : 'border-[#E9E9E7] focus:border-[#6D28D9]'
                        }`}
                      />
                      {invalid && (
                        <span className="mt-1 block text-xs text-[#B42318]">
                          Masukkan angka.
                        </span>
                      )}
                    </td>
                  );
                })}

                <td className="py-2 text-right">
                  <div className="flex justify-end gap-1 opacity-60 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100">
                    <button
                      type="button"
                      onClick={() => onDuplicateRow(row.id)}
                      disabled={!canAddRow}
                      title="Duplikasi baris"
                      className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#F1F1EF] hover:text-[#2F3437] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onRemoveRow(row.id)}
                      disabled={rows.length <= 1}
                      title="Hapus baris"
                      className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#FDEDED] hover:text-[#EB5757] disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={onAddRow}
          disabled={!canAddRow}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#6D28D9] hover:text-[#5B21B6] disabled:cursor-not-allowed disabled:text-[#C7C7C4]"
        >
          <Plus className="h-4 w-4" />
          Tambah baris
        </button>
        {!canAddRow && (
          <span className="text-xs text-[#9CA3AF]">Maksimum 10 baris</span>
        )}
      </div>
    </section>
  );
};

export default VariableTable;

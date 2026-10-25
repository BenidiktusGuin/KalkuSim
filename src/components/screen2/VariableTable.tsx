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

import React, { useEffect, useRef, useState } from 'react';
import { Plus, Trash2, Copy } from 'lucide-react';
import { VariableMath } from '../common/FormulaDisplay';
import { parseClipboardMatrix } from '../../engine/clipboardPaste';
import { parseNumericInput } from '../../engine/numberInput';
import type { PasteCellIssue, PasteResult } from '../../engine/clipboardPaste';
import type { BatchRow, FormulaAnalysis } from '../../types';

const ROW_REMOVE_ANIMATION_MS = 180;
const CELL_PASTE_HIGHLIGHT_MS = 700;

interface VariableTableProps {
  analysis: FormulaAnalysis;
  rows: BatchRow[];
  onUpdateCell: (rowId: string, variable: string, value: string) => void;
  onAddRow: () => void;
  onRemoveRow: (rowId: string) => void;
  onDuplicateRow: (rowId: string) => void;
  onClearRows: () => void;
  onPasteBlock: (
    startRowId: string,
    startVariableIndex: number,
    matrix: string[][]
  ) => PasteResult;
}

interface PasteNotice {
  tone: 'success' | 'warning' | 'error';
  message: string;
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
  onPasteBlock,
}) => {
  const { inputVariables } = analysis;
  const maxRows = 10;
  const canAddRow = rows.length < maxRows;

  // * Cek apakah nilai cell tidak valid (kosong tidak dianggap galat)
  const isCellInvalid = (val?: string) => {
    if (!val || val.trim() === '') return false;
    return parseNumericInput(val) === null;
  };

  const [pasteNotice, setPasteNotice] = useState<PasteNotice | null>(null);
  const [removingRowIds, setRemovingRowIds] = useState<string[]>([]);
  const [highlightedCells, setHighlightedCells] = useState<Set<string>>(
    new Set()
  );
  const removalTimersRef = useRef<number[]>([]);
  const highlightTimerRef = useRef<number | null>(null);

  const visibleRowCount = rows.length - removingRowIds.length;
  const canRemoveRow = visibleRowCount > 1;

  useEffect(() => {
    return () => {
      removalTimersRef.current.forEach((timer) => window.clearTimeout(timer));
      if (highlightTimerRef.current !== null) {
        window.clearTimeout(highlightTimerRef.current);
      }
    };
  }, []);

  const highlightPastedCells = (
    result: PasteResult,
    startRowId: string,
    startVariableIndex: number
  ) => {
    const startIndex = result.rows.findIndex((row) => row.id === startRowId);
    if (startIndex < 0) return;

    const nextCells = new Set<string>();

    for (let rowOffset = 0; rowOffset < result.rowsWritten; rowOffset += 1) {
      const row = result.rows[startIndex + rowOffset];
      if (!row) continue;

      for (
        let columnOffset = 0;
        columnOffset < result.columnsWritten;
        columnOffset += 1
      ) {
        const variable = inputVariables[startVariableIndex + columnOffset];
        if (variable) {
          nextCells.add(`${row.id}:${variable}`);
        }
      }
    }

    if (nextCells.size === 0) return;

    setHighlightedCells(nextCells);

    if (highlightTimerRef.current !== null) {
      window.clearTimeout(highlightTimerRef.current);
    }

    highlightTimerRef.current = window.setTimeout(() => {
      setHighlightedCells(new Set());
      highlightTimerRef.current = null;
    }, CELL_PASTE_HIGHLIGHT_MS);
  };

  const describeInvalidCells = (cells: PasteCellIssue[]): string => {
    const preview = cells
      .slice(0, 3)
      .map((cell) => `${cell.variable} baris ${cell.rowNumber} ("${cell.value}")`)
      .join(', ');
    return cells.length > 3 ? `${preview}, dan ${cells.length - 3} sel lainnya` : preview;
  };

  const handleCellPaste = (
    event: React.ClipboardEvent<HTMLInputElement>,
    rowId: string,
    variableIndex: number
  ) => {
    const text = event.clipboardData.getData('text/plain');

    // Satu sel tanpa tab/newline: biarkan paste bawaan browser (edit biasa).
    if (!text.includes('\t') && !/[\r\n]/.test(text)) return;

    event.preventDefault();

    const matrix = parseClipboardMatrix(text);

    if (matrix.length === 0) {
      setPasteNotice({
        tone: 'warning',
        message: 'Tidak ada data yang bisa ditempel dari clipboard.',
      });
      return;
    }

    const result = onPasteBlock(rowId, variableIndex, matrix);

    if (!result.applied) {
      setPasteNotice({
        tone: 'error',
        message:
          'Data tidak dapat ditempel. Pastikan rumus memiliki variabel dan masih ada baris yang tersedia.',
      });
      return;
    }

    highlightPastedCells(result, rowId, variableIndex);

    const notes: string[] = [];

    if (result.invalidCells.length > 0) {
      notes.push(
        `${result.invalidCells.length} sel perlu diperbaiki: ${describeInvalidCells(
          result.invalidCells
        )}.`
      );
    }

    if (result.rowsTruncated > 0) {
      notes.push(
        `${result.rowsTruncated} baris melebihi batas maksimum 10 baris dan tidak diimpor.`
      );
    }

    if (result.columnsTruncated > 0) {
      notes.push(
        `${result.columnsTruncated} kolom melebihi jumlah variabel yang tersedia dan tidak diimpor.`
      );
    }

    const summary = `${result.rowsWritten} baris × ${result.columnsWritten} kolom ditempel.`;

    setPasteNotice({
      tone: notes.length === 0 ? 'success' : 'warning',
      message: [summary, ...notes].join(' '),
    });
  };

  const handleRemoveRow = (rowId: string) => {
    const activeRowCount = rows.filter(
      (row) => !removingRowIds.includes(row.id)
    ).length;

    if (activeRowCount <= 1 || removingRowIds.includes(rowId)) return;

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      onRemoveRow(rowId);
      return;
    }

    setRemovingRowIds((prev) => [...prev, rowId]);

    const timer = window.setTimeout(() => {
      onRemoveRow(rowId);
      setRemovingRowIds((prev) => prev.filter((id) => id !== rowId));
      removalTimersRef.current = removalTimersRef.current.filter(
        (pendingTimer) => pendingTimer !== timer
      );
    }, ROW_REMOVE_ANIMATION_MS);

    removalTimersRef.current.push(timer);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-[#2F3437]">Data</h2>
        </div>
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

      {pasteNotice && (
        <div
          role={pasteNotice.tone === 'error' ? 'alert' : 'status'}
          className={`flex items-start justify-between gap-3 rounded-md border px-3 py-2 text-xs ${
            pasteNotice.tone === 'error'
              ? 'border-[#EB5757]/30 bg-[#FDF5F5] text-[#B42318]'
              : pasteNotice.tone === 'warning'
                ? 'border-[#D97706]/30 bg-[#FFFBEB] text-[#B45309]'
                : 'border-[#0F7B6C]/30 bg-[#EDF7F5] text-[#0F7B6C]'
          }`}
        >
          <span>{pasteNotice.message}</span>
          <button
            type="button"
            onClick={() => setPasteNotice(null)}
            className="shrink-0 font-semibold underline underline-offset-2 hover:no-underline"
          >
            Tutup
          </button>
        </div>
      )}

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
            {rows.map((row, index) => {
              const isRemoving = removingRowIds.includes(row.id);

              return (
                <tr
                  key={row.id}
                  inert={isRemoving || undefined}
                  className={`group border-b border-[#F1F1EF] align-middle ${
                    isRemoving ? 'row-exit' : 'row-enter'
                  }`}
                >
                  <td className="py-2 pr-3 text-sm tabular-nums text-[#9CA3AF]">
                    {index + 1}
                  </td>

                  {inputVariables.map((v, variableIndex) => {
                    const rawVal = row.values[v] || '';
                    const invalid = isCellInvalid(rawVal);
                    const isHighlighted = highlightedCells.has(
                      `${row.id}:${v}`
                    );

                    return (
                      <td
                        key={v}
                        className={`py-2 pr-4 ${
                          isHighlighted ? 'cell-updated' : ''
                        }`}
                      >
                        <input
                          type="text"
                          value={rawVal}
                          onChange={(e) =>
                            onUpdateCell(row.id, v, e.target.value)
                          }
                          onPaste={(e) =>
                            handleCellPaste(e, row.id, variableIndex)
                          }
                          placeholder="0 atau 0,5"
                          aria-label={`${v} baris ${index + 1}`}
                          aria-invalid={invalid}
                          autoCapitalize="none"
                          autoCorrect="off"
                          spellCheck={false}
                          className={`w-full border-0 border-b bg-transparent px-0 py-2 text-base tabular-nums text-[#2F3437] placeholder:text-[#C7C7C4] focus:outline-none ${
                            invalid
                              ? 'border-[#EB5757] text-[#B42318]'
                              : 'border-[#E9E9E7] focus:border-[#6D28D9]'
                          }`}
                        />
                        {invalid && (
                          <span className="mt-1 block text-xs text-[#B42318]">
                            Masukkan angka atau ekspresi yang valid.
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
                        onClick={() => handleRemoveRow(row.id)}
                        disabled={!canRemoveRow || isRemoving}
                        title="Hapus baris"
                        className="rounded-md p-1.5 text-[#6B7280] hover:bg-[#FDEDED] hover:text-[#EB5757] disabled:cursor-not-allowed disabled:opacity-30"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
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

/**
 * ============================================================================
 * Modul       : clipboardPaste
 * Lapisan     : Mesin (Tempel Data Tabel Variabel)
 *
 * Deskripsi:
 * Mengurai teks tab-separated dari Excel/Google Sheets menjadi matriks, lalu
 * menerapkannya ke baris data mulai dari sel yang dipilih. Modul ini murni
 * (tidak menyentuh React/DOM) sehingga mudah diuji.
 * ============================================================================
 */

import { parseNumericInput } from './numberInput';
import type { BatchRow } from '../types';

export interface PasteCellIssue {
  /** Nomor baris tabel (1-based), sesuai kolom "#". */
  rowNumber: number;
  variable: string;
  value: string;
}

export interface PasteResult {
  applied: boolean;
  rows: BatchRow[];
  rowsWritten: number;
  columnsWritten: number;
  rowsTruncated: number;
  columnsTruncated: number;
  invalidCells: PasteCellIssue[];
}

export interface ApplyPasteParams {
  rows: BatchRow[];
  inputVariables: string[];
  startRowId: string;
  startVariableIndex: number;
  matrix: string[][];
  maxRows: number;
}

/** Baris yang hanya berisi spasi/tab dianggap kosong. */
const isBlankLine = (line: string): boolean => line.trim() === '';

/**
 * Mengubah teks clipboard menjadi matriks string.
 *
 * - `\r\n` dan `\r` dinormalkan menjadi `\n`.
 * - Baris kosong di awal/akhir dibuang agar trailing newline tidak menambah baris.
 * - Sel kosong di ujung kanan tiap baris dibuang agar tab sisa tidak dihitung kolom.
 * - Baris kosong di tengah dipertahankan (tidak menulis sel apa pun).
 */
export function parseClipboardMatrix(text: string): string[][] {
  const lines = text.replace(/\r\n?/g, '\n').split('\n');

  while (lines.length > 0 && isBlankLine(lines[0])) lines.shift();
  while (lines.length > 0 && isBlankLine(lines[lines.length - 1])) lines.pop();

  return lines.map((line) => {
    const cells = line.split('\t').map((cell) => cell.trim());
    while (cells.length > 0 && cells[cells.length - 1] === '') cells.pop();
    return cells;
  });
}

/**
 * Menerapkan matriks tempelan mulai dari sel terpilih.
 *
 * Nilai dipetakan berdasarkan nama variabel (`inputVariables[startColumn + j]`),
 * bukan urutan key objek. Baris/kolom berlebih dipotong dan dilaporkan lewat
 * `rowsTruncated` / `columnsTruncated`. Nilai tidak valid tetap disimpan apa
 * adanya agar validasi sel yang sudah ada menyorotnya, dan dilaporkan lewat
 * `invalidCells` — tidak pernah diubah menjadi nol.
 */
export function applyPasteBlock({
  rows,
  inputVariables,
  startRowId,
  startVariableIndex,
  matrix,
  maxRows,
}: ApplyPasteParams): PasteResult {
  const base: PasteResult = {
    applied: false,
    rows,
    rowsWritten: 0,
    columnsWritten: 0,
    rowsTruncated: 0,
    columnsTruncated: 0,
    invalidCells: [],
  };

  if (matrix.length === 0 || inputVariables.length === 0) return base;

  const foundRowIndex = rows.findIndex((row) => row.id === startRowId);
  const startRowIndex = foundRowIndex >= 0 ? foundRowIndex : 0;
  const startColumnIndex = Math.min(
    Math.max(startVariableIndex, 0),
    inputVariables.length - 1
  );

  const blockWidth = matrix.reduce(
    (width, sourceRow) => Math.max(width, sourceRow.length),
    0
  );

  const availableRows = Math.max(0, maxRows - startRowIndex);
  const availableColumns = inputVariables.length - startColumnIndex;
  const rowsToWrite = Math.min(matrix.length, availableRows);
  const columnsToWrite = Math.min(blockWidth, availableColumns);

  const rowsTruncated = Math.max(0, matrix.length - rowsToWrite);
  const columnsTruncated = Math.max(0, blockWidth - columnsToWrite);

  if (rowsToWrite === 0 || columnsToWrite === 0) {
    return { ...base, rowsTruncated, columnsTruncated };
  }

  // Salin baris yang ada agar state lama tidak dimutasi.
  const nextRows = rows.map((row) => ({ ...row, values: { ...row.values } }));
  const stamp = Date.now();

  while (nextRows.length < startRowIndex + rowsToWrite) {
    nextRows.push({
      id: `row-${stamp}-paste-${nextRows.length + 1}`,
      values: {},
    });
  }

  const invalidCells: PasteCellIssue[] = [];

  for (let rowOffset = 0; rowOffset < rowsToWrite; rowOffset += 1) {
    const sourceRow = matrix[rowOffset] ?? [];
    const targetRow = nextRows[startRowIndex + rowOffset];

    for (let columnOffset = 0; columnOffset < columnsToWrite; columnOffset += 1) {
      // Baris sumber yang lebih pendek tidak mengubah sel lama di kanannya.
      if (columnOffset >= sourceRow.length) continue;

      const variable = inputVariables[startColumnIndex + columnOffset];
      const value = sourceRow[columnOffset] ?? '';

      targetRow.values[variable] = value;

      if (value !== '' && parseNumericInput(value) === null) {
        invalidCells.push({
          rowNumber: startRowIndex + rowOffset + 1,
          variable,
          value,
        });
      }
    }
  }

  return {
    applied: true,
    rows: nextRows,
    rowsWritten: rowsToWrite,
    columnsWritten: columnsToWrite,
    rowsTruncated,
    columnsTruncated,
    invalidCells,
  };
}

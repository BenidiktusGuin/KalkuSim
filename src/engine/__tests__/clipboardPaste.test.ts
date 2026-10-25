import { describe, it, expect } from 'vitest';
import { applyPasteBlock, parseClipboardMatrix } from '../clipboardPaste';
import type { BatchRow } from '../../types';

const makeRows = (count: number): BatchRow[] =>
  Array.from({ length: count }, (_, index) => ({
    id: `r${index}`,
    values: {},
  }));

describe('parseClipboardMatrix', () => {
  it('memisahkan tab dan baris serta menormalkan CRLF', () => {
    expect(parseClipboardMatrix('1\t2\r\n3\t4\r\n')).toEqual([
      ['1', '2'],
      ['3', '4'],
    ]);
  });

  it('membuang newline dan sel kosong di ujung', () => {
    expect(parseClipboardMatrix('\n1\t2\t\n\n')).toEqual([['1', '2']]);
  });

  it('mempertahankan baris kosong di tengah', () => {
    expect(parseClipboardMatrix('1\t2\n\n3\t4')).toEqual([
      ['1', '2'],
      [],
      ['3', '4'],
    ]);
  });
});

describe('applyPasteBlock', () => {
  it('menempel mulai sel terpilih dan menambah baris otomatis', () => {
    const result = applyPasteBlock({
      rows: makeRows(1),
      inputVariables: ['a', 'b', 'c'],
      startRowId: 'r0',
      startVariableIndex: 0,
      matrix: [
        ['1', '2'],
        ['3', '4'],
        ['5', '6'],
      ],
      maxRows: 10,
    });

    expect(result.applied).toBe(true);
    expect(result.rowsWritten).toBe(3);
    expect(result.columnsWritten).toBe(2);
    expect(result.rows).toHaveLength(3);
    expect(result.rows[0].values).toEqual({ a: '1', b: '2' });
    expect(result.rows[2].values).toEqual({ a: '5', b: '6' });
    expect(result.invalidCells).toEqual([]);
  });

  it('memetakan kolom sesuai nama variabel dan offset kolom', () => {
    const result = applyPasteBlock({
      rows: makeRows(2),
      inputVariables: ['a', 'b', 'c'],
      startRowId: 'r1',
      startVariableIndex: 1,
      matrix: [['2', '3']],
      maxRows: 10,
    });

    expect(result.rows).toHaveLength(2);
    expect(result.rows[0].values).toEqual({});
    expect(result.rows[1].values).toEqual({ b: '2', c: '3' });
  });

  it('memotong baris di atas 10 dan melaporkannya', () => {
    const matrix = Array.from({ length: 12 }, (_, index) => [String(index + 1)]);
    const result = applyPasteBlock({
      rows: makeRows(3),
      inputVariables: ['a'],
      startRowId: 'r0',
      startVariableIndex: 0,
      matrix,
      maxRows: 10,
    });

    expect(result.rows).toHaveLength(10);
    expect(result.rowsWritten).toBe(10);
    expect(result.rowsTruncated).toBe(2);
    expect(result.rows[9].values).toEqual({ a: '10' });
  });

  it('menghormati batas 10 baris saat mulai dari baris terakhir', () => {
    const result = applyPasteBlock({
      rows: makeRows(10),
      inputVariables: ['a'],
      startRowId: 'r9',
      startVariableIndex: 0,
      matrix: [['1'], ['2'], ['3']],
      maxRows: 10,
    });

    expect(result.rows).toHaveLength(10);
    expect(result.rowsWritten).toBe(1);
    expect(result.rowsTruncated).toBe(2);
    expect(result.rows[9].values).toEqual({ a: '1' });
  });

  it('memotong kolom di luar variabel dan melaporkannya', () => {
    const result = applyPasteBlock({
      rows: makeRows(1),
      inputVariables: ['a', 'b'],
      startRowId: 'r0',
      startVariableIndex: 0,
      matrix: [['1', '2', '3']],
      maxRows: 10,
    });

    expect(result.columnsTruncated).toBe(1);
    expect(result.rows[0].values).toEqual({ a: '1', b: '2' });
  });

  it('menandai nilai tidak valid tanpa mengubahnya menjadi nol', () => {
    const result = applyPasteBlock({
      rows: makeRows(1),
      inputVariables: ['a', 'b'],
      startRowId: 'r0',
      startVariableIndex: 0,
      matrix: [['1', 'abc']],
      maxRows: 10,
    });

    expect(result.rows[0].values).toEqual({ a: '1', b: 'abc' });
    expect(result.invalidCells).toEqual([
      { rowNumber: 1, variable: 'b', value: 'abc' },
    ]);
  });

  it('mengosongkan sel yang kosong di tengah blok', () => {
    const initial = makeRows(1);
    initial[0].values = { a: '9', b: '9' };

    const result = applyPasteBlock({
      rows: initial,
      inputVariables: ['a', 'b'],
      startRowId: 'r0',
      startVariableIndex: 0,
      matrix: [['', '2']],
      maxRows: 10,
    });

    expect(result.rows[0].values).toEqual({ a: '', b: '2' });
  });

  it('tidak menambah baris untuk matriks kosong', () => {
    const result = applyPasteBlock({
      rows: makeRows(3),
      inputVariables: ['a'],
      startRowId: 'r0',
      startVariableIndex: 0,
      matrix: [],
      maxRows: 10,
    });

    expect(result.applied).toBe(false);
    expect(result.rows).toHaveLength(3);
  });
});

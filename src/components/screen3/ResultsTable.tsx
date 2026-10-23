/**
 * ============================================================================
 * Komponen    : ResultsTable
 * Lapisan     : Layar 3 (Fitur Tabel Hasil)
 *
 * Deskripsi:
 * Tabel hasil evaluasi perhitungan batch baris demi baris, status validasi,
 * akses inspeksi presisi penuh, serta opsi ekspor ke format CSV dan TSV.
 * ============================================================================
 */

import React, { useState } from 'react';
import { AlertTriangle, Download, Copy, Check } from 'lucide-react';
import { VariableMath } from '../common/FormulaDisplay';
import type { CalculationBatchResult, RowResult } from '../../types';

interface ResultsTableProps {
  batch: CalculationBatchResult;
  onInspectResult: (result: RowResult) => void;
}

/**
 * Komponen tabel hasil evaluasi perhitungan batch KalkuSim.
 *
 * @param props Data batch hasil kalkulasi dan handler inspeksi presisi baris.
 * @returns Komponen tabel hasil kalkulasi lengkap dengan ekspor data.
 */
export const ResultsTable: React.FC<ResultsTableProps> = ({
  batch,
  onInspectResult,
}) => {
  const { formulaAnalysis, results } = batch;
  const { inputVariables, outputVariable } = formulaAnalysis;
  const [copiedTable, setCopiedTable] = useState(false);

  const successCount = results.filter((r) => r.isSuccess).length;

  // * Fungsi ekspor CSV
  const handleExportCSV = () => {
    const headers = ['Baris', ...inputVariables, outputVariable, 'Status', 'Error'];
    const rowsCSV = results.map((r) => {
      const inputs = inputVariables.map((v) =>
        r.inputs[v] !== null ? r.inputs[v] : ''
      );
      const res = r.rawResult !== null ? r.rawResult : r.formattedResult;
      const status = r.isSuccess ? 'Valid' : 'Error';
      const err = r.error ? `"${r.error.replace(/"/g, '""')}"` : '';
      return [r.rowIndex, ...inputs, res, status, err].join(',');
    });

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rowsCSV].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute(
      'download',
      `KalkuSim_${outputVariable}_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // * Salin tabel sebagai format TSV untuk Notion atau Google Sheets
  const handleCopyTable = () => {
    const headers = ['Baris', ...inputVariables, outputVariable].join('\t');
    const lines = results.map((r) => {
      const inputs = inputVariables
        .map((v) => (r.inputs[v] !== null ? r.inputs[v] : '—'))
        .join('\t');
      return `${r.rowIndex}\t${inputs}\t${r.formattedResult}`;
    });

    navigator.clipboard.writeText(`${headers}\n${lines.join('\n')}`);
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2000);
  };

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-sm font-semibold text-[#2F3437]">Hasil</h2>

        <div className="flex flex-wrap items-center gap-4 text-sm text-[#6B7280]">
          <span className="tabular-nums">
            {successCount} dari {results.length} baris valid
          </span>

          <button
            type="button"
            onClick={handleCopyTable}
            title="Salin tabel sebagai TSV"
            className="inline-flex items-center gap-1.5 hover:text-[#2F3437]"
          >
            {copiedTable ? (
              <>
                <Check className="h-4 w-4 text-[#0F7B6C]" />
                Tersalin
              </>
            ) : (
              <>
                <Copy className="h-4 w-4" />
                Salin
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 hover:text-[#2F3437]"
          >
            <Download className="h-4 w-4" />
            CSV
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[620px] border-collapse text-left">
          <thead>
            <tr className="border-b border-[#D3D3D0]">
              <th className="w-10 pb-2 pr-3 text-xs font-medium text-[#9CA3AF]">#</th>
              {inputVariables.map((v) => (
                <th key={v} className="pb-2 pr-4 text-sm font-semibold text-[#2F3437]">
                  <VariableMath name={v} />
                </th>
              ))}
              <th className="pb-2 pr-4 text-sm font-semibold text-[#4C1D95]">
                <span className="inline-flex items-center gap-1">
                  <VariableMath name={outputVariable} />
                  <span className="text-xs font-medium text-[#9CA3AF]">hasil</span>
                </span>
              </th>
              <th className="w-24 pb-2 pr-4 text-xs font-medium text-[#9CA3AF]">Status</th>
              <th className="w-20 pb-2 text-right text-xs font-medium text-[#9CA3AF]">
                Presisi
              </th>
            </tr>
          </thead>

          <tbody>
            {results.map((r) => (
              <tr
                key={r.rowId}
                className={`border-b border-[#F1F1EF] ${
                  r.isSuccess ? '' : 'bg-[#FDF5F5]/50'
                }`}
              >
                <td className="py-3 pr-3 text-sm tabular-nums text-[#9CA3AF]">
                  {r.rowIndex}
                </td>

                {inputVariables.map((v) => (
                  <td key={v} className="py-3 pr-4 text-base tabular-nums text-[#2F3437]">
                    {r.inputs[v] !== null ? (
                      r.inputs[v]
                    ) : (
                      <span className="text-[#C7C7C4]">—</span>
                    )}
                  </td>
                ))}

                <td
                  className={`py-3 pr-4 text-lg font-semibold tabular-nums ${
                    r.isSuccess ? 'text-[#4C1D95]' : 'text-[#9CA3AF]'
                  }`}
                >
                  {r.formattedResult}
                </td>

                <td className="py-3 pr-4">
                  {r.isSuccess ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#0F7B6C]">
                      <span className="h-1.5 w-1.5 rounded-full bg-current" />
                      Valid
                    </span>
                  ) : (
                    <span
                      title={r.error}
                      className="inline-flex items-center gap-1.5 text-xs font-medium text-[#B42318]"
                    >
                      <AlertTriangle className="h-3.5 w-3.5" />
                      Error
                    </span>
                  )}
                </td>

                <td className="py-3 text-right">
                  <button
                    type="button"
                    onClick={() => onInspectResult(r)}
                    title="Periksa presisi penuh"
                    className="text-xs font-medium text-[#6B7280] hover:text-[#6D28D9]"
                  >
                    Lihat
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {results.some((r) => !r.isSuccess) && (
        <div className="space-y-1.5 border-t border-[#F1F1EF] pt-3 text-sm text-[#B42318]">
          {results
            .filter((r) => !r.isSuccess)
            .map((r) => (
              <p key={r.rowId}>
                <span className="font-semibold tabular-nums">Baris {r.rowIndex}:</span>{' '}
                {r.error}
              </p>
            ))}
        </div>
      )}
    </section>
  );
};

export default ResultsTable;

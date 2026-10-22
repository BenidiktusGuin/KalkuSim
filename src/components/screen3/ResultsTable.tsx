import React, { useState } from 'react';
import { CheckCircle2, AlertTriangle, Search, Download, Copy, Check } from 'lucide-react';
import type { CalculationBatchResult, RowResult } from '../../types';

interface ResultsTableProps {
  batch: CalculationBatchResult;
  onInspectResult: (result: RowResult) => void;
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ batch, onInspectResult }) => {
  const { formulaAnalysis, results } = batch;
  const { inputVariables, outputVariable } = formulaAnalysis;
  const [copiedTable, setCopiedTable] = useState(false);

  // Fungsi ekspor CSV
  const handleExportCSV = () => {
    const headers = ['Baris', ...inputVariables, outputVariable, 'Status', 'Error'];
    const rowsCSV = results.map((r) => {
      const inputs = inputVariables.map((v) => (r.inputs[v] !== null ? r.inputs[v] : ''));
      const res = r.rawResult !== null ? r.rawResult : r.formattedResult;
      const status = r.isSuccess ? 'Valid' : 'Error';
      const err = r.error ? `"${r.error.replace(/"/g, '""')}"` : '';
      return [r.rowIndex, ...inputs, res, status, err].join(',');
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rowsCSV].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CalcBatch_${outputVariable}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Salin tabel sebagai format TSV untuk Notion atau Google Sheets
  const handleCopyTable = () => {
    const headers = ['Baris', ...inputVariables, outputVariable].join('\t');
    const lines = results.map((r) => {
      const inputs = inputVariables.map((v) => (r.inputs[v] !== null ? r.inputs[v] : '—')).join('\t');
      return `${r.rowIndex}\t${inputs}\t${r.formattedResult}`;
    });
    const tableText = `${headers}\n${lines.join('\n')}`;

    navigator.clipboard.writeText(tableText);
    setCopiedTable(true);
    setTimeout(() => setCopiedTable(false), 2000);
  };

  return (
    <div className="w-full space-y-3">
      {/* Table Top Actions */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-medium text-[#37352F]">
          Hasil Perhitungan Batch ({results.filter((r) => r.isSuccess).length} / {results.length} valid)
        </span>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyTable}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#E9E9E7] bg-white hover:bg-[#FAF5FF] text-[#37352F] font-medium transition-colors"
          >
            {copiedTable ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#0F7B6C]" />
                <span className="text-[#0F7B6C]">Disalin TSV!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#787774]" />
                <span>Salin untuk Notion/Excel</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border border-[#E9E9E7] bg-white hover:bg-[#FAF5FF] text-[#37352F] font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-[#787774]" />
            <span>Ekspor CSV</span>
          </button>
        </div>
      </div>

      {/* Main Results Table */}
      <div className="w-full bg-white rounded-xl border border-[#E9E9E7] shadow-xs overflow-hidden">
        <div className="overflow-x-auto scrollbar-thin">
          <table className="w-full text-left border-collapse min-w-[550px]">
            <thead>
              <tr className="bg-[#F7F7F5] border-b border-[#E9E9E7] text-xs font-semibold text-[#787774]">
                <th className="py-2.5 px-4 w-14 text-center">#</th>
                {inputVariables.map((v) => (
                  <th key={v} className="py-2.5 px-4 font-mono text-[#37352F]">
                    {v}
                  </th>
                ))}
                {/* Result column */}
                <th className="py-2.5 px-4 font-mono text-[#6D28D9] bg-[#F5F3FF]/70 font-bold">
                  {outputVariable} (hasil)
                </th>
                <th className="py-2.5 px-4 text-center w-28">Status</th>
                <th className="py-2.5 px-4 text-right w-24">Presisi</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-[#F1F1EF] text-sm">
              {results.map((r) => (
                <tr
                  key={r.rowId}
                  className={`group transition-colors ${
                    r.isSuccess ? 'hover:bg-[#FBFBFA]' : 'bg-[#FDF5F5]/40 hover:bg-[#FDF5F5]'
                  }`}
                >
                  {/* Row # */}
                  <td className="py-3 px-4 text-center font-mono text-xs text-[#9B9A97]">
                    {r.rowIndex}
                  </td>

                  {/* Input values */}
                  {inputVariables.map((v) => (
                    <td key={v} className="py-3 px-4 font-mono text-sm text-[#37352F]">
                      {r.inputs[v] !== null ? r.inputs[v] : <span className="text-[#9B9A97]">kosong</span>}
                    </td>
                  ))}

                  {/* Calculated Result */}
                  <td className="py-3 px-4 font-mono text-sm font-semibold bg-[#F5F3FF]/40 text-[#6D28D9]">
                    {r.formattedResult}
                  </td>

                  {/* Status Badge */}
                  <td className="py-3 px-4 text-center">
                    {r.isSuccess ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#EDF7F5] text-[#0F7B6C]">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Valid</span>
                      </span>
                    ) : (
                      <span
                        title={r.error}
                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-[#FDF5F5] text-[#EB5757] cursor-help"
                      >
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span className="truncate max-w-[80px]">Error</span>
                      </span>
                    )}
                  </td>

                  {/* Precision Inspect Button */}
                  <td className="py-3 px-4 text-right">
                    <button
                      type="button"
                      onClick={() => onInspectResult(r)}
                      title="Periksa presisi penuh IEEE-754 dan salin angka asli"
                      className="px-2 py-1 rounded text-xs font-medium text-[#787774] hover:text-[#6D28D9] hover:bg-white border border-transparent hover:border-[#E9E9E7] transition-all inline-flex items-center gap-1"
                    >
                      <Search className="w-3 h-3" />
                      <span>Inspeksi</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Row error explanations summary if any errors occurred */}
        {results.some((r) => !r.isSuccess) && (
          <div className="p-3 bg-[#FDF5F5] border-t border-[#F8D2D2] text-xs text-[#EB5757] space-y-1">
            <span className="font-semibold">Kendala baris terdeteksi:</span>
            {results
              .filter((r) => !r.isSuccess)
              .map((r) => (
                <div key={r.rowId} className="flex items-start gap-1.5 font-mono text-[11px]">
                  <span className="font-bold">Baris #{r.rowIndex}:</span>
                  <span>{r.error}</span>
                </div>
              ))}
          </div>
        )}
      </div>
    </div>
  );
};

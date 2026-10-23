/**
 * ============================================================================
 * Komponen    : PrecisionInspector
 * Lapisan     : Layar 3 (Fitur Inspeksi Presisi)
 *
 * Deskripsi:
 * Modal popover untuk memeriksa nilai hasil perhitungan dalam presisi penuh IEEE-754,
 * menyalin angka murni tanpa pembulatan, dan melihat rincian nilai input baris terkait.
 * ============================================================================
 */

import React, { useState } from 'react';
import { X, Copy, Check, Info } from 'lucide-react';
import { VariableMath } from '../common/FormulaDisplay';
import type { RowResult } from '../../types';

interface PrecisionInspectorProps {
  result: RowResult | null;
  outputVariable: string;
  onClose: () => void;
}

/**
 * Modal dialog pemeriksa presisi penuh angka IEEE-754.
 *
 * @param props Baris hasil terpilih, nama variabel output, dan handler penutupan.
 * @returns Dialog modal inspektor presisi atau null jika tidak ada baris yang dipilih.
 */
export const PrecisionInspector: React.FC<PrecisionInspectorProps> = ({
  result,
  outputVariable,
  onClose,
}) => {
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const fullPrecisionString =
    result.rawResult !== null ? String(result.rawResult) : result.formattedResult;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-2xl max-w-lg w-full border border-[#E9E9E7] shadow-2xl p-6 z-10 space-y-5">
        <div className="flex items-center justify-between border-b border-[#E9E9E7] pb-3.5">
          <div className="flex items-center gap-2.5">
            <Info className="w-5 h-5 text-[#6D28D9]" />
            <h3 className="text-base sm:text-lg font-bold text-[#2F3437]">
              Inspektor presisi — baris #{result.rowIndex}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#F1F1EF] text-[#6B7280] hover:text-[#2F3437] transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Displayed vs Full Raw Precision */}
        <div className="space-y-4 text-xs sm:text-sm">
          <div>
            <div className="flex items-center gap-1.5 text-[#6B7280] font-semibold">
              <span>Nilai</span>
              <VariableMath name={outputVariable} />
            </div>
            <div className="mt-1.5 font-mono text-lg sm:text-xl font-bold text-[#6D28D9] bg-[#FAF5FF] px-4 py-2.5 rounded-xl border border-[#DDD6FE]">
              {result.formattedResult}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[#6B7280] font-semibold">Presisi Lengkap (IEEE-754):</span>
              <button
                onClick={() => handleCopy(fullPrecisionString)}
                className="flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-[#6D28D9] hover:underline"
              >
                {copied ? (
                  <>
                    <Check className="w-4 h-4 text-[#0F7B6C]" />
                    <span className="text-[#0F7B6C]">Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Salin Asli</span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-1.5 font-mono text-sm break-all text-[#2F3437] bg-[#FBFBFA] px-4 py-2.5 rounded-xl border border-[#E9E9E7] select-all font-medium">
              {fullPrecisionString}
            </div>
          </div>

          {/* Row Inputs Breakdown */}
          <div className="pt-3 border-t border-[#F1F1EF]">
            <span className="text-[#6B7280] font-semibold">Nilai Input untuk Baris Ini:</span>
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs sm:text-sm">
              {Object.entries(result.inputs).map(([k, v]) => (
                <div
                  key={k}
                  className="flex items-center justify-between rounded-md bg-[#F7F7F5] px-3 py-2"
                >
                  <VariableMath name={k} className="text-[#6B7280]" />
                  <span className="font-semibold tabular-nums text-[#2F3437]">
                    {v !== null ? v : '—'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-5 py-2 text-sm font-semibold rounded-lg bg-[#F1F1EF] hover:bg-[#EAEAEA] text-[#2F3437] transition-colors shadow-2xs"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState } from 'react';
import { X, Copy, Check, Info } from 'lucide-react';
import type { RowResult } from '../../types';

interface PrecisionInspectorProps {
  result: RowResult | null;
  outputVariable: string;
  onClose: () => void;
}

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
        className="fixed inset-0 bg-black/25 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative bg-white rounded-xl max-w-md w-full border border-[#E9E9E7] shadow-xl p-5 z-10 space-y-4">
        <div className="flex items-center justify-between border-b border-[#E9E9E7] pb-3">
          <div className="flex items-center gap-2">
            <Info className="w-4 h-4 text-[#6D28D9]" />
            <h3 className="text-sm font-semibold text-[#37352F]">
              Inspektor Presisi — Baris #{result.rowIndex} ({outputVariable})
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-md hover:bg-[#F1F1EF] text-[#787774] hover:text-[#37352F]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Displayed vs Full Raw Precision */}
        <div className="space-y-3 text-xs">
          <div>
            <span className="text-[#787774] font-medium">Nilai Tampilan:</span>
            <div className="mt-1 font-mono text-base font-semibold text-[#6D28D9] bg-[#FAF5FF] px-3 py-2 rounded-lg border border-[#DDD6FE]">
              {result.formattedResult}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between">
              <span className="text-[#787774] font-medium">Presisi Lengkap (IEEE-754):</span>
              <button
                onClick={() => handleCopy(fullPrecisionString)}
                className="flex items-center gap-1 text-[11px] text-[#6D28D9] hover:underline"
              >
                {copied ? (
                  <>
                    <Check className="w-3 h-3 text-[#0F7B6C]" />
                    <span className="text-[#0F7B6C]">Disalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Salin Asli</span>
                  </>
                )}
              </button>
            </div>
            <div className="mt-1 font-mono text-xs break-all text-[#37352F] bg-[#FBFBFA] px-3 py-2 rounded-lg border border-[#E9E9E7] select-all">
              {fullPrecisionString}
            </div>
          </div>

          {/* Row Inputs Breakdown */}
          <div className="pt-2 border-t border-[#F1F1EF]">
            <span className="text-[#787774] font-medium">Nilai Input untuk Baris Ini:</span>
            <div className="mt-1.5 grid grid-cols-2 gap-1.5 font-mono text-[11px]">
              {Object.entries(result.inputs).map(([k, v]) => (
                <div
                  key={k}
                  className="bg-[#F7F7F5] px-2.5 py-1.5 rounded border border-[#E9E9E7] flex justify-between"
                >
                  <span className="text-[#787774]">{k}:</span>
                  <span className="font-semibold text-[#37352F]">{v !== null ? v : '—'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="pt-2 text-right">
          <button
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-medium rounded-md bg-[#F1F1EF] hover:bg-[#EAEAEA] text-[#37352F] transition-colors"
          >
            Selesai
          </button>
        </div>
      </div>
    </div>
  );
};

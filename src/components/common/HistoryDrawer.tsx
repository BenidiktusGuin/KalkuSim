import React from 'react';
import { X, Trash2, ArrowUpRight, Clock, AlertCircle } from 'lucide-react';
import type { HistoryItem } from '../../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoadHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearAllHistory: () => void;
}

export const HistoryDrawer: React.FC<HistoryDrawerProps> = ({
  isOpen,
  onClose,
  history,
  onLoadHistory,
  onDeleteHistory,
  onClearAllHistory,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-10 border-l border-[#E9E9E7]">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#E9E9E7]">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-[#787774]" />
            <h2 className="text-sm font-semibold text-[#37352F]">Riwayat Perhitungan</h2>
            <span className="text-xs text-[#787774]">({history.length})</span>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-[#F1F1EF] text-[#787774] hover:text-[#37352F] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informational Storage Callout */}
        <div className="px-5 py-3 bg-[#FBFBFA] border-b border-[#E9E9E7] flex items-start gap-2.5 text-xs text-[#787774]">
          <AlertCircle className="w-4 h-4 text-[#9B9A97] shrink-0 mt-0.5" />
          <p>
            Entri riwayat disimpan secara lokal di peramban Anda (<code className="font-mono text-[11px] bg-[#EAEAEA] px-1 py-0.5 rounded">localStorage</code>). Menghapus data peramban akan menghapus riwayat tersimpan.
          </p>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-center p-6 text-[#9B9A97]">
              <Clock className="w-8 h-8 mb-2 stroke-[1.5]" />
              <p className="text-sm font-medium text-[#37352F]">Belum ada perhitungan tersimpan</p>
              <p className="text-xs text-[#787774] mt-1 max-w-xs">
                Setelah Anda menyelesaikan perhitungan, klik "Simpan ke Riwayat" pada layar hasil untuk menyimpannya di sini.
              </p>
            </div>
          ) : (
            history.map((item) => {
              const successCount = item.results.filter((r) => r.isSuccess).length;
              const dateStr = new Date(item.timestamp).toLocaleString('id-ID', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              });

              return (
                <div
                  key={item.id}
                  className="group relative p-3.5 rounded-lg border border-[#E9E9E7] bg-white hover:border-[#D3D3D0] hover:shadow-xs transition-all"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="font-mono text-sm font-semibold text-[#37352F] tracking-tight">
                        {item.formulaAnalysis.rawInput}
                      </div>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-[#787774]">
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span>
                          {successCount}/{item.results.length} baris valid
                        </span>
                        <span>•</span>
                        <span className="uppercase text-[10px] font-mono px-1 py-0.2 rounded bg-[#F1F1EF]">
                          {item.angleMode}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        onClick={() => onLoadHistory(item)}
                        title="Buka dan periksa perhitungan ini"
                        className="p-1.5 rounded-md bg-[#6D28D9]/10 hover:bg-[#6D28D9]/20 text-[#6D28D9] transition-colors"
                      >
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteHistory(item.id)}
                        title="Hapus dari riwayat"
                        className="p-1.5 rounded-md hover:bg-[#FDEDED] text-[#787774] hover:text-[#EB5757] transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Preview summary of first 3 results */}
                  <div className="mt-2.5 pt-2 border-t border-[#F1F1EF] text-xs flex flex-wrap gap-2">
                    {item.results.slice(0, 3).map((r, i) => (
                      <span
                        key={i}
                        className="font-mono text-[11px] bg-[#F7F7F5] px-1.5 py-0.5 rounded border border-[#E9E9E7] text-[#37352F]"
                      >
                        #{r.rowIndex}: {r.formattedResult}
                      </span>
                    ))}
                    {item.results.length > 3 && (
                      <span className="text-[11px] text-[#9B9A97] self-center">
                        +{item.results.length - 3} lainnya
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Drawer Footer */}
        {history.length > 0 && (
          <div className="p-4 border-t border-[#E9E9E7] bg-[#FBFBFA] flex items-center justify-between">
            <button
              onClick={() => {
                if (window.confirm('Apakah Anda yakin ingin menghapus semua riwayat perhitungan tersimpan?')) {
                  onClearAllHistory();
                }
              }}
              className="flex items-center gap-1 text-xs text-[#EB5757] hover:underline"
            >
              <Trash2 className="w-3 h-3" />
              Hapus semua riwayat
            </button>
            <button
              onClick={onClose}
              className="px-3 py-1.5 rounded-md text-xs font-medium text-[#37352F] bg-white border border-[#E9E9E7] hover:bg-[#F1F1EF] transition-colors"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

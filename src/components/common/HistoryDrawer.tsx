/**
 * ============================================================================
 * Komponen    : HistoryDrawer
 * Lapisan     : Komponen Bersama (Common UI)
 *
 * Deskripsi:
 * Laci slide-over untuk melihat, membuka kembali, atau menghapus riwayat
 * perhitungan yang telah disimpan.
 * ============================================================================
 */

import React from 'react';
import { X, Trash2, ArrowUpRight } from 'lucide-react';
import { FormulaDisplay } from './FormulaDisplay';
import type { HistoryItem } from '../../types';

interface HistoryDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  history: HistoryItem[];
  onLoadHistory: (item: HistoryItem) => void;
  onDeleteHistory: (id: string) => void;
  onClearAllHistory: () => void;
}

/**
 * Laci geser riwayat perhitungan KalkuSim.
 *
 * @param props Properti visibilitas drawer dan operasi data riwayat.
 * @returns Elemen laci riwayat atau null jika tertutup.
 */
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
        className="fixed inset-0 bg-black/25 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Riwayat perhitungan"
        className="relative w-full max-w-md bg-white h-full shadow-xl flex flex-col z-10 border-l border-[#E9E9E7]"
      >
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-5 py-4.5 border-b border-[#E9E9E7]">
          <div className="flex items-baseline gap-2">
            <h2 className="text-base sm:text-lg font-bold text-[#2F3437]">Riwayat</h2>
            <span className="text-xs sm:text-sm text-[#6B7280] font-medium">({history.length})</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Tutup riwayat"
            className="p-2 rounded-lg hover:bg-[#F1F1EF] text-[#6B7280] hover:text-[#2F3437] transition-colors"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* History List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {history.length === 0 ? (
            <div className="h-56 flex flex-col items-center justify-center text-center p-6">
              <p className="text-base font-semibold text-[#2F3437]">Belum ada riwayat</p>
              <p className="text-xs sm:text-sm text-[#6B7280] mt-1">
                Perhitungan yang disimpan akan muncul di sini.
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
                  className="group relative p-4 rounded-xl border border-[#E9E9E7] bg-white hover:border-[#D3D3D0] transition-colors"
                >
                  <div className="flex items-start justify-between gap-2.5">
                    <div className="min-w-0 flex-1">
                      <FormulaDisplay
                        formula={item.formulaAnalysis}
                        label={`Rumus ${item.formulaAnalysis.outputVariable}`}
                        className="history-formula"
                      />
                      <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-[#6B7280]">
                        <span>{dateStr}</span>
                        <span>•</span>
                        <span>{successCount}/{item.results.length} baris valid</span>
                        <span>•</span>
                        <span className="text-[11px] uppercase tracking-[0.12em] text-[#9CA3AF]">
                          {item.angleMode}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 opacity-90 group-hover:opacity-100">
                      <button
                        type="button"
                        onClick={() => onLoadHistory(item)}
                        title="Buka perhitungan"
                        className="p-2 rounded-lg bg-[#6D28D9]/10 hover:bg-[#6D28D9]/20 text-[#6D28D9] transition-colors"
                      >
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteHistory(item.id)}
                        title="Hapus"
                        className="p-2 rounded-lg hover:bg-[#FDEDED] text-[#6B7280] hover:text-[#EB5757] transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Preview of first 3 results */}
                  <div className="mt-3 text-xs flex flex-wrap gap-2">
                    {item.results.slice(0, 3).map((r, i) => (
                      <span
                        key={i}
                        className="bg-[#F7F7F5] px-2 py-0.5 text-xs tabular-nums text-[#2F3437]"
                      >
                        #{r.rowIndex}: {r.formattedResult}
                      </span>
                    ))}
                    {item.results.length > 3 && (
                      <span className="text-xs text-[#9CA3AF] self-center">
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
              type="button"
              onClick={() => {
                if (window.confirm('Hapus semua riwayat?')) {
                  onClearAllHistory();
                }
              }}
              className="flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#EB5757] hover:underline"
            >
              <Trash2 className="w-4 h-4" />
              Hapus semua
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg text-sm font-medium text-[#2F3437] bg-white border border-[#E9E9E7] hover:bg-[#F1F1EF] transition-colors shadow-2xs"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoryDrawer;

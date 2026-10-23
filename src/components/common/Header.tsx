/**
 * ============================================================================
 * Komponen    : Header
 * Lapisan     : Komponen Bersama (Common UI)
 *
 * Deskripsi:
 * Bilah atas minimalis KalkuSim: wordmark brand di sisi kiri dan akses laci
 * riwayat perhitungan tersimpan di sisi kanan.
 * ============================================================================
 */

import React from 'react';

interface HeaderProps {
  savedHistoryCount: number;
  onOpenHistory: () => void;
}

/**
 * Bilah navigasi atas aplikasi KalkuSim.
 *
 * @param props Properti status riwayat perhitungan.
 * @returns Elemen header atas minimalis.
 */
export const Header: React.FC<HeaderProps> = ({
  savedHistoryCount,
  onOpenHistory,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full border-b border-[#E9E9E7]/80 bg-[#FBFBFA]/95 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <span className="text-lg font-semibold tracking-tight text-[#2F3437]">
          KalkuSim
        </span>

        <button
          type="button"
          onClick={onOpenHistory}
          className="text-sm font-medium text-[#6B7280] transition-colors hover:text-[#2F3437] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D28D9]/30 focus-visible:ring-offset-2"
        >
          Riwayat
          {savedHistoryCount > 0 && (
            <span className="ml-1.5 tabular-nums text-[#9CA3AF]">
              ({savedHistoryCount})
            </span>
          )}
        </button>
      </div>
    </header>
  );
};

export default Header;

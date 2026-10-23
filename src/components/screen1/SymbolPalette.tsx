/**
 * ============================================================================
 * Komponen    : SymbolPalette
 * Lapisan     : Layar 1 (Fitur Editor Rumus)
 *
 * Deskripsi:
 * Katalog simbol, operator, dan fungsi matematika yang dapat dicari dan difilter
 * berdasarkan kategori dengan visual minimalis dan tenang.
 * ============================================================================
 */

import React, { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { InlineMath } from '../common/FormulaDisplay';
import { SYMBOL_CATALOG } from '../../engine/mathConstants';

interface SymbolPaletteProps {
  onInsertSymbol: (latexSnippet: string, plainSnippet: string) => void;
}

/** Placeholder MathLive (#?) diganti dengan x agar pratinjau tetap terbaca. */
const previewLatex = (latex: string) => latex.replace(/#\?/g, 'x');

/**
 * Palet katalog simbol dan fungsi matematika interaktif.
 *
 * @param props Handler saat simbol disisipkan ke editor.
 * @returns Panel katalog simbol matematika dengan pencarian dan filter kategori.
 */
export const SymbolPalette: React.FC<SymbolPaletteProps> = ({ onInsertSymbol }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredSymbols = useMemo(() => {
    let list = SYMBOL_CATALOG;

    if (selectedCategory !== 'all') {
      list = list.filter((s) => s.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (s) =>
          s.label.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.aliases.some((a) => a.toLowerCase().includes(q))
      );
    }

    return list;
  }, [searchQuery, selectedCategory]);

  const categories = [
    { id: 'all', label: 'Semua' },
    { id: 'arithmetic', label: 'Aritmatika' },
    { id: 'fractions', label: 'Pecahan' },
    { id: 'powers', label: 'Pangkat & akar' },
    { id: 'grouping', label: 'Kurung' },
    { id: 'trig', label: 'Trigonometri' },
    { id: 'logs', label: 'Log & eksponen' },
    { id: 'constants', label: 'Konstanta' },
  ];

  return (
    <div className="space-y-3">
      <div className="relative">
        <Search className="absolute left-0 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9CA3AF]" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Cari simbol atau fungsi"
          className="w-full border-0 border-b border-[#E9E9E7] bg-transparent py-2 pl-6 text-sm text-[#2F3437] placeholder:text-[#9CA3AF] focus:border-[#6D28D9] focus:outline-none"
        />
      </div>

      <div className="flex flex-wrap gap-x-3 gap-y-1.5 text-xs">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setSelectedCategory(cat.id)}
            className={`transition-colors ${
              selectedCategory === cat.id
                ? 'font-semibold text-[#2F3437] underline decoration-[#6D28D9] underline-offset-4'
                : 'text-[#9CA3AF] hover:text-[#6B7280]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      <div className="max-h-80 overflow-y-auto pr-1">
        {filteredSymbols.length === 0 ? (
          <p className="py-6 text-sm text-[#9CA3AF]">
            Tidak ada simbol yang cocok.
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-x-2 gap-y-1">
            {filteredSymbols.map((sym) => (
              <button
                key={sym.id}
                type="button"
                onClick={() => onInsertSymbol(sym.latex, sym.mathjsInsert)}
                title={sym.description}
                className="group flex min-h-14 flex-col items-start justify-center rounded-md px-2 py-1.5 text-left transition-colors hover:bg-[#F1F1EF] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D28D9]/30"
              >
                <InlineMath
                  latex={previewLatex(sym.latex)}
                  fallback={sym.label}
                  label={sym.description}
                  className="text-[#2F3437] group-hover:text-[#6D28D9]"
                />
                <span className="mt-0.5 truncate text-[11px] text-[#9CA3AF]">
                  {sym.aliases[0]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SymbolPalette;

import React, { useState, useMemo } from 'react';
import { Search, Hash, Divide, Superscript, Parentheses, Compass, Binary, Pi, Sparkles } from 'lucide-react';
import { SYMBOL_CATALOG } from '../../engine/mathConstants';

interface SymbolPaletteProps {
  onInsertSymbol: (latexSnippet: string, plainSnippet: string) => void;
}

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

  const categories = useMemo(() => {
    return [
      { id: 'all', label: 'Semua Simbol', icon: Sparkles },
      { id: 'arithmetic', label: 'Aritmatika', icon: Hash },
      { id: 'fractions', label: 'Pecahan', icon: Divide },
      { id: 'powers', label: 'Pangkat & Akar', icon: Superscript },
      { id: 'grouping', label: 'Pengelompokan', icon: Parentheses },
      { id: 'trig', label: 'Trigonometri', icon: Compass },
      { id: 'logs', label: 'Log & Eksponen', icon: Binary },
      { id: 'constants', label: 'Konstanta', icon: Pi },
    ];
  }, []);

  return (
    <div className="w-full bg-white rounded-lg border border-[#E9E9E7] shadow-xs overflow-hidden">
      {/* Search Header */}
      <div className="p-3 border-b border-[#E9E9E7] flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#9B9A97]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari simbol, fungsi, atau alias (misal: pecahan, akar, sin, pi)..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FBFBFA] border border-[#E9E9E7] rounded-md text-[#37352F] placeholder:text-[#9B9A97] focus:outline-none focus:border-[#6D28D9] focus:bg-white transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-[#9B9A97] hover:text-[#37352F]"
            >
              ×
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none text-[11px]">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-2.5 py-1 rounded whitespace-nowrap font-medium transition-colors ${
                selectedCategory === cat.id
                  ? 'bg-[#37352F] text-white shadow-xs'
                  : 'bg-[#F7F7F5] text-[#787774] hover:bg-[#F1F1EF] hover:text-[#37352F]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      {/* Symbols Grid */}
      <div className="p-3 max-h-56 overflow-y-auto">
        {filteredSymbols.length === 0 ? (
          <div className="text-center py-6 text-xs text-[#9B9A97]">
            Tidak ada simbol atau fungsi matematika yang cocok dengan "{searchQuery}"
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-1.5">
            {filteredSymbols.map((sym) => (
              <button
                key={sym.id}
                type="button"
                onClick={() => onInsertSymbol(sym.latex, sym.mathjsInsert)}
                title={`${sym.description} (${sym.aliases.join(', ')})`}
                className="group flex flex-col items-center justify-center p-2 rounded-md border border-[#E9E9E7] hover:border-[#6D28D9]/50 hover:bg-[#F5F3FF] transition-all text-center"
              >
                <span className="font-mono text-sm font-semibold text-[#37352F] group-hover:text-[#6D28D9] group-hover:scale-105 transition-transform">
                  {sym.label}
                </span>
                <span className="text-[10px] text-[#9B9A97] truncate max-w-[85px] mt-0.5">
                  {sym.aliases[0]}
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Palette Footer Tip */}
      <div className="px-3 py-1.5 bg-[#FBFBFA] border-t border-[#E9E9E7] flex items-center justify-between text-[11px] text-[#9B9A97]">
        <span>Klik simbol untuk menyisipkan pada posisi kursor</span>
        <span className="hidden sm:inline">Mendukung pintasan keyboard & perintah LaTeX</span>
      </div>
    </div>
  );
};

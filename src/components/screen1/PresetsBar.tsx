import React from 'react';
import { Sparkles } from 'lucide-react';
import { FORMULA_PRESETS, type FormulaPreset } from '../../engine/mathConstants';

interface PresetsBarProps {
  onSelectPreset: (preset: FormulaPreset) => void;
}

export const PresetsBar: React.FC<PresetsBarProps> = ({ onSelectPreset }) => {
  return (
    <div className="w-full space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs text-[#787774]">
        <Sparkles className="w-3.5 h-3.5 text-[#6D28D9]" />
        <span className="font-medium text-[#37352F]">Contoh Rumus Cepat</span>
        <span className="text-[#9B9A97]">— klik salah satu untuk mencoba kalkulasi batch</span>
      </div>

      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {FORMULA_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => onSelectPreset(preset)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[#E9E9E7] bg-white hover:border-[#DDD6FE] hover:bg-[#FAF5FF] transition-all text-left shrink-0 shadow-2xs group"
          >
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-medium text-[#37352F] group-hover:text-[#6D28D9]">
                  {preset.name}
                </span>
                <span className="text-[10px] text-[#787774] bg-[#F1F1EF] px-1 py-0.2 rounded font-sans">
                  {preset.category}
                </span>
              </div>
              <div className="font-mono text-[11px] text-[#787774] truncate max-w-[200px]">
                {preset.formula}
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};

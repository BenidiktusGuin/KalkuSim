import React from 'react';
import { Calculator, History, Compass } from 'lucide-react';
import type { AngleMode, ScreenStep } from '../../types';

interface HeaderProps {
  currentStep: ScreenStep;
  onNavigateStep: (step: ScreenStep) => void;
  canNavigateVariables: boolean;
  canNavigateResults: boolean;
  angleMode: AngleMode;
  onToggleAngleMode: () => void;
  savedHistoryCount: number;
  onOpenHistory: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentStep,
  onNavigateStep,
  canNavigateVariables,
  canNavigateResults,
  angleMode,
  onToggleAngleMode,
  savedHistoryCount,
  onOpenHistory,
}) => {
  return (
    <header className="sticky top-0 z-30 w-full bg-white/90 backdrop-blur-md border-b border-[#E9E9E7]">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between">
        {/* Left: Brand Logo & Wordmark */}
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-md bg-[#6D28D9]/10 text-[#6D28D9] flex items-center justify-center font-semibold border border-[#6D28D9]/20 shadow-xs">
            <Calculator className="w-4 h-4" />
          </div>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-sm tracking-tight text-[#37352F]">
                CalcBatch
              </span>
              <span className="text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded bg-[#F1F1EF] text-[#787774] border border-[#E9E9E7]">
                MVP
              </span>
            </div>
          </div>
        </div>

        {/* Center: Step Flow Indicator */}
        <nav aria-label="Langkah perhitungan" className="hidden sm:flex items-center gap-1 bg-[#F7F7F5] p-1 rounded-lg border border-[#E9E9E7] text-xs">
          <button
            onClick={() => onNavigateStep('formula')}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              currentStep === 'formula'
                ? 'bg-white text-[#37352F] shadow-xs'
                : 'text-[#787774] hover:text-[#37352F]'
            }`}
          >
            1. Rumus
          </button>
          <span className="text-[#D3D3D0] text-[10px]">/</span>
          <button
            onClick={() => canNavigateVariables && onNavigateStep('variables')}
            disabled={!canNavigateVariables}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              currentStep === 'variables'
                ? 'bg-white text-[#37352F] shadow-xs'
                : canNavigateVariables
                ? 'text-[#787774] hover:text-[#37352F]'
                : 'text-[#C5C5C2] cursor-not-allowed'
            }`}
          >
            2. Variabel
          </button>
          <span className="text-[#D3D3D0] text-[10px]">/</span>
          <button
            onClick={() => canNavigateResults && onNavigateStep('results')}
            disabled={!canNavigateResults}
            className={`px-3 py-1 rounded-md font-medium transition-all ${
              currentStep === 'results'
                ? 'bg-white text-[#37352F] shadow-xs'
                : canNavigateResults
                ? 'text-[#787774] hover:text-[#37352F]'
                : 'text-[#C5C5C2] cursor-not-allowed'
            }`}
          >
            3. Hasil
          </button>
        </nav>

        {/* Right: Angle Mode Toggle & History Drawer Button */}
        <div className="flex items-center gap-2">
          {/* Angle Mode Badge Button */}
          <button
            onClick={onToggleAngleMode}
            title={`Mode trigonometri: ${angleMode === 'rad' ? 'Radian (Bawaan standar)' : 'Derajat'}. Klik untuk beralih.`}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-[#E9E9E7] bg-white hover:bg-[#F7F7F5] text-[#37352F] font-medium transition-colors"
          >
            <Compass className="w-3.5 h-3.5 text-[#787774]" />
            <span className="text-[#787774]">Sudut:</span>
            <span className="font-mono uppercase text-[#6D28D9] font-semibold">{angleMode}</span>
          </button>

          {/* History Button */}
          <button
            onClick={onOpenHistory}
            className="relative flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-md border border-[#E9E9E7] bg-white hover:bg-[#F7F7F5] text-[#37352F] font-medium transition-colors"
          >
            <History className="w-3.5 h-3.5 text-[#787774]" />
            <span>Riwayat</span>
            {savedHistoryCount > 0 && (
              <span className="ml-0.5 inline-flex items-center justify-center min-w-4 h-4 px-1 rounded-full text-[10px] font-bold bg-[#6D28D9] text-white">
                {savedHistoryCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};

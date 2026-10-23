/**
 * ============================================================================
 * Komponen    : App
 * Lapisan     : Komponen Utama (Root Application)
 *
 * Deskripsi:
 * Mengelola state global KalkuSim: rumus aktif, deteksi variabel AST,
 * baris batch data, mode sudut (rad/deg), navigasi langkah (ScreenStep),
 * serta persistensi riwayat perhitungan di localStorage.
 * ============================================================================
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/common/Header';
import { HistoryDrawer } from './components/common/HistoryDrawer';
import { FormulaScreen } from './components/screen1/FormulaScreen';
import { VariableScreen } from './components/screen2/VariableScreen';
import { ResultsScreen } from './components/screen3/ResultsScreen';
import { parseFormula } from './engine/formulaParser';
import { calculateBatch } from './engine/calculator';
import type { AngleMode, BatchRow, CalculationBatchResult, HistoryItem, ScreenStep } from './types';

const LOCAL_STORAGE_HISTORY_KEY = 'calcbatch_history_v1';

const STEPS: Array<{ id: ScreenStep; label: string }> = [
  { id: 'formula', label: 'Rumus' },
  { id: 'variables', label: 'Variabel' },
  { id: 'results', label: 'Hasil' },
];

interface StepIndicatorProps {
  currentStep: ScreenStep;
  canOpenVariables: boolean;
  canOpenResults: boolean;
  onChange: (step: ScreenStep) => void;
}

const StepIndicator: React.FC<StepIndicatorProps> = ({
  currentStep,
  canOpenVariables,
  canOpenResults,
  onChange,
}) => {
  const enabled: Record<ScreenStep, boolean> = {
    formula: true,
    variables: canOpenVariables,
    results: canOpenResults,
  };

  return (
    <nav
      aria-label="Langkah perhitungan"
      className="mb-10 flex flex-wrap items-center gap-x-7 gap-y-2 text-sm"
    >
      {STEPS.map((step, index) => {
        const active = currentStep === step.id;
        const isEnabled = enabled[step.id];

        return (
          <button
            key={step.id}
            type="button"
            onClick={() => isEnabled && onChange(step.id)}
            disabled={!isEnabled}
            aria-current={active ? 'step' : undefined}
            className={`flex items-baseline gap-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#6D28D9]/30 focus-visible:ring-offset-2 ${
              active
                ? 'text-[#2F3437]'
                : isEnabled
                  ? 'text-[#9CA3AF] hover:text-[#6B7280]'
                  : 'cursor-not-allowed text-[#D3D3D0]'
            }`}
          >
            <span className="text-[11px] font-semibold tabular-nums tracking-[0.08em]">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span
              className={
                active
                  ? 'border-b border-[#6D28D9] pb-0.5 font-semibold'
                  : 'font-medium'
              }
            >
              {step.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

/**
 * Komponen induk aplikasi KalkuSim.
 *
 * @returns Tampilan antarmuka utama berbasis alur langkah 3-layar.
 */
export const App: React.FC = () => {
  // Navigation
  const [currentStep, setCurrentStep] = useState<ScreenStep>('formula');
  const [angleMode, setAngleMode] = useState<AngleMode>('rad');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Formula state
  const [formulaInput, setFormulaInput] = useState<string>('');
  const [latexInput, setLatexInput] = useState<string>('');

  // Parse formula dynamically
  const analysis = useMemo(() => {
    return parseFormula(formulaInput, latexInput);
  }, [formulaInput, latexInput]);

  // Batch rows state (Max 10 rows)
  const [rows, setRows] = useState<BatchRow[]>(() => [
    { id: 'row-initial-1', values: {} },
    { id: 'row-initial-2', values: {} },
    { id: 'row-initial-3', values: {} },
  ]);

  // Batch calculation result
  const [batchResult, setBatchResult] = useState<CalculationBatchResult | null>(null);

  // Local storage history
  const [history, setHistory] = useState<HistoryItem[]>(() => {
    try {
      const saved = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  // Persist history to localStorage
  const saveHistoryToStorage = useCallback((items: HistoryItem[]) => {
    setHistory(items);
    try {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(items));
    } catch (e) {
      console.error('Failed to save history to localStorage', e);
    }
  }, []);

  // When formula variables change, ensure each row has keys for the new variables
  useEffect(() => {
    if (!analysis.isValid) return;

    setRows((prevRows) => {
      // If no rows, create at least 3 initial rows
      if (prevRows.length === 0) {
        return [
          { id: `row-${Date.now()}-1`, values: {} },
          { id: `row-${Date.now()}-2`, values: {} },
          { id: `row-${Date.now()}-3`, values: {} },
        ];
      }
      return prevRows;
    });
  }, [analysis.inputVariables, analysis.isValid]);

  // Handlers for variable rows
  const handleUpdateCell = (rowId: string, variable: string, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.id === rowId ? { ...r, values: { ...r.values, [variable]: value } } : r))
    );
  };

  const handleAddRow = () => {
    if (rows.length >= 10) return;
    const newId = `row-${Date.now()}-${rows.length + 1}`;
    setRows((prev) => [...prev, { id: newId, values: {} }]);
  };

  const handleRemoveRow = (rowId: string) => {
    if (rows.length <= 1) return;
    setRows((prev) => prev.filter((r) => r.id !== rowId));
  };

  const handleDuplicateRow = (rowId: string) => {
    if (rows.length >= 10) return;
    const target = rows.find((r) => r.id === rowId);
    if (!target) return;
    const newId = `row-${Date.now()}-${rows.length + 1}`;
    setRows((prev) => [...prev, { id: newId, values: { ...target.values } }]);
  };

  const handleClearRows = () => {
    setRows((prev) =>
      prev.map((r) => ({
        id: r.id,
        values: {},
      }))
    );
  };

  // Formula input change
  const handleFormulaChange = (plain: string, latex: string) => {
    setFormulaInput(plain);
    setLatexInput(latex);
  };

  // Navigation handlers
  const handleNextToVariables = () => {
    if (analysis.isValid) {
      setCurrentStep('variables');
    }
  };

  const handleCalculateBatch = () => {
    if (!analysis.isValid) return;
    const result = calculateBatch(analysis, rows, angleMode);
    setBatchResult(result);
    setCurrentStep('results');
  };

  const handleNewCalculation = () => {
    setFormulaInput('');
    setLatexInput('');
    setRows([
      { id: `row-${Date.now()}-1`, values: {} },
      { id: `row-${Date.now()}-2`, values: {} },
      { id: `row-${Date.now()}-3`, values: {} },
    ]);
    setBatchResult(null);
    setCurrentStep('formula');
  };

  // History management
  const handleSaveToHistory = (batch: CalculationBatchResult): boolean => {
    try {
      const newItem: HistoryItem = {
        id: `hist-${Date.now()}`,
        title: batch.formulaAnalysis.rawInput,
        timestamp: Date.now(),
        formulaAnalysis: batch.formulaAnalysis,
        angleMode: batch.angleMode,
        rows: batch.rows,
        results: batch.results,
      };

      const updated = [newItem, ...history];
      saveHistoryToStorage(updated);
      return true;
    } catch (e) {
      console.error('Failed to save calculation history:', e);
      return false;
    }
  };

  const handleLoadHistoryItem = (item: HistoryItem) => {
    setFormulaInput(item.formulaAnalysis.rawInput);
    setLatexInput(item.formulaAnalysis.latex);
    setRows(item.rows);
    setAngleMode(item.angleMode);
    setBatchResult({
      formulaAnalysis: item.formulaAnalysis,
      angleMode: item.angleMode,
      rows: item.rows,
      results: item.results,
      calculatedAt: item.timestamp,
    });
    setCurrentStep('results');
    setIsHistoryOpen(false);
  };

  const handleDeleteHistoryItem = (id: string) => {
    const updated = history.filter((h) => h.id !== id);
    saveHistoryToStorage(updated);
  };

  const handleClearAllHistory = () => {
    saveHistoryToStorage([]);
  };

  // Check if current batch is already saved in history
  const isCurrentBatchSaved = useMemo(() => {
    if (!batchResult) return false;
    return history.some(
      (h) =>
        h.formulaAnalysis.rawInput === batchResult.formulaAnalysis.rawInput &&
        h.timestamp === batchResult.calculatedAt
    );
  }, [batchResult, history]);

  return (
    <div className="min-h-screen bg-[#FBFBFA] flex flex-col font-sans text-[#37352F]">
      {/* 1. Header Minimalis (Brand di kiri, Riwayat di kanan) */}
      <Header
        savedHistoryCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* 2. Main Workspace */}
      <main className="flex-1">
        <div className="mx-auto w-full max-w-6xl px-5 pb-20 pt-8 sm:px-8 sm:pt-10">
          <StepIndicator
            currentStep={currentStep}
            canOpenVariables={analysis.isValid}
            canOpenResults={batchResult !== null}
            onChange={(step) => {
              if (step === 'formula') setCurrentStep('formula');
              if (step === 'variables' && analysis.isValid) setCurrentStep('variables');
              if (step === 'results' && batchResult !== null) setCurrentStep('results');
            }}
          />

          {currentStep === 'formula' && (
            <FormulaScreen
              formulaInput={formulaInput}
              latexInput={latexInput}
              onFormulaChange={handleFormulaChange}
              analysis={analysis}
              onNext={handleNextToVariables}
              angleMode={angleMode}
              onToggleAngleMode={() =>
                setAngleMode((prev) => (prev === 'rad' ? 'deg' : 'rad'))
              }
            />
          )}

          {currentStep === 'variables' && (
            <VariableScreen
              analysis={analysis}
              rows={rows}
              onUpdateCell={handleUpdateCell}
              onAddRow={handleAddRow}
              onRemoveRow={handleRemoveRow}
              onDuplicateRow={handleDuplicateRow}
              onClearRows={handleClearRows}
              onBack={() => setCurrentStep('formula')}
              onCalculate={handleCalculateBatch}
            />
          )}

          {currentStep === 'results' && batchResult && (
            <ResultsScreen
              batch={batchResult}
              onNewCalculation={handleNewCalculation}
              onEditInputs={() => setCurrentStep('variables')}
              onSaveToHistory={handleSaveToHistory}
              isAlreadySaved={isCurrentBatchSaved}
            />
          )}
        </div>
      </main>

      {/* History Slide-over Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onLoadHistory={handleLoadHistoryItem}
        onDeleteHistory={handleDeleteHistoryItem}
        onClearAllHistory={handleClearAllHistory}
      />
    </div>
  );
};

export default App;

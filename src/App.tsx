import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Header } from './components/common/Header';
import { HistoryDrawer } from './components/common/HistoryDrawer';
import { FormulaScreen } from './components/screen1/FormulaScreen';
import { VariableScreen } from './components/screen2/VariableScreen';
import { ResultsScreen } from './components/screen3/ResultsScreen';
import { parseFormula } from './engine/formulaParser';
import { calculateBatch } from './engine/calculator';
import type { AngleMode, BatchRow, CalculationBatchResult, HistoryItem, ScreenStep } from './types';
import type { FormulaPreset } from './engine/mathConstants';
import { FORMULA_PRESETS } from './engine/mathConstants';

const LOCAL_STORAGE_HISTORY_KEY = 'calcbatch_history_v1';

// Initial default preset (Kinematics)
const DEFAULT_PRESET = FORMULA_PRESETS[0];

export const App: React.FC = () => {
  // Navigation
  const [currentStep, setCurrentStep] = useState<ScreenStep>('formula');
  const [angleMode, setAngleMode] = useState<AngleMode>('rad');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Formula state
  const [formulaInput, setFormulaInput] = useState<string>(DEFAULT_PRESET.formula);
  const [latexInput, setLatexInput] = useState<string>(DEFAULT_PRESET.latex);

  // Parse formula dynamically
  const analysis = useMemo(() => {
    return parseFormula(formulaInput, latexInput);
  }, [formulaInput, latexInput]);

  // Batch rows state (Max 10 rows)
  const [rows, setRows] = useState<BatchRow[]>(() => {
    return DEFAULT_PRESET.sampleRows.map((sample, idx) => ({
      id: `row-${Date.now()}-${idx}`,
      values: { ...sample },
    }));
  });

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

  const handleFillSampleData = () => {
    // Check if current formula matches any preset
    const matchingPreset = FORMULA_PRESETS.find(
      (p) => p.formula.replace(/\s+/g, '') === formulaInput.replace(/\s+/g, '')
    );

    if (matchingPreset && matchingPreset.sampleRows.length > 0) {
      setRows(
        matchingPreset.sampleRows.map((sample, idx) => ({
          id: `row-${Date.now()}-${idx}`,
          values: { ...sample },
        }))
      );
    } else {
      // Generate sensible incrementing sample numbers for detected variables
      setRows((prev) =>
        prev.map((row, idx) => {
          const vals: Record<string, string> = {};
          analysis.inputVariables.forEach((v, vIdx) => {
            vals[v] = String((idx + 1) * (vIdx + 2) * 5);
          });
          return { ...row, values: vals };
        })
      );
    }
  };

  // Preset Selection
  const handleLoadPreset = (preset: FormulaPreset) => {
    setFormulaInput(preset.formula);
    setLatexInput(preset.latex);
    setRows(
      preset.sampleRows.map((sample, idx) => ({
        id: `row-${Date.now()}-${idx}`,
        values: { ...sample },
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
      {/* Notion Top Navigation Header */}
      <Header
        currentStep={currentStep}
        onNavigateStep={setCurrentStep}
        canNavigateVariables={analysis.isValid}
        canNavigateResults={batchResult !== null}
        angleMode={angleMode}
        onToggleAngleMode={() => setAngleMode((prev) => (prev === 'rad' ? 'deg' : 'rad'))}
        savedHistoryCount={history.length}
        onOpenHistory={() => setIsHistoryOpen(true)}
      />

      {/* Main Content Area */}
      <main className="flex-1">
        {currentStep === 'formula' && (
          <FormulaScreen
            formulaInput={formulaInput}
            latexInput={latexInput}
            onFormulaChange={handleFormulaChange}
            analysis={analysis}
            onNext={handleNextToVariables}
            onLoadPreset={handleLoadPreset}
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
            onFillSampleData={handleFillSampleData}
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
      </main>

      {/* Notion-style Footer */}
      <footer className="w-full border-t border-[#E9E9E7] py-4 bg-white/60 text-center text-xs text-[#9B9A97]">
        <div className="max-w-5xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>CalcBatch — Kalkulator Batch Rumus Matematika</span>
          <span>Mesin matematika deterministik didukung oleh mathjs • Lokal & privat</span>
        </div>
      </footer>

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

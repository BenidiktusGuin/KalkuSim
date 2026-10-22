export type ScreenStep = 'formula' | 'variables' | 'results';

export type AngleMode = 'rad' | 'deg';

export interface FormulaAnalysis {
  rawInput: string;
  latex: string;
  mathjsExpression: string;
  outputVariable: string;
  inputVariables: string[];
  isValid: boolean;
  errorMessage?: string;
}

export interface BatchRow {
  id: string;
  values: Record<string, string>;
}

export interface RowResult {
  rowIndex: number;
  rowId: string;
  inputs: Record<string, number | null>;
  rawResult: number | null;
  formattedResult: string;
  isSuccess: boolean;
  error?: string;
}

export interface CalculationBatchResult {
  formulaAnalysis: FormulaAnalysis;
  angleMode: AngleMode;
  rows: BatchRow[];
  results: RowResult[];
  calculatedAt: number;
}

export interface HistoryItem {
  id: string;
  title: string;
  timestamp: number;
  formulaAnalysis: FormulaAnalysis;
  angleMode: AngleMode;
  rows: BatchRow[];
  results: RowResult[];
}

export interface MathSymbolItem {
  id: string;
  label: string;
  latex: string;
  mathjsInsert: string;
  category: 'arithmetic' | 'fractions' | 'powers' | 'grouping' | 'trig' | 'logs' | 'constants' | 'functions';
  description: string;
  aliases: string[];
  template?: boolean;
}

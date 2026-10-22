# CalcBatch 📐

> A simple, interactive, formula-based batch calculator inspired by the calm, minimalist interface of Notion.

CalcBatch is a lightweight alternative to Excel for university students, engineers, and professionals who repeatedly calculate mathematical formulas using multiple sets of input data without dealing with heavy spreadsheets.

---

## ✨ Features

- **Screen 1: Visual Formula Editor**
  - Powered by MathLive with visual notation (fractions, exponents, roots, parentheses).
  - Searchable Symbol & Function catalog categorized by Arithmetic, Fractions, Powers, Grouping, Trigonometry, Logarithms, Constants, and Functions.
  - Real-time syntax validation and instant variable detection.
  - Dual-mode formula input (Visual Math or Plain Text).
  - One-click presets (Kinematics, Kinetic Energy, Ohm's Law, Cylinder Volume, Hypotenuse, Compound Interest).

- **Screen 2: Dynamic Variable Input Table**
  - Automatically identifies input variables while excluding the output variable on the LHS (`s = ...`).
  - Notion-style database table with up to 10 rows.
  - Add, remove, duplicate, clear, or autofill sample data.
  - Cell validation highlighting missing or non-numeric entries.
  - State preservation when returning back to tweak formulas.

- **Screen 3: Batch Results & Precision Inspector**
  - Complete results table displaying original formula, row inputs, formatted results, and validation status.
  - Row-level error isolation: invalid rows (e.g. division by zero, non-numeric) are reported clearly without interrupting sibling rows.
  - **Precision Inspector**: View full IEEE-754 precision and copy raw values.
  - **Exporting**: One-click Export to CSV and Copy as Tab-Separated Table for Notion/Excel.
  - Explicit **"Save to History"** button.

- **Calculation History**
  - Notion-style slide-over drawer storing explicitly saved calculations.
  - Preserves formula, inputs, outputs, timestamp, and angle mode.
  - 100% private: stored client-side in `localStorage` without external servers or AI APIs.

---

## 🛠️ Technology Stack & Architecture

- **React 19 + TypeScript**: Type-safe components and state management.
- **Vite 8**: Rapid development and production bundling.
- **Tailwind CSS v4**: Notion-inspired color system (`#FBFBFA` background, `#37352F` typography, `#2383E2` accent).
- **mathjs**: Deterministic mathematical parsing and AST evaluation without `eval()` or `Function()`.
- **mathlive**: Interactive visual mathematical editor.
- **Vitest**: Unit test suite for formula parsing, LaTeX conversion, and batch calculation.

### Directory Structure

```
src/
├── types/
│   ├── index.ts               # Core domain models (FormulaAnalysis, BatchRow, RowResult, HistoryItem)
│   └── mathlive.d.ts          # Custom element type definitions for MathLive
├── engine/
│   ├── latexConverter.ts      # LaTeX-to-mathjs conversion engine with bracket matching
│   ├── formulaParser.ts       # AST variable extraction and syntax validation
│   ├── calculator.ts          # Independent batch row evaluation and precision formatting
│   ├── mathConstants.ts       # Supported functions, constants, symbols catalog, and presets
│   └── __tests__/             # Unit tests for parser, converter, and calculator
├── components/
│   ├── common/
│   │   ├── Header.tsx         # Notion top navigation bar with step breadcrumbs & angle mode
│   │   ├── HistoryDrawer.tsx  # Slide-over drawer for saved calculations
│   │   └── PrecisionInspector.tsx # Full precision inspector modal
│   ├── screen1/
│   │   ├── FormulaScreen.tsx  # Formula input screen
│   │   ├── MathLiveEditor.tsx # Visual MathLive editor wrapper with dual-mode switch
│   │   ├── SymbolPalette.tsx  # Searchable symbol & function palette
│   │   └── PresetsBar.tsx     # Curated formula examples
│   ├── screen2/
│   │   ├── VariableScreen.tsx # Screen 2 wrapper
│   │   └── VariableTable.tsx  # Notion-style editable table (up to 10 rows)
│   └── screen3/
│       ├── ResultsScreen.tsx  # Screen 3 wrapper with summary card
│       └── ResultsTable.tsx   # Complete results table with CSV export
└── App.tsx                    # Multi-step state machine and persistence coordinator
```

---

## 📐 Mathematical Safety & Conventions

1. **No `eval()`**: All expressions are parsed into an Abstract Syntax Tree (AST) using `mathjs.parse()` and evaluated using `mathjs.evaluate()` within a controlled scope.
2. **Trigonometric Convention**: Uses **Radians** by default. A toggle in the top navigation bar allows switching between `RAD` and `DEG`. In degree mode, angles are mapped deterministically via radian conversion.
3. **Variable vs Constant Recognition**: Built-in math constants (`pi`, `e`, `tau`, `i`, etc.) and functions (`sin`, `cos`, `sqrt`, etc.) are recognized by the AST traversal and excluded from input variable lists.
4. **Assignment Equations**: Equations such as `s = v0 * t + 0.5 * a * t^2` recognize `s` as the output variable and exclude it from the variable table.

---

## 🚀 Running the Project

### Install Dependencies
```bash
npm install
```

### Start Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

### Run Unit Tests
```bash
npm test
```

### Build for Production
```bash
npm run build
```

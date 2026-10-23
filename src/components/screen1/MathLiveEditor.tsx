/**
 * ============================================================================
 * Komponen    : MathLiveEditor
 * Lapisan     : Layar 1 (Fitur Editor Rumus)
 *
 * Deskripsi:
 * Komponen editor rumus visual interaktif berbasis MathLive dengan dukungan mode
 * ganda (Visual Math & Teks Biasa), undo, redo, pembersihan rumus, serta
 * toggle mode sudut trigonometri (RAD / DEG) terintegrasi.
 * ============================================================================
 */

import React, { useEffect, useRef, useState } from "react";
import "mathlive";
import { Undo2, Redo2, RotateCcw, Code2, Sparkles } from "lucide-react";
import { latexToMathjs, expressionToLatex } from "../../engine/latexConverter";
import type { MathFieldElementTarget } from "../../types/mathlive";
import type { AngleMode } from "../../types";

interface MathLiveEditorProps {
  value: string; // Teks biasa atau rumus format mathjs
  latexValue: string; // Rumus dalam notasi LaTeX
  onChange: (value: string, latex: string) => void;
  onInsertRef?: React.MutableRefObject<
    ((latexSnippet: string, plainSnippet: string) => void) | null
  >;
  angleMode?: AngleMode;
  onToggleAngleMode?: () => void;
}

/**
 * Editor matematika visual berbasis MathLive dengan mode ganda visual & teks.
 *
 * @param props Nilai rumus, handler perubahan, ref sisip simbol, dan mode sudut.
 * @returns Elemen editor rumus visual dan teks.
 */
export const MathLiveEditor: React.FC<MathLiveEditorProps> = ({
  value,
  latexValue,
  onChange,
  onInsertRef,
  angleMode,
  onToggleAngleMode,
}) => {
  const mathFieldRef = useRef<MathFieldElementTarget | null>(null);
  const textInputRef = useRef<HTMLInputElement>(null);
  const [editorMode, setEditorMode] = useState<"visual" | "text">("visual");
  const [textInput, setTextInput] = useState(value);

  // Sync external value changes into textInput
  useEffect(() => {
    setTextInput(value);
  }, [value]);

  // Sync latexValue into mathFieldRef without resetting cursor position
  useEffect(() => {
    if (mathFieldRef.current && editorMode === "visual") {
      const currentLatex = mathFieldRef.current.value;
      const nextLatex =
        latexValue && /\\[a-zA-Z]+/.test(latexValue)
          ? latexValue
          : expressionToLatex(latexValue ?? "");

      if (nextLatex !== currentLatex) {
        mathFieldRef.current.setValue(nextLatex, {
          silenceNotifications: true,
        });
      }
    }
  }, [latexValue, editorMode]);

  // Setup MathField event listener and insertion handler
  useEffect(() => {
    const mf = mathFieldRef.current;
    if (!mf) return;

    // Configure mathfield options
    mf.smartMode = true;
    mf.virtualKeyboardMode = "manual";

    const handleInput = () => {
      const newLatex = mf.getValue("latex");
      // Convert LaTeX to readable mathjs plain-text string
      const plainText = latexToMathjs(newLatex);
      onChange(plainText, newLatex);
    };

    mf.addEventListener("input", handleInput);

    // Expose insertion method to parent ref
    if (onInsertRef) {
      onInsertRef.current = (latexSnippet: string, plainSnippet: string) => {
        if (editorMode === "visual" && mathFieldRef.current) {
          mathFieldRef.current.focus();
          mathFieldRef.current.executeCommand(["insert", latexSnippet]);
          const updatedLatex = mathFieldRef.current.getValue("latex");
          const updatedPlain = latexToMathjs(updatedLatex);
          onChange(updatedPlain, updatedLatex);
        } else {
          // In text mode, insert at caret and strip MathLive placeholders.
          const input = textInputRef.current;
          const start = input?.selectionStart ?? textInput.length;
          const end = input?.selectionEnd ?? textInput.length;
          const insert = plainSnippet.replace(/#\?/g, "");
          const updated = `${textInput.slice(0, start)}${insert}${textInput.slice(end)}`;
          setTextInput(updated);
          onChange(updated, updated);

          requestAnimationFrame(() => {
            input?.focus();
            const caret = start + insert.length;
            input?.setSelectionRange(caret, caret);
          });
        }
      };
    }

    return () => {
      mf.removeEventListener("input", handleInput);
      if (onInsertRef) onInsertRef.current = null;
    };
  }, [onChange, onInsertRef, editorMode, textInput]);

  const handleUndo = () => {
    if (editorMode === "visual" && mathFieldRef.current) {
      mathFieldRef.current.executeCommand("undo");
      const updatedLatex = mathFieldRef.current.getValue("latex");
      onChange(latexToMathjs(updatedLatex), updatedLatex);
    }
  };

  const handleRedo = () => {
    if (editorMode === "visual" && mathFieldRef.current) {
      mathFieldRef.current.executeCommand("redo");
      const updatedLatex = mathFieldRef.current.getValue("latex");
      onChange(latexToMathjs(updatedLatex), updatedLatex);
    }
  };

  const handleClear = () => {
    if (mathFieldRef.current) {
      mathFieldRef.current.setValue("", { silenceNotifications: true });
    }
    setTextInput("");
    onChange("", "");
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTextInput(val);
    onChange(val, val);
  };

  return (
    <div className="w-full space-y-2.5">
      {/* Editor Controls Bar */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-[#6B7280] px-1">
        <span className="font-semibold text-[#2F3437]">Ekspresi Rumus</span>

        <div className="flex items-center gap-2">
          {/* Compact Angle Mode Switch (RAD / DEG) */}
          {onToggleAngleMode && angleMode && (
            <button
              type="button"
              onClick={onToggleAngleMode}
              title={`Mode trigonometri: ${angleMode === 'rad' ? 'Radian (Standar)' : 'Derajat'}. Klik untuk beralih.`}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs sm:text-sm font-medium border border-[#E9E9E7] bg-white hover:bg-[#F7F7F5] text-[#2F3437] transition-colors cursor-pointer"
            >
              <span className="text-[#9CA3AF]">Sudut</span>
              <span className="font-medium text-[#2F3437]">{angleMode === 'rad' ? 'Radian' : 'Derajat'}</span>
            </button>
          )}

          {/* Visual vs Plain Text Mode Switch */}
          <button
            type="button"
            onClick={() =>
              setEditorMode(editorMode === "visual" ? "text" : "visual")
            }
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs sm:text-sm font-medium border border-[#E9E9E7] bg-white hover:bg-[#F7F7F5] text-[#2F3437] transition-colors cursor-pointer"
            title="Beralih antara input Visual Math dan Teks Biasa"
          >
            {editorMode === "visual" ? (
              <>
                <Code2 className="w-4 h-4 text-[#6B7280]" />
                <span>Teks</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-[#6D28D9]" />
                <span>Visual</span>
              </>
            )}
          </button>

          {/* Undo / Redo (Visual mode) */}
          {editorMode === "visual" && (
            <>
              <button
                type="button"
                onClick={handleUndo}
                title="Urungkan (Ctrl+Z)"
                className="p-1.5 rounded-md hover:bg-[#F1F1EF] text-[#6B7280] hover:text-[#2F3437] transition-colors cursor-pointer"
              >
                <Undo2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                title="Ulangi (Ctrl+Y)"
                className="p-1.5 rounded-md hover:bg-[#F1F1EF] text-[#6B7280] hover:text-[#2F3437] transition-colors cursor-pointer"
              >
                <Redo2 className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Clear button */}
          <button
            type="button"
            onClick={handleClear}
            title="Bersihkan rumus"
            className="p-1.5 rounded-md hover:bg-[#FDEDED] text-[#6B7280] hover:text-[#EB5757] transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="relative">
        {editorMode === "visual" ? (
          <div className="relative rounded-xl shadow-xs transition-all">
            <math-field
              ref={mathFieldRef}
              class="w-full rounded-lg border border-[#D3D3D0] bg-white px-4 py-3.5 text-xl text-[#2F3437] sm:text-2xl min-h-[64px] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9]"
              aria-label="Editor rumus matematika"
            />
          </div>
        ) : (
          <input
            ref={textInputRef}
            type="text"
            value={textInput}
            onChange={handleTextChange}
            placeholder="Contoh: v_0 * t + 0.5 * a * t^2"
            className="w-full rounded-lg border border-[#D3D3D0] bg-white px-4 py-3.5 text-lg text-[#2F3437] shadow-xs transition-all placeholder:text-[#9CA3AF] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] sm:text-xl"
          />
        )}
      </div>
    </div>
  );
};

export default MathLiveEditor;

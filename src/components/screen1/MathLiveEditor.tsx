import React, { useEffect, useRef, useState } from 'react';
import 'mathlive';
import { Undo2, Redo2, RotateCcw, Code2, Sparkles } from 'lucide-react';

interface MathLiveEditorProps {
  value: string; // Plain text or mathjs formula
  latexValue: string; // LaTeX formula
  onChange: (value: string, latex: string) => void;
  onInsertRef?: React.MutableRefObject<((latexSnippet: string, plainSnippet: string) => void) | null>;
}

export const MathLiveEditor: React.FC<MathLiveEditorProps> = ({
  value,
  latexValue,
  onChange,
  onInsertRef,
}) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mathFieldRef = useRef<any>(null);
  const [editorMode, setEditorMode] = useState<'visual' | 'text'>('visual');
  const [textInput, setTextInput] = useState(value);

  // Sync external value changes into textInput
  useEffect(() => {
    setTextInput(value);
  }, [value]);

  // Sync latexValue into mathFieldRef without resetting cursor position
  useEffect(() => {
    if (mathFieldRef.current && editorMode === 'visual') {
      const currentLatex = mathFieldRef.current.value;
      if (latexValue !== undefined && currentLatex !== latexValue) {
        mathFieldRef.current.setValue(latexValue, { silenceNotifications: true });
      }
    }
  }, [latexValue, editorMode]);

  // Setup MathField event listener and insertion handler
  useEffect(() => {
    const mf = mathFieldRef.current;
    if (!mf) return;

    // Configure mathfield options
    mf.smartMode = true;
    mf.virtualKeyboardMode = 'manual';

    const handleInput = () => {
      const newLatex = mf.getValue('latex');
      // Update parent with both LaTeX and raw text
      onChange(newLatex, newLatex);
    };

    mf.addEventListener('input', handleInput);

    // Expose insertion method to parent ref
    if (onInsertRef) {
      onInsertRef.current = (latexSnippet: string, plainSnippet: string) => {
        if (editorMode === 'visual' && mathFieldRef.current) {
          mathFieldRef.current.focus();
          mathFieldRef.current.executeCommand(['insert', latexSnippet]);
          const updatedLatex = mathFieldRef.current.getValue('latex');
          onChange(updatedLatex, updatedLatex);
        } else {
          // In text mode, append or insert at end
          const updated = textInput ? `${textInput} ${plainSnippet}` : plainSnippet;
          setTextInput(updated);
          onChange(updated, updated);
        }
      };
    }

    return () => {
      mf.removeEventListener('input', handleInput);
      if (onInsertRef) onInsertRef.current = null;
    };
  }, [onChange, onInsertRef, editorMode, textInput]);

  const handleUndo = () => {
    if (editorMode === 'visual' && mathFieldRef.current) {
      mathFieldRef.current.executeCommand('undo');
      const updatedLatex = mathFieldRef.current.getValue('latex');
      onChange(updatedLatex, updatedLatex);
    }
  };

  const handleRedo = () => {
    if (editorMode === 'visual' && mathFieldRef.current) {
      mathFieldRef.current.executeCommand('redo');
      const updatedLatex = mathFieldRef.current.getValue('latex');
      onChange(updatedLatex, updatedLatex);
    }
  };

  const handleClear = () => {
    if (mathFieldRef.current) {
      mathFieldRef.current.setValue('', { silenceNotifications: true });
    }
    setTextInput('');
    onChange('', '');
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setTextInput(val);
    onChange(val, val);
  };

  return (
    <div className="w-full space-y-2">
      {/* Editor Controls Bar */}
      <div className="flex items-center justify-between text-xs text-[#787774] px-1">
        <div className="flex items-center gap-1">
          <span className="font-medium text-[#37352F]">Ekspresi Rumus</span>
          <span className="text-[#9B9A97]">•</span>
          <span className="text-[#9B9A97]">contoh: s = v0*t + 0.5*a*t^2</span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Visual vs Plain Text Mode Switch */}
          <button
            type="button"
            onClick={() => setEditorMode(editorMode === 'visual' ? 'text' : 'visual')}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium border border-[#E9E9E7] bg-white hover:bg-[#F7F7F5] text-[#37352F] transition-colors"
            title="Beralih antara input Visual Math dan Teks Biasa"
          >
            {editorMode === 'visual' ? (
              <>
                <Code2 className="w-3 h-3 text-[#787774]" />
                <span>Teks Biasa</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3 h-3 text-[#6D28D9]" />
                <span>Visual Math</span>
              </>
            )}
          </button>

          {/* Undo / Redo (Visual mode) */}
          {editorMode === 'visual' && (
            <>
              <button
                type="button"
                onClick={handleUndo}
                title="Urungkan (Ctrl+Z)"
                className="p-1 rounded hover:bg-[#F1F1EF] text-[#787774] hover:text-[#37352F] transition-colors"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={handleRedo}
                title="Ulangi (Ctrl+Y)"
                className="p-1 rounded hover:bg-[#F1F1EF] text-[#787774] hover:text-[#37352F] transition-colors"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
            </>
          )}

          {/* Clear button */}
          <button
            type="button"
            onClick={handleClear}
            title="Bersihkan rumus"
            className="p-1 rounded hover:bg-[#FDEDED] text-[#787774] hover:text-[#EB5757] transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Editor Main Canvas */}
      <div className="relative">
        {editorMode === 'visual' ? (
          <div className="relative rounded-lg shadow-xs transition-all">
            <math-field
              ref={mathFieldRef}
              class="w-full text-lg sm:text-xl font-mono text-[#37352F] bg-white border border-[#D3D3D0] rounded-lg p-3 min-h-[58px] focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9]"
            />
          </div>
        ) : (
          <input
            type="text"
            value={textInput}
            onChange={handleTextChange}
            placeholder="contoh: s = v0 * t + 0.5 * a * t^2"
            className="w-full px-4 py-3 text-base sm:text-lg font-mono text-[#37352F] bg-white border border-[#D3D3D0] rounded-lg shadow-xs focus:outline-none focus:ring-2 focus:ring-[#6D28D9]/20 focus:border-[#6D28D9] transition-all placeholder:text-[#9B9A97]"
          />
        )}
      </div>
    </div>
  );
};

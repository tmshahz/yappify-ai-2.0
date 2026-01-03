import React from 'react';
import { PromptMode } from '../types';
import clsx from 'clsx';
import { Sparkles } from 'lucide-react';

interface PromptifyBarProps {
  currentMode: PromptMode;
  onModeChange: (mode: PromptMode) => void;
  onTransform: () => void;
  customInstruction: string;
  onCustomInstructionChange: (val: string) => void;
  disabled: boolean;
}

export const PromptifyBar: React.FC<PromptifyBarProps> = ({
  currentMode,
  onModeChange,
  onTransform,
  customInstruction,
  onCustomInstructionChange,
  disabled
}) => {
  const modes = Object.values(PromptMode);

  return (
    <div className="w-full space-y-3 mb-6">
        <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider pl-1">
                Transformation Mode
            </label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {modes.map((mode) => (
                <button
                    key={mode}
                    onClick={() => onModeChange(mode)}
                    disabled={disabled}
                    className={clsx(
                    "px-3 py-2 text-xs font-medium rounded-lg border transition-all truncate",
                    currentMode === mode
                        ? "border-accent text-accent bg-accent-light dark:bg-purple-900/30 ring-1 ring-accent"
                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-accent/50"
                    )}
                >
                    {mode}
                </button>
                ))}
            </div>
        </div>

      {currentMode === PromptMode.CUSTOM && (
        <textarea
          value={customInstruction}
          onChange={(e) => onCustomInstructionChange(e.target.value)}
          placeholder="Put literally whatever you want here."
          className="w-full p-3 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-accent/50 dark:text-white resize-none h-20"
          disabled={disabled}
        />
      )}

      <button
        onClick={onTransform}
        disabled={disabled}
        className="w-full flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black py-3 rounded-xl font-medium text-sm hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
      >
        <Sparkles size={16} />
        <span>Transform Text</span>
      </button>
    </div>
  );
};
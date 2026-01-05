import React, { useEffect } from 'react';
import { PromptMode } from '../types';
import clsx from 'clsx';
import { Settings2, Zap, FileText, Sparkles, ExternalLink, PanelLeftClose, Upload, Info } from 'lucide-react';

interface PromptifyPanelProps {
  currentMode: PromptMode;
  onModeChange: (mode: PromptMode) => void;
  customInstruction: string;
  onCustomInstructionChange: (val: string) => void;
  disabled: boolean;
  onClose: () => void;
  onFileUpload?: () => void;
  onInfoOpen?: () => void;
}

export const PromptifyPanel: React.FC<PromptifyPanelProps> = ({
  currentMode,
  onModeChange,
  customInstruction,
  onCustomInstructionChange,
  disabled,
  onClose,
  onFileUpload,
  onInfoOpen
}) => {
  const modes = [
    { id: PromptMode.ENHANCER, icon: Sparkles, label: 'Enhancer' },
    { id: PromptMode.DEEP, icon: Settings2, label: 'Deep Structuring' },
    { id: PromptMode.NOTES, icon: Zap, label: 'Quick Notes' },
    { id: PromptMode.CUSTOM, icon: FileText, label: 'Custom Mode' },
  ];

  // Load custom instruction from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem('yappify_custom_prompt');
    if (saved) onCustomInstructionChange(saved);
  }, []);

  const handleCustomChange = (val: string) => {
    onCustomInstructionChange(val);
    localStorage.setItem('yappify_custom_prompt', val);
  };

  return (
    <div className="flex flex-col h-full w-full">

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">
          Promptify Modes
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Close sidebar"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      {/* Mode List */}
      <div className="flex flex-col gap-3">
        {modes.map((m) => {
          const Icon = m.icon;
          const isSelected = currentMode === m.id;
          return (
            <button
              key={m.id}
              onClick={() => onModeChange(m.id)}
              disabled={disabled}
              className={clsx(
                "group relative w-full text-left p-3 rounded-xl transition-all duration-200",
                "border hover:border-purple-300 dark:hover:border-purple-700",
                isSelected
                  ? "border-purple-600 dark:border-purple-500 shadow-sm"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              )}
            >
              <div className="flex items-center gap-3">
                <div className={clsx(
                  "p-2 rounded-lg transition-colors",
                  isSelected ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 group-hover:bg-purple-50 dark:group-hover:bg-purple-900/20"
                )}>
                  <Icon size={18} />
                </div>
                <span className={clsx(
                  "text-sm font-medium",
                  isSelected ? "text-purple-900 dark:text-purple-100" : "text-gray-700 dark:text-gray-300"
                )}>
                  {m.label}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Custom Input */}
      {currentMode === PromptMode.CUSTOM && (
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 animate-in slide-in-from-top-2">
          <p className="text-xs text-gray-500 mb-2">
            Transform your text however you like. Add your own custom instructions below.
          </p>
          <textarea
            value={customInstruction}
            onChange={(e) => handleCustomChange(e.target.value)}
            placeholder="e.g., Rewrite this as a 17th-century pirate..."
            className="w-full h-32 p-3 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-black focus:outline-none focus:ring-1 focus:ring-purple-500 resize-none"
            disabled={disabled}
          />
        </div>
      )}

      {/* Upload File Button (after Custom Mode) */}
      {onFileUpload && (
        <div className="mt-3">
          <button
            onClick={onFileUpload}
            disabled={disabled}
            className="w-full flex items-center gap-3 p-3 rounded-xl border border-dashed border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="p-2 rounded-lg bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400">
              <Upload size={18} />
            </div>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Upload Audio File
            </span>
          </button>
        </div>
      )}

      {/* Bottom Section with Info and About */}
      <div className="mt-auto pt-6 border-t border-gray-100 dark:border-gray-800 space-y-3">
        {onInfoOpen && (
          <button
            onClick={onInfoOpen}
            className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors w-full"
          >
            <Info size={16} />
            <span>How to Use</span>
          </button>
        )}
        <a
          href="https://www.tmshahz.com"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-sm font-semibold text-gray-500 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
        >
          <ExternalLink size={16} />
          <span>About Developer</span>
        </a>
      </div>
    </div>
  );
};
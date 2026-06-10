import React from 'react';
import { PromptMode, PromptModeDefinition } from '../types';
import clsx from 'clsx';
import { Zap, FileText, Sparkles, PanelLeftClose, Info, Pencil, X } from 'lucide-react';
import { PanelFooterLinks } from './PanelFooterLinks';

interface PromptifyPanelProps {
  currentMode: PromptMode;
  onModeChange: (mode: PromptMode) => void;
  modes: PromptModeDefinition[];
  disabled: boolean;
  onClose: () => void;
  onInfoOpen?: () => void;
  onModeInfo: (mode: PromptModeDefinition) => void;
  onEditCustomMode: (mode: PromptModeDefinition) => void;
  onResetCustomMode: (mode: PromptModeDefinition) => void;
}

export const PromptifyPanel: React.FC<PromptifyPanelProps> = ({
  currentMode,
  onModeChange,
  modes,
  disabled,
  onClose,
  onInfoOpen,
  onModeInfo,
  onEditCustomMode,
  onResetCustomMode,
}) => {
  const getIcon = (mode: PromptModeDefinition) => {
    if (mode.id === PromptMode.ENHANCER) return Sparkles;
    if (mode.id === PromptMode.NOTES) return Zap;
    return FileText;
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
          const Icon = getIcon(m);
          const isSelected = currentMode === m.id;
          return (
            <div
              key={m.id}
              role="button"
              tabIndex={disabled ? -1 : 0}
              onClick={() => {
                if (!disabled) onModeChange(m.id);
              }}
              onKeyDown={(event) => {
                if (!disabled && (event.key === 'Enter' || event.key === ' ')) {
                  event.preventDefault();
                  onModeChange(m.id);
                }
              }}
              className={clsx(
                "yap-glass-card yap-hover-lift yap-glow-in group relative w-full rounded-xl transition-all duration-200",
                "border hover:border-purple-300 dark:hover:border-purple-700",
                disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
                isSelected
                  ? "yap-glass-active border-purple-600 dark:border-[var(--yap-active-border)] shadow-sm"
                  : "border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900"
              )}
            >
              <div className="flex items-center gap-2 p-3">
                <div className="flex min-w-0 flex-1 items-center gap-3 text-left">
                  <div className={clsx(
                    "p-2 rounded-lg transition-colors",
                    isSelected ? "yap-icon-mist bg-purple-100 text-purple-700 dark:bg-[var(--yap-violet-mist)] dark:text-[var(--yap-violet-hover)]" : "bg-gray-100 text-gray-500 dark:bg-[var(--yap-violet-mist)] dark:text-[var(--yap-text-2)] group-hover:bg-purple-50 dark:group-hover:text-[var(--yap-violet-hover)]"
                  )}>
                    <Icon size={18} />
                  </div>
                  <span className={clsx(
                    "truncate text-sm font-medium",
                    isSelected ? "text-purple-900 dark:text-[var(--yap-text-1)]" : "text-gray-700 dark:text-[var(--yap-text-2)]"
                  )}>
                    {m.title}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  {!m.isCustom ? (
                    <button
                      onClick={(event) => {
                        event.stopPropagation();
                        onModeInfo(m);
                      }}
                      className="p-1.5 rounded-md text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors"
                      title={`About ${m.title}`}
                    >
                      <Info size={14} />
                    </button>
                  ) : (
                    <>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onEditCustomMode(m);
                        }}
                        disabled={disabled}
                        className="p-1.5 rounded-md text-gray-400 hover:text-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-colors disabled:opacity-50"
                        title={`Edit ${m.title}`}
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        onClick={(event) => {
                          event.stopPropagation();
                          onResetCustomMode(m);
                        }}
                        disabled={disabled}
                        className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
                        title={`Reset ${m.title}`}
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {onInfoOpen && <PanelFooterLinks onInfoOpen={onInfoOpen} />}
    </div>
  );
};
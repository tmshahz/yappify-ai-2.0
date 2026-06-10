import React, { useState } from 'react';
import { HistoryItem } from '../types';
import { Clock, ChevronRight, PanelRightClose, Trash2, Archive } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryItem[];
  onPreview: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onPreview, onDelete, onClearAll, onClose }) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const getPreview = (item: HistoryItem) => (item.transformed || item.raw).replace(/\s+/g, ' ').trim();

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={onClose}
          className="p-1 text-gray-400 dark:text-[var(--yap-text-2)] hover:text-gray-900 dark:hover:text-[var(--yap-text-1)] rounded-md hover:bg-gray-100 dark:hover:bg-[var(--yap-glass-hover)] transition-colors"
          title="Close history"
        >
          <PanelRightClose size={16} />
        </button>
        <h3 className="text-xs font-bold text-gray-500 dark:text-[var(--yap-text-2)] uppercase tracking-wider flex items-center gap-2">
          <Clock size={12} /> Session History
        </h3>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="p-4 rounded-full bg-purple-100 dark:bg-[var(--yap-violet-mist)] mb-4">
              <Archive size={28} className="text-purple-600 dark:text-[var(--yap-violet-hover)]" />
            </div>
            <p className="text-sm font-bold text-gray-700 dark:text-[var(--yap-text-1)] mb-2 text-center">
              No History Yet
            </p>
            <p className="text-xs text-gray-500 dark:text-[var(--yap-text-2)] text-center leading-relaxed max-w-[200px]">
              Your transcripts and AI transformations will be saved here when you clear the workspace.
            </p>
          </div>
        ) : (
          <div className="relative pl-5 space-y-3">
            <div className="absolute left-1.5 top-2 bottom-2 w-px bg-gray-200 dark:bg-[var(--yap-glass-border)]" aria-hidden="true" />
            {history.slice().reverse().map((item) => (
              <div
                key={item.id}
                className="yap-glass-card yap-hover-lift yap-glow-in relative w-full p-3 rounded-lg border border-gray-100 dark:border-[var(--yap-glass-border)] bg-white dark:bg-[rgba(255,255,255,0.035)] hover:bg-gray-50 dark:hover:bg-[var(--yap-glass-hover)] transition-colors group"
              >
                <span className="absolute -left-[18px] top-4 h-2.5 w-2.5 rounded-full bg-purple-600 dark:bg-[var(--yap-violet)] ring-4 ring-white dark:ring-[var(--yap-void)]" aria-hidden="true" />
                <button
                  onClick={() => onPreview(item)}
                  className="w-full text-left"
                >
                  <div className="flex justify-between items-start mb-1 gap-2">
                    <span className="text-[10px] text-gray-400 dark:text-[var(--yap-text-3)] font-mono">
                      {new Date(item.timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="yap-mode-badge text-[10px] bg-purple-100 dark:bg-[var(--yap-violet-mist)] text-purple-700 dark:text-[var(--yap-text-1)] px-2 py-0.5 rounded-full truncate max-w-[120px]">
                      {item.modeLabel}
                    </span>
                  </div>
                  <p className="text-xs text-gray-700 dark:text-[var(--yap-text-2)] line-clamp-2 font-medium pr-8">
                    {getPreview(item)}
                  </p>
                  <div className="mt-2 flex items-center text-[10px] text-gray-400 dark:text-[var(--yap-text-3)] group-hover:text-purple-600 dark:group-hover:text-[var(--yap-violet-hover)] transition-colors opacity-80 group-hover:opacity-100">
                    Preview <ChevronRight size={10} className="ml-1" />
                  </div>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(item.id);
                  }}
                  className="absolute bottom-2 right-2 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                  title="Delete this item"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Clear All Button */}
      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-[var(--yap-glass-border)]">
          {!showClearConfirm ? (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors text-xs font-bold"
            >
              <Trash2 size={14} />
              Clear All History
            </button>
          ) : (
            <div className="space-y-2">
              <p className="text-xs text-gray-600 dark:text-[var(--yap-text-2)] text-center font-medium">
                Delete all {history.length} items?
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onClearAll();
                    setShowClearConfirm(false);
                  }}
                  className="flex-1 px-3 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-lg transition-colors"
                >
                  Yes, Delete All
                </button>
                <button
                  onClick={() => setShowClearConfirm(false)}
                  className="yap-ghost-button flex-1 px-3 py-2 bg-gray-200 dark:bg-transparent hover:bg-gray-300 dark:hover:bg-[var(--yap-glass-hover)] text-gray-900 dark:text-[var(--yap-text-1)] text-xs font-bold rounded-lg transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
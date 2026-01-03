import React, { useState } from 'react';
import { HistoryItem, PromptMode } from '../types';
import { Clock, ChevronRight, PanelRightClose, Trash2, Archive } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onDelete: (id: string) => void;
  onClearAll: () => void;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onRestore, onDelete, onClearAll, onClose }) => {
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
            <Clock size={12} /> Session History
        </h3>
        <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Close history"
        >
            <PanelRightClose size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-3 pr-2">
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-4">
            <div className="p-4 rounded-full bg-purple-100 dark:bg-purple-900/20 mb-4">
              <Archive size={28} className="text-purple-600 dark:text-purple-400" />
            </div>
            <p className="text-sm font-bold text-gray-700 dark:text-gray-300 mb-2 text-center">
              No History Yet
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center leading-relaxed max-w-[200px]">
              Your transcripts and AI transformations will be saved here when you clear the workspace.
            </p>
          </div>
        ) : (
          history.slice().reverse().map((item) => (
            <div
              key={item.id}
              className="relative w-full p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
            >
              <button
                onClick={() => onRestore(item)}
                className="w-full text-left"
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  {item.transformed && (
                    <span className="text-[10px] bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 px-1.5 py-0.5 rounded-full">
                      AI
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 font-medium pr-8">
                  {item.transformed || item.raw}
                </p>
                <div className="mt-2 flex items-center text-[10px] text-gray-400 group-hover:text-purple-600 transition-colors">
                   Restore <ChevronRight size={10} className="ml-1" />
                </div>
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="absolute bottom-2 right-2 p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors opacity-0 group-hover:opacity-100"
                title="Delete this item"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))
        )}
      </div>

      {/* Clear All Button */}
      {history.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
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
              <p className="text-xs text-gray-600 dark:text-gray-400 text-center font-medium">
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
                  className="flex-1 px-3 py-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-gray-900 dark:text-gray-100 text-xs font-bold rounded-lg transition-colors"
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
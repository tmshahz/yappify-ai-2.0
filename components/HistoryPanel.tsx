import React from 'react';
import { HistoryItem, PromptMode } from '../types';
import { Clock, ChevronRight, PanelRightClose } from 'lucide-react';

interface HistoryPanelProps {
  history: HistoryItem[];
  onRestore: (item: HistoryItem) => void;
  onClose: () => void;
}

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ history, onRestore, onClose }) => {
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
          <div className="text-center py-10 text-gray-400 text-xs italic">
            No history yet.<br/>Items appear here after clearing.
          </div>
        ) : (
          history.slice().reverse().map((item) => (
            <button
              key={item.id}
              onClick={() => onRestore(item)}
              className="w-full text-left p-3 rounded-lg border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors group"
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
              <p className="text-xs text-gray-700 dark:text-gray-300 line-clamp-2 font-medium">
                {item.transformed || item.raw}
              </p>
              <div className="mt-2 flex items-center text-[10px] text-gray-400 group-hover:text-purple-600 transition-colors">
                 Restore <ChevronRight size={10} className="ml-1" />
              </div>
            </button>
          ))
        )}
      </div>
    </div>
  );
};
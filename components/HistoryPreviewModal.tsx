import React from 'react';
import { OutputMarkdown } from './OutputMarkdown';
import { Clock } from 'lucide-react';
import { HistoryItem } from '../types';
import { Modal } from './Modal';

interface HistoryPreviewModalProps {
  item: HistoryItem | null;
  isOpen: boolean;
  onClose: () => void;
  onRestore: (item: HistoryItem) => void;
}

export const HistoryPreviewModal: React.FC<HistoryPreviewModalProps> = ({
  item,
  isOpen,
  onClose,
  onRestore,
}) => {
  if (!item) return null;

  return (
    <Modal
      isOpen={isOpen}
      title="History Preview"
      onClose={onClose}
      maxWidth="xl"
      icon={
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <Clock size={18} className="text-purple-600 dark:text-purple-400" />
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="yap-ghost-button px-4 py-2 text-sm font-medium text-gray-700 dark:text-[var(--yap-text-2)] hover:bg-gray-100 dark:hover:bg-[var(--yap-glass-hover)] rounded-lg transition-colors"
          >
            Close
          </button>
          <button
            onClick={() => {
              onRestore(item);
              onClose();
            }}
            className="yap-violet-button px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Restore To Workspace
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div className="yap-glass-card rounded-xl bg-gray-50 dark:bg-[rgba(255,255,255,0.035)] p-3">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Mode</p>
            <p className="mt-1 font-semibold text-gray-800 dark:text-[var(--yap-text-1)]">{item.modeLabel}</p>
          </div>
          <div className="yap-glass-card rounded-xl bg-gray-50 dark:bg-[rgba(255,255,255,0.035)] p-3">
            <p className="text-xs uppercase tracking-wider text-gray-400 font-bold">Timestamp</p>
            <p className="mt-1 font-semibold text-gray-800 dark:text-[var(--yap-text-1)]">
              {new Date(item.timestamp).toLocaleString()}
            </p>
          </div>
        </div>

        <section className="space-y-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Original Content</h3>
          <div className="yap-glass-card rounded-xl border border-gray-200 dark:border-[var(--yap-glass-border)] bg-white dark:bg-[rgba(255,255,255,0.025)] p-4 max-h-52 overflow-y-auto custom-scrollbar text-sm whitespace-pre-wrap dark:text-[var(--yap-text-2)]">
            {item.raw}
          </div>
        </section>

        {item.transformed && (
          <section className="space-y-2">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">AI Output</h3>
            <div className="yap-glass-card rounded-xl border border-gray-200 dark:border-[var(--yap-glass-border)] bg-white dark:bg-[rgba(255,255,255,0.025)] p-4 max-h-72 overflow-y-auto custom-scrollbar">
              <OutputMarkdown content={item.transformed} />
            </div>
          </section>
        )}
      </div>
    </Modal>
  );
};

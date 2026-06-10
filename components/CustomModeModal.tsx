import React, { useEffect, useState } from 'react';
import { FileText } from 'lucide-react';
import { CustomModeData } from '../types';
import { Modal } from './Modal';

interface CustomModeModalProps {
  isOpen: boolean;
  mode: CustomModeData | null;
  onClose: () => void;
  onSave: (mode: CustomModeData) => void;
}

export const CustomModeModal: React.FC<CustomModeModalProps> = ({
  isOpen,
  mode,
  onClose,
  onSave,
}) => {
  const [title, setTitle] = useState('');
  const [instructions, setInstructions] = useState('');

  useEffect(() => {
    if (!mode) return;
    setTitle(mode.title);
    setInstructions(mode.instructions);
  }, [mode]);

  if (!mode) return null;

  const handleSave = () => {
    onSave({
      ...mode,
      title: title.trim() || mode.title,
      instructions: instructions.trim(),
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      title={`Edit ${mode.title}`}
      onClose={onClose}
      maxWidth="lg"
      icon={
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <FileText size={18} className="text-purple-600 dark:text-purple-400" />
        </div>
      }
      footer={
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="yap-ghost-button px-4 py-2 text-sm font-medium text-gray-700 dark:text-[var(--yap-text-2)] hover:bg-gray-100 dark:hover:bg-[var(--yap-glass-hover)] rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="yap-violet-button px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Save Mode
          </button>
        </div>
      }
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-[var(--yap-text-2)]">
            Custom title
          </label>
          <input
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder="Custom Mode"
            className="yap-glass-input w-full text-sm p-3 rounded-lg border border-gray-200 dark:border-[var(--yap-glass-border)] bg-gray-50 dark:bg-[var(--yap-surface-3)] dark:text-[var(--yap-text-1)] focus:ring-2 focus:ring-purple-500/50 outline-none"
          />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-[var(--yap-text-2)]">
            Custom instructions
          </label>
          <textarea
            value={instructions}
            onChange={(event) => setInstructions(event.target.value)}
            placeholder="e.g., Rewrite this as crisp engineering notes with risks and next actions."
            className="yap-glass-input w-full h-44 p-3 text-sm rounded-lg border border-gray-200 dark:border-[var(--yap-glass-border)] bg-gray-50 dark:bg-[var(--yap-surface-3)] dark:text-[var(--yap-text-1)] focus:ring-2 focus:ring-purple-500/50 outline-none resize-none"
          />
          <p className="text-xs text-gray-400">
            These instructions are saved locally in this browser only.
          </p>
        </div>
      </div>
    </Modal>
  );
};

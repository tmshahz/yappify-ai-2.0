import React from 'react';
import { Info } from 'lucide-react';
import { PromptModeDefinition } from '../types';
import { Modal } from './Modal';

interface PromptModeInfoModalProps {
  isOpen: boolean;
  mode: PromptModeDefinition | null;
  onClose: () => void;
}

export const PromptModeInfoModal: React.FC<PromptModeInfoModalProps> = ({
  isOpen,
  mode,
  onClose,
}) => {
  if (!mode) return null;

  return (
    <Modal
      isOpen={isOpen}
      title={mode.title}
      onClose={onClose}
      icon={
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <Info size={18} className="text-purple-600 dark:text-purple-400" />
        </div>
      }
      footer={
        <button
          onClick={onClose}
          className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
        >
          Got it
        </button>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
          {mode.description}
        </p>
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4">
          <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider mb-2">
            Instructions
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
            {mode.instructions}
          </p>
        </div>
      </div>
    </Modal>
  );
};

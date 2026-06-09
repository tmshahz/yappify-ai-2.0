import React from 'react';
import { Sparkles } from 'lucide-react';
import { Modal } from './Modal';

interface InfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="How to Use Yappify"
      icon={
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
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
          <strong className="text-gray-900 dark:text-gray-100">Yappify</strong> turns voice
          and audio files into transcripts, prompts, translations, and meeting artifacts using
          Google Gemini.
        </p>

        <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 rounded-xl p-4">
          <h3 className="text-xs font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wider mb-3">
            Workflow
          </h3>
          <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-purple-600 dark:bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">1</span>
              <span><strong>Choose a mode</strong> - Speech-to-Text, Translate, or Upload.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-purple-600 dark:bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">2</span>
              <span><strong>Record or upload</strong> - capture audio or select an audio file.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="flex-shrink-0 w-5 h-5 bg-purple-600 dark:bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
              <span><strong>Process</strong> - promptify, translate, or generate upload outputs.</span>
            </li>
          </ol>
        </div>

        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
          <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
            Important Notes
          </h3>
          <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>Runs entirely on Google Gemini with your API key.</li>
            <li>History, custom modes, settings, and analytics are stored locally in this browser.</li>
            <li>Audio files are processed in memory and are not persisted by Yappify.</li>
          </ul>
        </div>

        <div className="pt-2 space-y-2">
          <a
            href="https://ai.google.dev/gemini-api/docs"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            Learn more about Google Gemini API
          </a>
          <a
            href="https://aistudio.google.com/app/apikey"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            Get your Gemini API key
          </a>
        </div>
      </div>
    </Modal>
  );
};

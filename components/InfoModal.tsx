import React from 'react';
import { X, Sparkles } from 'lucide-react';

interface InfoModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const InfoModal: React.FC<InfoModalProps> = ({ isOpen, onClose }) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in">
            <div className="relative w-full max-w-md bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-800 animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-100 dark:border-gray-800">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                            <Sparkles size={20} className="text-purple-600 dark:text-purple-400" />
                        </div>
                        <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">
                            How to Use yappify-ai
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500 hover:text-gray-900 dark:hover:text-white"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="p-6 space-y-4">
                    <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                        <strong className="text-gray-900 dark:text-gray-100">yappify-ai</strong> simplifies speech-to-text and prompt structuring, powered entirely by Google Gemini.
                    </p>

                    <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-100 dark:border-purple-900/30 rounded-xl p-4">
                        <h3 className="text-xs font-bold text-purple-900 dark:text-purple-100 uppercase tracking-wider mb-3">
                            Simple Workflow
                        </h3>
                        <ol className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <li className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-purple-600 dark:bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">1</span>
                                <span><strong>Talk</strong> – Record your voice or upload an audio file</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-purple-600 dark:bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">2</span>
                                <span><strong>Transcribe</strong> – Convert speech to text using Gemini</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="flex-shrink-0 w-5 h-5 bg-purple-600 dark:bg-purple-500 text-white text-xs font-bold rounded-full flex items-center justify-center">3</span>
                                <span><strong>Promptify</strong> – Restructure text with AI-powered modes</span>
                            </li>
                        </ol>
                    </div>

                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-4 space-y-3">
                        <h3 className="text-xs font-bold text-gray-700 dark:text-gray-300 uppercase tracking-wider">
                            Important Notes
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                                <span>Runs entirely on <strong className="text-gray-900 dark:text-gray-100">Google Gemini</strong></span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                                <span>You control your own API usage and costs</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-purple-600 dark:text-purple-400 mt-0.5">•</span>
                                <span>Requires a <strong className="text-gray-900 dark:text-gray-100">Gemini API key</strong></span>
                            </li>
                        </ul>
                    </div>

                    {/* Links */}
                    <div className="pt-2 space-y-2">
                        <a
                            href="https://ai.google.dev/gemini-api/docs"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                        >
                            → Learn more about Google Gemini API
                        </a>
                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block text-sm font-semibold text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
                        >
                            → Get your Gemini API key
                        </a>
                    </div>
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        onClick={onClose}
                        className="w-full px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                    >
                        Got it!
                    </button>
                </div>
            </div>
        </div>
    );
};

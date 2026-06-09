import React from 'react';
import { Languages, PanelLeftClose } from 'lucide-react';
import clsx from 'clsx';
import { TranslateSettings, TransliterationFormat } from '../types';

interface TranslatePanelProps {
  settings: TranslateSettings;
  onChange: (settings: TranslateSettings) => void;
  onClose: () => void;
  disabled?: boolean;
}

const TRANSLITERATION_FORMATS: TransliterationFormat[] = ['Roman Letters', 'Native Script', 'Custom'];

export const TranslatePanel: React.FC<TranslatePanelProps> = ({
  settings,
  onChange,
  onClose,
  disabled,
}) => {
  const update = (patch: Partial<TranslateSettings>) => onChange({ ...settings, ...patch });

  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Languages size={13} /> Translation Settings
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Close sidebar"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Source Language</label>
          <input
            value={settings.sourceLanguage}
            onChange={(event) => update({ sourceLanguage: event.target.value })}
            disabled={disabled}
            placeholder="Auto Detect"
            className="w-full text-sm p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Target Language</label>
          <input
            value={settings.targetLanguage}
            onChange={(event) => update({ targetLanguage: event.target.value })}
            disabled={disabled}
            placeholder="English"
            className="w-full text-sm p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
          />
        </div>

        <div className="p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Enable Transliteration</p>
              <p className="text-xs text-gray-400 mt-0.5">
                Include pronounceable output alongside the translation.
              </p>
            </div>
            <button
              onClick={() => update({ transliterationEnabled: !settings.transliterationEnabled })}
              disabled={disabled}
              className={clsx(
                'w-11 h-6 rounded-full transition-colors relative flex-shrink-0 disabled:opacity-50',
                settings.transliterationEnabled ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
              )}
            >
              <div
                className={clsx(
                  'w-4 h-4 bg-white rounded-full absolute top-1 transition-transform',
                  settings.transliterationEnabled ? 'left-6' : 'left-1'
                )}
              />
            </button>
          </div>
        </div>

        {settings.transliterationEnabled && (
          <div className="space-y-3 p-4 rounded-xl border border-purple-100 dark:border-purple-900/30 bg-purple-50/60 dark:bg-purple-900/10">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Transliteration Output Format
              </label>
              <select
                value={settings.transliterationFormat}
                onChange={(event) => update({ transliterationFormat: event.target.value as TransliterationFormat })}
                disabled={disabled}
                className="w-full text-sm p-3 rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
              >
                {TRANSLITERATION_FORMATS.map((format) => (
                  <option key={format} value={format}>
                    {format}
                  </option>
                ))}
              </select>
            </div>

            {settings.transliterationFormat === 'Custom' && (
              <textarea
                value={settings.customTransliterationFormat}
                onChange={(event) => update({ customTransliterationFormat: event.target.value })}
                placeholder="Describe the transliteration format you want."
                className="w-full h-24 p-3 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none resize-none"
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
};

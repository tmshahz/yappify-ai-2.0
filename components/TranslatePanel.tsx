import React from 'react';
import { Languages, PanelLeftClose } from 'lucide-react';
import clsx from 'clsx';
import { TranslateSettings, TransliterationFormat } from '../types';
import { PanelFooterLinks } from './PanelFooterLinks';

interface TranslatePanelProps {
  settings: TranslateSettings;
  onChange: (settings: TranslateSettings) => void;
  onClose: () => void;
  onInfoOpen: () => void;
  disabled?: boolean;
}

const TRANSLITERATION_FORMATS: TransliterationFormat[] = ['Roman Letters', 'Native Script', 'Custom'];

export const TranslatePanel: React.FC<TranslatePanelProps> = ({
  settings,
  onChange,
  onClose,
  onInfoOpen,
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
          <label className="text-sm font-medium text-gray-700 dark:text-[var(--yap-text-2)]">Source Language</label>
          <input
            value={settings.sourceLanguage}
            onChange={(event) => update({ sourceLanguage: event.target.value })}
            disabled={disabled}
            placeholder="Auto Detect"
            className="yap-glass-input w-full text-sm p-3 rounded-lg border border-gray-200 dark:border-[var(--yap-glass-border)] bg-white dark:bg-[var(--yap-surface-3)] dark:text-[var(--yap-text-1)] focus:ring-2 focus:ring-purple-500/50 outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-700 dark:text-[var(--yap-text-2)]">Target Language</label>
          <input
            value={settings.targetLanguage}
            onChange={(event) => update({ targetLanguage: event.target.value })}
            disabled={disabled}
            placeholder="English"
            className="yap-glass-input w-full text-sm p-3 rounded-lg border border-gray-200 dark:border-[var(--yap-glass-border)] bg-white dark:bg-[var(--yap-surface-3)] dark:text-[var(--yap-text-1)] focus:ring-2 focus:ring-purple-500/50 outline-none"
          />
        </div>

        <div className="yap-glass-card p-4 rounded-xl border border-gray-200 dark:border-[var(--yap-glass-border)] bg-white dark:bg-[rgba(255,255,255,0.035)]">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-gray-700 dark:text-[var(--yap-text-1)]">Enable Transliteration</p>
              <p className="text-xs text-gray-400 dark:text-[var(--yap-text-2)] mt-0.5">
                Include pronounceable output alongside the translation.
              </p>
            </div>
            <button
              onClick={() => update({ transliterationEnabled: !settings.transliterationEnabled })}
              disabled={disabled}
              className={clsx(
                'w-11 h-6 rounded-full transition-colors relative flex-shrink-0 disabled:opacity-50',
                settings.transliterationEnabled ? 'bg-purple-600 dark:bg-[var(--yap-violet)]' : 'bg-gray-200 dark:bg-[var(--yap-surface-3)]'
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
          <div className="yap-glass-card space-y-3 p-4 rounded-xl border border-purple-100 dark:border-[var(--yap-active-border)] bg-purple-50/60 dark:bg-[var(--yap-violet-mist)]">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 dark:text-[var(--yap-text-2)]">
                Transliteration Output Format
              </label>
              <select
                value={settings.transliterationFormat}
                onChange={(event) => update({ transliterationFormat: event.target.value as TransliterationFormat })}
                disabled={disabled}
                className="yap-glass-input w-full text-sm p-3 rounded-lg border border-gray-200 dark:border-[var(--yap-glass-border)] bg-white dark:bg-[var(--yap-surface-3)] dark:text-[var(--yap-text-1)] focus:ring-2 focus:ring-purple-500/50 outline-none"
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
                className="yap-glass-input w-full h-24 p-3 text-sm rounded-lg border border-gray-200 dark:border-[var(--yap-glass-border)] bg-white dark:bg-[var(--yap-surface-3)] dark:text-[var(--yap-text-1)] focus:ring-2 focus:ring-purple-500/50 outline-none resize-none"
              />
            )}
          </div>
        )}
      </div>

      <PanelFooterLinks onInfoOpen={onInfoOpen} />
    </div>
  );
};

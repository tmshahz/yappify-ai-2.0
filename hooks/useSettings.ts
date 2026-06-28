import { useEffect, useState } from 'react';
import { SettingsData } from '../types';
import { LEGACY_KEYS, readLegacyStorage, readStorage, STORAGE_KEYS, writeStorage } from '../lib/storage';
import { DEFAULT_MODEL_ID, isSupportedGeminiModelId } from '../services/geminiService';

export const DEFAULT_SETTINGS: SettingsData = {
  theme: 'dark',
  apiKey: '',
  microphoneId: '',
  saveApiKey: false,
  modelId: DEFAULT_MODEL_ID,
};

type LegacySettings = Partial<SettingsData> & {
  liveTranscription?: boolean;
  modelId?: string;
};

type StoredSettings = Partial<Omit<SettingsData, 'modelId'>> & {
  modelId?: string;
};

function normalizeSettings(settings: StoredSettings | null | undefined): SettingsData {
  return {
    ...DEFAULT_SETTINGS,
    ...settings,
    theme: settings?.theme === 'light' ? 'light' : settings?.theme === 'dark' ? 'dark' : DEFAULT_SETTINGS.theme,
    apiKey: typeof settings?.apiKey === 'string' ? settings.apiKey : DEFAULT_SETTINGS.apiKey,
    microphoneId:
      typeof settings?.microphoneId === 'string'
        ? settings.microphoneId
        : DEFAULT_SETTINGS.microphoneId,
    saveApiKey: Boolean(settings?.saveApiKey),
    modelId:
      typeof settings?.modelId === 'string' && isSupportedGeminiModelId(settings.modelId)
        ? settings.modelId
        : DEFAULT_MODEL_ID,
  };
}

function migrateSettings(): SettingsData | null {
  const legacy = readLegacyStorage<LegacySettings>(LEGACY_KEYS.settings);
  if (!legacy) return null;

  return normalizeSettings({
    ...legacy,
    apiKey: legacy.saveApiKey ? legacy.apiKey ?? '' : '',
  });
}

function hasStoredSettings(): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(STORAGE_KEYS.settings) !== null;
}

function applyTheme(theme: SettingsData['theme']) {
  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
    document.body.classList.add('bg-black');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('bg-black');
  }
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsData>(() => {
    const initial = (() => {
      if (hasStoredSettings()) {
        return normalizeSettings(readStorage<StoredSettings>(STORAGE_KEYS.settings, DEFAULT_SETTINGS));
      }

      const migrated = migrateSettings();
      if (migrated) {
        writeStorage(STORAGE_KEYS.settings, migrated);
        return migrated;
      }

      return DEFAULT_SETTINGS;
    })();

    applyTheme(initial.theme);
    return initial;
  });

  useEffect(() => {
    const toSave = settings.saveApiKey ? settings : { ...settings, apiKey: '' };
    writeStorage(STORAGE_KEYS.settings, toSave);

    applyTheme(settings.theme);
  }, [settings]);

  return { settings, setSettings };
}

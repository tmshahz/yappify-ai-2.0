import { useEffect, useState } from 'react';
import { SettingsData } from '../types';
import { LEGACY_KEYS, readLegacyStorage, readStorage, STORAGE_KEYS, writeStorage } from '../lib/storage';
import { DEFAULT_MODEL_ID } from '../services/geminiService';

export const DEFAULT_SETTINGS: SettingsData = {
  theme: 'light',
  apiKey: '',
  microphoneId: '',
  saveApiKey: false,
  modelId: DEFAULT_MODEL_ID,
};

type LegacySettings = Partial<SettingsData> & {
  liveTranscription?: boolean;
};

function migrateSettings(): SettingsData | null {
  const legacy = readLegacyStorage<LegacySettings>(LEGACY_KEYS.settings);
  if (!legacy) return null;

  return {
    ...DEFAULT_SETTINGS,
    ...legacy,
    apiKey: legacy.saveApiKey ? legacy.apiKey ?? '' : '',
    modelId: legacy.modelId?.startsWith('gemini-2.5') ? legacy.modelId : DEFAULT_MODEL_ID,
  };
}

export function useSettings() {
  const [settings, setSettings] = useState<SettingsData>(() => {
    const migrated = migrateSettings();
    return migrated ?? readStorage<SettingsData>(STORAGE_KEYS.settings, DEFAULT_SETTINGS);
  });

  useEffect(() => {
    const toSave = settings.saveApiKey ? settings : { ...settings, apiKey: '' };
    writeStorage(STORAGE_KEYS.settings, toSave);

    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-black');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-black');
    }
  }, [settings]);

  return { settings, setSettings };
}

import { PromptMode } from '../types';
import type { CustomModeData } from '../types';
import { LEGACY_KEYS, readLegacyText, STORAGE_KEYS } from '../lib/storage';
import { useLocalStorageState } from './useLocalStorageState';

export const DEFAULT_CUSTOM_MODES: CustomModeData[] = [
  {
    id: PromptMode.CUSTOM_1,
    title: 'Custom Mode 1',
    instructions: '',
  },
  {
    id: PromptMode.CUSTOM_2,
    title: 'Custom Mode 2',
    instructions: '',
  },
  {
    id: PromptMode.CUSTOM_3,
    title: 'Custom Mode 3',
    instructions: '',
  },
];

function migrateCustomModes(): CustomModeData[] | null {
  const legacyPrompt = readLegacyText(LEGACY_KEYS.customPrompt);
  if (!legacyPrompt) return null;

  return DEFAULT_CUSTOM_MODES.map((mode, index) => ({
    ...mode,
    instructions: index === 0 ? legacyPrompt : mode.instructions,
  }));
}

export function useCustomModes() {
  const [customModes, setCustomModes] = useLocalStorageState<CustomModeData[]>(
    STORAGE_KEYS.customModes,
    DEFAULT_CUSTOM_MODES,
    migrateCustomModes
  );

  const updateCustomMode = (updated: CustomModeData) => {
    setCustomModes((prev) => prev.map((mode) => (mode.id === updated.id ? updated : mode)));
  };

  const resetCustomMode = (id: CustomModeData['id']) => {
    const fallback = DEFAULT_CUSTOM_MODES.find((mode) => mode.id === id);
    if (!fallback) return;
    updateCustomMode(fallback);
  };

  return { customModes, updateCustomMode, resetCustomMode };
}

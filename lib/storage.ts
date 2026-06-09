export const STORAGE_KEYS = {
  settings: 'yappify.v2.settings',
  customModes: 'yappify.v2.customModes',
  history: 'yappify.v2.history',
  analytics: 'yappify.v2.analytics',
  prefs: 'yappify.v2.prefs',
} as const;

export const LEGACY_KEYS = {
  settings: 'yappify_settings',
  customPrompt: 'yappify_custom_prompt',
} as const;

export function readStorage<T>(key: string, fallback: T): T {
  if (typeof localStorage === 'undefined') return fallback;

  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch (error) {
    console.warn(`Failed to read ${key} from localStorage`, error);
    return fallback;
  }
}

export function writeStorage<T>(key: string, value: T): void {
  if (typeof localStorage === 'undefined') return;

  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (error) {
    console.warn(`Failed to write ${key} to localStorage`, error);
  }
}

export function readLegacyStorage<T>(key: string): T | null {
  if (typeof localStorage === 'undefined') return null;

  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function readLegacyText(key: string): string | null {
  if (typeof localStorage === 'undefined') return null;
  return localStorage.getItem(key);
}

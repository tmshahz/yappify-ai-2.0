import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { readStorage, writeStorage } from '../lib/storage';

function hasStoredValue(key: string): boolean {
  if (typeof localStorage === 'undefined') return false;
  return localStorage.getItem(key) !== null;
}

export function useLocalStorageState<T>(
  key: string,
  fallback: T,
  migrate?: () => T | null
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    if (hasStoredValue(key)) {
      return readStorage<T>(key, fallback);
    }

    const migrated = migrate?.();
    if (migrated) {
      writeStorage(key, migrated);
      return migrated;
    }

    return fallback;
  });

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}

import { useEffect, useState } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { readStorage, writeStorage } from '../lib/storage';

export function useLocalStorageState<T>(
  key: string,
  fallback: T,
  migrate?: () => T | null
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => {
    const migrated = migrate?.();
    return migrated ?? readStorage<T>(key, fallback);
  });

  useEffect(() => {
    writeStorage(key, value);
  }, [key, value]);

  return [value, setValue];
}

import { HistoryItem } from '../types';
import { STORAGE_KEYS } from '../lib/storage';
import { useLocalStorageState } from './useLocalStorageState';

const MAX_HISTORY_ITEMS = 100;

export function useHistory() {
  const [history, setHistory] = useLocalStorageState<HistoryItem[]>(STORAGE_KEYS.history, []);

  const addHistoryItem = (item: HistoryItem) => {
    setHistory((prev) => [...prev, item].slice(-MAX_HISTORY_ITEMS));
  };

  const deleteHistoryItem = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
  };

  const clearHistory = () => setHistory([]);

  return { history, addHistoryItem, deleteHistoryItem, clearHistory };
}

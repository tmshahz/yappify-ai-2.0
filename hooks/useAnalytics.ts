import { AnalyticsRecord, ApiUsage } from '../types';
import { STORAGE_KEYS } from '../lib/storage';
import { useLocalStorageState } from './useLocalStorageState';

const MAX_ANALYTICS_RECORDS = 500;

const EMPTY_USAGE: ApiUsage = {
  calls: 0,
  inputTokens: 0,
  outputTokens: 0,
  tokens: 0,
  cost: 0,
};

export function summarizeAnalytics(records: AnalyticsRecord[]): ApiUsage {
  if (!Array.isArray(records)) return EMPTY_USAGE;

  return records.reduce<ApiUsage>(
    (summary, record) => ({
      calls: summary.calls + 1,
      inputTokens: summary.inputTokens + (Number(record?.inputTokens) || 0),
      outputTokens: summary.outputTokens + (Number(record?.outputTokens) || 0),
      tokens: summary.tokens + (Number(record?.tokens) || 0),
      cost: summary.cost + (Number(record?.cost) || 0),
    }),
    EMPTY_USAGE
  );
}

export function useAnalytics() {
  const [analytics, setAnalytics] = useLocalStorageState<AnalyticsRecord[]>(
    STORAGE_KEYS.analytics,
    []
  );

  const addAnalyticsRecord = (record: AnalyticsRecord) => {
    setAnalytics((prev) => [...prev, record].slice(-MAX_ANALYTICS_RECORDS));
  };

  const clearAnalytics = () => setAnalytics([]);
  const usage = summarizeAnalytics(analytics);

  return { analytics, usage, addAnalyticsRecord, clearAnalytics };
}

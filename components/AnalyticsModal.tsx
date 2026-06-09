import React from 'react';
import { BarChart3, Trash2 } from 'lucide-react';
import { AnalyticsRecord, ApiUsage } from '../types';
import { getAppModeLabel } from '../utils/labels';
import { Modal } from './Modal';

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  records: AnalyticsRecord[];
  usage: ApiUsage;
  onClear: () => void;
}

export const AnalyticsModal: React.FC<AnalyticsModalProps> = ({
  isOpen,
  onClose,
  records,
  usage,
  onClear,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      title="Analytics"
      onClose={onClose}
      maxWidth="xl"
      icon={
        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
          <BarChart3 size={18} className="text-purple-600 dark:text-purple-400" />
        </div>
      }
      footer={
        <div className="flex justify-between items-center gap-3">
          <p className="text-xs text-gray-400">
            Costs are estimates from Gemini usage metadata and configurable pricing constants.
          </p>
          <button
            onClick={onClear}
            disabled={records.length === 0}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-40 text-xs font-bold"
          >
            <Trash2 size={14} /> Clear
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 text-center">
          <Metric label="Calls" value={usage.calls.toLocaleString()} />
          <Metric label="Input Tokens" value={usage.inputTokens.toLocaleString()} />
          <Metric label="Output Tokens" value={usage.outputTokens.toLocaleString()} />
          <Metric label="Est. Cost" value={`$${usage.cost.toFixed(4)}`} />
        </div>

        <div className="space-y-2">
          <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Recent Calls</h3>
          <div className="max-h-80 overflow-y-auto custom-scrollbar space-y-2 pr-2">
            {records.length === 0 ? (
              <div className="rounded-xl border border-gray-100 dark:border-gray-800 p-6 text-center text-sm text-gray-400">
                No analytics recorded yet.
              </div>
            ) : (
              records.slice().reverse().map((record) => (
                <div
                  key={record.id}
                  className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {record.action}
                      </p>
                      <p className="text-xs text-gray-400">
                        {getAppModeLabel(record.appMode)} · {new Date(record.timestamp).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-gray-800 dark:text-gray-100">
                        ${record.cost.toFixed(4)}
                      </p>
                      <p className="text-xs text-gray-400">
                        {record.tokens.toLocaleString()} tokens
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-xl bg-gray-50 dark:bg-gray-800/50 p-4">
    <div className="text-lg font-bold text-gray-900 dark:text-white">{value}</div>
    <div className="text-[10px] text-gray-500 uppercase mt-1">{label}</div>
  </div>
);

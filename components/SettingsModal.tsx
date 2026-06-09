import React, { useEffect, useMemo, useState } from 'react';
import { BarChart3, Cpu, Mic, Moon, Settings, Sun, Trash2 } from 'lucide-react';
import clsx from 'clsx';
import { ApiUsage, SettingsData } from '../types';
import {
  CURATED_GEMINI_MODELS,
  DEFAULT_MODEL_ID,
  fetchAvailableModels,
} from '../services/geminiService';
import { Modal } from './Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsData;
  onUpdateSettings: (settings: SettingsData) => void;
  usage: ApiUsage;
  onOpenAnalytics: () => void;
}

function normalizeSettings(settings: SettingsData): SettingsData {
  return {
    theme: settings?.theme === 'dark' ? 'dark' : 'light',
    apiKey: typeof settings?.apiKey === 'string' ? settings.apiKey : '',
    microphoneId: typeof settings?.microphoneId === 'string' ? settings.microphoneId : '',
    saveApiKey: Boolean(settings?.saveApiKey),
    modelId:
      typeof settings?.modelId === 'string' && settings.modelId.length > 0
        ? settings.modelId
        : DEFAULT_MODEL_ID,
  };
}

function safeUsage(usage?: ApiUsage): ApiUsage {
  const calls = Number(usage?.calls);
  const inputTokens = Number(usage?.inputTokens);
  const outputTokens = Number(usage?.outputTokens);
  const tokens = Number(usage?.tokens);
  const cost = Number(usage?.cost);

  return {
    calls: Number.isFinite(calls) ? calls : 0,
    inputTokens: Number.isFinite(inputTokens) ? inputTokens : 0,
    outputTokens: Number.isFinite(outputTokens) ? outputTokens : 0,
    tokens: Number.isFinite(tokens) ? tokens : 0,
    cost: Number.isFinite(cost) ? cost : 0,
  };
}

function formatUsageSummary(usage: ApiUsage): string {
  const safe = safeUsage(usage);
  return `${safe.calls} calls · ${safe.tokens.toLocaleString()} est. tokens · $${safe.cost.toFixed(4)}`;
}

class SettingsContentErrorBoundary extends React.Component<
  { children: React.ReactNode; onClose: () => void },
  { hasError: boolean }
> {
  constructor(props: { children: React.ReactNode; onClose: () => void }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('[SettingsModal] render error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="space-y-4">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Something went wrong while loading settings. You can close this dialog and try again.
          </p>
          <button
            type="button"
            onClick={this.props.onClose}
            className="w-full rounded-lg bg-purple-600 px-4 py-2 text-sm font-semibold text-white hover:bg-purple-700"
          >
            Close Settings
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

const SettingsModalContent: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  usage,
  onOpenAnalytics,
}) => {
  const safeSettings = useMemo(() => normalizeSettings(settings), [settings]);
  const safeUsageValues = useMemo(() => safeUsage(usage), [usage]);

  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);
  const [availableModelIds, setAvailableModelIds] = useState<string[]>([]);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const mediaDevices = navigator.mediaDevices;
    if (!mediaDevices?.enumerateDevices) {
      setMicrophones([]);
      return;
    }

    mediaDevices
      .enumerateDevices()
      .then((devices) => setMicrophones(devices.filter((device) => device.kind === 'audioinput')))
      .catch((error) => {
        console.warn('[SettingsModal] enumerateDevices failed:', error);
        setMicrophones([]);
      });
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    const loadModels = async () => {
      if (!safeSettings.apiKey || safeSettings.apiKey.length < 30) {
        setAvailableModelIds([]);
        setLoadingModels(false);
        return;
      }

      setLoadingModels(true);
      try {
        const models = await fetchAvailableModels(safeSettings.apiKey);
        if (!cancelled) {
          setAvailableModelIds(models.map((model) => model.name));
        }
      } catch (error) {
        console.warn('[SettingsModal] fetchAvailableModels failed:', error);
        if (!cancelled) {
          setAvailableModelIds([]);
        }
      } finally {
        if (!cancelled) {
          setLoadingModels(false);
        }
      }
    };

    void loadModels();

    return () => {
      cancelled = true;
    };
  }, [isOpen, safeSettings.apiKey]);

  const curatedModels = useMemo(() => {
    if (availableModelIds.length === 0) return CURATED_GEMINI_MODELS;
    const liveModels = CURATED_GEMINI_MODELS.filter((model) =>
      availableModelIds.includes(model.name)
    );
    return liveModels.length > 0 ? liveModels : CURATED_GEMINI_MODELS;
  }, [availableModelIds]);

  const selectedUnavailable =
    availableModelIds.length > 0 && !availableModelIds.includes(safeSettings.modelId);

  const handleDeleteKey = () => {
    onUpdateSettings({ ...safeSettings, apiKey: '' });
  };

  return (
    <Modal
      isOpen={isOpen}
      title="Settings"
      onClose={onClose}
      align="start"
      maxWidth="md"
      icon={
        <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900/30">
          <Settings size={18} className="text-purple-600 dark:text-purple-400" />
        </div>
      }
    >
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
          <div className="flex rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...safeSettings, theme: 'light' })}
              className={clsx(
                'rounded-md p-1.5 transition-all',
                safeSettings.theme === 'light' ? 'bg-white text-black shadow-sm' : 'text-gray-400'
              )}
            >
              <Sun size={16} />
            </button>
            <button
              type="button"
              onClick={() => onUpdateSettings({ ...safeSettings, theme: 'dark' })}
              className={clsx(
                'rounded-md p-1.5 transition-all',
                safeSettings.theme === 'dark' ? 'bg-gray-700 text-white shadow-sm' : 'text-gray-400'
              )}
            >
              <Moon size={16} />
            </button>
          </div>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Mic size={14} /> Microphone
          </label>
          <select
            value={safeSettings.microphoneId}
            onChange={(event) =>
              onUpdateSettings({ ...safeSettings, microphoneId: event.target.value })
            }
            className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            <option value="">Default Microphone</option>
            {microphones.map((mic) => (
              <option key={mic.deviceId || mic.label} value={mic.deviceId}>
                {mic.label || `Microphone ${(mic.deviceId || 'device').slice(0, 5)}...`}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-700 dark:text-gray-300">
            <Cpu size={14} /> AI Model
            {loadingModels && (
              <span className="text-xs text-gray-400">(Checking availability...)</span>
            )}
          </label>
          <select
            value={safeSettings.modelId}
            onChange={(event) => onUpdateSettings({ ...safeSettings, modelId: event.target.value })}
            className="w-full rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
          >
            {curatedModels.map((model) => (
              <option key={model.name} value={model.name}>
                {model.displayName} - {model.description}
              </option>
            ))}
          </select>
          <p className="text-xs text-gray-400">
            Yappify is tuned for Gemini 2.5 Flash. Future 2.5+ Flash models can be added here
            without silently changing your selection.
          </p>
          {selectedUnavailable && (
            <p className="text-xs text-red-500">
              The selected model was not returned by your API key. Choose an available 2.5+ Flash
              model before processing.
            </p>
          )}
        </div>

        <div className="space-y-3 border-t border-gray-100 pt-4 dark:border-gray-800">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Gemini API Key
            </label>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">Save locally</span>
              <button
                type="button"
                onClick={() =>
                  onUpdateSettings({ ...safeSettings, saveApiKey: !safeSettings.saveApiKey })
                }
                className={clsx(
                  'relative h-5 w-9 rounded-full transition-colors',
                  safeSettings.saveApiKey ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
                )}
              >
                <div
                  className={clsx(
                    'absolute top-1 h-3 w-3 rounded-full bg-white transition-transform',
                    safeSettings.saveApiKey ? 'left-5' : 'left-1'
                  )}
                />
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <input
              type="password"
              value={safeSettings.apiKey}
              onChange={(event) => onUpdateSettings({ ...safeSettings, apiKey: event.target.value })}
              placeholder="Enter your Gemini API Key"
              className="min-w-0 flex-1 rounded-lg border border-gray-200 bg-gray-50 p-2 text-sm outline-none focus:ring-2 focus:ring-purple-500/50 dark:border-gray-700 dark:bg-gray-800 dark:text-white"
            />
            <button
              type="button"
              onClick={handleDeleteKey}
              title="Delete API Key"
              className="rounded-lg border border-gray-200 p-2 text-red-500 transition-colors hover:bg-red-50 dark:border-gray-700 dark:hover:bg-red-900/20"
            >
              <Trash2 size={18} />
            </button>
          </div>
          <p className="text-xs text-gray-400">
            {safeSettings.saveApiKey
              ? "Key is saved in your browser's local storage."
              : 'Key is only held in memory for this session.'}
          </p>
        </div>

        <button
          type="button"
          onClick={onOpenAnalytics}
          className="flex w-full items-center justify-between gap-4 rounded-xl border border-gray-200 bg-gray-50 p-4 transition-colors hover:border-purple-300 dark:border-gray-800 dark:bg-gray-800/50 dark:hover:border-purple-700"
        >
          <span className="flex items-center gap-3 text-left">
            <span className="rounded-lg bg-purple-100 p-2 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
              <BarChart3 size={18} />
            </span>
            <span>
              <span className="block text-sm font-semibold text-gray-800 dark:text-gray-100">
                Usage Analytics
              </span>
              <span className="block text-xs text-gray-400">{formatUsageSummary(safeUsageValues)}</span>
            </span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">
            View
          </span>
        </button>
      </div>
    </Modal>
  );
};

export const SettingsModal: React.FC<SettingsModalProps> = (props) => {
  if (!props.isOpen) return null;

  return (
    <SettingsContentErrorBoundary onClose={props.onClose}>
      <SettingsModalContent {...props} />
    </SettingsContentErrorBoundary>
  );
};

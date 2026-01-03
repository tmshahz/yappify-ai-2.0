import React, { useEffect, useState } from 'react';
import { SettingsData, ApiUsage } from '../types';
import { X, Moon, Sun, Mic, Trash2, Cpu } from 'lucide-react';
import clsx from 'clsx';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: SettingsData;
  onUpdateSettings: (s: SettingsData) => void;
  usage: ApiUsage;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  usage
}) => {
  const [microphones, setMicrophones] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    if (isOpen) {
      navigator.mediaDevices.enumerateDevices().then(devices => {
        setMicrophones(devices.filter(d => d.kind === 'audioinput'));
      });
    }
  }, [isOpen]);

  const handleDeleteKey = () => {
    onUpdateSettings({ ...settings, apiKey: '' });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white dark:bg-gray-900 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-gray-100 dark:border-gray-800 flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex justify-between items-center bg-gray-50/50 dark:bg-gray-800/20">
          <h2 className="text-lg font-semibold dark:text-white">Settings</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors">
            <X size={20} className="text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
          
          {/* Theme */}
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Theme</span>
            <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'light' })}
                className={clsx("p-1.5 rounded-md transition-all", settings.theme === 'light' ? 'bg-white shadow-sm text-black' : 'text-gray-400')}
              >
                <Sun size={16} />
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, theme: 'dark' })}
                className={clsx("p-1.5 rounded-md transition-all", settings.theme === 'dark' ? 'bg-gray-700 shadow-sm text-white' : 'text-gray-400')}
              >
                <Moon size={16} />
              </button>
            </div>
          </div>

          {/* Live Transcription Toggle */}
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Live Transcription</span>
              <p className="text-xs text-gray-400 mt-0.5">Best effort preview during recording</p>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, liveTranscription: !settings.liveTranscription })}
              className={clsx(
                "w-11 h-6 rounded-full transition-colors relative",
                settings.liveTranscription ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
              )}
            >
              <div className={clsx(
                "w-4 h-4 bg-white rounded-full absolute top-1 transition-transform",
                settings.liveTranscription ? "left-6" : "left-1"
              )} />
            </button>
          </div>

          {/* Microphone Select */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Mic size={14} /> Microphone
            </label>
            <select
              value={settings.microphoneId}
              onChange={(e) => onUpdateSettings({ ...settings, microphoneId: e.target.value })}
              className="w-full text-sm p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
            >
              <option value="">Default Microphone</option>
              {microphones.map(mic => (
                <option key={mic.deviceId} value={mic.deviceId}>
                  {mic.label || `Microphone ${mic.deviceId.slice(0, 5)}...`}
                </option>
              ))}
            </select>
          </div>

          {/* Model ID (Dropdown) */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
              <Cpu size={14} /> AI Model
            </label>
            <div className="relative">
              <select
                value={settings.modelId}
                onChange={(e) => onUpdateSettings({ ...settings, modelId: e.target.value })}
                className="w-full text-sm p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none appearance-none"
              >
                <option value="gemini-1.5-flash">Gemini 1.5 Flash (Fast & Efficient)</option>
                <option value="gemini-1.5-pro">Gemini 1.5 Pro (Reasoning & Quality)</option>
              </select>
              {/* Custom arrow for better UI consistency */}
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <svg width="10" height="6" viewBox="0 0 10 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m1 1 4 4 4-4"/></svg>
              </div>
            </div>
            <p className="text-xs text-gray-400">
                Use <strong>Flash</strong> for speed, <strong>Pro</strong> for complex prompt structuring.
            </p>
          </div>

          {/* API Key */}
          <div className="space-y-3 pt-4 border-t border-gray-100 dark:border-gray-800">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Gemini API Key</label>
              <div className="flex items-center gap-2">
                <span className="text-xs text-gray-500">Save locally</span>
                <button
                    onClick={() => onUpdateSettings({ ...settings, saveApiKey: !settings.saveApiKey })}
                    className={clsx(
                    "w-9 h-5 rounded-full transition-colors relative",
                    settings.saveApiKey ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
                    )}
                >
                    <div className={clsx(
                    "w-3 h-3 bg-white rounded-full absolute top-1 transition-transform",
                    settings.saveApiKey ? "left-5" : "left-1"
                    )} />
                </button>
              </div>
            </div>
            
            <div className="flex gap-2">
                <input
                    type="password"
                    value={settings.apiKey}
                    onChange={(e) => onUpdateSettings({ ...settings, apiKey: e.target.value })}
                    placeholder="Enter your Gemini API Key"
                    className="flex-1 text-sm p-2 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 dark:text-white focus:ring-2 focus:ring-purple-500/50 outline-none"
                />
                <button 
                    onClick={handleDeleteKey}
                    title="Delete API Key"
                    className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors border border-gray-200 dark:border-gray-700"
                >
                    <Trash2 size={18} />
                </button>
            </div>
            <p className="text-xs text-gray-400">
                {settings.saveApiKey 
                    ? "Key is saved in your browser's local storage." 
                    : "Key is only held in memory for this session."}
            </p>
          </div>
        </div>

        {/* Footer: Usage Stats */}
        <div className="bg-gray-50 dark:bg-gray-800/50 p-6 border-t border-gray-100 dark:border-gray-800">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">Session Activity</h3>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{usage.calls}</div>
              <div className="text-[10px] text-gray-500 uppercase">Calls</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">{usage.tokens.toLocaleString()}</div>
              <div className="text-[10px] text-gray-500 uppercase">Est. Tokens</div>
            </div>
            <div>
              <div className="text-lg font-bold text-gray-900 dark:text-white">${usage.cost.toFixed(4)}</div>
              <div className="text-[10px] text-gray-500 uppercase">Est. Cost</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
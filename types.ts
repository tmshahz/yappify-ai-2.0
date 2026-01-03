export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  RECORDED = 'RECORDED',
  TRANSCRIBING = 'TRANSCRIBING',
  READY = 'READY',
  PROMPTIFYING = 'PROMPTIFYING',
  DONE = 'DONE',
}

export enum ViewMode {
  RAW = 'RAW',
  TRANSFORMED = 'TRANSFORMED',
}

export enum PromptMode {
  ENHANCER = 'Prompt Enhancer',
  DEEP = 'Deep Structuring',
  NOTES = 'Quick Notes',
  CUSTOM = 'Custom Mode',
}

export interface SettingsData {
  theme: 'light' | 'dark';
  liveTranscription: boolean;
  apiKey: string;
  microphoneId: string;
  saveApiKey: boolean;
  modelId: string; // Advanced: Model ID override
}

export interface ApiUsage {
  calls: number;
  tokens: number;
  cost: number;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  raw: string;
  transformed?: string;
  mode?: PromptMode;
}
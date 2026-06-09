export enum AppState {
  IDLE = 'IDLE',
  RECORDING = 'RECORDING',
  RECORDED = 'RECORDED',
  TRANSCRIBING = 'TRANSCRIBING',
  READY = 'READY',
  PROMPTIFYING = 'PROMPTIFYING',
  TRANSLATING = 'TRANSLATING',
  PROCESSING_UPLOAD = 'PROCESSING_UPLOAD',
  DONE = 'DONE',
}

export enum ViewMode {
  RAW = 'RAW',
  TRANSFORMED = 'TRANSFORMED',
}

export enum PromptMode {
  ENHANCER = 'prompt-enhancer',
  NOTES = 'quick-notes',
  CUSTOM_1 = 'custom-1',
  CUSTOM_2 = 'custom-2',
  CUSTOM_3 = 'custom-3',
}

export enum AppMode {
  SPEECH = 'speech-to-text',
  TRANSLATE = 'translate',
  UPLOAD = 'upload',
}

export type ThemeMode = 'light' | 'dark';

export type TransliterationFormat = 'Roman Letters' | 'Native Script' | 'Custom';

export type UploadProcessingType = 'raw-transcription' | 'speaker-transcript' | 'meeting-summary' | 'action-items';

export interface PromptModeDefinition {
  id: PromptMode;
  title: string;
  description: string;
  instructions: string;
  isCustom: boolean;
}

export interface SettingsData {
  theme: ThemeMode;
  apiKey: string;
  microphoneId: string;
  saveApiKey: boolean;
  modelId: string;
}

export interface ApiUsage {
  calls: number;
  inputTokens: number;
  outputTokens: number;
  tokens: number;
  cost: number;
}

export interface UsageResult {
  inputTokens: number;
  outputTokens: number;
  tokens: number;
  cost: number;
}

export interface AnalyticsRecord extends UsageResult {
  id: string;
  timestamp: number;
  appMode: AppMode;
  action: string;
  modelId: string;
}

export interface HistoryItem {
  id: string;
  timestamp: number;
  appMode: AppMode;
  modeLabel: string;
  raw: string;
  transformed?: string;
  promptMode?: PromptMode;
}

export interface CustomModeData {
  id: PromptMode.CUSTOM_1 | PromptMode.CUSTOM_2 | PromptMode.CUSTOM_3;
  title: string;
  instructions: string;
}

export interface TranslateSettings {
  sourceLanguage: string;
  targetLanguage: string;
  transliterationEnabled: boolean;
  transliterationFormat: TransliterationFormat;
  customTransliterationFormat: string;
}

export interface UploadSettings {
  processingType: UploadProcessingType;
}

export interface AppPrefs {
  activeMode: AppMode;
  promptMode: PromptMode;
  translate: TranslateSettings;
  upload: UploadSettings;
  showLeftPanel: boolean;
  showRightPanel: boolean;
}
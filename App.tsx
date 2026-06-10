import React, { useMemo, useRef, useState } from 'react';
import {
  Clock,
  Copy,
  Download,
  Languages,
  Loader2,
  Mic,
  PanelLeftOpen,
  PanelRightOpen,
  PenTool,
  Settings,
  Sparkles,
  Square,
  Trash2,
  Upload,
} from 'lucide-react';
import clsx from 'clsx';

import {
  AnalyticsRecord,
  AppMode,
  AppPrefs,
  AppState,
  CustomModeData,
  HistoryItem,
  PromptMode,
  PromptModeDefinition,
  UsageResult,
  ViewMode,
} from './types';
import {
  processUpload,
  transcribeAudio,
  transformText,
  translateText,
} from './services/geminiService';
import { STORAGE_KEYS } from './lib/storage';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { useSettings } from './hooks/useSettings';
import { useCustomModes } from './hooks/useCustomModes';
import { useHistory } from './hooks/useHistory';
import { useAnalytics } from './hooks/useAnalytics';
import { buildPromptModes, getPromptModeFallback } from './prompts';
import { getAppModeLabel, getUploadProcessingLabel } from './utils/labels';
import { Waveform } from './components/Waveform';
import { PromptifyPanel } from './components/PromptifyPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { SettingsModal } from './components/SettingsModal';
import { FileUploadModal } from './components/FileUploadModal';
import { InfoModal } from './components/InfoModal';
import { ModeSwitcher } from './components/ModeSwitcher';
import { CustomModeModal } from './components/CustomModeModal';
import { PromptModeInfoModal } from './components/PromptModeInfoModal';
import { TranslatePanel } from './components/TranslatePanel';
import { UploadPanel } from './components/UploadPanel';
import { HistoryPreviewModal } from './components/HistoryPreviewModal';
import { AnalyticsModal } from './components/AnalyticsModal';
import { OutputMarkdown } from './components/OutputMarkdown';

class MarkdownErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback: string },
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Markdown rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div className="whitespace-pre-wrap font-mono text-sm">{this.props.fallback}</div>;
    }

    return this.props.children;
  }
}

const DEFAULT_PREFS: AppPrefs = {
  activeMode: AppMode.SPEECH,
  promptMode: PromptMode.ENHANCER,
  translate: {
    sourceLanguage: 'Auto Detect',
    targetLanguage: 'English',
    transliterationEnabled: false,
    transliterationFormat: 'Roman Letters',
    customTransliterationFormat: '',
  },
  upload: {
    processingType: 'raw-transcription',
  },
  showLeftPanel: true,
  showRightPanel: true,
};

function normalizePrefs(prefs: AppPrefs): AppPrefs {
  return {
    ...DEFAULT_PREFS,
    ...prefs,
    translate: { ...DEFAULT_PREFS.translate, ...prefs.translate },
    upload: { ...DEFAULT_PREFS.upload, ...prefs.upload },
  };
}

function App() {
  const { settings, setSettings } = useSettings();
  const { customModes, updateCustomMode, resetCustomMode } = useCustomModes();
  const { history, addHistoryItem, deleteHistoryItem, clearHistory } = useHistory();
  const { analytics, usage, addAnalyticsRecord, clearAnalytics } = useAnalytics();
  const [storedPrefs, setStoredPrefs] = useLocalStorageState<AppPrefs>(STORAGE_KEYS.prefs, DEFAULT_PREFS);
  const prefs = normalizePrefs(storedPrefs);

  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.RAW);
  const [rawTranscript, setRawTranscript] = useState('');
  const [transformedTranscript, setTransformedTranscript] = useState('');
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [isInfoOpen, setIsInfoOpen] = useState(false);
  const [isAnalyticsOpen, setIsAnalyticsOpen] = useState(false);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);
  const [editingCustomMode, setEditingCustomMode] = useState<CustomModeData | null>(null);
  const [infoPromptMode, setInfoPromptMode] = useState<PromptModeDefinition | null>(null);
  const [previewHistoryItem, setPreviewHistoryItem] = useState<HistoryItem | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const promptModes = useMemo(() => buildPromptModes(customModes), [customModes]);
  const currentPromptMode =
    promptModes.find((mode) => mode.id === prefs.promptMode) ?? promptModes[0];

  const isProcessing =
    appState === AppState.TRANSCRIBING ||
    appState === AppState.PROMPTIFYING ||
    appState === AppState.TRANSLATING ||
    appState === AppState.PROCESSING_UPLOAD;
  const currentDisplay = viewMode === ViewMode.RAW ? rawTranscript : transformedTranscript;
  const hasWorkspaceContent = Boolean(rawTranscript || transformedTranscript || audioBlob || uploadedFile);
  const centerColSpan =
    12 - (prefs.showLeftPanel ? 3 : 0) - (prefs.showRightPanel ? 3 : 0);
  const centerColClass = {
    6: 'lg:col-span-6',
    9: 'lg:col-span-9',
    12: 'lg:col-span-12',
  }[centerColSpan] ?? 'lg:col-span-6';

  const updatePrefs = (patch: Partial<AppPrefs>) => {
    setStoredPrefs((prev) => normalizePrefs({ ...normalizePrefs(prev), ...patch }));
  };

  const sanitizeText = (text: string): string => {
    if (!text) return '';
    const maxLength = 50000;
    if (text.length > maxLength) {
      return `${text.substring(0, maxLength)}\n\n... (truncated for display)`;
    }
    return text;
  };

  const trackUsage = (result: UsageResult, action: string, appMode: AppMode) => {
    const record: AnalyticsRecord = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      appMode,
      action,
      modelId: settings.modelId,
      ...result,
    };
    addAnalyticsRecord(record);
  };

  const requireApiKey = () => {
    if (settings.apiKey) return true;
    setIsSettingsOpen(true);
    setError('API Key required.');
    return false;
  };

  const handleStartRecording = async () => {
    setError(null);
    try {
      const constraints: MediaStreamConstraints = {
        audio: settings.microphoneId ? { deviceId: settings.microphoneId } : true,
      };
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      setAudioStream(stream);
      const mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) chunksRef.current.push(event.data);
      };
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        setUploadedFile(null);
        setAppState(AppState.RECORDED);
        stream.getTracks().forEach((track) => track.stop());
        setAudioStream(null);
      };
      mediaRecorder.start();
      setAppState(AppState.RECORDING);
    } catch (err) {
      console.error(err);
      setError('Could not access microphone.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }
  };

  const toggleRecording = () => {
    if (appState === AppState.RECORDING) {
      handleStopRecording();
    } else {
      handleStartRecording();
    }
  };

  const handleTranscribe = async (): Promise<string | null> => {
    const sourceBlob = uploadedFile || audioBlob;
    if (!sourceBlob) {
      setError('Record or upload audio first.');
      return null;
    }
    if (!requireApiKey()) return null;

    setAppState(AppState.TRANSCRIBING);
    setError(null);
    setTransformedTranscript('');
    try {
      const result = await transcribeAudio(sourceBlob, settings.apiKey, settings.modelId);
      setRawTranscript(result.text);
      setAppState(AppState.READY);
      setViewMode(ViewMode.RAW);
      trackUsage(result.usage, 'Transcription', prefs.activeMode);
      if (uploadedFile) setUploadedFile(null);
      return result.text;
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Transcription failed.');
      setAppState(sourceBlob ? AppState.RECORDED : AppState.IDLE);
      return null;
    }
  };

  const handlePromptModeChange = (mode: PromptMode) => {
    updatePrefs({ promptMode: mode });
  };

  const handlePromptify = async () => {
    if (!rawTranscript) return;
    if (!requireApiKey()) return;

    setAppState(AppState.PROMPTIFYING);
    setError(null);
    try {
      const instructions = getPromptModeFallback(currentPromptMode);
      const result = await transformText(rawTranscript, instructions, settings.apiKey, settings.modelId);
      setTransformedTranscript(result.text);
      setAppState(AppState.DONE);
      setViewMode(ViewMode.TRANSFORMED);
      trackUsage(result.usage, currentPromptMode.title, AppMode.SPEECH);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Transformation failed.');
      setAppState(AppState.READY);
    }
  };

  const handleTranslate = async () => {
    if (!requireApiKey()) return;

    let input = rawTranscript;
    if (!input) {
      const transcript = await handleTranscribe();
      if (!transcript) return;
      input = transcript;
    }

    setAppState(AppState.TRANSLATING);
    setError(null);
    try {
      const result = await translateText(input, prefs.translate, settings.apiKey, settings.modelId);
      setTransformedTranscript(result.text);
      setAppState(AppState.DONE);
      setViewMode(ViewMode.TRANSFORMED);
      trackUsage(result.usage, 'Translation', AppMode.TRANSLATE);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Translation failed.');
      setAppState(AppState.READY);
    }
  };

  const handleProcessUpload = async () => {
    const sourceBlob = uploadedFile || audioBlob;
    if (!sourceBlob) {
      setIsFileUploadOpen(true);
      return;
    }
    if (!requireApiKey()) return;

    setAppState(AppState.PROCESSING_UPLOAD);
    setError(null);
    setTransformedTranscript('');
    try {
      const label = getUploadProcessingLabel(prefs.upload.processingType);

      if (
        prefs.upload.processingType === 'meeting-summary' ||
        prefs.upload.processingType === 'action-items'
      ) {
        const transcript = await transcribeAudio(sourceBlob, settings.apiKey, settings.modelId);
        setRawTranscript(transcript.text);
        trackUsage(transcript.usage, 'Upload Transcription', AppMode.UPLOAD);

        const result = await transformText(
          transcript.text,
          getUploadTransformInstructions(prefs.upload.processingType),
          settings.apiKey,
          settings.modelId
        );
        setTransformedTranscript(result.text);
        setViewMode(ViewMode.TRANSFORMED);
        setAppState(AppState.DONE);
        trackUsage(result.usage, label, AppMode.UPLOAD);
      } else {
        const result = await processUpload(sourceBlob, prefs.upload.processingType, settings.apiKey, settings.modelId);
        setRawTranscript(result.text);
        setViewMode(ViewMode.RAW);
        setAppState(AppState.READY);
        trackUsage(result.usage, label, AppMode.UPLOAD);
      }

      if (uploadedFile) setUploadedFile(null);
    } catch (err: any) {
      console.error(err);
      setError(err.message || 'Upload processing failed.');
      setAppState(AppState.RECORDED);
    }
  };

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setAudioBlob(null);
    setAppState(AppState.RECORDED);
  };

  const getUploadTransformInstructions = (type: AppPrefs['upload']['processingType']) => {
    if (type === 'meeting-summary') {
      return 'Create a structured media summary from this transcript. Include Summary, Key Points, Notable Details, Risks, and Follow-ups.';
    }
    if (type === 'action-items') {
      return 'Extract actionable meeting tasks from this transcript. Include task, owner if mentioned, due date if mentioned, and relevant context.';
    }
    return 'Clean up this transcript while preserving meaning.';
  };

  const getCurrentModeLabel = () => {
    if (prefs.activeMode === AppMode.SPEECH) {
      return transformedTranscript ? currentPromptMode.title : getAppModeLabel(AppMode.SPEECH);
    }
    if (prefs.activeMode === AppMode.UPLOAD) {
      return getUploadProcessingLabel(prefs.upload.processingType);
    }
    return getAppModeLabel(prefs.activeMode);
  };

  const handleClear = (save: boolean) => {
    if (save && (rawTranscript || transformedTranscript)) {
      addHistoryItem({
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        appMode: prefs.activeMode,
        modeLabel: getCurrentModeLabel(),
        raw: rawTranscript,
        transformed: transformedTranscript || undefined,
        promptMode: prefs.activeMode === AppMode.SPEECH ? prefs.promptMode : undefined,
      });
    }

    setRawTranscript('');
    setTransformedTranscript('');
    setAudioBlob(null);
    setUploadedFile(null);
    setAppState(AppState.IDLE);
    setViewMode(ViewMode.RAW);
    setIsConfirmClearOpen(false);
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setRawTranscript(item.raw);
    setTransformedTranscript(item.transformed || '');
    setViewMode(item.transformed ? ViewMode.TRANSFORMED : ViewMode.RAW);
    setAppState(item.transformed ? AppState.DONE : AppState.READY);
    updatePrefs({
      activeMode: item.appMode,
      promptMode: item.promptMode || prefs.promptMode,
    });
    setMobileRightOpen(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDisplay);
  };

  const handleDownload = () => {
    const blob = new Blob([currentDisplay], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yappify-${viewMode.toLowerCase()}-${Date.now()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const openCustomMode = (mode: PromptModeDefinition) => {
    const customMode = customModes.find((item) => item.id === mode.id);
    if (customMode) setEditingCustomMode(customMode);
  };

  const leftPanel = (
    <>
      {prefs.activeMode === AppMode.SPEECH && (
        <PromptifyPanel
          currentMode={prefs.promptMode}
          onModeChange={handlePromptModeChange}
          modes={promptModes}
          disabled={isProcessing}
          onClose={() => {
            if (mobileLeftOpen) setMobileLeftOpen(false);
            else updatePrefs({ showLeftPanel: false });
          }}
          onInfoOpen={() => {
            setIsInfoOpen(true);
            setMobileLeftOpen(false);
          }}
          onModeInfo={(mode) => setInfoPromptMode(mode)}
          onEditCustomMode={openCustomMode}
          onResetCustomMode={(mode) => resetCustomMode(mode.id as CustomModeData['id'])}
        />
      )}

      {prefs.activeMode === AppMode.TRANSLATE && (
        <TranslatePanel
          settings={prefs.translate}
          onChange={(translate) => updatePrefs({ translate })}
          disabled={isProcessing}
          onClose={() => {
            if (mobileLeftOpen) setMobileLeftOpen(false);
            else updatePrefs({ showLeftPanel: false });
          }}
          onInfoOpen={() => {
            setIsInfoOpen(true);
            setMobileLeftOpen(false);
          }}
        />
      )}

      {prefs.activeMode === AppMode.UPLOAD && (
        <UploadPanel
          settings={prefs.upload}
          onChange={(upload) => updatePrefs({ upload })}
          onUploadFile={() => {
            setIsFileUploadOpen(true);
            setMobileLeftOpen(false);
          }}
          onRemoveFile={() => {
            setUploadedFile(null);
            if (!audioBlob) setAppState(AppState.IDLE);
          }}
          selectedFileName={uploadedFile?.name}
          disabled={isProcessing}
          onClose={() => {
            if (mobileLeftOpen) setMobileLeftOpen(false);
            else updatePrefs({ showLeftPanel: false });
          }}
          onInfoOpen={() => {
            setIsInfoOpen(true);
            setMobileLeftOpen(false);
          }}
        />
      )}
    </>
  );

  const rightAction = {
    [AppMode.SPEECH]: {
      title: 'Promptify',
      icon: Sparkles,
      loading: appState === AppState.PROMPTIFYING,
      disabled: !rawTranscript || isProcessing,
      onClick: handlePromptify,
    },
    [AppMode.TRANSLATE]: {
      title: 'Translate',
      icon: Languages,
      loading: appState === AppState.TRANSLATING,
      disabled: (!rawTranscript && !audioBlob && !uploadedFile) || isProcessing,
      onClick: handleTranslate,
    },
    [AppMode.UPLOAD]: {
      title: 'Process Upload',
      icon: Sparkles,
      loading: appState === AppState.PROCESSING_UPLOAD,
      disabled: (!audioBlob && !uploadedFile) || isProcessing,
      onClick: handleProcessUpload,
    },
  }[prefs.activeMode];
  const RightIcon = rightAction.icon;

  const statusText =
    appState === AppState.RECORDING
      ? 'Recording audio...'
      : appState === AppState.TRANSCRIBING
        ? 'Transcribing...'
        : appState === AppState.PROMPTIFYING
          ? 'Applying prompt magic...'
          : appState === AppState.TRANSLATING
            ? 'Translating...'
            : appState === AppState.PROCESSING_UPLOAD
              ? 'Processing upload...'
              : error
                ? ''
                : uploadedFile
                  ? 'File Ready'
                  : appState !== AppState.IDLE
                    ? 'Ready'
                    : '';

  return (
    <div className="yap-app-shell h-screen min-h-[100dvh] max-h-[100dvh] w-screen bg-white dark:bg-[var(--yap-void)] text-gray-900 dark:text-[var(--yap-text-1)] flex flex-col font-sans overflow-hidden overscroll-none">
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        usage={usage}
        onOpenAnalytics={() => {
          setIsSettingsOpen(false);
          setIsAnalyticsOpen(true);
        }}
      />

      <FileUploadModal
        isOpen={isFileUploadOpen}
        onClose={() => setIsFileUploadOpen(false)}
        onFileSelect={handleFileSelect}
        actionLabel={prefs.activeMode === AppMode.UPLOAD ? 'Use File' : 'Upload & Transcribe'}
        currentFileName={uploadedFile?.name}
      />

      <InfoModal isOpen={isInfoOpen} onClose={() => setIsInfoOpen(false)} />

      <CustomModeModal
        isOpen={Boolean(editingCustomMode)}
        mode={editingCustomMode}
        onClose={() => setEditingCustomMode(null)}
        onSave={updateCustomMode}
      />

      <PromptModeInfoModal
        isOpen={Boolean(infoPromptMode)}
        mode={infoPromptMode}
        onClose={() => setInfoPromptMode(null)}
      />

      <HistoryPreviewModal
        isOpen={Boolean(previewHistoryItem)}
        item={previewHistoryItem}
        onClose={() => setPreviewHistoryItem(null)}
        onRestore={handleRestoreHistory}
      />

      <AnalyticsModal
        isOpen={isAnalyticsOpen}
        onClose={() => setIsAnalyticsOpen(false)}
        records={analytics}
        usage={usage}
        onClear={clearAnalytics}
      />

      <div className={clsx("fixed inset-0 z-40 lg:hidden pointer-events-none transition-opacity duration-300", mobileLeftOpen ? "opacity-100" : "opacity-0")}>
        <div
          className={clsx("absolute inset-0 bg-black/50 pointer-events-auto", mobileLeftOpen ? "block" : "hidden")}
          onClick={() => setMobileLeftOpen(false)}
        />
        <div className={clsx(
          "yap-glass-panel yap-side-panel yap-panel-enter absolute left-0 top-0 bottom-0 w-[84%] max-w-xs bg-white dark:bg-transparent border-r border-gray-100 dark:border-[var(--yap-glass-border)] p-6 shadow-2xl transition-transform duration-300 pointer-events-auto",
          mobileLeftOpen ? "translate-x-0" : "-translate-x-full"
        )}>
          {leftPanel}
        </div>
      </div>

      <div className={clsx("fixed inset-0 z-40 lg:hidden pointer-events-none transition-opacity duration-300", mobileRightOpen ? "opacity-100" : "opacity-0")}>
        <div
          className={clsx("absolute inset-0 bg-black/50 pointer-events-auto", mobileRightOpen ? "block" : "hidden")}
          onClick={() => setMobileRightOpen(false)}
        />
        <div className={clsx(
          "yap-glass-panel yap-side-panel yap-panel-enter absolute right-0 top-0 bottom-0 w-[84%] max-w-xs bg-white dark:bg-transparent border-l border-gray-100 dark:border-[var(--yap-glass-border)] p-6 shadow-2xl transition-transform duration-300 pointer-events-auto",
          mobileRightOpen ? "translate-x-0" : "translate-x-full"
        )}>
          <HistoryPanel
            history={history}
            onPreview={(item) => {
              setPreviewHistoryItem(item);
              setMobileRightOpen(false);
            }}
            onDelete={deleteHistoryItem}
            onClearAll={clearHistory}
            onClose={() => setMobileRightOpen(false)}
          />
        </div>
      </div>

      <div className="yap-app-content flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden">
        {prefs.showLeftPanel && (
          <div className="yap-glass-panel yap-side-panel yap-panel-enter hidden lg:flex lg:col-span-3 border-r border-gray-100 dark:border-[var(--yap-glass-border)] p-6 bg-gray-50/50 dark:bg-transparent">
            {leftPanel}
          </div>
        )}

        <div className={clsx(centerColClass, 'yap-center-panel yap-panel-enter col-span-1 flex flex-col h-full max-h-[100dvh] relative transition-all duration-300 overflow-hidden')}>
          <header className="flex-shrink-0 flex justify-between items-start p-4 lg:px-6 lg:pt-5 lg:pb-0 relative min-h-[52px]">
            <button
              onClick={() => setMobileLeftOpen(true)}
                  className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--yap-glass-hover)] transition-colors text-gray-500 dark:text-[var(--yap-text-2)]"
              title="Open mode settings"
            >
              {prefs.activeMode === AppMode.TRANSLATE ? (
                <Languages size={20} />
              ) : prefs.activeMode === AppMode.UPLOAD ? (
                <Upload size={20} />
              ) : (
                <Sparkles size={20} />
              )}
            </button>

            <div className="absolute left-6 top-6 hidden lg:flex items-center gap-3">
              {!prefs.showLeftPanel && (
                <button
                  onClick={() => updatePrefs({ showLeftPanel: true })}
                  className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--yap-glass-hover)] transition-colors text-gray-500 dark:text-[var(--yap-text-2)]"
                  title="Open Sidebar"
                >
                  <PanelLeftOpen size={20} />
                </button>
              )}
            </div>

            <div className="absolute left-1/2 -translate-x-1/2 top-3.5 lg:top-5 flex justify-center text-center">
              <ModeSwitcher
                mode={prefs.activeMode}
                onModeChange={(activeMode) => updatePrefs({ activeMode })}
                disabled={isProcessing}
              />
            </div>

            <div className="ml-auto flex flex-col items-end gap-2">
              <button
                onClick={() => setMobileRightOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--yap-glass-hover)] transition-colors text-gray-500 dark:text-[var(--yap-text-2)]"
                title="History"
              >
                <Clock size={20} />
              </button>

              {!prefs.showRightPanel && (
                <button
                  onClick={() => updatePrefs({ showRightPanel: true })}
                  className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--yap-glass-hover)] transition-colors text-gray-500 dark:text-[var(--yap-text-2)]"
                  title="Open History"
                >
                  <PanelRightOpen size={20} />
                </button>
              )}

              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-[var(--yap-glass-hover)] transition-colors"
                title="Settings"
              >
                <Settings className="w-5 h-5 text-gray-500 dark:text-[var(--yap-text-2)]" />
              </button>
            </div>
          </header>

          <div className="yap-hero-stack px-6 flex flex-col gap-5">
            <div className="yap-hero-controls flex items-center justify-center gap-6">
              <button
                onClick={handleTranscribe}
                disabled={(!audioBlob && !uploadedFile) || isProcessing}
                title="Transcribe Audio"
                className={clsx(
                  'yap-action-button yap-hover-lift yap-glow-in flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all shadow-md active:scale-95 active:shadow-sm',
                  appState === AppState.TRANSCRIBING
                    ? 'bg-gray-100 dark:bg-[var(--yap-surface-2)] border border-transparent text-gray-400'
                    : 'bg-white dark:bg-[rgba(255,255,255,0.035)] border border-gray-200 dark:border-[var(--yap-glass-border)] text-gray-600 dark:text-[var(--yap-text-2)] hover:border-black dark:hover:border-[rgba(255,255,255,0.14)] hover:text-black dark:hover:text-[var(--yap-text-1)]'
                )}
              >
                {appState === AppState.TRANSCRIBING ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <PenTool size={24} />
                )}
              </button>

              <button
                onClick={toggleRecording}
                disabled={isProcessing}
                className={clsx(
                  'yap-mic-button yap-hover-lift w-[72px] h-[72px] rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100',
                  appState === AppState.RECORDING && 'is-recording'
                )}
              >
                {appState === AppState.RECORDING ? (
                  <Square fill="currentColor" size={28} />
                ) : (
                  <Mic size={32} />
                )}
              </button>

              <button
                onClick={rightAction.onClick}
                disabled={rightAction.disabled}
                title={rightAction.title}
                className={clsx(
                  'yap-action-button yap-hover-lift yap-glow-in flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all shadow-md active:scale-95 active:shadow-sm',
                  rightAction.loading
                    ? 'bg-gray-100 dark:bg-[var(--yap-surface-2)] border border-transparent text-gray-400'
                    : 'bg-white dark:bg-[rgba(255,255,255,0.035)] border border-gray-200 dark:border-[var(--yap-glass-border)] text-gray-600 dark:text-[var(--yap-text-2)] hover:border-black dark:hover:border-[rgba(255,255,255,0.14)] hover:text-black dark:hover:text-[var(--yap-text-1)]',
                  rightAction.disabled && !rightAction.loading && 'opacity-50 cursor-not-allowed'
                )}
              >
                {rightAction.loading ? (
                  <Loader2 className="animate-spin" size={24} />
                ) : (
                  <RightIcon size={24} />
                )}
              </button>
            </div>

            <div className="w-full max-w-lg mx-auto">
              <div className="flex justify-between items-end mb-2 px-1 h-6">
                <span className="text-xs font-mono text-purple-600 dark:text-[var(--yap-violet-hover)] animate-pulse">
                  {statusText}
                </span>

                {transformedTranscript && (
                  <div className="flex items-center gap-2 bg-gray-100 dark:bg-[var(--yap-surface-2)] rounded-full p-1">
                    <button
                      onClick={() => setViewMode(ViewMode.RAW)}
                      className={clsx('px-3 py-1 text-[10px] font-bold rounded-full transition-colors', viewMode === ViewMode.RAW ? 'bg-white dark:bg-[var(--yap-violet-mist)] dark:text-[var(--yap-text-1)] shadow-sm' : 'text-gray-500 dark:text-[var(--yap-text-2)]')}
                    >
                      RAW
                    </button>
                    <button
                      onClick={() => setViewMode(ViewMode.TRANSFORMED)}
                      className={clsx('px-3 py-1 text-[10px] font-bold rounded-full transition-colors', viewMode === ViewMode.TRANSFORMED ? 'bg-white dark:bg-[var(--yap-violet-mist)] dark:text-[var(--yap-text-1)] shadow-sm' : 'text-gray-500 dark:text-[var(--yap-text-2)]')}
                    >
                      AI
                    </button>
                  </div>
                )}
              </div>
              <Waveform active={appState === AppState.RECORDING} stream={audioStream} />
            </div>
          </div>

          <div className="flex-1 overflow-hidden px-6 pb-6 flex flex-col min-h-0">
            <div className={clsx(
              "yap-output-surface yap-fade-in flex-1 min-h-0 border border-gray-200 dark:border-[var(--yap-glass-border)] rounded-2xl bg-white dark:bg-transparent p-6 overflow-y-auto custom-scrollbar shadow-sm",
              isProcessing && "yap-processing"
            )}>
              {currentDisplay ? (
                <MarkdownErrorBoundary fallback={sanitizeText(currentDisplay)}>
                  <OutputMarkdown
                    content={sanitizeText(currentDisplay)}
                    raw={viewMode === ViewMode.RAW}
                  />
                </MarkdownErrorBoundary>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-[var(--yap-text-2)] text-center">
                  <div className="p-4 rounded-full bg-gray-100 dark:bg-[var(--yap-violet-mist)] mb-4">
                    <Mic size={36} className="text-black dark:text-[var(--yap-violet-hover)]" />
                  </div>
                  <p className="text-lg font-bold text-gray-500 dark:text-[var(--yap-text-1)]">Speak something.</p>
                  <p className="text-sm mt-2 opacity-70 font-medium dark:text-[var(--yap-text-2)]">
                    {prefs.activeMode === AppMode.SPEECH
                      ? 'Record, Transcribe, then Promptify.'
                      : prefs.activeMode === AppMode.TRANSLATE
                        ? 'Record or transcribe, then translate.'
                        : 'Upload or record audio, then process.'}
                  </p>
                  <span className="yap-mode-badge mt-4 rounded-full px-3 py-1 text-xs font-semibold">
                    {getCurrentModeLabel()}
                  </span>
                </div>
              )}
            </div>

            <div className="flex-shrink-0 mt-4 flex justify-between items-center gap-3">
              {!isConfirmClearOpen ? (
                <button
                  onClick={() => setIsConfirmClearOpen(true)}
                  disabled={!hasWorkspaceContent}
                  className="flex items-center gap-2 text-xs font-bold text-gray-400 dark:text-[var(--yap-text-3)] hover:text-red-500 disabled:opacity-20 transition-colors uppercase tracking-wider px-2"
                >
                  <Trash2 size={14} /> Clear
                </button>
              ) : (
                <div className="flex items-center gap-2 animate-in slide-in-from-left-2">
                  <span className="text-xs text-gray-500 dark:text-[var(--yap-text-2)] font-medium mr-2">Save to history?</span>
                  <button onClick={() => handleClear(true)} className="yap-violet-button px-3 py-1 bg-black text-white text-xs font-bold rounded-md hover:opacity-90">Yes</button>
                  <button onClick={() => handleClear(false)} className="yap-ghost-button px-3 py-1 bg-gray-200 dark:bg-transparent text-black dark:text-[var(--yap-text-2)] text-xs font-bold rounded-md hover:bg-red-100 hover:text-red-600">No</button>
                  <button onClick={() => setIsConfirmClearOpen(false)} className="px-2 py-1 text-gray-400 hover:text-gray-600 dark:hover:text-[var(--yap-text-1)]"><XIcon size={14} /></button>
                </div>
              )}

              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  disabled={!currentDisplay}
                  className="yap-action-button yap-hover-lift yap-glow-in flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-[var(--yap-glass-border)] text-xs font-bold hover:bg-gray-50 dark:hover:bg-[var(--yap-glass-hover)] disabled:opacity-30 transition-colors"
                >
                  <Copy size={14} /> Copy
                </button>
                <button
                  onClick={handleDownload}
                  disabled={!currentDisplay}
                  className="yap-action-button yap-hover-lift yap-glow-in flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-[var(--yap-glass-border)] text-xs font-bold hover:bg-gray-50 dark:hover:bg-[var(--yap-glass-hover)] disabled:opacity-30 transition-colors"
                >
                  <Download size={14} /> Export
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2 z-50">
              {error}
            </div>
          )}
        </div>

        {prefs.showRightPanel && (
          <div className="yap-glass-panel yap-side-panel yap-panel-enter hidden lg:flex lg:col-span-3 border-l border-gray-100 dark:border-[var(--yap-glass-border)] p-6 bg-gray-50/50 dark:bg-transparent">
            <HistoryPanel
              history={history}
              onPreview={setPreviewHistoryItem}
              onDelete={deleteHistoryItem}
              onClearAll={clearHistory}
              onClose={() => updatePrefs({ showRightPanel: false })}
            />
          </div>
        )}
      </div>
    </div>
  );
}

const XIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18" /><path d="m6 6 12 12" /></svg>
);

export default App;

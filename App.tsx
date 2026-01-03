import React, { useState, useRef, useEffect } from 'react';
import { Settings, Copy, Trash2, Download, Square, PenTool, Sparkles, Mic, ChevronLeft, ChevronRight, Loader2, PanelLeftOpen, PanelRightOpen, Clock, Menu, Upload } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import clsx from 'clsx';

import { AppState, ViewMode, PromptMode, SettingsData, ApiUsage, HistoryItem } from './types';
import { transcribeAudio, transformText, validateAndGetModel } from './services/geminiService';
import { Waveform } from './components/Waveform';
import { PromptifyPanel } from './components/PromptifyPanel';
import { HistoryPanel } from './components/HistoryPanel';
import { SettingsModal } from './components/SettingsModal';
import { FileUploadModal } from './components/FileUploadModal';

// Error Boundary Component for Markdown Rendering
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
      return (
        <div className="whitespace-pre-wrap font-mono text-sm">
          {this.props.fallback}
        </div>
      );
    }

    return this.props.children;
  }
}

const DEFAULT_SETTINGS: SettingsData = {
  theme: 'light',
  liveTranscription: false,
  apiKey: '',
  microphoneId: '',
  saveApiKey: false,
  modelId: 'gemini-1.5-flash' // Safe default
};

function App() {
  // --- State ---
  const [appState, setAppState] = useState<AppState>(AppState.IDLE);
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.RAW);
  
  const [rawTranscript, setRawTranscript] = useState<string>('');
  const [transformedTranscript, setTransformedTranscript] = useState<string>('');
  
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [audioStream, setAudioStream] = useState<MediaStream | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const [settings, setSettings] = useState<SettingsData>(DEFAULT_SETTINGS);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isFileUploadOpen, setIsFileUploadOpen] = useState(false);
  const [usage, setUsage] = useState<ApiUsage>({ calls: 0, tokens: 0, cost: 0 });
  const [error, setError] = useState<string | null>(null);
  
  // Layout State (Desktop)
  const [showLeftPanel, setShowLeftPanel] = useState(true);
  const [showRightPanel, setShowRightPanel] = useState(true);

  // Layout State (Mobile/Tablet)
  const [mobileLeftOpen, setMobileLeftOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);

  // Promptify State
  const [promptMode, setPromptMode] = useState<PromptMode>(PromptMode.ENHANCER);
  const [customInstruction, setCustomInstruction] = useState('');

  // History State
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [isConfirmClearOpen, setIsConfirmClearOpen] = useState(false);

  // Refs
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  // Debug logging for mobile (runs once on mount)
  useEffect(() => {
    console.log('🎯 Yappify AI loaded successfully');
    console.log('📱 User Agent:', navigator.userAgent);
    console.log('🌐 Window size:', window.innerWidth, 'x', window.innerHeight);
    console.log('🔗 Current URL:', window.location.href);
    console.log('🌍 Hostname:', window.location.hostname);
    
    // Detect if running on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      console.log('📱 Mobile device detected');
      console.log('💡 To access from desktop, use:', window.location.href);
    } else {
      console.log('💻 Desktop device detected');
      // Try to detect local network IP (this won't work in browser, but helpful for dev)
      console.log('💡 To access from mobile, ensure you use the Network URL from terminal');
    }
  }, []);

  // --- Effects ---

  // Load Settings
  useEffect(() => {
    const stored = localStorage.getItem('yappify_settings');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const apiKey = parsed.saveApiKey ? parsed.apiKey : '';
        const modelId = parsed.modelId || 'gemini-1.5-flash';
        setSettings({ ...DEFAULT_SETTINGS, ...parsed, apiKey, modelId });
      } catch (e) {
        console.error("Failed to parse settings");
      }
    }
  }, []);

  // Save Settings
  useEffect(() => {
    const toSave = { ...settings };
    if (!settings.saveApiKey) {
      toSave.apiKey = ''; 
    }
    localStorage.setItem('yappify_settings', JSON.stringify(toSave));
    
    if (settings.theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.classList.add('bg-black');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('bg-black');
    }
  }, [settings]);

  // Model Validation
  useEffect(() => {
    const validate = async () => {
        if (!settings.apiKey || settings.apiKey.length < 30) return;
        
        try {
            const validModel = await validateAndGetModel(settings.apiKey, settings.modelId);
            if (validModel !== settings.modelId) {
                console.log(`Switched model from ${settings.modelId} to ${validModel}`);
                setSettings(prev => ({ ...prev, modelId: validModel }));
                setError(`Note: Model '${settings.modelId}' unavailable. Switched to '${validModel}'.`);
                setTimeout(() => setError(null), 5000);
            }
        } catch (e) {
            console.error("Model validation error", e);
        }
    };
    
    // Debounce validation to only run after user stops typing
    const timeoutId = setTimeout(() => {
      if (settings.apiKey.length > 30) {
        validate();
      }
    }, 1000); // Wait 1 second after last keystroke
    
    return () => clearTimeout(timeoutId);
  }, [settings.apiKey, settings.modelId]);

  // --- Helpers ---

  const currentDisplay = viewMode === ViewMode.RAW ? rawTranscript : transformedTranscript;
  const isProcessing = appState === AppState.TRANSCRIBING || appState === AppState.PROMPTIFYING;

  // Sanitize text for safe display (remove potential problematic characters)
  const sanitizeText = (text: string): string => {
    if (!text) return '';
    // Limit length to prevent memory issues
    const maxLength = 50000;
    if (text.length > maxLength) {
      return text.substring(0, maxLength) + '\n\n... (truncated for display)';
    }
    return text;
  };

  // Calculate Center Panel Col Span
  // Total 12 cols. Left/Right take 3 each if open.
  // Both open: 6. One open: 9. None open: 12.
  const centerColSpan = 12 - (showLeftPanel ? 3 : 0) - (showRightPanel ? 3 : 0);

  // --- Handlers (Existing logic unchanged) ---
  const handleStartRecording = async () => {
    setError(null);
    try {
      const constraints: MediaStreamConstraints = {
        audio: settings.microphoneId ? { deviceId: settings.microphoneId } : true
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
        setAppState(AppState.RECORDED);
        stream.getTracks().forEach(track => track.stop());
        setAudioStream(null);
      };
      mediaRecorder.start();
      setAppState(AppState.RECORDING);
    } catch (err) {
      console.error(err);
      setError("Could not access microphone.");
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

  const handleTranscribe = async () => {
    const sourceBlob = uploadedFile || audioBlob;
    if (!sourceBlob) return;
    if (!settings.apiKey) {
      setIsSettingsOpen(true);
      setError("API Key required.");
      return;
    }
    setAppState(AppState.TRANSCRIBING);
    setError(null);
    setTransformedTranscript('');
    try {
      const result = await transcribeAudio(sourceBlob, settings.apiKey, settings.modelId);
      setRawTranscript(result.text);
      updateUsage(result.usage);
      setAppState(AppState.READY);
      setViewMode(ViewMode.RAW);
      // Clear uploaded file after transcription
      if (uploadedFile) {
        setUploadedFile(null);
      }
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Transcription failed.");
      setAppState(uploadedFile ? AppState.IDLE : AppState.RECORDED);
    }
  };

  const handlePromptify = async () => {
    if (!rawTranscript) return;
    if (!settings.apiKey) {
      setIsSettingsOpen(true);
      return;
    }
    setAppState(AppState.PROMPTIFYING);
    setError(null);
    try {
      const result = await transformText(rawTranscript, promptMode, customInstruction, settings.apiKey, settings.modelId);
      setTransformedTranscript(result.text);
      updateUsage(result.usage);
      setAppState(AppState.DONE);
      setViewMode(ViewMode.TRANSFORMED);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Transformation failed.");
      setAppState(AppState.READY);
    }
  };

  const updateUsage = (newUsage: { tokens: number, cost: number }) => {
    setUsage(prev => ({
      calls: prev.calls + 1,
      tokens: prev.tokens + newUsage.tokens,
      cost: prev.cost + newUsage.cost
    }));
  };

  const handleClear = (save: boolean) => {
    if (save && rawTranscript) {
      const newItem: HistoryItem = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        raw: rawTranscript,
        transformed: transformedTranscript || undefined,
        mode: transformedTranscript ? promptMode : undefined
      };
      setHistory(prev => [...prev, newItem]);
    }
    setRawTranscript('');
    setTransformedTranscript('');
    setAudioBlob(null);
    setUploadedFile(null);
    setAppState(AppState.IDLE);
    setViewMode(ViewMode.RAW);
    setIsConfirmClearOpen(false);
  };

  const handleFileSelect = (file: File) => {
    setUploadedFile(file);
    setAudioBlob(null); // Clear any recorded audio
    setAppState(AppState.RECORDED); // Set to recorded state so transcribe button is enabled
  };

  const handleRestoreHistory = (item: HistoryItem) => {
    setRawTranscript(item.raw);
    setTransformedTranscript(item.transformed || '');
    setViewMode(item.transformed ? ViewMode.TRANSFORMED : ViewMode.RAW);
    setAppState(item.transformed ? AppState.DONE : AppState.READY);
    if (item.mode) setPromptMode(item.mode);
    // Close mobile panel on restore
    setMobileRightOpen(false);
  };

  const handleDeleteHistory = (id: string) => {
    setHistory(prev => prev.filter(item => item.id !== id));
  };

  const handleClearAllHistory = () => {
    setHistory([]);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(currentDisplay);
  };

  const handleDownload = () => {
    const blob = new Blob([currentDisplay], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `yappify-${viewMode.toLowerCase()}-${new Date().getTime()}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="h-screen w-screen bg-white dark:bg-black text-gray-900 dark:text-gray-100 flex flex-col font-sans overflow-hidden">
      
      <SettingsModal 
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={setSettings}
        usage={usage}
      />

      <FileUploadModal 
        isOpen={isFileUploadOpen}
        onClose={() => setIsFileUploadOpen(false)}
        onFileSelect={handleFileSelect}
      />

      {/* --- Mobile Drawers (Overlays) --- */}
      
      {/* Mobile Left Drawer (Promptify) */}
      <div className={clsx("fixed inset-0 z-40 lg:hidden pointer-events-none transition-opacity duration-300", mobileLeftOpen ? "opacity-100" : "opacity-0")}>
        {/* Backdrop */}
        <div 
            className={clsx("absolute inset-0 bg-black/50 pointer-events-auto", mobileLeftOpen ? "block" : "hidden")} 
            onClick={() => setMobileLeftOpen(false)}
        />
        {/* Panel */}
        <div className={clsx(
            "absolute left-0 top-0 bottom-0 w-[80%] max-w-xs bg-white dark:bg-gray-900 border-r border-gray-100 dark:border-gray-800 p-6 shadow-2xl transition-transform duration-300 pointer-events-auto",
            mobileLeftOpen ? "translate-x-0" : "-translate-x-full"
        )}>
             <PromptifyPanel 
                currentMode={promptMode}
                onModeChange={(m) => { setPromptMode(m); setMobileLeftOpen(false); }}
                customInstruction={customInstruction}
                onCustomInstructionChange={setCustomInstruction}
                disabled={isProcessing}
                onClose={() => setMobileLeftOpen(false)}
            />
        </div>
      </div>

      {/* Mobile Right Drawer (History) */}
      <div className={clsx("fixed inset-0 z-40 lg:hidden pointer-events-none transition-opacity duration-300", mobileRightOpen ? "opacity-100" : "opacity-0")}>
        {/* Backdrop */}
        <div 
            className={clsx("absolute inset-0 bg-black/50 pointer-events-auto", mobileRightOpen ? "block" : "hidden")} 
            onClick={() => setMobileRightOpen(false)}
        />
        {/* Panel */}
        <div className={clsx(
            "absolute right-0 top-0 bottom-0 w-[80%] max-w-xs bg-white dark:bg-gray-900 border-l border-gray-100 dark:border-gray-800 p-6 shadow-2xl transition-transform duration-300 pointer-events-auto",
            mobileRightOpen ? "translate-x-0" : "translate-x-full"
        )}>
             <HistoryPanel 
                history={history} 
                onRestore={handleRestoreHistory}
                onDelete={handleDeleteHistory}
                onClearAll={handleClearAllHistory}
                onClose={() => setMobileRightOpen(false)}
            />
        </div>
      </div>


      {/* --- Main Grid Layout --- */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 h-full overflow-hidden">
        
        {/* Left Panel - Promptify (Desktop Only) */}
        {showLeftPanel && (
            <div className="hidden lg:flex lg:col-span-3 border-r border-gray-100 dark:border-gray-800 p-6 bg-gray-50/50 dark:bg-gray-900/20">
            <PromptifyPanel 
                currentMode={promptMode}
                onModeChange={setPromptMode}
                customInstruction={customInstruction}
                onCustomInstructionChange={setCustomInstruction}
                disabled={isProcessing}
                onClose={() => setShowLeftPanel(false)}
            />
            </div>
        )}

        {/* Center Panel - Main UI */}
        <div className={`lg:col-span-${centerColSpan} col-span-1 flex flex-col h-full relative transition-all duration-300`}>
          
          {/* Header */}
          <header className="flex justify-between items-center p-4 lg:p-6 lg:pb-2 relative">
            
            {/* Mobile Left Button */}
            <button 
                onClick={() => setMobileLeftOpen(true)}
                className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
                title="Promptify Modes"
            >
                <Sparkles size={20} />
            </button>

            {/* Desktop Left Toggle (if closed) */}
            <div className="hidden lg:flex items-center gap-3">
                {!showLeftPanel && (
                    <button 
                        onClick={() => setShowLeftPanel(true)}
                        className="p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
                        title="Open Sidebar"
                    >
                        <PanelLeftOpen size={20} />
                    </button>
                )}
                <h1 className="text-xl font-bold tracking-tight">yappify-ai 2.0</h1>
            </div>

            {/* Mobile Centered Title */}
            <h1 className="lg:hidden text-lg font-bold tracking-tight absolute left-1/2 -translate-x-1/2">
                yappify-ai 2.0
            </h1>

            <div className="flex items-center gap-2">
                {/* Mobile Right Button */}
                <button 
                    onClick={() => setMobileRightOpen(true)}
                    className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
                    title="History"
                >
                    <Clock size={20} />
                </button>

                {/* Desktop Right Toggle (if closed) */}
                {!showRightPanel && (
                    <button 
                        onClick={() => setShowRightPanel(true)}
                        className="hidden lg:block p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
                        title="Open History"
                    >
                        <PanelRightOpen size={20} />
                    </button>
                )}
                
                <button 
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Settings"
                >
                <Settings className="w-5 h-5 text-gray-500" />
                </button>
            </div>
          </header>

          {/* Controls */}
          <div className="px-6 py-4 flex flex-col gap-6">
            <div className="flex items-center justify-center gap-6">
               {/* Transcribe */}
               <button
                 onClick={handleTranscribe}
                 disabled={(!audioBlob && !uploadedFile) || isProcessing}
                 title="Transcribe Audio"
                 className={clsx(
                    "flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all shadow-md active:scale-95 active:shadow-sm",
                    appState === AppState.TRANSCRIBING
                        ? "bg-gray-100 dark:bg-gray-800 border border-transparent text-gray-400"
                        : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white"
                 )}
               >
                 {appState === AppState.TRANSCRIBING ? (
                    <Loader2 className="animate-spin" size={24} />
                 ) : (
                    <PenTool size={24} />
                 )}
               </button>

               {/* Talk / Stop */}
               <button
                 onClick={toggleRecording}
                 className={clsx(
                    "w-24 h-24 rounded-full flex items-center justify-center transition-all shadow-xl hover:scale-105 active:scale-95",
                    appState === AppState.RECORDING
                        ? "bg-black dark:bg-white text-white dark:text-black" 
                        : "bg-white dark:bg-black border-4 border-gray-100 dark:border-gray-800 text-black dark:text-white hover:border-gray-200 dark:hover:border-gray-700" 
                 )}
               >
                 {appState === AppState.RECORDING ? (
                    <Square fill="currentColor" size={28} />
                 ) : (
                    <Mic size={32} />
                 )}
               </button>

               {/* Promptify */}
               <button
                 onClick={handlePromptify}
                 disabled={!rawTranscript || isProcessing}
                 title="Promptify (AI Transform)"
                 className={clsx(
                    "flex flex-col items-center justify-center w-16 h-16 rounded-2xl transition-all shadow-md active:scale-95 active:shadow-sm",
                    appState === AppState.PROMPTIFYING
                        ? "bg-gray-100 dark:bg-gray-800 border border-transparent text-gray-400"
                        : "bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:border-black dark:hover:border-white hover:text-black dark:hover:text-white"
                 )}
               >
                 {appState === AppState.PROMPTIFYING ? (
                    <Loader2 className="animate-spin" size={24} />
                 ) : (
                    <Sparkles size={24} />
                 )}
               </button>
            </div>

            {/* Waveform */}
            <div className="w-full max-w-lg mx-auto">
               <div className="flex justify-between items-end mb-2 px-1 h-6">
                 <span className="text-xs font-mono text-purple-600 dark:text-purple-400 animate-pulse">
                    {appState === AppState.RECORDING ? "Recording audio..." : 
                     appState === AppState.TRANSCRIBING ? "Transcribing..." : 
                     appState === AppState.PROMPTIFYING ? "Applying prompt magic..." :
                     error ? "" :
                     uploadedFile ? "File Ready" :
                     appState !== AppState.IDLE ? "Ready" : ""}
                 </span>
                 
                 {transformedTranscript && (
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-full p-1">
                        <button 
                            onClick={() => setViewMode(ViewMode.RAW)}
                            className={clsx("px-3 py-1 text-[10px] font-bold rounded-full transition-colors", viewMode === ViewMode.RAW ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500")}
                        >
                            RAW
                        </button>
                        <button 
                            onClick={() => setViewMode(ViewMode.TRANSFORMED)}
                            className={clsx("px-3 py-1 text-[10px] font-bold rounded-full transition-colors", viewMode === ViewMode.TRANSFORMED ? "bg-white dark:bg-gray-700 shadow-sm" : "text-gray-500")}
                        >
                            AI
                        </button>
                    </div>
                 )}
               </div>
               <div className="flex gap-3 items-center">
                 <div className="flex-1">
                   <Waveform active={appState === AppState.RECORDING} stream={audioStream} />
                 </div>
                 <button
                   onClick={() => setIsFileUploadOpen(true)}
                   disabled={appState === AppState.RECORDING || isProcessing}
                   className="flex-shrink-0 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-purple-500 dark:hover:border-purple-500 hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                   title="Upload audio file"
                 >
                   <Upload size={20} className="text-gray-600 dark:text-gray-400" />
                 </button>
               </div>
            </div>

          </div>

          {/* Output */}
          <div className="flex-1 overflow-hidden px-6 pb-6 flex flex-col min-h-0">
             <div className="flex-1 min-h-0 border border-gray-200 dark:border-gray-800 rounded-2xl bg-white dark:bg-gray-900 p-6 overflow-y-auto custom-scrollbar shadow-sm">
                {currentDisplay ? (
                    <MarkdownErrorBoundary fallback={sanitizeText(currentDisplay)}>
                      <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none prose-headings:font-bold prose-headings:text-gray-900 dark:prose-headings:text-gray-100">
                        <ReactMarkdown>
                            {sanitizeText(currentDisplay)}
                        </ReactMarkdown>
                      </div>
                    </MarkdownErrorBoundary>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center text-gray-400 dark:text-gray-600">
                        <div className="p-4 rounded-full bg-gray-100 dark:bg-gray-800 mb-4">
                            <Mic size={32} className="opacity-40 text-black dark:text-white" />
                        </div>
                        <p className="text-lg font-bold text-gray-500 dark:text-gray-400">Ready to yapp.</p>
                        <p className="text-sm mt-2 opacity-70 font-medium">Record, Transcribe, then Promptify.</p>
                    </div>
                )}
             </div>

             {/* Action Row - Fixed at bottom */}
             <div className="flex-shrink-0 mt-4 flex justify-between items-center">
                 {!isConfirmClearOpen ? (
                     <button 
                        onClick={() => setIsConfirmClearOpen(true)}
                        disabled={!rawTranscript && !audioBlob && !uploadedFile}
                        className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 disabled:opacity-20 transition-colors uppercase tracking-wider px-2"
                     >
                        <Trash2 size={14} /> Clear
                     </button>
                 ) : (
                    <div className="flex items-center gap-2 animate-in slide-in-from-left-2">
                        <span className="text-xs text-gray-500 font-medium mr-2">Save to history?</span>
                        <button onClick={() => handleClear(true)} className="px-3 py-1 bg-black dark:bg-white text-white dark:text-black text-xs font-bold rounded-md hover:opacity-80">Yes</button>
                        <button onClick={() => handleClear(false)} className="px-3 py-1 bg-gray-200 dark:bg-gray-800 text-black dark:text-white text-xs font-bold rounded-md hover:bg-red-100 hover:text-red-600">No</button>
                        <button onClick={() => setIsConfirmClearOpen(false)} className="px-2 py-1 text-gray-400 hover:text-gray-600"><XIcon size={14}/></button>
                    </div>
                 )}

                 <div className="flex gap-2">
                    <button 
                        onClick={handleCopy}
                        disabled={!currentDisplay}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
                    >
                        <Copy size={14} /> Copy
                    </button>
                    <button 
                        onClick={handleDownload}
                        disabled={!currentDisplay}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30 transition-colors"
                    >
                        <Download size={14} /> Export
                    </button>
                 </div>
             </div>
          </div>
          
          {/* Error Toast */}
          {error && (
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded-full text-xs font-bold shadow-lg animate-in fade-in slide-in-from-top-2 z-50">
                {error}
            </div>
          )}

        </div>

        {/* Right Panel - History (Desktop Only) */}
        {showRightPanel && (
            <div className="hidden lg:flex lg:col-span-3 border-l border-gray-100 dark:border-gray-800 p-6 bg-gray-50/50 dark:bg-gray-900/20">
                <HistoryPanel 
                    history={history} 
                    onRestore={handleRestoreHistory}
                    onDelete={handleDeleteHistory}
                    onClearAll={handleClearAllHistory}
                    onClose={() => setShowRightPanel(false)}
                />
            </div>
        )}

      </div>
    </div>
  );
}

const XIcon = ({size}: {size:number}) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);

export default App;
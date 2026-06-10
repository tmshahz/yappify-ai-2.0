import React from 'react';
import { CheckCircle, ClipboardList, FileAudio, ListChecks, PanelLeftClose, Upload, Users, X } from 'lucide-react';
import clsx from 'clsx';
import { UploadProcessingType, UploadSettings } from '../types';
import { PanelFooterLinks } from './PanelFooterLinks';

interface UploadPanelProps {
  settings: UploadSettings;
  onChange: (settings: UploadSettings) => void;
  onClose: () => void;
  onInfoOpen: () => void;
  onUploadFile: () => void;
  onRemoveFile: () => void;
  selectedFileName?: string;
  disabled?: boolean;
}

const PROCESSING_OPTIONS: Array<{
  id: UploadProcessingType;
  title: string;
  description: string;
  icon: React.ComponentType<{ size?: number }>;
}> = [
  {
    id: 'raw-transcription',
    title: 'Raw Transcription',
    description: 'Generate transcript only.',
    icon: FileAudio,
  },
  {
    id: 'speaker-transcript',
    title: 'Speaker Transcription',
    description: 'Transcript with speaker separation where possible.',
    icon: Users,
  },
  {
    id: 'meeting-summary',
    title: 'Media Summary',
    description: 'Structured summary with decisions and themes.',
    icon: ClipboardList,
  },
  {
    id: 'action-items',
    title: 'Action Items',
    description: 'Extract owners, tasks, and follow-ups.',
    icon: ListChecks,
  },
];

export const UploadPanel: React.FC<UploadPanelProps> = ({
  settings,
  onChange,
  onClose,
  onInfoOpen,
  onUploadFile,
  onRemoveFile,
  selectedFileName,
  disabled,
}) => {
  return (
    <div className="flex flex-col h-full w-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-2">
          <Upload size={13} /> Upload Processing
        </h3>
        <button
          onClick={onClose}
          className="p-1 text-gray-400 hover:text-gray-900 dark:hover:text-white rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          title="Close sidebar"
        >
          <PanelLeftClose size={16} />
        </button>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => {
          if (!disabled) onUploadFile();
        }}
        onKeyDown={(event) => {
          if (!disabled && (event.key === 'Enter' || event.key === ' ')) onUploadFile();
        }}
        aria-disabled={disabled}
        className={clsx(
          'yap-glass-card yap-hover-lift yap-glow-in mb-4 w-full flex items-center gap-3 p-3 rounded-xl border border-dashed bg-white dark:bg-gray-900 transition-all',
          selectedFileName
            ? 'border-green-300 dark:border-green-800 hover:border-green-500 dark:hover:border-green-600'
            : 'border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600 hover:bg-purple-50 dark:hover:bg-purple-900/20',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <div className="p-2 rounded-lg bg-gray-100 text-gray-500 dark:bg-[var(--yap-violet-mist)] dark:text-[var(--yap-violet-hover)]">
          <Upload size={18} />
        </div>
        <div className="min-w-0 flex-1 text-left">
          <span className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {selectedFileName ? 'Change Audio File' : 'Upload Audio File'}
          </span>
          {selectedFileName && (
            <span className="block text-xs text-gray-400 truncate">{selectedFileName}</span>
          )}
        </div>
        {selectedFileName && (
          <div className="flex items-center gap-1">
            <CheckCircle size={18} className="text-green-600 dark:text-green-400" />
            <button
              onClick={(event) => {
                event.stopPropagation();
                onRemoveFile();
              }}
              disabled={disabled}
              className="p-1.5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors disabled:opacity-50"
              title="Remove selected file"
            >
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {PROCESSING_OPTIONS.map((option) => {
          const Icon = option.icon;
          const selected = settings.processingType === option.id;

          return (
            <button
              key={option.id}
              onClick={() => onChange({ processingType: option.id })}
              disabled={disabled}
              className={clsx(
                'yap-glass-card yap-hover-lift yap-glow-in w-full rounded-xl border p-3 text-left transition-all disabled:opacity-50 disabled:cursor-not-allowed',
                selected
                  ? 'yap-glass-active border-purple-600 dark:border-[var(--yap-active-border)] shadow-sm bg-white dark:bg-transparent'
                  : 'border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-purple-300 dark:hover:border-purple-700'
              )}
            >
              <div className="flex items-start gap-3">
                <div
                  className={clsx(
                    'p-2 rounded-lg transition-colors',
                    selected
                      ? 'yap-icon-mist bg-purple-100 text-purple-700 dark:bg-[var(--yap-violet-mist)] dark:text-[var(--yap-violet-hover)]'
                      : 'bg-gray-100 text-gray-500 dark:bg-[var(--yap-violet-mist)] dark:text-[var(--yap-text-2)]'
                  )}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-800 dark:text-[var(--yap-text-1)]">{option.title}</p>
                  <p className="text-xs text-gray-400 dark:text-[var(--yap-text-2)] mt-1 leading-relaxed">{option.description}</p>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      <PanelFooterLinks onInfoOpen={onInfoOpen} />
    </div>
  );
};

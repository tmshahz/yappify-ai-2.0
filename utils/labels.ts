import { AppMode } from '../types';
import type { UploadProcessingType } from '../types';

export const APP_MODE_LABELS: Record<AppMode, string> = {
  [AppMode.SPEECH]: 'Speech-to-Text',
  [AppMode.TRANSLATE]: 'Translate',
  [AppMode.UPLOAD]: 'Upload',
};

export const UPLOAD_PROCESSING_LABELS: Record<UploadProcessingType, string> = {
  'raw-transcription': 'Raw Transcription',
  'speaker-transcript': 'Speaker Transcription',
  'meeting-summary': 'Media Summary',
  'action-items': 'Action Items',
};

export const getAppModeLabel = (mode: AppMode) => APP_MODE_LABELS[mode];

export const getUploadProcessingLabel = (type: UploadProcessingType) =>
  UPLOAD_PROCESSING_LABELS[type];

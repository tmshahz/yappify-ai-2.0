import { AppMode, UploadProcessingType, ViewMode } from '../types';
import { UPLOAD_PROCESSING_LABELS } from './labels';

export type OutputDisplayProfile =
  | 'plain-transcript'
  | 'speaker-transcript'
  | 'rich-markdown';

export function resolveWorkspaceDisplayProfile({
  viewMode,
  activeMode,
  uploadProcessingType,
}: {
  viewMode: ViewMode;
  activeMode: AppMode;
  uploadProcessingType: UploadProcessingType;
}): OutputDisplayProfile {
  if (viewMode === ViewMode.TRANSFORMED) {
    return 'rich-markdown';
  }

  if (activeMode === AppMode.UPLOAD && uploadProcessingType === 'speaker-transcript') {
    return 'speaker-transcript';
  }

  return 'plain-transcript';
}

export function resolveHistoryDisplayProfile({
  modeLabel,
  section,
}: {
  appMode: AppMode;
  modeLabel: string;
  section: 'raw' | 'transformed';
}): OutputDisplayProfile {
  if (section === 'transformed') {
    return 'rich-markdown';
  }

  if (modeLabel === UPLOAD_PROCESSING_LABELS['speaker-transcript']) {
    return 'speaker-transcript';
  }

  return 'plain-transcript';
}

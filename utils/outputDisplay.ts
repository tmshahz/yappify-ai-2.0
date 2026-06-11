import { AppMode, ViewMode } from '../types';

/** Plain monospace is reserved for the Speech-to-Text RAW transcript tab only. */
export function shouldUsePlainRawOutput(viewMode: ViewMode, activeMode: AppMode): boolean {
  return viewMode === ViewMode.RAW && activeMode === AppMode.SPEECH;
}

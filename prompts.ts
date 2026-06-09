import { CustomModeData, PromptMode, PromptModeDefinition } from './types';

export const BUILT_IN_PROMPT_MODES: PromptModeDefinition[] = [
  {
    id: PromptMode.ENHANCER,
    title: 'Prompt Enhancer',
    description: 'Clean up speech, remove filler, and preserve intent as a stronger prompt.',
    instructions:
      'You are an expert prompt engineer. Clean up the following text, fix grammar, remove filler words, and structure it into a clear, concise paragraph or set of paragraphs. Preserve the original intent perfectly.',
    isCustom: false,
  },
  {
    id: PromptMode.NOTES,
    title: 'Quick Notes',
    description: 'Convert the transcript into concise, high-density notes.',
    instructions:
      'Convert the following text into extremely concise, high-density bullet points. Capture only the key facts and action items.',
    isCustom: false,
  },
];

export function buildPromptModes(customModes: CustomModeData[]): PromptModeDefinition[] {
  const customDefinitions = customModes.map<PromptModeDefinition>((mode) => ({
    id: mode.id,
    title: mode.title,
    description: mode.instructions
      ? 'Custom instructions saved locally in this browser.'
      : 'Add custom instructions before using this mode.',
    instructions: mode.instructions,
    isCustom: true,
  }));

  return [...BUILT_IN_PROMPT_MODES, ...customDefinitions];
}

export function getPromptModeFallback(mode: PromptModeDefinition): string {
  if (!mode.isCustom) return mode.instructions;
  return mode.instructions || 'Improve and structure the following transcript clearly while preserving the original intent.';
}

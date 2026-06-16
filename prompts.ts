import { CustomModeData, PromptMode, PromptModeDefinition } from './types';

export const BUILT_IN_PROMPT_MODES: PromptModeDefinition[] = [
  {
    id: PromptMode.ENHANCER,
    title: 'Prompt Enhancer',
    description: 'Clean up speech, remove filler, and preserve intent as a stronger prompt.',
    instructions:
      'Convert the input into one polished, copy-paste-ready instruction prompt. Return only the final prompt text. Do not include a title, heading, preface, explanation, outro, multiple options, markdown wrapper, or commentary. Preserve the user\'s original intent, constraints, and requested changes. Remove filler words and repetition. Organize the request clearly and directly. Do not invent details that were not provided.',
    isCustom: false,
  },
  {
    id: PromptMode.NOTES,
    title: 'Quick Notes',
    description: 'Convert the transcript into concise, high-density notes.',
    instructions:
      'Convert the input into concise, high-density notes and action items. Return only the notes. Do not include an intro, title, explanation, or outro. Use clean bullet points. Group related items only when useful. Preserve concrete tasks, decisions, names, dates, and priorities when mentioned. Do not invent details that were not provided.',
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
  return mode.instructions || 'Improve and structure the input clearly while preserving the original intent. Return only the final cleaned output. Do not include a title, heading, preface, explanation, outro, multiple options, or commentary. Do not invent details that were not provided.';
}

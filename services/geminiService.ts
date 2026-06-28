import type { GeminiModelId, TranslateSettings, UploadProcessingType, UsageResult } from '../types';

const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta';

export const DEFAULT_MODEL_ID: GeminiModelId = 'gemini-2.5-flash';

export interface GeminiModel {
  name: string;
  displayName: string;
  description: string;
  supportedGenerationMethods: string[];
}

type CuratedGeminiModel = GeminiModel & {
  name: GeminiModelId;
};

export const CURATED_GEMINI_MODELS: CuratedGeminiModel[] = [
  {
    name: 'gemini-2.5-flash-lite',
    displayName: 'Gemini 2.5 Flash-Lite',
    description: 'Cheapest, lowest latency',
    supportedGenerationMethods: ['generateContent'],
  },
  {
    name: 'gemini-2.5-flash',
    displayName: 'Gemini 2.5 Flash',
    description: 'Recommended',
    supportedGenerationMethods: ['generateContent'],
  },
  {
    name: 'gemini-3.1-flash-lite',
    displayName: 'Gemini 3.1 Flash-Lite',
    description: 'Better Lite performance, cheaper than 2.5 Flash',
    supportedGenerationMethods: ['generateContent'],
  },
  {
    name: 'gemini-3.5-flash',
    displayName: 'Gemini 3.5 Flash',
    description: 'Best quality, credits recommended',
    supportedGenerationMethods: ['generateContent'],
  },
];

export function isSupportedGeminiModelId(modelId: string): modelId is GeminiModelId {
  return CURATED_GEMINI_MODELS.some((model) => model.name === modelId);
}

const GEMINI_25_FLASH_RATES = {
  textInputPerMillion: 0.30,
  audioInputPerMillion: 1.00,
  outputPerMillion: 2.50,
};

export const fetchAvailableModels = async (apiKey: string): Promise<GeminiModel[]> => {
  if (!apiKey) return [];

  try {
    const response = await fetch(`${BASE_URL}/models?key=${apiKey}`);
    if (!response.ok) return [];

    const data = await response.json();
    const models = data.models || [];

    return models
      .filter(
        (model: any) =>
          model.supportedGenerationMethods?.includes('generateContent') &&
          model.name.includes('gemini')
      )
      .map((model: any) => ({
        name: model.name.replace(/^models\//, ''),
        displayName: model.displayName || model.name,
        description: model.description || '',
        supportedGenerationMethods: model.supportedGenerationMethods || [],
      }));
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
};

export const validateModelAvailable = async (apiKey: string, modelId: string): Promise<boolean> => {
  if (!apiKey) return true;
  const models = await fetchAvailableModels(apiKey);
  if (models.length === 0) return true;
  return models.some((model) => model.name === modelId);
};

function buildGenerateUrl(model: string, apiKey: string): string {
  const cleanModel = model.replace(/^models\//, '');
  return `${BASE_URL}/models/${cleanModel}:generateContent?key=${apiKey}`;
}

function estimateUsage(
  usageMeta: any,
  outputText: string,
  inputFallbackChars: number,
  inputKind: 'text' | 'audio'
): UsageResult {
  const inputTokens = Math.floor(
    usageMeta?.promptTokenCount ?? Math.max(1, Math.ceil(inputFallbackChars / 4))
  );
  const outputTokens = Math.floor(
    usageMeta?.candidatesTokenCount ?? Math.max(1, Math.ceil(outputText.length / 4))
  );
  const tokens = Math.floor(usageMeta?.totalTokenCount ?? inputTokens + outputTokens);
  const inputRate =
    inputKind === 'audio'
      ? GEMINI_25_FLASH_RATES.audioInputPerMillion
      : GEMINI_25_FLASH_RATES.textInputPerMillion;
  const cost =
    (inputTokens / 1_000_000) * inputRate +
    (outputTokens / 1_000_000) * GEMINI_25_FLASH_RATES.outputPerMillion;

  return { inputTokens, outputTokens, tokens, cost };
}

async function readBlobAsBase64(blob: Blob): Promise<string> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1]);
    };
    reader.readAsDataURL(blob);
  });
}

async function generateText(
  text: string,
  apiKey: string,
  modelId: string
): Promise<{ text: string; usage: UsageResult }> {
  if (!apiKey) throw new Error('API Key is missing');

  const response = await fetch(buildGenerateUrl(modelId, apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [{ parts: [{ text }] }],
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.error?.message || response.statusText;
    throw new Error(`Gemini API Error: ${message}`);
  }

  const data = await response.json();
  const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return {
    text: resultText,
    usage: estimateUsage(data.usageMetadata, resultText, text.length, 'text'),
  };
}

async function generateFromAudio(
  audioBlob: Blob,
  prompt: string,
  apiKey: string,
  modelId: string
): Promise<{ text: string; usage: UsageResult }> {
  if (!apiKey) throw new Error('API Key is missing');

  const base64Data = await readBlobAsBase64(audioBlob);

  const response = await fetch(buildGenerateUrl(modelId, apiKey), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      contents: [
        {
          parts: [
            {
              inline_data: {
                mime_type: audioBlob.type || 'audio/webm',
                data: base64Data,
              },
            },
            { text: prompt },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const message = errData.error?.message || response.statusText;
    throw new Error(`Gemini API Error: ${message}`);
  }

  const data = await response.json();
  const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  return {
    text: resultText,
    usage: estimateUsage(data.usageMetadata, resultText, prompt.length, 'audio'),
  };
}

export const transcribeAudio = async (
  audioBlob: Blob,
  apiKey: string,
  modelId: string
): Promise<{ text: string; usage: UsageResult }> => {
  return generateFromAudio(
    audioBlob,
    "Transcribe this audio. Return only the spoken words as plain text. Do not include timestamps, timecodes, subtitle formatting, speaker labels, markdown, headings, intro text, outro text, or commentary. If the audio is silent or unintelligible, return '[Unintelligible Audio]'.",
    apiKey,
    modelId
  );
};

export const transformText = async (
  text: string,
  instructions: string,
  apiKey: string,
  modelId: string
): Promise<{ text: string; usage: UsageResult }> => {
  return generateText(`Task: ${instructions}\n\nInput Text:\n${text}`, apiKey, modelId);
};

export const translateText = async (
  text: string,
  settings: TranslateSettings,
  apiKey: string,
  modelId: string
): Promise<{ text: string; usage: UsageResult }> => {
  const transliterationInstruction = settings.transliterationEnabled
    ? `Include a "## Transliteration" section. Format: ${
        settings.transliterationFormat === 'Custom'
          ? settings.customTransliterationFormat || 'Custom user-readable transliteration'
          : settings.transliterationFormat
      }.`
    : 'Do not include transliteration.';

  const prompt = [
    `Translate from ${settings.sourceLanguage} to ${settings.targetLanguage}.`,
    transliterationInstruction,
    'Return markdown with exactly these sections when applicable: ## Original Text, ## Translation, ## Transliteration.',
    `Input Text:\n${text}`,
  ].join('\n\n');

  return generateText(prompt, apiKey, modelId);
};

export const processUpload = async (
  audioBlob: Blob,
  processingType: UploadProcessingType,
  apiKey: string,
  modelId: string
): Promise<{ text: string; usage: UsageResult }> => {
  const prompt = getUploadPrompt(processingType);
  return generateFromAudio(audioBlob, prompt, apiKey, modelId);
};

function getUploadPrompt(processingType: UploadProcessingType): string {
  switch (processingType) {
    case 'raw-transcription':
      return 'Transcribe this uploaded audio. Return ONLY the full transcript. Do not add intro/outro text, headings, or commentary.';
    case 'speaker-transcript':
      return [
        'Transcribe this audio with speaker separation where possible.',
        'Label each turn as Speaker A, Speaker B, Speaker C, and so on.',
        'Return markdown with each speaker label as a heading followed by that speaker\'s words.',
        'Do not add intro/outro text.',
      ].join(' ');
    case 'meeting-summary':
      return [
        'Analyze this media audio and return a structured summary.',
        'Use markdown headings for Summary, Key Topics, Key Takeaways, Important Quotes, Risks, and Next Steps where applicable.',
        'Do not return a raw transcript.',
      ].join(' ');
    case 'action-items':
      return [
        'Analyze this audio and extract actionable tasks only.',
        'Return markdown with sections for Action Items, Owners, Deadlines, and Next Steps where applicable.',
        'List each task with owner, due date, and context when mentioned.',
        'Do not return a raw transcript.',
      ].join(' ');
    default:
      return 'Transcribe this uploaded audio. Return clean markdown.';
  }
}

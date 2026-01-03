import { PromptMode } from "../types";

const BASE_URL = "https://generativelanguage.googleapis.com/v1beta";
const COST_PER_1M_TOKENS = 0.10; // Rough estimate for Flash

/**
 * Helper to construct the generation URL.
 */
function buildGenerateUrl(model: string, apiKey: string): string {
  // Ensure model id doesn't double-prefix 'models/'
  const cleanModel = model.replace(/^models\//, '');
  return `${BASE_URL}/models/${cleanModel}:generateContent?key=${apiKey}`;
}

/**
 * Validates if the preferred model exists. If not, finds a valid fallback.
 * Returns the valid model ID.
 */
export const validateAndGetModel = async (apiKey: string, preferredModel: string): Promise<string> => {
  if (!apiKey) throw new Error("API Key is missing");

  try {
    const res = await fetch(`${BASE_URL}/models?key=${apiKey}`);
    if (!res.ok) {
        // If the key is invalid, we might get 400/403. We can't validate model, so strictly return preferred.
        console.warn(`Model validation fetch failed: ${res.status}`);
        return preferredModel; 
    }

    const data = await res.json();
    const models = data.models || [];
    
    const normalize = (id: string) => id.replace(/^models\//, '');
    const preferredNorm = normalize(preferredModel);
    
    // 1. Check if preferred exists
    const exactMatch = models.find((m: any) => normalize(m.name) === preferredNorm);
    if (exactMatch) return preferredNorm;

    console.log(`Preferred model '${preferredModel}' not found. Looking for fallback...`);

    // 2. Fallback: Look for a 'flash' model that supports generation
    const flashFallback = models.find((m: any) => 
        m.supportedGenerationMethods?.includes('generateContent') && 
        m.name.includes('flash')
    );
    if (flashFallback) return normalize(flashFallback.name);

    // 3. Fallback: Any model supporting content generation
    const anyFallback = models.find((m: any) => 
        m.supportedGenerationMethods?.includes('generateContent')
    );
    if (anyFallback) return normalize(anyFallback.name);

    // 4. No suitable model found in list (rare)
    throw new Error("No valid generative models found for this API key.");

  } catch (error) {
    console.error("Model validation error:", error);
    // On network error or other issues, assume preferred is correct to allow retry
    return preferredModel; 
  }
};

export const transcribeAudio = async (
  audioBlob: Blob, 
  apiKey: string,
  modelId: string
): Promise<{ text: string, usage: { tokens: number, cost: number } }> => {
  if (!apiKey) throw new Error("API Key is missing");

  const base64Data = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      const base64 = result.split(',')[1];
      resolve(base64);
    };
    reader.readAsDataURL(audioBlob);
  });

  const url = buildGenerateUrl(modelId, apiKey);
  console.log(`Transcribing with model: ${modelId} -> ${url.replace(apiKey, 'HIDDEN')}`);

  const payload = {
    contents: [{
      parts: [
        {
          inline_data: {
            mime_type: audioBlob.type || 'audio/webm',
            data: base64Data
          }
        },
        {
          text: "Transcribe this audio. Return ONLY the transcript. Do not add intro/outro text. If the audio is silent or unintelligible, return '[Unintelligible Audio]'."
        }
      ]
    }]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = errData.error?.message || response.statusText;
    if (response.status === 404) {
        throw new Error(`Model '${modelId}' not found (404). Check Settings > Model ID.`);
    }
    throw new Error(`Gemini API Error: ${msg}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const usageMeta = data.usageMetadata || {};
  const totalTokens = usageMeta.totalTokenCount || (1000 + text.length / 4);
  const cost = (totalTokens / 1000000) * COST_PER_1M_TOKENS;

  return { text, usage: { tokens: Math.floor(totalTokens), cost } };
};

export const transformText = async (
  text: string, 
  mode: PromptMode, 
  customInstruction: string, 
  apiKey: string,
  modelId: string
): Promise<{ text: string, usage: { tokens: number, cost: number } }> => {
  if (!apiKey) throw new Error("API Key is missing");

  let systemPrompt = "";
  switch (mode) {
    case PromptMode.ENHANCER:
      systemPrompt = "You are an expert prompt engineer. Clean up the following text, fix grammar, remove filler words, and structure it into a clear, concise paragraph or set of paragraphs. Preserve the original intent perfectly.";
      break;
    case PromptMode.DEEP:
      systemPrompt = "You are a senior technical program manager. Convert the following unstructured thoughts into a comprehensive Structured Prompt. Use the following headers strictly: ## Context, ## Goals, ## Constraints, ## Requirements, ## Assumptions, ## Open Questions, ## Next Steps. Use bullet points.";
      break;
    case PromptMode.NOTES:
      systemPrompt = "Convert the following text into extremely concise, high-density bullet points. Capture only the key facts and action items.";
      break;
    case PromptMode.CUSTOM:
      systemPrompt = customInstruction || "Put literally whatever you want here.";
      break;
  }

  const url = buildGenerateUrl(modelId, apiKey);
  console.log(`Promptifying with model: ${modelId} -> ${url.replace(apiKey, 'HIDDEN')}`);

  const payload = {
    contents: [{
      parts: [
        { text: `Task: ${systemPrompt}\n\nInput Text:\n${text}` }
      ]
    }]
  };

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    const msg = errData.error?.message || response.statusText;
    if (response.status === 404) {
        throw new Error(`Model '${modelId}' not found (404). Check Settings > Model ID.`);
    }
    throw new Error(`Gemini API Error: ${msg}`);
  }

  const data = await response.json();
  const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
  const usageMeta = data.usageMetadata || {};
  const totalTokens = usageMeta.totalTokenCount || (text.length + resultText.length)/4;
  const cost = (totalTokens / 1000000) * COST_PER_1M_TOKENS;

  return { text: resultText, usage: { tokens: Math.floor(totalTokens), cost } };
};
'use server';
/**
 * @fileOverview An AI flow for extracting and transliterating text from an image.
 *
 * - extractTextFromImage - A function that handles the text extraction and transliteration process.
 * - TransliterationInput - The input type for the extractTextFromImage function.
 * - TransliterationOutput - The return type for the extractTextFromImage function.
 */

import {genkit, z} from 'genkit';
import {googleAI} from '@genkit-ai/googleai';

type TransliterationProvider = 'ollama' | 'groq' | 'gemini';

class ProviderRequestError extends Error {
  status?: number;

  constructor(message: string, status?: number) {
    super(message);
    this.name = 'ProviderRequestError';
    this.status = status;
  }
}

const TransliterationInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo containing text, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  targetLanguage: z.string().describe("The target language for transliteration (e.g., 'Hindi', 'English', 'Tamil').")
});
export type TransliterationInput = z.infer<typeof TransliterationInputSchema>;

const TransliterationOutputSchema = z.object({
    extractedText: z.string().describe("The transliterated text from the image.")
});
export type TransliterationOutput = z.infer<typeof TransliterationOutputSchema>;

export async function extractTextFromImage(input: TransliterationInput): Promise<TransliterationOutput> {
  const parsedInput = TransliterationInputSchema.parse(input);
  const provider = resolveTransliterationProvider();

  try {
    if (provider === 'gemini') {
      return await runGeminiTransliteration(parsedInput);
    }

    if (provider === 'groq') {
      const groqModel =
        process.env.GROQ_TRANSLITERATION_MODEL ||
        process.env.GROQ_MODEL ||
        'meta-llama/llama-4-scout-17b-16e-instruct';
      const groqBaseUrl = process.env.GROQ_BASE_URL || 'https://api.groq.com/openai/v1';
      const groqApiKey = process.env.GROQ_API_KEY;

      if (!groqApiKey) {
        throw new Error('Missing GROQ_API_KEY for transliteration provider GROQ=true.');
      }

      return await runOpenAICompatibleTransliteration(parsedInput, {
        providerName: 'GROQ',
        baseUrl: groqBaseUrl,
        apiKey: groqApiKey,
        model: groqModel,
      });
    }

    const ollamaModel =
      process.env.OLLAMA_TRANSLITERATION_MODEL ||
      process.env.OLLAMA_MODEL ||
      'qwen3.5:27b';
    const ollamaBaseUrl = process.env.OLLAMA_BASE_URL || 'http://localhost:49152/v1';
    const ollamaApiKey = process.env.OLLAMA_API_KEY;

    return await runOpenAICompatibleTransliteration(parsedInput, {
      providerName: 'OLLAMA',
      baseUrl: ollamaBaseUrl,
      apiKey: ollamaApiKey,
      model: ollamaModel,
    });
  } catch (error) {
    console.error(`[Transliteration] Provider ${provider} failed`, error);
    throw new Error('Unable to extract and transliterate text from image. Check AI provider env settings and model availability.');
  }
}

const OcrOutputSchema = z.object({
  rawText: z.string().describe("All text extracted from the image exactly as written."),
  detectedScript: z.string().describe("The script/language detected in the image (e.g., Tamil, Hindi, English, mixed).")
});

const TransliterateInputSchema = z.object({
  sourceText: z.string().describe("The source text to transliterate."),
  sourceScript: z.string().describe("The script the source text is written in."),
  targetLanguage: z.string().describe("The target language/script to transliterate into.")
});

function envFlag(name: string): boolean {
  const value = process.env[name];
  if (!value) {
    return false;
  }
  const normalized = value.trim().toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'on';
}

function resolveTransliterationProvider(): TransliterationProvider {
  const enabledProviders: TransliterationProvider[] = [];

  if (envFlag('OLLAMA')) {
    enabledProviders.push('ollama');
  }
  if (envFlag('GROQ')) {
    enabledProviders.push('groq');
  }
  if (envFlag('GEMINI')) {
    enabledProviders.push('gemini');
  }

  if (enabledProviders.length !== 1) {
    throw new Error(
      'Exactly one transliteration provider must be enabled in env: set only one of OLLAMA=true, GROQ=true, GEMINI=true.'
    );
  }

  return enabledProviders[0];
}

function getStatusFromError(error: unknown): number | undefined {
  if (error instanceof ProviderRequestError) {
    return error.status;
  }

  if (typeof error === 'object' && error !== null) {
    const withStatus = error as { status?: unknown; code?: unknown };
    if (typeof withStatus.status === 'number') {
      return withStatus.status;
    }
    if (typeof withStatus.code === 'number') {
      return withStatus.code;
    }
  }

  return undefined;
}

async function withRetries<T>(label: string, task: () => Promise<T>, maxRetries = 3): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await task();
    } catch (error) {
      const status = getStatusFromError(error);
      const isRetryable = status === 429 || status === 503;

      if (isRetryable && attempt < maxRetries) {
        console.log(`[Transliteration] ${label} attempt ${attempt} failed (${status}), retrying...`);
        await new Promise(resolve => setTimeout(resolve, attempt * 2000));
        continue;
      }

      throw error;
    }
  }

  throw new Error(`[Transliteration] ${label} failed after retries.`);
}

function stripCodeFences(text: string): string {
  const trimmed = text.trim();
  if (!trimmed.startsWith('```')) {
    return trimmed;
  }

  return trimmed
    .replace(/^```[a-zA-Z0-9_-]*\s*/u, '')
    .replace(/\s*```$/u, '')
    .trim();
}

function parseModelJson(raw: string): unknown {
  const cleaned = stripCodeFences(raw);
  try {
    return JSON.parse(cleaned);
  } catch {
    const start = cleaned.indexOf('{');
    const end = cleaned.lastIndexOf('}');
    if (start >= 0 && end > start) {
      const candidate = cleaned.slice(start, end + 1);
      return JSON.parse(candidate);
    }
    throw new Error(`Model did not return valid JSON. Response preview: ${cleaned.slice(0, 200)}`);
  }
}

function parseOpenAIContent(content: unknown): string {
  if (typeof content === 'string') {
    return content;
  }

  if (Array.isArray(content)) {
    const joined = content
      .map(part => {
        if (typeof part === 'string') {
          return part;
        }
        if (typeof part === 'object' && part !== null) {
          const partText = (part as { text?: unknown }).text;
          if (typeof partText === 'string') {
            return partText;
          }
        }
        return '';
      })
      .join('');
    return joined;
  }

  return '';
}

function extractAssistantText(payload: unknown): string {
  if (typeof payload !== 'object' || payload === null) {
    throw new Error('Invalid provider response payload.');
  }

  const choices = (payload as { choices?: unknown }).choices;
  if (!Array.isArray(choices) || choices.length === 0) {
    throw new Error('No choices returned from provider.');
  }

  const firstChoice = choices[0];
  if (typeof firstChoice !== 'object' || firstChoice === null) {
    throw new Error('Invalid choice format from provider.');
  }

  const message = (firstChoice as { message?: unknown }).message;
  if (typeof message !== 'object' || message === null) {
    throw new Error('No assistant message in provider response.');
  }

  const content = (message as { content?: unknown }).content;
  const text = parseOpenAIContent(content).trim();
  if (!text) {
    throw new Error('Provider returned empty assistant content.');
  }

  return text;
}

function shouldReturnRawText(detectedScript: string, targetLanguage: string): boolean {
  const detected = detectedScript.toLowerCase();
  const target = targetLanguage.toLowerCase();
  return detected === target || detected.includes(target);
}

async function runGeminiTransliteration(input: TransliterationInput): Promise<TransliterationOutput> {
  const apiKey = process.env.GOOGLE_GENAI_TRANSLITERATION_API_KEY || process.env.GOOGLE_GENAI_API_KEY;
  if (!apiKey) {
    throw new Error('Missing GOOGLE_GENAI_TRANSLITERATION_API_KEY (or GOOGLE_GENAI_API_KEY) for GEMINI=true.');
  }

  const model =
    process.env.GEMINI_TRANSLITERATION_MODEL ||
    process.env.GEMINI_MODEL ||
    'googleai/gemini-2.5-flash-lite';

  const transliterationAi = genkit({
    plugins: [googleAI({ apiKey })],
    model,
  });

  const ocrPrompt = transliterationAi.definePrompt({
    name: 'transliterationOcrPrompt',
    input: {schema: z.object({ photoDataUri: z.string() })},
    output: {schema: OcrOutputSchema},
    model,
    prompt: `You are an OCR engine. Extract all text visible in this image exactly as written. Do not translate or transliterate. Return line breaks as-is and identify the detected script/language.

Image:
{{media url=photoDataUri}}`,
  });

  const transliteratePrompt = transliterationAi.definePrompt({
    name: 'transliterationScriptPrompt',
    input: {schema: TransliterateInputSchema},
    output: {schema: TransliterationOutputSchema},
    model,
    prompt: `You are a transliteration engine.

Convert SOURCE TEXT from {{sourceScript}} script into {{targetLanguage}} script by preserving pronunciation (sound), not meaning.
- Do transliteration only, never translation.
- Preserve line breaks.
- Keep numbers/symbols unchanged.

SOURCE TEXT:
"""
{{sourceText}}
"""

Return only the transliterated text.`,
  });

  const ocrOutput = await withRetries('Gemini OCR', async () => {
    const {output} = await ocrPrompt(
      {photoDataUri: input.photoDataUri},
      {config: {temperature: 0.1, maxOutputTokens: 2048}}
    );
    if (!output || !output.rawText) {
      throw new Error('No text extracted from image.');
    }
    return output;
  });

  if (shouldReturnRawText(ocrOutput.detectedScript || '', input.targetLanguage)) {
    return {extractedText: ocrOutput.rawText};
  }

  return withRetries('Gemini transliteration', async () => {
    const {output} = await transliteratePrompt(
      {
        sourceText: ocrOutput.rawText,
        sourceScript: ocrOutput.detectedScript || 'Unknown',
        targetLanguage: input.targetLanguage,
      },
      {config: {temperature: 0.2, maxOutputTokens: 2048}}
    );
    if (!output || !output.extractedText) {
      throw new Error('No output from transliteration.');
    }
    return output;
  });
}

type OpenAICompatibleConfig = {
  providerName: 'OLLAMA' | 'GROQ';
  baseUrl: string;
  apiKey?: string;
  model: string;
};

async function callOpenAICompatible(
  config: OpenAICompatibleConfig,
  body: {
    messages: unknown[];
    temperature: number;
    max_completion_tokens: number;
  }
): Promise<string> {
  const endpoint = `${config.baseUrl.replace(/\/+$/u, '')}/chat/completions`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (config.apiKey) {
    headers.Authorization = `Bearer ${config.apiKey}`;
  }

  const response = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: config.model,
      messages: body.messages,
      temperature: body.temperature,
      max_completion_tokens: body.max_completion_tokens,
      stream: false,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new ProviderRequestError(
      `[${config.providerName}] ${response.status} ${response.statusText}: ${errorText}`,
      response.status
    );
  }

  const payload: unknown = await response.json();
  return extractAssistantText(payload);
}

async function runOpenAICompatibleTransliteration(
  input: TransliterationInput,
  config: OpenAICompatibleConfig
): Promise<TransliterationOutput> {
  const ocrRaw = await withRetries(`${config.providerName} OCR`, async () => {
    return callOpenAICompatible(config, {
      messages: [
        {
          role: 'system',
          content:
            'You are an OCR engine. Extract all text from image exactly as-is. Do not translate or transliterate. Reply with JSON only: {"rawText":"...","detectedScript":"..."}.',
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Extract text from this image and return strict JSON with rawText and detectedScript.',
            },
            {
              type: 'image_url',
              image_url: {
                url: input.photoDataUri,
              },
            },
          ],
        },
      ],
      temperature: 0.1,
      max_completion_tokens: 2048,
    });
  });

  const ocrOutput = OcrOutputSchema.parse(parseModelJson(ocrRaw));

  if (shouldReturnRawText(ocrOutput.detectedScript || '', input.targetLanguage)) {
    return {extractedText: ocrOutput.rawText};
  }

  const transliteratedRaw = await withRetries(`${config.providerName} transliteration`, async () => {
    return callOpenAICompatible(config, {
      messages: [
        {
          role: 'system',
          content:
            'You are a transliteration engine. Transliterate by sound, never translate by meaning. Reply with JSON only: {"extractedText":"..."}.',
        },
        {
          role: 'user',
          content: `Source script: ${ocrOutput.detectedScript || 'Unknown'}\nTarget script/language: ${input.targetLanguage}\n\nSource text:\n${ocrOutput.rawText}\n\nReturn strict JSON only with key extractedText.`,
        },
      ],
      temperature: 0.2,
      max_completion_tokens: 2048,
    });
  });

  return TransliterationOutputSchema.parse(parseModelJson(transliteratedRaw));
}

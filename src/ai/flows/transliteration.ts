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

// Separate Genkit instance with its own API key for transliteration
const transliterationAi = genkit({
  plugins: [googleAI({ apiKey: process.env.GOOGLE_GENAI_TRANSLITERATION_API_KEY })],
  model: 'googleai/gemini-2.5-flash-lite',
});

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
  return transliterationFlow(input);
}

// --- STEP 1: OCR - Extract raw text from image ---
const OcrOutputSchema = z.object({
  rawText: z.string().describe("All text extracted from the image exactly as written."),
  detectedScript: z.string().describe("The script/language detected in the image (e.g., Tamil, Hindi, English, mixed).")
});

const ocrPrompt = transliterationAi.definePrompt({
  name: 'ocrPrompt',
  input: {schema: z.object({ photoDataUri: z.string() })},
  output: {schema: OcrOutputSchema},
  model: 'googleai/gemini-2.5-flash-lite',
  prompt: `You are an OCR engine. Extract ALL text visible in this image exactly as written. Do not modify, translate, or transliterate anything. Return the raw text preserving line breaks. Also identify what script/language the text is in.

Here is the image:
{{media url=photoDataUri}}`,
});

// --- STEP 2: Transliterate extracted text ---
const TransliterateInputSchema = z.object({
  sourceText: z.string().describe("The source text to transliterate."),
  sourceScript: z.string().describe("The script the source text is written in."),
  targetLanguage: z.string().describe("The target language/script to transliterate into.")
});

const transliteratePrompt = transliterationAi.definePrompt({
  name: 'transliteratePrompt',
  input: {schema: TransliterateInputSchema},
  output: {schema: TransliterationOutputSchema},
  model: 'googleai/gemini-2.5-flash-lite',
  prompt: `You are a TRANSLITERATION engine. You convert text from one SCRIPT to another SCRIPT phonetically.

IMPORTANT: This is TRANSLITERATION, NOT TRANSLATION.
- Transliteration = rewrite the SAME SOUNDS using DIFFERENT script/alphabet letters.
- Translation = convert MEANING to another language. DO NOT DO THIS.

SOURCE TEXT (in {{sourceScript}} script):
"""
{{sourceText}}
"""

TARGET SCRIPT: {{targetLanguage}}

YOUR TASK: Convert every word from the source text into {{targetLanguage}} script by reproducing the PRONUNCIATION/SOUNDS, NOT the meaning.

RULES:
1. Keep the same sounds, only change the letters/script.
2. Your output must contain ZERO characters from the original {{sourceScript}} script.
3. Every letter must be in {{targetLanguage}} script.
4. Numbers and symbols stay as-is: "28" → "28", "₹" → "₹", "TN-29" → "TN-29"
5. Preserve line breaks.

EXAMPLES OF CORRECT TRANSLITERATION (sounds preserved, script changed):
- Tamil "அரசுப்பேருந்து" → English "Arasupperundhu"
- Tamil "சேலம்" → English "Sēlam" or "Salem"
- Tamil "நேர்வழி" → English "Nervazhi"
- Tamil "தமிழ்நாடு" → English "Tamilnadu"
- Tamil "திருநெல்வேலி" → English "Tirunelveli"
- Tamil "பேருந்து" → Hindi "पेरुन्दु" (NOT "बस" which is translation)
- Hindi "नमस्ते" → Tamil "நமஸ்தே" (NOT "வணக்கம்" which is translation)
- Hindi "नमस्ते" → English "Namaste"
- English "Hello" → Tamil "ஹெலோ"
- English "Hello" → Hindi "हैलो"
- English "Station" → Tamil "ஸ்டேஷன்"

EXAMPLES OF WRONG OUTPUT (translation, NOT transliteration — DO NOT DO THIS):
- Tamil "பேருந்து" → Hindi "बस" ← WRONG (this translates the meaning)
- Tamil "நன்றி" → Hindi "धन्यवाद" ← WRONG (this translates the meaning)
- Hindi "खाना" → Tamil "உணவு" ← WRONG (this translates the meaning)

Now transliterate the source text into {{targetLanguage}} script. Output ONLY the transliterated text:`,
});

const transliterationFlow = transliterationAi.defineFlow(
  {
    name: 'transliterationFlow',
    inputSchema: TransliterationInputSchema,
    outputSchema: TransliterationOutputSchema,
  },
  async input => {
    const maxRetries = 3;

    // STEP 1: OCR - Extract raw text from image
    let rawText = '';
    let detectedScript = '';
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const {output} = await ocrPrompt({ photoDataUri: input.photoDataUri }, { config: { temperature: 0.1, maxOutputTokens: 2048 } });
        if (!output || !output.rawText) {
          throw new Error('No text extracted from image');
        }
        rawText = output.rawText;
        detectedScript = output.detectedScript || 'Unknown';
        console.log(`OCR extracted (${detectedScript}): ${rawText.substring(0, 100)}...`);
        break;
      } catch(e: any) {
        const status = e?.status || e?.code;
        const isRetryable = status === 503 || status === 429;
        if (isRetryable && attempt < maxRetries) {
          console.log(`OCR attempt ${attempt} failed (${status}), retrying...`);
          await new Promise(r => setTimeout(r, attempt * 2000));
          continue;
        }
        console.error(e);
        throw new Error('Unable to extract text from image. AI model may be temporarily unavailable.');
      }
    }

    // If the source text is already in the target script, just return it
    const targetScriptLower = input.targetLanguage.toLowerCase();
    const detectedLower = detectedScript.toLowerCase();
    if (detectedLower === targetScriptLower || detectedLower.includes(targetScriptLower)) {
      return { extractedText: rawText };
    }

    // STEP 2: Transliterate the extracted text
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const {output} = await transliteratePrompt({
          sourceText: rawText,
          sourceScript: detectedScript,
          targetLanguage: input.targetLanguage,
        }, { config: { temperature: 0.2, maxOutputTokens: 2048 } });
        if (!output || !output.extractedText) {
          throw new Error('No output from transliteration');
        }
        return output;
      } catch(e: any) {
        const status = e?.status || e?.code;
        const isRetryable = status === 503 || status === 429;
        if (isRetryable && attempt < maxRetries) {
          console.log(`Transliteration attempt ${attempt} failed (${status}), retrying...`);
          await new Promise(r => setTimeout(r, attempt * 2000));
          continue;
        }
        console.error(e);
        throw new Error('Unable to transliterate text. AI model may be temporarily unavailable.');
      }
    }
    throw new Error('Unable to transliterate text after multiple attempts.');
  }
);

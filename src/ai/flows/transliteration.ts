'use server';
/**
 * @fileOverview An AI flow for extracting and transliterating text from an image.
 *
 * - extractTextFromImage - A function that handles the text extraction and transliteration process.
 * - TransliterationInput - The input type for the extractTextFromImage function.
 * - TransliterationOutput - The return type for the extractTextFromImage function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

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

const prompt = ai.definePrompt({
  name: 'transliterationPrompt',
  input: {schema: TransliterationInputSchema},
  output: {schema: TransliterationOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert Optical Character Recognition (OCR) and transliteration engine.

  IMPORTANT: Transliteration is NOT translation. 
  - Transliteration = Converting the SOUNDS/PHONETICS of words into the letters of another script.
  - Translation = Converting the MEANING of words into another language.
  You must perform TRANSLITERATION only, never translation.

  Your task:
  1. Accurately extract all text visible in the provided image.
  2. Transliterate the extracted text phonetically into the script of the target language: {{targetLanguage}}.
     - Preserve the original pronunciation/sounds using the closest matching letters of the target script.
     - Do NOT translate the meaning of words into the target language.
     - Proper nouns, place names, and all other words must be phonetically represented, not translated.

  Examples of correct transliteration (NOT translation):
  - Tamil "அரசுப்பேருந்து" → English target: "Arasupeṟuntu" (NOT "Government Bus")
  - Tamil "சேலம்" → English target: "Sēlam" (NOT "Salem" as a translation — but phonetically "Selam")
  - Tamil "தமிழ்நாடு" → Hindi target: "तमिऴ्नाडु" (phonetic, NOT "तमिलनाडु की सरकार")
  - Tamil "தமிழ்நாடு" → English target: "Tamiḻnāṭu" (phonetic Roman letters)
  - Hindi "नमस्ते" → Tamil target: "நமஸ்தே" (phonetic, NOT a translation)

  Return only the final transliterated text, nothing else.

Here is the image to analyze:
{{media url=photoDataUri}}`,
});

const transliterationFlow = ai.defineFlow(
  {
    name: 'transliterationFlow',
    inputSchema: TransliterationInputSchema,
    outputSchema: TransliterationOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('No output from transliteration prompt');
      }
      return output;
    } catch(e) {
      console.error(e);
      throw new Error('Unable to extract text, AI model may be temporarily unavailable.')
    }
  }
);

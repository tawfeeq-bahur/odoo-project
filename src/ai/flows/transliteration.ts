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
  
  Your task is to perform two steps:
  1. Accurately extract all text from the provided image.
  2. Transliterate the extracted text into the script of the target language: {{targetLanguage}}.

  For example, if the extracted text is "தமிழ்நாடு" and the target language is "Hindi", the output should be "तमिलनाडु". If the target language is "English", the output should be "TAMIL NADU".

  Return only the final transliterated text.

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

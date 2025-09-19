
'use server';
/**
 * @fileOverview An AI flow for parsing expenses from a bill or receipt image.
 *
 * - parseExpense - A function that handles the expense parsing process.
 * - ExpenseParserInput - The input type for the parseExpense function.
 * - ExpenseParserOutput - The return type for the parseExpense function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ExpenseParserInputSchema = z.object({
  photoDataUri: z
    .string()
    .describe(
      "A photo of a bill or receipt, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
});
export type ExpenseParserInput = z.infer<typeof ExpenseParserInputSchema>;

const ParsedExpenseSchema = z.object({
    type: z.enum(["Travel", "Food", "Hotel", "Tickets", "Misc"]).describe('The type of expense.'),
    amount: z.number().describe('The total amount of the expense.'),
    date: z.string().describe('The date of the expense in YYYY-MM-DD format.'),
});

const ExpenseParserOutputSchema = z.object({
    expenses: z.array(ParsedExpenseSchema).describe("An array of expenses found in the image.")
});
export type ExpenseParserOutput = z.infer<typeof ExpenseParserOutputSchema>;

export async function parseExpense(input: ExpenseParserInput): Promise<ExpenseParserOutput> {
  return expenseParserFlow(input);
}

const prompt = ai.definePrompt({
  name: 'expenseParserPrompt',
  input: {schema: ExpenseParserInputSchema},
  output: {schema: ExpenseParserOutputSchema},
  model: 'googleai/gemini-2.5-flash',
  prompt: `You are an expert at reading and interpreting receipts and bills for tourism management.

Analyze the provided image of a bill or receipt. Identify the type of expense, the total amount, and the date.

Categorize the expense into one of the following types: "Travel", "Food", "Hotel", "Tickets", "Misc".

Extract the following information for each expense found and return it in a structured format:
- Expense Type
- Total Amount (as a number)
- Date (in YYYY-MM-DD format)

Here is the bill to analyze:
{{media url=photoDataUri}}`,
});

const expenseParserFlow = ai.defineFlow(
  {
    name: 'expenseParserFlow',
    inputSchema: ExpenseParserInputSchema,
    outputSchema: ExpenseParserOutputSchema,
  },
  async input => {
    try {
      const {output} = await prompt(input);
      if (!output) {
        throw new Error('No output from expense parser prompt');
      }
      return output;
    } catch(e) {
      console.error(e);
      throw new Error('Unable to parse expense, AI model may be temporarily unavailable.')
    }
  }
);

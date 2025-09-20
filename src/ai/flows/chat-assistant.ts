import { genkit } from 'genkit';
import { googleAI } from '@genkit-ai/googleai';

export const chatAssistant = genkit.flow(
  { name: 'chatAssistant' },
  async (input: { query: string; context?: string }) => {
    const model = googleAI('gemini-1.5-flash');

    const prompt = `You are TourJet AI Assistant, a helpful and knowledgeable travel and tourism assistant. You help users with:

1. Travel planning and recommendations
2. Tour management and organization
3. Budget planning and expense tracking
4. Route planning and navigation
5. General travel questions and advice
6. Tourism information and insights

${input.context ? `Context: ${input.context}` : ''}

User Query: ${input.query}

Please provide a helpful, accurate, and friendly response. If the query is not related to travel or tourism, politely redirect the conversation back to travel-related topics while still being helpful.

Format your response in a clear, conversational manner. Use bullet points or numbered lists when appropriate. If you're suggesting specific places or activities, try to include practical details like approximate costs, best times to visit, or any important considerations.`;

    const result = await model.generate({
      messages: [{ role: 'user', content: prompt }],
      config: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    return {
      response: result.text(),
      timestamp: new Date().toISOString(),
    };
  }
);

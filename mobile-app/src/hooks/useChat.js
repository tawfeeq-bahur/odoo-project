import { useState, useCallback, useRef } from 'react';
import { aiApi } from '../services/api';

/**
 * Manages chat state and communication with the /api/chat endpoint.
 */
export function useChat() {
  const [messages, setMessages] = useState([
    {
      id: '0',
      role: 'assistant',
      content:
        "Hello! I'm your TourJet AI assistant. Ask me anything about travel destinations, tour planning, or trip budgets!",
      timestamp: new Date().toISOString(),
    },
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const appendMessage = (role, content) => {
    const msg = {
      id: Date.now().toString(),
      role,
      content,
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, msg]);
    return msg;
  };

  const sendMessage = useCallback(
    async (text) => {
      const query = (text || input).trim();
      if (!query || isLoading) return;

      setInput('');
      appendMessage('user', query);
      setIsLoading(true);

      try {
        const res = await aiApi.chat(query);
        appendMessage('assistant', res.data?.response || 'Sorry, I could not process that.');
      } catch {
        appendMessage(
          'assistant',
          "I'm having trouble connecting right now. Please try again shortly."
        );
      } finally {
        setIsLoading(false);
      }
    },
    [input, isLoading]
  );

  const clearChat = useCallback(() => {
    setMessages([
      {
        id: '0',
        role: 'assistant',
        content: "Chat cleared! How can I help you plan your next trip?",
        timestamp: new Date().toISOString(),
      },
    ]);
  }, []);

  return { messages, input, setInput, isLoading, sendMessage, clearChat };
}

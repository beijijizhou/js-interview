// src/hooks/useGeminiChat.ts
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { initialMessage } from './constants';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  code?: string;
};


export const useGeminiChat = () => {
  const [messages, setMessages] = useState<Message[]>([initialMessage]);
  const [generatedCode, setGeneratedCode] = useState(initialMessage.code || '');  const queryClient = useQueryClient();

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_GOOGLE_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (userMessage: string) => {
      const userMessageObj: Message = { role: 'user', content: userMessage };
      setMessages(prev => [...prev, userMessageObj]);

      try {
        const prompt = `You are a JavaScript coding assistant. Respond with:
1. A clear explanation
2. A complete, runnable code example in a single markdown code block
3. Focus on modern ES6+ syntax

Question: ${userMessage}`;

        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = response.text();

        // Extract code from markdown
        const codeBlockMatch = text.match(/```(javascript|js)?\n([\s\S]*?)\n```/);
        const code = codeBlockMatch ? codeBlockMatch[2].trim() : '';
        
        // Remove code block from text to get clean explanation
        const explanation = text
          .replace(/```(javascript|js)?\n([\s\S]*?)\n```/, '')
          .trim();

        if (code) {
          queryClient.setQueryData(['generatedCode'], code);
          setGeneratedCode(code);
        }

        const aiMessage: Message = {
          role: 'assistant',
          content: explanation, // Store clean text without code block
          code
        };

        setMessages(prev => [...prev, aiMessage]);
        return aiMessage;
      } catch (error) {
        console.error('Gemini API error:', error);
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.'
        };
        setMessages(prev => [...prev, errorMessage]);
        throw error;
      }
    }
  });

  return {
    messages,
    generatedCode,
    sendMessage,
    isPending,
    setMessages,
  };
};
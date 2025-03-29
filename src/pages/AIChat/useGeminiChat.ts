// src/hooks/useGeminiChat.ts
import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { basicPrompt} from './constants';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  code?: string;
};

export const useGeminiChat = () => {
  const [messages, setMessages] = useState<Message[]>([]); // Include initialMessage if desired
  const [generatedCode, setGeneratedCode] = useState('');
  const queryClient = useQueryClient();

  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_GOOGLE_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (userMessage: string) => {
      const userMessageObj: Message = { role: 'user', content: userMessage };
      setMessages(prev => [...prev, userMessageObj]);

      try {
        const userPrompt = basicPrompt + userMessage;

        const result = await model.generateContent(userPrompt);
        const response = result.response;
        const text = response.text();

        // Extract code from Markdown code block (```javascript, ```js, or plain ```)
        const codeMatch = text.match(/```(?:javascript|js)?\n([\s\S]*?)\n```/);
        const code = codeMatch ? codeMatch[1].trim() : '';

        // Remove the code block from the text to get the explanation
        const explanation = text
          .replace(/```(?:javascript|js)?\n[\s\S]*?\n```/, '')
          .trim();

        if (code) {
          queryClient.setQueryData(['generatedCode'], code);
          setGeneratedCode(code);
        }

        const aiMessage: Message = {
          role: 'assistant',
          content: explanation, // Clean text without code block
          code, // Extracted JavaScript code, if any
        };
        console.log( {explanation})
        setMessages(prev => [...prev, aiMessage]);
        return aiMessage;
      } catch (error) {
        console.error('Gemini API error:', error);
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
        };
        setMessages(prev => [...prev, errorMessage]);
        throw error;
      }
    },
  });

  return {
    messages,
    generatedCode,
    sendMessage,
    isPending,
    setMessages,
  };
};
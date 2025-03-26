// src/hooks/useGeminiChat.ts
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GoogleGenerativeAI } from '@google/generative-ai';

type Message = {
  role: 'user' | 'assistant';
  content: string;
  code?: string;
};

export const useGeminiChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  
  // Initialize Gemini API
  const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_GOOGLE_GEMINI_API_KEY || '');
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (userMessage: string) => {
      // Add user message to chat
      const userMessageObj: Message = { role: 'user', content: userMessage };
      setMessages(prev => [...prev, userMessageObj]);

      try {
        const prompt = `You are a JavaScript coding assistant. Respond with:
1. A clear explanation
2. A complete, runnable code example in a single markdown code block
3. Focus on modern ES6+ syntax

Question: ${userMessage}`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Extract code from markdown
        const codeBlock = text.match(/```(javascript|js)?\n([\s\S]*?)\n```/);
        const code = codeBlock ? codeBlock[2] : '';

        // Add AI response to chat
        const aiMessage: Message = {
          role: 'assistant',
          content: text,
          code
        };

        setMessages(prev => [...prev, aiMessage]);
        
        // Store the generated code
        if (code) {
          setGeneratedCode(code);
        }

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
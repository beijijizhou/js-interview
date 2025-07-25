import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { queryAgent, QueryResponseChunk } from './api';

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  code?: string;
  id: number;
}

export const useGeminiChat = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');
  const [functionCall, setFunctionCall] = useState('');
  const queryClient = useQueryClient();

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (userMessage: string) => {
      // Use messages.length as the id for user message
      const userMessageObj: Message = {
        role: 'user',
        content: userMessage,
        id: messages.length,
      };
      setMessages(prev => [...prev, userMessageObj]);

      let fullText = ''; // Accumulate streamed text
      let aiMessage: Message = {
        role: 'assistant',
        content: '',
        code: '',
        id: messages.length + 1, // Next id for assistant message
      };

      try {
        await queryAgent(userMessage, (chunk: QueryResponseChunk) => {
          if (chunk.response) {
            fullText += chunk.response; // Build the full response incrementally
            // Update UI with partial content
            setMessages(prev => {
              const lastMessage = prev[prev.length - 1];
              if (lastMessage.role === 'assistant') {
                // Update existing assistant message
                return [
                  ...prev.slice(0, -1),
                  { ...lastMessage, content: fullText },
                ];
              } else {
                // Add new assistant message
                return [...prev, aiMessage];
              }
            });
          } else if (chunk.function_call) {
            console.log(chunk.function_call);
            setFunctionCall(chunk.function_call);
          } else if (chunk.error) {
            throw new Error(chunk.error);
          } else if (chunk.warning) {
            console.warn('Warning:', chunk.warning);
          }
        });

        // Process the final accumulated text
        const codeMatch = fullText.match(/```(?:javascript|js)?\n([\s\S]*?)\n```/);
        const code = codeMatch ? codeMatch[1].trim() : '';
        const explanation = fullText
          .replace(/```(?:javascript|js)?\n[\s\S]*?\n```/, '')
          .trim();

        if (code) {
          queryClient.setQueryData(['generatedCode'], code);
          setGeneratedCode(code);
        }

        aiMessage = {
          role: 'assistant',
          content: explanation,
          code,
          id: aiMessage.id, // Retain original id
        };

        // Final update to messages with cleaned-up content
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === 'assistant') {
            return [...prev.slice(0, -1), aiMessage];
          }
          return [...prev, aiMessage];
        });

        return aiMessage;
      } catch (error) {
        console.error('Gemini API error:', error);
        const errorMessage: Message = {
          role: 'assistant',
          content: 'Sorry, I encountered an error. Please try again.',
          id: messages.length, // Use current length for error message
        };
        setMessages(prev => {
          const lastMessage = prev[prev.length - 1];
          if (lastMessage.role === 'assistant') {
            return [...prev.slice(0, -1), errorMessage];
          }
          return [...prev, errorMessage];
        });
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
    functionCall,
  };
};
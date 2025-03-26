// src/components/AIChat.tsx
import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_API_GOOGLE_GEMINI_API_KEY || '');
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

type Message = {
  role: 'user' | 'assistant';
  content: string;
  code?: string;
};

export const AIChat = () => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [generatedCode, setGeneratedCode] = useState('');

  const { mutate: sendMessage, isPending } = useMutation({
    mutationFn: async (userMessage: string) => {
      // Add user message to chat
      setMessages(prev => [...prev, { role: 'user', content: userMessage }]);

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <div className="max-w-2xl mx-auto p-4 bg-white rounded-lg shadow">
      <h2 className="text-xl font-bold mb-4">JavaScript AI Assistant</h2>
      
      {/* Chat messages */}
      <div className="mb-4 space-y-4 max-h-96 overflow-y-auto">
        {messages.length === 0 ? (
          <p className="text-gray-500">Ask me anything about JavaScript...</p>
        ) : (
          messages.map((msg, i) => (
            <div 
              key={i} 
              className={`p-3 rounded-lg ${
                msg.role === 'user' 
                  ? 'bg-blue-50 text-blue-900 ml-auto max-w-[80%]'
                  : 'bg-gray-50 text-gray-900 mr-auto max-w-[80%]'
              }`}
            >
              <div className="font-medium">
                {msg.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="mt-1 whitespace-pre-wrap">
                {msg.content}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Generated code preview (hidden when empty) */}
      {generatedCode && (
        <div className="mb-4 p-3 bg-gray-100 rounded">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">Generated Code</h3>
            <button 
              onClick={() => navigator.clipboard.writeText(generatedCode)}
              className="text-sm bg-blue-500 text-white px-2 py-1 rounded"
            >
              Copy
            </button>
          </div>
          <pre className="text-sm bg-white p-2 rounded overflow-x-auto">
            {generatedCode}
          </pre>
        </div>
      )}

      {/* Input form */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about JavaScript..."
          className="flex-1 p-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
          disabled={isPending}
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
        >
          {isPending ? '...' : 'Send'}
        </button>
      </form>
    </div>
  );
};
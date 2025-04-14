// src/components/AIChat.tsx
import { useState } from 'react';
import { useGeminiChat } from './useGeminiChat';
import { CopyButton } from './CopyButton';
import { SendingButton } from './SendingButton';

export const AIChat = () => {
  const [input, setInput] = useState('what is promise');
  const {
    messages,
    generatedCode,
    sendMessage,
    isPending,
    functionCall,
  } = useGeminiChat();

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
              className={`p-3 rounded-lg ${msg.role === 'user'
                ? 'bg-blue-50 text-blue-900 ml-auto max-w-[80%]'
                : 'bg-gray-50 text-gray-900 mr-auto max-w-[80%]'
                }`}
            >
              <div className="font-medium">
                {msg.role === 'user' ? 'You' : 'Assistant'}
              </div>
              <div className="mt-1">
                {functionCall && <div>{functionCall}</div>}
                <div className="whitespace-pre-wrap">

                  {msg.content}

                </div>
                {/* Separate code block if it exists */}
                {msg.code && (
                  <pre className="mt-2 text-sm bg-white p-2 rounded overflow-x-auto">
                    <CopyButton textToCopy={generatedCode} />

                    {/* <code>{msg.code}</code> */}

                  </pre>

                )}
              </div>
            </div>
          ))
        )}
      </div>


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
        <SendingButton loading={isPending}>
          Send
        </SendingButton>
      </form>
    </div>
  );
};
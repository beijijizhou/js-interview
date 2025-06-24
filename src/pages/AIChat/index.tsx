import { useState } from 'react';
import { useGeminiChat } from './useGeminiChat';
import { CopyButton } from './CopyButton';
import { SendingButton } from './SendingButton';


export const AIChat = () => {
  const [input, setInput] = useState('what is promise');
  const [editID, setEditID] = useState<number | null>(null);
  const [editedContent, setEditedContent] = useState<string>(''); // Track edited content
  const { messages, sendMessage, isPending } = useGeminiChat();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isPending) return;
    sendMessage(input);
    setInput('');
    setEditID(null); // Exit edit mode on new message
  };

  const handleEdit = (id: number, newContent?: string) => {
    if (newContent !== undefined) {
      // Save edited content
      console.log(`Saving message with ID: ${id}, New content: ${newContent}`);
      // Update messages (example; adjust based on useGeminiChat)
      // setMessages(messages.map(msg => msg.id === id ? { ...msg, content: newContent } : msg));
      setEditID(null); // Exit edit mode
    } else {
      // Enter edit mode
      const msg = messages.find(msg => msg.id === id);
      if (msg) {
        setEditedContent(msg.content); // Initialize with current content
        setEditID(id);
        console.log(`Editing message with ID: ${id}`);
      }
    }
  };

  const handleCancel = () => {
    setEditedContent('');
    setEditID(null); // Exit edit mode
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
              <div className="font-medium">{msg.role === 'user' ? 'You' : 'Assistant'}</div>
              <div className="mt-2 group relative p-3 bg-gray-50 rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200">
                {msg.id === editID ? (
                  <div className="flex flex-col gap-2">
                    <textarea
                      className="w-full p-2 text-gray-800 text-base leading-relaxed border border-gray-300 rounded-md resize-y focus:outline-none focus:ring-2 focus:ring-blue-500"
                      value={editedContent}
                      onChange={(e) => setEditedContent(e.target.value)}
                      rows={4}
                      autoFocus
                    />
                    <div className="flex gap-2">
                      <button
                        className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1 rounded-md shadow-sm"
                        onClick={() => msg.id !== undefined && handleEdit(msg.id, editedContent)}
                        disabled={msg.id === undefined}
                      >
                        Save
                      </button>
                      <button
                        className="bg-gray-500 hover:bg-gray-600 text-white text-sm font-medium px-3 py-1 rounded-md shadow-sm"
                        onClick={handleCancel}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="whitespace-pre-wrap text-gray-800 text-base leading-relaxed">
                      {msg.content}
                    </div>
                    {msg.role === 'user' && (
                      <button
                        className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-3 py-1 rounded-md shadow-sm"
                        onClick={() => msg.id !== undefined && handleEdit(msg.id)}
                        disabled={msg.id === undefined}
                        aria-label="Edit message"
                      >
                        Edit
                      </button>
                    )}
                  </>
                )}
                {msg.code && (
                  <pre className="mt-3 bg-gray-900 text-gray-100 p-4 rounded-lg text-sm overflow-x-auto relative">
                    <CopyButton textToCopy={msg.code} />
                    <code>{msg.code}</code>
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
        <SendingButton loading={isPending}>Send</SendingButton>
      </form>
    </div>
  );
};

export default AIChat;
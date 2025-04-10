import { API_BASE_URL } from "../../util/api";

// src/hooks/api.ts
export interface QueryResponseChunk {
  response?: string;
  error?: string;
  warning?: string;
}

export const queryAgent = async (prompt: string, onChunk: (chunk: QueryResponseChunk) => void): Promise<void> => {
  const response = await fetch(`${API_BASE_URL}/query`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to query agent: ${response.status} ${errorText}`);
  }
  if (!response.body) throw new Error('No response body');

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      console.log(lines)
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.trim()) {
          const chunk: QueryResponseChunk = JSON.parse(line);
          onChunk(chunk);
        }
      }
    }
  } finally {
    reader.releaseLock();
  }
};
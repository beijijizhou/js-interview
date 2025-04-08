// api.ts
import axios from 'axios';
import { API_BASE_URL } from '../../util/api';


interface QueryResponse {
  response: string;
  status: string;
}

export const queryAgent = async (prompt: string): Promise<QueryResponse> => {
  try {
    const response = await axios.post<QueryResponse>(`${API_BASE_URL}/query`, {
      prompt
    });
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.detail || 'Failed to query agent');
    }
    throw new Error('Unknown error occurred');
  }
};

export const checkHealth = async (): Promise<{ status: string }> => {
  const response = await axios.get<{ status: string }>(`${API_BASE_URL}/health`);
  return response.data;
};
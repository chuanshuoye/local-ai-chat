import { API_PATHS } from '@/constants';

/**
 * Ollama API 接口
 */
export const ollamaApi = {
  chat: async (payload: {
    model: string;
    messages: Array<{
      role: string;
      content: string;
    }>;
    stream?: boolean;
    options?: {
      temperature?: number;
      top_p?: number;
      top_k?: number;
      num_predict?: number;
      stop?: string[];
    };
  }) => {
    const response = await fetch(API_PATHS.OLLAMA, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }
    
    // 处理流式响应
    if (payload.stream) {
      return response;
    }
    
    // 处理非流式响应
    return response.json();
  }
}; 
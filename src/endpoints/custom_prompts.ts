import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { withRetry } from '../utils/retry';
import { StandardLLMSettings } from '../common-types';

// Define the RetryOptions type based on the options in retry.ts
type RetryOptions = {
  num_retry?: number;
  initial_delay?: number;
  exponential_backoff?: boolean;
};

export interface CustomPromptParams {
  prompt_template_id: string; // UUIDs are strings in TS/JS
  template_vars?: Record<string, any>;
  settings?: StandardLLMSettings;
}

export interface CustomPromptResponse {
  request_id: string;
  metadata: Record<string, any>;
  result: any; 
  svml_version: string;
  svml_credits: number;
  input: Record<string, any>;
  output: Record<string, any>;
  [key: string]: any; // allow extra fields
}

export async function customPrompt(
  apiClient: AxiosInstance,
  token: string,
  params: CustomPromptParams,
  retryConfig?: RetryOptions
): Promise<CustomPromptResponse> {
  try {
    const response = await withRetry(() => {
      return apiClient.post('/custom', params, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
    }, retryConfig);

    // For backward compatibility
    const data = response.data;
    return {
      ...data,
      tokens_input: data.metadata?.tokens_input,
      tokens_output: data.metadata?.tokens_output,
      model: data.metadata?.model,
      latency_ms: data.metadata?.latency_ms,
    };
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `API Error (${error.response.status}): ${
          error.response.data?.detail || error.response.data?.error || error.message
        }`
      );
    }
    throw error;
  }
}

export interface CustomPromptStreamParams extends CustomPromptParams {
  onChunk?: (chunk: string) => void;
  onError?: (error: Error) => void;
  onComplete?: () => void;
}

export async function customPromptStream(
  apiClient: AxiosInstance,
  token: string,
  params: CustomPromptStreamParams
): Promise<ReadableStream<Uint8Array>> {
  try {
    const { onChunk, onError, onComplete, ...requestParams } = params;
    
    const response = await apiClient.post('/custom-stream', requestParams, {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      responseType: 'stream'
    });
    
    return response.data;
  } catch (error: any) {
    if (error.response) {
      throw new Error(
        `API Error (${error.response.status}): ${
          error.response.data?.detail || error.response.data?.error || error.message
        }`
      );
    }
    throw error;
  }
}

// Helper function to process SSE stream with callbacks
export function processSSEStream(
  stream: ReadableStream<Uint8Array>,
  onChunk: (chunk: string) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void
): void {
  const reader = stream.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  
  function processText(text: string) {
    buffer += text;
    const lines = buffer.split('\n\n');
    buffer = lines.pop() || '';
    
    for (const line of lines) {
      if (line.trim() === '') continue;
      
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        
        if (data === '[DONE]') {
          if (onComplete) onComplete();
          return;
        }
        
        try {
          const parsed = JSON.parse(data);
          
          if (parsed.error) {
            if (onError) onError(new Error(parsed.error));
          } else if (parsed.chunk) {
            onChunk(parsed.chunk);
          }
        } catch (e) {
          console.error('Error parsing SSE data:', e);
          if (onError) onError(new Error('Error parsing stream data'));
        }
      }
    }
  }
  
  function read() {
    reader.read().then(({ done, value }) => {
      if (done) {
        if (buffer.length > 0) {
          processText('');
        }
        if (onComplete) onComplete();
        return;
      }
      
      try {
        const text = decoder.decode(value, { stream: true });
        processText(text);
      } catch (e) {
        if (onError) onError(new Error('Error decoding stream data'));
      }
      
      read();
    }).catch(e => {
      if (onError) onError(e instanceof Error ? e : new Error(String(e)));
    });
  }
  
  read();
} 
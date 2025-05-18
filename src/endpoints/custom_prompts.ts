import { AxiosInstance } from 'axios';
import { StandardLLMSettings } from '../common-types';

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
  api: AxiosInstance,
  token: string,
  params: CustomPromptParams
): Promise<CustomPromptResponse> {
  const response = await api.post(
    '/custom',
    params,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
} 
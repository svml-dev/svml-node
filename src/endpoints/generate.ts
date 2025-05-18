import { AxiosInstance } from 'axios';
import { StandardLLMSettings } from '../common-types';

/**
 * Parameters for the /generate endpoint.
 */
export interface GenerateParams {
  /** The natural language context to generate SVML from. */
  context: string;
  /** The SVML version to use (e.g., '1.2.2'). */
  // svml_version: string;
  /** The model to use for generation (e.g., 'gpt-4.1-mini'). */
  // model: string;
  settings?: StandardLLMSettings;
}

/**
 * Response from the /generate endpoint.
 */
export interface GenerateResponse {
  request_id: string;
  result: string;
  metadata: Record<string, any>;
  input: Record<string, any>;
  output: Record<string, any>; // You can refine this if you know the output structure
  svml_version?: string;
  svml_credits?: number;
}

/**
 * Calls the /generate endpoint to generate SVML from context.
 * @param api AxiosInstance for the API
 * @param token Bearer token for authentication
 * @param params GenerateParams
 * @returns The API response data
 */
export async function generate(
  api: AxiosInstance,
  token: string,
  params: GenerateParams
): Promise<GenerateResponse> {
  console.log('[endpoints/generate.ts] params being sent to api.post:', JSON.stringify(params, null, 2));

  const response = await api.post(
    '/generate',
    params,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  //console.log('generate response.data', response.data);
  return response.data;
} 
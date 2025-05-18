import { AxiosInstance } from 'axios';
import { StandardLLMSettings } from '../common-types';

/**
 * Parameters for the /correct endpoint.
 */
export interface CorrectParams {
  /** The full output from the /validate endpoint. */
  validation_api_output: any;
  /** The SVML version to use. */
  // svml_version: string;
  /** The model to use for correction. */
  // model: string;
  settings?: StandardLLMSettings;
}

/**
 * Response from the /correct endpoint.
 */
export interface CorrectResponse {
  request_id: string;
  result: string;
  metadata: Record<string, any>;
  input: Record<string, any>;
  output: Record<string, any>; // You can refine this if you know the output structure
  svml_version?: string;
  svml_credits?: number;
}

/**
 * Calls the /correct endpoint for SVML correction.
 * @param api AxiosInstance for the API
 * @param token Bearer token for authentication
 * @param params CorrectParams
 * @returns The API response data
 */
export async function correct(
  api: AxiosInstance,
  token: string,
  params: CorrectParams
): Promise<CorrectResponse> {
  const response = await api.post(
    '/correct',
    params,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
} 
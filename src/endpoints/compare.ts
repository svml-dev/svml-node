import { AxiosInstance } from 'axios';
import { StandardLLMSettings } from '../common-types';

/**
 * Parameters for the /compare endpoint.
 * Can compare either direct SVML strings or outputs from the /generate endpoint.
 */
export interface CompareParams {
  /** The original context for the comparison. */
  original_context: string;
  /** LLM and comparison settings. */
  settings?: StandardLLMSettings;

  // Option 1: Direct SVML comparison
  /** The first SVML string to compare. */
  svml_a?: string;
  /** The model that generated SVML A (metadata). */
  model_a?: string;
  /** The second SVML string to compare. */
  svml_b?: string;
  /** The model that generated SVML B (metadata). */
  model_b?: string;

  // Option 2: Comparison from /generate outputs
  /** The first /generate endpoint output object. */
  generate_api_output_a?: Record<string, any>;
  /** The second /generate endpoint output object. */
  generate_api_output_b?: Record<string, any>;
}

/**
 * Response from the /compare endpoint.
 */
export interface CompareResponse {
  request_id: string;
  result: string;
  metadata: Record<string, any>;
  input: Record<string, any>;
  output: Record<string, any>; // You can refine this if you know the output structure
  svml_version?: string;
  svml_credits?: number;
}

/**
 * Calls the /compare endpoint.
 * @param api AxiosInstance for the API
 * @param token Bearer token for authentication
 * @param params CompareParams (unified)
 * @returns The API response data
 */
export async function compare(
  api: AxiosInstance,
  token: string,
  params: CompareParams
): Promise<CompareResponse> {
  const response = await api.post(
    '/compare',
    params,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
} 
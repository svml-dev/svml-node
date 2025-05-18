import { AxiosInstance } from 'axios';
import { StandardLLMSettings } from '../common-types';

/**
 * Parameters for the /refine endpoint.
 * Can refine SVML directly, or from /generate or /compare outputs.
 */
export interface RefineParams {
  /** LLM and refinement settings. */
  settings?: StandardLLMSettings;

  // Common fields, though some might be extracted if using _api_output variants
  /** The SVML string to refine. Required if not using _api_output. */
  svml?: string;
  /** The original context for the SVML. Required if not using _api_output. */
  original_context?: string;
  /** Additional user context or instructions for refinement. */
  user_additional_context?: string;

  // Option 1: Refine from /generate output
  /** The /generate endpoint output object. */
  generate_api_output?: Record<string, any>;

  // Option 2: Refine from /compare output
  /** The /compare endpoint output object. */
  compare_api_output?: Record<string, any>;
  /** Which SVML from the comparison to refine ('svml_a' or 'svml_b'). Relevant if using compare_api_output. */
  svml_choice?: 'svml_a' | 'svml_b';
}

/**
 * Response from the /refine endpoint.
 */
export interface RefineResponse {
  request_id: string;
  result: string;
  metadata: Record<string, any>;
  input: Record<string, any>;
  output: Record<string, any>; // You can refine this if you know the output structure
  svml_credits?: number;
}

/**
 * Calls the /refine endpoint.
 * @param api AxiosInstance for the API
 * @param token Bearer token for authentication
 * @param params RefineParams (unified)
 * @returns The API response data
 */
export async function refine(
  api: AxiosInstance,
  token: string,
  params: RefineParams
): Promise<RefineResponse> {
  const response = await api.post(
    '/refine',
    params,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
} 
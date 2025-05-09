import { AxiosInstance } from 'axios';

/**
 * Parameters for direct SVML refinement via /refine endpoint.
 */
export interface RefineSVMLParams {
  /** The SVML string to refine. */
  svml: string;
  /** The original context for the SVML. */
  original_context: string;
  /** Additional user context or instructions for refinement. */
  user_additional_context: string;
  /** The model to use for refinement. */
  model: string;
  /** The SVML version to use (optional). */
  svml_version?: string;
}

/**
 * Parameters for refinement from /generate output via /refine endpoint.
 */
export interface RefineFromGenerateParams {
  /** The /generate endpoint output object. */
  generate_api_output: object;
  /** The original context for the SVML. */
  original_context: string;
  /** Additional user context or instructions for refinement. */
  user_additional_context: string;
  /** The model to use for refinement. */
  model: string;
  /** The SVML version to use (optional). */
  svml_version?: string;
}

/**
 * Parameters for refinement from /compare output via /refine endpoint.
 */
export interface RefineFromCompareParams {
  /** The /compare endpoint output object. */
  compare_api_output: object;
  /** The original context for the SVML. */
  original_context: string;
  /** Additional user context or instructions for refinement (optional). */
  user_additional_context?: string;
  /** The model to use for refinement. */
  model: string;
  /** The SVML version to use (optional). */
  svml_version?: string;
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
  svml_version?: string;
  svml_credits?: number;
}

/**
 * Calls the /refine endpoint for direct SVML refinement.
 * @param api AxiosInstance for the API
 * @param token Bearer token for authentication
 * @param params RefineSVMLParams
 * @returns The API response data
 */
export async function refine(
  api: AxiosInstance,
  token: string,
  params: RefineSVMLParams
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

/**
 * Calls the /refine endpoint for refinement from /generate output.
 * @param api AxiosInstance for the API
 * @param token Bearer token for authentication
 * @param params RefineFromGenerateParams
 * @returns The API response data
 */
export async function refineFromGenerate(
  api: AxiosInstance,
  token: string,
  params: RefineFromGenerateParams
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

/**
 * Calls the /refine endpoint for refinement from /compare output.
 * @param api AxiosInstance for the API
 * @param token Bearer token for authentication
 * @param params RefineFromCompareParams
 * @returns The API response data
 */
export async function refineFromCompare(
  api: AxiosInstance,
  token: string,
  params: RefineFromCompareParams
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
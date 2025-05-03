import { AxiosInstance } from 'axios';

/**
 * Parameters for comparing two SVML representations directly.
 * Option 1: Provide svml_a, model_a, svml_b, model_b.
 * Option 2: Provide generate_api_output_a, generate_api_output_b.
 * Both require original_context, svml_version, and model.
 */
export interface CompareSVMLParams {
  /** The first SVML string to compare. */
  svml_a: string;
  /** The model used for SVML A. */
  model_a: string;
  /** The second SVML string to compare. */
  svml_b: string;
  /** The model used for SVML B. */
  model_b: string;
  /** The original context for the comparison. */
  original_context: string;
  /** The SVML version to use. */
  svml_version: string;
  /** The model to use for the comparison. */
  model: string;
}

/**
 * Parameters for comparing two /generate endpoint outputs.
 */
export interface CompareFromGenerateParams {
  /** The first /generate endpoint output object. */
  generate_api_output_a: object;
  /** The second /generate endpoint output object. */
  generate_api_output_b: object;
  /** The original context for the comparison. */
  original_context: string;
  /** The SVML version to use. */
  svml_version: string;
  /** The model to use for the comparison. */
  model: string;
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
}

/**
 * Calls the /compare endpoint for direct SVML comparison.
 * @param api AxiosInstance for the API
 * @param token Bearer token for authentication
 * @param params CompareSVMLParams
 * @returns The API response data
 */
export async function compareSVML(
  api: AxiosInstance,
  token: string,
  params: CompareSVMLParams
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

/**
 * Calls the /compare endpoint for comparison from two /generate outputs.
 * @param api AxiosInstance for the API
 * @param token Bearer token for authentication
 * @param params CompareFromGenerateParams
 * @returns The API response data
 */
export async function compareFromGenerate(
  api: AxiosInstance,
  token: string,
  params: CompareFromGenerateParams
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

/**
 * Calls the /compare endpoint for backward compatibility (dispatches to the correct method).
 * @deprecated Use compareSVML or compareFromGenerate instead.
 */
export async function compare(
  api: AxiosInstance,
  token: string,
  params: any
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
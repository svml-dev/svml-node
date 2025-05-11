import { AxiosInstance } from 'axios';

/**
 * Parameters for the /validate endpoint.
 */
export interface ValidateParams {
  /** The SVML string to validate. */
  svml: string;
  /** The SVML version to use. */
  svml_version: string;
}

/**
 * A violation or best practice returned by the /validate endpoint.
 */
export interface Violation {
  /** The line number where the violation occurs. */
  line: number;
  /** The type of violation or best practice. */
  type: string;
  /** Detailed description of the violation or best practice. */
  detail: string;
  /** Suggested fix or improvement. */
  suggestion: string;
}

/**
 * Response from the /validate endpoint.
 */
export interface ValidateResponse {
  request_id: string;
  result: string;
  metadata: Record<string, any>;
  input: Record<string, any>;
  output: {
    /** True if the SVML is valid, false otherwise. */
    valid: boolean;
    /** List of violations found in the SVML. */
    violations: Violation[];
    /** List of best practices or suggestions. */
    best_practices: Violation[];
  };
  svml_version?: string;
  svml_credits?: number;
}

/**
 * Calls the /validate endpoint for SVML syntax validation.
 * @param api AxiosInstance for the API
 * @param token Bearer token for authentication
 * @param params ValidateParams
 * @returns The API response data
 */
export async function validate(
  api: AxiosInstance,
  token: string,
  params: ValidateParams
): Promise<ValidateResponse> {
  const response = await api.post(
    '/validate',
    params,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  return response.data;
} 
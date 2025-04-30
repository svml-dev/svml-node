import { AxiosInstance } from 'axios';

export interface ValidateParams {
  svml: string;
  svml_version: string;
}

export interface Violation {
  line: number;
  type: string;
  detail: string;
  suggestion: string;
}

export interface ValidateResponse {
  request_id: string;
  result: string;
  metadata: Record<string, any>;
  input: Record<string, any>;
  output: {
    valid: boolean;
    violations: Violation[];
    best_practices: Violation[];
  };
}

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
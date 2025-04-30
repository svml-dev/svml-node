import { AxiosInstance } from 'axios';

export interface CompareSVMLParams {
  svml_a: string;
  justifications_a?: string;
  model_a?: string;
  svml_b: string;
  justifications_b?: string;
  model_b?: string;
  original_context: string;
  svml_version: string;
  model: string;
}

export interface CompareFromGenerateParams {
  generate_api_output_a: object;
  generate_api_output_b: object;
  original_context: string;
  svml_version: string;
  model: string;
}

export interface CompareResponse {
  request_id: string;
  result: string;
  metadata: Record<string, any>;
  input: Record<string, any>;
  output: Record<string, any>; // You can refine this if you know the output structure
}

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

// For backward compatibility
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
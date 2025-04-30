import { AxiosInstance } from 'axios';

// 1. For direct SVML refinement
export interface RefineSVMLParams {
  svml: string;
  original_context: string;
  user_additional_context: string;
  model: string;
  svml_version?: string;
}

// 2. For refinement from /generate output
export interface RefineFromGenerateParams {
  generate_api_output: object;
  original_context: string;
  user_additional_context: string;
  model: string;
  svml_version?: string;
}

// 3. For refinement from /compare output
export interface RefineFromCompareParams {
  compare_api_output: object;
  original_context: string;
  user_additional_context?: string;
  model: string;
  svml_version?: string;
}

export interface RefineResponse {
  request_id: string;
  result: string;
  metadata: Record<string, any>;
  input: Record<string, any>;
  output: Record<string, any>; // You can refine this if you know the output structure
}

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
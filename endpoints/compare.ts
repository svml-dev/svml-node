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

export async function compareSVML(
  api: AxiosInstance,
  token: string,
  params: CompareSVMLParams
): Promise<any> {
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
): Promise<any> {
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
): Promise<any> {
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
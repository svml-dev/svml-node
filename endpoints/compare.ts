import { AxiosInstance } from 'axios';

export interface CompareParams {
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

export async function compare(
  api: AxiosInstance,
  token: string,
  params: CompareParams
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
  console.log('compare response.data', response.data);
  return response.data;
} 
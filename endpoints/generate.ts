import { AxiosInstance } from 'axios';

export interface GenerateParams {
  context: string;
  svml_version: string;
  model: string;
}

export interface GenerateResponse {
  request_id: string;
  result: string;
  metadata: Record<string, any>;
  input: Record<string, any>;
  output: Record<string, any>; // You can refine this if you know the output structure
}

export async function generate(
  api: AxiosInstance,
  token: string,
  params: GenerateParams
): Promise<GenerateResponse> {
  const response = await api.post(
    '/generate',
    params,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  //console.log('generate response.data', response.data);
  return response.data;
} 
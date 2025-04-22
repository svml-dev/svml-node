import { AxiosInstance } from 'axios';

export interface GenerateParams {
  context: string;
  svml_version: string;
  model: string;
}

export async function generate(
  api: AxiosInstance,
  token: string,
  params: GenerateParams
): Promise<any> {
  const response = await api.post(
    '/generate',
    params,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  console.log('response.data', response.data);
  return response.data;
} 
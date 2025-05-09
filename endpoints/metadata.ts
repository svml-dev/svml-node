import { AxiosInstance } from 'axios';

export interface ModelInfo {
  id: string;
  vendor: string;
}

export async function fetchModels(api: AxiosInstance, token: string): Promise<ModelInfo[]> {
  const response = await api.get('/models', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.models;
}

export async function fetchSvmlVersions(api: AxiosInstance, token: string): Promise<string[]> {
  const response = await api.get('/svml-versions', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data.versions;
} 
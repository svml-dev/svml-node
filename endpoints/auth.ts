import { AxiosInstance } from 'axios';

/**
 * Authenticates with the API key and returns the JWT access token.
 * Retries according to the provided options (num_retry, initial_delay, exponential_backoff).
 *
 * @param auth AxiosInstance for the auth endpoint
 * @param apiKey The API key string
 * @param options Retry options (optional)
 * @returns The access token string
 * @throws Error if authentication fails after all retries
 */
export async function authenticateWithApiKey(
  auth: import('axios').AxiosInstance,
  apiKey: string,
  options?: {
    num_retry?: number;
    initial_delay?: number;
    exponential_backoff?: boolean;
  }
): Promise<string> {
  const { withRetry } = await import('../utils/retry');
  return withRetry(async () => {
    //console.log('apiKey', apiKey);
    const response = await auth.post('/api-keys/validate', { api_key: apiKey });
    const { access_token } = response.data;
    if (!access_token) throw new Error('No access_token returned from API');
    return access_token;
  }, options);
} 
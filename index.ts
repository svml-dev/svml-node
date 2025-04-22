import axios, { AxiosInstance } from 'axios';
import { generate, GenerateParams } from './endpoints/generate';
import { compare, CompareParams } from './endpoints/compare';

export interface SvmlClientOptions {
  authURL?: string;
  apiURL?: string;
  version?: number;
}

const PROD_AUTH_URL = 'https://auth.svml.dev';
const PROD_API_URL = 'https://api.svml.dev';

export class SvmlClient {
  public readonly apiBase: string;
  public readonly authBase: string;
  private auth: AxiosInstance;
  private api: AxiosInstance;
  private apiKey: string;
  private version: number;
  private accessToken: string | null = null;
  private authorized: boolean = false;

  constructor(apiKey: string, options: SvmlClientOptions = {}) {
    this.apiKey = apiKey;
    this.version = options.version ?? 1;
    const authURL = options.authURL || PROD_AUTH_URL;
    const apiURL = options.apiURL || PROD_API_URL;
    const versionPath = `/v${this.version}`;

    this.authBase = authURL;
    this.apiBase = apiURL;

    this.auth = axios.create({
      baseURL: authURL + versionPath,
      headers: {
        'Content-Type': 'application/json',
      },
    });
    this.api = axios.create({
      baseURL: apiURL + versionPath,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Intercept API responses to handle 401 and flip authorized state
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401) {
          this.authorized = false;
        }
        return Promise.reject(error);
      },
    );
  }

  /**
   * Authenticates with the API key and stores the JWT access token.
   * @returns The access token string.
   * @throws Error if authentication fails.
   */
  async authenticate(): Promise<string> {
    try {
      const response = await this.auth.post('/api-keys/validate', { api_key: this.apiKey });
      const { access_token } = response.data;
      if (!access_token) {
        this.authorized = false;
        throw new Error('No access_token returned from API');
      }
      this.accessToken = access_token;
      this.authorized = true;
      return access_token;
    } catch (error: any) {
      this.authorized = false;
      throw new Error(
        `Authorization failed: ${error.response?.data?.detail || error.message}`
      );
    }
  }

  /**
   * Returns true if the client is currently authorized (has a valid JWT).
   */
  get isAuthorized(): boolean {
    return this.authorized;
  }

  // Optionally, expose the token for use in other requests
  get token(): string | null {
    return this.accessToken;
  }

  /**
   * Helper to check authorization before making API calls.
   * Throws if not authorized.
   */
  protected checkApiAuth(): void {
    if (!this.authorized || !this.accessToken) {
      throw new Error('Not authorized. Please authenticate first.');
    }
  }

  /**
   * Calls the /generate endpoint. Requires authorization.
   * @param params { context, svml_version, model }
   * @returns The API response data.
   */
  async generate(params: GenerateParams): Promise<any> {
    this.checkApiAuth();
    try {
      return await generate(this.api, this.accessToken as string, params);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        this.authorized = false;
      }
      throw new Error(
        `Generate failed: ${error.response?.data?.detail || error.message}`
      );
    }
  }

  /**
   * Calls the /compare endpoint. Requires authorization.
   * @param params { svml_a, justifications_a, model_a, svml_b, justifications_b, model_b, context, svml_version, model }
   * @returns The API response data.
   */
  async compare(params: CompareParams): Promise<any> {
    this.checkApiAuth();
    try {
      return await compare(this.api, this.accessToken as string, params);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        this.authorized = false;
      }
      throw new Error(
        `Compare failed: ${error.response?.data?.detail || error.message}`
      );
    }
  }
}

export { GenerateParams, CompareParams }; 
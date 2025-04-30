import axios, { AxiosInstance } from 'axios';
import { generate, GenerateParams } from './endpoints/generate';
import {
  compare,
  compareSVML,
  compareFromGenerate,
  CompareSVMLParams,
  CompareFromGenerateParams
} from './endpoints/compare';
import {
  refine,
  refineFromGenerate,
  refineFromCompare,
  RefineSVMLParams,
  RefineFromGenerateParams,
  RefineFromCompareParams
} from './endpoints/refine';
import {
  validate,
  ValidateParams,
  Violation,
  ValidateResponse
} from './endpoints/validate';

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
   * Calls the /compare endpoint for direct SVML comparison.
   */
  async compareSVML(params: CompareSVMLParams): Promise<any> {
    this.checkApiAuth();
    try {
      return await compareSVML(this.api, this.accessToken as string, params);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        this.authorized = false;
      }
      throw new Error(
        `CompareSVML failed: ${error.response?.data?.detail || error.message}`
      );
    }
  }

  /**
   * Calls the /compare endpoint for comparison from two generate outputs.
   */
  async compareFromGenerate(params: CompareFromGenerateParams): Promise<any> {
    this.checkApiAuth();
    try {
      return await compareFromGenerate(this.api, this.accessToken as string, params);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        this.authorized = false;
      }
      throw new Error(
        `CompareFromGenerate failed: ${error.response?.data?.detail || error.message}`
      );
    }
  }

  /**
   * @deprecated Use compareSVML or compareFromGenerate instead.
   */
  async compare(params: any): Promise<any> {
    // For backward compatibility, try to dispatch to the correct method
    if ((params as any).svml_a && (params as any).svml_b) {
      return this.compareSVML(params as CompareSVMLParams);
    } else if ((params as any).generate_api_output_a && (params as any).generate_api_output_b) {
      return this.compareFromGenerate(params as CompareFromGenerateParams);
    } else {
      throw new Error('Invalid compare params');
    }
  }

  /**
   * Calls the /refine endpoint for direct SVML refinement.
   */
  async refineSVML(params: RefineSVMLParams): Promise<any> {
    this.checkApiAuth();
    try {
      return await refine(this.api, this.accessToken as string, params);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        this.authorized = false;
      }
      throw new Error(
        `RefineSVML failed: ${error.response?.data?.detail || error.message}`
      );
    }
  }

  /**
   * Calls the /refine endpoint for refinement from /generate output.
   */
  async refineFromGenerate(params: RefineFromGenerateParams): Promise<any> {
    this.checkApiAuth();
    try {
      return await refineFromGenerate(this.api, this.accessToken as string, params);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        this.authorized = false;
      }
      throw new Error(
        `RefineFromGenerate failed: ${error.response?.data?.detail || error.message}`
      );
    }
  }

  /**
   * Calls the /refine endpoint for refinement from /compare output.
   */
  async refineFromCompare(params: RefineFromCompareParams): Promise<any> {
    this.checkApiAuth();
    try {
      return await refineFromCompare(this.api, this.accessToken as string, params);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        this.authorized = false;
      }
      throw new Error(
        `RefineFromCompare failed: ${error.response?.data?.detail || error.message}`
      );
    }
  }

  /**
   * @deprecated Use refineSVML, refineFromGenerate, or refineFromCompare instead.
   */
  async refine(params: RefineSVMLParams | RefineFromGenerateParams | RefineFromCompareParams): Promise<any> {
    // For backward compatibility, try to dispatch to the correct method
    if ((params as any).svml) {
      return this.refineSVML(params as RefineSVMLParams);
    } else if ((params as any).generate_api_output) {
      return this.refineFromGenerate(params as RefineFromGenerateParams);
    } else if ((params as any).compare_api_output) {
      return this.refineFromCompare(params as RefineFromCompareParams);
    } else {
      throw new Error('Invalid refine params');
    }
  }

  /**
   * Calls the /validate endpoint for SVML syntax validation.
   */
  async validate(params: ValidateParams): Promise<ValidateResponse> {
    this.checkApiAuth();
    try {
      return await validate(this.api, this.accessToken as string, params);
    } catch (error: any) {
      if (error.response && error.response.status === 401) {
        this.authorized = false;
      }
      throw new Error(
        `Validate failed: ${error.response?.data?.detail || error.message}`
      );
    }
  }
}

export {
  GenerateParams,
  CompareSVMLParams,
  CompareFromGenerateParams,
  RefineSVMLParams,
  RefineFromGenerateParams,
  RefineFromCompareParams,
  ValidateParams,
  Violation,
  ValidateResponse
}; 
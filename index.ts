import axios, { AxiosInstance } from 'axios';
const pkg = require('./package.json');
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
import {
  correct,
  CorrectParams,
  CorrectResponse
} from './endpoints/correct';
import { authenticateWithApiKey } from './endpoints/auth';
import { withRetry } from './utils/retry';
import { analyze, AnalyzeParams, AnalyzeResponse, AnalyzeDimension, ALL_ANALYZE_DIMENSIONS } from './endpoints/analyze';

const SVML_CLIENT_NAME = 'svml-node';
const SVML_CLIENT_VERSION = pkg.version;
const SVML_USER_AGENT = `${SVML_CLIENT_NAME}/${SVML_CLIENT_VERSION}`;

export interface SvmlClientOptions {
  authURL?: string;
  apiURL?: string;
  version?: number;
  /** Number of retries for endpoint calls (default: 1) */
  num_retry?: number;
  /** If true, use exponential backoff for retries (default: false) */
  exponential_backoff?: boolean;
  /** Initial delay in ms before retry (default: 2000) */
  initial_delay?: number;
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
  private num_retry: number;
  private exponential_backoff: boolean;
  private initial_delay: number;

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

    // Retry settings
    this.num_retry = options.num_retry ?? 1;
    this.exponential_backoff = options.exponential_backoff ?? false;
    this.initial_delay = options.initial_delay ?? 2000;

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
      const access_token = await authenticateWithApiKey(this.auth, this.apiKey, {
        num_retry: this.num_retry,
        initial_delay: this.initial_delay,
        exponential_backoff: this.exponential_backoff,
      });
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
    return withRetry(() => generate(this.api, this.accessToken as string, params), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * Calls the /compare endpoint for direct SVML comparison.
   */
  async compareSVML(params: CompareSVMLParams): Promise<any> {
    this.checkApiAuth();
    return withRetry(() => compareSVML(this.api, this.accessToken as string, params), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * Calls the /compare endpoint for comparison from two generate outputs.
   */
  async compareFromGenerate(params: CompareFromGenerateParams): Promise<any> {
    this.checkApiAuth();
    return withRetry(() => compareFromGenerate(this.api, this.accessToken as string, params), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * @deprecated Use compareSVML or compareFromGenerate instead.
   */
  async compare(params: any): Promise<any> {
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
    return withRetry(() => refine(this.api, this.accessToken as string, params), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * Calls the /refine endpoint for refinement from /generate output.
   */
  async refineFromGenerate(params: RefineFromGenerateParams): Promise<any> {
    this.checkApiAuth();
    return withRetry(() => refineFromGenerate(this.api, this.accessToken as string, params), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * Calls the /refine endpoint for refinement from /compare output.
   */
  async refineFromCompare(params: RefineFromCompareParams): Promise<any> {
    this.checkApiAuth();
    return withRetry(() => refineFromCompare(this.api, this.accessToken as string, params), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * @deprecated Use refineSVML, refineFromGenerate, or refineFromCompare instead.
   */
  async refine(params: RefineSVMLParams | RefineFromGenerateParams | RefineFromCompareParams): Promise<any> {
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
    return withRetry(() => validate(this.api, this.accessToken as string, params), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * Calls the /correct endpoint for SVML correction.
   */
  async correct(params: CorrectParams): Promise<CorrectResponse> {
    this.checkApiAuth();
    return withRetry(() => correct(this.api, this.accessToken as string, params), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * Calls the /analyze endpoint. Requires authorization.
   * @param params { svml, svml_version, model, dimensions }
   *        If dimensions is not provided, all available dimensions will be used.
   * @returns The API response data.
   */
  async analyze(params: AnalyzeParams): Promise<any> {
    this.checkApiAuth();
    const finalParams = {
      ...params,
      dimensions: params.dimensions ?? ALL_ANALYZE_DIMENSIONS,
    };
    return withRetry(() => analyze(this.api, this.accessToken as string, finalParams), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
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
  ValidateResponse,
  CorrectParams,
  CorrectResponse,
  AnalyzeParams,
  AnalyzeResponse,
  AnalyzeDimension,
  ALL_ANALYZE_DIMENSIONS
}; 
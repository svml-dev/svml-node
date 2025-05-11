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
import { UserId } from './shared-svml';
import { fetchModels, fetchSvmlVersions, ModelInfo } from './endpoints/metadata';

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
  protected auth: AxiosInstance;
  protected api: AxiosInstance;
  private apiKey: string;
  private version: number;
  private accessToken: string | null = null;
  private authorized: boolean = false;
  private num_retry: number;
  private exponential_backoff: boolean;
  private initial_delay: number;

  // Alignment additions
  public models: string[] = [];
  public svmlVersions: string[] = [];
  public defaultModel: string = '';
  public defaultSvmlVersion: string = '';

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

    // Add global client metadata headers (parity with Python)
    this.api.defaults.headers.common['X-Client-Name'] = 'svml-node';
    this.api.defaults.headers.common['X-Client-Version'] = '1.0.0'; // update as needed
    this.api.defaults.headers.common['X-Platform'] = process.platform;
    this.api.defaults.headers.common['X-Language-Version'] = `node-${process.version}`;
    this.api.defaults.headers.common['X-User-Agent'] = `svml-node/1.0.0`;
  }

  /**
   * Authenticates with the API key and stores the JWT access token.
   * @returns The access token string.
   * @throws Error if authentication fails.
   */
  async authenticate(): Promise<string> {
    try {
      const resp: any = await authenticateWithApiKey(this.auth, this.apiKey, {
        num_retry: this.num_retry,
        initial_delay: this.initial_delay,
        exponential_backoff: this.exponential_backoff,
      });
      // Debug log
      // console.log('Auth resp:', resp, typeof resp);

      if (typeof resp === 'object' && resp !== null) {
        this.accessToken = resp.access_token || (typeof resp === 'string' ? resp : '');
        if (!this.accessToken) throw new Error('No access token returned from API');
        this.authorized = true;
        if (resp.models && resp.svml_versions) {
          this.models = resp.models;
          this.svmlVersions = resp.svml_versions;
        } else {
          await this.fetchModels();
          await this.fetchSvmlVersions();
        }
      } else {
        this.accessToken = typeof resp === 'string' ? resp : '';
        // console.log('Access token:', this.accessToken);
        if (!this.accessToken) throw new Error('No access token returned from API');
        this.authorized = true;
        await this.fetchModels();
        await this.fetchSvmlVersions();
      }
      // Set defaults if not already set
      if (!this.defaultModel && this.models.length) this.defaultModel = this.models[0];
      if (!this.defaultSvmlVersion && this.svmlVersions.length) this.defaultSvmlVersion = this.svmlVersions[0];
      
      return this.accessToken;
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
  public get token(): string | null {
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
    const model = params.model || this.defaultModel;
    const svmlVersion = params.svml_version || this.defaultSvmlVersion;
    this.validateModel(model);
    this.validateSvmlVersion(svmlVersion);
    return withRetry(() => generate(this.api, this.accessToken as string, params), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * Compares two SVML strings directly.
   * @param params CompareSVMLParams
   * @returns CompareResponse
   */
  async compareSVML(params: CompareSVMLParams): Promise<any> {
    this.checkApiAuth();
    const model = params.model || this.defaultModel;
    const svmlVersion = params.svml_version || this.defaultSvmlVersion;
    this.validateModel(model);
    this.validateSvmlVersion(svmlVersion);
    return withRetry(() => compareSVML(this.api, this.accessToken as string, params), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * Compares two /generate endpoint outputs.
   * @param params CompareFromGenerateParams
   * @returns CompareResponse
   */
  async compareFromGenerate(params: CompareFromGenerateParams): Promise<any> {
    this.checkApiAuth();
    const model = params.model || this.defaultModel;
    const svmlVersion = params.svml_version || this.defaultSvmlVersion;
    this.validateModel(model);
    this.validateSvmlVersion(svmlVersion);
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
   * Refines a user-supplied SVML string.
   * @param params RefineSVMLParams
   * @returns RefineResponse
   */
  async refineSVML(params: RefineSVMLParams): Promise<any> {
    this.checkApiAuth();
    this.validateModel(params.model);
    if (params.svml_version) this.validateSvmlVersion(params.svml_version);
    return withRetry(() => refine(this.api, this.accessToken as string, params), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * Refines SVML from a /generate endpoint output.
   * @param params RefineFromGenerateParams
   * @returns RefineResponse
   */
  async refineFromGenerate(params: RefineFromGenerateParams): Promise<any> {
    this.checkApiAuth();
    this.validateModel(params.model);
    if (params.svml_version) this.validateSvmlVersion(params.svml_version);
    return withRetry(() => refineFromGenerate(this.api, this.accessToken as string, params), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * Refines SVML from a /compare endpoint output.
   * @param params RefineFromCompareParams
   * @returns RefineResponse
   */
  async refineFromCompare(params: RefineFromCompareParams): Promise<any> {
    this.checkApiAuth();
    this.validateModel(params.model);
    if (params.svml_version) this.validateSvmlVersion(params.svml_version);
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
    const svmlVersion = (params as any).svml_version || this.defaultSvmlVersion;
    this.validateSvmlVersion(svmlVersion);
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
    const model = params.model || this.defaultModel;
    const svmlVersion = params.svml_version || this.defaultSvmlVersion;
    this.validateModel(model);
    this.validateSvmlVersion(svmlVersion);
    // params must have validation_api_output, svml_version, model
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
    const model = params.model || this.defaultModel;
    const svmlVersion = params.svml_version || this.defaultSvmlVersion;
    this.validateModel(model);
    this.validateSvmlVersion(svmlVersion);
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

  private validateModel(model: string): void {
    if (this.models.length && !this.models.includes(model)) {
      throw new Error(`Model '${model}' is not supported. Available: ${this.models.join(', ')}`);
    }
  }

  private validateSvmlVersion(version: string): void {
    if (this.svmlVersions.length && !this.svmlVersions.includes(version)) {
      throw new Error(`SVML version '${version}' is not supported. Available: ${this.svmlVersions.join(', ')}`);
    }
  }

  public setDefaultModel(model: string): void {
    this.validateModel(model);
    this.defaultModel = model;
  }

  public setDefaultSvmlVersion(version: string): void {
    this.validateSvmlVersion(version);
    this.defaultSvmlVersion = version;
  }

  // Example method
  getUserId(): UserId {
    return 'example-user-id';
  }

  /**
   * Fetches available models from the API and updates the client.
   */
  public async fetchModels(): Promise<ModelInfo[]> {
    this.checkApiAuth();
    const models = await fetchModels(this.api, this.accessToken as string);    
    this.models = models.map((m) => m.id);
    return models;
  }

  /**
   * Fetches supported SVML versions from the API and updates the client.
   */
  public async fetchSvmlVersions(): Promise<string[]> {
    this.checkApiAuth();
    const versions = await fetchSvmlVersions(this.api, this.accessToken as string);
    this.svmlVersions = versions;
    return versions;
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
import axios, { AxiosInstance } from 'axios';
import { getPackageInfo } from './utils/package-info';
const pkg = getPackageInfo();
import { generate, GenerateParams, GenerateResponse } from './endpoints/generate';
import {
  compare,
  CompareParams,
  CompareResponse
} from './endpoints/compare';
import {
  refine,
  RefineParams,
  RefineResponse
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
import { customPrompt, CustomPromptParams, CustomPromptResponse, customPromptStream, processSSEStream } from './endpoints/custom_prompts';
import { UserId } from './shared-svml';
import { fetchModels, fetchSvmlVersions, ModelInfo } from './endpoints/metadata';
import { StandardLLMSettings } from './common-types';

const SVML_CLIENT_NAME = 'svml-node';
const SVML_CLIENT_VERSION = pkg.version;
const SVML_USER_AGENT = `${SVML_CLIENT_NAME}/${SVML_CLIENT_VERSION} (${process.platform}; node-${process.version})`;

export interface SvmlClientOptions {
  apiKey?: string;
  apiURL?: string;
  authURL?: string;
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
  public readonly api: AxiosInstance;
  public readonly auth: AxiosInstance;
  public readonly version: number;
  public readonly num_retry: number;
  public readonly initial_delay: number;
  public readonly exponential_backoff: boolean;
  public readonly apiBase: string;
  public readonly authBase: string;

  protected accessToken: string | null = null;
  protected authorized: boolean = false;
  public defaultModel: string = '';
  public defaultSvmlVersion: string = '';
  public models: string[] = [];
  public svmlVersions: string[] = [];

  constructor(options: SvmlClientOptions = {}) {
    this.version = options.version ?? 1;
    
    let apiURL = options.apiURL || PROD_API_URL;
    let authURL = options.authURL || PROD_AUTH_URL;

    const versionPath = `/v${this.version}`;
    if (!apiURL.includes(versionPath) && !apiURL.match(/\/v\d+(\.\d+)*$/)) {
      apiURL = apiURL.replace(/\/$/, '') + versionPath;
    }
    if (!authURL.includes(versionPath) && !authURL.match(/\/v\d+(\.\d+)*$/)) {
      authURL = authURL.replace(/\/$/, '') + versionPath;
    }

    this.authBase = options.authURL || PROD_AUTH_URL;
    this.apiBase = options.apiURL || PROD_API_URL;

    this.auth = axios.create({ baseURL: authURL, headers: { 'Content-Type': 'application/json' } });
    this.api = axios.create({ baseURL: apiURL, headers: { 'Content-Type': 'application/json' } });

    this.num_retry = options.num_retry ?? 0;
    this.exponential_backoff = options.exponential_backoff ?? false;
    this.initial_delay = options.initial_delay ?? 2000;

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response && error.response.status === 401 && !error.config?._isRetryAttempt) {
          this.authorized = false;
        }
        return Promise.reject(error);
      },
    );

    this.api.defaults.headers.common['X-Client-Name'] = 'svml-node';
    this.api.defaults.headers.common['X-Client-Version'] = pkg.version;
    this.api.defaults.headers.common['X-Platform'] = process.platform;
    this.api.defaults.headers.common['X-Language-Version'] = `node-${process.version}`;
    this.api.defaults.headers.common['X-User-Agent'] = SVML_USER_AGENT;

    if (options.apiKey) {
        this.setAPIKey(options.apiKey);
    }
  }

  public setAPIKey(apiKey: string): void {
    if (!apiKey || typeof apiKey !== 'string') {
      throw new Error('Invalid API key. Must be a non-empty string.');
    }
    this.accessToken = apiKey;
    this.authorized = true;
    this.api.defaults.headers.common['Authorization'] = `Bearer ${apiKey}`;
    console.log('[SvmlClient setAPIKey] API key set. Authorized: true. Token type: API_KEY_AUTH');
  }

  /**
   * Authenticates with the API key and stores the JWT access token.
   * @returns The access token string.
   * @throws Error if authentication fails.
   */
  async authenticate(): Promise<string> {
    try {
      const resp: any = await authenticateWithApiKey(this.auth, this.accessToken as string, {
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
   * @param params The parameters for the generate endpoint, excluding settings which is handled separately.
   * @param options Optional settings for the LLM call.
   * @returns The API response data.
   */
  async generate(params: Pick<GenerateParams, 'context'>, options?: { settings?: StandardLLMSettings }): Promise<GenerateResponse> {
    this.checkApiAuth();
    
    const finalParams: GenerateParams = {
      context: params.context,
      settings: options?.settings
    };

    console.log('[SvmlClient.generate] finalParams being sent:', JSON.stringify(finalParams, null, 2));

    return withRetry(() => generate(this.api, this.accessToken as string, finalParams), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * Compares SVML representations or /generate outputs.
   * @param params Unified parameters for comparison (original_context, svml_a/b, generate_api_output_a/b).
   * @param options Optional settings for the LLM call.
   * @returns CompareResponse
   */
  async compare(params: Omit<CompareParams, 'settings'>, options?: { settings?: StandardLLMSettings }): Promise<CompareResponse> {
    this.checkApiAuth();
    const finalParams: CompareParams = {
      ...params, // Spread original_context, svml_a/b, model_a/b, generate_api_output_a/b
      settings: options?.settings
    };
    return withRetry(() => compare(this.api, this.accessToken as string, finalParams), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * Refines SVML, either directly or from /generate or /compare outputs.
   * @param params Unified parameters for refinement.
   * @param options Optional settings for the LLM call.
   * @returns RefineResponse
   */
  async refine(params: Omit<RefineParams, 'settings'>, options?: { settings?: StandardLLMSettings }): Promise<RefineResponse> {
    this.checkApiAuth();
    const finalParams: RefineParams = {
        ...params, // Spread svml, original_context, user_additional_context, generate_api_output, etc.
        settings: options?.settings
    };
    return withRetry(() => refine(this.api, this.accessToken as string, finalParams), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * Calls the /correct endpoint for SVML correction.
   * @param params Parameters for correction (validation_api_output).
   * @param options Optional settings for the LLM call.
   */
  async correct(params: Pick<CorrectParams, 'validation_api_output'>, options?: { settings?: StandardLLMSettings }): Promise<CorrectResponse> {
    this.checkApiAuth();
    const finalParams: CorrectParams = {
        validation_api_output: params.validation_api_output,
        settings: options?.settings
    };
    return withRetry(() => correct(this.api, this.accessToken as string, finalParams), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * Calls the /analyze endpoint. Requires authorization.
   * @param params Parameters for analysis (svml, dimensions).
   * @param options Optional settings for the LLM call.
   * @returns The API response data.
   */
  async analyze(params: Pick<AnalyzeParams, 'svml' | 'dimensions'>, options?: { settings?: StandardLLMSettings }): Promise<AnalyzeResponse> {
    this.checkApiAuth();
    const finalParams: AnalyzeParams = {
      svml: params.svml,
      dimensions: params.dimensions ?? ALL_ANALYZE_DIMENSIONS,
      settings: options?.settings
    };
    return withRetry(() => analyze(this.api, this.accessToken as string, finalParams), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * Calls the /custom endpoint. Requires authorization.
   * @param params Parameters for the custom prompt (prompt_template_id, template_vars).
   * @param options Optional settings for the LLM call.
   * @returns The API response data.
   */
  async customPrompt(params: Pick<CustomPromptParams, 'prompt_template_id' | 'template_vars'>, options?: { settings?: StandardLLMSettings }): Promise<CustomPromptResponse> {
    this.checkApiAuth();
    const finalParams: CustomPromptParams = {
      prompt_template_id: params.prompt_template_id,
      template_vars: params.template_vars,
      settings: options?.settings
    };
    return withRetry(() => customPrompt(this.api, this.accessToken as string, finalParams), {
      num_retry: this.num_retry,
      initial_delay: this.initial_delay,
      exponential_backoff: this.exponential_backoff,
    });
  }

  /**
   * Calls the /custom-stream endpoint for streaming responses. Requires authorization.
   * @param params Parameters for the custom prompt with streaming callbacks.
   * @param options Optional settings for the LLM call.
   * @returns A promise that resolves to a ReadableStream or void if using callbacks.
   */
  async customPromptStream(
    params: Pick<CustomPromptParams, 'prompt_template_id' | 'template_vars'> & {
      onChunk?: (chunk: string) => void;
      onError?: (error: Error) => void;
      onComplete?: () => void;
    }, 
    options?: { settings?: StandardLLMSettings }
  ): Promise<ReadableStream<Uint8Array> | void> {
    this.checkApiAuth();
    
    const { onChunk, onError, onComplete, ...baseParams } = params;
    
    const finalParams = {
      ...baseParams,
      settings: options?.settings,
      onChunk,
      onError,
      onComplete
    };
    
    const stream = await customPromptStream(this.api, this.accessToken as string, finalParams);
    
    // If callbacks are provided, handle the stream processing internally
    if (onChunk) {
      processSSEStream(
        stream,
        onChunk,
        onError || ((error: Error) => console.error('Streaming error:', error)),
        onComplete
      );
      return;
    }
    
    // Otherwise return the raw stream for manual handling
    return stream;
  }

  /**
   * Calls the /validate endpoint. Requires authorization.
   * @param params Parameters for validation (svml).
   * @param options Optional settings for the LLM call (though validate typically doesn't use LLM settings like model).
   * @returns The API response data.
   */
  async validate(params: Pick<ValidateParams, 'svml'>, options?: { settings?: StandardLLMSettings }): Promise<ValidateResponse> {
    this.checkApiAuth();
    
    const finalParams: ValidateParams = {
        svml: params.svml,
        // Use svml_version from options.settings if provided, otherwise it can be undefined (backend might use a default)
        svml_version: options?.settings?.svml_version 
    };

    // This call is to the local validate function from './endpoints/validate.ts'
    // which should expect ValidateParams (svml: string, svml_version?: string)
    return withRetry(() => validate(this.api, this.accessToken as string, finalParams), {
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

export type {
  GenerateParams,
  CompareParams,
  CompareResponse,
  RefineParams,
  RefineResponse,
  ValidateParams,
  Violation,
  ValidateResponse,
  CorrectParams,
  CorrectResponse,
  AnalyzeParams,
  AnalyzeResponse,
  AnalyzeDimension,
  CustomPromptParams,
  CustomPromptResponse
};

export {
  ALL_ANALYZE_DIMENSIONS
}; 
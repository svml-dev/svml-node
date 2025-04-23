import { SvmlClient, RefineSVMLParams, RefineFromGenerateParams, RefineFromCompareParams } from '../index';
import envs from './env.local.json';
import fs from 'fs';
import path from 'path';
import { test_cache } from './client.test';

const cachePath = path.join(__dirname, 'cache.local.json');
let cache: Record<string, any> = {};
if (fs.existsSync(cachePath)) {
  cache = JSON.parse(fs.readFileSync(cachePath, 'utf-8'));
}

const testOutputPath = path.join(__dirname, 'test-output.local.json');
let testOutput: Record<string, any> = {};
if (fs.existsSync(testOutputPath)) {
  testOutput = JSON.parse(fs.readFileSync(testOutputPath, 'utf-8'));
}

function saveTestOutput(key: string, value: any) {
  testOutput[key] = value;
  fs.writeFileSync(testOutputPath, JSON.stringify(testOutput, null, 2));
}

function saveCache() {
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

const generate1 = cache.generate_1 || {};
const generate2 = cache.generate_2 || {};
const compare_with_justifications = cache.compare_with_justifications || {};
const compare_svml_only = cache.compare_svml_only || {};

const svml = generate1.output?.svml || 'SVML A content';
const original_context = generate1.input?.context || 'Original context for SVML.';
const generate_api_output = cache.generate_api_output || generate1;
const compare_api_output = cache.compare_api_output || compare_with_justifications;

const user_additional_context = 'Please focus on improving clarity and hierarchical structure.';

describe('SvmlClient refine', () => {
  const apiKey = envs.api_key || 'test-api-key';
  const svml_version = '1.2.1';
  const model = 'gpt-4.1-mini';

  it('should call /refine with user-supplied SVML', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
    });
    if (cache.auth_jwt) {
      (client as any).accessToken = cache.auth_jwt;
      (client as any).authorized = true;
    } else {
      await client.authenticate();
      cache.auth_jwt = client.token;
      saveCache();
    }
    const params: RefineSVMLParams = {
      svml,
      original_context,
      user_additional_context,
      model,
      svml_version,
    };
    const result = await client.refineSVML(params);
    saveTestOutput('refine_svml', result);
    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
  });

  it('should call /refine with generate_api_output', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
    });
    if (cache.auth_jwt) {
      (client as any).accessToken = cache.auth_jwt;
      (client as any).authorized = true;
    } else {
      await client.authenticate();
      cache.auth_jwt = client.token;
      saveCache();
    }
    const params: RefineFromGenerateParams = {
      generate_api_output,
      original_context,
      user_additional_context,
      model,
      svml_version,
    };
    const result = await client.refineFromGenerate(params);
    saveTestOutput('refine_analysis_a', result);
    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
    saveCache();
  });

  it('should call /refine with compare_api_output', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
    });
    if (cache.auth_jwt) {
      (client as any).accessToken = cache.auth_jwt;
      (client as any).authorized = true;
    } else {
      await client.authenticate();
      cache.auth_jwt = client.token;
      saveCache();
    }
    const params: RefineFromCompareParams = {
      compare_api_output,
      original_context,
      user_additional_context,
      model,
      svml_version,
    };
    const result = await client.refineFromCompare(params);
    saveTestOutput('refine_analysis_a_b', result);
    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
    saveCache();
  });

  it('should call /refine with compare_api_output and user_additional_context', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
    });
    if (cache.auth_jwt) {
      (client as any).accessToken = cache.auth_jwt;
      (client as any).authorized = true;
    } else {
      await client.authenticate();
      cache.auth_jwt = client.token;
      saveCache();
    }
    const params: RefineFromCompareParams = {
      compare_api_output,
      original_context,
      user_additional_context,
      model,
      svml_version,
    };
    const result = await client.refineFromCompare(params);
    saveTestOutput('refine_analysis_a_b_user_prompt', result);
    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
    saveCache();
  });
}); 
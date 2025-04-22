import { SvmlClient, CompareParams } from '../index';
import envs from './env.local.json';
import fs from 'fs';
import path from 'path';

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

const svml_a = generate1.output?.svml || 'SVML A content';
const justifications_a = generate1.output?.justifications || 'Justification for A';
const model_a = generate1.metadata?.model || 'gpt-4.1-mini';

const svml_b = generate2.output?.svml || 'SVML B content';
const justifications_b = generate2.output?.justifications || 'Justification for B';
const model_b = generate2.metadata?.model || 'claude-3-5-sonnet-20241022';

describe('SvmlClient compare', () => {
  const apiKey = envs.api_key || 'test-api-key';
  const svml_version = '1.2.1';
  const model = 'gpt-4.1-mini';
  const original_context = 'Compare the following SVML representations.';

  it('should call /compare with SVML and justifications', async () => {
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
    const params: CompareParams = {
      svml_a,
      justifications_a,
      model_a,
      svml_b,
      justifications_b,
      model_b,
      original_context,
      svml_version,
      model,
    };
    const result = await client.compare(params);
    saveTestOutput('compare_with_justifications', result);
    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
    expect(result.output.analysis_a).toBeDefined();
    expect(result.output.analysis_b).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.svml_tokens).toBeDefined();
  });

  it('should call /compare with only SVML', async () => {
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
    const params: CompareParams = {
      svml_a,
      svml_b,
      model_a,
      model_b,
      original_context,
      svml_version,
      model,
    };
    const result = await client.compare(params);
    saveTestOutput('compare_svml_only', result);
    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
    expect(result.output.analysis_a).toBeDefined();
    expect(result.output.analysis_b).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.svml_tokens).toBeDefined();
  });
}); 
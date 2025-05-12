import { SvmlClient, RefineSVMLParams, RefineFromGenerateParams, RefineFromCompareParams } from '../src/index';
import envs from './env.local.json';
import fs from 'fs';
import path from 'path';

// Load endpoint result fixtures
const generate1 = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'fixtures/generate_1.json'), 'utf-8')
);
const generate2 = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'fixtures/generate_2.json'), 'utf-8')
);
const compareWithJustifications = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'fixtures/compare_with_justifications.json'), 'utf-8')
);
const compareSvmlOnly = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'fixtures/compare_svml_only.json'), 'utf-8')
);
const svml = generate1.output.svml;
const original_context = generate1.input.context;
const generate_api_output = generate1;
const compare_api_output = compareWithJustifications;
const user_additional_context = 'Please focus on improving clarity and hierarchical structure.';
const svml_version = '1.2.2';
const model = 'gpt-4.1-mini';

describe('SvmlClient refine', () => {
  const apiKey = envs.api_key || 'test-api-key';

  it('should call /refine with user-supplied SVML', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();
    const params: RefineSVMLParams = {
      svml,
      original_context,
      user_additional_context,
      model,
      svml_version,
    };
    const result = await client.refineSVML(params);
    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(typeof result.output.svml).toBe('string');
    expect(!('usage' in result)).toBe(true);
    expect(!('usage' in result.output)).toBe(true);
  });

  it('should call /refine with generate_api_output', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();
    const params: RefineFromGenerateParams = {
      generate_api_output,
      original_context,
      user_additional_context,
      model,
      svml_version,
    };
    const result = await client.refineFromGenerate(params);
    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(typeof result.output.svml).toBe('string');
    expect(!('usage' in result)).toBe(true);
    expect(!('usage' in result.output)).toBe(true);
  });

  it('should call /refine with compare_api_output', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();
    const params: RefineFromCompareParams = {
      compare_api_output,
      original_context,
      user_additional_context,
      model,
      svml_version,
    };
    const result = await client.refineFromCompare(params);
    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(typeof result.output.svml).toBe('string');
    expect(!('usage' in result)).toBe(true);
    expect(!('usage' in result.output)).toBe(true);
  });

  it('should call /refine with compare_api_output and user_additional_context', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();
    const params: RefineFromCompareParams = {
      compare_api_output,
      original_context,
      user_additional_context,
      model,
      svml_version,
    };
    const result = await client.refineFromCompare(params);
    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(typeof result.output.svml).toBe('string');
    expect(!('usage' in result)).toBe(true);
    expect(!('usage' in result.output)).toBe(true);
  });
}); 
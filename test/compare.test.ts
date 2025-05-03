import { SvmlClient, CompareSVMLParams, CompareFromGenerateParams } from '../index';
import envs from './env.local.json';
import fs from 'fs';
import path from 'path';

// Load endpoint result fixtures
const generate1 = require('./fixtures/generate_1.json');
const generate2 = require('./fixtures/generate_2.json');

const svml_a = generate1.output.svml;
const model_a = generate1.metadata.model;
const svml_b = generate2.output.svml;
const model_b = generate2.metadata.model;
const original_context = generate1.input.context;
const svml_version = generate1.svml_version || '1.2.1';
const model = 'gpt-4.1-mini';

describe('SvmlClient compare', () => {
  const apiKey = envs.api_key || 'test-api-key';
  jest.setTimeout(60000);

  it('should call /compare with SVML only', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();
    const params: CompareSVMLParams = {
      svml_a,
      model_a,
      svml_b,
      model_b,
      original_context,
      svml_version,
      model,
    };
    const result = await client.compareSVML(params);
    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
    expect(result.output.analysis_a).toBeDefined();
    expect(result.output.analysis_b).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.svml_tokens).toBeDefined();
  });

  it('should call /compare with two generate outputs', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();
    const params: CompareFromGenerateParams = {
      generate_api_output_a: generate1,
      generate_api_output_b: generate2,
      original_context,
      svml_version,
      model,
    };
    const result = await client.compareFromGenerate(params);
    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
    expect(result.output.analysis_a).toBeDefined();
    expect(result.output.analysis_b).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.svml_tokens).toBeDefined();
  });
}); 
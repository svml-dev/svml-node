import { SvmlClient, CompareSVMLParams, CompareFromGenerateParams } from '../index';
import envs from './env.local.json';
import fs from 'fs';
import path from 'path';

// Load endpoint result fixtures
const generate1 = require('./fixtures/generate_1.json');
const generate2 = require('./fixtures/generate_2.json');
const compareWithJustifications = require('./fixtures/compare_with_justifications.json');
const compareSvmlOnly = require('./fixtures/compare_svml_only.json');

const svml_a = generate1.output.svml;
const justifications_a = generate1.output.justifications;
const model_a = generate1.metadata.model;

const svml_b = generate2.output.svml;
const justifications_b = generate2.output.justifications;
const model_b = generate2.metadata.model;

const svml_version = '1.2.1';
const model = 'gpt-4.1-mini';
const original_context = 'Compare the following SVML representations.';

describe('SvmlClient compare', () => {
  const apiKey = envs.api_key || 'test-api-key';

  it('should call /compare with SVML and justifications', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
    });
    await client.authenticate();
    const params: CompareSVMLParams = {
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
    const result = await client.compareSVML(params);
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
    await client.authenticate();
    const params: CompareSVMLParams = {
      svml_a,
      svml_b,
      model_a,
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
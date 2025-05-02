import { SvmlClient, RefineSVMLParams, RefineFromGenerateParams, RefineFromCompareParams } from '../index';
import envs from './env.local.json';
import fs from 'fs';
import path from 'path';

// Load endpoint result fixtures
const generate1 = require('./fixtures/generate_1.json');
const generate2 = require('./fixtures/generate_2.json');
const compareWithJustifications = require('./fixtures/compare_with_justifications.json');
const compareSvmlOnly = require('./fixtures/compare_svml_only.json');

const svml = generate1.output.svml;
const original_context = generate1.input.context;
const generate_api_output = generate1;
const compare_api_output = compareWithJustifications;
const user_additional_context = 'Please focus on improving clarity and hierarchical structure.';
const svml_version = '1.2.1';
const model = 'gpt-4.1-mini';

describe('SvmlClient refine', () => {
  const apiKey = envs.api_key || 'test-api-key';

  it('should call /refine with user-supplied SVML', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
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
  });

  it('should call /refine with generate_api_output', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
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
  });

  it('should call /refine with compare_api_output', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
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
  });

  it('should call /refine with compare_api_output and user_additional_context', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
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
  });
}); 
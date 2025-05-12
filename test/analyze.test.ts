import { SvmlClient, AnalyzeParams, ALL_ANALYZE_DIMENSIONS } from '../src/index';
import envs from './env.local.json';
import fs from 'fs';
import path from 'path';

describe('SvmlClient analyze', () => {
  const apiKey = envs.api_key || 'test-api-key';
  const validSvml = fs.readFileSync(path.join(__dirname, 'fixtures/valid_svml.svml'), 'utf-8');
  const svml_version = '1.2.2';
  const model = 'claude-3-5-sonnet-20241022';

  // it('should call /analyze with valid SVML (all dimensions)', async () => {
  //   const client = new SvmlClient(apiKey, {
  //     authURL: envs.dev.authURL,
  //     apiURL: envs.dev.apiURL,
  //     num_retry: 0,
  //   });
  //   await client.authenticate();
  //   const params: AnalyzeParams = {
  //     svml: validSvml,
  //     svml_version,
  //     model,
  //   };
  //   const result = await client.analyze(params);
  //   expect(result).toBeDefined();
  //   expect(result.dimensions).toBeDefined();
  //   for (const dim of ALL_ANALYZE_DIMENSIONS) {
  //     expect(result.dimensions).toHaveProperty(dim);
  //   }
  //   expect(typeof result.overall_score).toBe('number');
  //   expect(typeof result.verdict).toBe('string');
  // });

  it('should analyze cognitive_divergence', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();
    const params: AnalyzeParams = {
      svml: validSvml,
      svml_version,
      model,
      dimensions: ['cognitive_divergence'],
    };
    const result = await client.analyze(params);
    expect(result).toBeDefined();
    expect(result.dimensions).toBeDefined();
    expect(Object.keys(result.dimensions)).toEqual(['cognitive_divergence']);
    expect(typeof result.overall_score).toBe('number');
    expect(typeof result.verdict).toBe('string');
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(!('usage' in result)).toBe(true);
    expect(!('usage' in result.dimensions)).toBe(true);
  });

  it('should analyze compression_signature', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();
    const params: AnalyzeParams = {
      svml: validSvml,
      svml_version,
      model,
      dimensions: ['compression_signature'],
    };
    const result = await client.analyze(params);
    expect(result).toBeDefined();
    expect(result.dimensions).toBeDefined();
    expect(Object.keys(result.dimensions)).toEqual(['compression_signature']);
    expect(typeof result.overall_score).toBe('number');
    expect(typeof result.verdict).toBe('string');
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(!('usage' in result)).toBe(true);
    expect(!('usage' in result.dimensions)).toBe(true);
  });

  it('should analyze metaphor_anchoring', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();
    const params: AnalyzeParams = {
      svml: validSvml,
      svml_version,
      model,
      dimensions: ['metaphor_anchoring'],
    };
    const result = await client.analyze(params);
    expect(result).toBeDefined();
    expect(result.dimensions).toBeDefined();
    expect(Object.keys(result.dimensions)).toEqual(['metaphor_anchoring']);
    expect(typeof result.overall_score).toBe('number');
    expect(typeof result.verdict).toBe('string');
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(!('usage' in result)).toBe(true);
    expect(!('usage' in result.dimensions)).toBe(true);
  });

  it('should analyze prompt_form_alignment', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();
    const params: AnalyzeParams = {
      svml: validSvml,
      svml_version,
      model,
      dimensions: ['prompt_form_alignment'],
    };
    const result = await client.analyze(params);
    expect(result).toBeDefined();
    expect(result.dimensions).toBeDefined();
    expect(Object.keys(result.dimensions)).toEqual(['prompt_form_alignment']);
    expect(typeof result.overall_score).toBe('number');
    expect(typeof result.verdict).toBe('string');
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(!('usage' in result)).toBe(true);
    expect(!('usage' in result.dimensions)).toBe(true);
  });

  it('should analyze author_trace', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();
    const params: AnalyzeParams = {
      svml: validSvml,
      svml_version,
      model,
      dimensions: ['author_trace'],
    };
    const result = await client.analyze(params);
    expect(result).toBeDefined();
    expect(result.dimensions).toBeDefined();
    expect(Object.keys(result.dimensions)).toEqual(['author_trace']);
    expect(typeof result.overall_score).toBe('number');
    expect(typeof result.verdict).toBe('string');
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(!('usage' in result)).toBe(true);
    expect(!('usage' in result.dimensions)).toBe(true);
  });

  it('should analyze ambiguity_resolution', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();
    const params: AnalyzeParams = {
      svml: validSvml,
      svml_version,
      model,
      dimensions: ['ambiguity_resolution'],
    };
    const result = await client.analyze(params);
    expect(result).toBeDefined();
    expect(result.dimensions).toBeDefined();
    expect(Object.keys(result.dimensions)).toEqual(['ambiguity_resolution']);
    expect(typeof result.overall_score).toBe('number');
    expect(typeof result.verdict).toBe('string');
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(!('usage' in result)).toBe(true);
    expect(!('usage' in result.dimensions)).toBe(true);
  });
}); 
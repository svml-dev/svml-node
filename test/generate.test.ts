
import { SvmlClient } from '../src/index';
import envs from './env.local.json';
import fs from 'fs';
import path from 'path';

// Load prompt fixtures
const start_prompt_1 = fs.readFileSync(path.join(__dirname, 'fixtures/start_prompt_1.md'), 'utf-8');
const start_prompt_2 = fs.readFileSync(path.join(__dirname, 'fixtures/start_prompt_2.md'), 'utf-8');
const svml_version = '1.2.2';
const models = ['gpt-4.1-mini', 'claude-3-5-sonnet-20241022'];

describe('SvmlClient generate', () => {
  const apiKey = envs.api_key || 'test-api-key';
  
  it('should call /generate and return SVML output (scenario 1)', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();
    const result = await client.generate({ context: start_prompt_1, svml_version, model: models[0] });
    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(typeof result.output.svml === 'string').toBe(true);
    if ('justifications' in result.output) {
      expect(typeof result.output.justifications).toBe('string');
    }
  });

  it('should call /generate and return SVML output (scenario 2)', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();
    const result = await client.generate({ context: start_prompt_1, svml_version, model: models[1] });
    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(typeof result.output.svml === 'string').toBe(true);
    if ('justifications' in result.output) {
      expect(typeof result.output.justifications).toBe('string');
    }
  });
}); 
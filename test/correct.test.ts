import { SvmlClient } from '../index';
import envs from './env.local.json';
import fs from 'fs';
import path from 'path';

// Load SVML fixtures
const valid_svml = fs.readFileSync(path.join(__dirname, 'fixtures/valid_svml.svml'), 'utf-8');
const invalid_svml = fs.readFileSync(path.join(__dirname, 'fixtures/invalid_svml.svml'), 'utf-8');
const svml_version = '1.2.2';
const model = 'gpt-4.1-mini';

// Load validate_invalid_svml fixture for the new test
const validateInvalidFixture = require('./fixtures/validate_invalid_svml.json');

describe('SvmlClient correct', () => {
  const apiKey = envs.api_key || 'test-api-key';

  it('should correct a valid SVML file (may return unchanged or improved SVML)', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
    });
    await client.authenticate();
    const result = await client.correct({ svml: valid_svml, svml_version, model });
    expect(result).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.output).toBeDefined();
    expect(typeof result.output.svml === 'string').toBe(true);
  });

  it('should correct an invalid SVML file (should return corrected SVML)', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
    });
    await client.authenticate();
    const result = await client.correct({ svml: invalid_svml, svml_version, model });
    expect(result).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.output).toBeDefined();
    expect(typeof result.output.svml === 'string').toBe(true);
  });

  it('should correct SVML using the output of a /validate call (validate_invalid_svml.json)', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
    });
    await client.authenticate();
    // Use the SVML from the validate_invalid_svml fixture
    const svmlFromValidate = validateInvalidFixture.input.svml;
    const result = await client.correct({ svml: svmlFromValidate, svml_version, model });
    expect(result).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.output).toBeDefined();
    expect(typeof result.output.svml === 'string').toBe(true);
  });
}); 
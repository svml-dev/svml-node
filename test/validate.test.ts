import { SvmlClient } from '../src/index';
import envs from './env.local.json';
import fs from 'fs';
import path from 'path';

// Load SVML fixtures
const valid_svml = fs.readFileSync(path.join(__dirname, 'fixtures/valid_svml.svml'), 'utf-8');
const invalid_svml = fs.readFileSync(path.join(__dirname, 'fixtures/invalid_svml.svml'), 'utf-8');
const svml_version = '1.2.2';

// Optionally load expected outputs
const validateValidFixture = require('./fixtures/validate_valid_svml.json');
const validateInvalidFixture = require('./fixtures/validate_invalid_svml.json');

describe('SvmlClient validate', () => {
  const apiKey = envs.api_key || 'test-api-key';

  it('should validate a valid SVML file (no errors, may have best_practices)', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
    });
    await client.authenticate();
    const result = await client.validate({ svml: valid_svml, svml_version });
    expect(result).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(!('usage' in result)).toBe(true);
    expect(!('svml_tokens' in result)).toBe(true);
    expect(!('usage' in result.output)).toBe(true);
    expect(Array.isArray(result.output.violations)).toBe(true);
    expect(result.output.violations.length === 0).toBe(true);
    expect(Array.isArray(result.output.best_practices)).toBe(true);
  });

  it('should validate an invalid SVML file (should have errors)', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
    });
    await client.authenticate();
    const result = await client.validate({ svml: invalid_svml, svml_version });
    expect(result).toBeDefined();    
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(!('usage' in result)).toBe(true);
    expect(!('svml_tokens' in result)).toBe(true);
    expect(!('usage' in result.output)).toBe(true);
    expect(Array.isArray(result.output.violations)).toBe(true);
    expect(result.output.violations.length > 0).toBe(true);
    expect(Array.isArray(result.output.best_practices)).toBe(true);
  });

  it('should return best_practices for valid SVML if applicable', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
    });
    await client.authenticate();
    const result = await client.validate({ svml: valid_svml, svml_version });
    expect(result).toBeDefined();
    expect(Array.isArray(result.output.best_practices)).toBe(true);
    if (result.output.best_practices.length > 0) {
      expect(
        result.output.best_practices.every(
          (bp: any) =>
            (typeof bp === 'string' && bp.startsWith('Best Practice')) ||
            (typeof bp === 'object' && bp.type && bp.type.startsWith('Best Practice'))
        )
      ).toBe(true);
    }
  });
}); 
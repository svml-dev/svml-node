import { SvmlClient } from '../index';
import envs from './env.local.json';
import fs from 'fs';
import path from 'path';
import { test_cache } from './client.test';
import { log } from "console";

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

describe('SvmlClient validate', () => {
  const apiKey = envs.api_key || 'test-api-key';
  const valid_svml = fs.readFileSync(path.join(__dirname, 'fixtures/valid_svml.svml'), 'utf-8');
  const invalid_svml = fs.readFileSync(path.join(__dirname, 'fixtures/invalid_svml.svml'), 'utf-8');
  const valid_version = '1.2.2';
  const invalid_version = '1.2.2';

  it('should validate a valid SVML file (no errors, may have best_practices)', async () => {
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
    const result = await client.validate({ svml: valid_svml, svml_version: valid_version });
    
    saveTestOutput('validate_valid_svml', result);
    expect(result).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(Array.isArray(result.output.violations)).toBe(true);
    expect(result.output.violations.length === 0).toBe(true);
    // best_practices may be present
    expect(Array.isArray(result.output.best_practices)).toBe(true);
  });

  it('should validate an invalid SVML file (should have errors)', async () => {
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
    const result = await client.validate({ svml: invalid_svml, svml_version: invalid_version });
    saveTestOutput('validate_invalid_svml', result);
    expect(result).toBeDefined();
    expect(Array.isArray(result.output.violations)).toBe(true);
    expect(result.output.violations.length > 0).toBe(true);
    expect(Array.isArray(result.output.best_practices)).toBe(true);
  });

  it('should return best_practices for valid SVML if applicable', async () => {
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
    const result = await client.validate({ svml: valid_svml, svml_version: valid_version });
    saveTestOutput('validate_best_practices', result);
    expect(result).toBeDefined();
    expect(Array.isArray(result.output.best_practices)).toBe(true);
    // If best_practices are present, they should be strings or objects with type 'Best Practice'
    if (result.output.best_practices.length > 0) {
      expect(
        result.output.best_practices.every(
          (bp: any) => typeof bp === 'string' || (bp.type && bp.type.startsWith('Best Practice'))
        )
      ).toBe(true);
    }
  });
}); 
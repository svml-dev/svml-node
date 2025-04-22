import { SvmlClient } from '../index';
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

const test_cache = {
  auth: 1, // 1 = use cached JWT if present, 0 = always call API
  generate_1: 0, // 1 = use cached response if present, 0 = always call API
  generate_2: 1,
};

function saveCache() {
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

describe('SvmlClient', () => {
  const apiKey = envs.api_key || 'test-api-key';
  const context = 'In the modern workplace, collaboration between teams is essential for innovation.';
  const svml_version = '1.2.1';
  const model = 'gpt-4o-mini';

  it('should instantiate with default prod URLs and version', () => {
    const client = new SvmlClient(apiKey);
    expect(client).toBeInstanceOf(SvmlClient);
  });

  it('should instantiate with dev env URLs from env.local.json', () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
    });
    expect(client).toBeInstanceOf(SvmlClient);
  });

  it('should instantiate with staging env URLs from env.local.json', () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.staging.authURL,
      apiURL: envs.staging.apiURL,
    });
    expect(client).toBeInstanceOf(SvmlClient);
  });

  it('should instantiate with custom URLs and version', () => {
    const client = new SvmlClient(apiKey, {
      authURL: 'http://custom-auth',
      apiURL: 'http://custom-api',
      version: 2,
    });
    expect(client).toBeInstanceOf(SvmlClient);
  });

  it('should have an authenticate method', () => {
    const client = new SvmlClient(apiKey);
    expect(typeof client.authenticate).toBe('function');
  });

  it('should authenticate and return a JWT (dev env, with cache)', async () => {
    let token: string | null = null;
    if (test_cache.auth === 1 && cache.auth_jwt) {
      token = cache.auth_jwt;
    } else {
      const client = new SvmlClient(apiKey, {
        authURL: envs.dev.authURL,
        apiURL: envs.dev.apiURL,
      });
      token = await client.authenticate();
      cache.auth_jwt = token;
      saveCache();
      saveTestOutput('auth', { token });
    }
    expect(typeof token).toBe('string');
    expect(token && token.length).toBeGreaterThan(20);
  });

  it('should call /generate and cache the result (dev env)', async () => {
    let result: any = null;
    if (test_cache.generate_1 === 1 && cache.generate_1) {
      result = cache.generate_1;
    } else {
      const client = new SvmlClient(apiKey, {
        authURL: envs.dev.authURL,
        apiURL: envs.dev.apiURL,
      });
      // Use cached JWT if available
      if (test_cache.auth === 1 && cache.auth_jwt) {
        (client as any).accessToken = cache.auth_jwt;
        (client as any).authorized = true;
      } else {
        await client.authenticate();
        cache.auth_jwt = client.token;
        saveCache();
      }
      result = await client.generate({ context, svml_version, model });
      cache.generate_1 = result;
      saveCache();
      saveTestOutput('generate_1', result);
    }
    expect(result).toBeDefined();
    expect(result.result).toBeDefined();
  });
}); 
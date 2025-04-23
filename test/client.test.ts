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

export const test_cache = {
  auth: 0, // 1 = use cached JWT if present, 0 = always call API
  generate_1: 1, // 1 = use cached response if present, 0 = always call API
  generate_2: 1, // 1 = use cached response if present, 0 = always call API
  compare: 1, // 1 = use cached response if present, 0 = always call API
  refine: 0, // 1 = use cached response if present, 0 = always call API
};

function saveCache() {
  fs.writeFileSync(cachePath, JSON.stringify(cache, null, 2));
}

describe('SvmlClient', () => {
  const apiKey = envs.api_key || 'test-api-key';
  

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
      console.log('authURL', envs.dev.authURL);
      const client = new SvmlClient(apiKey, {
        authURL: envs.dev.authURL,
        apiURL: envs.dev.apiURL,
      });
      token = await client.authenticate();
      console.log('token', token);
      cache.auth_jwt = token;
      saveCache();
      saveTestOutput('auth', { token });
    }
    expect(typeof token).toBe('string');
    expect(token && token.length).toBeGreaterThan(20);
  });

  const context = 'In the modern workplace, collaboration between teams is essential for innovation, yet communication barriers often arise due to differing priorities, technical jargon, and organizational silos. While leadership may emphasize agility and rapid iteration, compliance departments focus on risk mitigation and regulatory adherence, sometimes creating friction. Meanwhile, the rise of remote work has introduced both flexibility and new challenges in maintaining team cohesion and knowledge transfer. Informal networks and mentorship programs can bridge some gaps, but not all employees have equal access to these resources. The interplay between technology adoption, employee well-being, and business outcomes is complex: new tools can boost productivity but also cause cognitive overload or resistance to change. Ultimately, the success of an organization depends on its ability to harmonize these diverse elements, foster psychological safety, and adapt to evolving market demands.';
  const svml_version = '1.2.1';
  const models = ['gpt-4.1-mini', 'claude-3-5-sonnet-20241022'];

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
      result = await client.generate({ context, svml_version, model: models[0] });
      console.log('result', result);
      cache.generate_1 = result; // Cache the entire response
      saveCache();
      saveTestOutput('generate_1', result); // Save the entire response
    }
    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
  });

  it('should call /generate and cache the result (dev env)', async () => {
    let result: any = null;
    if (test_cache.generate_2 === 1 && cache.generate_2) {
      result = cache.generate_2;
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
      result = await client.generate({ context, svml_version, model: models[1] });
      cache.generate_2 = result; // Cache the entire response
      console.log('result', result);
      saveCache();
      saveTestOutput('generate_2', result); // Save the entire response
    }
    expect(result).toBeDefined();
    expect(result.output).toBeDefined();
  });
}); 
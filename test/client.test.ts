import { SvmlClient } from '../index';
import envs from './env.local.json';

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
});

describe('SvmlClient (extended)', () => {
  const apiKey = envs.api_key || 'test-api-key';
  const devOptions = {
    authURL: envs.dev.authURL,
    apiURL: envs.dev.apiURL,
  };

  it('should authenticate and fetch models and svmlVersions', async () => {
    const client = new SvmlClient(apiKey, devOptions);
    await client.authenticate();
    expect(client.token).toBeTruthy();
    
    // Fetch models and set default model
    const models = await client.fetchModels();
    console.log('models', models);
    expect(Array.isArray(models)).toBe(true);
    expect(models.length).toBeGreaterThan(0);
    client.setDefaultModel(models[0].id);

    // Fetch svmlVersions and set default svmlVersion
    const svmlVersions = await client.fetchSvmlVersions();
    console.log('svmlVersions', svmlVersions);
    expect(Array.isArray(svmlVersions)).toBe(true);
    expect(svmlVersions.length).toBeGreaterThan(0);        
    client.setDefaultSvmlVersion(svmlVersions[0]);

    // Validate default model and svmlVersion
    expect(client.defaultModel).toBeTruthy();
    expect(client.defaultSvmlVersion).toBeTruthy();
  });

  it('should set and validate default model/version', async () => {
    const client = new SvmlClient(apiKey, devOptions);
    await client.authenticate();
    
    const validModel = client.models[0];
    const validVersion = client.svmlVersions[0];
    expect(() => client.setDefaultModel(validModel)).not.toThrow();
    expect(() => client.setDefaultSvmlVersion(validVersion)).not.toThrow();
    expect(() => client.setDefaultModel('not-a-model')).toThrow();
    expect(() => client.setDefaultSvmlVersion('not-a-version')).toThrow();
  });

  it('should throw if calling endpoint before authenticate', async () => {
    const client = new SvmlClient(apiKey, devOptions);
    await expect(client.generate({ context: 'test', svml_version: '1.2.2', model: 'gpt-4.1-mini' }))
      .rejects.toThrow(/Not authorized/);
  });

  it('should throw on invalid API key', async () => {
    const badClient = new SvmlClient('invalid-key', devOptions);
    await expect(badClient.authenticate()).rejects.toThrow(/Authorization failed/);
  });
}); 
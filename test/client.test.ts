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
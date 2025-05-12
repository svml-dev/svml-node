import { SvmlClient } from '../src/index';
import envs from './env.local.json';
import fs from 'fs';
import path from 'path';

// Load SVML fixtures
const valid_svml = fs.readFileSync(path.join(__dirname, 'fixtures/valid_svml.svml'), 'utf-8');
const invalid_svml = fs.readFileSync(path.join(__dirname, 'fixtures/invalid_svml.svml'), 'utf-8');
const validation_invalid_svml = JSON.parse(
  fs.readFileSync(path.join(__dirname, 'fixtures/validate_invalid_svml.json'), 'utf-8')
);
const svml_version = '1.2.2';
const model = 'gpt-4.1-mini';

// Load validate_invalid_svml fixture for the new test
const validateInvalidFixture = require('./fixtures/validate_invalid_svml.json');

describe('SvmlClient correct', () => {
  const apiKey = envs.api_key || 'test-api-key';

  it('should validate and then correct invalid SVML', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();
    
    // For a invalid SVML, first validate, then correct using the full output
    const validateResult = await client.validate({ svml: invalid_svml, svml_version });
    //console.log('validateResult', JSON.stringify(validateResult, null, 2));
    const result = await client.correct({ validation_api_output: validateResult, svml_version, model });
    //console.log('result', JSON.stringify(result, null, 2));
    
    expect(result).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.output).toBeDefined();
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(typeof result.output.svml === 'string').toBe(true);
    expect(!('usage' in result)).toBe(true);
    expect(!('usage' in result.output)).toBe(true);
  });

  it('should correct invalid SVML from file (validate_invalid_svml.json)', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();    
    
    const result = await client.correct({ validation_api_output: validation_invalid_svml, svml_version, model });
    expect(result).toBeDefined();
    expect(result.metadata).toBeDefined();
    expect(result.output).toBeDefined();
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(typeof result.output.svml === 'string').toBe(true);
    expect(!('usage' in result)).toBe(true);
    expect(!('usage' in result.output)).toBe(true);
  });


  it('should validate and then correct valid SVML, resulting in nothing to change', async () => {
    const client = new SvmlClient(apiKey, {
      authURL: envs.dev.authURL,
      apiURL: envs.dev.apiURL,
      num_retry: 0,
    });
    await client.authenticate();
    
    // For a invalid SVML, first validate, then correct using the full output
    const validateResult = await client.validate({ svml: valid_svml, svml_version });
    //console.log('validateResult', JSON.stringify(validateResult, null, 2));
    const result = await client.correct({ validation_api_output: validateResult, svml_version, model });
    //console.log('result', JSON.stringify(result, null, 2));
    
    expect(result).toBeDefined();
    // expect(result.result).toBe('SVML VALID - NO CORRECTION NEEDED.');
    expect(result.metadata).toBeDefined();
    expect(result.output).toBeDefined();
    expect('svml_version' in result && result.svml_version).toBeTruthy();
    expect('svml_credits' in result && result.svml_credits).toBeTruthy();
    expect(typeof result.output.svml === 'string').toBe(true);
    expect(!('usage' in result)).toBe(true);
    expect(!('usage' in result.output)).toBe(true);
  });
}); 
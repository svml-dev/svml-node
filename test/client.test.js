const { SvmlClient } = require('../index');

test('SvmlClient initializes with default endpoints', () => {
  const client = new SvmlClient();
  expect(client.apiBase).toBe('https://api.svml.dev');
  expect(client.authBase).toBe('https://auth.svml.dev');
  expect(client.token).toBe(null);
}); 
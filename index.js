const fetch = require('node-fetch');

class SvmlClient {
  constructor(apiBase = 'https://api.svml.dev', authBase = 'https://auth.svml.dev') {
    this.apiBase = apiBase;
    this.authBase = authBase;
    this.token = null;
  }

  async authenticate(email, password) {
    // Stub: Replace with real auth logic
    const resp = await fetch(`${this.authBase}/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!resp.ok) throw new Error(`Auth failed: ${resp.status}`);
    const data = await resp.json();
    this.token = data.access_token;
    return this.token;
  }

  async callApi(endpoint, data) {
    // Stub: Replace with real API call logic
    const headers = this.token ? { 'Authorization': `Bearer ${this.token}` } : {};
    const resp = await fetch(`${this.apiBase}/${endpoint}`, {
      method: 'POST',
      headers: { ...headers, 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!resp.ok) throw new Error(`API call failed: ${resp.status}`);
    return await resp.json();
  }
}

module.exports = { SvmlClient }; 
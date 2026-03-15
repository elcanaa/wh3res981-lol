// netlify/functions/settings.js
// GET  → restituisce le impostazioni salvate (pubblico, tutti possono leggere)
// POST → salva le impostazioni (protetto da password admin)

const { getStore } = require('@netlify/blobs');

const ADMIN_PW = 'wh3res981admin';

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, x-admin-pw',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Content-Type': 'application/json',
  };

  // Preflight CORS
  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 204, headers, body: '' };
  }

  try {
    const store = getStore('profile');

    // ── GET: chiunque può leggere ──
    if (event.httpMethod === 'GET') {
      const raw = await store.get('settings');
      if (!raw) return { statusCode: 200, headers, body: JSON.stringify({}) };
      return { statusCode: 200, headers, body: raw };
    }

    // ── POST: solo admin ──
    if (event.httpMethod === 'POST') {
      const pw = event.headers['x-admin-pw'] || '';
      if (pw !== ADMIN_PW) {
        return { statusCode: 401, headers, body: JSON.stringify({ error: 'Unauthorized' }) };
      }

      const body = JSON.parse(event.body || '{}');
      await store.set('settings', JSON.stringify(body));
      return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('Settings function error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
  }
};

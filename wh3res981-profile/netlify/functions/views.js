// netlify/functions/views.js
// Uses Netlify Blobs (built-in key-value storage) — zero config needed on Netlify.
// Every POST = +1 view. GET = read current count.

const { getStore } = require('@netlify/blobs');

exports.handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  try {
    const store = getStore('profile');

    if (event.httpMethod === 'GET') {
      const raw = await store.get('views');
      const views = raw ? parseInt(raw) : 0;
      return { statusCode: 200, headers, body: JSON.stringify({ views }) };
    }

    if (event.httpMethod === 'POST') {
      const raw = await store.get('views');
      const current = raw ? parseInt(raw) : 0;
      const next = current + 1;
      await store.set('views', String(next));
      return { statusCode: 200, headers, body: JSON.stringify({ views: next }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (err) {
    console.error('Views function error:', err);
    return { statusCode: 500, headers, body: JSON.stringify({ error: 'Internal error' }) };
  }
};

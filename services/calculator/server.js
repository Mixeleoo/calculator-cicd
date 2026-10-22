'use strict';
const http = require('http');
const os = require('os');

const NAME = 'calculator';
const VERSION = 'v1';
const PORT = process.env.PORT || 8080;
const TIMEOUT_MS = Number(process.env.TIMEOUT_MS || 2000);
const URLS = {
  '+': process.env.SUM_URL || 'http://sum-service:8080',
  '-': process.env.SUB_URL || 'http://sub-service:8080',
  '*': process.env.MUL_URL || 'http://mul-service:8080',
  '/': process.env.DIV_URL || 'http://div-service:8080',
};

// Calls one arithmetic microservice over HTTP.
async function callService(op, a, b) {
  const r = await fetch(URLS[op], {
    method: 'POST',
    body: a + ' ' + b,
    signal: AbortSignal.timeout(TIMEOUT_MS),
  });
  const text = (await r.text()).trim();
  if (!r.ok) throw new Error(text);
  return Number(text);
}

// Recursive descent parser. Every operation is delegated to "call".
async function evaluate(expr, call) {
  const tokens = expr.match(/\d+(\.\d+)?|[-+*/()]/g) || [];
  let i = 0;
  const peek = () => tokens[i];
  const next = () => tokens[i++];

  async function factor() {
    const t = next();
    if (t === '(') {
      const v = await sumExpr();
      if (next() !== ')') throw new Error('missing closing parenthesis');
      return v;
    }
    if (t === '-') return call('-', 0, await factor());
    if (t === undefined || isNaN(Number(t))) throw new Error('unexpected token: ' + t);
    return Number(t);
  }
  async function term() {
    let v = await factor();
    while (peek() === '*' || peek() === '/') v = await call(next(), v, await factor());
    return v;
  }
  async function sumExpr() {
    let v = await term();
    while (peek() === '+' || peek() === '-') v = await call(next(), v, await term());
    return v;
  }
  const result = await sumExpr();
  if (i < tokens.length) throw new Error('unexpected token: ' + peek());
  return result;
}

function send(res, code, text) {
  res.writeHead(code, { 'Content-Type': 'text/plain' });
  res.end(text + '\n');
}

function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET' && url.pathname === '/health') return send(res, 200, 'ok');
  if (req.method === 'GET' && url.pathname === '/version') {
    return send(res, 200, NAME + ' ' + VERSION + ' served by ' + os.hostname());
  }
  if (req.method !== 'POST') return send(res, 404, 'not found');
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', async () => {
    try {
      const result = await evaluate(body, callService);
      console.log('[' + NAME + '] ' + body.trim() + ' = ' + result);
      send(res, 200, String(result));
    } catch (e) {
      const timeout = e.name === 'TimeoutError' || e.name === 'AbortError';
      console.log('[' + NAME + '] error: ' + e.message);
      send(res, timeout ? 504 : 502, timeout ? 'a service did not answer in time' : e.message);
    }
  });
}

if (require.main === module) {
  http.createServer(handler).listen(PORT, () => console.log('[' + NAME + '] ' + VERSION + ' listening on ' + PORT));
}

module.exports = { evaluate };

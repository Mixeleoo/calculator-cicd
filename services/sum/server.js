'use strict';
const http = require('http');
const os = require('os');

const NAME = 'sum';
const VERSION = 'v1';
const PORT = process.env.PORT || 8080;
const WORK_MS = Number(process.env.WORK_MS || 0);   // CPU time burned per request
const DELAY_MS = Number(process.env.DELAY_MS || 0); // extra waiting time per request

let sick = false;
const hold = [];

function compute(a, b) {
  return a + b;
}

function burnCpu(ms) {
  if (ms <= 0) return;
  const start = process.cpuUsage();
  for (;;) {
    const d = process.cpuUsage(start);
    if ((d.user + d.system) / 1000 >= ms) return;
  }
}

function parse(body) {
  const parts = body.trim().split(/\s+/).map(Number);
  if (parts.length !== 2 || parts.some(Number.isNaN)) return null;
  return parts;
}

function send(res, code, text) {
  res.writeHead(code, { 'Content-Type': 'text/plain' });
  res.end(text + '\n');
}

function handler(req, res) {
  const url = new URL(req.url, 'http://localhost');
  if (req.method === 'GET') {
    switch (url.pathname) {
      case '/health':
        return sick ? send(res, 500, 'sick') : send(res, 200, 'ok');
      case '/version':
        return send(res, 200, NAME + ' ' + VERSION + ' served by ' + os.hostname());
      case '/sick':
        sick = true;
        return send(res, 200, NAME + ' is now sick');
      case '/crash':
        send(res, 200, 'bye');
        return void setTimeout(() => process.exit(1), 50);
      case '/alloc': {
        const mb = Number(url.searchParams.get('mb') || 10);
        hold.push(Buffer.alloc(mb * 1024 * 1024, 1));
        return send(res, 200, 'allocated ' + mb + ' MB, total ' + hold.length + ' blocks');
      }
      default:
        return send(res, 404, 'not found');
    }
  }
  let body = '';
  req.on('data', (c) => (body += c));
  req.on('end', () => {
    const args = parse(body);
    if (!args) return send(res, 400, 'expected two numbers, for example: 2 3');
    burnCpu(WORK_MS);
    setTimeout(() => {
      try {
        const result = compute(args[0], args[1]);
        console.log('[' + NAME + '] ' + args[0] + ' + ' + args[1] + ' = ' + result);
        send(res, 200, String(result));
      } catch (e) {
        send(res, 400, e.message);
      }
    }, DELAY_MS);
  });
}

if (require.main === module) {
  http.createServer(handler).listen(PORT, () => console.log('[' + NAME + '] ' + VERSION + ' listening on ' + PORT));
}

module.exports = { compute };

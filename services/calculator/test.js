const test = require('node:test');
const assert = require('node:assert');
const { evaluate } = require('./server.js');

// Local stand in for the four arithmetic microservices.
const fake = async (op, a, b) => ({ '+': a + b, '-': a - b, '*': a * b, '/': a / b })[op];

test('(5+6)*2 = 22', async () => {
  assert.strictEqual(await evaluate('(5+6)*2', fake), 22);
});

test('operator precedence', async () => {
  assert.strictEqual(await evaluate('2+3*4', fake), 14);
});

test('division', async () => {
  assert.strictEqual(await evaluate('15/5', fake), 3);
});

test('invalid expression is rejected', async () => {
  await assert.rejects(() => evaluate('2+*3', fake));
});

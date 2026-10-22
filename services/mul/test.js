const test = require('node:test');
const assert = require('node:assert');
const { compute } = require('./server.js');

test('12 * 3 = 36', () => {
  assert.strictEqual(compute(12, 3), 36);
});

test('0 * 9 = 0', () => {
  assert.strictEqual(compute(0, 9), 0);
});

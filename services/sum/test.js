const test = require('node:test');
const assert = require('node:assert');
const { compute } = require('./server.js');

test('2 + 3 = 5', () => {
  assert.strictEqual(compute(2, 3), 5);
});

test('-1 + 1 = 0', () => {
  assert.strictEqual(compute(-1, 1), 0);
});

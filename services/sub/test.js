const test = require('node:test');
const assert = require('node:assert');
const { compute } = require('./server.js');

test('5 - 3 = 2', () => {
  assert.strictEqual(compute(5, 3), 2);
});

test('3 - 5 = -2', () => {
  assert.strictEqual(compute(3, 5), -2);
});

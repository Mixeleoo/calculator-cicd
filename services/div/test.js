const test = require('node:test');
const assert = require('node:assert');
const { compute } = require('./server.js');

test('15 / 5 = 3', () => {
  assert.strictEqual(compute(15, 5), 3);
});

test('1 / 4 = 0.25', () => {
  assert.strictEqual(compute(1, 4), 0.25);
});

test('division by zero is rejected', () => {
  assert.throws(() => compute(1, 0));
});

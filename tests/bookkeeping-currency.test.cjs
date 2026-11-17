const { test } = require('node:test'),
  assert = require('node:assert/strict');
const load = require('./load-bookkeeping.cjs'),
  fx = load('currency');
test('汇率以整数百万分率计算并四舍五入到分', () => {
  assert.equal(fx.parseRate('7.123456'), 7123456);
  assert.equal(
    fx.convertedCents({ currency: 'USD', cents: 12345, rateMicros: fx.parseRate('7.2') }),
    88884
  );
  assert.equal(
    fx.convertedCents({ currency: 'JPY', cents: 100, rateMicros: fx.parseRate('0.048') }),
    5
  );
  assert.throws(() => fx.parseRate('0'));
  assert.throws(() => fx.parseRate('1.1234567'));
});
test('大额原币运算不经过不安全浮点乘法，超额拒绝', () => {
  const original = 99999999999,
    rate = 999999999999;
  assert.throws(() => fx.convertedCents({ currency: 'USD', cents: original, rateMicros: rate }));
  assert.equal(
    fx.convertedCents({ currency: 'USD', cents: original, rateMicros: 1000000 }),
    original
  );
});

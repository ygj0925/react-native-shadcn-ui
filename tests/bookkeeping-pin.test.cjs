const { test } = require('node:test'),
  assert = require('node:assert/strict'),
  crypto = require('node:crypto');
const load = require('./load-bookkeeping.cjs');
test('PIN哈希、错误计数与锁定持久化，正确密码恢复计数', async () => {
  const storage = new Map();
  const pin = load('pin', {
    'expo-secure-store': {
      getItemAsync: async (k) => storage.get(k) ?? null,
      setItemAsync: async (k, v) => storage.set(k, v),
      deleteItemAsync: async (k) => storage.delete(k),
    },
    'expo-crypto': { getRandomBytes: (n) => crypto.randomBytes(n) },
  });
  await assert.rejects(pin.setPin('123', '123'));
  await pin.setPin('864209', '864209');
  assert.equal(await pin.hasPin(), true);
  const raw = [...storage.values()][0];
  assert.equal(JSON.parse(raw).hash.includes('864209'), false);
  await assert.rejects(pin.verifyPin('000000'));
  await pin.verifyPin('864209');
  assert.equal(JSON.parse([...storage.values()][0]).attempts, 0);
  for (let i = 0; i < 5; i++) await assert.rejects(pin.verifyPin('000000'));
  await assert.rejects(pin.verifyPin('864209'), /错误次数过多/);
  await pin.removePin();
  assert.equal(await pin.hasPin(), false);
});

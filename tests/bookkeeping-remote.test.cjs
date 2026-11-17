const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');
const file = path.resolve(__dirname, '../features/bookkeeping/remote.ts');
const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const mod = new Module(file, module);
mod.filename = file;
mod.paths = module.paths;
mod.require = (id) =>
  id === 'react-native'
    ? { Platform: { OS: 'web' } }
    : id === 'expo-secure-store'
      ? {}
      : require(id);
mod._compile(code, file);
global.__DEV__ = true;
const { remoteClient, RemoteError } = mod.exports;
const session = {
  token: 'test-only-token',
  tokenName: 'Authorization',
  user: { id: '999999999999999999', nickname: '测试' },
};
test('真实登录字段和预算字段与Java Req匹配', async () => {
  const requests = [];
  const original = global.fetch;
  global.fetch = async (url, init) => {
    requests.push({ url, init });
    return { ok: true, json: async () => ({ code: '0', data: {} }) };
  };
  try {
    const api = remoteClient('https://example.com', session);
    await api.login('13800000000', 'test-only-password', 'ACCOUNT');
    await api.setBudget('2026-11', 'total', '200.00');
    assert.deepEqual(JSON.parse(requests[0].init.body), {
      authType: 'ACCOUNT',
      account: '13800000000',
      password: 'test-only-password',
    });
    assert.deepEqual(JSON.parse(requests[1].init.body), {
      period: '2026-11',
      category: 'total',
      budgetAmount: '200.00',
    });
    assert.equal(requests[1].init.headers.Authorization, 'Bearer test-only-token');
  } finally {
    global.fetch = original;
  }
});
test('共享流水用字符串groupId与服务端分页参数', async () => {
  const original = global.fetch;
  let request;
  global.fetch = async (url, init) => {
    request = { url, init };
    return { ok: true, json: async () => ({ success: true, data: { records: [], total: 0 } }) };
  };
  try {
    await remoteClient('https://example.com', session).records('2026-11', '999999999999999999', 2);
    assert.ok(request.url.includes('groupId=999999999999999999'));
    assert.ok(request.url.includes('page=2&size=50'));
  } finally {
    global.fetch = original;
  }
});
test('业务失败不伪装成功，保留冲突码', async () => {
  const original = global.fetch;
  global.fetch = async () => ({
    ok: true,
    json: async () => ({ success: false, code: '4002', msg: '版本冲突' }),
  });
  try {
    await assert.rejects(
      remoteClient('https://example.com', session).snapshot(),
      (e) => e instanceof RemoteError && e.code === '4002'
    );
  } finally {
    global.fetch = original;
  }
});
test('服务根地址拒绝明文凭证与非HTTP协议', () => {
  assert.throws(() => remoteClient('file:///secret'));
  assert.throws(() => remoteClient('https://user:password@example.com'));
  assert.throws(() => remoteClient('https://example.com?token=secret'));
});

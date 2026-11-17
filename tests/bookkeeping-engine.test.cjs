const { test } = require('node:test'),
  assert = require('node:assert/strict');
const load = require('./load-bookkeeping.cjs'),
  domain = load('domain'),
  { applyChanges } = load('sync-domain');
const clone = (x) => JSON.parse(JSON.stringify(x));
function setup() {
  let data = domain.initialData(),
    cloud = null,
    version = 0,
    counter = 0,
    loseAck = false,
    patches = 0,
    flushFails = false;
  let session = {
    base: 'https://example.com',
    session: { token: 'test-only', tokenName: 'Authorization', user: { id: 'a', nickname: 'A' } },
  };
  const records = new Map(),
    acks = new Map();
  const store = {
    getState: () => ({
      data,
      ready: true,
      error: null,
      setData: (fn) => {
        data = fn(data);
      },
    }),
  };
  class RemoteError extends Error {
    constructor(code, message) {
      super(message);
      this.code = code;
    }
  }
  const api = {
    snapshot: async (known) => ({
      version,
      payload: known === version ? null : cloud && domain.backup(cloud),
    }),
    saveSnapshot: async (base, op, payload) => {
      assert.equal(base, version);
      cloud = domain.restore(payload);
      version++;
      return { version, payload: domain.backup(cloud) };
    },
    patchSnapshot: async (base, op, changes) => {
      patches++;
      if (acks.has(op)) return acks.get(op);
      if (base !== version) throw new RemoteError('4002', '冲突');
      cloud = applyChanges(cloud, changes);
      version++;
      const result = { version, payload: domain.backup(cloud) };
      acks.set(op, result);
      if (loseAck) {
        loseAck = false;
        throw new Error('模拟提交成功但响应丢失');
      }
      return result;
    },
  };
  const engine = load('auto-sync', {
    'react-native': { AppState: {} },
    '@react-native-community/netinfo': {},
    '@react-native-async-storage/async-storage': {
      __esModule: true,
      default: {
        getItem: async (key) => records.get(key) ?? null,
        setItem: async (key, value) => records.set(key, value),
      },
    },
    './store': {
      useLedgerStore: store,
      newId: () => `operation-${++counter}-123456`,
      flushLedgerPersistence: async () => {
        if (flushFails) {
          flushFails = false;
          throw new Error('模拟本地写盘失败');
        }
      },
    },
    './remote': {
      loadRemoteSession: async () => session,
      remoteClient: () => api,
      RemoteError,
      subscribeRemoteSession: () => () => {},
    },
  });
  return {
    engine,
    getData: () => data,
    getCloud: () => cloud,
    setData: (fn) => {
      data = fn(data);
    },
    session: () => session,
    records,
    dropAck: () => (loseAck = true),
    failFlush: () => (flushFails = true),
    patchCount: () => patches,
    switchUser: () => {
      session = { ...session, session: { ...session.session, user: { id: 'b', nickname: 'B' } } };
    },
  };
}
test('提交响应丢失后重放相同操作，保留重试期间新增修改', async () => {
  const f = setup();
  await f.engine.initializeAutoSync(f.session().base, f.session().session, 'local');
  f.setData((d) => ({ ...d, books: d.books.map((b) => ({ ...b, name: '家庭' })) }));
  f.dropAck();
  await f.engine.syncNow();
  assert.equal(f.getCloud().books[0].name, '家庭');
  f.setData((d) => ({
    ...d,
    categories: d.categories.map((c, i) => (i ? c : { ...c, name: '早餐' })),
  }));
  await f.engine.syncNow();
  assert.equal(f.getData().books[0].name, '家庭');
  assert.equal(f.getCloud().categories[0].name, '早餐');
});
test('本地写盘失败前不提交差量', async () => {
  const f = setup();
  await f.engine.initializeAutoSync(f.session().base, f.session().session, 'local');
  f.setData((d) => ({ ...d, books: d.books.map((b) => ({ ...b, name: '尚未写盘' })) }));
  f.failFlush();
  await f.engine.syncNow();
  assert.equal(f.patchCount(), 0);
  assert.equal(f.getCloud().books[0].name, '日常账本');
  await f.engine.syncNow();
  assert.equal(f.getCloud().books[0].name, '尚未写盘');
});
test('切换到另一同步账号不会自动上传前一账号工作区', async () => {
  const f = setup();
  await f.engine.initializeAutoSync(f.session().base, f.session().session, 'local');
  const old = f.records.get('jianzhang-auto-sync:https://example.com:a');
  f.records.set('jianzhang-auto-sync:https://example.com:b', old);
  f.switchUser();
  f.setData((d) => ({ ...d, books: d.books.map((b) => ({ ...b, name: 'A的私有内容' })) }));
  await f.engine.syncNow();
  assert.equal(f.patchCount(), 0);
  assert.equal(f.getCloud().books[0].name, '日常账本');
});

const { test } = require('node:test'),
  assert = require('node:assert/strict');
const load = require('./load-bookkeeping.cjs'),
  d = load('domain'),
  sync = load('sync-domain');
const clone = (x) => JSON.parse(JSON.stringify(x));
const entry = (id, note = '') => ({
  id,
  bookId: 'daily',
  type: 'expense',
  cents: 100,
  categoryId: 'expense-0',
  accountId: 'cash',
  date: '2026-11-17',
  note,
  tags: [],
  updatedAt: '2026-11-17T00:00:00Z',
});
test('不同对象修改自动合并，保留双方记录', () => {
  const base = d.initialData(),
    local = clone(base),
    remote = clone(base);
  local.entries.push(entry('local'));
  remote.entries.push(entry('remote'));
  const result = sync.mergeThreeWay(base, local, remote);
  assert.equal(result.conflicts.length, 0);
  assert.deepEqual(result.data.entries.map((e) => e.id).sort(), ['local', 'remote']);
});
test('同一记录双端修改必须选择，禁止静默覆盖', () => {
  const base = d.initialData();
  base.entries = [entry('same')];
  const local = clone(base),
    remote = clone(base);
  local.entries[0].note = '本机';
  remote.entries[0].note = '云端';
  const conflict = sync.mergeThreeWay(base, local, remote);
  assert.equal(conflict.conflicts.length, 1);
  const resolved = sync.mergeThreeWay(base, local, remote, { 'entries:same': 'remote' });
  assert.equal(resolved.data.entries[0].note, '云端');
  assert.equal(resolved.conflicts.length, 0);
});
test('删除墓碑与编辑冲突，不复活已删账单', () => {
  const base = d.initialData();
  base.entries = [entry('same')];
  const local = clone(base),
    remote = clone(base);
  local.entries[0].deletedAt = 'now';
  remote.entries[0].note = '更改';
  assert.equal(sync.mergeThreeWay(base, local, remote).conflicts.length, 1);
  const resolved = sync.mergeThreeWay(base, local, remote, { 'entries:same': 'local' });
  assert.equal(resolved.data.entries[0].deletedAt, 'now');
  assert.equal(d.totals(resolved.data.entries).expense, 0);
});
test('相同修改不冲突，字段顺序不产生假变化', () => {
  const base = d.initialData(),
    local = clone(base);
  local.books[0] = { currency: 'CNY', name: '日常账本', id: 'daily' };
  assert.equal(sync.difference(base, local).length, 0);
  local.books[0].name = '家庭';
  const remote = clone(local);
  assert.equal(sync.mergeThreeWay(base, local, remote).conflicts.length, 0);
});
test('差量应用幂等，预算使用复合键', () => {
  const base = d.initialData(),
    next = clone(base);
  next.budgets = [{ bookId: 'daily', month: '2026-11', categoryId: 'total', cents: 30000 }];
  const changes = sync.difference(base, next);
  assert.equal(changes[0].key, '["daily","2026-11","total"]');
  const once = sync.applyChanges(base, changes);
  assert.deepEqual(sync.applyChanges(once, changes), once);
  assert.throws(() =>
    sync.applyChanges(base, [{ collection: 'entries', key: 'wrong', value: entry('other') }])
  );
});
test('合并后引用完整性受校验，不接受悬空账户', () => {
  const base = d.initialData(),
    next = clone(base);
  next.entries = [entry('e')];
  assert.throws(() =>
    sync.applyChanges(next, [{ collection: 'accounts', key: 'cash', value: null }])
  );
});
test('连续天数按业务日期、账本计算，支持昨天延续', () => {
  const base = d.initialData();
  base.entries = [
    entry('1'),
    { ...entry('2'), date: '2026-11-16' },
    { ...entry('3'), date: '2026-11-15' },
    { ...entry('4'), date: '2026-11-18', bookId: 'other' },
  ];
  assert.deepEqual(d.bookkeepingStreak(base, '2026-11-18'), { totalDays: 3, streak: 3 });
});
test('旧备份兼容，存钱目标坏金额拒绝恢复', () => {
  const base = d.initialData();
  assert.deepEqual(d.restore(d.backup(base)), base);
  base.goals = [
    { id: 'goal', name: '旅行', targetCents: -1, savedCents: 0, targetDate: '2026-12-01' },
  ];
  assert.throws(() => d.restore(d.backup(base)));
});

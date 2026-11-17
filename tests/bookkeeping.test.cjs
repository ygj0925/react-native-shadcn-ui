const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const ts = require('typescript');
const Module = require('node:module');
const path = require('node:path');
const file = path.resolve(__dirname, '../features/bookkeeping/domain.ts');
const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText;
const mod = new Module(file, module);
mod.filename = file;
mod.paths = module.paths;
mod._compile(code, file);
const d = mod.exports;
function fixture() {
  const data = d.initialData();
  data.accounts.push({ id: 'bank', name: '银行卡', kind: 'bank', openingCents: 10000 });
  return data;
}
function entry(overrides = {}) {
  return {
    id: 'e1',
    bookId: 'daily',
    type: 'expense',
    cents: 10,
    categoryId: 'expense-0',
    accountId: 'cash',
    date: '2026-11-17',
    note: '',
    tags: [],
    updatedAt: new Date().toISOString(),
    ...overrides,
  };
}
test('金额以整数分运算，拒绝非法和超范围值', () => {
  assert.equal(d.cents('0.10') + d.cents('0.20'), 30);
  for (const v of ['0', '-1', 'NaN', '1.001', '1e5', '1000000000', '', 'Infinity'])
    assert.throws(() => d.cents(v));
  assert.equal(d.cents('-25.12', true), -2512);
});
test('日期校验覆盖闰年与无效月份', () => {
  assert.ok(d.validDate('2024-02-29'));
  for (const v of ['2026-02-29', '2026-04-31', '2026-13-01', '2026-00-01'])
    assert.equal(d.validDate(v), false);
});
test('转账不影响净资产，删除与修改重新计算余额', () => {
  const data = fixture();
  data.entries = [entry({ type: 'transfer', cents: 1000, toAccountId: 'bank' })];
  assert.deepEqual(d.balances(data), { cash: -1000, bank: 11000 });
  assert.equal(d.totals(data.entries).expense, 0);
  data.entries[0].cents = 2000;
  assert.equal(d.balances(data).cash, -2000);
  data.entries[0].deletedAt = 'now';
  assert.deepEqual(d.balances(data), { cash: 0, bank: 10000 });
});
test('转入账户和类型分类约束', () => {
  const data = fixture();
  assert.throws(() => d.validateEntry(entry({ type: 'transfer', toAccountId: 'cash' }), data));
  assert.throws(() => d.validateEntry(entry({ categoryId: 'income-0' }), data));
  assert.throws(() => d.validateEntry(entry({ accountId: 'missing' }), data));
});
test('账本与自定义账期隔离', () => {
  const data = fixture();
  data.settings.billingStartDay = 25;
  data.entries = [
    entry({ date: '2026-11-24' }),
    entry({ id: '2', date: '2026-11-25' }),
    entry({ id: '3', date: '2026-12-24' }),
    entry({ id: '4', date: '2026-12-25' }),
    entry({ id: '5', bookId: 'other' }),
  ];
  assert.deepEqual(
    d.entriesForPeriod(data, '2026-11').map((e) => e.id),
    ['2', '3']
  );
  assert.deepEqual(d.periodRange('2024-02', 31), ['2024-02-29', '2024-03-31']);
});
test('周期账单钳制月末并保持31日锚点', () => {
  assert.equal(d.nextOccurrence('2024-01-31', 'monthly', 31), '2024-02-29');
  assert.equal(d.nextOccurrence('2024-02-29', 'monthly', 31), '2024-03-31');
});
test('周期补账幂等，包括已经删除的周期实例', () => {
  const data = fixture();
  data.recurring = [
    {
      id: 'rule',
      template: entry(),
      frequency: 'monthly',
      nextDate: '2026-01-31',
      day: 31,
      enabled: true,
    },
  ];
  const next = d.materializeRecurring(data, '2026-03-31');
  assert.equal(next.entries.length, 3);
  assert.equal(next.recurring[0].nextDate, '2026-04-30');
  assert.equal(d.materializeRecurring(next, '2026-03-31').entries.length, 3);
  next.entries[0].deletedAt = 'now';
  next.recurring[0].nextDate = '2026-01-31';
  assert.equal(d.materializeRecurring(next, '2026-03-31').entries.length, 3);
});
test('完整备份可恢复，坏结构和重复ID被拒绝', () => {
  const data = fixture();
  data.entries = [entry()];
  assert.deepEqual(d.restore(d.backup(data)), data);
  const bad = JSON.parse(d.backup(data));
  bad.data.entries.push(entry());
  assert.throws(() => d.restore(JSON.stringify(bad)));
  assert.throws(() => d.restore('{}'));
});
test('CSV中文、换行、引号、公式防护与重复预览', () => {
  const data = fixture();
  data.entries = [entry({ note: '=SUM(1,2)\n"晚餐"', tags: ['旅行'] })];
  const text = d.exportCSV(data);
  assert.ok(text.includes("'=SUM"));
  const parsed = d.previewCSV(text, fixture());
  assert.equal(parsed.entries[0].note, data.entries[0].note);
  assert.equal(d.previewCSV(text, data).duplicates, 1);
  assert.equal(d.previewCSV(text, data).entries.length, 0);
});
test('坏CSV不产生部分导入，未知账户被拒绝', () => {
  assert.throws(() => d.parseCSV('a,"未闭合'));
  const data = fixture();
  data.entries = [entry()];
  assert.throws(() => d.previewCSV(d.exportCSV(data).replace('现金', '未知账户'), fixture()));
});

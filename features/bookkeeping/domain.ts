export type EntryType = 'expense' | 'income' | 'transfer';
export type Book = { id: string; name: string; currency: 'CNY'; archived?: boolean };
export type Account = {
  id: string;
  name: string;
  kind: 'cash' | 'bank' | 'credit';
  openingCents: number;
};
export type Category = { id: string; name: string; type: 'expense' | 'income'; archived?: boolean };
export type Entry = {
  original?: import('./currency').OriginalAmount;
  id: string;
  bookId: string;
  type: EntryType;
  cents: number;
  categoryId: string;
  accountId: string;
  toAccountId?: string;
  date: string;
  note: string;
  tags: string[];
  updatedAt: string;
  deletedAt?: string;
  recurringKey?: string;
  attachments?: { id: string; name: string; mime: string; size: number }[];
};
export type SavingsGoal = {
  id: string;
  name: string;
  targetCents: number;
  savedCents: number;
  targetDate: string;
  deletedAt?: string;
};
export type Budget = { bookId: string; month: string; categoryId: string; cents: number };
export type Recurring = {
  id: string;
  template: Omit<Entry, 'id' | 'updatedAt' | 'recurringKey'>;
  frequency: 'daily' | 'weekly' | 'monthly';
  nextDate: string;
  day: number;
  enabled: boolean;
};
export type LedgerData = {
  books: Book[];
  accounts: Account[];
  categories: Category[];
  entries: Entry[];
  budgets: Budget[];
  recurring: Recurring[];
  goals?: SavingsGoal[];
  activeBookId: string;
  settings: {
    hideAmounts: boolean;
    billingStartDay: number;
    theme: 'light' | 'dark';
    accent: string;
  };
};
export function localDate(date = new Date()): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
export function validDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [y, m, d] = value.split('-').map(Number);
  return y >= 1900 && y <= 2200 && localDate(new Date(y, m - 1, d)) === value;
}
export function cents(value: string, signed = false): number {
  const text = value.trim();
  if (!(signed ? /^-?\d{1,9}(\.\d{1,2})?$/ : /^\d{1,9}(\.\d{1,2})?$/).test(text))
    throw new Error('金额最多 9 位整数、2 位小数');
  const negative = text.startsWith('-');
  const [whole, decimal = ''] = text.replace('-', '').split('.');
  const result = Number(whole) * 100 + Number(decimal.padEnd(2, '0'));
  if (!signed && result <= 0) throw new Error('金额必须大于 0');
  return negative ? -result : result;
}
export const money = (value: number) =>
  (value / 100).toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
export function initialData(): LedgerData {
  return {
    books: [{ id: 'daily', name: '日常账本', currency: 'CNY' }],
    activeBookId: 'daily',
    accounts: [{ id: 'cash', name: '现金', kind: 'cash', openingCents: 0 }],
    categories: [
      ...['餐饮', '购物', '交通', '住房', '娱乐', '医疗', '教育', '人情', '其他支出'].map(
        (name, i) => ({ id: `expense-${i}`, name, type: 'expense' as const })
      ),
      ...['工资', '奖金', '理财', '兼职', '其他收入'].map((name, i) => ({
        id: `income-${i}`,
        name,
        type: 'income' as const,
      })),
    ],
    entries: [],
    budgets: [],
    recurring: [],
    settings: { hideAmounts: false, billingStartDay: 1, theme: 'light', accent: '#E9B949' },
  };
}
export function validateEntry(entry: Entry, data: LedgerData): void {
  if (entry.original) {
    const o = entry.original;
    if (
      !['USD', 'EUR', 'HKD', 'JPY', 'GBP', 'AUD', 'CAD', 'SGD'].includes(o.currency) ||
      !Number.isSafeInteger(o.cents) ||
      o.cents <= 0 ||
      !Number.isSafeInteger(o.rateMicros) ||
      o.rateMicros <= 0 ||
      Number((BigInt(o.cents) * BigInt(o.rateMicros) + 500000n) / 1000000n) !== entry.cents
    )
      throw new Error('原币金额、汇率快照与入账金额不一致');
  }
  if (!Number.isSafeInteger(entry.cents) || entry.cents <= 0 || entry.cents > 99999999999)
    throw new Error('账单金额无效');
  if (!validDate(entry.date)) throw new Error('请输入有效日期 YYYY-MM-DD');
  if (!data.books.some((b) => b.id === entry.bookId && !b.archived))
    throw new Error('账本不存在或已归档');
  if (!data.accounts.some((a) => a.id === entry.accountId)) throw new Error('请选择账户');
  if (!['expense', 'income', 'transfer'].includes(entry.type)) throw new Error('收支类型无效');
  if (entry.type === 'transfer') {
    if (
      !data.accounts.some((a) => a.id === entry.toAccountId) ||
      entry.accountId === entry.toAccountId
    )
      throw new Error('请选择不同的转入账户');
  } else if (!data.categories.some((c) => c.id === entry.categoryId && c.type === entry.type))
    throw new Error('分类与收支类型不匹配');
  if (
    entry.note.length > 500 ||
    entry.tags.length > 20 ||
    entry.tags.some((t) => typeof t !== 'string' || t.length > 30)
  )
    throw new Error('备注或标签过长');
}
export function balances(data: LedgerData): Record<string, number> {
  const result = Object.fromEntries(data.accounts.map((a) => [a.id, a.openingCents]));
  for (const entry of data.entries) {
    if (entry.deletedAt) continue;
    result[entry.accountId] += entry.type === 'income' ? entry.cents : -entry.cents;
    if (entry.type === 'transfer' && entry.toAccountId) result[entry.toAccountId] += entry.cents;
  }
  return result;
}
export function periodRange(month: string, startDay: number): [string, string] {
  const [y, m] = month.split('-').map(Number);
  const start = new Date(y, m - 1, Math.min(startDay, new Date(y, m, 0).getDate()));
  const end = new Date(y, m, Math.min(startDay, new Date(y, m + 1, 0).getDate()));
  return [localDate(start), localDate(end)];
}
export function entriesForPeriod(data: LedgerData, month: string): Entry[] {
  const [start, end] = periodRange(month, data.settings.billingStartDay);
  return data.entries.filter(
    (e) => !e.deletedAt && e.bookId === data.activeBookId && e.date >= start && e.date < end
  );
}
export function totals(entries: Entry[]) {
  let income = 0,
    expense = 0;
  for (const e of entries)
    if (!e.deletedAt) {
      if (e.type === 'income') income += e.cents;
      if (e.type === 'expense') expense += e.cents;
    }
  return { income, expense, net: income - expense };
}
export function nextOccurrence(
  date: string,
  frequency: Recurring['frequency'],
  day: number
): string {
  const [y, m, d] = date.split('-').map(Number);
  if (frequency === 'monthly')
    return localDate(new Date(y, m, Math.min(day, new Date(y, m + 1, 0).getDate())));
  return localDate(new Date(y, m - 1, d + (frequency === 'weekly' ? 7 : 1)));
}
export function materializeRecurring(data: LedgerData, today = localDate()): LedgerData {
  const entries = [...data.entries];
  const existing = new Set(entries.map((e) => e.recurringKey));
  const recurring = data.recurring.map((rule) => {
    if (!rule.enabled || !data.books.some((b) => b.id === rule.template.bookId && !b.archived))
      return rule;
    let nextDate = rule.nextDate,
      count = 0;
    while (nextDate <= today && count++ < 1000) {
      const key = `${rule.id}:${nextDate}`;
      if (!existing.has(key)) {
        const entry = {
          ...rule.template,
          id: `recurring:${key}`,
          date: nextDate,
          updatedAt: new Date().toISOString(),
          recurringKey: key,
        };
        validateEntry(entry, data);
        entries.push(entry);
        existing.add(key);
      }
      nextDate = nextOccurrence(nextDate, rule.frequency, rule.day);
    }
    return { ...rule, nextDate };
  });
  return { ...data, entries, recurring };
}
const csvCell = (value: string) =>
  `"${(/^[=+\-@\t\r]/.test(value) ? "'" : '') + value.replace(/"/g, '""')}"`;
export function exportCSV(data: LedgerData): string {
  const header = ['日期', '类型', '金额', '分类', '账户', '转入账户', '备注', '标签', '账本'];
  return (
    '\uFEFF' +
    [
      header,
      ...data.entries
        .filter((e) => !e.deletedAt && e.bookId === data.activeBookId)
        .map((e) => [
          e.date,
          e.type,
          (e.cents / 100).toFixed(2),
          data.categories.find((c) => c.id === e.categoryId)?.name ?? '',
          data.accounts.find((a) => a.id === e.accountId)?.name ?? '',
          data.accounts.find((a) => a.id === e.toAccountId)?.name ?? '',
          e.note,
          e.tags.join('|'),
          data.books.find((b) => b.id === e.bookId)?.name ?? '',
        ]),
    ]
      .map((row) => row.map(csvCell).join(','))
      .join('\r\n')
  );
}
export function backup(data: LedgerData): string {
  return JSON.stringify(
    { format: 'jianzhang', version: 1, exportedAt: new Date().toISOString(), data },
    null,
    2
  );
}
export function parseCSV(text: string): string[][] {
  if (text.length > 20_000_000) throw new Error('CSV 超过 20MB');
  const rows: string[][] = [];
  let row: string[] = [],
    cell = '',
    quoted = false;
  const value = text.replace(/^\uFEFF/, '');
  for (let i = 0; i < value.length; i++) {
    const ch = value[i];
    if (ch === '"') {
      if (quoted && value[i + 1] === '"') {
        cell += '"';
        i++;
      } else if (quoted || cell === '') quoted = !quoted;
      else throw new Error('CSV 引号格式无效');
    } else if (ch === ',' && !quoted) {
      row.push(cell);
      cell = '';
    } else if ((ch === '\n' || ch === '\r') && !quoted) {
      if (ch === '\r' && value[i + 1] === '\n') i++;
      row.push(cell);
      if (row.some((c) => c !== '')) rows.push(row);
      row = [];
      cell = '';
    } else cell += ch;
  }
  if (quoted) throw new Error('CSV 引号未闭合');
  row.push(cell);
  if (row.some((c) => c !== '')) rows.push(row);
  return rows;
}
export function previewCSV(
  text: string,
  data: LedgerData
): { entries: Entry[]; duplicates: number } {
  const rows = parseCSV(text),
    header = ['日期', '类型', '金额', '分类', '账户', '转入账户', '备注', '标签', '账本'];
  if (!rows.length || rows[0].join('|') !== header.join('|'))
    throw new Error('CSV 列名不匹配，请使用简账导出的格式');
  const entries: Entry[] = [];
  let duplicates = 0;
  const fingerprint = (e: Entry) =>
    JSON.stringify([
      e.bookId,
      e.type,
      e.cents,
      e.categoryId,
      e.accountId,
      e.toAccountId || '',
      e.date,
      e.note,
      [...e.tags].sort(),
    ]);
  const existing = new Set(data.entries.filter((e) => !e.deletedAt).map(fingerprint));
  for (let i = 1; i < rows.length; i++) {
    if (rows[i].length !== 9) throw new Error(`CSV 第 ${i + 1} 行列数不正确`);
    const unescape = (s: string) => (/^'[=+\-@\t\r]/.test(s) ? s.slice(1) : s);
    const [date, type, amount, category, account, to, note, tags, book] = rows[i].map(unescape);
    const categoryId =
      data.categories.find((c) => c.name === category && c.type === type)?.id ?? '';
    const accountId = data.accounts.find((a) => a.name === account)?.id ?? '';
    const toAccountId = data.accounts.find((a) => a.name === to)?.id;
    const bookId = data.books.find((b) => b.name === book && !b.archived)?.id ?? '';
    const entry: Entry = {
      id: `csv-${Date.now()}-${i}`,
      bookId,
      type: type as EntryType,
      cents: cents(amount),
      categoryId,
      accountId,
      toAccountId,
      date,
      note,
      tags: tags.split('|').filter(Boolean),
      updatedAt: new Date().toISOString(),
    };
    try {
      validateEntry(entry, data);
    } catch (e) {
      throw new Error(
        `CSV 第 ${i + 1} 行：${e instanceof Error ? e.message : '无效数据'}（请先创建对应账本、账户和分类）`
      );
    }
    const key = fingerprint(entry);
    if (existing.has(key)) duplicates++;
    else {
      existing.add(key);
      entries.push(entry);
    }
  }
  return { entries, duplicates };
}
export function restore(text: string): LedgerData {
  if (text.length > 20_000_000) throw new Error('备份超过 20MB');
  const raw = JSON.parse(text);
  if (raw.format !== 'jianzhang' || raw.version !== 1) throw new Error('不支持的备份格式或版本');
  const data = raw.data as LedgerData;
  if (
    !data ||
    !['books', 'accounts', 'categories', 'entries', 'budgets', 'recurring'].every((k) =>
      Array.isArray(raw.data[k])
    )
  )
    throw new Error('备份结构不完整');
  for (const list of [data.books, data.accounts, data.categories, data.entries, data.recurring]) {
    if (
      list.some((item) => typeof item?.id !== 'string' || !item.id) ||
      new Set(list.map((i) => i.id)).size !== list.length
    )
      throw new Error('备份 ID 无效或重复');
  }
  if (
    !data.books.some((b) => b.id === data.activeBookId && !b.archived) ||
    data.books.some((b) => !b.name || b.currency !== 'CNY') ||
    data.accounts.some(
      (a) =>
        !a.name ||
        !['cash', 'bank', 'credit'].includes(a.kind) ||
        !Number.isSafeInteger(a.openingCents)
    ) ||
    data.categories.some((c) => !c.name || !['expense', 'income'].includes(c.type))
  )
    throw new Error('账本、账户或分类损坏');
  if (
    !data.settings ||
    !Number.isInteger(data.settings.billingStartDay) ||
    data.settings.billingStartDay < 1 ||
    data.settings.billingStartDay > 31 ||
    typeof data.settings.hideAmounts !== 'boolean' ||
    !['light', 'dark'].includes(data.settings.theme) ||
    !/^#[\da-fA-F]{6}$/.test(data.settings.accent)
  )
    throw new Error('备份设置无效');
  const validationData = { ...data, books: data.books.map((b) => ({ ...b, archived: false })) };
  for (const entry of data.entries) {
    if (
      typeof entry.note !== 'string' ||
      !Array.isArray(entry.tags) ||
      typeof entry.updatedAt !== 'string'
    )
      throw new Error('账单结构损坏');
    validateEntry(entry, validationData);
  }
  for (const b of data.budgets)
    if (
      !data.books.some((book) => book.id === b.bookId) ||
      !/^\d{4}-(0[1-9]|1[0-2])$/.test(b.month) ||
      !Number.isSafeInteger(b.cents) ||
      b.cents <= 0 ||
      (b.categoryId !== 'total' &&
        !data.categories.some((c) => c.id === b.categoryId && c.type === 'expense'))
    )
      throw new Error('预算数据无效');
  for (const r of data.recurring) {
    if (
      !['daily', 'weekly', 'monthly'].includes(r.frequency) ||
      !validDate(r.nextDate) ||
      !Number.isInteger(r.day) ||
      r.day < 1 ||
      r.day > 31 ||
      typeof r.enabled !== 'boolean'
    )
      throw new Error('周期规则损坏');
    validateEntry({ ...r.template, id: r.id, updatedAt: new Date().toISOString() }, validationData);
  }
  if (data.goals !== undefined) {
    if (
      !Array.isArray(data.goals) ||
      new Set(data.goals.map((g) => g.id)).size !== data.goals.length
    )
      throw new Error('存钱目标结构无效');
    for (const g of data.goals)
      if (
        typeof g.id !== 'string' ||
        typeof g.name !== 'string' ||
        !g.name.trim() ||
        !Number.isSafeInteger(g.targetCents) ||
        g.targetCents <= 0 ||
        !Number.isSafeInteger(g.savedCents) ||
        g.savedCents < 0 ||
        !validDate(g.targetDate)
      )
        throw new Error('存钱目标无效');
  }
  for (const e of data.entries)
    if (
      e.attachments &&
      (!Array.isArray(e.attachments) ||
        e.attachments.length > 5 ||
        e.attachments.some(
          (a) =>
            typeof a.id !== 'string' ||
            !/^[a-zA-Z0-9-]{16,64}$/.test(a.id) ||
            typeof a.name !== 'string' ||
            !Number.isSafeInteger(a.size) ||
            a.size <= 0 ||
            a.size > 5 * 1024 * 1024 ||
            !['image/jpeg', 'image/png', 'image/webp', 'application/pdf'].includes(a.mime)
        ))
    )
      throw new Error('票据附件数据无效');
  return data;
}
export function bookkeepingStreak(data: LedgerData, today = localDate()) {
  const days = new Set(
    data.entries
      .filter(
        (e) =>
          !e.deletedAt && e.type !== 'transfer' && e.date <= today && e.bookId === data.activeBookId
      )
      .map((e) => e.date)
  );
  const previous = (day: string) => {
    const [y, m, d] = day.split('-').map(Number);
    return localDate(new Date(y, m - 1, d - 1));
  };
  let cursor = days.has(today) ? today : previous(today),
    streak = 0;
  while (days.has(cursor)) {
    streak++;
    cursor = previous(cursor);
  }
  return { totalDays: days.size, streak };
}

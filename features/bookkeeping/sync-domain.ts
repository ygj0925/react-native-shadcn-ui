import { backup, restore, type LedgerData } from './domain';

export const collections = [
  'books',
  'accounts',
  'categories',
  'entries',
  'budgets',
  'recurring',
  'goals',
] as const;
export type Change = { collection: string; key: string; value: unknown | null };
export type Conflict = { collection: string; key: string; local: unknown; remote: unknown };
export function canonical(value: unknown): string {
  if (value === undefined) return 'undefined';
  if (value === null || typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) return '[' + value.map(canonical).join(',') + ']';
  return (
    '{' +
    Object.entries(value)
      .filter(([k, v]) => v !== undefined && k !== 'updatedAt')
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([k, v]) => JSON.stringify(k) + ':' + canonical(v))
      .join(',') +
    '}'
  );
}
const keyFor = (collection: string, value: Record<string, unknown>) =>
  collection === 'budgets'
    ? JSON.stringify([value.bookId, value.month, value.categoryId])
    : String(value.id);
function objects(data: LedgerData, collection: string): Map<string, unknown> {
  if (collection === 'settings') return new Map(Object.entries(data.settings));
  const items = (data as unknown as Record<string, Record<string, unknown>[]>)[collection] ?? [];
  return new Map(items.map((item) => [keyFor(collection, item), item]));
}
export function difference(before: LedgerData, after: LedgerData): Change[] {
  const changes: Change[] = [];
  for (const collection of [...collections, 'settings']) {
    const a = objects(before, collection),
      b = objects(after, collection);
    for (const key of new Set([...a.keys(), ...b.keys()]))
      if (canonical(a.get(key)) !== canonical(b.get(key)))
        changes.push({ collection, key, value: b.get(key) ?? null });
  }
  return changes;
}
export function applyChanges(data: LedgerData, changes: Change[]): LedgerData {
  const result = JSON.parse(JSON.stringify(data));
  for (const change of changes) {
    if (change.collection === 'settings') {
      if (!(change.key in result.settings) || change.value === null)
        throw new Error('同步设置字段无效');
      result.settings[change.key] = change.value;
    } else {
      if (!(collections as readonly string[]).includes(change.collection))
        throw new Error('同步集合无效');
      const items = result[change.collection] ?? [];
      const index=items.findIndex((item:Record<string,unknown>)=>keyFor(change.collection,item)===change.key);
      result[change.collection] = change.value===null?items.filter((item:Record<string,unknown>)=>keyFor(change.collection,item)!==change.key):[...items];
      if (change.value !== null) {
        if (
          typeof change.value !== 'object' ||
          keyFor(change.collection, change.value as Record<string, unknown>) !== change.key
        )
          throw new Error('同步对象 ID 不匹配');
        if(index<0)result[change.collection].push(change.value);else result[change.collection][index]=change.value;
      }
    }
  }
  if (
    !result.books.some(
      (b: { id: string; archived?: boolean }) => b.id === result.activeBookId && !b.archived
    )
  )
    result.activeBookId = result.books.find((b: { archived?: boolean }) => !b.archived)?.id;
  return restore(backup(result));
}
export function mergeThreeWay(
  base: LedgerData,
  local: LedgerData,
  remote: LedgerData,
  choices: Record<string, 'local' | 'remote'> = {}
) {
  const conflicts: Conflict[] = [],
    changes: Change[] = [];
  for (const change of difference(base, local)) {
    const oldValue = objects(base, change.collection).get(change.key);
    const remoteValue = objects(remote, change.collection).get(change.key);
    const remoteChanged = canonical(oldValue) !== canonical(remoteValue);
    const conflict =
      remoteChanged && canonical(change.value ?? undefined) !== canonical(remoteValue);
    const choiceKey = `${change.collection}:${change.key}`;
    if (conflict && !choices[choiceKey])
      conflicts.push({
        collection: change.collection,
        key: change.key,
        local: change.value,
        remote: remoteValue ?? null,
      });
    if (!conflict || choices[choiceKey] === 'local') changes.push(change);
  }
  // Do not materialize an unresolved merge: references may be intentionally in conflict.
  return {
    conflicts,
    data: conflicts.length
      ? local
      : applyChanges({ ...remote, activeBookId: local.activeBookId }, changes),
  };
}

import { Platform } from 'react-native';
import * as SecureStore from 'expo-secure-store';

export type RemoteSession = {
  token: string;
  tokenName: string;
  user: { id: string; nickname: string; phone?: string };
};
export type RemoteRecord = {
  id: string;
  userId: string;
  type: 1 | 2;
  amount: number;
  category: string;
  recordDate: string;
  remark?: string;
};
export type RemoteGroup = {
  id: string;
  name: string;
  myRole: 1 | 2;
  memberCount: number;
  inviteCode?: string;
};
export type RemoteMember = { userId: string; nickname: string; role: 1 | 2 };
export const remoteCategories = {
  food: '餐饮',
  transport: '交通',
  shopping: '购物',
  housing: '住房',
  entertainment: '娱乐',
  medical: '医疗',
  education: '教育',
  social: '人情',
  other: '其他',
  salary: '工资',
  investment: '理财',
  redpacket: '红包',
};
export const expenseCodes = [
  'food',
  'transport',
  'shopping',
  'housing',
  'entertainment',
  'medical',
  'education',
  'social',
  'other',
];
export const incomeCodes = ['salary', 'investment', 'redpacket', 'other'];
export class RemoteError extends Error {
  constructor(
    public code: string,
    message: string
  ) {
    super(message);
  }
}
function endpoint(value: string) {
  const url = new URL(value);
  if (
    !['http:', 'https:'].includes(url.protocol) ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  )
    throw new Error('请输入 HTTP(S) 服务根地址，不含账号、查询参数或路径');
  if (url.pathname !== '/') throw new Error('请输入服务根地址，例如 http://192.168.1.2:8082');
  if (url.protocol === 'http:' && !__DEV__) throw new Error('正式版本必须使用 HTTPS');
  return url.origin;
}
const sessionKey = 'jianzhang-remote-session';
const sessionListeners = new Set<() => void>();
export function subscribeRemoteSession(listener: () => void) {
  sessionListeners.add(listener);
  return () => {
    sessionListeners.delete(listener);
  };
}
export async function saveRemoteSession(base: string, session: RemoteSession | null) {
  const text = session ? JSON.stringify({ base: endpoint(base), session }) : null;
  if (Platform.OS === 'web') {
    if (text) sessionStorage.setItem(sessionKey, text);
    else sessionStorage.removeItem(sessionKey);
  } else if (text) await SecureStore.setItemAsync(sessionKey, text);
  else await SecureStore.deleteItemAsync(sessionKey);
  sessionListeners.forEach((listener) => listener());
}
export async function loadRemoteSession(): Promise<{
  base: string;
  session: RemoteSession;
} | null> {
  const text =
    Platform.OS === 'web'
      ? typeof sessionStorage === 'undefined'
        ? null
        : sessionStorage.getItem(sessionKey)
      : await SecureStore.getItemAsync(sessionKey);
  return text ? JSON.parse(text) : null;
}
export function remoteClient(base: string, session?: RemoteSession | null) {
  const origin = endpoint(base);
  async function request<T>(
    path: string,
    method = 'GET',
    body?: unknown,
    timeoutMs = 15000
  ): Promise<T> {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(origin + path, {
        method,
        signal: controller.signal,
        headers: {
          ...(body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
          ...(session ? { Authorization: `Bearer ${session.token}` } : {}),
        },
        body:
          body === undefined ? undefined : body instanceof FormData ? body : JSON.stringify(body),
      });
      const result = await response.json();
      if (
        !response.ok ||
        result.success === false ||
        (result.code != null && !['0', '200'].includes(String(result.code)))
      )
        throw new RemoteError(
          String(result.code ?? response.status),
          result.msg || result.message || '服务请求失败'
        );
      return result.data as T;
    } catch (e) {
      if (e instanceof Error && e.name === 'AbortError')
        throw new Error('服务请求超时，请检查网络后重试');
      throw e;
    } finally {
      clearTimeout(timeout);
    }
  }
  return {
    accountRequest: request,
    login: (phone: string, secret: string, mode: 'ACCOUNT' | 'PHONE') =>
      request<RemoteSession>(
        '/app/auth/login',
        'POST',
        mode === 'ACCOUNT'
          ? { authType: mode, account: phone, password: secret }
          : { authType: mode, phone, code: secret }
      ),
    sms: (phone: string) => request('/app/auth/sms-code', 'POST', { phone, scene: 'LOGIN' }),
    me: () => request<RemoteSession['user']>('/app/auth/me'),
    logout: () => request('/app/auth/logout', 'POST'),
    snapshot: (knownVersion?: number) =>
      request<{ version: number; payload: string | null }>(
        '/app/accounting/snapshot' +
          (knownVersion === undefined ? '' : `?knownVersion=${knownVersion}`)
      ),
    patchSnapshot: (
      baseVersion: number,
      operationId: string,
      changes: import('./sync-domain').Change[]
    ) =>
      request<{ version: number; payload: string }>('/app/accounting/snapshot', 'PATCH', {
        baseVersion,
        operationId,
        changes,
      }),
    saveSnapshot: (baseVersion: number, operationId: string, payload: string) =>
      request<{ version: number; payload: string }>('/app/accounting/snapshot', 'PUT', {
        baseVersion,
        operationId,
        payload,
      }),
    groups: () => request<RemoteGroup[]>('/app/ledger/group/list'),
    createGroup: (name: string) => request<RemoteGroup>('/app/ledger/group', 'POST', { name }),
    joinGroup: (inviteCode: string) =>
      request<RemoteGroup>('/app/ledger/group/join', 'POST', { inviteCode }),
    members: (id: string) =>
      request<RemoteMember[]>(`/app/ledger/group/${encodeURIComponent(id)}/members`),
    invite: (id: string) =>
      request<RemoteGroup>(`/app/ledger/group/${encodeURIComponent(id)}/invite-code`, 'POST'),
    transferOwner: (id: string, nextOwnerId: string) =>
      request(`/app/ledger/group/${encodeURIComponent(id)}/transfer-owner`, 'POST', {
        nextOwnerId,
      }),
    removeMember: (id: string, member: string) =>
      request(
        `/app/ledger/group/${encodeURIComponent(id)}/member/${encodeURIComponent(member)}`,
        'DELETE'
      ),
    leaveGroup: (id: string, dissolve: boolean) =>
      request(`/app/ledger/group/${encodeURIComponent(id)}${dissolve ? '' : '/quit'}`, 'DELETE'),
    records: (month: string, groupId: string, page: number) =>
      request<{ records: RemoteRecord[]; total: number }>(
        `/app/ledger/record/page?month=${encodeURIComponent(month)}&page=${page}&size=50${groupId ? `&groupId=${encodeURIComponent(groupId)}` : ''}`
      ),
    saveRecord: (record: Omit<RemoteRecord, 'id' | 'userId'>, groupId: string, id?: string) =>
      request(
        id ? `/app/ledger/record/${encodeURIComponent(id)}` : '/app/ledger/record',
        id ? 'PUT' : 'POST',
        { ...record, groupId: groupId || null }
      ),
    deleteRecord: (id: string) => request(`/app/ledger/record/${encodeURIComponent(id)}`, 'DELETE'),
    budget: (period: string) =>
      request<{ totalBudget: number; totalSpent: number; totalRemaining: number }>(
        '/app/budget/summary?period=' + encodeURIComponent(period)
      ),
    listBudgets: (period: string) =>
      request<{ period: string; category: string; budgetAmount: number }[]>(
        '/app/budget/list?period=' + encodeURIComponent(period)
      ),
    removeBudget: (period: string, category: string) =>
      request(
        '/app/budget/remove?period=' +
          encodeURIComponent(period) +
          '&category=' +
          encodeURIComponent(category),
        'DELETE'
      ),
    setBudget: (period: string, category: string, amount: string) =>
      request('/app/budget/set', 'POST', { period, category, budgetAmount: amount }),
  };
}

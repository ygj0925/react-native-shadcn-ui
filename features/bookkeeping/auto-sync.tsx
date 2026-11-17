import React, { useEffect, useState } from 'react';
import { AppState, Pressable, Text, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';
import { create } from 'zustand';
import { backup, restore, money, type LedgerData } from './domain';
import { newId, useLedgerStore, flushLedgerPersistence } from './store';
import {
  applyChanges,
  canonical,
  difference,
  mergeThreeWay,
  type Change,
  type Conflict,
} from './sync-domain';
import {
  loadRemoteSession,
  remoteClient,
  RemoteError,
  subscribeRemoteSession,
  type RemoteSession,
} from './remote';

type Meta = {
  enabled: boolean;
  version: number;
  baseline: LedgerData;
  lastSync?: string;
  pending?: {
    operationId: string;
    changes: Change[];
    sourceChanges: Change[];
    version: number;
  };
};
const metaKey = (base: string, session: RemoteSession) =>
  `jianzhang-auto-sync:${new URL(base).origin}:${session.user.id}`;
const status = create<{
  enabled: boolean;
  busy: boolean;
  message: string;
  conflicts: Conflict[];
  lastSync: string;
}>(() => ({ enabled: false, busy: false, message: '自动同步未开启', conflicts: [], lastSync: '' }));
let flight: Promise<void> | undefined;
let initializing = false;
let generation = 0;
let conflictRemote: string | undefined;
let decisions: Record<string, 'local' | 'remote'> = {};
function conflictDescription(value: unknown): string {
  if (value === null || value === undefined) return '此项已移除';
  if (typeof value !== 'object') return String(value);
  const v = value as Record<string, unknown>;
  if (v.deletedAt) return '已删除';
  if (typeof v.cents === 'number')
    return `${v.date ?? v.month ?? ''} ¥${money(v.cents)} ${v.note ?? ''}`;
  return String(v.name ?? v.nextDate ?? '内容已修改');
}
async function cycle() {
  const currentGeneration = generation;
  const saved = await loadRemoteSession();
  if (!saved) {
    status.setState({ enabled: false, conflicts: [], message: '登录后可启用自动同步' });
    return;
  }
  const key = metaKey(saved.base, saved.session),
    raw = await AsyncStorage.getItem(key);
  if (!raw) return;
  let meta: Meta = JSON.parse(raw);
  if (!meta.enabled) return;
  const owner = await AsyncStorage.getItem('jianzhang-auto-sync-owner');
  if (owner !== `${new URL(saved.base).origin}:${saved.session.user.id}`) {
    status.setState({
      enabled: false,
      message: '本机账本属于另一同步账号，请显式重新初始化',
      conflicts: [],
    });
    return;
  }
  status.setState({ enabled: true, busy: true });
  const api = remoteClient(saved.base, saved.session);
  const assertSession = () => {
    if (generation !== currentGeneration) throw new Error('账号已切换，本次同步已停止');
  };
  try {
    if (!useLedgerStore.getState().ready || useLedgerStore.getState().error)
      throw new Error('请先处理本地账本错误');
    if (meta.pending) {
      try {
        const response = await api.patchSnapshot(
          meta.pending.version,
          meta.pending.operationId,
          meta.pending.changes
        );
        assertSession();
        const target = restore(response.payload);
        const source = applyChanges(meta.baseline, meta.pending.sourceChanges);
        const hash = canonical(target);
        if (conflictRemote !== hash) decisions = {};
        const accepted = mergeThreeWay(source, useLedgerStore.getState().data, target, decisions);
        if (accepted.conflicts.length) {
          conflictRemote = hash;
          status.setState({
            conflicts: accepted.conflicts,
            message: '重试期间出现本机修改冲突，请选择版本',
          });
          return;
        }
        useLedgerStore.getState().setData(() => accepted.data);
        await flushLedgerPersistence();
        assertSession();
        meta = {
          ...meta,
          version: response.version,
          baseline: restore(response.payload),
          pending: undefined,
        };
        await AsyncStorage.setItem(key, JSON.stringify(meta));
      } catch (error) {
        if (!(error instanceof RemoteError) || error.code !== '4002') throw error;
        meta.pending = undefined;
        await AsyncStorage.setItem(key, JSON.stringify(meta));
      }
    }
    const remote = await api.snapshot(meta.version);
    assertSession();
    if (!remote.payload && remote.version !== meta.version)
      throw new Error('云端账本状态已重置，请重新选择同步来源');
    const remoteData = remote.payload ? restore(remote.payload) : meta.baseline;
    const local = useLedgerStore.getState().data;
    const remoteHash = canonical(remoteData);
    if (conflictRemote !== remoteHash) decisions = {};
    const merged = mergeThreeWay(meta.baseline, local, remoteData, decisions);
    if (merged.conflicts.length) {
      conflictRemote = remoteHash;
      status.setState({
        conflicts: merged.conflicts,
        message: '发现同时修改，自动同步已暂停，请选择冲突版本',
      });
      return;
    }
    const changes = difference(remoteData, merged.data);
    if (changes.length > 1000) throw new Error('本次变化超过1000项，请先通过完整云备份初始化同步');
    if (changes.length) {
      meta.pending = {
        operationId: newId(),
        changes,
        sourceChanges: difference(meta.baseline, local),
        version: remote.version,
      };
      await flushLedgerPersistence();
      assertSession();
      await AsyncStorage.setItem(key, JSON.stringify(meta));
      const result = await api.patchSnapshot(remote.version, meta.pending.operationId, changes);
      assertSession();
      const latest = useLedgerStore.getState().data;
      // Edits made during the request remain local and are sent by the next cycle.
      const after = mergeThreeWay(local, latest, merged.data);
      if (after.conflicts.length) throw new Error('同步期间发生新的本机修改，请重试以重新合并');
      useLedgerStore.getState().setData(() => after.data);
      meta = {
        ...meta,
        baseline: restore(result.payload),
        version: result.version,
        pending: undefined,
      };
    } else {
      useLedgerStore.getState().setData(() => merged.data);
      meta = { ...meta, baseline: remoteData, version: remote.version };
    }
    meta.lastSync = new Date().toISOString();
    await flushLedgerPersistence();
    assertSession();
    await AsyncStorage.setItem(key, JSON.stringify(meta));
    decisions = {};
    conflictRemote = undefined;
    status.setState({ lastSync: meta.lastSync, message: '已同步', conflicts: [] });
  } catch (error) {
    if (generation === currentGeneration)
      status.setState({ message: error instanceof Error ? error.message : '同步失败，将自动重试' });
  } finally {
    if (generation === currentGeneration) status.setState({ busy: false });
  }
}
export function syncNow() {
  if (initializing) return Promise.resolve();
  return (flight ??= cycle().finally(() => {
    flight = undefined;
  }));
}

export async function initializeAutoSync(
  base: string,
  session: RemoteSession,
  source: 'local' | 'remote'
) {
  if (initializing) throw new Error('同步初始化正在进行');
  initializing = true;
  try {
    await initializeInternal(base, session, source);
  } finally {
    initializing = false;
  }
  await syncNow();
}
async function initializeInternal(
  base: string,
  session: RemoteSession,
  source: 'local' | 'remote'
) {
  const startedGeneration = ++generation;
  const assertCurrent = () => {
    if (generation !== startedGeneration) throw new Error('账号已切换，初始化已停止');
  };
  if (flight) await flight;
  const api = remoteClient(base, session),
    cloud = await api.snapshot();
  assertCurrent();
  const local = useLedgerStore.getState().data;
  await AsyncStorage.setItem(
    'jianzhang-before-sync-init',
    JSON.stringify({ local: backup(local), remote: cloud.payload })
  );
  assertCurrent();
  let baseline: LedgerData, version: number;
  if (source === 'remote') {
    if (!cloud.payload) throw new Error('云端尚无完整账本');
    baseline = restore(cloud.payload);
    version = cloud.version;
    useLedgerStore.getState().setData(() => baseline);
  } else {
    const result = await api.saveSnapshot(cloud.version, newId(), backup(local));
    assertCurrent();
    baseline = local;
    version = result.version;
  }
  await flushLedgerPersistence();
  assertCurrent();
  await AsyncStorage.setItem(
    metaKey(base, session),
    JSON.stringify({ enabled: true, baseline, version } satisfies Meta)
  );
  await AsyncStorage.setItem(
    'jianzhang-auto-sync-owner',
    `${new URL(base).origin}:${session.user.id}`
  );
  status.setState({ enabled: true, message: '自动同步已开启', conflicts: [], busy: false });
  decisions = {};
}
export async function disableAutoSync(base: string, session: RemoteSession) {
  generation++;
  if (flight) await flight;
  const key = metaKey(base, session),
    raw = await AsyncStorage.getItem(key);
  if (raw) await AsyncStorage.setItem(key, JSON.stringify({ ...JSON.parse(raw), enabled: false }));
  status.setState({ enabled: false, busy: false, conflicts: [], message: '自动同步已关闭' });
}
export function BookkeepingAutoSync() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined,
      disposed = false;
    const schedule = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        if (!disposed) syncNow().catch(() => {});
      }, 1500);
    };
    const unsubscribe = useLedgerStore.subscribe((state, previous) => {
      if (state.data !== previous.data && canonical(state.data) !== canonical(previous.data))
        schedule();
    });
    const session = subscribeRemoteSession(() => {
      generation++;
      decisions = {};
      status.setState({ enabled: false, busy: false, conflicts: [], message: '账号状态已变化' });
      schedule();
    });
    const network = NetInfo.addEventListener((state) => {
      if (state.isConnected) schedule();
    });
    const app = AppState.addEventListener('change', (state) => {
      if (state === 'active') schedule();
    });
    const interval = setInterval(schedule, 30000);
    schedule();
    return () => {
      disposed = true;
      if (timer) clearTimeout(timer);
      clearInterval(interval);
      unsubscribe();
      session();
      network();
      app.remove();
    };
  }, []);
  return null;
}
export function AutoSyncPanel({ base, session }: { base: string; session: RemoteSession }) {
  const state = status();
  const [confirm, setConfirm] = useState(''),
    [message, setMessage] = useState('');
  const action = (label: string, run: () => Promise<void>) => (
    <Pressable
      disabled={state.busy}
      onPress={() => run().catch((e) => setMessage(e.message))}
      style={{ padding: 14, backgroundColor: '#E9B949', borderRadius: 12 }}>
      <Text>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ padding: 20, gap: 12, backgroundColor: '#FFF', borderRadius: 18 }}>
      <Text style={{ fontSize: 18, fontWeight: '700' }}>自动同步</Text>
      <Text>
        {state.message}
        {state.busy ? ' · 处理中' : ''}
      </Text>
      <Text>
        登录同一账号的设备会自动交换修改。离线时先保存在本机，联网后重试；同时修改同一项时，请核对冲突版本。
      </Text>
      {!state.enabled ? (
        <>
          {(['local', 'remote'] as const).map((source) => (
            <React.Fragment key={source}>
              {action(
                source === 'local' ? '以本机为准初始化同步' : '以云端为准初始化同步',
                async () => {
                  if (confirm !== source) {
                    setConfirm(source);
                    setMessage(
                      `将${source === 'local' ? '替换当前账号云端' : '替换当前本机'}账本并启用自动同步，请确认账号 ${session.user.nickname} 后再次点击。替换前会保留副本。`
                    );
                    return;
                  }
                  await initializeAutoSync(base, session, source);
                  setMessage('初始化完成');
                }
              )}
            </React.Fragment>
          ))}
        </>
      ) : (
        <>
          {action('立即同步', syncNow)}
          {action('关闭自动同步', () => disableAutoSync(base, session))}
        </>
      )}
      {state.lastSync && <Text>上次成功 {new Date(state.lastSync).toLocaleString()}</Text>}
      {state.conflicts.map((c) => (
        <View
          key={`${c.collection}:${c.key}`}
          style={{ padding: 12, backgroundColor: '#FFF5DD', gap: 8 }}>
          <Text>
            {(
              {
                entries: '账单',
                accounts: '资产账户',
                books: '账本',
                categories: '分类',
                budgets: '预算',
                recurring: '周期规则',
                goals: '存钱目标',
                settings: '偏好设置',
              } as Record<string, string>
            )[c.collection] ?? '账本内容'}
            有不同修改
          </Text>
          <Text numberOfLines={4}>本机：{conflictDescription(c.local)}</Text>
          <Text numberOfLines={4}>云端：{conflictDescription(c.remote)}</Text>
          {(['local', 'remote'] as const).map((side) => (
            <Pressable
              key={side}
              onPress={() => {
                decisions[`${c.collection}:${c.key}`] = side;
                setMessage(`已选择${side === 'local' ? '本机' : '云端'}，处理完后点击立即同步`);
              }}>
              <Text>
                保留{side === 'local' ? '本机' : '云端'}版本{' '}
                {decisions[`${c.collection}:${c.key}`] === side ? '✓' : ''}
              </Text>
            </Pressable>
          ))}
        </View>
      ))}
      {!!message && <Text accessibilityRole="alert">{message}</Text>}
    </View>
  );
}

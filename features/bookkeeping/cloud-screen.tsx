import React, { useEffect, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { backup, cents, localDate, money, restore } from './domain';
import { newId, useLedgerStore } from './store';
import { AccountRecovery, AccountSettings } from './account-settings';
import { AutoSyncPanel } from './auto-sync';
import {
  expenseCodes,
  incomeCodes,
  loadRemoteSession,
  remoteCategories,
  remoteClient,
  saveRemoteSession,
  type RemoteGroup,
  type RemoteMember,
  type RemoteRecord,
  type RemoteSession,
} from './remote';

export default function CloudScreen() {
  const router = useRouter();
  const [base, setBase] = useState(process.env.EXPO_PUBLIC_ACCOUNTING_API_URL ?? '');
  const [session, setSession] = useState<RemoteSession | null>(null),
    [phone, setPhone] = useState(''),
    [secret, setSecret] = useState(''),
    [mode, setMode] = useState<'ACCOUNT' | 'PHONE'>('ACCOUNT');
  const [busy, setBusy] = useState(false),
    [message, setMessage] = useState(''),
    [cloudVersion, setCloudVersion] = useState<number | null>(null),
    [confirmation, setConfirmation] = useState('');
  const [groups, setGroups] = useState<RemoteGroup[]>([]),
    [groupId, setGroupId] = useState(''),
    [members, setMembers] = useState<RemoteMember[]>([]);
  const [groupName, setGroupName] = useState(''),
    [inviteCode, setInviteCode] = useState('');
  const [records, setRecords] = useState<RemoteRecord[]>([]),
    [page, setPage] = useState(1),
    [total, setTotal] = useState(0),
    [month, setMonth] = useState(localDate().slice(0, 7));
  const [editing, setEditing] = useState<RemoteRecord | null>(null),
    [recordType, setRecordType] = useState<1 | 2>(1),
    [amount, setAmount] = useState(''),
    [category, setCategory] = useState('food'),
    [date, setDate] = useState(localDate()),
    [remark, setRemark] = useState('');
  const [budgetAmount, setBudgetAmount] = useState(''),
    [budgetInfo, setBudgetInfo] = useState('');
  const [budgetCategory, setBudgetCategory] = useState('total'),
    [budgetRows, setBudgetRows] = useState<
      { period: string; category: string; budgetAmount: number }[]
    >([]);
  const [cloudLoaded, setCloudLoaded] = useState(false),
    [smsUntil, setSmsUntil] = useState(0);
  useEffect(() => {
    loadRemoteSession()
      .then((saved) => {
        if (saved) {
          setBase(saved.base);
          setSession(saved.session);
        }
      })
      .catch(() => setMessage('安全会话读取失败，请重新登录'));
  }, []);
  const api = () => remoteClient(base, session);
  const scopeKey = () => `jianzhang-cloud-version:${base}:${session?.user.id}`;
  async function run(task: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      await task();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '请求失败');
    } finally {
      setBusy(false);
    }
  }
  async function refreshRecords(nextPage = 1) {
    if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('请输入有效月份 YYYY-MM');
    const result = await api().records(month, groupId, nextPage);
    setRecords(result.records);
    setTotal(result.total);
    setPage(nextPage);
    setCloudLoaded(true);
  }
  async function publish() {
    if (confirmation !== 'upload') {
      setConfirmation('upload');
      setMessage(
        `将本机全部账本上传至当前账号 ${session?.user.nickname}。请核对账号，再点一次确认上传。`
      );
      return;
    }
    const known = await AsyncStorage.getItem(scopeKey());
    const payload = backup(useLedgerStore.getState().data);
    // Persist the exact request so a timeout can retry with the same idempotency key.
    const pendingKey = scopeKey() + ':pending';
    const oldPending = await AsyncStorage.getItem(pendingKey);
    const remote = await api().snapshot();
    if (!oldPending && remote.version !== Number(known ?? 0))
      throw new Error('云端版本与本机基准不一致，请先下载并比较云备份。不会自动覆盖。');
    const pending = oldPending
      ? JSON.parse(oldPending)
      : { baseVersion: remote.version, operationId: newId(), payload };
    await AsyncStorage.setItem(pendingKey, JSON.stringify(pending));
    const saved = await api().saveSnapshot(
      pending.baseVersion,
      pending.operationId,
      pending.payload
    );
    await AsyncStorage.setItem(scopeKey(), String(saved.version));
    await AsyncStorage.removeItem(pendingKey);
    setCloudVersion(saved.version);
    setConfirmation('');
    setMessage('云备份已保存。期间新增的本机修改请再次上传。');
  }
  async function pull() {
    const remote = await api().snapshot();
    setCloudVersion(remote.version);
    if (!remote.payload) {
      setMessage('云端还没有简账备份');
      return;
    }
    const parsed = restore(remote.payload);
    if (confirmation !== 'download') {
      setConfirmation('download');
      setMessage(
        `云端备份共 ${parsed.entries.filter((e) => !e.deletedAt).length} 笔。再次点击将替换本机全部记账数据，当前本机数据会先自动保存到恢复副本。`
      );
      return;
    }
    await AsyncStorage.setItem(
      'jianzhang-before-cloud-restore',
      backup(useLedgerStore.getState().data)
    );
    useLedgerStore.getState().restoreBackup(remote.payload);
    await AsyncStorage.setItem(scopeKey(), String(remote.version));
    await AsyncStorage.removeItem(scopeKey() + ':pending');
    setConfirmation('');
    setMessage('已恢复云端账本，覆盖前的本机副本保留在本机。');
  }
  const group = groups.find((g) => g.id === groupId);
  function editRecord(record: RemoteRecord) {
    setEditing(record);
    setRecordType(record.type);
    setAmount(String(record.amount));
    setCategory(record.category);
    setDate(record.recordDate);
    setRemark(record.remark ?? '');
  }
  const action = (label: string, task: () => Promise<void>, danger = false) => (
    <Pressable
      accessibilityRole="button"
      disabled={busy}
      onPress={() => run(task)}
      style={[
        s.button,
        { backgroundColor: danger ? '#FBE8E2' : '#E9B949', opacity: busy ? 0.5 : 1 },
      ]}>
      <Text style={{ color: '#242A26', fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
  const input = (value: string, change: (value: string) => void, label: string, secure = false) => (
    <TextInput
      value={value}
      onChangeText={change}
      accessibilityLabel={label}
      placeholder={label}
      secureTextEntry={secure}
      autoCapitalize="none"
      style={s.input}
    />
  );
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F7F3' }}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={s.content} keyboardShouldPersistTaps="handled">
          <Pressable accessibilityRole="button" onPress={() => router.back()}>
            <Text>← 返回简账</Text>
          </Pressable>
          <Text style={s.title}>云端与共享账本</Text>
          <Text style={s.hint}>
            登录后可同步个人账本，也可以与家人共同记账。开启同步前，请选择以哪个账本为准。
          </Text>
          {!!message && (
            <Text accessibilityRole="alert" style={s.notice}>
              {message}
            </Text>
          )}
          {busy && <Text>正在处理，请稍候…</Text>}
          {!session ? (
            <View style={s.section}>
              <Text style={s.heading}>登录 App 账号</Text>
              {input(base, setBase, '服务根地址，例如 http://192.168.1.2:8082')}
              {input(phone, setPhone, '手机号')}
              <View style={s.wrap}>
                {action(mode === 'ACCOUNT' ? '切换到验证码登录' : '切换到密码登录', async () => {
                  setMode(mode === 'ACCOUNT' ? 'PHONE' : 'ACCOUNT');
                  setSecret('');
                })}
              </View>
              {input(
                secret,
                setSecret,
                mode === 'ACCOUNT' ? '账号密码' : '6 位验证码',
                mode === 'ACCOUNT'
              )}
              {mode === 'PHONE' &&
                action('发送登录验证码', async () => {
                  if (Date.now() < smsUntil) throw new Error('请等待 60 秒后再发送');
                  if (!/^1\d{10}$/.test(phone)) throw new Error('请输入有效手机号');
                  await api().sms(phone);
                  setSmsUntil(Date.now() + 60000);
                  setMessage('验证码已发送');
                })}
              {action('登录', async () => {
                if (!base || !phone || !secret) throw new Error('请填写服务地址、手机号和凭证');
                const result = await api().login(phone, secret, mode);
                if (!result.user?.id || !result.token) throw new Error('登录响应不完整');
                await saveRemoteSession(base, result);
                setSession(result);
                setSecret('');
                setMessage('登录成功。不会自动上传或覆盖本机账本。');
              })}
              <AccountRecovery base={base} phone={phone} />
            </View>
          ) : (
            <>
              <View style={s.section}>
                <Text style={s.heading}>{session.user.nickname || 'App 用户'}</Text>
                <Text style={s.hint}>{base}</Text>
                {action('刷新登录状态', async () => {
                  const user = await api().me();
                  setSession({ ...session, user });
                  setMessage('登录有效');
                })}
                {action('退出云端账号', async () => {
                  try {
                    await api().logout();
                  } finally {
                    await saveRemoteSession(base, null);
                    setSession(null);
                    setRecords([]);
                    setGroups([]);
                    setMembers([]);
                    setGroupId('');
                    setCloudLoaded(false);
                    setConfirmation('');
                    setMessage('已退出。本机账本仍保留，请在共享设备上自行清理。');
                  }
                })}
              </View>
              <AccountSettings
                base={base}
                session={session}
                onSession={(next) => {
                  setSession(next);
                  if (!next) {
                    setGroups([]);
                    setMembers([]);
                    setRecords([]);
                    setGroupId('');
                    setCloudLoaded(false);
                    setConfirmation('');
                    setMessage('注销申请已提交，当前会话已退出。本机账本仍保留。');
                  }
                }}
              />
              <View style={s.section}>
                <AutoSyncPanel base={base} session={session} />
                <Text style={s.heading}>完整个人账本云备份</Text>
                <Text style={s.hint}>
                  包含自定义分类、资产、标签、周期和预算。云版本：{cloudVersion ?? '未查询'}
                  。多设备冲突需手动处理。
                </Text>
                {action(
                  confirmation === 'upload' ? '确认上传当前账号' : '上传本机完整备份',
                  publish
                )}
                {action(
                  confirmation === 'download' ? '确认替换并恢复云备份' : '查看并恢复云备份',
                  pull
                )}
                {action('恢复云下载前的本机副本', async () => {
                  const previous = await AsyncStorage.getItem('jianzhang-before-cloud-restore');
                  if (!previous) throw new Error('没有恢复副本');
                  if (confirmation !== 'rollback') {
                    setConfirmation('rollback');
                    setMessage('再次点击将用下载前副本替换本机，请先导出现在的账本。');
                    return;
                  }
                  useLedgerStore.getState().restoreBackup(previous);
                  setConfirmation('');
                  setMessage('已恢复本机副本');
                })}
              </View>
              <View style={s.section}>
                <Text style={s.heading}>家庭共享账本</Text>
                {action('加载我的家庭组', async () => {
                  setGroups(await api().groups());
                })}
                {groups.map((g) => (
                  <Pressable
                    key={g.id}
                    style={s.item}
                    onPress={() => {
                      setGroupId(g.id);
                      setRecords([]);
                      setMembers([]);
                      setCloudLoaded(false);
                    }}>
                    <Text style={{ fontWeight: g.id === groupId ? '800' : '400' }}>
                      {g.name} · {g.memberCount}人 · {g.myRole === 1 ? '组长' : '成员'}
                      {g.id === groupId ? ' ✓' : ''}
                    </Text>
                    {g.inviteCode && <Text>邀请码 {g.inviteCode}</Text>}
                  </Pressable>
                ))}
                {input(groupName, setGroupName, '新家庭组名称')}
                {action('创建家庭组', async () => {
                  if (!groupName.trim()) throw new Error('请填写组名');
                  await api().createGroup(groupName.trim());
                  setGroups(await api().groups());
                  setGroupName('');
                })}
                {input(inviteCode, setInviteCode, '6 位大写邀请码')}
                {action('凭邀请码加入', async () => {
                  await api().joinGroup(inviteCode.trim().toUpperCase());
                  setGroups(await api().groups());
                  setInviteCode('');
                })}
                {!!groupId && (
                  <>
                    {action('查看成员', async () => {
                      setMembers(await api().members(groupId));
                    })}
                    {members.map((m) => (
                      <View key={m.userId} style={s.item}>
                        <Text>
                          {m.nickname} · {m.role === 1 ? '组长' : '成员'}
                        </Text>
                        {group?.myRole === 1 &&
                          m.userId !== session.user.id &&
                          action('移交组长给此成员', async () => {
                            const key = `transfer:${m.userId}`;
                            if (confirmation !== key) {
                              setConfirmation(key);
                              setMessage('再次点击确认移交，之后你将成为普通成员。');
                              return;
                            }
                            await api().transferOwner(groupId, m.userId);
                            setGroups(await api().groups());
                            setMembers(await api().members(groupId));
                            setConfirmation('');
                          })}
                        {group?.myRole === 1 &&
                          m.userId !== session.user.id &&
                          action('移除此成员', async () => {
                            const key = `remove:${m.userId}`;
                            if (confirmation !== key) {
                              setConfirmation(key);
                              setMessage('再次点击确认移除此成员');
                              return;
                            }
                            await api().removeMember(groupId, m.userId);
                            setMembers(await api().members(groupId));
                            setConfirmation('');
                          })}
                      </View>
                    ))}
                    {group?.myRole === 1 &&
                      action('刷新邀请码', async () => {
                        const refreshed = await api().invite(groupId);
                        setGroups((gs) => gs.map((g) => (g.id === groupId ? refreshed : g)));
                      })}
                    {action(
                      group?.myRole === 1 ? '解散家庭组' : '退出家庭组',
                      async () => {
                        if (confirmation !== 'leave') {
                          setConfirmation('leave');
                          setMessage('再次点击确认。解散后共享流水将回归原主个人账本。');
                          return;
                        }
                        await api().leaveGroup(groupId, group?.myRole === 1);
                        setGroupId('');
                        setGroups(await api().groups());
                        setRecords([]);
                        setConfirmation('');
                      },
                      true
                    )}
                  </>
                )}
              </View>
              <View style={s.section}>
                <Text style={s.heading}>云端流水 · {group?.name ?? '个人账本'}</Text>
                <Text style={s.hint}>这里管理共享账本和已有云端记录，可独立查看与记账。</Text>
                {groupId &&
                  action('切换服务端个人账本', async () => {
                    setGroupId('');
                    setRecords([]);
                    setMembers([]);
                    setCloudLoaded(false);
                  })}
                {input(month, setMonth, '月份 YYYY-MM')}
                {action('加载流水', async () => {
                  await refreshRecords();
                })}
                {cloudLoaded && !records.length && <Text style={s.hint}>本月没有服务端流水。</Text>}
                {records.map((r) => (
                  <View key={r.id} style={s.item}>
                    <Text>
                      {r.recordDate} ·{' '}
                      {remoteCategories[r.category as keyof typeof remoteCategories] ?? r.category}{' '}
                      · {r.type === 1 ? '−' : '+'}
                      {money(Math.round(Number(r.amount) * 100))}
                    </Text>
                    <Text style={s.hint}>{r.remark}</Text>
                    {r.userId === session.user.id && (
                      <View style={s.wrap}>
                        {action('编辑', async () => {
                          editRecord(r);
                        })}
                        {action(
                          '删除',
                          async () => {
                            if (confirmation !== r.id) {
                              setConfirmation(r.id);
                              setMessage('再次点击确认删除此云端账单');
                              return;
                            }
                            await api().deleteRecord(r.id);
                            await refreshRecords(page);
                            setConfirmation('');
                          },
                          true
                        )}
                      </View>
                    )}
                  </View>
                ))}
                <Text>
                  第 {page} 页 · 共 {total} 笔
                </Text>
                <View style={s.wrap}>
                  {page > 1 &&
                    action('上一页', async () => {
                      await refreshRecords(page - 1);
                    })}
                  {page * 50 < total &&
                    action('下一页', async () => {
                      await refreshRecords(page + 1);
                    })}
                </View>
                <Text style={s.heading}>{editing ? '编辑云端账单' : '新增云端账单'}</Text>
                <View style={s.wrap}>
                  {action('支出', async () => {
                    setRecordType(1);
                    setCategory('food');
                  })}
                  {action('收入', async () => {
                    setRecordType(2);
                    setCategory('salary');
                  })}
                </View>
                <Text>
                  {recordType === 1 ? '支出' : '收入'} ·{' '}
                  {remoteCategories[category as keyof typeof remoteCategories]}
                </Text>
                <View style={s.wrap}>
                  {(recordType === 1 ? expenseCodes : incomeCodes).map((code) => (
                    <Pressable
                      key={code}
                      onPress={() => setCategory(code)}
                      style={[s.category, category === code && { backgroundColor: '#E9B949' }]}>
                      <Text>{remoteCategories[code as keyof typeof remoteCategories]}</Text>
                    </Pressable>
                  ))}
                </View>
                {input(amount, setAmount, '金额')}
                {input(date, setDate, '日期 YYYY-MM-DD')}
                {input(remark, setRemark, '备注（最多200字）')}
                {action('保存到云端', async () => {
                  const parsed = cents(amount);
                  if (remark.length > 200) throw new Error('备注不能超过200字');
                  await api().saveRecord(
                    { type: recordType, amount: parsed / 100, category, recordDate: date, remark },
                    groupId,
                    editing?.id
                  );
                  setEditing(null);
                  setAmount('');
                  setRemark('');
                  await refreshRecords();
                  setMessage('云端账单已保存');
                })}
                {editing &&
                  action('取消编辑', async () => {
                    setEditing(null);
                    setAmount('');
                    setRemark('');
                  })}
              </View>
              <View style={s.section}>
                <Text style={s.heading}>云端个人月预算</Text>
                <Text style={s.hint}>预算针对云端个人记录，按自然月计算。</Text>
                <View style={s.wrap}>
                  {['total', ...expenseCodes].map((code) => (
                    <Pressable
                      key={code}
                      style={[
                        s.category,
                        budgetCategory === code && { backgroundColor: '#E9B949' },
                      ]}
                      onPress={() => setBudgetCategory(code)}>
                      <Text>
                        {code === 'total'
                          ? '总预算'
                          : remoteCategories[code as keyof typeof remoteCategories]}
                      </Text>
                    </Pressable>
                  ))}
                </View>
                {input(budgetAmount, setBudgetAmount, '预算金额（至少1元）')}
                {action('保存本月预算', async () => {
                  if (cents(budgetAmount) < 100) throw new Error('服务端预算至少1元');
                  await api().setBudget(
                    month,
                    budgetCategory,
                    (cents(budgetAmount) / 100).toFixed(2)
                  );
                  setBudgetRows(await api().listBudgets(month));
                  setMessage('服务端预算已更新');
                })}
                {action('查看服务端预算', async () => {
                  const b = await api().budget(month);
                  setBudgetRows(await api().listBudgets(month));
                  setBudgetInfo(
                    `总额 ${b.totalBudget} / 已花 ${b.totalSpent} / 剩余 ${b.totalRemaining}`
                  );
                })}
                <Text>{budgetInfo}</Text>
                {budgetRows.map((row) => (
                  <View key={row.category} style={s.item}>
                    <Text>
                      {row.category === 'total'
                        ? '总预算'
                        : remoteCategories[row.category as keyof typeof remoteCategories]}{' '}
                      · ¥{row.budgetAmount}
                    </Text>
                    {action('编辑预算', async () => {
                      setBudgetCategory(row.category);
                      setBudgetAmount(String(row.budgetAmount));
                    })}
                    {action('删除预算', async () => {
                      await api().removeBudget(month, row.category);
                      setBudgetRows(await api().listBudgets(month));
                    })}
                  </View>
                ))}
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
const s = StyleSheet.create({
  content: {
    padding: 22,
    gap: 18,
    width: '100%',
    maxWidth: 800,
    alignSelf: 'center',
    paddingBottom: 60,
  },
  title: { fontSize: 27, fontWeight: '800', color: '#242A26' },
  heading: { fontSize: 18, fontWeight: '700', color: '#242A26' },
  hint: { fontSize: 13, color: '#758078', lineHeight: 21 },
  section: { padding: 20, backgroundColor: '#FFF', borderRadius: 18, gap: 14 },
  input: {
    padding: 14,
    borderWidth: 1,
    borderColor: '#DDE1D9',
    borderRadius: 12,
    minHeight: 48,
    color: '#242A26',
  },
  button: { padding: 14, alignItems: 'center', borderRadius: 12, minHeight: 46 },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  item: { paddingVertical: 14, borderBottomWidth: 1, borderColor: '#EEE', gap: 8 },
  category: { padding: 10, borderRadius: 16, backgroundColor: '#F3F3EC' },
  notice: {
    backgroundColor: '#FFF0CD',
    padding: 16,
    borderRadius: 12,
    color: '#53421B',
    lineHeight: 23,
  },
});

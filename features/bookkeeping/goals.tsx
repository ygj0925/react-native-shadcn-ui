import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { bookkeepingStreak, cents, localDate, money, validDate } from './domain';
import { newId, useLedgerStore } from './store';

export function SavingsGoals() {
  const data = useLedgerStore((s) => s.data),
    update = useLedgerStore((s) => s.setData);
  const [name, setName] = useState(''),
    [amount, setAmount] = useState(''),
    [date, setDate] = useState(localDate()),
    [message, setMessage] = useState(''),
    [deposits, setDeposits] = useState<Record<string, string>>({}),
    [removing, setRemoving] = useState('');
  const stats = bookkeepingStreak(data);
  const dark = data.settings.theme === 'dark',
    fg = dark ? '#F6F4ED' : '#242A26',
    muted = dark ? '#ACB5AD' : '#758078';
  const input = (value: string, change: (s: string) => void, label: string) => (
    <TextInput
      value={value}
      onChangeText={change}
      accessibilityLabel={label}
      placeholder={label}
      placeholderTextColor={muted}
      style={{ padding: 12, borderWidth: 1, borderColor: muted, borderRadius: 12, color: fg }}
    />
  );
  const run = (task: () => void) => {
    try {
      task();
      setMessage('已保存');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '保存失败');
    }
  };
  return (
    <View
      style={{
        padding: 20,
        gap: 14,
        backgroundColor: dark ? '#222623' : '#FFF',
        borderRadius: 18,
      }}>
      <Text style={{ color: fg, fontSize: 18, fontWeight: '700' }}>存钱目标与记账足迹</Text>
      <Text style={{ color: muted }}>
        当前账本已记账 {stats.totalDays} 天 · 连续 {stats.streak} 天
      </Text>
      {(data.goals ?? [])
        .filter((g) => !g.deletedAt)
        .map((g) => (
          <View
            key={g.id}
            style={{ gap: 10, paddingVertical: 12, borderBottomWidth: 1, borderColor: muted }}>
            <Text style={{ color: fg, fontWeight: '700' }}>
              {g.name} · {g.targetDate}
            </Text>
            <Text style={{ color: fg }}>
              {data.settings.hideAmounts
                ? '••••'
                : `¥${money(g.savedCents)} / ¥${money(g.targetCents)}`}{' '}
              · {Math.min(100, Math.floor((g.savedCents / g.targetCents) * 100))}%
            </Text>
            <View
              style={{ height: 6, backgroundColor: dark ? '#38413A' : '#EEE', borderRadius: 3 }}>
              <View
                style={{
                  height: 6,
                  width: `${Math.min(100, (g.savedCents / g.targetCents) * 100)}%`,
                  backgroundColor: data.settings.accent,
                }}
              />
            </View>
            {input(
              deposits[g.id] ?? '',
              (v) => setDeposits((d) => ({ ...d, [g.id]: v })),
              '本次存入金额'
            )}
            <Pressable
              onPress={() =>
                run(() => {
                  const add = cents(deposits[g.id] ?? '');
                  if (g.savedCents + add > 99999999999) throw new Error('累计金额超出上限');
                  update((d) => ({
                    ...d,
                    goals: (d.goals ?? []).map((item) =>
                      item.id === g.id ? { ...item, savedCents: item.savedCents + add } : item
                    ),
                  }));
                  setDeposits((d) => ({ ...d, [g.id]: '' }));
                })
              }>
              <Text style={{ color: fg }}>记下一次存入</Text>
            </Pressable>
            <Pressable
              onPress={() => {
                if (removing !== g.id) {
                  setRemoving(g.id);
                  return;
                }
                run(() =>
                  update((d) => ({
                    ...d,
                    goals: (d.goals ?? []).map((item) =>
                      item.id === g.id ? { ...item, deletedAt: new Date().toISOString() } : item
                    ),
                  }))
                );
              }}>
              <Text style={{ color: muted }}>
                {removing === g.id ? '再次点击确认移除' : '移除此目标'}
              </Text>
            </Pressable>
          </View>
        ))}
      {input(name, setName, '目标名称')}
      {input(amount, setAmount, '目标金额')}
      {input(date, setDate, '目标日期 YYYY-MM-DD')}
      <Pressable
        style={{ padding: 14, backgroundColor: data.settings.accent, borderRadius: 12 }}
        onPress={() =>
          run(() => {
            if (!name.trim() || name.length > 40) throw new Error('目标名称需1–40字');
            if (!validDate(date)) throw new Error('日期无效');
            const targetCents = cents(amount);
            update((d) => ({
              ...d,
              goals: [
                ...(d.goals ?? []),
                { id: newId(), name: name.trim(), targetCents, savedCents: 0, targetDate: date },
              ],
            }));
            setName('');
            setAmount('');
          })
        }>
        <Text style={{ color: '#242A26', fontWeight: '700' }}>添加存钱目标</Text>
      </Pressable>
      <Text style={{ color: muted, fontSize: 12 }}>
        目标存入用于记录进度，不会重复计入收入或改变账户余额。
      </Text>
      {!!message && (
        <Text style={{ color: fg }} accessibilityRole="alert">
          {message}
        </Text>
      )}
    </View>
  );
}

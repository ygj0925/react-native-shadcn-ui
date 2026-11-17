import React, { useState } from 'react';
import { Platform, Pressable, Text, View } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import type { RecognizedDraft } from './receipt-tools';
type Draft = { id: string; amount: string; text: string; date: string; type: 1 | 2 };
const native =
  Platform.OS === 'android'
    ? requireOptionalNativeModule<{
        setPaymentCapture: (enabled: boolean) => Promise<void>;
        getPaymentDrafts: () => Promise<string>;
        removePaymentDraft: (id: string) => Promise<void>;
      }>('JianzhangWidget')
    : null;
export function PaymentDrafts({ onDraft }: { onDraft: (draft: RecognizedDraft) => void }) {
  const [drafts, setDrafts] = useState<Draft[]>([]),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  if (Platform.OS !== 'android') return null;
  async function run(action: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    try {
      if (!native) throw new Error('此功能需要重新构建Android原生App');
      await action();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '操作失败');
    } finally {
      setBusy(false);
    }
  }
  const action = (label: string, task: () => Promise<void>) => (
    <Pressable
      disabled={busy}
      onPress={() => run(task)}
      style={{ padding: 12, backgroundColor: '#EEE9DA', borderRadius: 12 }}>
      <Text style={{ color: '#242A26' }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ padding: 16, gap: 12, borderRadius: 14, backgroundColor: '#F0EEE4' }}>
      <Text style={{ fontWeight: '700', color: '#242A26' }}>支付通知草稿 · Android</Text>
      <Text style={{ color: '#536057' }}>
        仅在你主动开启并授予系统通知访问权限后，在本机读取微信/支付宝的支付通知。最多保留20条候选，不上传通知，不自动记账。关闭后清除候选；系统权限可在系统设置撤销。
      </Text>
      {action('前往系统授权并启用草稿采集', () => native!.setPaymentCapture(true))}
      {action('停用并清除草稿', async () => {
        await native!.setPaymentCapture(false);
        setDrafts([]);
        setMessage('已停用并清除候选通知');
      })}
      {action('查看本机候选草稿', async () =>
        setDrafts(JSON.parse(await native!.getPaymentDrafts()))
      )}
      {drafts.map((d) => (
        <View key={d.id} style={{ gap: 8 }}>
          <Text style={{ color: '#242A26' }}>
            {d.type === 1 ? '支出' : '收入'} ¥{d.amount} · {d.date}
          </Text>
          <Text numberOfLines={3} style={{ color: '#536057' }}>
            {d.text}
          </Text>
          {action('确认填入当前表单', async () => {
            onDraft({
              type: d.type,
              amount: Number(d.amount),
              category: 'other',
              recordDate: d.date,
              remark: d.text,
            });
            await native!.removePaymentDraft(d.id);
            setDrafts((rows) => rows.filter((r) => r.id !== d.id));
          })}
          {action('忽略此候选', async () => {
            await native!.removePaymentDraft(d.id);
            setDrafts((rows) => rows.filter((r) => r.id !== d.id));
          })}
        </View>
      ))}
      {!!message && <Text style={{ color: '#53421B' }}>{message}</Text>}
    </View>
  );
}

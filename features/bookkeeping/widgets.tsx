import React, { useEffect, useState } from 'react';
import { Platform, Pressable, Text, View, Share } from 'react-native';
import { requireOptionalNativeModule } from 'expo-modules-core';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useLedgerStore } from './store';
import { entriesForPeriod, localDate, money, totals } from './domain';
const preference = 'jianzhang-widget-show-amounts';
const bridge =
  Platform.OS === 'web'
    ? null
    : requireOptionalNativeModule<{ updateSummary: (summary: string) => Promise<void> }>(
        'JianzhangWidget'
      );
export async function refreshBookkeepingWidget() {
  if (!bridge) return;
  const data = useLedgerStore.getState().data,
    today = localDate(),
    visible = (await AsyncStorage.getItem(preference)) === '1' && !data.settings.hideAmounts;
  const todayExpense = totals(
    data.entries.filter((e) => !e.deletedAt && e.bookId === data.activeBookId && e.date === today)
  ).expense;
  await bridge.updateSummary(
    JSON.stringify({
      date: today,
      bookName: data.books.find((b) => b.id === data.activeBookId)?.name ?? '简账',
      todayExpense: money(todayExpense),
      hide: !visible,
      url: 'react-native-shadcn-ui:///bookkeeping?compose=1',
    })
  );
}
export function BookkeepingWidgets() {
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const update = () => {
      if (timer) clearTimeout(timer);
      timer = setTimeout(() => {
        refreshBookkeepingWidget().catch(() => {});
      }, 500);
    };
    const sub = useLedgerStore.subscribe(update);
    update();
    return () => {
      sub();
      if (timer) clearTimeout(timer);
    };
  }, []);
  return null;
}
export function WidgetSettings() {
  const [visible, setVisible] = useState(false),
    [message, setMessage] = useState('');
  useEffect(() => {
    AsyncStorage.getItem(preference).then((v) => setVisible(v === '1'));
  }, []);
  return (
    <View style={{ padding: 16, gap: 12, backgroundColor: '#F0EEE4', borderRadius: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#242A26' }}>
        桌面小组件与快捷记账
      </Text>
      <Text style={{ color: '#536057' }}>
        Android桌面小组件、iOS17+ WidgetKit
        与长按App快捷入口需要重新构建原生App。默认隐藏桌面金额；金额隐藏设置优先。
      </Text>
      <Pressable
        onPress={async () => {
          try {
            await AsyncStorage.setItem(preference, visible ? '0' : '1');
            setVisible(!visible);
            await refreshBookkeepingWidget();
            setMessage(
              bridge ? '小组件设置已更新' : '当前运行环境没有原生小组件模块，请使用开发构建'
            );
          } catch (e) {
            setMessage(e instanceof Error ? e.message : '更新失败');
          }
        }}>
        <Text style={{ color: '#242A26' }}>
          {visible ? '关闭桌面金额显示' : '允许桌面显示今日金额'}
        </Text>
      </Pressable>
      <Pressable
        onPress={() =>
          Share.share({ message: 'react-native-shadcn-ui:///bookkeeping?compose=1' }).catch(() =>
            setMessage('无法分享快捷链接')
          )
        }>
        <Text style={{ color: '#242A26' }}>分享快速记账深链（可用于系统快捷指令）</Text>
      </Pressable>
      {!!message && <Text style={{ color: '#536057' }}>{message}</Text>}
    </View>
  );
}

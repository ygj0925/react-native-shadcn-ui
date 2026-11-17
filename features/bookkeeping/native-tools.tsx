import React, { useEffect, useState } from 'react';
import { AppState, Platform, Pressable, Text, TextInput, View } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import * as LocalAuthentication from 'expo-local-authentication';
import * as Notifications from 'expo-notifications';
import * as DocumentPicker from 'expo-document-picker';
import { File } from 'expo-file-system';
import { useLedgerStore } from './store';
import { useRouter } from 'expo-router';
import { hasPin, verifyPin } from './pin';
import { PinSettings } from './pin-settings';

export const PrivacyVisibilityContext = React.createContext(true);
const lockKey = 'jianzhang-device-lock';
if (Platform.OS !== 'web')
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
    }),
  });
export function BookkeepingNotifications() {
  const router = useRouter();
  useEffect(() => {
    if (Platform.OS === 'web') return;
    const open = (response: Notifications.NotificationResponse | null) => {
      if (response?.notification.request.content.data?.url === '/bookkeeping') {
        router.push('/bookkeeping' as never);
        Notifications.clearLastNotificationResponseAsync().catch(() => {});
      }
    };
    Notifications.getLastNotificationResponseAsync()
      .then(open)
      .catch(() => {});
    const sub = Notifications.addNotificationResponseReceivedListener(open);
    return () => sub.remove();
  }, [router]);
  return null;
}
export function PrivacyGate({ children }: { children: React.ReactNode }) {
  const [pinAvailable, setPinAvailable] = useState(false),
    [pin, setPinInput] = useState('');
  const [ready, setReady] = useState(Platform.OS === 'web'),
    [locked, setLocked] = useState(true),
    [covered, setCovered] = useState(false),
    [enabled, setEnabled] = useState(false),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  useEffect(() => {
    if (Platform.OS === 'web') {
      setLocked(false);
      return;
    }
    Promise.all([SecureStore.getItemAsync(lockKey), hasPin()])
      .then(([value, pin]) => {
        setPinAvailable(pin);
        setEnabled(value === '1' || pin);
        setLocked(value === '1' || pin);
        setReady(true);
      })
      .catch(() => {
        setMessage('无法读取安全设置，请重试');
      });
    const listener = AppState.addEventListener('change', (state) => {
      if (state !== 'active') {
        setCovered(true);
        Promise.all([SecureStore.getItemAsync(lockKey), hasPin()])
          .then(([value, pin]) => {
            setPinAvailable(pin);
            setEnabled(value === '1' || pin);
            if (value === '1' || pin) setLocked(true);
          })
          .catch(() => {
            setLocked(true);
            setEnabled(true);
          });
      } else setCovered(false);
    });
    return () => listener.remove();
  }, []);
  async function unlock() {
    if (busy) return;
    setBusy(true);
    try {
      const result = await LocalAuthentication.authenticateAsync({
        promptMessage: '解锁简账',
        cancelLabel: '取消',
        fallbackLabel: '使用设备密码',
        disableDeviceFallback: false,
      });
      if (result.success) setLocked(false);
      else setMessage('未完成身份验证，请重试');
    } catch {
      setMessage('此设备无法进行系统身份验证');
    } finally {
      setBusy(false);
    }
  }
  const opened = React.useRef(false);
  const blocked = !ready || covered || (enabled && locked);
  if (!blocked) opened.current = true;
  const lockScreen = (
    <View
      style={{
        flex: 1,
        backgroundColor: '#F8F7F3',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
        padding: 30,
      }}>
      <Text style={{ fontSize: 28, fontWeight: '800' }}>简账</Text>
      <Text>
        {!ready ? '正在读取安全设置…' : covered ? '账本已隐藏' : '账本已锁定，请验证设备身份'}
      </Text>
      <Text>{message}</Text>
      {ready && !covered && pinAvailable && (
        <>
          <TextInput
            accessibilityLabel="6位解锁PIN"
            secureTextEntry
            keyboardType="number-pad"
            maxLength={6}
            value={pin}
            onChangeText={setPinInput}
            style={{
              padding: 16,
              borderWidth: 1,
              borderColor: '#CCC',
              width: 220,
              color: '#242A26',
            }}
          />
          <Pressable
            disabled={busy}
            onPress={async () => {
              setBusy(true);
              try {
                await verifyPin(pin);
                setLocked(false);
                setPinInput('');
              } catch (e) {
                setMessage(e instanceof Error ? e.message : '验证失败');
              } finally {
                setBusy(false);
              }
            }}>
            <Text>使用PIN解锁</Text>
          </Pressable>
        </>
      )}
      {ready && !covered && (
        <Pressable
          disabled={busy}
          onPress={unlock}
          style={{ padding: 18, backgroundColor: '#E9B949', borderRadius: 14 }}>
          <Text>使用生物识别或设备密码解锁</Text>
        </Pressable>
      )}
    </View>
  );
  return (
    <PrivacyVisibilityContext.Provider value={!blocked}>
      <View style={{ flex: 1 }}>
        <View
          style={{ flex: 1 }}
          pointerEvents={blocked ? 'none' : 'auto'}
          accessibilityElementsHidden={blocked}
          importantForAccessibility={blocked ? 'no-hide-descendants' : 'auto'}>
          {opened.current ? children : null}
        </View>
        {blocked && (
          <View
            style={{ position: 'absolute', top: 0, bottom: 0, left: 0, right: 0, zIndex: 1000 }}>
            {lockScreen}
          </View>
        )}
      </View>
    </PrivacyVisibilityContext.Provider>
  );
}

export function NativeTools() {
  const [time, setTime] = useState('21:00'),
    [locked, setLocked] = useState(false),
    [message, setMessage] = useState(''),
    [busy, setBusy] = useState(false);
  const [picked, setPicked] = useState<string | null>(null),
    [confirm, setConfirm] = useState(false);
  useEffect(() => {
    if (Platform.OS !== 'web')
      SecureStore.getItemAsync(lockKey)
        .then((v) => setLocked(v === '1'))
        .catch(() => setMessage('读取锁设置失败'));
  }, []);
  async function run(task: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    setMessage('');
    try {
      await task();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '操作失败');
    } finally {
      setBusy(false);
    }
  }
  const action = (label: string, task: () => Promise<void>) => (
    <Pressable
      accessibilityRole="button"
      disabled={busy}
      onPress={() => run(task)}
      style={{
        padding: 15,
        borderRadius: 12,
        backgroundColor: '#E9B949',
        opacity: busy ? 0.5 : 1,
      }}>
      <Text style={{ color: '#242A26', textAlign: 'center', fontWeight: '700' }}>{label}</Text>
    </Pressable>
  );
  return (
    <View style={{ padding: 20, borderRadius: 18, backgroundColor: '#F0EEE4', gap: 14 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#242A26' }}>安全与提醒</Text>
      <PinSettings />
      <Text style={{ color: '#536057', lineHeight: 21 }}>
        原生 App
        支持设备解锁和每日本地通知；网页端不提供系统锁和后台提醒。界面锁不代表账本文件已经加密。
      </Text>
      {Platform.OS !== 'web' && (
        <>
          {action(locked ? '关闭账本系统锁' : '启用账本系统锁', async () => {
            if (!(await LocalAuthentication.isEnrolledAsync()))
              throw new Error('请先在设备设置中启用密码或生物识别');
            const result = await LocalAuthentication.authenticateAsync({
              promptMessage: '确认修改简账锁设置',
            });
            if (!result.success) throw new Error('身份验证未完成');
            await SecureStore.setItemAsync(lockKey, locked ? '0' : '1');
            setLocked(!locked);
            setMessage('安全设置已保存，下次进入或从后台返回时生效');
          })}
          <TextInput
            accessibilityLabel="每日提醒时间"
            value={time}
            onChangeText={setTime}
            placeholder="HH:mm"
            style={{ padding: 14, backgroundColor: '#FFF', borderRadius: 12, color: '#242A26' }}
          />
          {action('设置每日记账提醒', async () => {
            if (!/^([01]\d|2[0-3]):[0-5]\d$/.test(time)) throw new Error('时间格式为 HH:mm');
            if (Platform.OS === 'android')
              await Notifications.setNotificationChannelAsync('jianzhang', {
                name: '简账记账提醒',
                importance: Notifications.AndroidImportance.DEFAULT,
              });
            const permission = await Notifications.requestPermissionsAsync();
            if (permission.status !== 'granted')
              throw new Error('通知权限未开启，请在系统设置中允许');
            const [hour, minute] = time.split(':').map(Number);
            await Notifications.cancelScheduledNotificationAsync('jianzhang-daily');
            await Notifications.scheduleNotificationAsync({
              identifier: 'jianzhang-daily',
              content: {
                title: '今天，也记得照顾好收支',
                body: '花一分钟，记下今天的生活。',
                data: { url: '/bookkeeping' },
              },
              trigger: {
                type: Notifications.SchedulableTriggerInputTypes.DAILY,
                hour,
                minute,
                channelId: 'jianzhang',
              },
            });
            setMessage(`每天 ${time} 提醒已设置`);
          })}
          {action('关闭每日提醒', async () => {
            await Notifications.cancelScheduledNotificationAsync('jianzhang-daily');
            setMessage('每日提醒已关闭');
          })}
        </>
      )}
      {action('选择 JSON 备份文件恢复', async () => {
        const result = await DocumentPicker.getDocumentAsync({
          type: ['application/json', 'text/plain'],
          copyToCacheDirectory: true,
        });
        if (result.canceled) return;
        if ((result.assets[0].size ?? 0) > 20_000_000) throw new Error('备份超过20MB');
        const file = new File(result.assets[0].uri);
        const text = await file.text();
        const { restore } = await import('./domain');
        const preview = restore(text);
        setPicked(text);
        setConfirm(false);
        setMessage(
          `备份包含 ${preview.entries.filter((e) => !e.deletedAt).length} 笔账单。恢复将替换当前本机账本，请先导出备份。`
        );
      })}
      {picked &&
        action(confirm ? '确认替换本机数据' : '准备恢复所选备份', async () => {
          if (!confirm) {
            setConfirm(true);
            return;
          }
          const { backup } = await import('./domain');
          const storage = (await import('@react-native-async-storage/async-storage')).default;
          await storage.setItem(
            'jianzhang-before-file-restore',
            backup(useLedgerStore.getState().data)
          );
          useLedgerStore.getState().restoreBackup(picked);
          setPicked(null);
          setMessage('备份已恢复，替换前的数据已保存为本机恢复副本');
        })}
      {!!message && (
        <Text accessibilityRole="alert" style={{ color: '#53421B', lineHeight: 22 }}>
          {message}
        </Text>
      )}
    </View>
  );
}

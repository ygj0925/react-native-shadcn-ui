import React, { useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';
import * as LocalAuthentication from 'expo-local-authentication';
import { hasPin, removePin, setPin, verifyPin } from './pin';
export function PinSettings() {
  const [current, setCurrent] = useState(''),
    [next, setNext] = useState(''),
    [confirmation, setConfirmation] = useState(''),
    [busy, setBusy] = useState(false),
    [message, setMessage] = useState('');
  if (Platform.OS === 'web') return null;
  async function run(task: () => Promise<void>) {
    if (busy) return;
    setBusy(true);
    try {
      await task();
      setCurrent('');
      setNext('');
      setConfirmation('');
      setMessage('PIN设置已更新');
    } catch (e) {
      setMessage(e instanceof Error ? e.message : '操作失败');
    } finally {
      setBusy(false);
    }
  }
  const field = (value: string, change: (s: string) => void, label: string) => (
    <TextInput
      secureTextEntry
      keyboardType="number-pad"
      maxLength={6}
      accessibilityLabel={label}
      placeholder={label}
      value={value}
      onChangeText={change}
      style={{
        padding: 12,
        borderWidth: 1,
        borderColor: '#CCC',
        borderRadius: 10,
        color: '#242A26',
        backgroundColor: '#FFF',
      }}
    />
  );
  return (
    <View style={{ gap: 12, padding: 16, backgroundColor: '#F0EEE4', borderRadius: 16 }}>
      <Text style={{ fontSize: 18, fontWeight: '700', color: '#242A26' }}>独立6位密码</Text>
      {field(current, setCurrent, '当前PIN（首次设置留空）')}
      {field(next, setNext, '新6位PIN')}
      {field(confirmation, setConfirmation, '再次输入新PIN')}
      <Pressable
        disabled={busy}
        onPress={() =>
          run(async () => {
            if (await hasPin()) await verifyPin(current);
            await setPin(next, confirmation);
          })
        }>
        <Text style={{ color: '#242A26' }}>保存PIN</Text>
      </Pressable>
      <Pressable
        disabled={busy}
        onPress={() =>
          run(async () => {
            await verifyPin(current);
            await removePin();
          })
        }>
        <Text style={{ color: '#242A26' }}>验证当前PIN并关闭</Text>
      </Pressable>
      <Pressable
        disabled={busy}
        onPress={() =>
          run(async () => {
            const result = await LocalAuthentication.authenticateAsync({
              promptMessage: '通过设备身份恢复简账PIN',
              disableDeviceFallback: false,
            });
            if (!result.success) throw new Error('未完成设备身份验证');
            await removePin();
          })
        }>
        <Text style={{ color: '#536057' }}>忘记PIN？通过设备身份验证重置</Text>
      </Pressable>
      <Text style={{ color: '#536057' }}>
        PIN保存在本机安全存储，不进入云备份。无法验证设备身份时，请使用外部备份恢复；不提供绕过锁的入口。
      </Text>
      {!!message && (
        <Text style={{ color: '#53421B' }} accessibilityRole="alert">
          {message}
        </Text>
      )}
    </View>
  );
}

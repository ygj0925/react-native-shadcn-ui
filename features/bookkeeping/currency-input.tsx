import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import { currencies, parseRate, convertedCents, type OriginalAmount } from './currency';
import { cents, money } from './domain';
export function CurrencyInput({
  value,
  onChange,
}: {
  value?: OriginalAmount;
  onChange: (value: OriginalAmount | undefined, cents?: number) => void;
}) {
  const [currency, setCurrency] = useState(value?.currency ?? 'USD'),
    [amount, setAmount] = useState(value ? String(value.cents / 100) : ''),
    [rate, setRate] = useState(value ? String(value.rateMicros / 1000000) : ''),
    [message, setMessage] = useState('');
  return (
    <View style={{ gap: 10, padding: 16, backgroundColor: '#F0EEE4', borderRadius: 14 }}>
      <Text style={{ color: '#242A26', fontWeight: '700' }}>外币消费（可选）</Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {currencies.map((code) => (
          <Pressable key={code} onPress={() => setCurrency(code)}>
            <Text style={{ color: '#242A26', fontWeight: currency === code ? '800' : '400' }}>
              {code}
            </Text>
          </Pressable>
        ))}
      </View>
      <TextInput
        accessibilityLabel="原币金额"
        placeholder="原币金额"
        value={amount}
        onChangeText={setAmount}
        keyboardType="decimal-pad"
        style={{ padding: 12, backgroundColor: '#FFF', color: '#242A26' }}
      />
      <TextInput
        accessibilityLabel="入账汇率"
        placeholder="1原币 = 多少人民币"
        value={rate}
        onChangeText={setRate}
        keyboardType="decimal-pad"
        style={{ padding: 12, backgroundColor: '#FFF', color: '#242A26' }}
      />
      <Text style={{ color: '#536057' }}>
        手动填写本次入账汇率；系统保存汇率快照，统计和资产统一按人民币计算，不自动猜测汇率。
      </Text>
      <Pressable
        onPress={() => {
          try {
            const next = { currency, cents: cents(amount), rateMicros: parseRate(rate) },
              converted = convertedCents(next);
            onChange(next, converted);
            setMessage(`已折算为 ¥${money(converted)}，此后如调整金额请重新折算`);
          } catch (e) {
            setMessage(e instanceof Error ? e.message : '汇率无效');
          }
        }}>
        <Text style={{ color: '#242A26' }}>确认原币并折算</Text>
      </Pressable>
      {value && (
        <Pressable
          onPress={() => {
            onChange(undefined);
            setMessage('已改为仅人民币记账');
          }}>
          <Text style={{ color: '#536057' }}>取消原币记录</Text>
        </Pressable>
      )}
      {!!message && <Text style={{ color: '#53421B' }}>{message}</Text>}
    </View>
  );
}

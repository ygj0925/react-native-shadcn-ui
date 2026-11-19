import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { getVehicle } from '@/lib/website/catalog';
import { websiteApi } from '@/lib/website/api';
import type { TestDrivePayload } from '@/lib/website/types';
import { Link, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, CheckCircle2 } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { WebsiteShell } from './website-shell';

const cities = ['上海', '北京', '深圳', '广州', '杭州', '成都'];

export function TestDriveScreen() {
  const params = useLocalSearchParams<{ vehicle?: string }>();
  const defaultVehicle = getVehicle(typeof params.vehicle === 'string' ? params.vehicle : 's7');
  const [form, setForm] = useState<TestDrivePayload>({ name: '', phone: '', city: '上海', vehicle: defaultVehicle.slug, date: '', consent: false });
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const vehicle = useMemo(() => getVehicle(form.vehicle), [form.vehicle]);
  const update = (field: keyof TestDrivePayload, value: string | boolean) => setForm((current) => ({ ...current, [field]: value }));

  const submit = async () => {
    if (!form.name.trim()) { setError('请填写姓名'); return; }
    if (!/^1\d{10}$/.test(form.phone)) { setError('请输入有效的手机号码'); return; }
    if (!form.date) { setError('请选择试驾日期'); return; }
    if (!form.consent) { setError('请先同意隐私政策'); return; }
    setError('');
    setStatus('submitting');
    try { await websiteApi.submitTestDrive(form); setStatus('success'); } catch { setStatus('error'); setError('提交失败，请稍后重试'); }
  };

  if (status === 'success') {
    return (
      <WebsiteShell>
        <View className="mx-auto min-h-[620px] w-full max-w-[1440px] items-center justify-center bg-[#DDFBFF] px-5 py-24 text-center md:px-10">
          <View className="max-w-xl items-center gap-5"><CheckCircle2 size={56} color="#2D7B83" strokeWidth={1.4} /><Text className="text-4xl font-bold tracking-[-1px] text-[#0A1012]">预约已收到。</Text><Text className="text-base leading-7 text-[#526064]">我们的顾问会在一个工作日内与你联系，确认 {vehicle.name} 的试驾时间和门店。</Text><Link href={'/website' as never} asChild><Button className="mt-3 rounded-full bg-[#0A1012] px-7"><Text className="text-sm text-white">返回首页</Text></Button></Link></View>
        </View>
      </WebsiteShell>
    );
  }

  return (
    <WebsiteShell>
      <View className="mx-auto w-full max-w-[1440px] bg-[#F4F7F6] px-5 pb-24 pt-16 md:px-10 md:pt-24">
        <Link href={'/website' as never} asChild><Pressable className="flex-row items-center gap-3"><ArrowLeft size={16} color="#526064" /><Text className="text-sm text-[#526064]">返回 EONRA 首页</Text></Pressable></Link>
        <View className="mt-10 flex-row flex-wrap gap-12">
          <View className="min-w-[280px] flex-1 gap-5"><Text className="text-xs font-semibold tracking-[2.5px] text-[#5E8990]">TAKE THE WHEEL</Text><Text className="text-5xl font-bold leading-[1.05] tracking-[-1.5px] text-[#0A1012] md:text-7xl">预约一次，感受真正的安静。</Text><Text className="max-w-md text-base leading-7 text-[#5C686B]">填写你的信息，我们会安排离你最近的体验中心，并准备好你想了解的车型。</Text><View className="mt-8 gap-3 border-t border-[#CDD6D7] pt-5"><Text className="text-xs text-[#778285]">当前选择</Text><Text className="text-2xl font-semibold text-[#0A1012]">{vehicle.name}</Text><Text className="text-sm text-[#5C686B]">{vehicle.description}</Text></View></View>
          <View className="min-w-[320px] flex-1 gap-5 bg-white p-5 md:p-8">
            <Text className="text-2xl font-semibold text-[#0A1012]">预约试驾</Text>
            <View className="gap-2"><Text className="text-xs text-[#526064]">姓名</Text><Input value={form.name} onChangeText={(value) => update('name', value)} placeholder="请输入姓名" /></View>
            <View className="gap-2"><Text className="text-xs text-[#526064]">手机号码</Text><Input value={form.phone} onChangeText={(value) => update('phone', value)} keyboardType="phone-pad" placeholder="请输入手机号码" /></View>
            <View className="gap-2"><Text className="text-xs text-[#526064]">车型</Text><View className="flex-row flex-wrap gap-2">{['s7', 'x5', 'gt'].map((slug) => <Pressable key={slug} onPress={() => update('vehicle', slug)} className={form.vehicle === slug ? 'rounded-full bg-[#0A1012] px-4 py-2.5' : 'rounded-full border border-[#CDD6D7] px-4 py-2.5'}><Text className={form.vehicle === slug ? 'text-xs text-white' : 'text-xs text-[#526064]'}>{slug.toUpperCase()}</Text></Pressable>)}</View></View>
            <View className="gap-2"><Text className="text-xs text-[#526064]">城市</Text><View className="flex-row flex-wrap gap-2">{cities.map((city) => <Pressable key={city} onPress={() => update('city', city)} className={form.city === city ? 'rounded-full bg-[#0A1012] px-4 py-2.5' : 'rounded-full border border-[#CDD6D7] px-4 py-2.5'}><Text className={form.city === city ? 'text-xs text-white' : 'text-xs text-[#526064]'}>{city}</Text></Pressable>)}</View></View>
            <View className="gap-2"><Text className="text-xs text-[#526064]">期望试驾日期</Text><Input value={form.date} onChangeText={(value) => update('date', value)} placeholder="例如 2026-06-20" /></View>
            <Pressable onPress={() => update('consent', !form.consent)} className="flex-row items-start gap-3 py-2"><View className={form.consent ? 'mt-0.5 h-5 w-5 items-center justify-center bg-[#0A1012]' : 'mt-0.5 h-5 w-5 border border-[#9AA7A9]'}>{form.consent ? <CheckCircle2 size={14} color="#DDFBFF" /> : null}</View><Text className="flex-1 text-xs leading-5 text-[#778285]">我同意 EONRA 根据隐私政策使用我的信息联系我。</Text></Pressable>
            {error ? <Text className="text-xs text-[#B34A4A]">{error}</Text> : null}
            <Button disabled={status === 'submitting'} onPress={submit} className="h-12 rounded-full bg-[#0A1012]"><Text className="text-sm font-semibold text-white">{status === 'submitting' ? '提交中…' : '提交预约'}</Text></Button>
          </View>
        </View>
      </View>
    </WebsiteShell>
  );
}

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Link } from 'expo-router';
import { ArrowUpRight, Mail, MapPin, Phone } from 'lucide-react-native';
import { useState } from 'react';
import { Pressable, View } from 'react-native';
import { WebsiteShell } from './website-shell';

export function ContactScreen() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <WebsiteShell>
      <View className="mx-auto w-full max-w-[1440px] bg-[#F4F7F6] px-5 pb-24 pt-20 md:px-10 md:pt-28">
        <View className="max-w-2xl gap-4"><Text className="text-xs font-semibold tracking-[2.5px] text-[#5E8990]">CONNECT WITH EONRA</Text><Text className="text-5xl font-bold leading-[1.05] tracking-[-1.5px] text-[#0A1012] md:text-7xl">让我们聊聊你的下一段旅程。</Text><Text className="text-base leading-7 text-[#5C686B]">无论你想了解车型、充电或服务，我们都愿意从你的使用场景开始。</Text></View>
        <View className="mt-16 flex-row flex-wrap gap-5">
          {[
            { icon: MapPin, title: '体验中心', copy: '上海 · 北京 · 深圳 · 杭州', action: '查找附近门店' },
            { icon: Phone, title: '销售咨询', copy: '400-820-2026', action: '拨打电话' },
            { icon: Mail, title: '电子邮箱', copy: 'hello@eonra.example', action: '发送邮件' },
          ].map(({ icon: Icon, title, copy, action }) => <View key={title} className="min-w-[280px] flex-1 border-t border-[#CDD6D7] pt-5"><Icon size={22} color="#5E8990" strokeWidth={1.5} /><Text className="mt-7 text-xl font-semibold text-[#0A1012]">{title}</Text><Text className="mt-2 text-sm text-[#5C686B]">{copy}</Text><Pressable className="mt-8 flex-row items-center gap-2"><Text className="text-sm font-semibold text-[#0A1012]">{action}</Text><ArrowUpRight size={15} color="#0A1012" /></Pressable></View>)}
        </View>
        <View className="mt-20 flex-row flex-wrap items-end justify-between gap-8 border-t border-[#CDD6D7] pt-10"><View className="max-w-xl gap-3"><Text className="text-3xl font-bold text-[#0A1012]">获取 EONRA 最新动态</Text><Text className="text-sm leading-6 text-[#5C686B]">留下邮箱，接收车型发布和体验活动信息。</Text></View><View className="min-w-[300px] flex-row items-center gap-3"><Input value={email} onChangeText={setEmail} placeholder="你的邮箱地址" className="flex-1 bg-white" />{sent ? <Text className="text-xs text-[#2D7B83]">已订阅</Text> : <Button onPress={() => setSent(Boolean(email))} className="rounded-full bg-[#0A1012] px-5"><Text className="text-xs text-white">订阅</Text></Button>}</View></View>
        <View className="mt-20 flex-row flex-wrap items-center justify-between gap-6 bg-[#DDFBFF] p-6 md:p-8"><View className="gap-2"><Text className="text-2xl font-bold text-[#0A1012]">亲自感受 EONRA。</Text><Text className="text-sm text-[#526064]">预约一次试驾，找到你的驾驶节奏。</Text></View><Link href={'/website/test-drive' as never} asChild><Button className="rounded-full bg-[#0A1012] px-6"><Text className="text-sm text-white">预约试驾</Text><ArrowUpRight size={16} color="#FFFFFF" /></Button></Link></View>
      </View>
    </WebsiteShell>
  );
}

import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { SectionIntro, Spec } from '@/components/website/website-shell';
import { formatAcceleration, formatPrice, getVehicle } from '@/lib/website/catalog';
import { Link, useLocalSearchParams } from 'expo-router';
import { ArrowUpRight, Check, ChevronRight } from 'lucide-react-native';
import { Image, Pressable, View } from 'react-native';
import { WebsiteShell } from './website-shell';

export function ModelDetailScreen() {
  const { slug } = useLocalSearchParams<{ slug?: string }>();
  const vehicle = getVehicle(typeof slug === 'string' ? slug : 's7');
  const trim = vehicle.trims[0];

  return (
    <WebsiteShell>
      <View className="mx-auto w-full max-w-[1440px]">
        <View className="relative min-h-[580px] overflow-hidden bg-[#11191B]">
          <Image source={vehicle.image} resizeMode="cover" className="absolute inset-0 h-full w-full opacity-85" />
          <View className="absolute inset-0 bg-black/35" />
          <View className="relative z-10 min-h-[580px] justify-end px-5 pb-12 md:px-10 md:pb-16">
            <View className="max-w-2xl gap-4">
              <Text className="text-xs font-semibold tracking-[2.5px]" style={{ color: vehicle.accent }}>{vehicle.eyebrow}</Text>
              <Text className="text-6xl font-bold tracking-[-2px] text-white md:text-8xl">{vehicle.name}</Text>
              <Text className="text-lg text-white/70">{vehicle.description}</Text>
            </View>
          </View>
        </View>
        <View className="flex-row flex-wrap gap-8 border-b border-[#CDD6D7] bg-[#F4F7F6] px-5 py-8 md:px-10">
          <Spec light value={`${trim.range} km`} label="CLTC 续航" />
          <Spec light value={formatAcceleration(trim.acceleration)} label="零百加速" />
          <Spec light value={`${trim.power} kW`} label="峰值功率" />
          <Spec light value={trim.charging.split(' ')[0]} label="快速补能" />
        </View>
        <View className="bg-[#F4F7F6] px-5 py-20 md:px-10 md:py-28">
          <View className="flex-row flex-wrap items-end justify-between gap-8">
            <SectionIntro light eyebrow="BUILT AROUND YOU" title="每个细节，都服务于更好的驾驶。" description="从坐进车内的第一秒开始，S7 会用更少的操作带来更多确定感。" />
            <Link href={`/website/configurator?vehicle=${vehicle.slug}` as never} asChild>
              <Button className="rounded-full bg-[#0A1012] px-6"><Text className="text-sm text-white">开始配置</Text><ArrowUpRight size={16} color="#FFFFFF" /></Button>
            </Link>
          </View>
          <View className="mt-14 flex-row flex-wrap gap-4">
            {vehicle.highlights.map((highlight) => (
              <View key={highlight} className="min-w-[240px] flex-1 border-t border-[#CDD6D7] pt-5">
                <Check size={18} color="#5E8990" />
                <Text className="mt-6 text-lg font-semibold text-[#0A1012]">{highlight}</Text>
              </View>
            ))}
          </View>
        </View>
        <View className="bg-[#10181A] px-5 py-20 md:px-10 md:py-28">
          <SectionIntro eyebrow="CHOOSE YOUR EONRA" title="从恰好的版本开始。" description="每个版本都保留 EONRA 的核心体验，只把你在意的部分向前推进。" />
          <View className="mt-12 flex-row flex-wrap gap-4">
            {vehicle.trims.map((item, index) => (
              <View key={item.id} className="min-w-[280px] flex-1 border border-white/15 p-5">
                <View className="flex-row items-start justify-between">
                  <View className="gap-2"><Text className="text-2xl font-semibold text-white">{item.name}</Text><Text className="text-sm text-white/45">{vehicle.name}</Text></View>
                  <Text className="text-lg font-semibold text-[#DDFBFF]">{formatPrice(item.price)}</Text>
                </View>
                <View className="mt-10 flex-row flex-wrap gap-6">
                  <Spec value={`${item.range} km`} label="续航" />
                  <Spec value={formatAcceleration(item.acceleration)} label="零百" />
                </View>
                <Link href={`/website/configurator?vehicle=${vehicle.slug}&trim=${item.id}` as never} asChild>
                  <Pressable className="mt-10 flex-row items-center gap-2 border-b border-[#8FE9F4] pb-3">
                    <Text className="text-sm text-[#DDFBFF]">配置此版本</Text><ChevronRight size={16} color="#DDFBFF" />
                  </Pressable>
                </Link>
              </View>
            ))}
          </View>
        </View>
      </View>
    </WebsiteShell>
  );
}

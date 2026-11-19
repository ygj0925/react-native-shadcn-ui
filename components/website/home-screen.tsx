import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { SectionIntro, Spec } from '@/components/website/website-shell';
import { VehicleCard } from '@/components/website/vehicle-card';
import { vehicles } from '@/lib/website/catalog';
import { Link } from 'expo-router';
import { ArrowDown, ArrowUpRight, BatteryCharging, ChevronRight, Cpu, ShieldCheck, Zap } from 'lucide-react-native';
import { Image, Pressable, View } from 'react-native';
import { WebsiteShell } from './website-shell';

export function WebsiteHomeScreen() {
  return (
    <WebsiteShell>
      <View className="mx-auto w-full max-w-[1440px]">
        <View className="min-h-[650px] overflow-hidden bg-[#080A0B] px-5 pb-12 pt-20 md:px-10 md:pb-20 md:pt-24">
          <View className="relative min-h-[540px] justify-end overflow-hidden bg-[#0F171A]">
            <Image source={require('../../assets/website/hero-s7.png')} resizeMode="cover" className="absolute inset-0 h-full w-full opacity-90" />
            <View className="absolute inset-0 bg-black/45" />
            <View className="relative z-10 max-w-xl gap-7 p-6 md:p-14">
              <View className="gap-3">
                <Text className="text-xs font-semibold tracking-[3px] text-[#8FE9F4]">EONRA S7 · FLAGSHIP ELECTRIC SEDAN</Text>
                <Text className="text-5xl font-bold leading-[1.02] tracking-[-2px] text-white md:text-7xl">安静的力量，驶向更远。</Text>
                <Text className="max-w-md text-base leading-7 text-white/65 md:text-lg">全新 EONRA S7，把智能、性能与舒适收进一条流畅的车身线条里。</Text>
              </View>
              <View className="flex-row flex-wrap gap-3">
                <Link href={'/website/models/s7' as never} asChild>
                  <Button className="rounded-full bg-[#DDFBFF] px-6" onPress={() => undefined}>
                    <Text className="text-sm font-semibold text-[#0A1012]">探索 S7</Text>
                    <ArrowUpRight size={16} color="#0A1012" />
                  </Button>
                </Link>
                <Link href={'/website/test-drive' as never} asChild>
                  <Button variant="glass" className="rounded-full border-white/25 bg-white/10 px-6">
                    <Text className="text-sm text-white">预约试驾</Text>
                  </Button>
                </Link>
              </View>
            </View>
            <View className="absolute bottom-6 right-6 z-10 hidden flex-row gap-8 md:flex">
              <Spec value="780 km" label="最长续航" />
              <Spec value="3.9 s" label="零百加速" />
              <Spec value="800 V" label="超充架构" />
            </View>
          </View>
          <View className="mt-8 flex-row items-center gap-3 px-2">
            <ArrowDown size={16} color="#8FE9F4" />
            <Text className="text-xs tracking-[2px] text-white/40">向下探索 EONRA</Text>
          </View>
        </View>

        <View className="bg-[#F4F7F6] px-5 py-20 md:px-10 md:py-28">
          <View className="flex-row flex-wrap items-end justify-between gap-8">
            <SectionIntro light eyebrow="THE RANGE" title="为每一种出发，准备一台车。" description="从静谧的旗舰轿车，到能装下周末的智能 SUV，EONRA 让电动出行拥有更清晰的选择。" />
            <Link href={'/website/models' as never} asChild>
              <Pressable className="flex-row items-center gap-2 border-b border-[#0A1012] pb-2">
                <Text className="text-sm font-semibold text-[#0A1012]">查看全部车型</Text>
                <ChevronRight size={16} color="#0A1012" />
              </Pressable>
            </Link>
          </View>
          <View className="mt-12 flex-row flex-wrap gap-5">
            {vehicles.map((vehicle, index) => <VehicleCard key={vehicle.slug} vehicle={vehicle} featured={index === 0} />)}
          </View>
        </View>

        <View className="bg-[#10181A] px-5 py-20 md:px-10 md:py-28">
          <View className="flex-row flex-wrap items-end justify-between gap-8">
            <SectionIntro eyebrow="EONRA INTELLIGENCE" title="技术应该让生活更从容。" description="每一项能力都在后台工作，让你只需要专注于眼前的路。" />
            <Link href={'/website/technology' as never} asChild>
              <Pressable className="flex-row items-center gap-2 border-b border-[#8FE9F4] pb-2">
                <Text className="text-sm font-semibold text-[#DDFBFF]">探索 EONRA 技术</Text>
                <ChevronRight size={16} color="#DDFBFF" />
              </Pressable>
            </Link>
          </View>
          <View className="mt-14 flex-row flex-wrap gap-4">
            {[
              { icon: BatteryCharging, title: '800 V 超充架构', copy: '补能更快，长途出发不再需要等待。' },
              { icon: Cpu, title: 'EONRA OS', copy: '把常用的控制交给直觉，把复杂留在系统里。' },
              { icon: ShieldCheck, title: '全域安全感知', copy: '从城市道路到高速公路，实时感知每个变化。' },
              { icon: Zap, title: '持续进化', copy: '通过 OTA 更新，让每一次启动车辆都有新的可能。' },
            ].map(({ icon: Icon, title, copy }) => (
              <View key={title} className="min-w-[230px] flex-1 border-t border-white/15 py-5">
                <Icon size={22} color="#8FE9F4" strokeWidth={1.6} />
                <Text className="mt-8 text-lg font-semibold text-white">{title}</Text>
                <Text className="mt-2 max-w-[250px] text-sm leading-6 text-white/50">{copy}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="relative min-h-[480px] overflow-hidden bg-[#0F171A]">
          <Image source={require('../../assets/website/cabin-tech.png')} resizeMode="cover" className="absolute inset-0 h-full w-full opacity-70" />
          <View className="absolute inset-0 bg-black/45" />
          <View className="relative z-10 max-w-xl gap-6 px-5 py-24 md:px-14">
            <Text className="text-xs font-semibold tracking-[2.5px] text-[#8FE9F4]">A QUIET PLACE TO ARRIVE</Text>
            <Text className="text-4xl font-bold leading-[1.05] tracking-[-1px] text-white md:text-6xl">每一段旅程，先从车内安静下来。</Text>
            <Text className="max-w-md text-base leading-7 text-white/60">宽阔视野、克制的材质和顺手的控制，让座舱成为你一天里最放松的空间。</Text>
          </View>
        </View>

        <View className="bg-[#DDFBFF] px-5 py-20 md:px-10 md:py-28">
          <View className="flex-row flex-wrap items-end justify-between gap-8">
            <View className="max-w-2xl gap-4">
              <Text className="text-xs font-semibold tracking-[2.5px] text-[#5E8990]">TAKE THE WHEEL</Text>
              <Text className="text-4xl font-bold leading-[1.05] tracking-[-1.5px] text-[#0A1012] md:text-6xl">下一次出发，亲自感受。</Text>
              <Text className="max-w-lg text-base leading-7 text-[#526064]">预约一次专属试驾，感受 EONRA 如何把科技变成一种自然的驾驶节奏。</Text>
            </View>
            <Link href={'/website/test-drive' as never} asChild>
              <Button className="rounded-full bg-[#0A1012] px-7">
                <Text className="text-sm font-semibold text-white">预约试驾</Text>
                <ArrowUpRight size={16} color="#FFFFFF" />
              </Button>
            </Link>
          </View>
        </View>
      </View>
    </WebsiteShell>
  );
}

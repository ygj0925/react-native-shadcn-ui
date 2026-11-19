import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { SectionIntro } from '@/components/website/website-shell';
import { Link } from 'expo-router';
import { ArrowUpRight, Leaf, MoveRight, Shapes } from 'lucide-react-native';
import { Image, View } from 'react-native';
import { WebsiteShell } from './website-shell';

export function BrandScreen() {
  return (
    <WebsiteShell>
      <View className="mx-auto w-full max-w-[1440px]">
        <View className="bg-[#DDFBFF] px-5 py-20 md:px-10 md:py-28">
          <SectionIntro light eyebrow="THE EONRA WAY" title="我们相信，未来应该更安静。" description="安静不是退让，而是把所有不必要的东西留在身后，让真正重要的事更清晰。" />
        </View>
        <View className="flex-row flex-wrap bg-[#10181A]">
          <View className="min-h-[420px] min-w-[320px] flex-1 overflow-hidden">
            <Image source={require('../../assets/website/x5-exterior.png')} resizeMode="cover" className="h-full w-full opacity-80" />
          </View>
          <View className="min-w-[320px] flex-1 justify-center gap-6 px-5 py-20 md:px-14">
            <Text className="text-xs font-semibold tracking-[2.5px] text-[#8FE9F4]">DESIGNED FOR LESS</Text>
            <Text className="text-4xl font-bold leading-[1.05] tracking-[-1px] text-white md:text-5xl">每一条线，都有它的理由。</Text>
            <Text className="max-w-md text-base leading-7 text-white/55">我们减少视觉噪音，也减少不必要的操作。车身、座舱和软件拥有同一套克制的秩序。</Text>
          </View>
        </View>
        <View className="bg-[#F4F7F6] px-5 py-20 md:px-10 md:py-28">
          <View className="flex-row flex-wrap gap-6">
            {[
              { icon: Shapes, title: '设计', copy: '让比例、光线和材料共同完成一台车。' },
              { icon: Leaf, title: '材料', copy: '使用可追溯的低碳材料，减少制造中的浪费。' },
              { icon: MoveRight, title: '行动', copy: '从产品到服务，让每次移动都更轻盈。' },
            ].map(({ icon: Icon, title, copy }) => (
              <View key={title} className="min-w-[280px] flex-1 border-t border-[#CDD6D7] pt-5">
                <Icon size={24} color="#5E8990" strokeWidth={1.5} />
                <Text className="mt-8 text-2xl font-semibold text-[#0A1012]">{title}</Text>
                <Text className="mt-3 max-w-[300px] text-sm leading-6 text-[#5C686B]">{copy}</Text>
              </View>
            ))}
          </View>
          <View className="mt-20 flex-row flex-wrap items-end justify-between gap-8 border-t border-[#CDD6D7] pt-8">
            <View className="max-w-xl gap-3">
              <Text className="text-3xl font-bold tracking-[-1px] text-[#0A1012]">现在开始，驶向自己的节奏。</Text>
              <Text className="text-sm leading-6 text-[#5C686B]">从一台 EONRA 开始，重新认识电动出行。</Text>
            </View>
            <Link href={'/website/test-drive' as never} asChild>
              <Button className="rounded-full bg-[#0A1012] px-7"><Text className="text-sm text-white">预约试驾</Text><ArrowUpRight size={16} color="#FFFFFF" /></Button>
            </Link>
          </View>
        </View>
      </View>
    </WebsiteShell>
  );
}

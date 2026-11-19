import { Text } from '@/components/ui/text';
import { SectionIntro, Spec } from '@/components/website/website-shell';
import { BatteryCharging, BrainCircuit, Car, Gauge, LockKeyhole, RadioTower } from 'lucide-react-native';
import { Image, View } from 'react-native';
import { WebsiteShell } from './website-shell';

export function TechnologyScreen() {
  const features = [
    { icon: BatteryCharging, title: '800 V 超充架构', copy: '高压平台带来更短的补能时间。连接充电桩 15 分钟，增加一段从容的城市通勤。' },
    { icon: BrainCircuit, title: 'EONRA OS', copy: '从导航到座舱设置，所有信息都被安排在恰好的位置，专注驾驶本身。' },
    { icon: Car, title: '全域驾驶辅助', copy: '多传感器融合感知周围环境，为城市和高速路段提供持续的安全辅助。' },
    { icon: LockKeyhole, title: '隐私优先', copy: '车辆数据按需使用，关键个人信息在设备端加密处理。' },
    { icon: RadioTower, title: '持续进化', copy: 'OTA 升级覆盖动力、座舱和安全能力，让车辆随着时间变得更好用。' },
    { icon: Gauge, title: '精准动力', copy: '电机响应细腻直接，平顺与性能由驾驶者自由选择。' },
  ];

  return (
    <WebsiteShell>
      <View className="mx-auto w-full max-w-[1440px]">
        <View className="bg-[#10181A] px-5 pb-20 pt-20 md:px-10 md:pb-28 md:pt-28">
          <SectionIntro eyebrow="EONRA INTELLIGENCE" title="把复杂藏起来，把从容留下来。" description="真正好的技术不会抢走注意力，它只会在你需要的时候，准确地出现。" />
          <View className="mt-14 min-h-[420px] overflow-hidden bg-[#172124]">
            <Image source={require('../../assets/website/cabin-tech.png')} resizeMode="cover" className="h-full w-full opacity-80" />
          </View>
        </View>
        <View className="bg-[#F4F7F6] px-5 py-20 md:px-10 md:py-28">
          <View className="flex-row flex-wrap gap-10 border-b border-[#CDD6D7] pb-14">
            <Spec light value="780 km" label="最长续航" />
            <Spec light value="15 min" label="补能 310 km" />
            <Spec light value="7×24" label="智能守护" />
            <Spec light value="OTA" label="持续进化" />
          </View>
          <View className="mt-14 flex-row flex-wrap gap-x-6 gap-y-12">
            {features.map(({ icon: Icon, title, copy }) => (
              <View key={title} className="min-w-[280px] flex-1 border-t border-[#CDD6D7] pt-5">
                <Icon size={24} color="#5E8990" strokeWidth={1.5} />
                <Text className="mt-7 text-xl font-semibold text-[#0A1012]">{title}</Text>
                <Text className="mt-3 max-w-[330px] text-sm leading-6 text-[#5C686B]">{copy}</Text>
              </View>
            ))}
          </View>
        </View>
      </View>
    </WebsiteShell>
  );
}

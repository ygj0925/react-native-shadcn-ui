import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { Link, usePathname } from 'expo-router';
import { ArrowUpRight, Menu, X } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View, type ScrollViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const navItems = [
  { label: '车型', href: '/website/models' },
  { label: '技术', href: '/website/technology' },
  { label: '品牌', href: '/website/brand' },
];

function WebsiteLink({ href, children, className }: { href: string; children: React.ReactNode; className?: string }) {
  return (
    <Link href={href as never} asChild>
      <Pressable className={className}>{children}</Pressable>
    </Link>
  );
}

export function WebsiteShell({ children, scrollProps }: { children: React.ReactNode; scrollProps?: ScrollViewProps }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = React.useState(false);

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-[#080A0B]">
      <ScrollView showsVerticalScrollIndicator={false} {...scrollProps}>
        <View className="relative overflow-hidden bg-[#080A0B]">
          <View className="mx-auto w-full max-w-[1440px] px-5 md:px-10">
            <View className="flex-row items-center justify-between border-b border-white/10 py-5">
              <WebsiteLink href="/website" className="flex-row items-center gap-3">
                <View className="h-8 w-8 items-center justify-center rounded-full border border-[#8FE9F4]">
                  <View className="h-2 w-2 rounded-full bg-[#8FE9F4]" />
                </View>
                <View>
                  <Text className="text-base font-bold tracking-[3px] text-white">EONRA</Text>
                  <Text className="text-[9px] tracking-[2px] text-white/45">ELECTRIC MOTION</Text>
                </View>
              </WebsiteLink>

              <View className="hidden flex-row items-center gap-8 md:flex">
                {navItems.map((item) => {
                  const active = pathname.startsWith(item.href);
                  return (
                    <WebsiteLink key={item.href} href={item.href} className="py-2">
                      <Text className={cn('text-sm', active ? 'text-white' : 'text-white/55')}>{item.label}</Text>
                    </WebsiteLink>
                  );
                })}
                <WebsiteLink href="/website/test-drive" className="rounded-full bg-[#DDFBFF] px-5 py-2.5">
                  <Text className="text-xs font-semibold text-[#0A1012]">预约试驾</Text>
                </WebsiteLink>
              </View>

              <Button variant="ghost" size="icon" className="md:hidden" onPress={() => setMenuOpen((value) => !value)}>
                {menuOpen ? <X size={20} color="#FFFFFF" /> : <Menu size={20} color="#FFFFFF" />}
              </Button>
            </View>

            {menuOpen ? (
              <View className="absolute left-5 right-5 top-[74px] z-20 gap-2 border border-white/10 bg-[#111618] p-4 shadow-2xl md:hidden">
                {navItems.map((item) => (
                  <WebsiteLink key={item.href} href={item.href} className="border-b border-white/10 py-3" >
                    <Text className="text-sm text-white">{item.label}</Text>
                  </WebsiteLink>
                ))}
                <WebsiteLink href="/website/test-drive" className="mt-2 flex-row items-center justify-between rounded-full bg-[#DDFBFF] px-4 py-3">
                  <Text className="text-sm font-semibold text-[#0A1012]">预约试驾</Text>
                  <ArrowUpRight size={16} color="#0A1012" />
                </WebsiteLink>
              </View>
            ) : null}
          </View>

          {children}

          <View className="mx-auto w-full max-w-[1440px] px-5 pb-8 pt-20 md:px-10">
            <View className="border-t border-white/10 pt-8 md:flex-row md:items-end md:justify-between">
              <View className="gap-3">
                <Text className="text-3xl font-bold tracking-[-1px] text-white">Move quietly.</Text>
                <Text className="max-w-[360px] text-sm leading-6 text-white/45">EONRA 让科技回到它本来的位置，安静地服务每一次出发。</Text>
              </View>
              <View className="mt-8 flex-row flex-wrap gap-x-6 gap-y-3 md:mt-0">
                <WebsiteLink href="/website/models"><Text className="text-sm text-white/60">车型</Text></WebsiteLink>
                <WebsiteLink href="/website/technology"><Text className="text-sm text-white/60">技术</Text></WebsiteLink>
                <WebsiteLink href="/website/test-drive"><Text className="text-sm text-white/60">预约试驾</Text></WebsiteLink>
                <WebsiteLink href="/website/contact"><Text className="text-sm text-white/60">联系我们</Text></WebsiteLink>
              </View>
            </View>
            <View className="mt-12 flex-row flex-wrap justify-between gap-3 border-t border-white/10 pt-5">
              <Text className="text-xs text-white/30">© 2026 EONRA Mobility</Text>
              <Text className="text-xs text-white/30">隐私政策　法律声明　Cookie 设置</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

export function SectionIntro({ eyebrow, title, description, light = false }: { eyebrow: string; title: string; description?: string; light?: boolean }) {
  return (
    <View className="max-w-2xl gap-4">
      <Text className={cn('text-xs font-semibold tracking-[2.5px]', light ? 'text-[#5E8990]' : 'text-[#8FE9F4]')}>{eyebrow}</Text>
      <Text className={cn('text-4xl font-bold leading-[1.05] tracking-[-1.5px] md:text-6xl', light ? 'text-[#0A1012]' : 'text-white')}>{title}</Text>
      {description ? <Text className={cn('max-w-xl text-base leading-7', light ? 'text-[#526064]' : 'text-white/55')}>{description}</Text> : null}
    </View>
  );
}

export function Spec({ value, label, light = false }: { value: string; label: string; light?: boolean }) {
  return (
    <View className="gap-1">
      <Text className={cn('text-2xl font-semibold tracking-[-0.5px] md:text-3xl', light ? 'text-[#0A1012]' : 'text-white')}>{value}</Text>
      <Text className={cn('text-xs', light ? 'text-[#6D797B]' : 'text-white/45')}>{label}</Text>
    </View>
  );
}

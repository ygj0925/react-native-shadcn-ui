import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import type { Vehicle } from '@/lib/website/catalog';
import { formatPrice } from '@/lib/website/catalog';
import { Link } from 'expo-router';
import { ArrowUpRight } from 'lucide-react-native';
import { Image, Pressable, View } from 'react-native';

export function VehicleCard({ vehicle, featured = false }: { vehicle: Vehicle; featured?: boolean }) {
  const trim = vehicle.trims[0];
  return (
    <Link href={`/website/models/${vehicle.slug}` as never} asChild>
      <Pressable className={featured ? 'min-w-[300px] flex-1 overflow-hidden bg-[#121719]' : 'min-w-[280px] flex-1 overflow-hidden border border-[#D9E1E2] bg-[#F8FAF9]'}>
        <View className={featured ? 'h-[230px] bg-[#1B2427]' : 'h-[210px] bg-[#E6EDEE]'}>
          <Image source={vehicle.image} resizeMode="cover" className="h-full w-full" />
        </View>
        <View className={featured ? 'gap-5 p-5' : 'gap-5 p-5'}>
          <View className="flex-row items-start justify-between gap-4">
            <View className="flex-1 gap-1">
              <Text className={featured ? 'text-xs tracking-[1.8px] text-[#8FE9F4]' : 'text-xs tracking-[1.8px] text-[#5E8990]'}>{vehicle.eyebrow}</Text>
              <Text className={featured ? 'text-2xl font-bold text-white' : 'text-2xl font-bold text-[#0A1012]'}>{vehicle.name}</Text>
            </View>
            <ArrowUpRight size={20} color={featured ? '#FFFFFF' : '#0A1012'} />
          </View>
          <Text className={featured ? 'text-sm text-white/55' : 'text-sm text-[#5C686B]'}>{vehicle.description}</Text>
          <View className="flex-row items-end justify-between border-t border-black/10 pt-4">
            <View className="gap-1">
              <Text className={featured ? 'text-xs text-white/40' : 'text-xs text-[#778285]'}>起售价</Text>
              <Text className={featured ? 'text-base font-semibold text-white' : 'text-base font-semibold text-[#0A1012]'}>{formatPrice(trim.price)}</Text>
            </View>
            <Button variant={featured ? 'glass' : 'outline'} size="sm" className={featured ? 'border-white/20 bg-white/10' : ''}>
              <Text className={featured ? 'text-xs text-white' : 'text-xs text-[#0A1012]'}>查看车型</Text>
            </Button>
          </View>
        </View>
      </Pressable>
    </Link>
  );
}

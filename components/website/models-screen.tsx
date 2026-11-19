import { Text } from '@/components/ui/text';
import { SectionIntro } from '@/components/website/website-shell';
import { VehicleCard } from '@/components/website/vehicle-card';
import { vehicles, type VehicleCategory } from '@/lib/website/catalog';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';
import { WebsiteShell } from './website-shell';

const filters: Array<{ id: VehicleCategory | 'all'; label: string }> = [
  { id: 'all', label: '全部车型' },
  { id: 'sedan', label: '轿车' },
  { id: 'suv', label: 'SUV' },
  { id: 'performance', label: '性能' },
];

export function ModelsScreen() {
  const [category, setCategory] = useState<VehicleCategory | 'all'>('all');
  const filtered = useMemo(() => category === 'all' ? vehicles : vehicles.filter((vehicle) => vehicle.category === category), [category]);

  return (
    <WebsiteShell>
      <View className="mx-auto w-full max-w-[1440px] bg-[#F4F7F6] px-5 pb-24 pt-20 md:px-10 md:pt-28">
        <SectionIntro light eyebrow="THE RANGE" title="找到与你的生活同频的 EONRA。" description="每一台 EONRA 都拥有相同的安静秩序，区别只在于你准备驶向哪里。" />
        <View className="mt-12 flex-row flex-wrap gap-2">
          {filters.map((filter) => {
            const active = category === filter.id;
            return (
              <Pressable key={filter.id} onPress={() => setCategory(filter.id)} className={active ? 'rounded-full bg-[#0A1012] px-5 py-3' : 'rounded-full border border-[#CDD6D7] px-5 py-3'}>
                <Text className={active ? 'text-sm text-white' : 'text-sm text-[#526064]'}>{filter.label}</Text>
              </Pressable>
            );
          })}
        </View>
        <View className="mt-10 flex-row flex-wrap gap-5">
          {filtered.map((vehicle, index) => <VehicleCard key={vehicle.slug} vehicle={vehicle} featured={index === 0 && category === 'all'} />)}
        </View>
      </View>
    </WebsiteShell>
  );
}

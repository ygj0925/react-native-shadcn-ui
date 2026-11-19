import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { formatPrice, getVehicle } from '@/lib/website/catalog';
import { Link, useLocalSearchParams } from 'expo-router';
import { ArrowLeft, Check, ChevronRight } from 'lucide-react-native';
import { useMemo, useState } from 'react';
import { Image, Pressable, View } from 'react-native';
import { WebsiteShell } from './website-shell';

function ChoiceRow({ title, value, options, selected, onSelect }: { title: string; value?: string; options: Array<{ id: string; name: string; price: number; swatch: string }>; selected: string; onSelect: (id: string) => void }) {
  return (
    <View className="gap-4 border-t border-[#CDD6D7] pt-5">
      <View className="flex-row items-end justify-between"><View className="gap-1"><Text className="text-xs tracking-[1.5px] text-[#5E8990]">{title}</Text><Text className="text-sm text-[#0A1012]">{value ?? options.find((item) => item.id === selected)?.name}</Text></View></View>
      <View className="flex-row flex-wrap gap-3">
        {options.map((option) => {
          const active = option.id === selected;
          return (
            <Pressable key={option.id} onPress={() => onSelect(option.id)} className={active ? 'min-w-[120px] border-2 border-[#0A1012] bg-white p-3' : 'min-w-[120px] border border-[#CDD6D7] bg-white p-3'}>
              <View className="flex-row items-center gap-2"><View className="h-5 w-5 rounded-full border border-black/15" style={{ backgroundColor: option.swatch }} />{active ? <Check size={14} color="#0A1012" /> : null}</View>
              <Text className="mt-3 text-xs text-[#0A1012]">{option.name}</Text>
              {option.price ? <Text className="mt-1 text-[10px] text-[#778285]">+{formatPrice(option.price)}</Text> : null}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

export function ConfiguratorScreen() {
  const params = useLocalSearchParams<{ vehicle?: string; trim?: string }>();
  const initialVehicle = getVehicle(typeof params.vehicle === 'string' ? params.vehicle : 's7');
  const [vehicleSlug, setVehicleSlug] = useState(initialVehicle.slug);
  const vehicle = getVehicle(vehicleSlug);
  const [trimId, setTrimId] = useState(typeof params.trim === 'string' ? params.trim : vehicle.trims[0].id);
  const [colorId, setColorId] = useState(vehicle.colors[0].id);
  const [interiorId, setInteriorId] = useState(vehicle.interiors[0].id);
  const [wheelId, setWheelId] = useState(vehicle.wheels[0].id);
  const trim = vehicle.trims.find((item) => item.id === trimId) ?? vehicle.trims[0];
  const selectedColor = vehicle.colors.find((item) => item.id === colorId) ?? vehicle.colors[0];
  const selectedInterior = vehicle.interiors.find((item) => item.id === interiorId) ?? vehicle.interiors[0];
  const selectedWheel = vehicle.wheels.find((item) => item.id === wheelId) ?? vehicle.wheels[0];
  const total = useMemo(() => trim.price + selectedColor.price + selectedInterior.price + selectedWheel.price, [trim, selectedColor, selectedInterior, selectedWheel]);

  const switchVehicle = (slug: string) => {
    const next = getVehicle(slug);
    setVehicleSlug(slug);
    setTrimId(next.trims[0].id);
    setColorId(next.colors[0].id);
    setInteriorId(next.interiors[0].id);
    setWheelId(next.wheels[0].id);
  };

  return (
    <WebsiteShell>
      <View className="mx-auto w-full max-w-[1440px] bg-[#F4F7F6] px-5 pb-24 pt-16 md:px-10 md:pt-24">
        <View className="flex-row items-center gap-3"><Link href={`/website/models/${vehicle.slug}` as never} asChild><Pressable><ArrowLeft size={16} color="#526064" /></Pressable></Link><Text className="text-sm text-[#526064]">返回 {vehicle.name}</Text></View>
        <View className="mt-8 gap-3"><Text className="text-xs font-semibold tracking-[2.5px] text-[#5E8990]">CONFIGURE YOUR EONRA</Text><Text className="text-5xl font-bold tracking-[-1.5px] text-[#0A1012] md:text-7xl">配置你的 {vehicle.name}</Text><Text className="max-w-xl text-base leading-7 text-[#5C686B]">选择你真正需要的版本、颜色和细节，实时查看配置结果。</Text></View>
        <View className="mt-12 flex-row flex-wrap gap-8">
          <View className="min-w-[320px] flex-1 gap-6">
            <View className="h-[300px] overflow-hidden bg-[#DCE4E5] md:h-[440px]"><Image source={vehicle.image} resizeMode="cover" className="h-full w-full" /></View>
            <View className="flex-row flex-wrap gap-2">
              {['s7', 'x5', 'gt'].map((slug) => <Pressable key={slug} onPress={() => switchVehicle(slug)} className={vehicle.slug === slug ? 'rounded-full bg-[#0A1012] px-4 py-2' : 'rounded-full border border-[#CDD6D7] px-4 py-2'}><Text className={vehicle.slug === slug ? 'text-xs text-white' : 'text-xs text-[#526064]'}>{slug.toUpperCase()}</Text></Pressable>)}
            </View>
          </View>
          <View className="min-w-[320px] flex-1 gap-8 bg-white p-5 md:p-8">
            <ChoiceRow title="版本" options={vehicle.trims.map((item) => ({ id: item.id, name: item.name, price: item.price - vehicle.trims[0].price, swatch: '#0A1012' }))} selected={trim.id} onSelect={setTrimId} />
            <ChoiceRow title="外观" options={vehicle.colors} selected={selectedColor.id} onSelect={setColorId} />
            <ChoiceRow title="内饰" options={vehicle.interiors} selected={selectedInterior.id} onSelect={setInteriorId} />
            <ChoiceRow title="轮毂" options={vehicle.wheels} selected={selectedWheel.id} onSelect={setWheelId} />
            <View className="border-t border-[#CDD6D7] pt-6"><View className="flex-row items-end justify-between"><View><Text className="text-xs text-[#778285]">预计价格</Text><Text className="mt-1 text-3xl font-bold text-[#0A1012]">{formatPrice(total)}</Text></View><Text className="text-xs text-[#778285]">不含购置税及保险</Text></View><Link href={`/website/test-drive?vehicle=${vehicle.slug}` as never} asChild><Button className="mt-6 h-12 rounded-full bg-[#0A1012]"><Text className="text-sm font-semibold text-white">预约试驾</Text><ChevronRight size={16} color="#FFFFFF" /></Button></Link></View>
          </View>
        </View>
      </View>
    </WebsiteShell>
  );
}

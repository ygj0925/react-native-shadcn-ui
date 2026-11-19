import type { ImageSourcePropType } from 'react-native';

export type VehicleCategory = 'sedan' | 'suv' | 'performance';

export type VehicleTrim = {
  id: string;
  name: string;
  price: number;
  range: number;
  power: number;
  acceleration: number;
  charging: string;
};

export type VehicleOption = {
  id: string;
  name: string;
  value: string;
  price: number;
  swatch: string;
};

export type Vehicle = {
  slug: string;
  name: string;
  eyebrow: string;
  category: VehicleCategory;
  description: string;
  image: ImageSourcePropType;
  accent: string;
  highlights: string[];
  trims: VehicleTrim[];
  colors: VehicleOption[];
  interiors: VehicleOption[];
  wheels: VehicleOption[];
};

export const vehicles: Vehicle[] = [
  {
    slug: 's7',
    name: 'EONRA S7',
    eyebrow: '旗舰智能轿车',
    category: 'sedan',
    description: '把安静的力量，交给每一次出发。',
    image: require('../../assets/website/hero-s7.png'),
    accent: '#8FE9F4',
    highlights: ['最高 780 km 续航', '3.9 s 零百加速', '800 V 超充架构'],
    trims: [
      { id: 's7-air', name: 'Air', price: 289800, range: 680, power: 310, acceleration: 5.2, charging: '15 分钟补能 310 km' },
      { id: 's7-pro', name: 'Pro', price: 339800, range: 780, power: 460, acceleration: 3.9, charging: '15 分钟补能 360 km' },
    ],
    colors: [
      { id: 'graphite', name: '石墨黑', value: 'Graphite', price: 0, swatch: '#14191D' },
      { id: 'moon-silver', name: '月影银', value: 'Moon Silver', price: 12000, swatch: '#B9C2C8' },
      { id: 'polar-white', name: '极地白', value: 'Polar White', price: 8000, swatch: '#EDEDEA' },
    ],
    interiors: [
      { id: 'obsidian', name: '曜石黑', value: 'Obsidian', price: 0, swatch: '#16191B' },
      { id: 'mist', name: '雾灰', value: 'Mist Grey', price: 6000, swatch: '#A8ABA9' },
    ],
    wheels: [
      { id: 'aero-19', name: '19 英寸 Aero', value: '19" Aero', price: 0, swatch: '#242B30' },
      { id: 'sport-21', name: '21 英寸 Sport', value: '21" Sport', price: 18000, swatch: '#090B0C' },
    ],
  },
  {
    slug: 'x5',
    name: 'EONRA X5',
    eyebrow: '城市智能 SUV',
    category: 'suv',
    description: '把城市的边界，留给更大的想象。',
    image: require('../../assets/website/x5-exterior.png'),
    accent: '#C5E9EA',
    highlights: ['最高 710 km 续航', '2,980 mm 轴距', '全景智能座舱'],
    trims: [
      { id: 'x5-core', name: 'Core', price: 319800, range: 610, power: 340, acceleration: 5.8, charging: '15 分钟补能 300 km' },
      { id: 'x5-max', name: 'Max', price: 389800, range: 710, power: 520, acceleration: 4.2, charging: '15 分钟补能 350 km' },
    ],
    colors: [
      { id: 'graphite', name: '石墨黑', value: 'Graphite', price: 0, swatch: '#14191D' },
      { id: 'ice-blue', name: '冰川蓝', value: 'Ice Blue', price: 12000, swatch: '#94C9D1' },
      { id: 'stone', name: '岩石灰', value: 'Stone Grey', price: 8000, swatch: '#777E80' },
    ],
    interiors: [
      { id: 'obsidian', name: '曜石黑', value: 'Obsidian', price: 0, swatch: '#16191B' },
      { id: 'sand', name: '沙砾灰', value: 'Sand Grey', price: 6000, swatch: '#C3C0B6' },
    ],
    wheels: [
      { id: 'aero-20', name: '20 英寸 Aero', value: '20" Aero', price: 0, swatch: '#242B30' },
      { id: 'touring-22', name: '22 英寸 Touring', value: '22" Touring', price: 18000, swatch: '#090B0C' },
    ],
  },
  {
    slug: 'gt',
    name: 'EONRA GT',
    eyebrow: '性能智能轿跑',
    category: 'performance',
    description: '每一条曲线，都为速度而生。',
    image: require('../../assets/website/hero-s7.png'),
    accent: '#B8F6FF',
    highlights: ['3.1 s 零百加速', '双电机四驱', '主动空气动力学'],
    trims: [
      { id: 'gt-performance', name: 'Performance', price: 459800, range: 620, power: 640, acceleration: 3.1, charging: '15 分钟补能 330 km' },
      { id: 'gt-signature', name: 'Signature', price: 529800, range: 650, power: 720, acceleration: 2.8, charging: '15 分钟补能 340 km' },
    ],
    colors: [
      { id: 'obsidian', name: '曜石黑', value: 'Obsidian', price: 0, swatch: '#101214' },
      { id: 'silver', name: '液态银', value: 'Liquid Silver', price: 16000, swatch: '#C8D0D4' },
      { id: 'cyan', name: '脉冲青', value: 'Pulse Cyan', price: 18000, swatch: '#63D6E7' },
    ],
    interiors: [
      { id: 'carbon', name: '碳纤黑', value: 'Carbon Black', price: 0, swatch: '#0F1112' },
      { id: 'contrast', name: '对比白', value: 'Contrast White', price: 10000, swatch: '#D8DAD7' },
    ],
    wheels: [
      { id: 'forged-21', name: '21 英寸 Forged', value: '21" Forged', price: 0, swatch: '#181C1F' },
      { id: 'track-22', name: '22 英寸 Track', value: '22" Track', price: 22000, swatch: '#090B0C' },
    ],
  },
];

export function getVehicle(slug: string) {
  return vehicles.find((vehicle) => vehicle.slug === slug) ?? vehicles[0];
}

export function formatPrice(value: number) {
  return `¥${value.toLocaleString('zh-CN')}`;
}

export function formatAcceleration(value: number) {
  return `${value.toFixed(1)} s`;
}

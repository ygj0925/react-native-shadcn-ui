import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';

type ProgressRingProps = {
  progress: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  showLabel?: boolean;
  className?: string;
};

export function ProgressRing({
  progress,
  size = 64,
  strokeWidth = 6,
  color = 'hsl(var(--primary))',
  trackColor = 'hsl(var(--muted))',
  showLabel = true,
  className,
}: ProgressRingProps) {
  const clamped = Math.max(0, Math.min(100, progress));
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clamped / 100) * circumference;

  return (
    <View className={cn('items-center justify-center', className)} style={{ width: size, height: size }}>
      <Svg width={size} height={size} style={{ position: 'absolute' }}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={trackColor}
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={color}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      {showLabel && (
        <Text className="text-[13px] font-semibold text-foreground">{Math.round(clamped)}%</Text>
      )}
    </View>
  );
}

import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import { THEME } from '@/lib/theme';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { View } from 'react-native';
import { BarChart } from 'react-native-gifted-charts';

type ChartPoint = {
  label: string;
  value: number;
};

type StatsChartProps = {
  title?: string;
  data: ChartPoint[];
  className?: string;
};

export function StatsChart({ title, data, className }: StatsChartProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const primary = isDark ? THEME.dark.primary : THEME.light.primary;

  const chartData = data.map((item) => ({
    value: item.value,
    label: item.label,
    frontColor: primary,
  }));

  return (
    <View className={cn('rounded-2xl border border-border bg-card p-4 gap-3', className)}>
      {title ? (
        <Text className="text-sm font-semibold text-foreground">{title}</Text>
      ) : null}

      {data.length === 0 ? (
        <View className="items-center justify-center py-8">
          <Text className="text-xs text-muted-foreground">暂无数据</Text>
        </View>
      ) : (
        <BarChart
          data={chartData}
          barWidth={20}
          spacing={14}
          roundedTop
          roundedBottom
          hideRules
          yAxisThickness={0}
          xAxisThickness={1}
          xAxisColor={isDark ? THEME.dark.border : THEME.light.border}
          yAxisTextStyle={{ color: isDark ? THEME.dark.mutedForeground : THEME.light.mutedForeground, fontSize: 10 }}
          xAxisLabelTextStyle={{ color: isDark ? THEME.dark.mutedForeground : THEME.light.mutedForeground, fontSize: 10 }}
          noOfSections={4}
          maxValue={100}
          height={140}
        />
      )}
    </View>
  );
}

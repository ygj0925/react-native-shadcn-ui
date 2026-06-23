import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { View } from 'react-native';

const WEEKDAY_LABELS = ['一', '二', '三', '四', '五', '六', '日'];

type WeeklyStatsProps = {
  days: { date: string; completed: number; total: number }[];
  completionRate: number;
  total: number;
  completed: number;
};

export function WeeklyStats({ days, completionRate, total, completed }: WeeklyStatsProps) {
  const maxValue = Math.max(1, ...days.map((d) => d.total));

  return (
    <Card className="border-border/60">
      <CardHeader className="px-4 py-4">
        <CardTitle className="text-[15px]">本周统计</CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4 gap-4">
        <View className="flex-row items-end justify-between gap-2 h-28 px-1">
          {days.map((day, index) => {
            const heightPercent = day.total === 0 ? 4 : Math.max(8, (day.total / maxValue) * 100);
            const completedPercent = day.total === 0 ? 0 : (day.completed / day.total) * 100;
            return (
              <View key={day.date} className="flex-1 items-center justify-end gap-1.5">
                <View className="w-full items-center justify-end" style={{ height: `${heightPercent}%`, minHeight: 4 }}>
                  <View
                    className={cn(
                      'w-full rounded-t-md',
                      day.total === 0 ? 'bg-muted' : 'bg-primary/20'
                    )}
                    style={{ height: '100%' }}>
                    {day.completed > 0 && (
                      <View
                        className="absolute bottom-0 left-0 right-0 rounded-t-md bg-primary"
                        style={{ height: `${completedPercent}%` }}
                      />
                    )}
                  </View>
                </View>
                <Text className="text-[10px] text-muted-foreground">{WEEKDAY_LABELS[index]}</Text>
              </View>
            );
          })}
        </View>

        <View className="flex-row items-center justify-between pt-2 border-t border-border/40">
          <View className="gap-0.5">
            <Text className="text-xs text-muted-foreground">任务完成率</Text>
            <Text className="text-xl font-bold text-foreground">{completionRate}%</Text>
          </View>
          <View className="items-end gap-0.5">
            <Text className="text-xs text-muted-foreground">
              {completed}/{total} 已完成
            </Text>
            <Text className="text-xs text-muted-foreground">本周任务</Text>
          </View>
        </View>
      </CardContent>
    </Card>
  );
}

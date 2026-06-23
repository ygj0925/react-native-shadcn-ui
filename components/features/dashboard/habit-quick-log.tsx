import { Text } from '@/components/ui/text';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import type { DashboardHabit } from '@/hooks/useDashboard';
import { Check, Flame } from 'lucide-react-native';
import { Pressable, View } from 'react-native';

type HabitQuickLogProps = {
  habits: DashboardHabit[];
  onToggle: (habitId: string) => void;
  onSeeAll: () => void;
};

export function HabitQuickLog({ habits, onToggle, onSeeAll }: HabitQuickLogProps) {
  const completedCount = habits.filter((h) => h.completed).length;

  return (
    <Card className="border-border/60">
      <CardHeader className="flex-row items-center justify-between px-4 py-4">
        <View className="gap-0.5">
          <CardTitle className="text-[15px]">习惯打卡</CardTitle>
          <Text className="text-xs text-muted-foreground">
            {habits.length === 0
              ? '今天没有需要打卡的习惯'
              : `${completedCount}/${habits.length} 已完成`}
          </Text>
        </View>
        <Pressable
          onPress={onSeeAll}
          className="flex-row items-center gap-1 px-2 py-1 rounded-lg bg-muted active:bg-accent">
          <Text className="text-xs text-muted-foreground">全部</Text>
          <Flame size={14} className="text-muted-foreground" />
        </Pressable>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        {habits.length === 0 ? (
          <View className="py-4 items-center">
            <Text className="text-sm text-muted-foreground">去习惯页面添加你的第一个习惯吧</Text>
          </View>
        ) : (
          <View className="flex-row flex-wrap gap-2">
            {habits.map(({ habit, completed }) => (
              <Pressable
                key={habit.id}
                onPress={() => onToggle(habit.id)}
                className={cn(
                  'flex-row items-center gap-1.5 px-3 py-2 rounded-full border active:opacity-80',
                  completed
                    ? 'bg-primary border-primary'
                    : 'bg-background border-border'
                )}>
                <Text className="text-base">{habit.icon}</Text>
                <Text
                  className={cn(
                    'text-[13px] font-medium',
                    completed ? 'text-primary-foreground' : 'text-foreground'
                  )}>
                  {habit.name}
                </Text>
                {completed && <Check size={12} className="text-primary-foreground" />}
              </Pressable>
            ))}
          </View>
        )}
      </CardContent>
    </Card>
  );
}

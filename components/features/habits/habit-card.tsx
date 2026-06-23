import { Text } from '@/components/ui/text';
import { cn } from '@/lib/utils';
import type { Habit, HabitLog } from '@/lib/store/habits';
import { Flame, Plus } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type HabitCardProps = {
  habit: Habit;
  todayLog?: HabitLog;
  streak: number;
  completionRate: number;
  onPress?: () => void;
  onToggle?: () => void;
  onLog?: () => void;
};

export function HabitCard({
  habit,
  todayLog,
  streak,
  completionRate,
  onPress,
  onToggle,
  onLog,
}: HabitCardProps) {
  const progress = Math.min((todayLog?.value ?? 0) / habit.targetValue, 1);
  const completed = progress >= 1;

  return (
    <Pressable
      onPress={onPress}
      className={cn(
        'rounded-2xl border border-border bg-card p-4 active:opacity-80',
        completed && 'border-primary/30 bg-primary/5'
      )}>
      <View className="flex-row items-center gap-3">
        <View
          className="h-12 w-12 items-center justify-center rounded-2xl"
          style={{ backgroundColor: habit.color }}>
          <Text className="text-2xl">{habit.icon}</Text>
        </View>

        <View className="flex-1 gap-1">
          <Text className="text-[15px] font-semibold text-foreground" numberOfLines={1}>
            {habit.name || '未命名习惯'}
          </Text>

          <View className="flex-row items-center gap-3">
            {streak > 0 ? (
              <View className="flex-row items-center gap-1">
                <Flame size={14} color="#f97316" />
                <Text className="text-xs font-medium text-orange-500">{streak} 天</Text>
              </View>
            ) : null}
            <Text className="text-xs text-muted-foreground">
              {todayLog?.value ?? 0}/{habit.targetValue} {habit.unit}
            </Text>
          </View>
        </View>

        <View className="flex-row items-center gap-2">
          {completionRate > 0 ? (
            <View className="rounded-full bg-muted px-2.5 py-1">
              <Text className="text-xs font-medium text-muted-foreground">{completionRate}%</Text>
            </View>
          ) : null}

          {habit.targetValue > 1 ? (
            <Pressable
              onPress={onLog}
              className="h-10 w-10 items-center justify-center rounded-full bg-primary">
              <Plus size={20} color="#fff" strokeWidth={2.5} />
            </Pressable>
          ) : (
            <Pressable
              onPress={onToggle}
              className={cn(
                'h-10 w-10 items-center justify-center rounded-full border-2',
                completed
                  ? 'border-primary bg-primary'
                  : 'border-border bg-background'
              )}>
              {completed ? (
                <Text className="text-lg text-primary-foreground">✓</Text>
              ) : null}
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

import { Text } from '@/components/ui/text';
import type { Habit, HabitLog } from '@/lib/store/habits';
import { isHabitDueOnDate, isLogCompleted } from '@/lib/store/habits';
import { cn } from '@/lib/utils';
import {
  startOfMonth,
  endOfMonth,
  addDays,
  isSameMonth,
  format,
} from 'date-fns';
import * as React from 'react';
import { Pressable, View } from 'react-native';

type StreakCalendarProps = {
  habit: Habit;
  logs: HabitLog[];
  month?: Date;
  onSelectDay?: (dateKey: string) => void;
};

const WEEKDAYS = ['一', '二', '三', '四', '五', '六', '日'];

function hslToHsla(color: string, alpha: number): string {
  const match = /hsl\(\s*([\d.]+)\s+([\d.]+)%?\s+([\d.]+)%?\s*\)/i.exec(color);
  if (!match) return color;
  const [, h, s, l] = match;
  return `hsla(${h} ${s}% ${l}% / ${alpha})`;
}

export function StreakCalendar({
  habit,
  logs,
  month = new Date(),
  onSelectDay,
}: StreakCalendarProps) {
  const logsByDate = React.useMemo(() => {
    const map = new Map<string, HabitLog>();
    for (const log of logs) map.set(log.date, log);
    return map;
  }, [logs]);

  const monthStart = startOfMonth(month);
  const monthEnd = endOfMonth(month);
  const calendarStart = addDays(monthStart, -((monthStart.getDay() + 6) % 7));

  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(addDays(calendarStart, i));
  }

  return (
    <View className="rounded-2xl border border-border bg-card p-4 gap-3">
      <View className="flex-row items-center justify-between">
        <Text className="text-sm font-semibold text-foreground">
          {format(month, 'yyyy年 M月')}
        </Text>
        <Text className="text-xs text-muted-foreground">
          连续 {habit.targetValue} {habit.unit} 为完成
        </Text>
      </View>

      <View className="flex-row justify-between px-1">
        {WEEKDAYS.map((label) => (
          <Text key={label} className="w-8 text-center text-xs text-muted-foreground">
            {label}
          </Text>
        ))}
      </View>

      <View className="flex-row flex-wrap justify-between gap-y-2">
        {days.map((day) => {
          const dateKey = day.toISOString().slice(0, 10);
          const inMonth = isSameMonth(day, month);
          const log = logsByDate.get(dateKey);
          const due = isHabitDueOnDate(habit, dateKey);
          const completed = isLogCompleted(habit, log);
          const ratio = Math.min((log?.value ?? 0) / habit.targetValue, 1);

          return (
            <Pressable
              key={dateKey}
              disabled={!onSelectDay || !inMonth}
              onPress={() => onSelectDay?.(dateKey)}
              className={cn(
                'h-8 w-8 items-center justify-center rounded-lg border',
                inMonth ? 'border-border' : 'border-transparent',
                completed && 'border-primary'
              )}
              style={
                inMonth && (ratio > 0 || completed)
                  ? { backgroundColor: hslToHsla(habit.color, 0.2 + ratio * 0.8) }
                  : undefined
              }>
              <Text
                className={cn(
                  'text-xs',
                  inMonth ? 'text-foreground' : 'text-transparent',
                  completed && 'font-semibold text-primary'
                )}>
                {format(day, 'd')}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

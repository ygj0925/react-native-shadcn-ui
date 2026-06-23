import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import type { Habit, HabitInput, HabitFrequency } from '@/lib/store/habits';
import { cn } from '@/lib/utils';
import * as React from 'react';
import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';

const FREQUENCY_OPTIONS: { label: string; value: HabitFrequency }[] = [
  { label: '每天', value: 'daily' },
  { label: '每周', value: 'weekly' },
  { label: '自定义', value: 'custom' },
];

const WEEKDAYS = [
  { label: '一', value: 1 },
  { label: '二', value: 2 },
  { label: '三', value: 3 },
  { label: '四', value: 4 },
  { label: '五', value: 5 },
  { label: '六', value: 6 },
  { label: '日', value: 7 },
];

const PRESET_COLORS = [
  'hsl(258 90% 66%)',
  'hsl(210 100% 56%)',
  'hsl(173 58% 39%)',
  'hsl(43 74% 66%)',
  'hsl(340 75% 55%)',
  'hsl(24 95% 53%)',
];

function normalizeTime(value: string) {
  const match = /^\d{1,2}:\d{2}$/.exec(value);
  if (!match) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (hours > 23 || minutes > 59) return null;
  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

type HabitFormProps = {
  habit?: Habit;
  onSave: (input: HabitInput) => void;
  onDelete?: () => void;
};

export function HabitForm({ habit, onSave, onDelete }: HabitFormProps) {
  const [name, setName] = React.useState(habit?.name ?? '');
  const [icon, setIcon] = React.useState(habit?.icon ?? '✅');
  const [color, setColor] = React.useState(habit?.color ?? PRESET_COLORS[0]);
  const [frequency, setFrequency] = React.useState<HabitFrequency>(habit?.frequency ?? 'daily');
  const [frequencyDays, setFrequencyDays] = React.useState<number[]>(habit?.frequencyDays ?? [1, 2, 3, 4, 5]);
  const [targetValue, setTargetValue] = React.useState(String(habit?.targetValue ?? 1));
  const [unit, setUnit] = React.useState(habit?.unit ?? '次');
  const [reminderTime, setReminderTime] = React.useState(habit?.reminderTime ?? '');
  const [isActive, setIsActive] = React.useState(habit?.isActive ?? true);

  const toggleDay = (day: number) => {
    setFrequencyDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day].sort()
    );
  };

  const handleSave = () => {
    if (!name.trim()) {
      Alert.alert('请填写习惯名称');
      return;
    }

    const normalizedReminder = reminderTime.trim() ? normalizeTime(reminderTime.trim()) : null;
    const target = parseInt(targetValue, 10) || 1;

    onSave({
      name: name.trim(),
      icon: icon.trim() || '✅',
      color,
      frequency,
      frequencyDays: frequency === 'daily' ? [] : frequencyDays,
      targetValue: Math.max(1, target),
      unit: unit.trim() || '次',
      reminderTime: normalizedReminder,
      isActive,
    });
  };

  return (
    <ScrollView className="flex-1 bg-background px-4 py-4">
      <View className="gap-4">
        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">名称</Text>
          <Input
            value={name}
            onChangeText={setName}
            placeholder="例如：喝水、阅读、运动"
            className="h-12 rounded-xl border-border bg-muted text-foreground"
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-2">
            <Text className="text-sm font-medium text-foreground">图标</Text>
            <Input
              value={icon}
              onChangeText={setIcon}
              placeholder="例如：💧"
              className="h-12 rounded-xl border-border bg-muted text-center text-foreground text-lg"
            />
          </View>
          <View className="flex-1 gap-2">
            <Text className="text-sm font-medium text-foreground">单位</Text>
            <Input
              value={unit}
              onChangeText={setUnit}
              placeholder="次 / 分钟 / 页"
              className="h-12 rounded-xl border-border bg-muted text-foreground"
            />
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">颜色</Text>
          <View className="flex-row flex-wrap gap-2">
            {PRESET_COLORS.map((c) => (
              <Pressable
                key={c}
                onPress={() => setColor(c)}
                className={cn(
                  'h-10 w-10 rounded-full border-2',
                  color === c ? 'border-foreground' : 'border-transparent'
                )}
                style={{ backgroundColor: c }}
              />
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">频率</Text>
          <View className="flex-row flex-wrap gap-2">
            {FREQUENCY_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setFrequency(option.value)}
                className={cn(
                  'rounded-full px-4 py-2',
                  frequency === option.value ? 'bg-primary' : 'bg-muted'
                )}>
                <Text
                  className={cn(
                    'text-xs font-medium',
                    frequency === option.value ? 'text-primary-foreground' : 'text-muted-foreground'
                  )}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        {frequency !== 'daily' ? (
          <View className="gap-2">
            <Text className="text-sm font-medium text-foreground">重复日期</Text>
            <View className="flex-row flex-wrap gap-2">
              {WEEKDAYS.map((day) => {
                const selected = frequencyDays.includes(day.value);
                return (
                  <Pressable
                    key={day.value}
                    onPress={() => toggleDay(day.value)}
                    className={cn(
                      'h-10 w-10 items-center justify-center rounded-full',
                      selected ? 'bg-primary' : 'bg-muted'
                    )}>
                    <Text
                      className={cn(
                        'text-xs font-medium',
                        selected ? 'text-primary-foreground' : 'text-muted-foreground'
                      )}>
                      {day.label}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        ) : null}

        <View className="flex-row gap-3">
          <View className="flex-1 gap-2">
            <Text className="text-sm font-medium text-foreground">目标值</Text>
            <Input
              value={targetValue}
              onChangeText={setTargetValue}
              keyboardType="number-pad"
              placeholder="1"
              className="h-12 rounded-xl border-border bg-muted text-foreground"
            />
          </View>
          <View className="flex-1 gap-2">
            <Text className="text-sm font-medium text-foreground">提醒时间</Text>
            <Input
              value={reminderTime}
              onChangeText={setReminderTime}
              placeholder="HH:MM"
              className="h-12 rounded-xl border-border bg-muted text-foreground"
            />
          </View>
        </View>

        <View className="flex-row items-center justify-between rounded-xl bg-muted px-4 py-3">
          <Text className="text-sm font-medium text-foreground">启用习惯</Text>
          <Switch value={isActive} onValueChange={setIsActive} />
        </View>

        <Button size="lg" className="h-13 rounded-xl bg-primary mt-2" onPress={handleSave}>
          <Text className="text-primary-foreground">保存</Text>
        </Button>

        {onDelete ? (
          <Button variant="ghost" className="rounded-xl" onPress={onDelete}>
            <Text className="text-destructive">删除习惯</Text>
          </Button>
        ) : null}
      </View>
    </ScrollView>
  );
}

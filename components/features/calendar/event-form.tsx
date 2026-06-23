import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import { Textarea } from '@/components/ui/textarea';
import type { CalendarEvent, CalendarEventInput } from '@/lib/store/calendar';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Alert, Pressable, ScrollView, Switch, View } from 'react-native';

const REMINDER_OPTIONS = [
  { label: '不提醒', value: 0 },
  { label: '15 分钟前', value: 15 },
  { label: '30 分钟前', value: 30 },
  { label: '1 小时前', value: 60 },
];

function pad(n: number) {
  return String(n).padStart(2, '0');
}

function toTimeInput(date: Date) {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function combineDateTime(date: string, time: string) {
  return new Date(`${date}T${time}:00`).toISOString();
}

function normalizeTime(value: string) {
  const match = /^\d{1,2}:\d{2}$/.exec(value);
  if (!match) return null;
  const [hours, minutes] = value.split(':').map(Number);
  if (hours > 23 || minutes > 59) return null;
  return `${pad(hours)}:${pad(minutes)}`;
}

type EventFormProps = {
  event?: CalendarEvent;
  selectedDate: string;
  onSave: (input: CalendarEventInput) => void;
  onDelete?: () => void;
};

export function EventForm({ event, selectedDate, onSave, onDelete }: EventFormProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const start = event ? new Date(event.startTime) : new Date(`${selectedDate}T09:00:00`);
  const end = event ? new Date(event.endTime) : new Date(`${selectedDate}T10:00:00`);

  const [title, setTitle] = React.useState(event?.title ?? '');
  const [description, setDescription] = React.useState(event?.description ?? '');
  const [date, setDate] = React.useState(selectedDate);
  const [startTime, setStartTime] = React.useState(toTimeInput(start));
  const [endTime, setEndTime] = React.useState(toTimeInput(end));
  const [location, setLocation] = React.useState(event?.location ?? '');
  const [isAllDay, setIsAllDay] = React.useState(event?.isAllDay ?? false);
  const [reminderMinutes, setReminderMinutes] = React.useState(event?.reminderMinutes ?? 15);

  const handleSave = () => {
    const normalizedStart = normalizeTime(startTime);
    const normalizedEnd = normalizeTime(endTime);

    if (!title.trim()) {
      Alert.alert('请填写事件名称');
      return;
    }

    if (!normalizedStart || !normalizedEnd) {
      Alert.alert('时间格式不正确');
      return;
    }

    const startIso = combineDateTime(date, normalizedStart);
    const endIso = combineDateTime(date, normalizedEnd);

    if (new Date(endIso) <= new Date(startIso)) {
      Alert.alert('结束时间必须晚于开始时间');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      location: location.trim(),
      startTime: startIso,
      endTime: endIso,
      isAllDay,
      reminderMinutes,
    });
  };

  return (
    <ScrollView className="flex-1 bg-background px-4 py-4">
      <View className="gap-4">
        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">标题</Text>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="事件名称"
            className="h-12 rounded-xl border-border bg-muted text-foreground"
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">备注</Text>
          <Textarea
            value={description}
            onChangeText={setDescription}
            placeholder="添加备注..."
            className="min-h-24 rounded-xl border-border bg-muted text-foreground"
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">日期</Text>
          <Input
            value={date}
            onChangeText={setDate}
            placeholder="YYYY-MM-DD"
            className="h-12 rounded-xl border-border bg-muted text-foreground"
          />
        </View>

        <View className="flex-row gap-3">
          <View className="flex-1 gap-2">
            <Text className="text-sm font-medium text-foreground">开始时间</Text>
            <Input
              value={startTime}
              onChangeText={setStartTime}
              placeholder="HH:MM"
              className="h-12 rounded-xl border-border bg-muted text-foreground"
            />
          </View>
          <View className="flex-1 gap-2">
            <Text className="text-sm font-medium text-foreground">结束时间</Text>
            <Input
              value={endTime}
              onChangeText={setEndTime}
              placeholder="HH:MM"
              className="h-12 rounded-xl border-border bg-muted text-foreground"
            />
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">地点</Text>
          <Input
            value={location}
            onChangeText={setLocation}
            placeholder="地点（可选）"
            className="h-12 rounded-xl border-border bg-muted text-foreground"
          />
        </View>

        <View className="flex-row items-center justify-between rounded-xl bg-muted px-4 py-3">
          <Text className="text-sm font-medium text-foreground">全天事件</Text>
          <Switch
            value={isAllDay}
            onValueChange={setIsAllDay}
            trackColor={{ false: isDark ? '#3f3f46' : '#e4e4e7', true: '#hsl(var(--primary))' }}
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">提醒</Text>
          <View className="flex-row flex-wrap gap-2">
            {REMINDER_OPTIONS.map((option) => (
              <Pressable
                key={option.value}
                onPress={() => setReminderMinutes(option.value)}
                className={`rounded-full px-4 py-2 ${
                  reminderMinutes === option.value ? 'bg-primary' : 'bg-muted'
                }`}>
                <Text
                  className={`text-xs font-medium ${
                    reminderMinutes === option.value ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}>
                  {option.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <Button size="lg" className="h-13 rounded-xl bg-primary mt-2" onPress={handleSave}>
          <Text className="text-primary-foreground">保存</Text>
        </Button>

        {onDelete ? (
          <Button variant="ghost" className="rounded-xl" onPress={onDelete}>
            <Text className="text-destructive">删除事件</Text>
          </Button>
        ) : null}
      </View>
    </ScrollView>
  );
}

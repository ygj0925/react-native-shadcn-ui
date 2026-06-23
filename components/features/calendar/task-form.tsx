import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Text } from '@/components/ui/text';
import type { CalendarEvent } from '@/lib/store/calendar';
import type { TaskInput, TaskPriority } from '@/lib/store/tasks';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Alert, Pressable, ScrollView, View } from 'react-native';

const PRIORITIES: { key: TaskPriority; label: string }[] = [
  { key: 'low', label: '低' },
  { key: 'medium', label: '中' },
  { key: 'high', label: '高' },
  { key: 'urgent', label: '紧急' },
];

type TaskFormProps = {
  events: CalendarEvent[];
  selectedDate: string;
  onSave: (input: TaskInput) => void;
  onCancel?: () => void;
};

export function TaskForm({ events, selectedDate, onSave, onCancel }: TaskFormProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [title, setTitle] = React.useState('');
  const [priority, setPriority] = React.useState<TaskPriority>('medium');
  const [dueTime, setDueTime] = React.useState('');
  const [calendarEventId, setCalendarEventId] = React.useState<string | null>(null);

  const dateEvents = React.useMemo(
    () => events.filter((e) => e.startTime.slice(0, 10) === selectedDate),
    [events, selectedDate]
  );

  const handleSave = () => {
    if (!title.trim()) {
      Alert.alert('请填写任务名称');
      return;
    }

    onSave({
      title: title.trim(),
      priority,
      dueDate: selectedDate,
      dueTime: dueTime.trim() || null,
      calendarEventId,
    });
  };

  return (
    <ScrollView className="flex-1 bg-background px-4 py-4">
      <View className="gap-4">
        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">任务名称</Text>
          <Input
            value={title}
            onChangeText={setTitle}
            placeholder="要做的事"
            className="h-12 rounded-xl border-border bg-muted text-foreground"
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">截止时间</Text>
          <Input
            value={dueTime}
            onChangeText={setDueTime}
            placeholder="HH:MM（可选）"
            className="h-12 rounded-xl border-border bg-muted text-foreground"
          />
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">优先级</Text>
          <View className="flex-row flex-wrap gap-2">
            {PRIORITIES.map((p) => (
              <Pressable
                key={p.key}
                onPress={() => setPriority(p.key)}
                className={`rounded-full px-4 py-2 ${
                  priority === p.key ? 'bg-primary' : 'bg-muted'
                }`}>
                <Text
                  className={`text-xs font-medium ${
                    priority === p.key ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}>
                  {p.label}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>

        <View className="gap-2">
          <Text className="text-sm font-medium text-foreground">关联日程（可选）</Text>
          {dateEvents.length === 0 ? (
            <Text className="text-xs text-muted-foreground">{selectedDate} 没有可关联的事件</Text>
          ) : (
            <View className="gap-2">
              <Pressable
                onPress={() => setCalendarEventId(null)}
                className={`rounded-xl px-4 py-3 ${
                  calendarEventId === null ? 'bg-primary' : 'bg-muted'
                }`}>
                <Text
                  className={`text-sm font-medium ${
                    calendarEventId === null ? 'text-primary-foreground' : 'text-muted-foreground'
                  }`}>
                  不关联
                </Text>
              </Pressable>
              {dateEvents.map((event) => (
                <Pressable
                  key={event.id}
                  onPress={() => setCalendarEventId(event.id)}
                  className={`rounded-xl px-4 py-3 ${
                    calendarEventId === event.id ? 'bg-primary' : 'bg-muted'
                  }`}>
                  <Text
                    className={`text-sm font-medium ${
                      calendarEventId === event.id ? 'text-primary-foreground' : 'text-foreground'
                    }`}
                    numberOfLines={1}>
                    {event.title || '无标题'}
                  </Text>
                  <Text
                    className={`text-xs ${
                      calendarEventId === event.id ? 'text-primary-foreground/70' : 'text-muted-foreground'
                    }`}>
                    {event.startTime.slice(11, 16)} - {event.endTime.slice(11, 16)}
                  </Text>
                </Pressable>
              ))}
            </View>
          )}
        </View>

        <Button size="lg" className="h-13 rounded-xl bg-primary mt-2" onPress={handleSave}>
          <Text className="text-primary-foreground">保存任务</Text>
        </Button>

        {onCancel ? (
          <Button variant="ghost" className="rounded-xl" onPress={onCancel}>
            <Text className="text-muted-foreground">取消</Text>
          </Button>
        ) : null}
      </View>
    </ScrollView>
  );
}

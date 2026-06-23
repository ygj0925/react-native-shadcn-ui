import { Text } from '@/components/ui/text';
import { EventCard } from '@/components/features/calendar/event-card';
import { TaskForm } from '@/components/features/calendar/task-form';
import { TaskItem } from '@/components/features/calendar/task-item';
import { useCalendar } from '@/hooks/useCalendar';
import { useTasks } from '@/hooks/useTasks';
import { cn } from '@/lib/utils';
import { THEME } from '@/lib/theme';
import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import { Plus } from 'lucide-react-native';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { Calendar } from 'react-native-calendars';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { OfflineBanner } from '@/components/features/shared/offline-banner';
import { FlashList } from '@shopify/flash-list';

export default function CalendarScreen() {
  const router = useRouter();
  const { colorScheme } = useColorScheme();
  const tint = THEME[colorScheme ?? 'light'];
  const isDark = colorScheme === 'dark';

  const {
    events,
    selectedDate,
    selectedEvents,
    setSelectedDate,
    updateEvent,
  } = useCalendar();

  const {
    getTasksForDate,
    createTask,
    markDone,
    markPending,
  } = useTasks();

  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const { checkAndConsume, PaywallComponent } = useFeatureGate('unlimited_tasks');

  const selectedTasks = React.useMemo(
    () => getTasksForDate(selectedDate),
    [getTasksForDate, selectedDate]
  );

  const markedDates = React.useMemo(() => {
    const map: Record<string, { dots?: Array<{ key: string; color: string }>; selected?: boolean; selectedColor?: string }> = {};

    events.forEach((event) => {
      const date = event.startTime.slice(0, 10);
      map[date] = {
        dots: [...(map[date]?.dots ?? []), { key: event.id, color: tint.primary }].slice(0, 3),
      };
    });

    map[selectedDate] = {
      ...(map[selectedDate] ?? {}),
      selected: true,
      selectedColor: tint.primary,
    };

    return map;
  }, [events, selectedDate, tint.primary]);

  const handleToggleTask = (id: string) => {
    const task = selectedTasks.find((t) => t.id === id);
    if (!task) return;
    if (task.status === 'done') {
      markPending(id);
    } else {
      markDone(id);
    }
  };

  const handleSaveTask = (input: Parameters<typeof createTask>[0]) => {
    if (!checkAndConsume({ title: '任务数量已达上限', description: '升级到 Pro 创建无限任务。' })) {
      return;
    }
    const task = createTask(input);
    if (task.calendarEventId) {
      updateEvent(task.calendarEventId, { taskId: task.id });
    }
    setShowTaskForm(false);
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <OfflineBanner />
      <ScrollView className="flex-1">
        <View className="px-4 pt-2 pb-3">
          <Text className="text-2xl font-bold text-foreground">日程</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            {events.length} 个事件 · {selectedTasks.length} 个任务
          </Text>
        </View>

        <View className="px-4">
          <Calendar
            current={selectedDate}
            markingType="multi-dot"
            markedDates={markedDates}
            onDayPress={(day) => {
              setSelectedDate(day.dateString);
              setShowTaskForm(false);
            }}
            theme={{
              calendarBackground: tint.card,
              textSectionTitleColor: tint.mutedForeground,
              dayTextColor: tint.foreground,
              textDisabledColor: tint.border,
              todayTextColor: tint.primary,
              selectedDayTextColor: tint.primaryForeground,
              textDayFontSize: 16,
              textDayHeaderFontSize: 13,
              textDayFontWeight: '500',
            }}
            style={{ borderRadius: 20 }}
          />
        </View>

        <View className="px-4 pt-4 pb-6 gap-3">
          <Text className="text-sm font-medium text-muted-foreground">
            {selectedDate} 的事件
          </Text>

          {selectedEvents.length === 0 ? (
            <View className="rounded-xl border border-dashed border-border bg-card px-5 py-10">
              <Text className="text-sm text-center text-muted-foreground">
                这一天还没有事件
              </Text>
            </View>
          ) : (
            selectedEvents.map((event) => (
              <EventCard
                key={event.id}
                event={event}
                onPress={() => router.push(`/event/${event.id}` as any)}
                onEdit={() => router.push(`/event/${event.id}` as any)}
              />
            ))
          )}
        </View>

        <View className="px-4 pb-6 gap-3">
          <View className="flex-row items-center justify-between">
            <Text className="text-sm font-medium text-muted-foreground">
              {selectedDate} 的任务
            </Text>
            <Pressable onPress={() => setShowTaskForm((v) => !v)}>
              <Text className="text-sm text-primary font-medium">
                {showTaskForm ? '取消' : '添加'}
              </Text>
            </Pressable>
          </View>

          {showTaskForm ? (
            <TaskForm
              events={events}
              selectedDate={selectedDate}
              onSave={handleSaveTask}
              onCancel={() => setShowTaskForm(false)}
            />
          ) : selectedTasks.length === 0 ? (
            <View className="rounded-xl border border-dashed border-border bg-card px-5 py-10">
              <Text className="text-sm text-center text-muted-foreground">
                这一天还没有任务
              </Text>
            </View>
          ) : (
            <View className="h-64">
              <FlashList
                data={selectedTasks}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <TaskItem task={item} onToggle={handleToggleTask} />
                )}
                contentContainerStyle={{ paddingVertical: 4 }}
              />
            </View>
          )}
        </View>
      </ScrollView>

      <PaywallComponent compact />

      <Pressable
        onPress={() => router.push('/event/new' as any)}
        className={cn(
          'absolute bottom-6 right-6 w-14 h-14 items-center justify-center rounded-full shadow-lg',
          isDark ? 'bg-primary shadow-primary/20' : 'bg-foreground shadow-foreground/20'
        )}
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <Plus size={24} color={isDark ? '#000' : '#fff'} strokeWidth={2.5} />
      </Pressable>
    </SafeAreaView>
  );
}

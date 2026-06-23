import { Button } from '@/components/ui/button';
import { Text } from '@/components/ui/text';
import { HabitCard } from '@/components/features/habits/habit-card';
import { HabitForm } from '@/components/features/habits/habit-form';
import { HabitLogModal } from '@/components/features/habits/habit-log-modal';
import { StatsChart } from '@/components/features/habits/stats-chart';
import { StreakCalendar } from '@/components/features/habits/streak-calendar';
import { useHabits, useHabit } from '@/hooks/useHabits';
import type { HabitInput } from '@/lib/store/habits';
import { cn } from '@/lib/utils';
import { THEME } from '@/lib/theme';
import { format, subDays } from 'date-fns';
import { Plus, X } from 'lucide-react-native';
import { useColorScheme } from 'nativewind';
import * as React from 'react';
import { Modal, Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { OfflineBanner } from '@/components/features/shared/offline-banner';

function todayKey() {
  return new Date().toISOString().slice(0, 10);
}

function useWeeklyChartData() {
  const { activeHabits, getHabitsDueOnDate, getLogForDate } = useHabits();

  return React.useMemo(() => {
    const today = new Date();
    const data: { label: string; value: number }[] = [];

    for (let i = 6; i >= 0; i--) {
      const d = subDays(today, i);
      const key = d.toISOString().slice(0, 10);
      const due = activeHabits.filter((h) => getHabitsDueOnDate(key).some((dh) => dh.id === h.id));
      const completed = due.filter((h) => {
        const log = getLogForDate(h.id, key);
        return !!log && log.value >= h.targetValue;
      });

      data.push({
        label: format(d, 'MM/dd'),
        value: due.length === 0 ? 0 : Math.round((completed.length / due.length) * 100),
      });
    }

    return data;
  }, [activeHabits, getHabitsDueOnDate, getLogForDate]);
}

function HabitDetail({
  habitId,
  onEdit,
  onClose,
}: {
  habitId: string;
  onEdit: (habit: NonNullable<ReturnType<typeof useHabit>['habit']>) => void;
  onClose: () => void;
}) {
  const { habit, logs, getCurrentStreak, getCompletionRate } = useHabit(habitId);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  if (!habit) return null;

  return (
    <ScrollView className="flex-1 px-4 py-4">
      <View className="gap-4">
        <View className="flex-row items-center gap-3">
          <View
            className="h-14 w-14 items-center justify-center rounded-2xl"
            style={{ backgroundColor: habit.color }}>
            <Text className="text-3xl">{habit.icon}</Text>
          </View>
          <View className="flex-1">
            <Text className="text-xl font-semibold text-foreground">{habit.name}</Text>
            <Text className="text-sm text-muted-foreground">
              连续 {getCurrentStreak()} 天 · 近7天完成率 {getCompletionRate()}%
            </Text>
          </View>
        </View>

        <StreakCalendar habit={habit} logs={logs} />

        <View className="flex-row gap-3">
          <Button variant="outline" className="flex-1 rounded-xl" onPress={onClose}>
            <Text>关闭</Text>
          </Button>
          <Button
            className="flex-1 rounded-xl bg-primary"
            onPress={() => {
              onClose();
              onEdit(habit);
            }}>
            <Text className="text-primary-foreground">编辑习惯</Text>
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

export default function HabitsScreen() {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const tint = THEME[colorScheme ?? 'light'];

  const {
    habits,
    activeHabits,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleLogComplete,
    logHabit,
    getLogForDate,
    getCurrentStreak,
    getCompletionRate,
  } = useHabits();

  const weeklyData = useWeeklyChartData();

  const [formVisible, setFormVisible] = React.useState(false);
  const [editingHabit, setEditingHabit] = React.useState<ReturnType<typeof useHabit>['habit']>(undefined);

  const [logVisible, setLogVisible] = React.useState(false);
  const [loggingHabit, setLoggingHabit] = React.useState<ReturnType<typeof useHabit>['habit']>(undefined);

  const [detailHabit, setDetailHabit] = React.useState<ReturnType<typeof useHabit>['habit']>(undefined);

  const { checkAndConsume, PaywallComponent } = useFeatureGate('unlimited_habits');

  const handleOpenNew = () => {
    if (!checkAndConsume({ title: '习惯数量已达上限', description: '升级到 Pro 追踪无限习惯。' })) {
      return;
    }
    setEditingHabit(undefined);
    setFormVisible(true);
  };

  const handleOpenEdit = (habit: NonNullable<typeof editingHabit>) => {
    setEditingHabit(habit);
    setFormVisible(true);
  };

  const handleSaveHabit = (input: HabitInput) => {
    if (editingHabit) {
      updateHabit(editingHabit.id, input);
    } else {
      createHabit(input);
    }
    setFormVisible(false);
  };

  const handleOpenLog = (habit: NonNullable<typeof loggingHabit>) => {
    setLoggingHabit(habit);
    setLogVisible(true);
  };

  const handleSaveLog = (value: number, note: string) => {
    if (loggingHabit) {
      logHabit(loggingHabit.id, { date: todayKey(), value, note });
    }
  };

  const handleDeleteHabit = () => {
    if (editingHabit) {
      deleteHabit(editingHabit.id);
      setFormVisible(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <OfflineBanner />
      <ScrollView className="flex-1">
        <View className="px-4 pt-2 pb-3">
          <Text className="text-2xl font-bold text-foreground">习惯</Text>
          <Text className="text-xs text-muted-foreground mt-0.5">
            {activeHabits.length} 个活跃习惯 · 本周完成率平均{' '}
            {weeklyData.length > 0
              ? Math.round(weeklyData.reduce((a, b) => a + b.value, 0) / weeklyData.length)
              : 0}
            %
          </Text>
        </View>

        <View className="px-4 gap-3">
          <StatsChart title="本周完成率" data={weeklyData} />

          <Text className="text-sm font-medium text-muted-foreground mt-1">今日习惯</Text>

          {activeHabits.length === 0 ? (
            <View className="rounded-xl border border-dashed border-border bg-card px-5 py-10">
              <Text className="text-sm text-center text-muted-foreground">还没有习惯，点击下方按钮添加</Text>
            </View>
          ) : (
            activeHabits.map((habit) => {
              const todayLog = getLogForDate(habit.id, todayKey());
              return (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  todayLog={todayLog}
                  streak={getCurrentStreak(habit.id)}
                  completionRate={getCompletionRate(habit.id)}
                  onPress={() => setDetailHabit(habit)}
                  onToggle={() => toggleLogComplete(habit.id)}
                  onLog={() => handleOpenLog(habit)}
                />
              );
            })
          )}
        </View>

        <View className="h-24" />
      </ScrollView>

      <Pressable
        onPress={handleOpenNew}
        className={cn(
          'absolute bottom-6 right-6 w-14 h-14 items-center justify-center rounded-full shadow-lg',
          isDark ? 'bg-primary shadow-primary/20' : 'bg-foreground shadow-foreground/20'
        )}
        style={{ boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <Plus size={24} color={isDark ? '#000' : '#fff'} strokeWidth={2.5} />
      </Pressable>

      <Modal
        visible={formVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setFormVisible(false)}>
        <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
          <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
            <Text className="text-lg font-semibold text-foreground">
              {editingHabit ? '编辑习惯' : '新建习惯'}
            </Text>
            <Button variant="ghost" size="icon" onPress={() => setFormVisible(false)}>
              <X size={20} color={tint.foreground} strokeWidth={2} />
            </Button>
          </View>
          <HabitForm
            habit={editingHabit}
            onSave={handleSaveHabit}
            onDelete={editingHabit ? handleDeleteHabit : undefined}
          />
        </SafeAreaView>
      </Modal>

      <HabitLogModal
        visible={logVisible}
        habit={loggingHabit}
        existingLog={loggingHabit ? getLogForDate(loggingHabit.id, todayKey()) : undefined}
        date={todayKey()}
        onClose={() => setLogVisible(false)}
        onSave={handleSaveLog}
      />

      <Modal
        visible={!!detailHabit}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setDetailHabit(undefined)}>
        <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
          <View className="flex-row items-center justify-between border-b border-border px-4 py-3">
            <Text className="text-lg font-semibold text-foreground">习惯详情</Text>
            <Button variant="ghost" size="icon" onPress={() => setDetailHabit(undefined)}>
              <X size={20} color={tint.foreground} strokeWidth={2} />
            </Button>
          </View>

          {detailHabit ? (
            <HabitDetail
              habitId={detailHabit.id}
              onEdit={(habit) => {
                setDetailHabit(undefined);
                handleOpenEdit(habit);
              }}
              onClose={() => setDetailHabit(undefined)}
            />
          ) : null}
        </SafeAreaView>
      </Modal>

      <PaywallComponent compact />
    </SafeAreaView>
  );
}

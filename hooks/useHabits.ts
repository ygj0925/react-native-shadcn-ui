import { useCallback, useMemo } from 'react';
import {
  useHabitsStore,
  type Habit,
  type HabitInput,
  type HabitLog,
  type HabitLogInput,
} from '@/lib/store/habits';

export function useHabits() {
  const habits = useHabitsStore((s) => s.habits);
  const logs = useHabitsStore((s) => s.logs);
  const createHabit = useHabitsStore((s) => s.createHabit);
  const updateHabit = useHabitsStore((s) => s.updateHabit);
  const deleteHabit = useHabitsStore((s) => s.deleteHabit);
  const toggleActive = useHabitsStore((s) => s.toggleActive);
  const logHabit = useHabitsStore((s) => s.logHabit);
  const updateLog = useHabitsStore((s) => s.updateLog);
  const deleteLog = useHabitsStore((s) => s.deleteLog);
  const toggleLogComplete = useHabitsStore((s) => s.toggleLogComplete);
  const getTodayHabits = useHabitsStore((s) => s.getTodayHabits);
  const getHabitsDueOnDate = useHabitsStore((s) => s.getHabitsDueOnDate);
  const getCurrentStreak = useHabitsStore((s) => s.getCurrentStreak);
  const getCompletionRate = useHabitsStore((s) => s.getCompletionRate);
  const getLogForDate = useHabitsStore((s) => s.getLogForDate);

  const todayHabits = useMemo(() => getTodayHabits(), [getTodayHabits, habits, logs]);
  const activeHabits = useMemo(() => habits.filter((h) => h.isActive), [habits]);

  const handleCreateHabit = useCallback(
    (input?: HabitInput) => createHabit(input),
    [createHabit]
  );

  const handleUpdateHabit = useCallback(
    (id: string, input: HabitInput) => updateHabit(id, input),
    [updateHabit]
  );

  const handleDeleteHabit = useCallback(
    (id: string) => deleteHabit(id),
    [deleteHabit]
  );

  const handleLog = useCallback(
    (habitId: string, input?: HabitLogInput) => logHabit(habitId, input),
    [logHabit]
  );

  return {
    habits,
    activeHabits,
    todayHabits,
    createHabit: handleCreateHabit,
    updateHabit: handleUpdateHabit,
    deleteHabit: handleDeleteHabit,
    toggleActive,
    logHabit: handleLog,
    updateLog,
    deleteLog,
    toggleLogComplete,
    getHabitsDueOnDate,
    getCurrentStreak,
    getCompletionRate,
    getLogForDate,
  };
}

export function useHabit(id: string) {
  const habit = useHabitsStore((s) => s.getHabitById(id));
  const logs = useHabitsStore((s) => s.getLogsForHabit(id));
  const updateHabit = useHabitsStore((s) => s.updateHabit);
  const deleteHabit = useHabitsStore((s) => s.deleteHabit);
  const toggleActive = useHabitsStore((s) => s.toggleActive);
  const logHabit = useHabitsStore((s) => s.logHabit);
  const updateLog = useHabitsStore((s) => s.updateLog);
  const deleteLog = useHabitsStore((s) => s.deleteLog);
  const toggleLogComplete = useHabitsStore((s) => s.toggleLogComplete);
  const getLogForDate = useHabitsStore((s) => s.getLogForDate);
  const getCurrentStreak = useHabitsStore((s) => s.getCurrentStreak);
  const getCompletionRate = useHabitsStore((s) => s.getCompletionRate);

  const update = useCallback(
    (input: HabitInput) => {
      updateHabit(id, input);
    },
    [id, updateHabit]
  );

  const remove = useCallback(() => {
    deleteHabit(id);
  }, [id, deleteHabit]);

  const log = useCallback(
    (input?: HabitLogInput) => {
      logHabit(id, input);
    },
    [id, logHabit]
  );

  return {
    habit,
    logs,
    update,
    remove,
    toggleActive: () => toggleActive(id),
    log,
    updateLog,
    deleteLog,
    toggleLogComplete: (dateKey?: string) => toggleLogComplete(id, dateKey),
    getLogForDate: (dateKey: string) => getLogForDate(id, dateKey),
    getCurrentStreak: () => getCurrentStreak(id),
    getCompletionRate: (days?: number) => getCompletionRate(id, days),
  };
}

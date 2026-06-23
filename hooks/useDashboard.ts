import { useCallback, useMemo } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { useTasksStore, type Task } from '@/lib/store/tasks';
import { useCalendarStore, type CalendarEvent } from '@/lib/store/calendar';
import {
  useHabitsStore,
  type Habit,
  type HabitLog,
  isHabitDueOnDate,
  isLogCompleted,
} from '@/lib/store/habits';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 11) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

export type DashboardHabit = {
  habit: Habit;
  log: HabitLog | undefined;
  completed: boolean;
};

export type DashboardStats = {
  totalTasks: number;
  completedTasks: number;
  completionRate: number;
  overdueTasks: number;
  todayEvents: number;
  habitsDue: number;
  habitsDone: number;
};

export function useDashboard() {
  const profile = useAuthStore((s) => s.profile);
  const tasks = useTasksStore((s) => s.tasks);
  const events = useCalendarStore((s) => s.events);
  const habits = useHabitsStore((s) => s.habits);
  const logs = useHabitsStore((s) => s.logs);
  const markDone = useTasksStore((s) => s.markDone);
  const markPending = useTasksStore((s) => s.markPending);
  const toggleLogComplete = useHabitsStore((s) => s.toggleLogComplete);
  const getTasksForDate = useTasksStore((s) => s.getTasksForDate);
  const getEventsForDate = useCalendarStore((s) => s.getEventsForDate);
  const getOverdueTasks = useTasksStore((s) => s.getOverdueTasks);

  const today = todayKey();
  const userName = profile?.display_name ?? '用户';
  const timeGreeting = getTimeOfDayGreeting();

  const todayTasks = useMemo(() => getTasksForDate(today), [getTasksForDate, today, tasks]);
  const todayEvents = useMemo(
    () => getEventsForDate(today),
    [getEventsForDate, today, events]
  );
  const overdueTasks = useMemo(() => getOverdueTasks(), [getOverdueTasks, tasks]);

  const dashboardHabits = useMemo<DashboardHabit[]>(() => {
    const getLogForDate = useHabitsStore.getState().getLogForDate;
    return habits
      .filter((habit) => isHabitDueOnDate(habit, today))
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .map((habit) => {
        const log = getLogForDate(habit.id, today);
        return { habit, log, completed: isLogCompleted(habit, log) };
      });
  }, [habits, logs, today]);

  const stats = useMemo<DashboardStats>(() => {
    const completedTasks = todayTasks.filter((t) => t.status === 'done').length;
    const habitsDone = dashboardHabits.filter((h) => h.completed).length;
    return {
      totalTasks: todayTasks.length,
      completedTasks,
      completionRate: todayTasks.length === 0 ? 0 : Math.round((completedTasks / todayTasks.length) * 100),
      overdueTasks: overdueTasks.length,
      todayEvents: todayEvents.length,
      habitsDue: dashboardHabits.length,
      habitsDone,
    };
  }, [todayTasks, todayEvents, overdueTasks, dashboardHabits]);

  const weeklyStats = useMemo(() => {
    const todayDate = new Date(`${today}T00:00:00`);
    const weekStart = new Date(todayDate);
    weekStart.setDate(todayDate.getDate() - ((todayDate.getDay() + 6) % 7));

    const days: { date: string; completed: number; total: number }[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const dateKey = d.toISOString().slice(0, 10);
      const dayTasks = tasks.filter((t) => t.dueDate === dateKey);
      days.push({
        date: dateKey,
        completed: dayTasks.filter((t) => t.status === 'done').length,
        total: dayTasks.length,
      });
    }

    const weeklyTotal = days.reduce((sum, d) => sum + d.total, 0);
    const weeklyCompleted = days.reduce((sum, d) => sum + d.completed, 0);

    return {
      days,
      completionRate: weeklyTotal === 0 ? 0 : Math.round((weeklyCompleted / weeklyTotal) * 100),
      total: weeklyTotal,
      completed: weeklyCompleted,
    };
  }, [tasks, today]);

  const toggleTaskStatus = useCallback(
    (task: Task) => {
      if (task.status === 'done') {
        markPending(task.id);
      } else {
        markDone(task.id);
      }
    },
    [markDone, markPending]
  );

  const toggleHabit = useCallback(
    (habitId: string) => {
      toggleLogComplete(habitId, today);
    },
    [toggleLogComplete, today]
  );

  return {
    userName,
    timeGreeting,
    today,
    todayTasks,
    todayEvents,
    overdueTasks,
    dashboardHabits,
    stats,
    weeklyStats,
    toggleTaskStatus,
    toggleHabit,
  };
}

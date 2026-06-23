import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/auth';
import type { Habit, HabitLog } from '@/lib/store/habits';
import { enqueue } from './queue';
import type { SyncOperation } from './queue';

export function mapHabitToRemote(habit: Habit): Record<string, any> {
  return {
    id: habit.id,
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    frequency: habit.frequency,
    frequency_days: habit.frequencyDays,
    target_value: habit.targetValue,
    unit: habit.unit,
    reminder_time: habit.reminderTime,
    is_active: habit.isActive,
    sort_order: habit.sortOrder,
    created_at: habit.createdAt,
    updated_at: habit.updatedAt,
  };
}

export function mapRemoteToHabit(remote: any): Habit {
  return {
    id: remote.id,
    name: remote.name ?? '',
    icon: remote.icon ?? '✅',
    color: remote.color ?? 'hsl(var(--primary))',
    frequency: remote.frequency ?? 'daily',
    frequencyDays: Array.isArray(remote.frequency_days) ? remote.frequency_days : [],
    targetValue: remote.target_value ?? 1,
    unit: remote.unit ?? '次',
    reminderTime: remote.reminder_time ?? null,
    isActive: remote.is_active ?? true,
    sortOrder: remote.sort_order ?? 0,
    createdAt: remote.created_at,
    updatedAt: remote.updated_at,
  };
}

export function mapHabitLogToRemote(log: HabitLog): Record<string, any> {
  return {
    id: log.id,
    habit_id: log.habitId,
    date: log.date,
    value: log.value,
    note: log.note,
    created_at: log.createdAt,
  };
}

export function mapRemoteToHabitLog(remote: any): HabitLog {
  return {
    id: remote.id,
    habitId: remote.habit_id,
    date: remote.date,
    value: remote.value ?? 1,
    note: remote.note ?? '',
    createdAt: remote.created_at,
  };
}

export function queueHabitOperation(habit: Habit, action: SyncOperation['action']) {
  const user = useAuthStore.getState().user;
  if (!user) return;

  enqueue({
    table: 'habits',
    action,
    recordId: habit.id,
    data: { ...mapHabitToRemote(habit), user_id: user.id },
  });
}

export function queueHabitLogOperation(log: HabitLog, action: SyncOperation['action']) {
  const user = useAuthStore.getState().user;
  if (!user) return;

  enqueue({
    table: 'habit_logs',
    action,
    recordId: log.id,
    data: { ...mapHabitLogToRemote(log), user_id: user.id },
  });
}

export async function pullHabits(userId: string, since?: string): Promise<Habit[]> {
  let query = supabase
    .from('habits')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (since) {
    query = query.gt('updated_at', since);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRemoteToHabit);
}

export async function pullHabitLogs(userId: string, since?: string): Promise<HabitLog[]> {
  let query = supabase
    .from('habit_logs')
    .select('*')
    .eq('user_id', userId)
    .order('date', { ascending: false });

  if (since) {
    query = query.gt('created_at', since);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRemoteToHabitLog);
}

export async function syncHabits(
  userId: string,
  since?: string
): Promise<{ habits: Habit[]; logs: HabitLog[] }> {
  const { syncPendingOperations } = await import('./engine');
  await syncPendingOperations();

  const [habits, logs] = await Promise.all([
    pullHabits(userId, since),
    pullHabitLogs(userId, since),
  ]);

  return { habits, logs };
}

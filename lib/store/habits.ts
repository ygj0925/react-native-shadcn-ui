import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '@/lib/storage';
import { queueHabitOperation, queueHabitLogOperation } from '@/lib/sync/habits';

// ─── Types ────────────────────────────────────────────────────────────────

export type HabitFrequency = 'daily' | 'weekly' | 'custom';

export type Habit = {
  id: string;
  name: string;
  icon: string;
  color: string;
  frequency: HabitFrequency;
  frequencyDays: number[]; // 1=Mon ... 7=Sun
  targetValue: number;
  unit: string;
  reminderTime: string | null; // HH:MM
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
};

export type HabitInput = {
  name?: string;
  icon?: string;
  color?: string;
  frequency?: HabitFrequency;
  frequencyDays?: number[];
  targetValue?: number;
  unit?: string;
  reminderTime?: string | null;
  isActive?: boolean;
  sortOrder?: number;
};

export type HabitLog = {
  id: string;
  habitId: string;
  date: string; // YYYY-MM-DD
  value: number;
  note: string;
  createdAt: string;
};

export type HabitLogInput = {
  value?: number;
  note?: string;
  date?: string;
};

// ─── Storage adapter ──────────────────────────────────────────────────────

const zustandStorage = {
  getItem: (key: string) => {
    const value = getItem<unknown>(key);
    return JSON.stringify(value);
  },
  setItem: (key: string, value: string) => {
    setItem(key, JSON.parse(value));
  },
  removeItem,
};

// ─── Helpers ──────────────────────────────────────────────────────────────

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

function todayKey(): string {
  return now().slice(0, 10);
}

function dateToWeekday(dateKey: string): number {
  const date = new Date(`${dateKey}T00:00:00`);
  // JS: 0=Sun, 6=Sat. Convert to 1=Mon ... 7=Sun.
  return ((date.getDay() + 6) % 7) + 1;
}

export function isHabitDueOnDate(habit: Habit, dateKey: string): boolean {
  if (!habit.isActive) return false;
  if (habit.frequency === 'daily') return true;
  return habit.frequencyDays.includes(dateToWeekday(dateKey));
}

export function isLogCompleted(habit: Habit, log?: HabitLog): boolean {
  if (!log) return false;
  return log.value >= habit.targetValue;
}

// ─── Store ────────────────────────────────────────────────────────────────

type HabitsState = {
  habits: Habit[];
  logs: HabitLog[];
  lastSyncAt: string | null;

  // Sync
  setLastSyncAt: (at: string | null) => void;
  mergeRemoteHabits: (remoteHabits: Habit[]) => void;
  mergeRemoteLogs: (remoteLogs: HabitLog[]) => void;

  // CRUD habits
  createHabit: (input?: HabitInput) => Habit;
  updateHabit: (id: string, input: HabitInput) => void;
  deleteHabit: (id: string) => void;
  toggleActive: (id: string) => void;

  // CRUD logs
  logHabit: (habitId: string, input?: HabitLogInput) => HabitLog;
  updateLog: (id: string, input: HabitLogInput) => void;
  deleteLog: (id: string) => void;
  toggleLogComplete: (habitId: string, dateKey?: string) => void;

  // Selectors
  getHabitById: (id: string) => Habit | undefined;
  getLogsForHabit: (habitId: string) => HabitLog[];
  getLogForDate: (habitId: string, dateKey: string) => HabitLog | undefined;
  getTodayHabits: () => Habit[];
  getHabitsDueOnDate: (dateKey: string) => Habit[];
  getCompletedDates: (habitId: string) => string[];
  getCurrentStreak: (habitId: string) => number;
  getCompletionRate: (habitId: string, days?: number) => number;
};

export const useHabitsStore = create<HabitsState>()(
  persist(
    (set, get) => ({
      habits: [],
      logs: [],
      lastSyncAt: null,

      setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),

      createHabit: (input) => {
        const habit: Habit = {
          id: generateId(),
          name: input?.name ?? '',
          icon: input?.icon ?? '✅',
          color: input?.color ?? 'hsl(var(--primary))',
          frequency: input?.frequency ?? 'daily',
          frequencyDays: input?.frequencyDays ?? [],
          targetValue: input?.targetValue ?? 1,
          unit: input?.unit ?? '次',
          reminderTime: input?.reminderTime ?? null,
          isActive: input?.isActive ?? true,
          sortOrder: input?.sortOrder ?? 0,
          createdAt: now(),
          updatedAt: now(),
        };

        set((state) => ({ habits: [habit, ...state.habits] }));
        queueHabitOperation(habit, 'insert');
        return habit;
      },

      updateHabit: (id, input) => {
        let updated: Habit | null = null;
        set((state) => ({
          habits: state.habits.map((habit) => {
            if (habit.id !== id) return habit;
            updated = { ...habit, ...input, updatedAt: now() };
            return updated;
          }),
        }));
        if (updated) queueHabitOperation(updated, 'update');
      },

      deleteHabit: (id) => {
        const habit = get().getHabitById(id);
        set((state) => ({
          habits: state.habits.filter((h) => h.id !== id),
          logs: state.logs.filter((l) => l.habitId !== id),
        }));
        if (habit) queueHabitOperation(habit, 'delete');
      },

      toggleActive: (id) => {
        const habit = get().getHabitById(id);
        if (habit) {
          get().updateHabit(id, { isActive: !habit.isActive });
        }
      },

      logHabit: (habitId, input) => {
        const dateKey = input?.date ?? todayKey();
        const existing = get().getLogForDate(habitId, dateKey);

        if (existing) {
          get().updateLog(existing.id, input ?? {});
          return get().getLogForDate(habitId, dateKey)!;
        }

        const log: HabitLog = {
          id: generateId(),
          habitId,
          date: dateKey,
          value: input?.value ?? 1,
          note: input?.note ?? '',
          createdAt: now(),
        };

        set((state) => ({ logs: [log, ...state.logs] }));
        queueHabitLogOperation(log, 'insert');
        return log;
      },

      updateLog: (id, input) => {
        let updated: HabitLog | null = null;
        set((state) => ({
          logs: state.logs.map((log) => {
            if (log.id !== id) return log;
            updated = { ...log, ...input };
            return updated;
          }),
        }));
        if (updated) queueHabitLogOperation(updated, 'update');
      },

      deleteLog: (id) => {
        const log = get().logs.find((l) => l.id === id);
        set((state) => ({
          logs: state.logs.filter((l) => l.id !== id),
        }));
        if (log) queueHabitLogOperation(log, 'delete');
      },

      toggleLogComplete: (habitId, dateKey = todayKey()) => {
        const habit = get().getHabitById(habitId);
        if (!habit) return;

        const existing = get().getLogForDate(habitId, dateKey);
        if (existing && isLogCompleted(habit, existing)) {
          get().deleteLog(existing.id);
        } else {
          get().logHabit(habitId, { date: dateKey, value: habit.targetValue });
        }
      },

      mergeRemoteHabits: (remoteHabits) => {
        set((state) => {
          const localById = new Map(state.habits.map((h) => [h.id, h]));
          let maxUpdatedAt = state.lastSyncAt ?? '1970-01-01T00:00:00.000Z';

          for (const remote of remoteHabits) {
            if (remote.updatedAt > maxUpdatedAt) maxUpdatedAt = remote.updatedAt;
            const local = localById.get(remote.id);
            if (!local) {
              localById.set(remote.id, remote);
              continue;
            }
            if (new Date(remote.updatedAt) >= new Date(local.updatedAt)) {
              localById.set(remote.id, remote);
            }
          }

          return {
            habits: Array.from(localById.values()).sort((a, b) => a.sortOrder - b.sortOrder),
            lastSyncAt: maxUpdatedAt,
          };
        });
      },

      mergeRemoteLogs: (remoteLogs) => {
        set((state) => {
          const localById = new Map(state.logs.map((l) => [l.id, l]));

          for (const remote of remoteLogs) {
            const local = localById.get(remote.id);
            if (!local) {
              localById.set(remote.id, remote);
              continue;
            }
            if (new Date(remote.createdAt) >= new Date(local.createdAt)) {
              localById.set(remote.id, remote);
            }
          }

          return {
            logs: Array.from(localById.values()).sort(
              (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
            ),
          };
        });
      },

      getHabitById: (id) => {
        return get().habits.find((habit) => habit.id === id);
      },

      getLogsForHabit: (habitId) => {
        return get().logs
          .filter((log) => log.habitId === habitId)
          .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      },

      getLogForDate: (habitId, dateKey) => {
        return get().logs.find((log) => log.habitId === habitId && log.date === dateKey);
      },

      getTodayHabits: () => {
        return get().habits
          .filter((habit) => isHabitDueOnDate(habit, todayKey()))
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      getHabitsDueOnDate: (dateKey) => {
        return get().habits
          .filter((habit) => isHabitDueOnDate(habit, dateKey))
          .sort((a, b) => a.sortOrder - b.sortOrder);
      },

      getCompletedDates: (habitId) => {
        const habit = get().getHabitById(habitId);
        if (!habit) return [];
        return get()
          .getLogsForHabit(habitId)
          .filter((log) => isLogCompleted(habit, log))
          .map((log) => log.date);
      },

      getCurrentStreak: (habitId) => {
        const habit = get().getHabitById(habitId);
        if (!habit) return 0;

        const logsByDate = new Map(
          get()
            .getLogsForHabit(habitId)
            .filter((log) => isLogCompleted(habit, log))
            .map((log) => [log.date, log])
        );

        let streak = 0;
        const today = new Date(`${todayKey()}T00:00:00`);

        for (let i = 0; i < 365; i++) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          if (!isHabitDueOnDate(habit, key)) {
            if (i === 0) continue;
            break;
          }
          if (logsByDate.has(key)) {
            streak += 1;
          } else {
            break;
          }
        }

        return streak;
      },

      getCompletionRate: (habitId, days = 7) => {
        const habit = get().getHabitById(habitId);
        if (!habit) return 0;

        const today = new Date(`${todayKey()}T00:00:00`);
        let dueCount = 0;
        let completedCount = 0;

        for (let i = days - 1; i >= 0; i--) {
          const d = new Date(today);
          d.setDate(today.getDate() - i);
          const key = d.toISOString().slice(0, 10);
          if (!isHabitDueOnDate(habit, key)) continue;

          dueCount += 1;
          const log = get().getLogForDate(habitId, key);
          if (isLogCompleted(habit, log)) completedCount += 1;
        }

        return dueCount === 0 ? 0 : Math.round((completedCount / dueCount) * 100);
      },
    }),
    {
      name: 'habits-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

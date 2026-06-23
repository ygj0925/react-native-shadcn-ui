import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '@/lib/storage';
import { queueTaskOperation } from '@/lib/sync/tasks';

export type TaskStatus = 'pending' | 'in_progress' | 'done' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';
export type TaskRecurrence = 'none' | 'daily' | 'weekly' | 'monthly';

export type Task = {
  id: string;
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  dueTime: string | null;
  calendarEventId: string | null;
  noteId: string | null;
  goalId: string | null;
  recurrence: TaskRecurrence;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaskInput = {
  title?: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: string | null;
  dueTime?: string | null;
  calendarEventId?: string | null;
  noteId?: string | null;
  goalId?: string | null;
  recurrence?: TaskRecurrence;
  completedAt?: string | null;
};

type TasksState = {
  tasks: Task[];
  lastSyncAt: string | null;

  // CRUD
  createTask: (input?: TaskInput) => Task;
  updateTask: (id: string, input: TaskInput) => void;
  deleteTask: (id: string) => void;

  // Status helpers
  markDone: (id: string) => void;
  markInProgress: (id: string) => void;
  markPending: (id: string) => void;

  // Sync
  setLastSyncAt: (at: string | null) => void;
  mergeRemoteTasks: (remoteTasks: Task[]) => void;

  // Selectors
  getTaskById: (id: string) => Task | undefined;
  getTasksByStatus: (status: TaskStatus) => Task[];
  getTasksForDate: (date: string) => Task[];
  getOverdueTasks: () => Task[];
  getTodayTasks: () => Task[];
};

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

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

function todayKey(): string {
  return now().slice(0, 10);
}

export const useTasksStore = create<TasksState>()(
  persist(
    (set, get) => ({
      tasks: [],
      lastSyncAt: null,

      setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),

      createTask: (input) => {
        const task: Task = {
          id: generateId(),
          title: input?.title ?? '',
          description: input?.description ?? '',
          status: input?.status ?? 'pending',
          priority: input?.priority ?? 'medium',
          dueDate: input?.dueDate ?? null,
          dueTime: input?.dueTime ?? null,
          calendarEventId: input?.calendarEventId ?? null,
          noteId: input?.noteId ?? null,
          goalId: input?.goalId ?? null,
          recurrence: input?.recurrence ?? 'none',
          completedAt: input?.completedAt ?? null,
          createdAt: now(),
          updatedAt: now(),
        };

        set((state) => ({ tasks: [task, ...state.tasks] }));
        queueTaskOperation(task, 'insert');
        return task;
      },

      updateTask: (id, input) => {
        let updated: Task | null = null;
        set((state) => ({
          tasks: state.tasks.map((task) => {
            if (task.id !== id) return task;
            updated = { ...task, ...input, updatedAt: now() };
            return updated;
          }),
        }));
        if (updated) queueTaskOperation(updated, 'update');
      },

      deleteTask: (id) => {
        const task = get().getTaskById(id);
        set((state) => ({
          tasks: state.tasks.filter((t) => t.id !== id),
        }));
        if (task) queueTaskOperation(task, 'delete');
      },

      markDone: (id) => {
        get().updateTask(id, { status: 'done', completedAt: now() });
      },

      markInProgress: (id) => {
        get().updateTask(id, { status: 'in_progress', completedAt: null });
      },

      markPending: (id) => {
        get().updateTask(id, { status: 'pending', completedAt: null });
      },

      mergeRemoteTasks: (remoteTasks) => {
        set((state) => {
          const localById = new Map(state.tasks.map((t) => [t.id, t]));
          let maxUpdatedAt = state.lastSyncAt ?? '1970-01-01T00:00:00.000Z';

          for (const remote of remoteTasks) {
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
            tasks: Array.from(localById.values()).sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            ),
            lastSyncAt: maxUpdatedAt,
          };
        });
      },

      getTaskById: (id) => {
        return get().tasks.find((task) => task.id === id);
      },

      getTasksByStatus: (status) => {
        return get().tasks
          .filter((task) => task.status === status)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      },

      getTasksForDate: (date) => {
        return get().tasks
          .filter((task) => task.dueDate === date)
          .sort((a, b) => {
            if (!a.dueTime) return 1;
            if (!b.dueTime) return -1;
            return a.dueTime.localeCompare(b.dueTime);
          });
      },

      getOverdueTasks: () => {
        const today = todayKey();
        return get().tasks
          .filter((task) => task.status !== 'done' && task.dueDate && task.dueDate < today)
          .sort((a, b) => new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime());
      },

      getTodayTasks: () => {
        return get().getTasksForDate(todayKey());
      },
    }),
    {
      name: 'tasks-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '@/lib/storage';
import { queueGoalOperation } from '@/lib/sync/goals';

export type GoalType = 'okr' | 'milestone' | 'custom';
export type GoalStatus = 'not_started' | 'in_progress' | 'achieved' | 'abandoned';

export type Goal = {
  id: string;
  title: string;
  description: string;
  parentId: string | null;
  type: GoalType;
  status: GoalStatus;
  targetDate: string | null;
  progress: number;
  createdAt: string;
  updatedAt: string;
};

export type GoalInput = {
  title?: string;
  description?: string;
  parentId?: string | null;
  type?: GoalType;
  status?: GoalStatus;
  targetDate?: string | null;
  progress?: number;
};

type GoalsState = {
  goals: Goal[];
  lastSyncAt: string | null;

  // Sync
  setLastSyncAt: (at: string | null) => void;
  mergeRemoteGoals: (remoteGoals: Goal[]) => void;

  // CRUD
  createGoal: (input?: GoalInput) => Goal;
  updateGoal: (id: string, input: GoalInput) => void;
  deleteGoal: (id: string) => void;

  // Status helpers
  markInProgress: (id: string) => void;
  markAchieved: (id: string) => void;
  markAbandoned: (id: string) => void;

  // Progress
  updateProgress: (id: string, progress: number) => void;
  recalculateProgress: (id: string) => void;

  // Selectors
  getGoalById: (id: string) => Goal | undefined;
  getRootGoals: () => Goal[];
  getChildGoals: (parentId: string) => Goal[];
  getActiveGoals: () => Goal[];
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

function clampProgress(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export const useGoalsStore = create<GoalsState>()(
  persist(
    (set, get) => ({
      goals: [],
      lastSyncAt: null,

      setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),

      createGoal: (input) => {
        const goal: Goal = {
          id: generateId(),
          title: input?.title ?? '',
          description: input?.description ?? '',
          parentId: input?.parentId ?? null,
          type: input?.type ?? 'custom',
          status: input?.status ?? 'not_started',
          targetDate: input?.targetDate ?? null,
          progress: clampProgress(input?.progress ?? 0),
          createdAt: now(),
          updatedAt: now(),
        };

        set((state) => ({ goals: [goal, ...state.goals] }));
        queueGoalOperation(goal, 'insert');

        if (goal.parentId) {
          get().recalculateProgress(goal.parentId);
        }

        return goal;
      },

      updateGoal: (id, input) => {
        const goal = get().getGoalById(id);
        if (!goal) return;

        const updated: Goal = {
          ...goal,
          ...input,
          progress: input.progress !== undefined ? clampProgress(input.progress) : goal.progress,
          updatedAt: now(),
        };

        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? updated : g)),
        }));

        queueGoalOperation(updated, 'update');
        if (updated.parentId) {
          get().recalculateProgress(updated.parentId);
        }
      },

      deleteGoal: (id) => {
        const goal = get().getGoalById(id);
        const childIds = get()
          .goals.filter((g) => g.parentId === id)
          .map((g) => g.id);

        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id && !childIds.includes(g.id)),
        }));

        if (goal) queueGoalOperation(goal, 'delete');
        childIds.forEach((childId) => {
          const child = get().getGoalById(childId);
          if (child) queueGoalOperation(child, 'delete');
        });

        if (goal?.parentId) {
          get().recalculateProgress(goal.parentId);
        }
      },

      markInProgress: (id) => {
        get().updateGoal(id, { status: 'in_progress' });
      },

      markAchieved: (id) => {
        get().updateGoal(id, { status: 'achieved', progress: 100 });
      },

      markAbandoned: (id) => {
        get().updateGoal(id, { status: 'abandoned' });
      },

      updateProgress: (id, progress) => {
        get().updateGoal(id, { progress: clampProgress(progress) });
      },

      recalculateProgress: (id) => {
        const goal = get().getGoalById(id);
        if (!goal) return;

        const children = get().getChildGoals(id);
        if (children.length === 0) return;

        const averageProgress = children.reduce((sum, child) => sum + child.progress, 0) / children.length;
        const newProgress = clampProgress(averageProgress);

        if (newProgress !== goal.progress) {
          set((state) => ({
            goals: state.goals.map((g) => {
              if (g.id !== id) return g;
              const updated = { ...g, progress: newProgress, updatedAt: now() };
              queueGoalOperation(updated, 'update');
              return updated;
            }),
          }));
        }

        if (goal.parentId) {
          get().recalculateProgress(goal.parentId);
        }
      },

      mergeRemoteGoals: (remoteGoals) => {
        set((state) => {
          const localById = new Map(state.goals.map((g) => [g.id, g]));
          let maxUpdatedAt = state.lastSyncAt ?? '1970-01-01T00:00:00.000Z';

          for (const remote of remoteGoals) {
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
            goals: Array.from(localById.values()).sort(
              (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            ),
            lastSyncAt: maxUpdatedAt,
          };
        });
      },

      getGoalById: (id) => {
        return get().goals.find((g) => g.id === id);
      },

      getRootGoals: () => {
        return get().goals
          .filter((g) => !g.parentId)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      },

      getChildGoals: (parentId) => {
        return get().goals
          .filter((g) => g.parentId === parentId)
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      },

      getActiveGoals: () => {
        return get().goals
          .filter((g) => g.status === 'not_started' || g.status === 'in_progress')
          .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
      },
    }),
    {
      name: 'goals-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

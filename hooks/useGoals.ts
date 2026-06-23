import { useCallback, useMemo } from 'react';
import {
  useGoalsStore,
  type Goal,
  type GoalInput,
  type GoalStatus,
} from '@/lib/store/goals';

export function useGoals() {
  const goals = useGoalsStore((s) => s.goals);
  const createGoal = useGoalsStore((s) => s.createGoal);
  const updateGoal = useGoalsStore((s) => s.updateGoal);
  const deleteGoal = useGoalsStore((s) => s.deleteGoal);
  const markInProgress = useGoalsStore((s) => s.markInProgress);
  const markAchieved = useGoalsStore((s) => s.markAchieved);
  const markAbandoned = useGoalsStore((s) => s.markAbandoned);
  const updateProgress = useGoalsStore((s) => s.updateProgress);
  const getRootGoals = useGoalsStore((s) => s.getRootGoals);
  const getActiveGoals = useGoalsStore((s) => s.getActiveGoals);

  const rootGoals = useMemo(() => getRootGoals(), [getRootGoals, goals]);
  const activeGoals = useMemo(() => getActiveGoals(), [getActiveGoals, goals]);

  const handleCreate = useCallback(
    (input?: GoalInput) => createGoal(input),
    [createGoal]
  );

  const handleUpdate = useCallback(
    (id: string, input: GoalInput) => updateGoal(id, input),
    [updateGoal]
  );

  const handleDelete = useCallback(
    (id: string) => deleteGoal(id),
    [deleteGoal]
  );

  return {
    goals,
    rootGoals,
    activeGoals,
    createGoal: handleCreate,
    updateGoal: handleUpdate,
    deleteGoal: handleDelete,
    markInProgress,
    markAchieved,
    markAbandoned,
    updateProgress,
    getRootGoals,
    getActiveGoals,
  };
}

export function useGoal(id: string) {
  const goal = useGoalsStore((s) => s.getGoalById(id));
  const childGoals = useGoalsStore((s) => s.getChildGoals(id));
  const updateGoal = useGoalsStore((s) => s.updateGoal);
  const deleteGoal = useGoalsStore((s) => s.deleteGoal);
  const markInProgress = useGoalsStore((s) => s.markInProgress);
  const markAchieved = useGoalsStore((s) => s.markAchieved);
  const markAbandoned = useGoalsStore((s) => s.markAbandoned);
  const updateProgress = useGoalsStore((s) => s.updateProgress);
  const createGoal = useGoalsStore((s) => s.createGoal);

  const update = useCallback(
    (input: GoalInput) => {
      updateGoal(id, input);
    },
    [id, updateGoal]
  );

  const remove = useCallback(() => {
    deleteGoal(id);
  }, [id, deleteGoal]);

  const setStatus = useCallback(
    (status: GoalStatus) => {
      switch (status) {
        case 'in_progress':
          markInProgress(id);
          break;
        case 'achieved':
          markAchieved(id);
          break;
        case 'abandoned':
          markAbandoned(id);
          break;
        default:
          updateGoal(id, { status: 'not_started' });
          break;
      }
    },
    [id, markInProgress, markAchieved, markAbandoned, updateGoal]
  );

  const addKeyResult = useCallback(
    (input: GoalInput) => {
      return createGoal({ ...input, parentId: id, type: 'custom' });
    },
    [id, createGoal]
  );

  const deleteKeyResult = useCallback(
    (keyResultId: string) => {
      deleteGoal(keyResultId);
    },
    [deleteGoal]
  );

  const updateKeyResult = useCallback(
    (keyResultId: string, input: GoalInput) => {
      updateGoal(keyResultId, input);
    },
    [updateGoal]
  );

  return {
    goal,
    childGoals,
    update,
    remove,
    setStatus,
    updateProgress: (progress: number) => updateProgress(id, progress),
    addKeyResult,
    deleteKeyResult,
    updateKeyResult,
  };
}

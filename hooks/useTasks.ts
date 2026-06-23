import { useCallback, useMemo } from 'react';
import { useTasksStore, type Task, type TaskInput, type TaskStatus } from '@/lib/store/tasks';

export function useTasks() {
  const tasks = useTasksStore((s) => s.tasks);
  const createTask = useTasksStore((s) => s.createTask);
  const updateTask = useTasksStore((s) => s.updateTask);
  const deleteTask = useTasksStore((s) => s.deleteTask);
  const markDone = useTasksStore((s) => s.markDone);
  const markInProgress = useTasksStore((s) => s.markInProgress);
  const markPending = useTasksStore((s) => s.markPending);
  const getTasksByStatus = useTasksStore((s) => s.getTasksByStatus);
  const getTasksForDate = useTasksStore((s) => s.getTasksForDate);
  const getOverdueTasks = useTasksStore((s) => s.getOverdueTasks);
  const getTodayTasks = useTasksStore((s) => s.getTodayTasks);

  const pendingTasks = useMemo(() => getTasksByStatus('pending'), [getTasksByStatus, tasks]);
  const inProgressTasks = useMemo(() => getTasksByStatus('in_progress'), [getTasksByStatus, tasks]);
  const doneTasks = useMemo(() => getTasksByStatus('done'), [getTasksByStatus, tasks]);
  const todayTasks = useMemo(() => getTodayTasks(), [getTodayTasks, tasks]);
  const overdueTasks = useMemo(() => getOverdueTasks(), [getOverdueTasks, tasks]);

  const handleCreate = useCallback(
    (input?: TaskInput) => createTask(input),
    [createTask]
  );

  const handleUpdate = useCallback(
    (id: string, input: TaskInput) => updateTask(id, input),
    [updateTask]
  );

  const handleDelete = useCallback(
    (id: string) => deleteTask(id),
    [deleteTask]
  );

  return {
    tasks,
    pendingTasks,
    inProgressTasks,
    doneTasks,
    todayTasks,
    overdueTasks,
    createTask: handleCreate,
    updateTask: handleUpdate,
    deleteTask: handleDelete,
    markDone,
    markInProgress,
    markPending,
    getTasksByStatus,
    getTasksForDate,
    getOverdueTasks,
    getTodayTasks,
  };
}

export function useTask(id: string) {
  const task = useTasksStore((s) => s.getTaskById(id));
  const updateTask = useTasksStore((s) => s.updateTask);
  const deleteTask = useTasksStore((s) => s.deleteTask);
  const markDone = useTasksStore((s) => s.markDone);
  const markInProgress = useTasksStore((s) => s.markInProgress);
  const markPending = useTasksStore((s) => s.markPending);

  const update = useCallback(
    (input: TaskInput) => {
      updateTask(id, input);
    },
    [id, updateTask]
  );

  const remove = useCallback(() => {
    deleteTask(id);
  }, [id, deleteTask]);

  const setStatus = useCallback(
    (status: TaskStatus) => {
      switch (status) {
        case 'done':
          markDone(id);
          break;
        case 'in_progress':
          markInProgress(id);
          break;
        default:
          markPending(id);
          break;
      }
    },
    [id, markDone, markInProgress, markPending]
  );

  return { task, update, remove, setStatus };
}

import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/auth';
import type { Task } from '@/lib/store/tasks';
import { enqueue } from './queue';
import type { SyncOperation } from './queue';

export function mapTaskToRemote(task: Task): Record<string, any> {
  return {
    id: task.id,
    title: task.title,
    description: task.description,
    status: task.status,
    priority: task.priority,
    due_date: task.dueDate,
    due_time: task.dueTime,
    calendar_event_id: task.calendarEventId,
    note_id: task.noteId,
    goal_id: task.goalId,
    recurrence: task.recurrence,
    completed_at: task.completedAt,
    created_at: task.createdAt,
    updated_at: task.updatedAt,
  };
}

export function mapRemoteToTask(remote: any): Task {
  return {
    id: remote.id,
    title: remote.title ?? '',
    description: remote.description ?? '',
    status: remote.status ?? 'pending',
    priority: remote.priority ?? 'medium',
    dueDate: remote.due_date ?? null,
    dueTime: remote.due_time ?? null,
    calendarEventId: remote.calendar_event_id ?? null,
    noteId: remote.note_id ?? null,
    goalId: remote.goal_id ?? null,
    recurrence: remote.recurrence ?? 'none',
    completedAt: remote.completed_at ?? null,
    createdAt: remote.created_at,
    updatedAt: remote.updated_at,
  };
}

export function queueTaskOperation(task: Task, action: SyncOperation['action']) {
  const user = useAuthStore.getState().user;
  if (!user) return;

  enqueue({
    table: 'tasks',
    action,
    recordId: task.id,
    data: { ...mapTaskToRemote(task), user_id: user.id },
  });
}

export async function pullTasks(userId: string, since?: string): Promise<Task[]> {
  let query = supabase
    .from('tasks')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (since) {
    query = query.gt('updated_at', since);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRemoteToTask);
}

export async function syncTasks(userId: string, since?: string): Promise<Task[]> {
  const { syncPendingOperations } = await import('./engine');
  await syncPendingOperations();
  return pullTasks(userId, since);
}

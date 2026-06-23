import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/auth';
import type { Goal } from '@/lib/store/goals';
import { enqueue } from './queue';
import type { SyncOperation } from './queue';

export function mapGoalToRemote(goal: Goal): Record<string, any> {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    parent_id: goal.parentId,
    type: goal.type,
    status: goal.status,
    target_date: goal.targetDate,
    progress: goal.progress,
    created_at: goal.createdAt,
    updated_at: goal.updatedAt,
  };
}

export function mapRemoteToGoal(remote: any): Goal {
  return {
    id: remote.id,
    title: remote.title ?? '',
    description: remote.description ?? '',
    parentId: remote.parent_id ?? null,
    type: remote.type ?? 'custom',
    status: remote.status ?? 'not_started',
    targetDate: remote.target_date ?? null,
    progress: remote.progress ?? 0,
    createdAt: remote.created_at,
    updatedAt: remote.updated_at,
  };
}

export function queueGoalOperation(goal: Goal, action: SyncOperation['action']) {
  const user = useAuthStore.getState().user;
  if (!user) return;

  enqueue({
    table: 'goals',
    action,
    recordId: goal.id,
    data: { ...mapGoalToRemote(goal), user_id: user.id },
  });
}

export async function pullGoals(userId: string, since?: string): Promise<Goal[]> {
  let query = supabase
    .from('goals')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (since) {
    query = query.gt('updated_at', since);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRemoteToGoal);
}

export async function syncGoals(userId: string, since?: string): Promise<Goal[]> {
  const { syncPendingOperations } = await import('./engine');
  await syncPendingOperations();
  return pullGoals(userId, since);
}

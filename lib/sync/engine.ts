import { supabase } from '@/lib/supabase';
import { getQueue, dequeue, incrementRetry, type SyncOperation } from './queue';
import NetInfo from '@react-native-community/netinfo';

const MAX_RETRIES = 3;
let isSyncing = false;
let syncTimer: ReturnType<typeof setInterval> | null = null;

// ─── Process a single sync operation ──────────────────────────────────────

async function processOperation(op: SyncOperation): Promise<boolean> {
  try {
    const { table, action, recordId, data } = op;

    switch (action) {
      case 'insert': {
        const { error } = await supabase.from(table).upsert({ id: recordId, ...data });
        if (error) throw error;
        break;
      }
      case 'update': {
        const { error } = await supabase.from(table).update(data).eq('id', recordId);
        if (error) throw error;
        break;
      }
      case 'delete': {
        const { error } = await supabase.from(table).delete().eq('id', recordId);
        if (error) throw error;
        break;
      }
    }

    return true;
  } catch (e: any) {
    console.warn(`[Sync] Operation failed: ${op.table}/${op.action}/${op.recordId}`, e.message);
    return false;
  }
}

// ─── Process entire queue ─────────────────────────────────────────────────

export async function syncPendingOperations() {
  if (isSyncing) return;
  isSyncing = true;

  try {
    // Check network connectivity
    const netInfo = await NetInfo.fetch();
    if (!netInfo.isConnected) {
      console.log('[Sync] No network, skipping sync');
      return;
    }

    const queue = getQueue();
    if (queue.length === 0) return;

    console.log(`[Sync] Processing ${queue.length} pending operations`);

    for (const op of queue) {
      if (op.retryCount >= MAX_RETRIES) {
        console.warn(`[Sync] Max retries reached for ${op.id}, removing from queue`);
        dequeue(op.id);
        continue;
      }

      const success = await processOperation(op);
      if (success) {
        dequeue(op.id);
      } else {
        incrementRetry(op.id);
      }
    }
  } finally {
    isSyncing = false;
  }
}

// ─── Pull latest data from Supabase ──────────────────────────────────────

export async function pullFromRemote(table: string, userId: string, since?: string) {
  let query = supabase
    .from(table)
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (since) {
    query = query.gt('updated_at', since);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ─── Start auto-sync ─────────────────────────────────────────────────────

export function startAutoSync(intervalMs = 30000) {
  if (syncTimer) return;

  // Sync immediately
  syncPendingOperations();

  // Then sync periodically
  syncTimer = setInterval(() => {
    syncPendingOperations();
  }, intervalMs);

  console.log(`[Sync] Auto-sync started (every ${intervalMs / 1000}s)`);
}

// ─── Stop auto-sync ─────────────────────────────────────────────────────

export function stopAutoSync() {
  if (syncTimer) {
    clearInterval(syncTimer);
    syncTimer = null;
    console.log('[Sync] Auto-sync stopped');
  }
}

// ─── Check if online ────────────────────────────────────────────────────

export async function isOnline(): Promise<boolean> {
  const netInfo = await NetInfo.fetch();
  return netInfo.isConnected ?? false;
}

import { createMMKV } from 'react-native-mmkv';

const storage = createMMKV({ id: 'sync-queue' });

const QUEUE_KEY = 'pending_operations';

export type SyncOperation = {
  id: string;
  table: string;
  action: 'insert' | 'update' | 'delete';
  recordId: string;
  data: Record<string, any>;
  timestamp: number;
  retryCount: number;
};

// ─── Queue Management ──────────────────────────────────────────────────────

export function getQueue(): SyncOperation[] {
  try {
    const raw = storage.getString(QUEUE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveQueue(queue: SyncOperation[]) {
  storage.set(QUEUE_KEY, JSON.stringify(queue));
}

export function enqueue(operation: Omit<SyncOperation, 'id' | 'timestamp' | 'retryCount'>) {
  const queue = getQueue();
  const entry: SyncOperation = {
    ...operation,
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    timestamp: Date.now(),
    retryCount: 0,
  };
  queue.push(entry);
  saveQueue(queue);
  return entry;
}

export function dequeue(id: string) {
  const queue = getQueue().filter((op) => op.id !== id);
  saveQueue(queue);
}

export function incrementRetry(id: string) {
  const queue = getQueue();
  const op = queue.find((o) => o.id === id);
  if (op) {
    op.retryCount += 1;
    saveQueue(queue);
  }
}

export function clearQueue() {
  saveQueue([]);
}

export function getQueueSize(): number {
  return getQueue().length;
}

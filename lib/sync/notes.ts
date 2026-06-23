import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/auth';
import type { Note } from '@/lib/store/notes';
import { enqueue } from './queue';
import type { SyncOperation } from './queue';

export function mapNoteToRemote(note: Note): Record<string, any> {
  return {
    id: note.id,
    title: note.title,
    content: note.content ? JSON.parse(note.content) : {},
    plain_text: note.plainText,
    category: note.category,
    tags: note.tags,
    is_pinned: note.isPinned,
    is_archived: note.isArchived,
    created_at: note.createdAt,
    updated_at: note.updatedAt,
  };
}

export function mapRemoteToNote(remote: any): Note {
  return {
    id: remote.id,
    title: remote.title ?? '',
    content: typeof remote.content === 'string' ? remote.content : JSON.stringify(remote.content ?? {}),
    plainText: remote.plain_text ?? '',
    category: remote.category ?? 'personal',
    tags: Array.isArray(remote.tags) ? remote.tags : [],
    isPinned: remote.is_pinned ?? false,
    isArchived: remote.is_archived ?? false,
    createdAt: remote.created_at,
    updatedAt: remote.updated_at,
  };
}

export function queueNoteOperation(note: Note, action: SyncOperation['action']) {
  const user = useAuthStore.getState().user;
  if (!user) return;

  enqueue({
    table: 'notes',
    action,
    recordId: note.id,
    data: { ...mapNoteToRemote(note), user_id: user.id },
  });
}

export async function pullNotes(userId: string, since?: string): Promise<Note[]> {
  let query = supabase
    .from('notes')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (since) {
    query = query.gt('updated_at', since);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRemoteToNote);
}

export async function syncNotes(userId: string, since?: string): Promise<Note[]> {
  const { syncPendingOperations } = await import('./engine');
  await syncPendingOperations();
  return pullNotes(userId, since);
}

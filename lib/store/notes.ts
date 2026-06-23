import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '@/lib/storage';
import { queueNoteOperation } from '@/lib/sync/notes';

// ─── Types ────────────────────────────────────────────────────────────────

export type NoteCategory = 'all' | 'personal' | 'work' | 'idea' | 'archive';

export type Note = {
  id: string;
  title: string;
  content: string; // TipTap JSON string
  plainText: string; // For search
  category: Exclude<NoteCategory, 'all'>;
  tags: string[];
  isPinned: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
};

export type NoteInput = {
  title?: string;
  content?: string;
  plainText?: string;
  category?: Note['category'];
  tags?: string[];
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

// ─── Store ────────────────────────────────────────────────────────────────

type NotesState = {
  notes: Note[];
  searchQuery: string;
  activeCategory: NoteCategory;
  lastSyncAt: string | null;

  // Actions
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: NoteCategory) => void;
  setLastSyncAt: (at: string | null) => void;

  // CRUD
  createNote: (input?: NoteInput) => Note;
  updateNote: (id: string, input: Partial<NoteInput>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;

  // Sync
  mergeRemoteNotes: (remoteNotes: Note[]) => void;

  // Selectors
  getNoteById: (id: string) => Note | undefined;
  getFilteredNotes: () => Note[];
  getNotesCount: () => number;
};

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

export const useNotesStore = create<NotesState>()(
  persist(
    (set, get) => ({
      notes: [],
      searchQuery: '',
      activeCategory: 'all',
      lastSyncAt: null,

      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveCategory: (category) => set({ activeCategory: category }),
      setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),

      createNote: (input) => {
        const note: Note = {
          id: generateId(),
          title: input?.title ?? '',
          content: input?.content ?? '',
          plainText: input?.plainText ?? '',
          category: input?.category ?? 'personal',
          tags: input?.tags ?? [],
          isPinned: false,
          isArchived: false,
          createdAt: now(),
          updatedAt: now(),
        };

        set((state) => ({ notes: [note, ...state.notes] }));
        queueNoteOperation(note, 'insert');
        return note;
      },

      updateNote: (id, input) => {
        let updated: Note | null = null;
        set((state) => ({
          notes: state.notes.map((note) => {
            if (note.id !== id) return note;
            updated = { ...note, ...input, updatedAt: now() };
            return updated;
          }),
        }));
        if (updated) queueNoteOperation(updated, 'update');
      },

      deleteNote: (id) => {
        const note = get().getNoteById(id);
        set((state) => ({
          notes: state.notes.filter((n) => n.id !== id),
        }));
        if (note) queueNoteOperation(note, 'delete');
      },

      togglePin: (id) => {
        let updated: Note | null = null;
        set((state) => ({
          notes: state.notes.map((note) => {
            if (note.id !== id) return note;
            updated = { ...note, isPinned: !note.isPinned, updatedAt: now() };
            return updated;
          }),
        }));
        if (updated) queueNoteOperation(updated, 'update');
      },

      archiveNote: (id) => {
        let updated: Note | null = null;
        set((state) => ({
          notes: state.notes.map((note) => {
            if (note.id !== id) return note;
            updated = { ...note, isArchived: true, category: 'archive', updatedAt: now() };
            return updated;
          }),
        }));
        if (updated) queueNoteOperation(updated, 'update');
      },

      unarchiveNote: (id) => {
        let updated: Note | null = null;
        set((state) => ({
          notes: state.notes.map((note) => {
            if (note.id !== id) return note;
            updated = { ...note, isArchived: false, category: 'personal', updatedAt: now() };
            return updated;
          }),
        }));
        if (updated) queueNoteOperation(updated, 'update');
      },

      mergeRemoteNotes: (remoteNotes) => {
        set((state) => {
          const localById = new Map(state.notes.map((n) => [n.id, n]));
          let maxUpdatedAt = state.lastSyncAt ?? '1970-01-01T00:00:00.000Z';

          for (const remote of remoteNotes) {
            if (remote.updatedAt > maxUpdatedAt) maxUpdatedAt = remote.updatedAt;
            const local = localById.get(remote.id);
            if (!local) {
              localById.set(remote.id, remote);
              continue;
            }
            // Last-write-wins: keep the note with the later updatedAt
            if (new Date(remote.updatedAt) >= new Date(local.updatedAt)) {
              localById.set(remote.id, remote);
            }
          }

          return {
            notes: Array.from(localById.values()).sort((a, b) =>
              new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
            ),
            lastSyncAt: maxUpdatedAt,
          };
        });
      },

      getNoteById: (id) => {
        return get().notes.find((note) => note.id === id);
      },

      getFilteredNotes: () => {
        const { notes, searchQuery, activeCategory } = get();
        let filtered = notes.filter((n) => !n.isArchived);

        if (activeCategory === 'archive') {
          filtered = notes.filter((n) => n.isArchived);
        } else if (activeCategory !== 'all') {
          filtered = filtered.filter((n) => n.category === activeCategory);
        }

        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(
            (n) =>
              n.title.toLowerCase().includes(q) ||
              n.plainText.toLowerCase().includes(q) ||
              n.tags.some((t) => t.toLowerCase().includes(q))
          );
        }

        // Pinned first, then by updatedAt
        return filtered.sort((a, b) => {
          if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
          return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
        });
      },

      getNotesCount: () => {
        return get().notes.filter((n) => !n.isArchived).length;
      },
    }),
    {
      name: 'notes-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

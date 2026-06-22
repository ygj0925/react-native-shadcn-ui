import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '@/lib/storage';

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

  // Actions
  setSearchQuery: (query: string) => void;
  setActiveCategory: (category: NoteCategory) => void;

  // CRUD
  createNote: (input?: NoteInput) => Note;
  updateNote: (id: string, input: Partial<NoteInput>) => void;
  deleteNote: (id: string) => void;
  togglePin: (id: string) => void;
  archiveNote: (id: string) => void;
  unarchiveNote: (id: string) => void;

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

      setSearchQuery: (query) => set({ searchQuery: query }),
      setActiveCategory: (category) => set({ activeCategory: category }),

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
        return note;
      },

      updateNote: (id, input) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? {
                  ...note,
                  ...input,
                  updatedAt: now(),
                }
              : note
          ),
        }));
      },

      deleteNote: (id) => {
        set((state) => ({
          notes: state.notes.filter((note) => note.id !== id),
        }));
      },

      togglePin: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, isPinned: !note.isPinned, updatedAt: now() }
              : note
          ),
        }));
      },

      archiveNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, isArchived: true, category: 'archive', updatedAt: now() }
              : note
          ),
        }));
      },

      unarchiveNote: (id) => {
        set((state) => ({
          notes: state.notes.map((note) =>
            note.id === id
              ? { ...note, isArchived: false, category: 'personal', updatedAt: now() }
              : note
          ),
        }));
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

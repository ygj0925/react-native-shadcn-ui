import { useNotesStore, type NoteCategory, type NoteInput } from '@/lib/store/notes';
import { useSubscriptionStore } from '@/lib/store/subscription';
import { useCallback, useEffect, useMemo } from 'react';

export function useNotes() {
  const notes = useNotesStore((s) => s.notes);
  const searchQuery = useNotesStore((s) => s.searchQuery);
  const activeCategory = useNotesStore((s) => s.activeCategory);
  const setSearchQuery = useNotesStore((s) => s.setSearchQuery);
  const setActiveCategory = useNotesStore((s) => s.setActiveCategory);
  const createNote = useNotesStore((s) => s.createNote);
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const togglePin = useNotesStore((s) => s.togglePin);
  const archiveNote = useNotesStore((s) => s.archiveNote);
  const unarchiveNote = useNotesStore((s) => s.unarchiveNote);
  const getNoteById = useNotesStore((s) => s.getNoteById);
  const getFilteredNotes = useNotesStore((s) => s.getFilteredNotes);
  const getNotesCount = useNotesStore((s) => s.getNotesCount);

  const filteredNotes = useMemo(() => getFilteredNotes(), [notes, searchQuery, activeCategory]);
  const notesCount = useMemo(() => getNotesCount(), [notes]);
  const setNoteCount = useSubscriptionStore((s) => s.setNoteCount);

  useEffect(() => {
    setNoteCount(notes.length);
  }, [notes.length, setNoteCount]);

  const handleCreate = useCallback(
    (input?: NoteInput) => {
      return createNote(input);
    },
    [createNote]
  );

  const handleUpdate = useCallback(
    (id: string, input: Partial<NoteInput>) => {
      updateNote(id, input);
    },
    [updateNote]
  );

  const handleDelete = useCallback(
    (id: string) => {
      deleteNote(id);
    },
    [deleteNote]
  );

  const handleTogglePin = useCallback(
    (id: string) => {
      togglePin(id);
    },
    [togglePin]
  );

  const handleArchive = useCallback(
    (id: string) => {
      archiveNote(id);
    },
    [archiveNote]
  );

  const handleUnarchive = useCallback(
    (id: string) => {
      unarchiveNote(id);
    },
    [unarchiveNote]
  );

  return {
    // State
    notes,
    filteredNotes,
    notesCount,
    searchQuery,
    activeCategory,

    // Setters
    setSearchQuery,
    setActiveCategory,

    // Actions
    createNote: handleCreate,
    updateNote: handleUpdate,
    deleteNote: handleDelete,
    togglePin: handleTogglePin,
    archiveNote: handleArchive,
    unarchiveNote: handleUnarchive,
    getNoteById,
  };
}

export function useNote(id: string) {
  const note = useNotesStore((s) => s.getNoteById(id));
  const updateNote = useNotesStore((s) => s.updateNote);
  const deleteNote = useNotesStore((s) => s.deleteNote);
  const togglePin = useNotesStore((s) => s.togglePin);
  const archiveNote = useNotesStore((s) => s.archiveNote);

  const update = useCallback(
    (input: Partial<NoteInput>) => {
      updateNote(id, input);
    },
    [id, updateNote]
  );

  const remove = useCallback(() => {
    deleteNote(id);
  }, [id, deleteNote]);

  const pin = useCallback(() => {
    togglePin(id);
  }, [id, togglePin]);

  const archive = useCallback(() => {
    archiveNote(id);
  }, [id, archiveNote]);

  return { note, update, remove, pin, archive };
}

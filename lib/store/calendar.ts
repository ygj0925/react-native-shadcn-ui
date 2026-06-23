import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '@/lib/storage';
import { queueEventOperation } from '@/lib/sync/calendar';

export type CalendarEvent = {
  id: string;
  title: string;
  description: string;
  location: string;
  startTime: string; // ISO 8601
  endTime: string; // ISO 8601
  isAllDay: boolean;
  recurrence: Record<string, any>;
  reminderMinutes: number;
  color: string;
  externalCalendarId: string | null;
  taskId: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CalendarEventInput = {
  title?: string;
  description?: string;
  location?: string;
  startTime?: string;
  endTime?: string;
  isAllDay?: boolean;
  recurrence?: Record<string, any>;
  reminderMinutes?: number;
  color?: string;
  externalCalendarId?: string | null;
  taskId?: string | null;
};

type CalendarState = {
  events: CalendarEvent[];
  selectedDate: string;
  lastSyncAt: string | null;

  // Actions
  setSelectedDate: (date: string) => void;
  setLastSyncAt: (at: string | null) => void;

  // CRUD
  createEvent: (input: CalendarEventInput) => CalendarEvent;
  updateEvent: (id: string, input: CalendarEventInput) => void;
  deleteEvent: (id: string) => void;

  // Sync
  mergeRemoteEvents: (remoteEvents: CalendarEvent[]) => void;

  // Selectors
  getEventById: (id: string) => CalendarEvent | undefined;
  getEventsForDate: (date: string) => CalendarEvent[];
  getEventsForRange: (start: string, end: string) => CalendarEvent[];
};

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

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function now(): string {
  return new Date().toISOString();
}

function toDateKey(iso: string): string {
  return iso.slice(0, 10);
}

export const useCalendarStore = create<CalendarState>()(
  persist(
    (set, get) => ({
      events: [],
      selectedDate: now().slice(0, 10),
      lastSyncAt: null,

      setSelectedDate: (selectedDate) => set({ selectedDate }),
      setLastSyncAt: (lastSyncAt) => set({ lastSyncAt }),

      createEvent: (input) => {
        const event: CalendarEvent = {
          id: generateId(),
          title: input.title ?? '',
          description: input.description ?? '',
          location: input.location ?? '',
          startTime: input.startTime ?? now(),
          endTime: input.endTime ?? now(),
          isAllDay: input.isAllDay ?? false,
          recurrence: input.recurrence ?? {},
          reminderMinutes: input.reminderMinutes ?? 15,
          color: input.color ?? 'hsl(var(--primary))',
          externalCalendarId: input.externalCalendarId ?? null,
          taskId: input.taskId ?? null,
          createdAt: now(),
          updatedAt: now(),
        };

        set((state) => ({ events: [...state.events, event] }));
        queueEventOperation(event, 'insert');
        return event;
      },

      updateEvent: (id, input) => {
        let updated: CalendarEvent | null = null;
        set((state) => ({
          events: state.events.map((event) => {
            if (event.id !== id) return event;
            updated = { ...event, ...input, updatedAt: now() };
            return updated;
          }),
        }));
        if (updated) queueEventOperation(updated, 'update');
      },

      deleteEvent: (id) => {
        const event = get().getEventById(id);
        set((state) => ({
          events: state.events.filter((e) => e.id !== id),
        }));
        if (event) queueEventOperation(event, 'delete');
      },

      mergeRemoteEvents: (remoteEvents) => {
        set((state) => {
          const localById = new Map(state.events.map((e) => [e.id, e]));
          let maxUpdatedAt = state.lastSyncAt ?? '1970-01-01T00:00:00.000Z';

          for (const remote of remoteEvents) {
            if (remote.updatedAt > maxUpdatedAt) maxUpdatedAt = remote.updatedAt;
            const local = localById.get(remote.id);
            if (!local) {
              localById.set(remote.id, remote);
              continue;
            }
            if (new Date(remote.updatedAt) >= new Date(local.updatedAt)) {
              localById.set(remote.id, remote);
            }
          }

          return {
            events: Array.from(localById.values()).sort(
              (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            ),
            lastSyncAt: maxUpdatedAt,
          };
        });
      },

      getEventById: (id) => {
        return get().events.find((event) => event.id === id);
      },

      getEventsForDate: (date) => {
        return get().events
          .filter((event) => toDateKey(event.startTime) === date)
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      },

      getEventsForRange: (start, end) => {
        const startMs = new Date(start).getTime();
        const endMs = new Date(end).getTime();
        return get().events
          .filter((event) => {
            const eventStart = new Date(event.startTime).getTime();
            return eventStart >= startMs && eventStart <= endMs;
          })
          .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
      },
    }),
    {
      name: 'calendar-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

import { useCallback, useMemo } from 'react';
import {
  useCalendarStore,
  type CalendarEvent,
  type CalendarEventInput,
} from '@/lib/store/calendar';

export function useCalendar() {
  const events = useCalendarStore((s) => s.events);
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const setSelectedDate = useCalendarStore((s) => s.setSelectedDate);
  const createEvent = useCalendarStore((s) => s.createEvent);
  const updateEvent = useCalendarStore((s) => s.updateEvent);
  const deleteEvent = useCalendarStore((s) => s.deleteEvent);
  const getEventsForDate = useCalendarStore((s) => s.getEventsForDate);
  const getEventsForRange = useCalendarStore((s) => s.getEventsForRange);

  const selectedEvents = useMemo(
    () => getEventsForDate(selectedDate),
    [getEventsForDate, selectedDate, events]
  );

  const handleCreate = useCallback(
    (input: CalendarEventInput) => createEvent(input),
    [createEvent]
  );

  const handleUpdate = useCallback(
    (id: string, input: CalendarEventInput) => updateEvent(id, input),
    [updateEvent]
  );

  const handleDelete = useCallback(
    (id: string) => deleteEvent(id),
    [deleteEvent]
  );

  return {
    events,
    selectedDate,
    selectedEvents,
    setSelectedDate,
    createEvent: handleCreate,
    updateEvent: handleUpdate,
    deleteEvent: handleDelete,
    getEventsForDate,
    getEventsForRange,
  };
}

export function useEvent(id: string) {
  const event = useCalendarStore((s) => s.getEventById(id));
  const updateEvent = useCalendarStore((s) => s.updateEvent);
  const deleteEvent = useCalendarStore((s) => s.deleteEvent);

  const update = useCallback(
    (input: CalendarEventInput) => {
      updateEvent(id, input);
    },
    [id, updateEvent]
  );

  const remove = useCallback(() => {
    deleteEvent(id);
  }, [id, deleteEvent]);

  return { event, update, remove };
}

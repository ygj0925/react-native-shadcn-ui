import { supabase } from '@/lib/supabase';
import { useAuthStore } from '@/lib/store/auth';
import type { CalendarEvent } from '@/lib/store/calendar';
import { enqueue } from './queue';
import type { SyncOperation } from './queue';

export function mapEventToRemote(event: CalendarEvent): Record<string, any> {
  return {
    id: event.id,
    title: event.title,
    description: event.description,
    location: event.location,
    start_time: event.startTime,
    end_time: event.endTime,
    is_all_day: event.isAllDay,
    recurrence: event.recurrence,
    reminder_minutes: event.reminderMinutes,
    color: event.color,
    external_calendar_id: event.externalCalendarId,
    task_id: event.taskId,
    created_at: event.createdAt,
    updated_at: event.updatedAt,
  };
}

export function mapRemoteToEvent(remote: any): CalendarEvent {
  return {
    id: remote.id,
    title: remote.title ?? '',
    description: remote.description ?? '',
    location: remote.location ?? '',
    startTime: remote.start_time,
    endTime: remote.end_time,
    isAllDay: remote.is_all_day ?? false,
    recurrence: remote.recurrence ?? {},
    reminderMinutes: remote.reminder_minutes ?? 15,
    color: remote.color ?? 'hsl(var(--primary))',
    externalCalendarId: remote.external_calendar_id ?? null,
    taskId: remote.task_id ?? null,
    createdAt: remote.created_at,
    updatedAt: remote.updated_at,
  };
}

export function queueEventOperation(event: CalendarEvent, action: SyncOperation['action']) {
  const user = useAuthStore.getState().user;
  if (!user) return;

  enqueue({
    table: 'calendar_events',
    action,
    recordId: event.id,
    data: { ...mapEventToRemote(event), user_id: user.id },
  });
}

export async function pullEvents(userId: string, since?: string): Promise<CalendarEvent[]> {
  let query = supabase
    .from('calendar_events')
    .select('*')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (since) {
    query = query.gt('updated_at', since);
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []).map(mapRemoteToEvent);
}

export async function syncEvents(userId: string, since?: string): Promise<CalendarEvent[]> {
  const { syncPendingOperations } = await import('./engine');
  await syncPendingOperations();
  return pullEvents(userId, since);
}

import { useEffect, useRef } from 'react';
import { useAuthStore } from '@/lib/store/auth';
import { useNotesStore } from '@/lib/store/notes';
import { useCalendarStore } from '@/lib/store/calendar';
import { useTasksStore } from '@/lib/store/tasks';
import { useHabitsStore } from '@/lib/store/habits';
import { useGoalsStore } from '@/lib/store/goals';
import { syncNotes } from '@/lib/sync/notes';
import { syncEvents } from '@/lib/sync/calendar';
import { syncTasks } from '@/lib/sync/tasks';
import { syncHabits } from '@/lib/sync/habits';
import { syncGoals } from '@/lib/sync/goals';
import NetInfo from '@react-native-community/netinfo';
import { startAutoSync, stopAutoSync } from '@/lib/sync/engine';

export function useDataSync() {
  const user = useAuthStore((s) => s.user);

  const notesLastSyncAt = useNotesStore((s) => s.lastSyncAt);
  const mergeRemoteNotes = useNotesStore((s) => s.mergeRemoteNotes);
  const setNotesLastSyncAt = useNotesStore((s) => s.setLastSyncAt);

  const eventsLastSyncAt = useCalendarStore((s) => s.lastSyncAt);
  const mergeRemoteEvents = useCalendarStore((s) => s.mergeRemoteEvents);
  const setEventsLastSyncAt = useCalendarStore((s) => s.setLastSyncAt);

  const tasksLastSyncAt = useTasksStore((s) => s.lastSyncAt);
  const mergeRemoteTasks = useTasksStore((s) => s.mergeRemoteTasks);
  const setTasksLastSyncAt = useTasksStore((s) => s.setLastSyncAt);

  const habitsLastSyncAt = useHabitsStore((s) => s.lastSyncAt);
  const mergeRemoteHabits = useHabitsStore((s) => s.mergeRemoteHabits);
  const mergeRemoteLogs = useHabitsStore((s) => s.mergeRemoteLogs);
  const setHabitsLastSyncAt = useHabitsStore((s) => s.setLastSyncAt);

  const goalsLastSyncAt = useGoalsStore((s) => s.lastSyncAt);
  const mergeRemoteGoals = useGoalsStore((s) => s.mergeRemoteGoals);
  const setGoalsLastSyncAt = useGoalsStore((s) => s.setLastSyncAt);

  const wasOnlineRef = useRef(true);

  const syncAll = async () => {
    if (!user) return;

    const nowIso = new Date().toISOString();

    await Promise.allSettled([
      (async () => {
        try {
          const remoteNotes = await syncNotes(user.id, notesLastSyncAt ?? undefined);
          mergeRemoteNotes(remoteNotes);
          setNotesLastSyncAt(nowIso);
        } catch (err: any) {
          console.warn('[DataSync] Notes sync failed:', err.message);
        }
      })(),
      (async () => {
        try {
          const remoteEvents = await syncEvents(user.id, eventsLastSyncAt ?? undefined);
          mergeRemoteEvents(remoteEvents);
          setEventsLastSyncAt(nowIso);
        } catch (err: any) {
          console.warn('[DataSync] Calendar sync failed:', err.message);
        }
      })(),
      (async () => {
        try {
          const remoteTasks = await syncTasks(user.id, tasksLastSyncAt ?? undefined);
          mergeRemoteTasks(remoteTasks);
          setTasksLastSyncAt(nowIso);
        } catch (err: any) {
          console.warn('[DataSync] Tasks sync failed:', err.message);
        }
      })(),
      (async () => {
        try {
          const { habits: remoteHabits, logs: remoteLogs } = await syncHabits(
            user.id,
            habitsLastSyncAt ?? undefined
          );
          mergeRemoteHabits(remoteHabits);
          mergeRemoteLogs(remoteLogs);
          setHabitsLastSyncAt(nowIso);
        } catch (err: any) {
          console.warn('[DataSync] Habits sync failed:', err.message);
        }
      })(),
      (async () => {
        try {
          const remoteGoals = await syncGoals(user.id, goalsLastSyncAt ?? undefined);
          mergeRemoteGoals(remoteGoals);
          setGoalsLastSyncAt(nowIso);
        } catch (err: any) {
          console.warn('[DataSync] Goals sync failed:', err.message);
        }
      })(),
    ]);
  };

  // Sync when user becomes available
  useEffect(() => {
    if (!user) return;

    startAutoSync(30000);

    let cancelled = false;

    syncAll().then(() => {
      if (cancelled) return;
    });

    return () => {
      cancelled = true;
      stopAutoSync();
    };
  }, [user?.id]);

  // Sync when network comes back online
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected ?? false;
      if (isOnline && !wasOnlineRef.current && user) {
        syncAll();
      }
      wasOnlineRef.current = isOnline;
    });

    return () => unsubscribe();
  }, [user?.id, notesLastSyncAt, eventsLastSyncAt, tasksLastSyncAt, habitsLastSyncAt, goalsLastSyncAt]);
}

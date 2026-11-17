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

  const wasOnlineRef = useRef(true);

  useEffect(() => {
    if (!user) return;

    const syncAll = async () => {
      const nowIso = new Date().toISOString();

      await Promise.allSettled([
        (async () => {
          try {
            const { lastSyncAt, mergeRemoteNotes, setLastSyncAt } = useNotesStore.getState();
            const remoteNotes = await syncNotes(user.id, lastSyncAt ?? undefined);
            mergeRemoteNotes(remoteNotes);
            setLastSyncAt(nowIso);
          } catch (err: any) {
            console.warn('[DataSync] Notes sync failed:', err.message);
          }
        })(),
        (async () => {
          try {
            const { lastSyncAt, mergeRemoteEvents, setLastSyncAt } = useCalendarStore.getState();
            const remoteEvents = await syncEvents(user.id, lastSyncAt ?? undefined);
            mergeRemoteEvents(remoteEvents);
            setLastSyncAt(nowIso);
          } catch (err: any) {
            console.warn('[DataSync] Calendar sync failed:', err.message);
          }
        })(),
        (async () => {
          try {
            const { lastSyncAt, mergeRemoteTasks, setLastSyncAt } = useTasksStore.getState();
            const remoteTasks = await syncTasks(user.id, lastSyncAt ?? undefined);
            mergeRemoteTasks(remoteTasks);
            setLastSyncAt(nowIso);
          } catch (err: any) {
            console.warn('[DataSync] Tasks sync failed:', err.message);
          }
        })(),
        (async () => {
          try {
            const { lastSyncAt, mergeRemoteHabits, mergeRemoteLogs, setLastSyncAt } = useHabitsStore.getState();
            const { habits: remoteHabits, logs: remoteLogs } = await syncHabits(
              user.id,
              lastSyncAt ?? undefined
            );
            mergeRemoteHabits(remoteHabits);
            mergeRemoteLogs(remoteLogs);
            setLastSyncAt(nowIso);
          } catch (err: any) {
            console.warn('[DataSync] Habits sync failed:', err.message);
          }
        })(),
        (async () => {
          try {
            const { lastSyncAt, mergeRemoteGoals, setLastSyncAt } = useGoalsStore.getState();
            const remoteGoals = await syncGoals(user.id, lastSyncAt ?? undefined);
            mergeRemoteGoals(remoteGoals);
            setLastSyncAt(nowIso);
          } catch (err: any) {
            console.warn('[DataSync] Goals sync failed:', err.message);
          }
        })(),
      ]);
    };

    startAutoSync(30000);

    let cancelled = false;
    syncAll().then(() => {
      if (cancelled) return;
    });

    const unsubscribe = NetInfo.addEventListener((state) => {
      const isOnline = state.isConnected ?? false;
      if (isOnline && !wasOnlineRef.current) {
        syncAll();
      }
      wasOnlineRef.current = isOnline;
    });

    return () => {
      cancelled = true;
      stopAutoSync();
      unsubscribe();
    };
  }, [user?.id]);
}

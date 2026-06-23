import { useCallback, useMemo } from 'react';
import { useInsightsStore } from '@/lib/store/insights';
import { useAuthStore } from '@/lib/store/auth';
import { generateInsight, type GeneratedInsight } from '@/lib/ai/insights';
import { useTasksStore } from '@/lib/store/tasks';
import { useHabitsStore } from '@/lib/store/habits';
import { useCalendarStore } from '@/lib/store/calendar';

export function useInsights() {
  const user = useAuthStore((s) => s.user);
  const insights = useInsightsStore((s) => s.insights);
  const isLoading = useInsightsStore((s) => s.isLoading);
  const addInsight = useInsightsStore((s) => s.addInsight);
  const saveInsightToRemote = useInsightsStore((s) => s.saveInsightToRemote);
  const loadInsightsFromRemote = useInsightsStore((s) => s.loadInsightsFromRemote);

  const tasks = useTasksStore((s) => s.tasks);
  const habits = useHabitsStore((s) => s.habits);
  const logs = useHabitsStore((s) => s.logs);
  const events = useCalendarStore((s) => s.events);

  const latestInsight = useMemo(() => insights[0], [insights]);

  const generateWeeklyInsight = useCallback(async () => {
    const insight = await generateInsight(tasks, habits, logs, events);

    const storedData = {
      taskCompletionRate: insight.data.taskCompletionRate,
      habitCompletionRate: insight.data.habitCompletionRate,
      eventCount: insight.data.eventCount,
      efficiency: insight.efficiency,
      habitCorrelation: insight.habitCorrelation,
      dailyBreakdown: insight.data.dailyBreakdown,
    };

    const stored = {
      id: `${insight.data.periodStart}_${insight.data.periodEnd}`,
      userId: user?.id ?? '',
      type: 'weekly_report' as const,
      periodStart: insight.data.periodStart,
      periodEnd: insight.data.periodEnd,
      summary: insight.summary,
      data: storedData,
      createdAt: new Date().toISOString(),
    };

    addInsight(stored);

    if (user?.id) {
      await saveInsightToRemote(user.id, insight, 'weekly_report');
    }

    return insight;
  }, [tasks, habits, logs, events, user?.id, addInsight, saveInsightToRemote]);

  const load = useCallback(async () => {
    if (user?.id) {
      await loadInsightsFromRemote(user.id);
    }
  }, [user?.id, loadInsightsFromRemote]);

  return {
    insights,
    latestInsight,
    isLoading,
    generateWeeklyInsight,
    load,
  };
}

export function useLatestInsight() {
  const latestInsight = useInsightsStore((s) => s.insights[0]);
  return latestInsight;
}

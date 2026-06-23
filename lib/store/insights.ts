import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '@/lib/storage';
import { supabase } from '@/lib/supabase';
import type { InsightType } from '@/lib/supabase/types';
import type { GeneratedInsight } from '@/lib/ai/insights';

export type StoredInsight = {
  id: string;
  userId: string;
  type: InsightType;
  periodStart: string;
  periodEnd: string;
  summary: string;
  data: any;
  createdAt: string;
};

type InsightsState = {
  insights: StoredInsight[];
  isLoading: boolean;

  addInsight: (insight: StoredInsight) => void;
  setInsights: (insights: StoredInsight[]) => void;
  setLoading: (loading: boolean) => void;
  getLatestInsight: () => StoredInsight | undefined;

  saveInsightToRemote: (userId: string, insight: GeneratedInsight, type?: InsightType) => Promise<void>;
  loadInsightsFromRemote: (userId: string) => Promise<void>;
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

export const useInsightsStore = create<InsightsState>()(
  persist(
    (set, get) => ({
      insights: [],
      isLoading: false,

      addInsight: (insight) =>
        set((state) => ({
          insights: [insight, ...state.insights.filter((i) => i.id !== insight.id)].slice(0, 50),
        })),

      setInsights: (insights) => set({ insights }),
      setLoading: (isLoading) => set({ isLoading }),

      getLatestInsight: () => {
        const { insights } = get();
        return insights[0];
      },

      saveInsightToRemote: async (userId, insight, type = 'weekly_report') => {
        const record = {
          user_id: userId,
          type,
          period_start: insight.data.periodStart,
          period_end: insight.data.periodEnd,
          summary: insight.summary,
          data: {
            taskCompletionRate: insight.data.taskCompletionRate,
            habitCompletionRate: insight.data.habitCompletionRate,
            eventCount: insight.data.eventCount,
            efficiency: insight.efficiency,
            habitCorrelation: insight.habitCorrelation,
            dailyBreakdown: insight.data.dailyBreakdown,
          },
        };

        const { error } = await supabase.from('user_insights').upsert(record, {
          onConflict: 'user_id,type,period_start',
        });

        if (error) {
          console.warn('[Insights] Failed to save insight:', error.message);
          return;
        }

        get().loadInsightsFromRemote(userId);
      },

      loadInsightsFromRemote: async (userId) => {
        set({ isLoading: true });
        try {
          const { data, error } = await supabase
            .from('user_insights')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(20);

          if (error) {
            console.warn('[Insights] Failed to load insights:', error.message);
            return;
          }

          const mapped: StoredInsight[] = (data ?? []).map((row) => ({
            id: row.id,
            userId: row.user_id,
            type: row.type,
            periodStart: row.period_start,
            periodEnd: row.period_end,
            summary: row.summary,
            data: row.data,
            createdAt: row.created_at,
          }));

          set({ insights: mapped });
        } finally {
          set({ isLoading: false });
        }
      },
    }),
    {
      name: 'insights-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        insights: state.insights,
      }),
    }
  )
);

import { GreetingCard } from '@/components/features/dashboard/greeting-card';
import { TodayTasks } from '@/components/features/dashboard/today-tasks';
import { TodayEvents } from '@/components/features/dashboard/today-events';
import { HabitQuickLog } from '@/components/features/dashboard/habit-quick-log';
import { WeeklyStats } from '@/components/features/dashboard/weekly-stats';
import { AIQuickInput } from '@/components/features/dashboard/ai-quick-input';
import { GoalCard } from '@/components/features/goals/goal-card';
import { Text } from '@/components/ui/text';
import { Button } from '@/components/ui/button';
import { useDashboard } from '@/hooks/useDashboard';
import { useGoals } from '@/hooks/useGoals';
import type { CalendarEvent } from '@/lib/store/calendar';
import type { Task } from '@/lib/store/tasks';
import { useRouter } from 'expo-router';
import * as React from 'react';
import { Pressable, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFeatureGate } from '@/hooks/useFeatureGate';
import { usePermission } from '@/hooks/usePermission';
import { useInsights } from '@/hooks/useInsights';
import { InsightCard } from '@/components/features/ai/insight-card';
import { OfflineBanner } from '@/components/features/shared/offline-banner';
import { Card, CardContent } from '@/components/ui/card';
import { Sparkles } from 'lucide-react-native';

export default function DashboardScreen() {
  const router = useRouter();
  const {
    userName,
    todayTasks,
    todayEvents,
    overdueTasks,
    dashboardHabits,
    stats,
    weeklyStats,
    toggleTaskStatus,
    toggleHabit,
  } = useDashboard();
  const { activeGoals } = useGoals();

  const handleTaskPress = React.useCallback(
    (task: Task) => {
      toggleTaskStatus(task);
    },
    [toggleTaskStatus]
  );

  const handleAddTask = React.useCallback(() => {
    router.push('/chat');
  }, [router]);

  const handleEventPress = React.useCallback(
    (event: CalendarEvent) => {
      router.push(`/event/${event.id}` as any);
    },
    [router]
  );

  const handleSeeAllEvents = React.useCallback(() => {
    router.push('/about' as any);
  }, [router]);

  const handleSeeAllHabits = React.useCallback(() => {
    router.push('/habits' as any);
  }, [router]);

  const handleAISend = React.useCallback(
    (text: string) => {
      router.push('/chat');
    },
    [router]
  );

  const { checkAndConsume: checkInsights, PaywallComponent: InsightsPaywall } = useFeatureGate('insights');
  const { canUseFeature } = usePermission();
  const { latestInsight, generateWeeklyInsight, load } = useInsights();

  React.useEffect(() => {
    load();
  }, [load]);

  React.useEffect(() => {
    if (canUseFeature('insights').allowed && !latestInsight) {
      generateWeeklyInsight();
    }
  }, [canUseFeature, generateWeeklyInsight, latestInsight]);

  const handleInsightsPress = () => {
    checkInsights({ title: '数据洞察', description: '升级到 Pro 查看每周数据洞察与效率分析。' });
  };

  return (
    <SafeAreaView edges={['top', 'left', 'right']} className="flex-1 bg-background">
      <OfflineBanner />
      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}>
        <View className="px-4 pt-5 pb-6 gap-5">
          <View className="gap-1">
            <Text className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              今日概览
            </Text>
            <Text className="text-2xl font-bold text-foreground tracking-tight">MindFlow 工作台</Text>
          </View>

          <GreetingCard userName={userName} stats={stats} />

          <AIQuickInput onSend={handleAISend} />

          <View className="flex-row gap-4">
            <View className="flex-1 bg-card rounded-xl border border-border/60 p-3 gap-1">
              <Text className="text-[11px] text-muted-foreground">待办完成</Text>
              <Text className="text-xl font-bold text-foreground">{stats.completionRate}%</Text>
            </View>
            <View className="flex-1 bg-card rounded-xl border border-border/60 p-3 gap-1">
              <Text className="text-[11px] text-muted-foreground">今日日程</Text>
              <Text className="text-xl font-bold text-foreground">{stats.todayEvents}</Text>
            </View>
            <View className="flex-1 bg-card rounded-xl border border-border/60 p-3 gap-1">
              <Text className="text-[11px] text-muted-foreground">习惯打卡</Text>
              <Text className="text-xl font-bold text-foreground">
                {stats.habitsDone}/{stats.habitsDue}
              </Text>
            </View>
          </View>

          <TodayTasks
            tasks={todayTasks}
            overdueTasks={overdueTasks}
            onToggle={toggleTaskStatus}
            onPress={handleTaskPress}
            onAddPress={handleAddTask}
          />

          <TodayEvents
            events={todayEvents}
            onPress={handleEventPress}
            onSeeAll={handleSeeAllEvents}
          />

          <HabitQuickLog
            habits={dashboardHabits}
            onToggle={toggleHabit}
            onSeeAll={handleSeeAllHabits}
          />

          <WeeklyStats
            days={weeklyStats.days}
            completionRate={weeklyStats.completionRate}
            total={weeklyStats.total}
            completed={weeklyStats.completed}
          />

          <View className="gap-3">
            <View className="flex-row items-center justify-between">
              <View className="gap-0.5">
                <Text className="text-[15px] font-semibold text-foreground">进行中目标</Text>
                <Text className="text-xs text-muted-foreground">
                  {activeGoals.length === 0 ? '还没有进行中目标' : `${activeGoals.length} 个目标`}
                </Text>
              </View>
              <Button
                variant="ghost"
                size="sm"
                className="px-2"
                onPress={() => router.push('/goals' as any)}>
                <Text className="text-primary text-xs">管理目标</Text>
              </Button>
            </View>
            {activeGoals.slice(0, 2).map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onPress={(goalId) => router.push(`/goal/${goalId}` as any)}
              />
            ))}
          </View>

          {latestInsight ? (
            <InsightCard
              summary={latestInsight.summary}
              periodStart={latestInsight.periodStart}
              periodEnd={latestInsight.periodEnd}
              taskCompletionRate={latestInsight.data?.taskCompletionRate ?? 0}
              habitCompletionRate={latestInsight.data?.habitCompletionRate ?? 0}
              bestDay={latestInsight.data?.efficiency?.bestDay}
              habitCorrelation={latestInsight.data?.habitCorrelation?.conclusion}
              onPress={handleInsightsPress}
              compact
            />
          ) : (
            <Pressable onPress={handleInsightsPress}>
              <Card className="border-border/60 active:bg-accent/50">
                <CardContent className="flex-row items-center gap-3 px-4 py-4">
                  <View className="items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                    <Sparkles size={18} className="text-primary" strokeWidth={2} />
                  </View>
                  <View className="flex-1">
                    <Text className="text-sm font-semibold text-foreground">AI 数据洞察</Text>
                    <Text className="text-xs text-muted-foreground">查看每周效率分析与习惯关联</Text>
                  </View>
                  <Text className="text-xs font-medium text-primary">Pro</Text>
                </CardContent>
              </Card>
            </Pressable>
          )}

          <InsightsPaywall compact />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

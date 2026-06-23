import { useAuthStore } from '@/lib/store/auth';
import { useTasksStore } from '@/lib/store/tasks';
import { useCalendarStore } from '@/lib/store/calendar';
import { useHabitsStore } from '@/lib/store/habits';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function buildUserContext(): string {
  const profile = useAuthStore.getState().profile;
  const today = todayKey();

  const todayTasks = useTasksStore.getState().getTasksForDate(today);
  const todayEvents = useCalendarStore.getState().getEventsForDate(today);
  const activeHabits = useHabitsStore
    .getState()
    .habits.filter((h) => h.isActive);

  const displayName = profile?.display_name ?? '用户';
  const timezone = profile?.timezone ?? 'Asia/Shanghai';
  const language = profile?.language ?? 'zh';
  const credits = profile?.ai_credits_remaining ?? 0;

  return [
    `用户信息: ${displayName}`,
    `时区: ${timezone}`,
    `语言: ${language}`,
    `AI 额度剩余: ${credits}`,
    `今日待办: ${todayTasks.length} 个 (${todayTasks.filter((t) => t.status === 'done').length} 已完成)`,
    `今日日程: ${todayEvents.length} 个事件`,
    `活跃习惯: ${activeHabits.length} 个`,
  ].join('\n');
}

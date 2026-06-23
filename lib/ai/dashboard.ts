import { generateText } from 'ai';
import { createChatModel, DEFAULT_MODEL } from './engine';
import { useAuthStore } from '@/lib/store/auth';
import { useTasksStore } from '@/lib/store/tasks';
import { useCalendarStore } from '@/lib/store/calendar';
import { useHabitsStore } from '@/lib/store/habits';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function getTimeOfDayGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return '夜深了';
  if (hour < 11) return '早上好';
  if (hour < 14) return '中午好';
  if (hour < 18) return '下午好';
  return '晚上好';
}

export function getStaticGreeting(name?: string | null): string {
  const base = getTimeOfDayGreeting();
  return name ? `${base}，${name}` : base;
}

export async function generateAIGreeting(
  modelId: string = DEFAULT_MODEL
): Promise<string> {
  const profile = useAuthStore.getState().profile;
  const today = todayKey();
  const todayTasks = useTasksStore.getState().getTasksForDate(today);
  const todayEvents = useCalendarStore.getState().getEventsForDate(today);
  const habits = useHabitsStore.getState().getTodayHabits();
  const logs = useHabitsStore.getState().logs;

  const completedTasks = todayTasks.filter((t) => t.status === 'done').length;
  const completedHabits = habits.filter((h) => {
    const log = logs.find((l) => l.habitId === h.id && l.date === today);
    return log && log.value >= h.targetValue;
  }).length;

  const name = profile?.display_name ?? '用户';
  const timeGreeting = getTimeOfDayGreeting();

  const prompt = [
    `用户昵称：${name}`,
    `当前时段：${timeGreeting}`,
    `今日待办：${todayTasks.length} 个，已完成 ${completedTasks} 个`,
    `今日日程：${todayEvents.length} 个事件`,
    `今日习惯：${habits.length} 个，已完成 ${completedHabits} 个`,
    '',
    '请生成一句 30 字以内的个性化问候语，鼓励用户、轻松自然，只输出问候内容本身，不要输出 JSON 或解释。',
  ].join('\n');

  try {
    const { text } = await generateText({
      model: createChatModel(modelId),
      system:
        '你是一位贴心的日程助手。根据用户今天的任务、日程和习惯完成情况，生成一句简短、温暖、个性化的问候。只输出问候文本。',
      prompt,
    });
    return text.trim().replace(/^["']|["']$/g, '');
  } catch {
    return getStaticGreeting(name);
  }
}

import { chat } from './engine';
import type { Task } from '@/lib/store/tasks';
import type { Habit, HabitLog } from '@/lib/store/habits';
import type { CalendarEvent } from '@/lib/store/calendar';
import { subDays, startOfWeek, endOfWeek, format, isSameDay, parseISO } from 'date-fns';

export type WeeklyInsightData = {
  periodStart: string;
  periodEnd: string;
  taskCompletionRate: number;
  totalTasks: number;
  completedTasks: number;
  habitCompletionRate: number;
  totalHabitDays: number;
  completedHabitDays: number;
  eventCount: number;
  dailyBreakdown: {
    date: string;
    tasksTotal: number;
    tasksCompleted: number;
    habitsDue: number;
    habitsCompleted: number;
    events: number;
  }[];
};

export type EfficiencyInsight = {
  bestDay: string;
  worstDay: string;
  averageCompletionRate: number;
  peakDay?: string;
};

export type HabitCorrelation = {
  habitId: string;
  habitName: string;
  withHabitTaskRate: number;
  withoutHabitTaskRate: number;
  liftPercent: number;
  conclusion: string;
};

export type GeneratedInsight = {
  summary: string;
  data: WeeklyInsightData;
  efficiency: EfficiencyInsight;
  habitCorrelation?: HabitCorrelation;
};

function getTaskDateKey(task: Task): string | null {
  if (task.dueDate) return task.dueDate;
  if (task.createdAt) return task.createdAt.slice(0, 10);
  return null;
}

function getEventDateKey(event: CalendarEvent): string {
  return event.startTime.slice(0, 10);
}

function isCompleted(task: Task): boolean {
  return task.status === 'done';
}

function isHabitCompletedOnDay(habit: Habit, logs: HabitLog[], date: string): boolean {
  const log = logs.find((l) => l.habitId === habit.id && l.date === date);
  return !!log && log.value >= habit.targetValue;
}

function isHabitDueOnDay(habit: Habit, date: string): boolean {
  if (!habit.isActive) return false;
  const jsDay = new Date(date).getDay();
  // frequencyDays uses 1=Mon ... 7=Sun, but JS getDay() returns 0=Sun ... 6=Sat
  const mappedDay = jsDay === 0 ? 7 : jsDay;
  return habit.frequencyDays.includes(mappedDay);
}

export function buildWeeklyInsightData(
  tasks: Task[],
  habits: Habit[],
  logs: HabitLog[],
  events: CalendarEvent[],
  referenceDate = new Date()
): WeeklyInsightData {
  const start = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const end = endOfWeek(referenceDate, { weekStartsOn: 1 });
  const periodStart = format(start, 'yyyy-MM-dd');
  const periodEnd = format(end, 'yyyy-MM-dd');

  const days: WeeklyInsightData['dailyBreakdown'] = [];
  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dateKey = format(d, 'yyyy-MM-dd');
    const dayTasks = tasks.filter((t) => getTaskDateKey(t) === dateKey);
    const dayEvents = events.filter((e) => getEventDateKey(e) === dateKey);
    const dueHabits = habits.filter((h) => h.isActive && isHabitDueOnDay(h, dateKey));
    const completedHabits = dueHabits.filter((h) => isHabitCompletedOnDay(h, logs, dateKey));

    days.push({
      date: dateKey,
      tasksTotal: dayTasks.length,
      tasksCompleted: dayTasks.filter(isCompleted).length,
      habitsDue: dueHabits.length,
      habitsCompleted: completedHabits.length,
      events: dayEvents.length,
    });
  }

  const totalTasks = days.reduce((sum, d) => sum + d.tasksTotal, 0);
  const completedTasks = days.reduce((sum, d) => sum + d.tasksCompleted, 0);
  const totalHabitDays = days.reduce((sum, d) => sum + d.habitsDue, 0);
  const completedHabitDays = days.reduce((sum, d) => sum + d.habitsCompleted, 0);
  const eventCount = days.reduce((sum, d) => sum + d.events, 0);

  return {
    periodStart,
    periodEnd,
    taskCompletionRate: totalTasks === 0 ? 0 : Math.round((completedTasks / totalTasks) * 100),
    totalTasks,
    completedTasks,
    habitCompletionRate: totalHabitDays === 0 ? 0 : Math.round((completedHabitDays / totalHabitDays) * 100),
    totalHabitDays,
    completedHabitDays,
    eventCount,
    dailyBreakdown: days,
  };
}

export function analyzeEfficiency(data: WeeklyInsightData): EfficiencyInsight {
  const days = data.dailyBreakdown
    .map((d) => ({
      ...d,
      rate: d.tasksTotal === 0 ? 0 : Math.round((d.tasksCompleted / d.tasksTotal) * 100),
    }))
    .sort((a, b) => b.rate - a.rate);

  const best = days[0];
  const worst = days[days.length - 1];
  const average =
    days.length === 0
      ? 0
      : Math.round(days.reduce((sum, d) => sum + d.rate, 0) / days.length);

  return {
    bestDay: best ? `${format(parseISO(best.date), 'MM月dd日')}（${best.rate}%）` : '-',
    worstDay: worst ? `${format(parseISO(worst.date), 'MM月dd日')}（${worst.rate}%）` : '-',
    averageCompletionRate: average,
    peakDay: best?.date,
  };
}

export function analyzeHabitCorrelation(
  data: WeeklyInsightData,
  habits: Habit[],
  logs: HabitLog[],
  tasks: Task[]
): HabitCorrelation | undefined {
  if (habits.length === 0) return undefined;

  // Pick the most consistently tracked active habit
  const targetHabit = habits
    .filter((h) => h.isActive)
    .map((h) => ({
      habit: h,
      completedDays: data.dailyBreakdown.filter((d) => isHabitCompletedOnDay(h, logs, d.date)).length,
    }))
    .sort((a, b) => b.completedDays - a.completedDays)[0]?.habit;

  if (!targetHabit) return undefined;

  const habitLogs = logs.filter((l) => l.habitId === targetHabit.id);
  const habitDates = new Set(habitLogs.map((l) => l.date));

  const withHabitDays = data.dailyBreakdown.filter((d) => habitDates.has(d.date));
  const withoutHabitDays = data.dailyBreakdown.filter((d) => !habitDates.has(d.date));

  const withRate =
    withHabitDays.reduce((sum, d) => sum + (d.tasksTotal === 0 ? 0 : d.tasksCompleted / d.tasksTotal), 0) /
      (withHabitDays.length || 1);
  const withoutRate =
    withoutHabitDays.reduce((sum, d) => sum + (d.tasksTotal === 0 ? 0 : d.tasksCompleted / d.tasksTotal), 0) /
      (withoutHabitDays.length || 1);

  const liftPercent = withoutRate === 0 ? 0 : Math.round(((withRate - withoutRate) / withoutRate) * 100);

  return {
    habitId: targetHabit.id,
    habitName: targetHabit.name,
    withHabitTaskRate: Math.round(withRate * 100),
    withoutHabitTaskRate: Math.round(withoutRate * 100),
    liftPercent,
    conclusion:
      liftPercent > 0
        ? `完成「${targetHabit.name}」的日子，任务完成率高出 ${liftPercent}%`
        : `完成「${targetHabit.name}」的日子，任务完成率与平日基本持平`,
  };
}

export async function generateWeeklyInsightSummary(
  data: WeeklyInsightData,
  efficiency: EfficiencyInsight,
  habitCorrelation?: HabitCorrelation
): Promise<string> {
  const prompt = `你是一位效率教练。根据以下用户一周数据，用中文写一段 2-3 行的简短洞察总结，语气鼓励、具体。

周期：${data.periodStart} 至 ${data.periodEnd}
任务完成率：${data.taskCompletionRate}%（${data.completedTasks}/${data.totalTasks}）
习惯完成率：${data.habitCompletionRate}%（${data.completedHabitDays}/${data.totalHabitDays}）
日程事件数：${data.eventCount}
最高效一天：${efficiency.bestDay}
最低效一天：${efficiency.worstDay}
平均完成率：${efficiency.averageCompletionRate}%
${habitCorrelation ? habitCorrelation.conclusion : ''}

只输出总结文本，不要标题、列表或多余解释。`;

  try {
    return await chat('mimo-v2.5-pro', [
      { role: 'system', content: '你是 MindFlow 的 AI 效率教练，只输出简短中文洞察。' },
      { role: 'user', content: prompt },
    ]);
  } catch (err: any) {
    console.warn('[Insights] AI summary failed:', err.message);
    // Fallback summary
    return `本周任务完成率为 ${data.taskCompletionRate}%，习惯完成率为 ${data.habitCompletionRate}%。${
      habitCorrelation ? habitCorrelation.conclusion + '。' : ''
    }继续保持！`;
  }
}

export async function generateInsight(
  tasks: Task[],
  habits: Habit[],
  logs: HabitLog[],
  events: CalendarEvent[],
  referenceDate = new Date()
): Promise<GeneratedInsight> {
  const data = buildWeeklyInsightData(tasks, habits, logs, events, referenceDate);
  const efficiency = analyzeEfficiency(data);
  const habitCorrelation = analyzeHabitCorrelation(data, habits, logs, tasks);
  const summary = await generateWeeklyInsightSummary(data, efficiency, habitCorrelation);

  return {
    summary,
    data,
    efficiency,
    habitCorrelation,
  };
}

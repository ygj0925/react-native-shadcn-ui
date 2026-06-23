import { tool, jsonSchema } from 'ai';
import { useTasksStore, type TaskPriority } from '@/lib/store/tasks';
import { useNotesStore } from '@/lib/store/notes';
import { useCalendarStore } from '@/lib/store/calendar';
import { useHabitsStore } from '@/lib/store/habits';
import { buildUserContext } from './context';
import { parseEventFromText } from './notes';

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

function findHabitByName(name: string) {
  const habits = useHabitsStore.getState().habits;
  const q = name.trim().toLowerCase();
  return habits.find((h) => h.name.toLowerCase().includes(q));
}

type CreateTaskInput = {
  title: string;
  description?: string;
  due_date?: string;
  due_time?: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
};

type CreateNoteInput = {
  title: string;
  content?: string;
  category?: string;
  tags?: string[];
};

type CreateCalendarEventInput = {
  title: string;
  start_time: string;
  end_time: string;
  location?: string;
  reminder_minutes?: number;
};

type LogHabitInput = {
  habit_name: string;
  value?: number;
  note?: string;
  date?: string;
};

type SearchNotesInput = {
  query: string;
  category?: string;
  limit?: number;
};

type GetScheduleInput = {
  date?: string;
};

type GetHabitStatsInput = {
  habit_name?: string;
  days?: number;
};

type GenerateReportInput = {
  type: 'weekly' | 'monthly';
};

export const dataTools = {
  create_task: tool({
    description: '创建一个新的待办任务',
    inputSchema: jsonSchema<CreateTaskInput>({
      type: 'object',
      properties: {
        title: { type: 'string', description: '任务标题' },
        description: { type: 'string', description: '任务描述' },
        due_date: { type: 'string', description: '截止日期 (YYYY-MM-DD)' },
        due_time: { type: 'string', description: '截止时间 (HH:MM)' },
        priority: {
          type: 'string',
          enum: ['low', 'medium', 'high', 'urgent'],
          description: '优先级',
        },
      },
      required: ['title'],
    }),
    execute: async (input) => {
      const task = useTasksStore.getState().createTask({
        title: input.title,
        description: input.description ?? '',
        dueDate: input.due_date ?? null,
        dueTime: input.due_time ?? null,
        priority: input.priority ?? 'medium',
      });
      return { id: task.id, title: task.title, success: true };
    },
  }),

  create_note: tool({
    description: '创建一篇新笔记',
    inputSchema: jsonSchema<CreateNoteInput>({
      type: 'object',
      properties: {
        title: { type: 'string', description: '笔记标题' },
        content: { type: 'string', description: '笔记正文' },
        category: { type: 'string', description: '分类' },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: '标签列表',
        },
      },
      required: ['title'],
    }),
    execute: async (input) => {
      const note = useNotesStore.getState().createNote({
        title: input.title,
        content: input.content ?? '',
        plainText: input.content ?? '',
        category: (input.category as any) ?? 'personal',
        tags: input.tags ?? [],
      });
      return { id: note.id, title: note.title, success: true };
    },
  }),

  create_calendar_event: tool({
    description: '创建一个日历事件',
    inputSchema: jsonSchema<CreateCalendarEventInput>({
      type: 'object',
      properties: {
        title: { type: 'string', description: '事件标题' },
        start_time: { type: 'string', description: '开始时间 (ISO 8601)' },
        end_time: { type: 'string', description: '结束时间 (ISO 8601)' },
        location: { type: 'string', description: '地点' },
        reminder_minutes: { type: 'number', description: '提前提醒分钟数' },
      },
      required: ['title', 'start_time', 'end_time'],
    }),
    execute: async (input) => {
      const event = useCalendarStore.getState().createEvent({
        title: input.title,
        startTime: input.start_time,
        endTime: input.end_time,
        location: input.location ?? '',
        reminderMinutes: input.reminder_minutes ?? 15,
      });
      return { id: event.id, title: event.title, success: true };
    },
  }),

  log_habit: tool({
    description: '记录习惯打卡',
    inputSchema: jsonSchema<LogHabitInput>({
      type: 'object',
      properties: {
        habit_name: { type: 'string', description: '习惯名称' },
        value: { type: 'number', description: '完成数值' },
        note: { type: 'string', description: '备注' },
        date: { type: 'string', description: '日期 (YYYY-MM-DD)，默认今天' },
      },
      required: ['habit_name'],
    }),
    execute: async (input) => {
      const habit = findHabitByName(input.habit_name);
      if (!habit) {
        return {
          habit_name: input.habit_name,
          id: '',
          success: false,
          message: '未找到该习惯',
        };
      }
      const log = useHabitsStore.getState().logHabit(habit.id, {
        date: input.date ?? todayKey(),
        value: input.value ?? habit.targetValue,
        note: input.note ?? '',
      });
      return {
        id: log.id,
        habit_name: habit.name,
        success: true,
        message: `已记录 ${habit.name} ${log.value} ${habit.unit}`,
      };
    },
  }),

  search_notes: tool({
    description: '搜索笔记内容',
    inputSchema: jsonSchema<SearchNotesInput>({
      type: 'object',
      properties: {
        query: { type: 'string', description: '搜索关键词' },
        category: { type: 'string', description: '分类筛选' },
        limit: { type: 'number', description: '返回数量上限' },
      },
      required: ['query'],
    }),
    execute: async (input) => {
      const store = useNotesStore.getState();
      const q = input.query.toLowerCase();
      let notes = store.notes.filter(
        (n) =>
          !n.isArchived &&
          (n.title.toLowerCase().includes(q) ||
            n.plainText.toLowerCase().includes(q) ||
            n.tags.some((t) => t.toLowerCase().includes(q)))
      );
      if (input.category) {
        notes = notes.filter((n) => n.category === input.category);
      }
      const limit = input.limit ?? 5;
      return {
        notes: notes.slice(0, limit).map((n) => ({
          id: n.id,
          title: n.title,
          category: n.category,
          tags: n.tags,
        })),
      };
    },
  }),

  get_schedule: tool({
    description: '获取指定日期的日程安排',
    inputSchema: jsonSchema<GetScheduleInput>({
      type: 'object',
      properties: {
        date: { type: 'string', description: '日期 (YYYY-MM-DD)，默认今天' },
      },
    }),
    execute: async (input) => {
      const date = input.date ?? todayKey();
      const events = useCalendarStore.getState().getEventsForDate(date);
      const tasks = useTasksStore.getState().getTasksForDate(date);
      return {
        date,
        events: events.map((e) => ({
          id: e.id,
          title: e.title,
          start_time: e.startTime,
          end_time: e.endTime,
        })),
        tasks: tasks.map((t) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
        })),
      };
    },
  }),

  get_habit_stats: tool({
    description: '获取习惯统计数据',
    inputSchema: jsonSchema<GetHabitStatsInput>({
      type: 'object',
      properties: {
        habit_name: { type: 'string', description: '习惯名称' },
        days: { type: 'number', description: '统计天数，默认 7' },
      },
    }),
    execute: async (input) => {
      const days = input.days ?? 7;
      if (!input.habit_name) {
        return {
          habit_name: '',
          current_streak: 0,
          completion_rate: 0,
          total_logs: 0,
        };
      }
      const habit = findHabitByName(input.habit_name);
      if (!habit) {
        return {
          habit_name: input.habit_name,
          current_streak: 0,
          completion_rate: 0,
          total_logs: 0,
        };
      }
      const store = useHabitsStore.getState();
      return {
        habit_name: habit.name,
        current_streak: store.getCurrentStreak(habit.id),
        completion_rate: store.getCompletionRate(habit.id, days),
        total_logs: store.getLogsForHabit(habit.id).length,
      };
    },
  }),

  generate_report: tool({
    description: '生成效率报告（占位，将在洞察引擎中实现）',
    inputSchema: jsonSchema<GenerateReportInput>({
      type: 'object',
      properties: {
        type: { type: 'string', enum: ['weekly', 'monthly'], description: '报告类型' },
      },
      required: ['type'],
    }),
    execute: async (input) => {
      return {
        type: input.type,
        summary: `${input.type === 'weekly' ? '周报' : '月报'}功能将在洞察引擎阶段完整实现。`,
      };
    },
  }),

  create_event_from_text: tool({
    description: '用自然语言创建日历事件，例如"明天下午3点开会"',
    inputSchema: jsonSchema<{ text: string }>({
      type: 'object',
      properties: {
        text: { type: 'string', description: '描述事件的自然语言文本' },
      },
      required: ['text'],
    }),
    execute: async (input) => {
      const eventData = await parseEventFromText(input.text);
      if (!eventData) {
        return { success: false, message: '无法解析事件时间' };
      }
      const event = useCalendarStore.getState().createEvent({
        title: eventData.title,
        startTime: eventData.start_time,
        endTime: eventData.end_time,
        reminderMinutes: 15,
      });
      return { id: event.id, title: event.title, success: true };
    },
  }),
};

export function getAllTools() {
  return {
    ...dataTools,
  };
}

export { buildUserContext };

# MindFlow v1.0 — 技术设计

## 架构概览

```
┌─────────────────────────────────────────────────────────────────┐
│                      MindFlow 架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  展示层 ─── Expo Router + NativeWind + Reanimated               │
│     │                                                           │
│  状态层 ─── Zustand + MMKV (本地) + Supabase Realtime (远程)    │
│     │                                                           │
│  服务层 ─── AI Engine + Sync Engine + RevenueCat                │
│     │                                                           │
│  数据层 ─── SQLite (本地) + Supabase PostgreSQL (云端)          │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## 数据库设计

### Supabase PostgreSQL Schema

```sql
-- 用户表 (Supabase Auth 自动管理，扩展字段)
create table profiles (
  id uuid references auth.users primary key,
  display_name text,
  avatar_url text,
  subscription_tier text default 'free' check (subscription_tier in ('free', 'pro', 'team')),
  ai_credits_remaining integer default 10,
  ai_credits_reset_at date default current_date,
  timezone text default 'Asia/Shanghai',
  language text default 'zh' check (language in ('zh', 'en', 'ar')),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 笔记表
create table notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null default '',
  content jsonb default '{}',  -- TipTap JSON 格式
  plain_text text default '',
  category text default 'personal',
  tags text[] default '{}',
  is_pinned boolean default false,
  is_archived boolean default false,
  ai_summary text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 任务表
create table tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text default '',
  status text default 'pending' check (status in ('pending', 'in_progress', 'done', 'cancelled')),
  priority text default 'medium' check (priority in ('low', 'medium', 'high', 'urgent')),
  due_date date,
  due_time time,
  calendar_event_id uuid,
  note_id uuid references notes(id) on delete set null,
  goal_id uuid,
  recurrence text default 'none' check (recurrence in ('none', 'daily', 'weekly', 'monthly')),
  completed_at timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 日历事件表
create table calendar_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text default '',
  location text default '',
  start_time timestamptz not null,
  end_time timestamptz not null,
  is_all_day boolean default false,
  recurrence jsonb default '{}',
  reminder_minutes integer default 15,
  color text default 'hsl(var(--primary))',
  external_calendar_id text,
  task_id uuid references tasks(id) on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 习惯表
create table habits (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  name text not null,
  icon text default '✅',
  color text default 'hsl(var(--primary))',
  frequency text default 'daily' check (frequency in ('daily', 'weekly', 'custom')),
  frequency_days integer[] default '{}',  -- weekly: [1,3,5] = 周一三五
  target_value integer default 1,
  unit text default '次',
  reminder_time time,
  is_active boolean default true,
  sort_order integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 习惯打卡记录
create table habit_logs (
  id uuid primary key default gen_random_uuid(),
  habit_id uuid references habits(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null default current_date,
  value integer default 1,
  note text default '',
  created_at timestamptz default now(),
  unique(habit_id, date)  -- 每个习惯每天只能有一条记录
);

-- 目标表
create table goals (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text default '',
  parent_id uuid references goals(id) on delete cascade,
  type text default 'custom' check (type in ('okr', 'milestone', 'custom')),
  status text default 'not_started' check (status in ('not_started', 'in_progress', 'achieved', 'abandoned')),
  target_date date,
  progress integer default 0 check (progress >= 0 and progress <= 100),
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI 对话表
create table ai_conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  title text default '新对话',
  model text default 'mimo',
  context_type text default 'general' check (context_type in ('general', 'note', 'task', 'calendar', 'habit', 'goal')),
  context_id uuid,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- AI 消息表
create table ai_messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references ai_conversations(id) on delete cascade not null,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null default '',
  tool_calls jsonb default '[]',
  tool_result jsonb default '{}',
  tokens_used integer default 0,
  created_at timestamptz default now()
);

-- AI 洞察表
create table user_insights (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references profiles(id) on delete cascade not null,
  type text not null check (type in ('weekly_report', 'monthly_report', 'efficiency', 'habit_correlation')),
  period_start date not null,
  period_end date not null,
  data jsonb default '{}',
  summary text default '',
  created_at timestamptz default now()
);

-- 索引
create index idx_notes_user on notes(user_id, updated_at desc);
create index idx_notes_tags on notes using gin(tags);
create index idx_notes_search on notes using gin(to_tsvector('simple', plain_text));
create index idx_tasks_user_date on tasks(user_id, due_date);
create index idx_tasks_status on tasks(user_id, status);
create index idx_events_user_time on calendar_events(user_id, start_time);
create index idx_habits_user on habits(user_id, sort_order);
create index idx_habit_logs_date on habit_logs(user_id, date desc);
create index idx_goals_user on goals(user_id, status);
create index idx_ai_conv_user on ai_conversations(user_id, updated_at desc);

-- RLS (Row Level Security)
alter table profiles enable row level security;
alter table notes enable row level security;
alter table tasks enable row level security;
alter table calendar_events enable row level security;
alter table habits enable row level security;
alter table habit_logs enable row level security;
alter table goals enable row level security;
alter table ai_conversations enable row level security;
alter table ai_messages enable row level security;
alter table user_insights enable row level security;

-- 每个用户只能访问自己的数据
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can manage own notes" on notes for all using (auth.uid() = user_id);
create policy "Users can manage own tasks" on tasks for all using (auth.uid() = user_id);
create policy "Users can manage own events" on calendar_events for all using (auth.uid() = user_id);
create policy "Users can manage own habits" on habits for all using (auth.uid() = user_id);
create policy "Users can manage own habit_logs" on habit_logs for all using (auth.uid() = user_id);
create policy "Users can manage own goals" on goals for all using (auth.uid() = user_id);
create policy "Users can manage own conversations" on ai_conversations for all using (auth.uid() = user_id);
create policy "Users can manage own messages" on ai_messages for all using (
  exists (select 1 from ai_conversations where id = conversation_id and user_id = auth.uid())
);
create policy "Users can view own insights" on user_insights for all using (auth.uid() = user_id);

-- updated_at 自动更新触发器
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_profiles_updated_at before update on profiles for each row execute function update_updated_at();
create trigger update_notes_updated_at before update on notes for each row execute function update_updated_at();
create trigger update_tasks_updated_at before update on tasks for each row execute function update_updated_at();
create trigger update_events_updated_at before update on calendar_events for each row execute function update_updated_at();
create trigger update_habits_updated_at before update on habits for each row execute function update_updated_at();
create trigger update_goals_updated_at before update on goals for each row execute function update_updated_at();
create trigger update_conversations_updated_at before update on ai_conversations for each row execute function update_updated_at();
```

### 本地 SQLite Schema

本地 SQLite 用于离线存储，结构与 Supabase 一致，额外增加同步元数据：

```sql
-- 每张表额外增加:
-- _sync_status: 'synced' | 'pending' | 'conflict'
-- _synced_at: 最后同步时间
-- _local_id: 本地临时 ID (上传前)
```

## AI 引擎设计

### 多模型路由

```typescript
// lib/ai/engine.ts
interface AIProvider {
  chat(messages: Message[], tools?: Tool[]): Promise<ChatResponse>
  streamChat(messages: Message[], tools?: Tool[]): AsyncGenerator<Chunk>
}

// 路由策略
const MODEL_ROUTER = {
  default: 'mimo',           // 默认使用 Mimo (成本低)
  complex_reasoning: 'gpt-4o', // 复杂推理用 GPT-4o
  long_context: 'claude-sonnet', // 长上下文用 Claude
  quick_answer: 'mimo',      // 快速回答用 Mimo
}
```

### Function Calling 工具定义

```typescript
// lib/ai/tools.ts
const TOOLS = [
  {
    name: 'create_task',
    description: '创建一个新的待办任务',
    parameters: {
      title: z.string(),
      due_date: z.string().optional(),
      due_time: z.string().optional(),
      priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
      description: z.string().optional(),
    }
  },
  {
    name: 'create_note',
    description: '创建一篇新笔记',
    parameters: {
      title: z.string(),
      content: z.string(),
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }
  },
  {
    name: 'create_calendar_event',
    description: '创建一个日历事件',
    parameters: {
      title: z.string(),
      start_time: z.string(),
      end_time: z.string(),
      location: z.string().optional(),
      reminder_minutes: z.number().optional(),
    }
  },
  {
    name: 'log_habit',
    description: '记录习惯打卡',
    parameters: {
      habit_name: z.string(),
      value: z.number().optional(),
      note: z.string().optional(),
    }
  },
  {
    name: 'search_notes',
    description: '搜索笔记内容',
    parameters: {
      query: z.string(),
      category: z.string().optional(),
      limit: z.number().optional(),
    }
  },
  {
    name: 'get_schedule',
    description: '获取指定日期的日程安排',
    parameters: {
      date: z.string(),
    }
  },
  {
    name: 'get_habit_stats',
    description: '获取习惯统计数据',
    parameters: {
      habit_name: z.string().optional(),
      days: z.number().optional(),
    }
  },
  {
    name: 'generate_report',
    description: '生成效率报告',
    parameters: {
      type: z.enum(['weekly', 'monthly']),
    }
  },
]
```

### 上下文构建

```typescript
// lib/ai/context.ts
// 每次 AI 对话时，自动注入用户上下文
async function buildUserContext(userId: string): Promise<string> {
  const [profile, todayTasks, todayEvents, activeHabits, activeGoals] = await Promise.all([
    getProfile(userId),
    getTodayTasks(userId),
    getTodayEvents(userId),
    getActiveHabits(userId),
    getActiveGoals(userId),
  ])

  return `
用户信息: ${profile.display_name}, 时区 ${profile.timezone}
今日待办: ${todayTasks.length} 个任务 (${todayTasks.filter(t => t.status === 'done').length} 已完成)
今日日程: ${todayEvents.length} 个事件
活跃习惯: ${activeHabits.length} 个
进行中目标: ${activeGoals.length} 个
  `.trim()
}
```

## 离线同步策略

```
写操作流程:
  用户操作 → 写入本地 SQLite → 标记 _sync_status='pending' → UI 即时更新
                                    ↓
                            同步队列 (MMKV 持久化)
                                    ↓
                            网络可用时批量推送 → Supabase
                                    ↓
                            成功 → _sync_status='synced'

读操作流程:
  本地 SQLite 优先 → 后台静默拉取 Supabase 更新 → 合并到本地

冲突解决: Last-Write-Wins (基于 updated_at)
```

## 订阅集成 (RevenueCat)

```
┌─────────────────────────────────────────────────┐
│  RevenueCat 配置                                │
├─────────────────────────────────────────────────┤
│                                                 │
│  Offering:                                      │
│  ├─ mindflow_pro_monthly    ¥28/月             │
│  ├─ mindflow_pro_annual     ¥268/年            │
│  ├─ mindflow_team_monthly   ¥68/人/月          │
│  └─ mindflow_team_annual    ¥588/人/年         │
│                                                 │
│  Entitlements:                                  │
│  ├─ pro → 解锁所有高级功能                     │
│  └─ team → 解锁团队功能                        │
│                                                 │
│  服务端验证: Supabase Edge Function             │
│  ├─ RevenueCat Webhook → 更新 profiles 表      │
│  └─ subscription_tier 字段控制权限              │
│                                                 │
└─────────────────────────────────────────────────┘
```

## 路由设计

```
app/
├─ (tabs)/                     # Tab 导航
│  ├─ index.tsx                # 今日首页 (Dashboard)
│  ├─ calendar.tsx             # 日程管理
│  ├─ notes.tsx                # 笔记列表
│  ├─ habits.tsx               # 习惯追踪
│  └─ profile.tsx              # 个人中心
├─ note/
│  ├─ new.tsx                  # 新建笔记
│  └─ [id].tsx                 # 编辑笔记
├─ goal/
│  └─ [id].tsx                 # 目标详情
├─ settings/
│  ├─ index.tsx                # 设置首页
│  ├─ subscription.tsx         # 订阅管理
│  ├─ ai-model.tsx             # AI 模型选择
│  └─ data.tsx                 # 数据导入导出
├─ auth/
│  ├─ login.tsx                # 登录
│  └─ register.tsx             # 注册
├─ chat.tsx                    # AI 对话 (已有)
└─ _layout.tsx                 # 根布局
```

## 组件架构

```
components/
├─ ui/                         # 基础 UI 组件 (已有，保持不变)
├─ features/                   # 业务组件
│  ├─ dashboard/
│  │  ├─ greeting-card.tsx     # AI 问候卡片
│  │  ├─ today-tasks.tsx       # 今日任务列表
│  │  ├─ today-events.tsx      # 今日日程列表
│  │  ├─ habit-quick-log.tsx   # 习惯快速打卡
│  │  ├─ weekly-stats.tsx      # 本周统计
│  │  └─ ai-quick-input.tsx    # AI 快速输入
│  ├─ calendar/
│  │  ├─ calendar-view.tsx     # 日历视图 (月/周/日)
│  │  ├─ event-card.tsx        # 事件卡片
│  │  ├─ event-form.tsx        # 事件表单
│  │  └─ time-picker.tsx       # 时间选择器
│  ├─ notes/
│  │  ├─ note-card.tsx         # 笔记卡片
│  │  ├─ note-editor.tsx       # 富文本编辑器封装
│  │  ├─ note-list.tsx         # 笔记列表
│  │  ├─ note-category-tabs.tsx# 分类标签
│  │  └─ ai-summary.tsx        # AI 摘要组件
│  ├─ habits/
│  │  ├─ habit-card.tsx        # 习惯卡片
│  │  ├─ habit-form.tsx        # 习惯创建/编辑
│  │  ├─ habit-log-modal.tsx   # 打卡弹窗
│  │  ├─ streak-calendar.tsx   # 连续打卡日历
│  │  └─ stats-chart.tsx       # 统计图表
│  ├─ goals/
│  │  ├─ goal-card.tsx         # 目标卡片
│  │  ├─ goal-form.tsx         # 目标创建/编辑
│  │  ├─ progress-ring.tsx     # 环形进度条
│  │  └─ key-results.tsx       # 关键结果列表
│  └─ ai/
│     ├─ chat-input.tsx        # AI 输入框
│     ├─ message-bubble.tsx    # 消息气泡
│     ├─ tool-result-card.tsx  # 工具调用结果卡片
│     └─ insight-card.tsx      # 洞察卡片
```

## 状态管理

```
store/
├─ auth.ts          # 认证状态 (改造现有)
├─ notes.ts         # 笔记 CRUD + 筛选 + 搜索
├─ tasks.ts         # 任务 CRUD + 状态管理
├─ calendar.ts      # 日历事件 + 视图状态
├─ habits.ts        # 习惯 + 打卡记录
├─ goals.go         # 目标 + 进度
├─ ai.ts            # AI 对话 + 工具调用
└─ subscription.ts  # 订阅状态 + 权限检查

每个 store 遵循统一模式:
1. 本地状态 (MMKV/SQLite)
2. 远程同步 (Supabase)
3. 乐观更新 (先更新 UI，后同步)
4. 错误回滚
```

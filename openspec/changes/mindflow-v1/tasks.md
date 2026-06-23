# MindFlow v1.0 — 开发任务清单

## 阶段一: 核心基础 (第1个月)

### Week 1: 项目架构 + Supabase 集成

- [x] **1.1** 安装 Supabase 依赖 (`@supabase/supabase-js`)
- [x] **1.2** 创建 Supabase 项目，获取 API Key
- [x] **1.3** 编写 `lib/supabase/client.ts` — Supabase 客户端初始化
- [x] **1.4** 编写 `lib/supabase/auth.ts` — 认证封装 (邮箱注册/登录/登出/Session管理)
- [x] **1.5** 编写 `lib/supabase/types.ts` — TypeScript 类型定义 (从 DB Schema 生成)
- [x] **1.6** 在 Supabase Dashboard 执行 SQL Schema (建表 + RLS + 索引)
- [x] **1.7** 改造 `lib/store/auth.ts` — 集成 Supabase Auth (替换本地模拟)
- [x] **1.8** 改造 `app/auth/login.tsx` + `register.tsx` — 接入真实认证
- [x] **1.9** 添加 `lib/sync/engine.ts` 基础框架 — 同步引擎骨架
- [x] **1.10** 添加 `lib/sync/queue.ts` — 操作队列 (MMKV 持久化)
- [x] **1.11** 配置环境变量 (Supabase URL + Anon Key)

### Week 2: 笔记系统 (本地优先)

- [x] **2.1** 安装 `@10play/tentap-editor` + 依赖
- [x] **2.2** 创建 `lib/db/schema.ts` — 本地 SQLite Schema
- [x] **2.3** 创建 `lib/db/migrations.ts` — 数据库迁移管理
- [x] **2.4** 编写 `hooks/useNotes.ts` — 笔记 CRUD Hook (本地优先)
- [x] **2.5** 编写 `store/notes.ts` — 笔记状态管理
- [x] **2.6** 创建 `components/features/notes/note-editor.tsx` — 富文本编辑器封装
- [x] **2.7** 创建 `components/features/notes/note-card.tsx` — 笔记卡片组件
- [x] **2.8** 创建 `components/features/notes/note-list.tsx` — 笔记列表 (带搜索/筛选)
- [x] **2.9** 创建 `components/features/notes/note-category-tabs.tsx` — 分类标签
- [x] **2.10** 创建 `app/(tabs)/notes.tsx` — 笔记列表页
- [x] **2.11** 创建 `app/note/new.tsx` — 新建笔记页
- [x] **2.12** 创建 `app/note/[id].tsx` — 编辑笔记页
- [x] **2.13** 实现笔记 ↔ Supabase 同步 (push + pull)

### Week 3: 日程管理增强

- [x] **3.1** 编写 `hooks/useCalendar.ts` — 日历事件 CRUD
- [x] **3.2** 编写 `hooks/useTasks.ts` — 任务 CRUD (集成 Supabase)
- [x] **3.3** 编写 `store/tasks.ts` — 任务状态管理
- [x] **3.4** 编写 `store/calendar.ts` — 日历状态管理
- [x] **3.5** 改造 `features/about/about-screen.tsx` → `components/features/calendar/calendar-view.tsx`
- [x] **3.6** 创建 `components/features/calendar/event-card.tsx` — 事件卡片
- [x] **3.7** 创建 `components/features/calendar/event-form.tsx` — 事件创建/编辑表单
- [x] **3.8** 创建 `app/(tabs)/calendar.tsx` — 日程页 (月/周/日视图 + 任务列表)
- [x] **3.9** 实现任务-日历事件关联 (创建任务时可选关联事件)
- [x] **3.10** 实现日历事件 ↔ Supabase 同步
- [x] **3.11** 实现任务 ↔ Supabase 同步

### Week 4: 习惯追踪

- [x] **4.1** 编写 `hooks/useHabits.ts` — 习惯 CRUD + 打卡
- [x] **4.2** 编写 `store/habits.ts` — 习惯状态管理
- [x] **4.3** 创建 `components/features/habits/habit-card.tsx` — 习惯卡片
- [x] **4.4** 创建 `components/features/habits/habit-form.tsx` — 习惯创建/编辑
- [x] **4.5** 创建 `components/features/habits/habit-log-modal.tsx` — 打卡弹窗 (支持数值)
- [x] **4.6** 创建 `components/features/habits/streak-calendar.tsx` — 连续打卡日历热力图
- [x] **4.7** 创建 `components/features/habits/stats-chart.tsx` — 统计图表
- [x] **4.8** 创建 `app/(tabs)/habits.tsx` — 习惯追踪页
- [x] **4.9** 安装 `react-native-gifted-charts` — 图表库
- [x] **4.10** 实现习惯 + 打卡记录 ↔ Supabase 同步
- [x] **4.11** 改造 Tab 导航: 5个 Tab (今日/日程/笔记/习惯/我的)

---

## 阶段二: AI 能力 + Dashboard (第2个月)

### Week 5: AI 引擎重构

- [x] **5.1** 重构 `lib/ai/` 目录 — 多模型路由架构
- [x] **5.2** 编写 `lib/ai/providers/mimo.ts` — Mimo API 适配器
- [x] **5.3** 编写 `lib/ai/providers/openai.ts` — OpenAI API 适配器
- [x] **5.4** 编写 `lib/ai/providers/claude.ts` — Claude API 适配器
- [x] **5.5** 编写 `lib/ai/engine.ts` — 统一 AI 引擎 (模型路由 + 流式输出)
- [x] **5.6** 编写 `lib/ai/tools.ts` — Function Calling 工具定义
- [x] **5.7** 编写 `lib/ai/context.ts` — 用户上下文构建器
- [x] **5.8** 改造 `hooks/use-app-runtime.ts` — 集成新 AI 引擎
- [x] **5.9** 实现 AI 工具执行器 (接收工具调用 → 操作本地/远程数据)

### Week 6: AI 工具集成

- [x] **6.1** 实现 `create_task` 工具 — AI 创建任务
- [x] **6.2** 实现 `create_note` 工具 — AI 创建笔记
- [x] **6.3** 实现 `create_calendar_event` 工具 — AI 创建日历事件
- [x] **6.4** 实现 `log_habit` 工具 — AI 记录习惯打卡
- [x] **6.5** 实现 `search_notes` 工具 — AI 搜索笔记
- [x] **6.6** 实现 `get_schedule` 工具 — AI 查询日程
- [x] **6.7** 实现 `get_habit_stats` 工具 — AI 查询习惯统计
- [x] **6.8** 创建 `components/features/ai/tool-result-card.tsx` — 工具结果展示卡片
- [x] **6.9** 改造 `features/chat/chat-screen.tsx` — 支持工具调用结果渲染
- [x] **6.10** 实现 AI 对话持久化 (Supabase ai_conversations + ai_messages)

### Week 7: AI 笔记增强

- [x] **7.1** 实现笔记 AI 摘要 — 选中笔记生成摘要
- [x] **7.2** 实现笔记 AI 分类 — 自动推荐分类
- [x] **7.3** 实现笔记 AI 标签 — 自动提取标签
- [x] **7.4** 创建 `components/features/notes/ai-summary.tsx` — AI 摘要组件
- [x] **7.5** 实现 AI 待办提取 — 从笔记中提取待办事项
- [x] **7.6** 实现自然语言创建事件 — "明天下午3点开会" → 日历事件

### Week 8: 今日首页 (Dashboard)

- [x] **8.1** 编写 `hooks/useDashboard.ts` — Dashboard 数据聚合
- [x] **8.2** 创建 `components/features/dashboard/greeting-card.tsx` — AI 问候卡片
- [x] **8.3** 创建 `components/features/dashboard/today-tasks.tsx` — 今日任务
- [x] **8.4** 创建 `components/features/dashboard/today-events.tsx` — 今日日程
- [x] **8.5** 创建 `components/features/dashboard/habit-quick-log.tsx` — 习惯快速打卡
- [x] **8.6** 创建 `components/features/dashboard/weekly-stats.tsx` — 本周统计
- [x] **8.7** 创建 `components/features/dashboard/ai-quick-input.tsx` — AI 快速输入
- [x] **8.8** 改造 `app/(tabs)/index.tsx` — Dashboard 页面
- [x] **8.9** 实现 AI 问候生成 — 基于时间/日程/天气生成个性化问候

---

## 阶段三: 商业化 + 目标管理 (第3个月)

### Week 9: 目标管理

- [x] **9.1** 编写 `hooks/useGoals.ts` — 目标 CRUD + 进度
- [x] **9.2** 编写 `store/goals.ts` — 目标状态管理
- [x] **9.3** 创建 `components/features/goals/goal-card.tsx` — 目标卡片
- [x] **9.4** 创建 `components/features/goals/goal-form.tsx` — 目标创建/编辑
- [x] **9.5** 创建 `components/features/goals/progress-ring.tsx` — 环形进度条
- [x] **9.6** 创建 `components/features/goals/key-results.tsx` — 关键结果列表
- [x] **9.7** 创建 `app/goal/[id].tsx` — 目标详情页
- [x] **9.8** 实现目标 ↔ Supabase 同步
- [x] **9.9** 实现 AI 目标拆解 — "我想学好英语" → 可执行的子目标

### Week 10: 订阅体系

- [x] **10.1** 注册 RevenueCat 账号，配置产品和 Entitlements
- [x] **10.2** 安装 `react-native-purchases`
- [x] **10.3** 编写 `lib/revenuecat/client.ts` — RevenueCat 初始化
- [x] **10.4** 编写 `hooks/useSubscription.ts` — 订阅状态 Hook
- [x] **10.5** 编写 `store/subscription.ts` — 订阅状态管理
- [x] **10.6** 创建订阅页面组件 (价格展示、对比表)
- [x] **10.7** 创建 `app/settings/subscription.tsx` — 订阅管理页
- [x] **10.8** 实现 Paywall 组件 — 升级引导弹窗
- [x] **10.9** 在 6 个触发点集成 Paywall (AI次数上限、笔记上限等)
- [x] **10.10** 实现 Supabase Edge Function — RevenueCat Webhook 处理
- [x] **10.11** 实现 subscription_tier 字段同步到 profiles 表
- [x] **10.12** 实现功能权限检查 Hook (`usePermission`)

### Week 11: AI 数据洞察

- [x] **11.1** 编写 `lib/ai/insights.ts` — 洞察生成引擎
- [x] **11.2** 实现周报生成 — 汇总任务完成率、习惯数据、日程统计
- [x] **11.3** 实现效率分析 — 分析高效/低效时间段
- [x] **11.4** 实现习惯-效率关联分析 — "你运动的日子工作效率高23%"
- [x] **11.5** 创建 `components/features/ai/insight-card.tsx` — 洞察卡片
- [x] **11.6** 实现洞察数据存储 (Supabase user_insights 表)
- [x] **11.7** 在 Dashboard 展示最新洞察

### Week 12: 数据管理 + 设置

- [x] **12.1** 创建 `app/settings/index.tsx` — 设置首页
- [x] **12.2** 创建 `app/settings/ai-model.tsx` — AI 模型选择页
- [x] **12.3** 创建 `app/settings/data.tsx` — 数据管理页
- [x] **12.4** 实现数据导出 — 笔记/任务/习惯数据导出为 JSON/CSV
- [x] **12.5** 实现数据导入 — 从 JSON 文件导入数据
- [x] **12.6** 实现账户删除 — 删除所有用户数据 (GDPR 合规)
- [x] **12.7** 实现 AI 用量统计 — 显示本月 AI 使用次数/剩余次数

---

## 阶段四: 上线准备 (第4个月)

### Week 13: 性能优化

- [x] **13.1** 列表性能优化 — 笔记列表/任务列表使用 FlashList
- [x] **13.2** 图片优化 — 头像/附件使用 expo-image 缓存
- [x] **13.3** 启动优化 — 减少首屏加载时间
- [x] **13.4** 内存优化 — 检查并修复内存泄漏
- [x] **13.5** Bundle 优化 — 分析并减少打包体积
- [x] **13.6** 离线体验优化 — 完善离线状态提示和排队机制

### Week 14: 测试 + 修复

- [x] **14.1** 核心流程手动测试 — 注册→创建内容→AI对话→订阅
- [x] **14.2** 边界情况测试 — 无网络、大数据量、并发操作
- [x] **14.3** 多设备测试 — iOS/Android 各主流机型
- [x] **14.4** 暗黑模式测试 — 所有页面暗黑模式适配
- [x] **14.5** 多语言测试 — 中/英/阿拉伯语切换
- [x] **14.6** Bug 修复 — 测试发现的问题

### Week 15: 提审准备

- [x] **15.1** 准备 App Store 截图 (6.7", 6.5", 5.5")
- [x] **15.2** 准备 Google Play 截图 (手机 + 平板)
- [x] **15.3** 编写 App 描述 (中/英)
- [x] **15.4** 配置 Privacy Policy 页面
- [x] **15.5** 配置 Terms of Service 页面
- [x] **15.6** 检查 App Store 审核指南合规性
- [x] **15.7** 提交 App Store 审核
- [x] **15.8** 提交 Google Play 审核

### Week 16: 灰度发布

- [x] **16.1** 配置 EAS Update (OTA 热更新)
- [x] **16.2** 设置崩溃监控 (Sentry 或 Expo 自带)
- [x] **16.3** 设置用户反馈渠道 (应用内反馈入口)
- [x] **16.4** 灰度发布 — 邀请 100 名测试用户
- [x] **16.5** 收集反馈，修复关键问题
- [x] **16.6** 全量发布

---

## 依赖安装清单

```bash
# 后端 + 认证
npx expo install @supabase/supabase-js

# 笔记编辑器
npm install @10play/tentap-editor

# 图表
npm install react-native-gifted-charts

# 支付
npm install react-native-purchases

# 日期处理
npm install date-fns

# 语音输入 (可选，Phase 2)
npx expo install expo-speech-recognition

# 推送通知
npx expo install expo-notifications

# 文件系统
npx expo install expo-file-system

# 触觉反馈
npx expo install expo-haptics

# 列表性能
npx expo install @shopify/flash-list
```

---

## 里程碑检查点

| 里程碑 | 时间 | 交付物 |
|--------|------|--------|
| M1: 核心基础完成 | 第1个月末 | 用户系统 + 笔记 + 日历 + 习惯，可本地使用 |
| M2: AI 能力上线 | 第2个月末 | AI 对话增强 + Dashboard，AI 可操作数据 |
| M3: 商业化就绪 | 第3个月末 | 订阅体系 + 目标管理 + 数据洞察 |
| M4: 正式发布 | 第4个月末 | App Store + Google Play 上架 |

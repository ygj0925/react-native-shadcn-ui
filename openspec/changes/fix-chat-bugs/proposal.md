## Why

AI 聊天页面经过功能增强后，代码审阅发现 5 个确认 bug 和若干潜在风险。最严重的是惯性滚动劫持（用户快滑后被强拉回底部）和 Error Boundary 无限重置循环，这两个问题用户每次使用都会遇到。其余包括内存泄漏、网络连接泄漏和思考过程突然收起等体验问题。

## What Changes

- 修复 `useAutoScroll` 惯性滚动后 `userScrolledAwayRef` 未更新导致的滚动劫持
- 修复 `ChatErrorBoundary` 无重试上限导致的无限重置循环
- 修复 `reasoningCache` 无清理机制导致的内存泄漏
- 修复 `customFetch` 重试时未消费失败响应体导致的连接泄漏
- 修复 `ReasoningPart` 思考结束后内容突然收起的体验问题

## Capabilities

### New Capabilities

（无新增能力）

### Modified Capabilities

（无规格级别变更，全部为实现层 bug 修复）

## Impact

- `hooks/use-auto-scroll.ts` — 滚动跟随逻辑
- `components/chat-error-boundary.tsx` — 错误恢复逻辑
- `hooks/use-app-runtime.ts` — reasoning 缓存和网络请求
- `features/chat/chat-screen.tsx` — ReasoningPart 组件

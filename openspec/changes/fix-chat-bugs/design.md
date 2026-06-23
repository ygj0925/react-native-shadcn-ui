## Context

AI 聊天页面基于 `@assistant-ui/react-native` + `@ai-sdk/openai`，使用自定义 `useAutoScroll` hook 控制滚动、`ChatErrorBoundary` 处理运行时错误、`customFetch` 拦截 SSE 流捕获 reasoning_content。最近一轮功能增强后暴露出 5 个 bug。

## Goals / Non-Goals

**Goals:**
- 修复惯性滚动后自动跟随失灵的问题
- 修复 Error Boundary 无限重置循环
- 清理 reasoningCache 防止内存泄漏
- 消费重试时的失败响应体防止连接泄漏
- 改善思考过程折叠的用户体验

**Non-Goals:**
- Markdown 渲染（单独变更处理）
- 会话持久化（单独变更处理）
- Tool UI 主题适配（单独变更处理）
- Native 端 `body.tee()` 兼容性（需要确认 Native 发布计划后再处理）

## Decisions

### 1. 惯性滚动：在 `onMomentumScrollEnd` 中同步 `userScrolledAwayRef`

`handleScrollEndDrag` 在手指抬起时设置 `userScrolledAwayRef`，但惯性可能把列表甩到完全不同的位置。`onMomentumScrollEnd` 必须重新检测并更新该 ref。

替代方案：在 `onScroll`（每 16ms）中持续更新 — 放弃，因为会跟程序化滚动冲突（当前 bug 的原始根因就是这个）。

### 2. Error Boundary：加重试计数器 + 冷却

添加 `retryCount` state，超过 3 次后停止自动重置，显示降级 UI。用 `setTimeout(2000)` 替代 `setTimeout(0)` 避免瞬间循环。

替代方案：完全不自动重置 — 放弃，因为 MessageRepository 错误往往是瞬时的，自动恢复体验更好。

### 3. reasoningCache：注入后立即删除条目

在 `injectReasoningContent` 中，匹配到缓存后立即 `reasoningCache.delete(id)`。reasoning 只需要注入一次（tool call 续接的下一次请求），之后就不再需要。

替代方案：定时清理或 LRU — 过度设计，注入即删是最简方案。

### 4. 重试响应体消费：调用 `res.body?.cancel()`

在重试循环中，对 5xx 失败响应调用 `res.body?.cancel()` 释放连接。

### 5. ReasoningPart：思考完成后自动展开

当 `isThinking` 从 true 变为 false 且有内容时，自动将 `expanded` 设为 true。用户之后可以手动折叠。

替代方案：始终保持展开 — 放弃，历史消息的思考过程默认展开太占空间。

## Risks / Trade-offs

- `onMomentumScrollEnd` 在某些 Android 设备上可能不触发 → 退回到 `handleScrollEndDrag` 的值即可，不会比现在更差
- Error Boundary 重试 3 次后的降级 UI 是静态文案 → 后续可改进为"点击重试"按钮
- `res.body?.cancel()` 在 React Native 的 fetch polyfill 中可能是 no-op → 无副作用，最差情况等同当前行为

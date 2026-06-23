## 1. 滚动修复

- [x] 1.1 在 `use-auto-scroll.ts` 的 `onMomentumScrollEnd` 中增加 `userScrolledAwayRef` 同步逻辑：惯性结束后检测是否在底部，不在则设 `userScrolledAwayRef=true` 并显示箭头

## 2. Error Boundary 修复

- [x] 2.1 在 `chat-error-boundary.tsx` 中添加 `retryCount` state，超过 3 次停止自动重置，`setTimeout` 延迟改为 2000ms，超限后渲染降级 UI（错误提示 + 重试按钮）

## 3. 内存 / 连接泄漏修复

- [x] 3.1 在 `use-app-runtime.ts` 的 `injectReasoningContent` 中，匹配缓存后调用 `reasoningCache.delete(id)` 清理已使用条目
- [x] 3.2 在 `use-app-runtime.ts` 的 `customFetch` 重试循环中，对 5xx 失败响应调用 `res.body?.cancel()` 再 continue

## 4. 思考过程体验优化

- [x] 4.1 在 `chat-screen.tsx` 的 `ReasoningPart` 中，用 `useEffect` 监听 `isThinking` 从 true 变 false，自动将 `expanded` 设为 true

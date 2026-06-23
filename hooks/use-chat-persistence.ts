import { useEffect, useRef } from 'react';
import { useAuiState, type ThreadMessage } from '@assistant-ui/react-native';
import { useAuthStore } from '@/lib/store/auth';
import { useAIStore } from '@/lib/store/ai';
import { createConversation, saveMessages } from '@/lib/ai/persistence';
import type { AIMessage } from '@/lib/supabase';

function extractText(message: ThreadMessage): string {
  if (typeof message.content === 'string') return message.content;
  return message.content
    .filter((part: any) => part.type === 'text')
    .map((part: any) => part.text)
    .join('\n');
}

function extractToolCalls(message: ThreadMessage): any[] {
  if (typeof message.content === 'string') return [];
  return message.content
    .filter((part: any) => part.type === 'tool-call')
    .map((part: any) => ({
      id: part.toolCallId ?? part.id,
      name: part.toolName,
      args: part.args,
      status: part.status?.type ?? 'complete',
    }));
}

function extractToolResult(message: ThreadMessage): Record<string, any> {
  if (typeof message.content === 'string') return {};
  const results: Record<string, any> = {};
  message.content.forEach((part: any) => {
    if (part.type === 'tool-call' && part.result !== undefined) {
      const id = part.toolCallId ?? part.id;
      results[id] = part.result;
    }
  });
  return results;
}

function toAIMessage(message: ThreadMessage, conversationId: string): Omit<AIMessage, 'id' | 'created_at'> | null {
  const role = message.role;
  if (role !== 'user' && role !== 'assistant' && role !== 'system' && role !== 'tool') {
    return null;
  }

  const toolCalls = extractToolCalls(message);
  const toolResult = extractToolResult(message);

  return {
    conversation_id: conversationId,
    role,
    content: extractText(message),
    tool_calls: toolCalls.length > 0 ? toolCalls : [],
    tool_result: Object.keys(toolResult).length > 0 ? toolResult : {},
    tokens_used: 0,
  };
}

export function useChatPersistence(model: string) {
  const user = useAuthStore((s) => s.user);
  const userId = user?.id;

  const activeId = useAIStore((s) => s.activeConversationId);
  const addConversation = useAIStore((s) => s.addConversation);
  const addMessage = useAIStore((s) => s.addMessage);
  const setActiveConversation = useAIStore((s) => s.setActiveConversation);

  const isRunning = useAuiState((s) => s.thread.isRunning);
  const messages = useAuiState((s) => s.thread.messages);

  const lastRunningRef = useRef(isRunning);
  const lastPersistedCountRef = useRef(0);

  useEffect(() => {
    if (!userId) return;

    const wasRunning = lastRunningRef.current;
    lastRunningRef.current = isRunning;

    const hasNewMessages = messages.length > lastPersistedCountRef.current;
    if (!(wasRunning && !isRunning && hasNewMessages)) return;

    const unsaved = messages.slice(lastPersistedCountRef.current);
    persist();

    async function persist() {
      let conversationId = activeId;
      const firstUser = unsaved.find((m) => m.role === 'user');

      if (!conversationId && firstUser) {
        const title = extractText(firstUser).slice(0, 30) || '新对话';
        const conversation = await createConversation(userId!, title, model);
        if (!conversation) return;
        conversationId = conversation.id;
        addConversation(conversation);
        setActiveConversation(conversation.id);
      }

      if (!conversationId) return;

      const rows = unsaved
        .map((m) => toAIMessage(m, conversationId!))
        .filter((m): m is Omit<AIMessage, 'id' | 'created_at'> => m !== null);

      const saved = await saveMessages(rows);
      saved.forEach(addMessage);
      lastPersistedCountRef.current = messages.length;
    }
  }, [isRunning, messages, userId, model, activeId, addConversation, addMessage, setActiveConversation]);
}

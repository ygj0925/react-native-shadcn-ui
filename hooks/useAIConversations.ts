import { useCallback, useEffect } from 'react';
import { useAIStore } from '@/lib/store/ai';
import { useAuthStore } from '@/lib/store/auth';
import {
  loadConversations,
  loadMessages,
  createConversation,
  deleteConversation,
} from '@/lib/ai/persistence';
import type { AIConversation } from '@/lib/supabase';

export function useAIConversations() {
  const user = useAuthStore((s) => s.user);
  const profile = useAuthStore((s) => s.profile);
  const userId = user?.id ?? profile?.id;

  const conversations = useAIStore((s) => s.conversations);
  const activeId = useAIStore((s) => s.activeConversationId);
  const isLoading = useAIStore((s) => s.isLoading);
  const setLoading = useAIStore((s) => s.setLoading);
  const setConversations = useAIStore((s) => s.setConversations);
  const setActiveConversation = useAIStore((s) => s.setActiveConversation);
  const setMessages = useAIStore((s) => s.setMessages);
  const addConversation = useAIStore((s) => s.addConversation);
  const removeConversation = useAIStore((s) => s.deleteConversation);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    setLoading(true);
    loadConversations(userId).then((items) => {
      if (!cancelled) {
        setConversations(items);
        setLoading(false);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [userId, setConversations, setLoading]);

  const select = useCallback(
    async (conversation: AIConversation) => {
      setActiveConversation(conversation.id);
      const messages = await loadMessages(conversation.id);
      setMessages(conversation.id, messages);
    },
    [setActiveConversation, setMessages]
  );

  const create = useCallback(
    async (title = '新对话', model = 'mimo-v2.5-pro') => {
      if (!userId) return null;
      const conversation = await createConversation(userId, title, model);
      if (conversation) {
        addConversation(conversation);
      }
      return conversation;
    },
    [userId, addConversation]
  );

  const remove = useCallback(
    async (id: string) => {
      await deleteConversation(id);
      removeConversation(id);
    },
    [removeConversation]
  );

  return {
    conversations,
    activeId,
    isLoading,
    select,
    create,
    remove,
  };
}

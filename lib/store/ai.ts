import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '@/lib/storage';
import type { AIConversation, AIMessage } from '@/lib/supabase';

type AIState = {
  conversations: AIConversation[];
  messages: AIMessage[];
  activeConversationId: string | null;
  isLoading: boolean;

  setLoading: (loading: boolean) => void;
  setConversations: (conversations: AIConversation[]) => void;
  addConversation: (conversation: AIConversation) => void;
  updateConversation: (id: string, updates: Partial<AIConversation>) => void;
  deleteConversation: (id: string) => void;
  setActiveConversation: (id: string | null) => void;

  setMessages: (conversationId: string, messages: AIMessage[]) => void;
  addMessage: (message: AIMessage) => void;
  clearMessages: () => void;
};

const zustandStorage = {
  getItem: (key: string) => {
    const value = getItem<unknown>(key);
    return JSON.stringify(value);
  },
  setItem: (key: string, value: string) => {
    setItem(key, JSON.parse(value));
  },
  removeItem,
};

export const useAIStore = create<AIState>()(
  persist(
    (set) => ({
      conversations: [],
      messages: [],
      activeConversationId: null,
      isLoading: false,

      setLoading: (isLoading) => set({ isLoading }),
      setConversations: (conversations) => set({ conversations }),
      addConversation: (conversation) =>
        set((state) => ({
          conversations: [conversation, ...state.conversations],
          activeConversationId: conversation.id,
        })),
      updateConversation: (id, updates) =>
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c.id === id ? { ...c, ...updates } : c
          ),
        })),
      deleteConversation: (id) =>
        set((state) => ({
          conversations: state.conversations.filter((c) => c.id !== id),
          messages: state.activeConversationId === id ? [] : state.messages,
          activeConversationId:
            state.activeConversationId === id ? null : state.activeConversationId,
        })),
      setActiveConversation: (id) => set({ activeConversationId: id }),

      setMessages: (conversationId, messages) =>
        set((state) =>
          state.activeConversationId === conversationId
            ? { messages }
            : state
        ),
      addMessage: (message) =>
        set((state) => ({
          messages: [...state.messages, message],
        })),
      clearMessages: () => set({ messages: [] }),
    }),
    {
      name: 'ai-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        conversations: state.conversations,
        activeConversationId: state.activeConversationId,
      }),
    }
  )
);

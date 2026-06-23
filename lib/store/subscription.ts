import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '@/lib/storage';

export type SubscriptionTier = 'free' | 'pro' | 'team';

export type SubscriptionState = {
  tier: SubscriptionTier;
  isLoading: boolean;
  offerings: any | null;
  customerInfo: any | null;

  setTier: (tier: SubscriptionTier) => void;
  setLoading: (loading: boolean) => void;
  setOfferings: (offerings: any | null) => void;
  setCustomerInfo: (info: any | null) => void;

  // Limits
  aiUsageThisMonth: number;
  incrementAIUsage: () => void;
  resetAIUsage: () => void;

  noteCount: number;
  setNoteCount: (count: number) => void;
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

export const useSubscriptionStore = create<SubscriptionState>()(
  persist(
    (set, get) => ({
      tier: 'free',
      isLoading: false,
      offerings: null,
      customerInfo: null,

      aiUsageThisMonth: 0,
      noteCount: 0,

      setTier: (tier) => set({ tier }),
      setLoading: (isLoading) => set({ isLoading }),
      setOfferings: (offerings) => set({ offerings }),
      setCustomerInfo: (customerInfo) => set({ customerInfo }),

      incrementAIUsage: () => set({ aiUsageThisMonth: get().aiUsageThisMonth + 1 }),
      resetAIUsage: () => set({ aiUsageThisMonth: 0 }),
      setNoteCount: (noteCount) => set({ noteCount }),
    }),
    {
      name: 'subscription-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        tier: state.tier,
        aiUsageThisMonth: state.aiUsageThisMonth,
        noteCount: state.noteCount,
      }),
    }
  )
);

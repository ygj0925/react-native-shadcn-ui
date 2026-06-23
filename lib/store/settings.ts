import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '@/lib/storage';
import { DEFAULT_MODEL, type AIModelValue } from '@/lib/ai/engine';

type SettingsState = {
  aiModel: AIModelValue;
  setAIModel: (model: AIModelValue) => void;
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

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      aiModel: DEFAULT_MODEL,
      setAIModel: (aiModel) => set({ aiModel }),
    }),
    {
      name: 'app-settings-storage',
      storage: createJSONStorage(() => zustandStorage),
    }
  )
);

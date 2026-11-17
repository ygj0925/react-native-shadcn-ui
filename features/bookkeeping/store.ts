import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Crypto from 'expo-crypto';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import {
  initialData,
  materializeRecurring,
  restore,
  validateEntry,
  type LedgerData,
  type Entry,
  type Budget,
  type Recurring,
} from './domain';

export const newId = () => Crypto.randomUUID();
let storageBlocked = false;
let reportStorageError: ((message: string) => void) | undefined;
let storageQueue: Promise<void> = Promise.resolve();
const safeStorage = {
  getItem: async (key: string) => {
    try {
      const raw = await AsyncStorage.getItem(key);
      if (raw) {
        const saved = JSON.parse(raw);
        restore(JSON.stringify({ format: 'jianzhang', version: 1, data: saved.state.data }));
      }
      return raw;
    } catch {
      storageBlocked = true;
      throw new Error('账本数据读取或校验失败，已停止写入以保护原始数据');
    }
  },
  setItem: (key: string, value: string) => {
    if (storageBlocked) return Promise.resolve();
    // Serialize writes: a slower previous write must never overwrite a newer one.
    storageQueue = storageQueue
      .then(() => AsyncStorage.setItem(key, value))
      .catch(() => {
        if (!storageBlocked) {
          storageBlocked = true;
          reportStorageError?.('本地保存失败，已停止写入。请先导出备份，检查设备存储空间。');
        }
      });
    return storageQueue;
  },
  removeItem: (key: string) => AsyncStorage.removeItem(key),
};
type LedgerStore = {
  data: LedgerData;
  ready: boolean;
  error: string | null;
  saveEntry: (entry: Entry) => void;
  deleteEntry: (id: string) => void;
  setData: (update: (data: LedgerData) => LedgerData) => void;
  setBudget: (budget: Budget) => void;
  addRecurring: (rule: Recurring) => void;
  tick: () => void;
  restoreBackup: (text: string) => void;
};
export const useLedgerStore = create<LedgerStore>()(
  persist(
    (set, get) => ({
      data: initialData(),
      ready: false,
      error: null,
      setData: (update) => {
        if (storageBlocked) throw new Error('本地存储不可用，请先导出备份并重启');
        set((s) => ({ data: update(s.data) }));
      },
      saveEntry: (entry) => {
        if (storageBlocked) throw new Error('本地存储不可用，账单未保存');
        validateEntry(entry, get().data);
        set((s) => ({
          data: {
            ...s.data,
            entries: [
              ...s.data.entries.filter((e) => e.id !== entry.id),
              { ...entry, updatedAt: new Date().toISOString() },
            ],
          },
        }));
      },
      deleteEntry: (id) => {
        if (storageBlocked) throw new Error('本地存储不可用，未删除账单');
        set((s) => ({
          data: {
            ...s.data,
            entries: s.data.entries.map((e) =>
              e.id === id
                ? { ...e, deletedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
                : e
            ),
          },
        }));
      },
      setBudget: (budget) => {
        if (storageBlocked) throw new Error('本地存储不可用，未保存预算');
        if (!Number.isSafeInteger(budget.cents) || budget.cents <= 0)
          throw new Error('预算必须大于 0');
        set((s) => ({
          data: {
            ...s.data,
            budgets: [
              ...s.data.budgets.filter(
                (b) =>
                  !(
                    b.bookId === budget.bookId &&
                    b.month === budget.month &&
                    b.categoryId === budget.categoryId
                  )
              ),
              budget,
            ],
          },
        }));
      },
      addRecurring: (rule) =>
        set((s) => ({ data: { ...s.data, recurring: [...s.data.recurring, rule] } })),
      tick: () => {
        if (storageBlocked) return;
        try {
          set((s) => ({ data: materializeRecurring(s.data) }));
        } catch (e) {
          set({ error: e instanceof Error ? e.message : '周期账单生成失败' });
        }
      },
      restoreBackup: (text) => {
        if (storageBlocked)
          throw new Error('本地存储已受保护，请先检查设备空间并重启；原始数据未被覆盖');
        const data = restore(text);
        set({ data, error: null });
      },
    }),
    {
      name: 'jianzhang-ledger-v1',
      version: 1,
      storage: createJSONStorage(() => safeStorage),
      partialize: (state) => ({ data: state.data }),
      onRehydrateStorage: () => (state, error) => {
        if (error)
          useLedgerStore.setState({
            ready: true,
            error: '本地数据读取失败，请先导出备份，避免继续写入。',
          });
        else {
          useLedgerStore.setState({ ready: true });
          state?.tick();
        }
      },
    }
  )
);
reportStorageError = (message) => useLedgerStore.setState({ error: message });
export async function flushLedgerPersistence() {
  await storageQueue;
  if (storageBlocked) throw new Error('本地账本尚未可靠写入，同步确认已暂停');
}

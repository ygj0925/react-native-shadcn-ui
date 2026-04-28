import { Platform } from 'react-native';

type StorageLike = {
  getString: (key: string) => string | undefined;
  set: (key: string, value: string) => void;
  remove: (key: string) => void;
};

const memoryStorage = new Map<string, string>();

function createFallbackStorage(): StorageLike {
  return {
    getString(key) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        const value = window.localStorage.getItem(key);
        return value ?? undefined;
      }

      return memoryStorage.get(key);
    },
    set(key, value) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.localStorage.setItem(key, value);
        return;
      }

      memoryStorage.set(key, value);
    },
    remove(key) {
      if (Platform.OS === 'web' && typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        return;
      }

      memoryStorage.delete(key);
    },
  };
}

function createStorage(): StorageLike {
  try {
    const mmkvModule = require('react-native-mmkv') as {
      createMMKV?: () => StorageLike;
    };

    if (typeof mmkvModule.createMMKV === 'function') {
      return mmkvModule.createMMKV();
    }
  } catch (error) {
    console.warn('MMKV unavailable, falling back to in-memory storage.', error);
  }

  return createFallbackStorage();
}

export const storage = createStorage();

export function getItem<T>(key: string): T | null {
  const value = storage.getString(key);
  return value ? (JSON.parse(value) as T) ?? null : null;
}

export function setItem<T>(key: string, value: T) {
  storage.set(key, JSON.stringify(value));
}

export function removeItem(key: string) {
  storage.remove(key);
}

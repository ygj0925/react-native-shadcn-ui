import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';
import { createMMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';

// MMKV adapter for Supabase auth storage
const mmkvStorage = createMMKV({ id: 'supabase-auth' });

const supabaseStorage = {
  getItem: (key: string) => {
    const value = mmkvStorage.getString(key);
    return value ?? null;
  },
  setItem: (key: string, value: string) => {
    mmkvStorage.set(key, value);
  },
  removeItem: (key: string) => {
    mmkvStorage.remove(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env file'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: supabaseStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
  },
});

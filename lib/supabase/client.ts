import 'react-native-url-polyfill/auto';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import { createMMKV } from 'react-native-mmkv';
import { Platform } from 'react-native';

// MMKV adapter for Supabase auth storage
let mmkvStorage: ReturnType<typeof createMMKV> | undefined;
const nativeStorage = () => (mmkvStorage ??= createMMKV({ id: 'supabase-auth' }));

const supabaseStorage = {
  getItem: (key: string) => {
    if (Platform.OS === 'web')
      return typeof window !== 'undefined' ? window.localStorage.getItem(key) : null;
    const value = nativeStorage().getString(key);
    return value ?? null;
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.setItem(key, value);
    } else nativeStorage().set(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined') window.localStorage.removeItem(key);
    } else nativeStorage().remove(key);
  },
};

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? '';
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? '';
export const isSupabaseConfigured = !!supabaseUrl && !!supabaseAnonKey;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[Supabase] Missing EXPO_PUBLIC_SUPABASE_URL or EXPO_PUBLIC_SUPABASE_ANON_KEY in .env file'
  );
}

// Create on first client-side use. Importing the root layout during static rendering
// must not start auth timers, read localStorage, or require Node WebSocket support.
let client: SupabaseClient | undefined;
function getClient() {
  if (!isSupabaseConfigured) throw new Error('旧版工作台尚未配置 Supabase；简账可独立使用');
  return (client ??= createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      storage: supabaseStorage,
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: Platform.OS === 'web',
    },
  }));
}
export const supabase = new Proxy({} as SupabaseClient, {
  get(_target, property) {
    const instance = getClient();
    const value = Reflect.get(instance, property);
    return typeof value === 'function' ? value.bind(instance) : value;
  },
});

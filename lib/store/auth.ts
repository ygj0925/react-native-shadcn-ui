import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { getItem, setItem, removeItem } from '@/lib/storage';
import { supabase, type Profile } from '@/lib/supabase';

type TokenInfo = {
  accessToken: string;
  refreshToken: string;
};

type AuthState = {
  // Legacy token support (for existing API integration)
  token: TokenInfo | null;

  // Supabase auth state
  user: any | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  // Actions
  setToken: (token: TokenInfo) => void;
  setUser: (user: any) => void;
  setProfile: (profile: Profile | null) => void;
  setLoading: (loading: boolean) => void;

  // Supabase auth actions
  signUp: (email: string, password: string, displayName?: string) => Promise<{ error: string | null }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<{ error: string | null }>;
  refreshProfile: () => Promise<void>;
  initAuth: () => Promise<void>;

  // Legacy
  logout: () => void;
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

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      token: null,
      user: null,
      profile: null,
      isAuthenticated: false,
      isLoading: true,

      setToken: (token) => set({ token, isAuthenticated: true }),
      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setProfile: (profile) => set({ profile }),
      setLoading: (isLoading) => set({ isLoading }),

      signUp: async (email, password, displayName) => {
        try {
          const { data, error } = await supabase.auth.signUp({
            email,
            password,
            options: {
              data: {
                display_name: displayName ?? email.split('@')[0],
              },
            },
          });

          if (error) return { error: error.message };

          if (data.user) {
            set({ user: data.user, isAuthenticated: true });
            // Profile will be created by Supabase trigger
            get().refreshProfile();
          }

          return { error: null };
        } catch (e: any) {
          return { error: e.message ?? '注册失败' };
        }
      },

      signIn: async (email, password) => {
        try {
          const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password,
          });

          if (error) return { error: error.message };

          if (data.user) {
            set({ user: data.user, isAuthenticated: true });
            get().refreshProfile();
          }

          return { error: null };
        } catch (e: any) {
          return { error: e.message ?? '登录失败' };
        }
      },

      signOut: async () => {
        await supabase.auth.signOut();
        set({
          user: null,
          profile: null,
          token: null,
          isAuthenticated: false,
        });
      },

      deleteAccount: async () => {
        const { user } = get();
        if (!user) return { error: '未登录' };

        try {
          // Best-effort server-side deletion via RPC. Add a `delete_user(uid uuid)`
          // Postgres function or Edge Function for production GDPR compliance.
          const { error } = await supabase.rpc('delete_user', { uid: user.id });

          if (error) {
            console.warn('[Auth] delete_user RPC failed:', error.message);
          }

          await supabase.auth.signOut();
          set({
            user: null,
            profile: null,
            token: null,
            isAuthenticated: false,
          });

          return { error: null };
        } catch (e: any) {
          return { error: e.message ?? '删除账户失败' };
        }
      },

      refreshProfile: async () => {
        const { user } = get();
        if (!user) return;

        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', user.id)
            .single();

          if (!error && data) {
            set({ profile: data });
          }
        } catch {
          // Silently fail - profile may not exist yet
        }
      },

      initAuth: async () => {
        set({ isLoading: true });

        try {
          const { data: { session } } = await supabase.auth.getSession();

          if (session?.user) {
            set({
              user: session.user,
              isAuthenticated: true,
            });
            get().refreshProfile();
          }
        } catch {
          // Silent fail on init
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        get().signOut();
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => zustandStorage),
      partialize: (state) => ({
        token: state.token,
        // Don't persist user/profile - fetch fresh on app start
      }),
    }
  )
);

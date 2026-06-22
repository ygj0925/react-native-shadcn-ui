import { supabase } from './client';
import type { Profile } from './types';

// ─── 邮箱注册 ──────────────────────────────────────────────────────────────

export async function signUpWithEmail(email: string, password: string, displayName?: string) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        display_name: displayName ?? email.split('@')[0],
      },
    },
  });

  if (error) throw error;
  return data;
}

// ─── 邮箱登录 ──────────────────────────────────────────────────────────────

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  return data;
}

// ─── 登出 ──────────────────────────────────────────────────────────────────

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// ─── 获取当前用户 ──────────────────────────────────────────────────────────

export async function getCurrentUser() {
  const { data: { user }, error } = await supabase.auth.getUser();
  if (error) throw error;
  return user;
}

// ─── 获取当前 Session ──────────────────────────────────────────────────────

export async function getSession() {
  const { data: { session }, error } = await supabase.auth.getSession();
  if (error) throw error;
  return session;
}

// ─── 获取用户 Profile ──────────────────────────────────────────────────────

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // not found
    throw error;
  }
  return data;
}

// ─── 更新用户 Profile ──────────────────────────────────────────────────────

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ─── 监听认证状态变化 ──────────────────────────────────────────────────────

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback);
}

// ─── 重置密码 ──────────────────────────────────────────────────────────────

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email);
  if (error) throw error;
}

// ─── 更新密码 ──────────────────────────────────────────────────────────────

export async function updatePassword(newPassword: string) {
  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) throw error;
}

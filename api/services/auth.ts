import { post } from '@/lib/request';
import type { TokenPair } from '@/lib/request';
import { setTokens, clearTokens } from '@/lib/request';
import { encryptPassword } from '@/lib/crypto';
import { router } from 'expo-router';

export interface LoginParams {
  email: string;
  password: string;
}

export interface RegisterParams {
  email: string;
  password: string;
}

export interface UserInfo {
  id: string;
  email: string;
  nickname: string;
  avatar: string;
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  userInfo: UserInfo;
}

export async function login(params: LoginParams): Promise<LoginResult> {
  const res = await post<LoginResult>(
    '/auth/login',
    {
      email: params.email,
      password: encryptPassword(params.password),
    },
    { skipAuth: true, showLoading: true },
  );
  setTokens({
    accessToken: res.data.accessToken,
    refreshToken: res.data.refreshToken,
  });
  return res.data;
}

export async function register(params: RegisterParams) {
  const res = await post(
    '/auth/register',
    {
      email: params.email,
      password: encryptPassword(params.password),
    },
    { skipAuth: true, showLoading: true },
  );
  return res.data;
}

export async function logout() {
  try {
    await post('/auth/logout');
  } finally {
    clearTokens();
    router.replace('/login');
  }
}

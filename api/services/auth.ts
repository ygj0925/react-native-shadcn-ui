import { post } from '@/lib/request';
import type { TokenPair } from '@/lib/request';
import { setTokens, clearTokens } from '@/lib/request';
import { encryptPassword, aesEncrypt } from '@/lib/crypto';
import { router } from 'expo-router';

export interface LoginParams {
  username: string;
  password: string;
}

export interface RegisterParams {
  username: string;
  password: string;
}

export interface UserInfo {
  id: string;
  username: string;
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
      email: params.username,
      password: aesEncrypt(params.password),
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
      email: params.username,
      password: aesEncrypt(params.password),
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

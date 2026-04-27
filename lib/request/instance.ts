import axios from 'axios';
import type { AxiosError, AxiosResponse } from 'axios';
import { Platform } from 'react-native';
import { router } from 'expo-router';
import type {
  ApiResponse,
  InternalRequestConfig,
  PendingRequest,
} from './types';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from './token';
import { BusinessError, handleAxiosError } from './error';
import { showLoading, hideLoading } from './loading';

const API_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000';
const API_PREFIX = process.env.EXPO_PUBLIC_API_PREFIX ?? '';

// Web: use relative path so requests go through the Metro dev proxy (avoids CORS)
// Native: use the full URL directly (no CORS restrictions)
const BASE_URL = Platform.OS === 'web'
  ? `/${API_PREFIX.replace(/\/+$/, '')}`
  : `${API_URL.replace(/\/+$/, '')}/${API_PREFIX.replace(/\/+$/, '')}`;

const instance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Token Refresh Queue ───────────────────────────────
let isRefreshing = false;
let pendingQueue: PendingRequest[] = [];

function processQueue(error: any, token: string | null): void {
  pendingQueue.forEach((p) => {
    if (error) {
      p.reject(error);
    } else {
      p.resolve(token!);
    }
  });
  pendingQueue = [];
}

async function refreshAccessToken(): Promise<string> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    throw new Error('No refresh token');
  }

  // Use a separate axios instance to avoid interceptor loops
  const { data } = await axios.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
    `${BASE_URL}/auth/refresh`,
    { refreshToken },
  );

  if (data.code !== 200 || !data.data) {
    throw new Error(data.message || 'Token刷新失败');
  }

  setTokens(data.data);
  return data.data.accessToken;
}

function redirectToLogin(): void {
  clearTokens();
  router.replace('/login');
}

// ─── Request Interceptor ───────────────────────────────
instance.interceptors.request.use(
  (config: InternalRequestConfig) => {
    if (!config.skipAuth) {
      const token = getAccessToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }

    if (config.showLoading) {
      showLoading();
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// ─── Response Interceptor ──────────────────────────────
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const config = response.config as InternalRequestConfig;
    if (config.showLoading) {
      hideLoading();
    }

    const res = response.data;

    if (res.code === 200) {
      return res as any;
    }

    return Promise.reject(new BusinessError(res));
  },
  async (error: AxiosError<ApiResponse>) => {
    const config = error.config as InternalRequestConfig | undefined;
    if (config?.showLoading) {
      hideLoading();
    }

    // ── Retry Logic ──
    if (config && config.retry && config.retry > 0) {
      config.retry--;
      const delay = config.retryDelay ?? 1000;
      await new Promise((r) => setTimeout(r, delay));
      return instance.request(config);
    }

    // ── 401 Token Refresh ──
    if (error.response?.status === 401 && config && !config.skipAuth) {
      if (isRefreshing) {
        return new Promise<string>((resolve, reject) => {
          pendingQueue.push({ resolve, reject });
        }).then((newToken) => {
          config.headers.Authorization = `Bearer ${newToken}`;
          return instance.request(config);
        });
      }

      isRefreshing = true;

      try {
        const newToken = await refreshAccessToken();
        config.headers.Authorization = `Bearer ${newToken}`;
        processQueue(null, newToken);
        return instance.request(config);
      } catch (refreshError) {
        processQueue(refreshError, null);
        redirectToLogin();
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const message = error.response?.data?.message || handleAxiosError(error);
    return Promise.reject(new Error(message));
  },
);

export default instance;

import type { AxiosRequestConfig, InternalAxiosRequestConfig } from 'axios';

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface RequestOptions {
  showLoading?: boolean;
  skipAuth?: boolean;
  retry?: number;
  retryDelay?: number;
}

export type RequestConfig = AxiosRequestConfig & RequestOptions;

export interface InternalRequestConfig
  extends InternalAxiosRequestConfig,
    RequestOptions {}

export interface PendingRequest {
  resolve: (token: string) => void;
  reject: (error: any) => void;
}

export interface LoadingHandler {
  show: () => void;
  hide: () => void;
}

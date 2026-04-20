import instance from './instance';
import type { ApiResponse, RequestConfig } from './types';

export function get<T = any>(
  url: string,
  params?: Record<string, any>,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return instance.get(url, { params, ...config });
}

export function post<T = any>(
  url: string,
  data?: Record<string, any>,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return instance.post(url, data, config);
}

export function put<T = any>(
  url: string,
  data?: Record<string, any>,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return instance.put(url, data, config);
}

export function del<T = any>(
  url: string,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return instance.delete(url, config);
}

export function upload<T = any>(
  url: string,
  formData: FormData,
  config?: RequestConfig,
): Promise<ApiResponse<T>> {
  return instance.post(url, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
    ...config,
  });
}

export { instance as request };
export { setupLoading } from './loading';
export { getTokens, setTokens, clearTokens, getAccessToken } from './token';
export { BusinessError } from './error';
export type { ApiResponse, RequestConfig, TokenPair, LoadingHandler } from './types';

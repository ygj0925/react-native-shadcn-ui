import type { AxiosError } from 'axios';
import type { ApiResponse } from './types';

const HTTP_STATUS_MAP: Record<number, string> = {
  400: '请求参数错误',
  401: '登录已过期，请重新登录',
  403: '没有访问权限',
  404: '请求的资源不存在',
  405: '请求方法不允许',
  408: '请求超时',
  409: '资源冲突',
  422: '请求参数验证失败',
  429: '请求过于频繁，请稍后再试',
  500: '服务器内部错误',
  502: '网关错误',
  503: '服务暂时不可用',
  504: '网关超时',
};

export class BusinessError extends Error {
  code: number;
  data: any;

  constructor(response: ApiResponse) {
    super(response.message || '请求失败');
    this.name = 'BusinessError';
    this.code = response.code;
    this.data = response.data;
  }
}

export function getHttpErrorMessage(status: number): string {
  return HTTP_STATUS_MAP[status] || `请求失败(${status})`;
}

export function handleAxiosError(error: AxiosError): string {
  if (error.response) {
    return getHttpErrorMessage(error.response.status);
  }
  if (error.code === 'ECONNABORTED') {
    return '请求超时，请检查网络';
  }
  if (error.code === 'ERR_NETWORK') {
    return '网络连接失败，请检查网络设置';
  }
  if (error.code === 'ERR_CANCELED') {
    return '请求已取消';
  }
  return error.message || '未知网络错误';
}

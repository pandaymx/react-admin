import { message } from 'antd';
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types';

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器
instance.interceptors.response.use(
  (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    // 根据业务状态码判断
    if (res.code !== undefined && res.code !== 200 && res.code !== 0) {
      message.error(res.message || '请求处理失败');
      return Promise.reject(new Error(res.message || 'Error'));
    }
    return response.data as any;
  },
  (error) => {
    const status = error.response?.status;
    let errorMsg = '网络连接异常，请稍后重试';

    if (status === 401) {
      errorMsg = '登录状态已失效，请重新登录';
      localStorage.removeItem('token');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    } else if (status === 403) {
      errorMsg = '没有权限访问该资源';
    } else if (status === 404) {
      errorMsg = '请求资源不存在';
    } else if (status >= 500) {
      errorMsg = '服务器内部错误';
    }

    const skipErrorMessage =
      (error.config as any)?.skipErrorHandler ||
      error.config?.headers?.['x-skip-error-message'] === 'true';
    if (!skipErrorMessage) {
      message.error(errorMsg);
    }
    return Promise.reject(error);
  },
);

export const request = <T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return instance.request(config);
};

export default instance;

import { message } from 'antd';
import axios, { type AxiosRequestConfig, type AxiosResponse } from 'axios';
import type { ApiResponse, AuthLoginRespVO } from '@/types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/admin-api';

const instance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
  paramsSerializer: {
    indexes: null,
  },
});

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
  config: AxiosRequestConfig;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else if (token && prom.config.headers) {
      prom.config.headers.Authorization = `Bearer ${token}`;
      prom.resolve(instance(prom.config));
    }
  });
  failedQueue = [];
};

const handleAuthExpired = () => {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('refreshToken');
  localStorage.removeItem('token');
  if (!window.location.hash.includes('/login') && window.location.pathname !== '/login') {
    if (window.location.hash) {
      window.location.hash = '#/login';
    } else {
      window.location.href = '/login';
    }
  }
};

// 请求拦截器 (携带 Bearer Token)
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken') || localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

// 响应拦截器 (处理业务 Code + 401 静默自动续期)
instance.interceptors.response.use(
  async (response: AxiosResponse<ApiResponse>) => {
    const res = response.data;
    const config = response.config as AxiosRequestConfig & { _retry?: boolean };

    // 成功业务码: 200 或 0 (Yudao 规范)
    if (res.code === 200 || res.code === 0 || res.code === undefined) {
      return response.data as any;
    }

    // 业务 401 拦截 (账号未登录 / Token 过期)
    if (res.code === 401) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken && !config._retry) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config });
          });
        }

        config._retry = true;
        isRefreshing = true;

        try {
          const refreshRes = await axios.post<ApiResponse<AuthLoginRespVO>>(
            `${API_BASE_URL}/system/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`,
          );

          if (
            (refreshRes.data.code === 200 || refreshRes.data.code === 0) &&
            refreshRes.data.data?.accessToken
          ) {
            const newAccessToken = refreshRes.data.data.accessToken;
            const newRefreshToken = refreshRes.data.data.refreshToken;
            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            processQueue(null, newAccessToken);

            if (config.headers) {
              config.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return instance(config);
          }
          throw new Error(refreshRes.data.msg || '刷新令牌失败');
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          handleAuthExpired();
          message.error('登录会话已过期，请重新登录');
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      handleAuthExpired();
      message.error(res.msg || res.message || '账号未登录或登录已失效');
      return Promise.reject(new Error(res.msg || res.message || 'Unauthorized'));
    }

    const errorMsg = res.msg || res.message || '请求处理失败';
    message.error(errorMsg);
    return Promise.reject(new Error(errorMsg));
  },
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & {
      _retry?: boolean;
    };
    const status = error.response?.status;

    if (status === 401 && !originalRequest._retry) {
      const refreshToken = localStorage.getItem('refreshToken');
      if (refreshToken) {
        if (isRefreshing) {
          return new Promise((resolve, reject) => {
            failedQueue.push({ resolve, reject, config: originalRequest });
          });
        }

        originalRequest._retry = true;
        isRefreshing = true;

        try {
          const refreshRes = await axios.post<ApiResponse<AuthLoginRespVO>>(
            `${API_BASE_URL}/system/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`,
          );

          if (
            (refreshRes.data.code === 200 || refreshRes.data.code === 0) &&
            refreshRes.data.data?.accessToken
          ) {
            const newAccessToken = refreshRes.data.data.accessToken;
            const newRefreshToken = refreshRes.data.data.refreshToken;
            localStorage.setItem('accessToken', newAccessToken);
            localStorage.setItem('token', newAccessToken);
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }

            processQueue(null, newAccessToken);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
            }
            return instance(originalRequest);
          }
          throw new Error('刷新令牌失败');
        } catch (refreshErr) {
          processQueue(refreshErr, null);
          handleAuthExpired();
          message.error('登录状态已失效，请重新登录');
          return Promise.reject(refreshErr);
        } finally {
          isRefreshing = false;
        }
      }

      handleAuthExpired();
      message.error('登录状态已失效，请重新登录');
      return Promise.reject(error);
    }

    let errorMsg = '网络连接异常，请稍后重试';
    if (status === 403) {
      errorMsg = '没有权限访问该资源';
    } else if (status === 404) {
      errorMsg = '请求资源不存在';
    } else if (status && status >= 500) {
      errorMsg = '服务器内部错误';
    }

    message.error(error.response?.data?.msg || error.response?.data?.message || errorMsg);
    return Promise.reject(error);
  },
);

export const request = <T = any>(config: AxiosRequestConfig): Promise<ApiResponse<T>> => {
  return instance.request(config);
};

export default instance;

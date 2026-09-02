import { request } from '@/api/request';
import type {
  ApiResponse,
  AuthLoginReqVO,
  AuthLoginRespVO,
  AuthPermissionInfoRespVO,
  CaptchaCheckReqVO,
  CaptchaCheckRespVO,
  CaptchaGetReqVO,
  CaptchaGetRespVO,
} from '@/types';

/**
 * 账号密码登录 (POST /admin-api/system/auth/login)
 */
export const loginApi = async (data: AuthLoginReqVO): Promise<ApiResponse<AuthLoginRespVO>> => {
  return request<AuthLoginRespVO>({
    url: '/system/auth/login',
    method: 'POST',
    data,
  });
};

/**
 * 刷新访问令牌 (POST /admin-api/system/auth/refresh-token)
 */
export const refreshTokenApi = async (
  refreshToken: string,
): Promise<ApiResponse<AuthLoginRespVO>> => {
  return request<AuthLoginRespVO>({
    url: `/system/auth/refresh-token?refreshToken=${encodeURIComponent(refreshToken)}`,
    method: 'POST',
  });
};

/**
 * 退出登录 (POST /admin-api/system/auth/logout)
 */
export const logoutApi = async (): Promise<ApiResponse<boolean>> => {
  return request<boolean>({
    url: '/system/auth/logout',
    method: 'POST',
  });
};

/**
 * 获取当前登录管理员的权限信息与用户信息 (GET /admin-api/system/auth/get-permission-info)
 */
export const getPermissionInfoApi = async (): Promise<ApiResponse<AuthPermissionInfoRespVO>> => {
  return request<AuthPermissionInfoRespVO>({
    url: '/system/auth/get-permission-info',
    method: 'GET',
  });
};

/**
 * 获取 AJ-Captcha 验证码 (POST /admin-api/system/captcha/get)
 */
export const getCaptchaApi = async (
  data: CaptchaGetReqVO = { captchaType: 'blockPuzzle' },
): Promise<ApiResponse<CaptchaGetRespVO>> => {
  return request<CaptchaGetRespVO>({
    url: '/system/captcha/get',
    method: 'POST',
    data,
  });
};

/**
 * 校验 AJ-Captcha 滑动验证码 (POST /admin-api/system/captcha/check)
 */
export const checkCaptchaApi = async (
  data: CaptchaCheckReqVO,
): Promise<ApiResponse<CaptchaCheckRespVO>> => {
  return request<CaptchaCheckRespVO>({
    url: '/system/captcha/check',
    method: 'POST',
    data,
  });
};

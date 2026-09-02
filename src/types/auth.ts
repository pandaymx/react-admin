/**
 * 系统认证与权限数据模型 (对接 Yudao /admin-api/system/auth/*)
 */

export interface AuthLoginReqVO {
  username: string; // 后台管理员账号 (4–16 位)
  password: string; // 密码 (4–16 位)
  captchaVerification?: string; // 验证码完成令牌 (若开启验证码)
}

export interface AuthLoginRespVO {
  userId: number | string; // 后台管理员用户 ID
  accessToken: string; // 访问令牌 (JWT)
  refreshToken: string; // 刷新令牌
  expiresTime: string; // 过期时间
}

export interface AuthPermissionInfoRespVO {
  user: {
    id: number | string;
    nickname: string;
    avatar?: string;
  };
  roles: string[]; // 角色标识列表
  permissions: string[]; // 权限标识列表 (如 'user:user:query')
  menus?: any[]; // 菜单树 (可选)
}

export interface CaptchaGetReqVO {
  captchaType: 'blockPuzzle' | 'clickWord';
}

export interface CaptchaGetRespVO {
  repCode?: string;
  repMsg?: string;
  repData?: {
    originalImageBase64: string;
    jigsawImageBase64: string;
    token: string;
    secretKey?: string;
  };
}

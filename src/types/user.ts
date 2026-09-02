/**
 * 用户模块数据模型定义 (与后端 AdminUserRespVO / AdminUserPageReqVO 完全对照)
 */

export type VerifyStatus = 'unverified' | 'pending' | 'personal' | 'enterprise' | 'creator';

export type UserStatus = 'normal' | 'banned' | 'muted' | 'cancelling' | 'cancelled';

/** 后端实名认证实体 */
export interface PersonalAuthItem {
  realName: string; // 脱敏姓名，如 张*三
  idCard: string; // 脱敏身份证，如 110101********1234
  authTime: string; // 实名认证通过时间
}

/** 后端接口原始响应实体: AdminUserRespVO */
export interface AdminUserRespVO {
  id: string;
  userId: number | string; // 展示号 / UID (如 100001)
  phoneNumber: string; // 手机号 (如 13800138000)
  status: 1 | 2 | 3; // 账号状态：1=正常, 2=禁用/封禁, 3=注销
  nickname: string;
  avatarUrl: string;
  qualification?: 1 | 2; // 认证类型：1=个人认证, 2=企业认证
  certified: boolean; // 是否已实名认证
  initStatus: 0 | 1; // 0=系统保底, 1=已初始化
  createTime: string; // 注册时间 (如 2026-09-02T10:45:00)
  fanCount: number; // 粉丝数
  followCount: number; // 关注数
  friendCount: number; // 好友数
  personalAuths?: PersonalAuthItem[]; // 实名认证信息列表
}

/** 后端用户统计概览响应实体: UserStatisticsRespVO */
export interface UserStatisticsRespVO {
  totalCount: number; // 用户总数
  normalCount: number; // 正常用户数 (status=1)
  disabledCount: number; // 禁用/封禁用户数 (status=2)
  cancelledCount: number; // 已注销用户数 (status=3)
  todayNewCount: number; // 今日新增用户
  weekNewCount: number; // 本周新增用户
  monthNewCount: number; // 本月新增用户
}

/** 后端分页结果封装 */
export interface PageResult<T> {
  list: T[];
  total: number;
}

/** 前端用户列表渲染通用模型 (兼容后端 VO 字段与前端治理视图) */
export interface UserItem {
  id: string;
  userId: number | string; // 展示号 / UID
  uid?: string; // 兼容展示
  username?: string; // 账号名
  nickname: string;
  avatar: string; // 头像
  avatarUrl?: string; // 后端头像字段
  phoneNumber?: string; // 手机号
  phone?: string; // 兼容字段
  status: UserStatus; // 前端枚举 normal | banned | cancelling | cancelled
  rawStatus?: 1 | 2 | 3; // 后端原始状态：1=正常, 2=禁用, 3=注销
  qualification?: 1 | 2; // 1=个人, 2=企业
  certified?: boolean; // 是否实名
  initStatus?: 0 | 1; // 0=系统保底, 1=已初始化
  verifyStatus: VerifyStatus; // 视图认证类型 (personal/enterprise/unverified)
  verifyInfo?: string;
  personalAuths?: PersonalAuthItem[]; // 实名认证列表
  fanCount: number; // 粉丝数
  followerCount?: number; // 兼容粉丝数字段
  followCount: number; // 关注数
  friendCount: number; // 好友数
  createTime: string | number; // 注册时间 (支持 ISO 字符串或毫秒时间戳)
  registerTime?: string; // 兼容注册时间
  accountBanExpireTime?: string; // 封禁到期时间 (永久或具体时间)
  banReason?: string; // 违规处置原因
  gender?: 'male' | 'female' | 'unknown';
  email?: string;
  bio?: string;
  commentCount?: number;
  postCount?: number;
  likeCount?: number;
  activityCount?: number;
  onlineActivityCount?: number;
  offlineActivityCount?: number;
  lastActiveTime?: string;
  activeStatus?: 'online' | 'offline' | 'recent';
  persona?: UserPersona;
}

export interface UserPersona {
  creditScore: number;
  creatorLevel: number;
  tags: Array<{
    category: string;
    list: Array<{ name: string; color: string; desc?: string }>;
  }>;
  dimensions: Array<{
    subject: string;
    score: number;
    fullMark: number;
  }>;
  audience: {
    genderRatio: { male: number; female: number };
    ageDistribution: Array<{ range: string; percent: number }>;
    topRegions: Array<{ region: string; percent: number }>;
    activePeakTime: string;
  };
  metrics: {
    avgPlayFinishRate: number;
    interactionRate: number;
    commercialIndex: number;
    estimatedAdQuote: string;
    violationCount: number;
  };
}

/** 用户分页检索入参实体: AdminUserPageReqVO */
export interface AdminUserPageReqVO {
  userId?: string | number; // 展示号 / UID
  phoneNumber?: string; // 手机号
  nickname?: string; // 昵称
  status?: number; // 账号状态：1正常/2禁用/3注销
  qualification?: number; // 认证：1个人/2企业
  certified?: boolean; // 是否实名
  createTime?: [string, string]; // 注册时间范围
  pageNo?: number; // 页码
  pageSize?: number; // 每页条数
}

/** 用户分页检索参数 (完全对齐 AdminUserPageReqVO) */
export interface UserQueryParams {
  userId?: string | number; // 展示号 / UID
  phoneNumber?: string; // 手机号
  nickname?: string; // 昵称
  keyword?: string; // 综合关键词
  status?: number | UserStatus | 'all'; // 状态: 1正常/2禁用/3注销 或 all
  qualification?: number | 'all'; // 认证类型: 1个人/2企业 或 all
  certified?: boolean | 'all'; // 实名认证: true/false 或 all
  dateRange?: [string, string]; // 注册时间范围
  pageNo?: number; // 页码 (对齐后端 pageNo)
  page?: number; // 兼容前端 page
  pageSize?: number;
}

export interface UserListResult {
  list: UserItem[];
  total: number;
  page: number;
  pageSize: number;
}

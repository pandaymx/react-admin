/**
 * 用户模块数据模型定义 (与后端 AdminUserRespVO / AdminUserPageReqVO 完全对照)
 */

export type VerifyStatus = 'unverified' | 'pending' | 'personal' | 'enterprise' | 'creator';

export type UserStatus = 'normal' | 'banned' | 'muted' | 'cancelling' | 'cancelled';

/** 后端实名认证实体 */
export interface PersonalAuthItem {
  realName: string; // 脱敏姓名，如 张*三
  idCard: string; // 脱敏身份证，如 110101********1234
  authTime?: string; // 实名认证通过时间
  createdAt?: string; // 认证创建时间 (后端 PersonalAuthVO.createdAt)
  isDefault?: boolean;
}

export type CertificationLabel = '企业认证' | '个人认证' | '审核中' | '未实名';

/** 认证条目详情 */
export interface CertificationSummaryItem {
  type: 'personal' | 'enterprise' | string;
  status: string;
  reviewStatus?: string;
  displayName?: string;
  isVerified?: boolean;
  certifiedAt?: string | null;
  submittedAt?: string | null;
}

/** 统一认证摘要对象 (包含单字段 certificationLabel) */
export interface CertificationSummary {
  userId?: string | number;
  hasPending?: boolean;
  certificationLabel: CertificationLabel | string;
  primary?: CertificationSummaryItem;
  items?: CertificationSummaryItem[];
}

/** 内容治理限制功能类型：post-禁发动态/帖, comment-禁评, activity_publish-禁发布活动, account-全量封号 */
export type RestrictionType = 'post' | 'comment' | 'activity_publish' | 'account' | string;

/** 限制状态：active-生效中, revoked-已解除, expired-已到期 */
export type RestrictionStatus = 'active' | 'revoked' | 'expired' | string;

/** 治理处置来源：manual-管理员人工, report-举报受理, rule-AI规则风控 */
export type ModerationSourceType = 'manual' | 'report' | 'rule' | string;

/** 治理动作类型 */
export type ModerationActionType =
  | 'warning'
  | 'ban_post'
  | 'ban_comment'
  | 'ban_activity'
  | 'ban_all'
  | string;

/** 单条内容限制与惩戒明细记录 (对接后端 AdminContentRestrictionRespVO) */
export interface ContentRestrictionItem {
  id: number | string;
  userId: string; // 被限制用户主键ID (app_users.id)
  restrictionType: RestrictionType; // 限制类型：post / comment / activity_publish / account
  status: RestrictionStatus; // 状态：active / revoked / expired
  reason: string; // 限制原因
  sourceType?: ModerationSourceType; // 来源类型：report / manual / rule
  sourceId?: string;
  moderationRecordId?: number;
  ruleId?: number;
  operatorUserId?: string; // 操作管理员ID
  startAt?: string; // 限制开始时间
  endAt?: string | null; // 限制结束时间，NULL表示永久
  revokedAt?: string | null; // 解除时间
  revokeReason?: string | null; // 解除原因
  createdAt?: string;
  updatedAt?: string;
}

export interface ContentRestrictionPageReqVO {
  userId?: string;
  restrictionType?: string;
  status?: string;
  pageNo?: number;
  pageSize?: number;
}

export interface ModerationRevokeReqVO {
  restrictionId: number | string;
  reason: string;
}

/** 后端接口原始响应实体: AdminUserRespVO */
export interface AdminUserRespVO {
  id: string;
  userId: number | string; // 展示号 / UID (如 100001)
  userNo?: string | number; // 用户展示号（对齐后端 app_users.user_id / userNo）
  phoneNumber: string; // 手机号 (如 13800138000)
  status: 1 | 2 | 3; // 账号状态：1=正常, 2=禁用/封禁, 3=注销
  nickname: string;
  avatarUrl: string;
  certificationSummary?: CertificationSummary; // 统一认证摘要
  /** @deprecated 历史冗余字段恒为1，请使用 certificationSummary.certificationLabel */
  qualification?: 1 | 2;
  /** @deprecated 布尔值无法表达审核中，请使用 certificationSummary.certificationLabel */
  certified?: boolean;
  /** @deprecated 真实认证通过时间请使用 certificationSummary.primary.certifiedAt */
  certifiedTime?: string | null;
  initStatus: 0 | 1; // 0=系统保底, 1=已初始化
  createTime: string; // 注册时间 (如 2026-09-02T10:45:00)
  fanCount: number; // 粉丝数
  followCount: number; // 关注数
  friendCount: number; // 好友数
  personalAuths?: PersonalAuthItem[]; // 实名认证信息列表
  restrictions?: ContentRestrictionItem[]; // 内容治理限制记录列表
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
  userNo?: string | number; // 用户展示号（对齐后端 app_users.user_id / userNo）
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
  certificationSummary?: CertificationSummary; // 统一认证摘要
  certificationLabel: CertificationLabel | string; // 后端单字段直接渲染标签：企业认证 | 个人认证 | 审核中 | 未实名
  qualification?: 1 | 2; // 兼容过渡字段
  certified?: boolean; // 兼容过渡字段
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
  restrictions?: ContentRestrictionItem[]; // 当前生效或关联的内容限制惩戒清单
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
  userNo?: string | number; // 用户展示号
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
  userNo?: string | number; // 用户展示号
  userId?: string | number; // 展示号 / UID
  uid?: string | number; // 兼容展示号
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

export type VerifyStatus = 'unverified' | 'pending' | 'personal' | 'enterprise' | 'creator';

export type UserStatus = 'normal' | 'banned' | 'muted' | 'cancelling' | 'cancelled';

export type UserCommentStatus = 'allowed' | 'forbidden';

export type ActiveStatus = 'online' | 'offline' | 'recent';

export interface UserItem {
  restrictions?: ContentRestrictionItem[];
  id: string;
  uid: string; // 类似于抖音查询的业务ID
  username: string;
  nickname: string;
  avatar: string;
  gender: 'male' | 'female' | 'unknown';
  verifyStatus: VerifyStatus;
  verifyInfo?: string;
  status: UserStatus;
  accountBanExpireTime?: string; // 账号封禁到期时间，如 '2026-09-09 13:40:00' 或 'permanent'
  banReason?: string; // 最近一次封禁处置原因
  commentCount: number;
  commentStatus: UserCommentStatus;
  commentBanExpireTime?: string; // 评论封禁到期时间，如 '2026-09-08 18:00:00' 或 'permanent'
  postCount: number;
  postStatus?: 'allowed' | 'forbidden'; // 发帖权限
  postBanExpireTime?: string; // 发帖封禁到期时间
  likeCount: number;
  followerCount: number;
  activityCount: number;
  onlineActivityCount?: number; // 参与线上活动场次（如话题挑战赛、直播打榜）
  offlineActivityCount?: number; // 参与线下活动场次（如创作者沙龙、行业峰会）
  activityHistory?: Array<{
    id: string;
    title: string;
    type: 'online' | 'offline';
    date: string;
    role?: string;
  }>;
  lastActiveTime: string;
  activeStatus: ActiveStatus;
  registerTime: string;
  email?: string;
  phone?: string;
  bio?: string;
  persona?: UserPersona;
}

export interface UserPersona {
  creditScore: number; // 社区信用分 (350 - 950)
  creatorLevel: number; // 创作者成长等级 (Lv.1 - Lv.10)
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
    avgPlayFinishRate: number; // 完播率 %
    interactionRate: number; // 互动转化率 %
    commercialIndex: number; // 商业化价值指数 (0-100)
    estimatedAdQuote: string; // 预估单条商单合作价
    violationCount: number; // 历史违规处罚次数
  };
}

export interface UserQueryParams {
  keyword?: string;
  uid?: string;
  verifyStatus?: VerifyStatus | 'all';
  status?: UserStatus | 'all';
  activeStatus?: ActiveStatus | 'all'; // 活跃状态筛选
  dateRange?: [string, string];
  page?: number;
  pageSize?: number;
}

export interface UserListResult {
  list: UserItem[];
  total: number;
  page: number;
  pageSize: number;
}

export type RestrictionType = 'post' | 'comment' | 'activity_publish' | 'account' | string;
export type RestrictionStatus = 'active' | 'revoked' | 'expired' | string;
export type ModerationSourceType = 'manual' | 'report' | 'rule' | string;

export interface ContentRestrictionItem {
  id: number | string;
  userId: string;
  restrictionType: RestrictionType;
  status: RestrictionStatus;
  reason: string;
  sourceType?: ModerationSourceType;
  sourceId?: string;
  moderationRecordId?: number;
  ruleId?: number;
  operatorUserId?: string;
  startAt?: string;
  endAt?: string | null;
  revokedAt?: string | null;
  revokeReason?: string | null;
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

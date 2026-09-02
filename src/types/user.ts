export type VerifyStatus = 'unverified' | 'pending' | 'personal' | 'enterprise' | 'creator';

export type UserStatus = 'normal' | 'banned' | 'muted' | 'cancelling' | 'cancelled';

export type UserCommentStatus = 'allowed' | 'forbidden';

export type ActiveStatus = 'online' | 'offline' | 'recent';

export interface UserItem {
  id: string;
  uid: string; // 类似于抖音查询的业务ID
  username: string;
  nickname: string;
  avatar: string;
  gender: 'male' | 'female' | 'unknown';
  verifyStatus: VerifyStatus;
  verifyInfo?: string;
  status: UserStatus;
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

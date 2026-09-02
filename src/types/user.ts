export type VerifyStatus = 'unverified' | 'pending' | 'personal' | 'enterprise' | 'creator';

export type UserStatus = 'normal' | 'banned' | 'muted' | 'cancelled';

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
  postCount: number;
  likeCount: number;
  followerCount: number;
  activityCount: number;
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

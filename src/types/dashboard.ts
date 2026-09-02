export interface DashboardOverviewStats {
  totalUsers: number;
  newUsersToday: number;
  activeUsersToday: number;
  userGrowthRate: number;

  totalPosts: number;
  newPostsToday: number;
  postInteractions: number;
  postGrowthRate: number;

  pendingReports: number;
  urgentReports: number;
  reportResolvedToday: number;

  pendingAppeals: number;
  appealResolvedToday: number;

  pendingVerifications: number;
  verifiedCreatorsCount: number;
}

export interface PendingTaskItem {
  id: string;
  type: 'report' | 'appeal' | 'verification' | 'post';
  title: string;
  desc: string;
  priority: 'urgent' | 'high' | 'normal';
  targetUser: {
    nickname: string;
    username: string;
    avatar: string;
  };
  time: string;
  link: string;
}

export interface SecurityAuditStreamItem {
  id: string;
  actionType:
    | 'ban_user'
    | 'unban_user'
    | 'delete_post'
    | 'approve_appeal'
    | 'verify_passed'
    | 'mute_user';
  operator: string;
  targetDesc: string;
  reason: string;
  time: string;
  status: 'success' | 'warning' | 'info';
}

export interface ViolationCategoryStat {
  name: string;
  count: number;
  percent: number;
  color: string;
}

export interface ActivityTrendItem {
  date: string;
  posts: number;
  comments: number;
  likes: number;
  violations: number;
}

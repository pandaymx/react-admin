export type AppealType =
  | 'account_ban'
  | 'comment_mute'
  | 'post_violation'
  | 'activity_ban'
  | 'credit_deduct';

export type AppealStatus = 'pending' | 'approved' | 'rejected';

export interface AppealUser {
  id: string;
  userNo?: string; // 用户展示号（对齐后端 app_users.user_id / userNo）
  uid: string;
  username: string;
  nickname: string;
  avatar: string;
  phone?: string;
}

export interface AppealEvidence {
  id: string;
  url: string;
  name: string;
}

export interface AppealItem {
  id: string; // 申诉单号，如 AP20260902001
  user: AppealUser;
  appealType: AppealType;
  targetContent?: string; // 原始违规对象简介/作品标题/评论文案
  originalPunishReason: string; // 原始处罚原因
  originalPunishTime: string; // 原始处罚时间
  originalBanExpireTime?: string; // 原始封禁期限 (如 '2026-09-09 13:40:00' 或 'permanent')
  appealReason: string; // 申诉陈述与自述理由
  appealEvidences: AppealEvidence[]; // 举证图片列表
  status: AppealStatus;
  reviewer?: string; // 审核管理员
  reviewTime?: string; // 审核时间
  reviewRemark?: string; // 审核判定理由 / 驳回说明
  restoreActions?: string[]; // 通过时执行的恢复动作说明，如 ['已解除账号封禁', '已恢复作品公开展示']
  createdAt: string; // 申诉提交时间
}

export interface AppealQueryParams {
  keyword?: string; // 申诉单号/用户名/用户展示号
  userNo?: string; // 申诉人展示号
  uid?: string; // 兼容展示号
  appealType?: AppealType | 'all';
  status?: AppealStatus | 'all';
  dateRange?: [string, string];
  page?: number;
  pageSize?: number;
}

export interface AppealListResult {
  list: AppealItem[];
  total: number;
  page: number;
  pageSize: number;
  stats: {
    totalCount: number;
    pendingCount: number;
    approvedCount: number;
    rejectedCount: number;
    avgHandleTime: string; // 平均审核时长
  };
}

export interface HandleAppealParams {
  id: string;
  action: 'approve' | 'reject';
  reviewRemark: string;
  reviewer?: string;
  notifyUser?: boolean;
}

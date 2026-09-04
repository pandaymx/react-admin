export type ReportTargetType = 'post' | 'comment' | 'user' | 'activity';

export type ReportReason =
  | 'illegal'
  | 'porn'
  | 'abuse'
  | 'ad_fraud'
  | 'copyright'
  | 'rumor'
  | 'gambling'
  | 'other';

/**
 * 举报状态（兼容后端与旧前端枚举）
 * - pending: 待处理
 * - processing: 处理中
 * - resolved: 已处理 (兼容 processed)
 * - rejected: 已驳回
 * - cancelled: 已撤销 (兼容 ignored)
 */
export type ReportStatus =
  | 'pending'
  | 'processing'
  | 'resolved'
  | 'rejected'
  | 'cancelled'
  | 'processed'
  | 'ignored';

/**
 * 处罚动作（兼容后端 actions）
 * - dismiss: 驳回申请
 * - delete_target: 删除/下架目标违规内容 (兼容 ban_post, delete_comment)
 * - warn_user: 警告用户
 * - temp_ban: 临时封禁/禁发动态 (兼容 mute_user)
 * - perm_ban: 永久封号 (兼容 ban_user)
 * - none: 无处罚
 */
export type PenaltyAction =
  | 'dismiss'
  | 'delete_target'
  | 'warn_user'
  | 'temp_ban'
  | 'perm_ban'
  | 'ban_post'
  | 'delete_comment'
  | 'mute_user'
  | 'ban_user'
  | 'none';

export interface ReporterInfo {
  userId?: string;
  userNo?: string; // 用户展示号（对齐后端 app_users.user_id / userNo）
  uid: string;
  nickname: string;
  avatar: string;
}

export interface TargetUserInfo {
  userId?: string;
  userNo?: string; // 用户展示号（对齐后端 app_users.user_id / userNo）
  uid: string;
  nickname: string;
  avatar: string;
  violationCount?: number;
}

export interface TargetSnapshotInfo {
  targetId: string;
  targetType: string;
  title?: string;
  content?: string;
  coverUrl?: string;
  currentStatus?: string;
  publishTime?: string;
}

export interface ReportHandlingInfo {
  id?: number;
  handlerUserId?: string;
  handlerName?: string;
  action?: PenaltyAction;
  actionDetail?: string;
  memo?: string;
  handleTime?: string;
}

export interface ReportedTargetInfo {
  targetId: string; // 帖子ID / 评论ID / 被举报人UID
  targetType: ReportTargetType;
  titleOrContent?: string; // 帖子标题或评论内容
  coverUrl?: string; // 帖子封面
  targetUser: TargetUserInfo;
}

export interface ReportItem {
  id: string; // 举报单号
  targetType: ReportTargetType;
  targetId?: string;
  reason: ReportReason;
  reasonCode?: string;
  reasonDesc: string; // 举报人补充的文字说明
  evidenceImages: string[]; // 举报人上传的证据截图
  reporter: ReporterInfo; // 举报人
  target: ReportedTargetInfo; // 被举报目标详情
  targetUser?: TargetUserInfo; // 聚合被举报人
  targetSnapshot?: TargetSnapshotInfo; // 聚合被举报目标快照
  status: ReportStatus; // 处理状态
  penaltyAction?: PenaltyAction; // 采取的处罚手段
  handleRemark?: string; // 管理员处理说明
  handler?: string; // 处理人
  handleTime?: string; // 处理时间
  createTime: string; // 举报时间
  handling?: ReportHandlingInfo;
  handlingHistory?: ReportHandlingInfo[];
}

export interface ReportQueryParams {
  keyword?: string; // 搜索单号/内容/被举报人
  targetType?: ReportTargetType | 'all';
  reason?: ReportReason | 'all';
  status?: ReportStatus | 'all';
  dateRange?: [string, string];
  page?: number;
  pageNo?: number;
  pageSize?: number;
}

/** 举报数据概览（对齐后端 AdminFeedsReportSummaryRespVO） */
export interface ReportSummaryVO {
  pendingCount: number;
  todayNewCount: number;
  resolvedCount: number;
  rejectedCount: number;
  avgHandleTimeMinutes?: number;
}

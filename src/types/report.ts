export type ReportTargetType = 'post' | 'comment' | 'user';

export type ReportReason =
  | 'illegal'
  | 'porn'
  | 'abuse'
  | 'ad_fraud'
  | 'copyright'
  | 'rumor'
  | 'other';

export type ReportStatus = 'pending' | 'processed' | 'rejected' | 'ignored';

export type PenaltyAction =
  | 'ban_post'
  | 'delete_comment'
  | 'mute_user'
  | 'ban_user'
  | 'warn_user'
  | 'none';

export interface ReporterInfo {
  uid: string;
  nickname: string;
  avatar: string;
}

export interface ReportedTargetInfo {
  targetId: string; // 帖子ID / 评论ID / 被举报人UID
  targetType: ReportTargetType;
  titleOrContent?: string; // 帖子标题或评论内容
  coverUrl?: string; // 帖子封面
  targetUser: {
    uid: string;
    nickname: string;
    avatar: string;
  };
}

export interface ReportItem {
  id: string; // 举报单号，如 RPT_202609001
  targetType: ReportTargetType;
  reason: ReportReason;
  reasonDesc: string; // 举报人补充的文字说明
  evidenceImages: string[]; // 举报人上传的证据截图
  reporter: ReporterInfo; // 举报人
  target: ReportedTargetInfo; // 被举报目标详情
  status: ReportStatus; // 处理状态
  penaltyAction?: PenaltyAction; // 采取的处罚手段
  handleRemark?: string; // 管理员处理说明
  handler?: string; // 处理人
  handleTime?: string; // 处理时间
  createTime: string; // 举报时间
}

export interface ReportQueryParams {
  keyword?: string; // 搜索单号/内容/被举报人
  targetType?: ReportTargetType | 'all';
  reason?: ReportReason | 'all';
  status?: ReportStatus | 'all';
  dateRange?: [string, string];
  page?: number;
  pageSize?: number;
}

export type CommentStatus =
  | 'normal'
  | 'hidden'
  | 'top'
  | 'published'
  | 'rejected'
  | 'deleted'
  | 'pending';

export type CommentRiskTag = 'normal' | 'ad_suspect' | 'abuse' | 'spam';

export interface CommentAuthor {
  userNo?: string; // 用户展示号（对齐后端 app_users.user_id / userNo）
  uid: string; // 兼容旧展示号
  userId?: string; // 内部用户 ID
  nickname: string;
  username: string;
  avatar: string;
}

export interface CommentItem {
  id: string; // 评论 ID，如 CMT_10001
  postId: string; // 所属作品 ID
  postTitle?: string; // 所属作品标题
  postCover?: string; // 所属作品封面
  author: CommentAuthor;
  content: string; // 评论正文
  replyTo?: string; // 回复的目标用户昵称
  likeCount: number;
  replyCount: number;
  status: CommentStatus;
  riskTag: CommentRiskTag;
  createTime: string;
  ipLocation?: string; // IP 属地
  parentId?: string;
  targetType?: string;
  sensitiveWordTags?: string[];
  sensitiveLabels?: string[];
}

export interface CommentQueryParams {
  postId?: string; // 按特定作品筛选
  targetType?: string; // 目标类型，默认 post
  keyword?: string; // 评论内容关键词
  userNo?: string; // 评论人展示号
  uid?: string; // 兼容评论人 UID
  status?: CommentStatus | 'all';
  riskTag?: CommentRiskTag | 'all';
  dateRange?: [string, string];
  page?: number;
  pageNo?: number;
  pageSize?: number;
}

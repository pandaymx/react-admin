export type CommentStatus = 'normal' | 'hidden' | 'top';

export type CommentRiskTag = 'normal' | 'ad_suspect' | 'abuse' | 'spam';

export interface CommentAuthor {
  uid: string;
  nickname: string;
  username: string;
  avatar: string;
}

export interface CommentItem {
  id: string; // 评论 ID，如 CMT_10001
  postId: string; // 所属作品 ID
  postTitle: string; // 所属作品标题
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
}

export interface CommentQueryParams {
  postId?: string; // 按特定帖子筛选
  keyword?: string; // 评论内容关键词
  uid?: string; // 评论人 UID
  status?: CommentStatus | 'all';
  riskTag?: CommentRiskTag | 'all';
  dateRange?: [string, string];
  page?: number;
  pageSize?: number;
}

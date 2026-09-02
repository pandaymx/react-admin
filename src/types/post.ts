import type { VerifyStatus } from './user';

export type PostType = 'video' | 'image_text';

export type PostAuditStatus = 'published' | 'auditing' | 'banned' | 'private';

export type CommentPermission = 'open' | 'closed' | 'fans_only';

export interface PostAuthor {
  uid: string;
  nickname: string;
  username: string;
  avatar: string;
  verifyStatus: VerifyStatus;
}

export interface PostItem {
  id: string; // 作品 ID，如 POST_202609001
  title: string; // 标题与文案
  type: PostType; // 视频 / 图文
  coverUrl: string; // 封面缩略图
  videoUrl?: string; // 视频链接
  images?: string[]; // 图文图片列表
  topics: string[]; // 包含的话题标签
  author: PostAuthor;
  likeCount: number;
  commentCount: number;
  shareCount: number;
  collectCount: number;
  status: PostAuditStatus;
  commentPermission: CommentPermission;
  isTop: boolean; // 是否置顶推荐
  publishTime: string;
}

export interface PostQueryParams {
  keyword?: string; // 标题/话题关键词
  uid?: string; // 作者 UID
  type?: PostType | 'all';
  status?: PostAuditStatus | 'all';
  commentPermission?: CommentPermission | 'all';
  dateRange?: [string, string];
  page?: number;
  pageSize?: number;
}

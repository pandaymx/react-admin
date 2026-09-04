import type { VerifyStatus } from './user';

/**
 * 帖子类型枚举（对齐后端 PostTypeEnum）
 * - post: 图文帖子
 * - video: 短视频
 * - whimsy: 奇思妙想（纯文本轻动态，支持自定义背景卡片）
 * 兼容旧字段: 'image_text'
 */
export type PostType = 'post' | 'video' | 'whimsy' | 'image_text';

/**
 * 帖子状态枚举（对齐后端 PostStatusEnum）
 * - draft: 草稿
 * - pending: 审核中 (兼容 auditing)
 * - published: 正常已发布
 * - rejected: 审核拒绝 / 违规下架 (兼容 banned)
 * - deleted: 已软删除
 */
export type PostStatus =
  | 'draft'
  | 'pending'
  | 'published'
  | 'rejected'
  | 'deleted'
  | 'auditing'
  | 'banned'
  | 'private';

/** 兼容旧代码的状态别名 */
export type PostAuditStatus = PostStatus;

/** 可见范围（对齐后端 PostVisibilityEnum） */
export type PostVisibility = 'public' | 'friend' | 'private';

/** 评论权限设置 */
export type CommentPermission = 'open' | 'closed' | 'fans_only';

/** 媒体资源项（对齐后端 FeedsPostMediaRelDO / AppFeedsPostRespVO.Media） */
export interface PostMediaItem {
  id?: string;
  mediaType: 'image' | 'video';
  url: string;
  coverUrl?: string;
  width?: number;
  height?: number;
  duration?: number; // 视频时长（秒）
}

/** 帖子交互统计（对齐后端 FeedsPostStatisticsDO） */
export interface PostStatistics {
  viewCount: number;
  likeCount: number;
  commentCount: number;
  favoriteCount: number;
  shareCount: number;
}

/** 关联装备快照（对齐后端 FeedsPostEquipmentRelDO / AppFeedsPostRespVO.Equipment） */
export interface PostEquipmentItem {
  userEquipmentId?: string;
  productName: string;
  brandName?: string;
  categoryName?: string;
  pictureUrl?: string;
}

/** 关联正在参加的活动（对齐后端 AppFeedsPostRespVO.CurrentActivity） */
export interface PostCurrentActivity {
  activityId: string;
  title: string;
  iconUrl?: string;
}

/** 帖子作者画像与认证公开信息 */
export interface PostAuthor {
  uid: string;
  userNo?: string; // 用户展示号（对齐后端 app_users.user_id / userNo）
  userId?: string;
  nickname: string;
  username?: string;
  avatar: string;
  verifyStatus?: VerifyStatus;
  verifyLabel?: string;
  ipLocation?: string;
}

/** 审核任务与违规记录（对齐后端 FeedsPostAuditTaskDO） */
export interface PostAuditTaskItem {
  id: string;
  auditMode: 'alicloud' | 'manual'; // 机审 / 人工
  contentType?: 'text' | 'image' | 'video';
  suggestion?: 'pass' | 'review' | 'block';
  label?: string; // 命中标签，如 porn, terrorism, ad
  reason?: string; // 驳回原因
  createdAt?: string | number;
  updatedAt?: string | number;
  operator?: string;
}

/**
 * 帖子核心领域模型（对齐后端 FeedsPostDO 与 AppFeedsPostRespVO）
 */
export interface PostItem {
  id: string; // 帖子雪花 ID，如 1892837482910283921
  userId?: string;
  title: string;
  content?: string;
  postType?: PostType;
  backgroundStyle?: string; // 奇思妙想背景样式标识
  location?: string; // 发布地点
  ipLocation?: string; // IP 归属地
  visibility?: PostVisibility;
  status: PostStatus;
  manualReviewFlag?: number; // 0-无需人工审核，1-需人工审核
  isTop: boolean; // 运营推荐置顶
  commentPermission?: CommentPermission;

  // 关联信息
  author: PostAuthor;
  mediaList?: PostMediaItem[];
  statistics?: PostStatistics;
  equipmentList?: PostEquipmentItem[];
  currentActivity?: PostCurrentActivity;
  auditTasks?: PostAuditTaskItem[];

  // 时间维度（后端为 Long 时间戳数字，前端支持 number 与 string 双向兼容）
  createdAt?: string | number;
  updatedAt?: string | number;

  // 向下兼容历史前端展示字段
  type: PostType;
  coverUrl: string;
  videoUrl?: string;
  images?: string[];
  topics: string[];
  likeCount: number;
  commentCount: number;
  shareCount: number;
  collectCount: number;
  favoriteCount?: number;
  publishTime: string | number;
}

/**
 * 帖子分页查询请求参数（对齐后端 AdminFeedsPostPageReqVO）
 */
export interface PostQueryParams {
  keyword?: string; // 标题/内容关键词
  userId?: string; // 发布者 ID
  userNo?: string; // 用户展示号
  uid?: string; // 兼容作者展示号
  postType?: PostType | 'all';
  type?: PostType | 'all'; // 兼容旧入参
  status?: PostStatus | 'all';
  visibility?: PostVisibility | 'all';
  commentPermission?: CommentPermission | 'all';
  dateRange?: [string, string];
  isTop?: boolean;
  page?: number;
  pageNo?: number;
  pageSize?: number;
}

/**
 * 帖子全局管控统计概览
 */
export interface PostStatisticsSummaryVO {
  totalCount: number; // 帖子总数
  todayNewCount: number; // 今日发布新增
  pendingReviewCount: number; // 待审核量
  rejectedCount: number; // 违规下架量
  totalInteractions: number; // 累计互动总量
}

/**
 * 审核处置请求参数
 */
export interface PostAuditActionParams {
  postId: string;
  action: 'pass' | 'reject';
  rejectReason?: string;
  violationLabel?: string;
  notifyAuthor?: boolean;
  remark?: string;
}

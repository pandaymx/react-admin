/**
 * 活动管理体系数据类型定义
 * 对齐后端 yudao-module-activity2 (AdminActivityController)
 */

export type ActivityStatus =
  | 0 // 草稿
  | 5 // 审核中
  | 1 // 已发布
  | 2 // 进行中
  | 3 // 已结束
  | 4 // 已取消
  | 6; // 已驳回

export type FeeMode = 'FREE' | 'PAID' | 'AA' | 'AA_OFFLINE';

export interface MeetingPointItem {
  id?: string;
  name: string;
  address?: string;
  timeText: string;
  longitude?: number;
  latitude?: number;
}

export interface ActivityImageItem {
  id?: string;
  url: string;
  isCover: number; // 1=封面 (有且仅一张), 0=普通轮播图
  sort: number;
}

export interface ActivityManagerItem {
  id?: string;
  userId: string;
  role: string; // 领队、向导、安全员、摄影师等
  nickname?: string;
  avatarUrl?: string;
}

export interface ActivityItineraryItem {
  id?: string;
  dayNo: number; // 第几日 (从1开始)
  timeText: string; // 如 "08:30" 或 "上午"
  content: string; // 行程简述
}

export interface ActivityFeeItem {
  id?: string;
  title: string;
  content: string;
  feeType?: 'include' | 'exclude'; // 费用包含 / 不包含
}

export interface ActivityModelItem {
  id?: string;
  name?: string;
  height?: number;
  weight?: number;
  shoesSize?: number;
  notes?: string;
}

export interface ActivityEnrollmentItem {
  id: string;
  userId: string;
  nickname: string;
  avatarUrl: string;
  phone?: string;
  enrollCount: number;
  status: 'CONFIRMED' | 'CHECKED_IN' | 'CANCELLED' | 'REFUNDED';
  paymentStatus?: 'PAID' | 'REFUNDED' | 'FREE';
  createdAt: string;
}

export interface ActivityItem {
  id: string;
  title: string;
  categoryId?: string;
  categoryName?: string;
  subcategoryId: string;
  subcategoryName?: string;
  publisherUserId: string;
  publisherNickname?: string;
  publisherAvatarUrl?: string;
  status: ActivityStatus;
  rejectReason?: string;
  coverUrl?: string;
  city: string;
  startTime: string;
  endTime: string;
  enrollDeadline: string;
  feeMode: FeeMode;
  feeAmount: number;
  currentEnrollCount: number;
  maxParticipants: number;
  minParticipants: number;
  ageMin: number;
  ageMax: number;
  introduction?: string;
  enrollNotice?: string;
  caution?: string;
  tips?: string;
  refundRuleType?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface ActivityDetailRespVO extends ActivityItem {
  meetingPoints: MeetingPointItem[];
  images: ActivityImageItem[];
  managers: ActivityManagerItem[];
  itineraries: ActivityItineraryItem[];
  feeItems: ActivityFeeItem[];
  equipmentRefs: string[];
  models: ActivityModelItem[];
  enrollments?: ActivityEnrollmentItem[];
}

export interface ActivitySaveReqVO {
  id?: string;
  subcategoryId: string;
  publisherUserId?: string;
  title: string;
  introduction?: string;
  enrollNotice?: string;
  caution?: string;
  tips?: string;
  maxParticipants: number;
  minParticipants: number;
  startTime: string;
  endTime: string;
  ageMin: number;
  ageMax: number;
  enrollDeadline: string;
  refundRuleType?: string;
  feeMode: FeeMode;
  feeAmount?: number;
  city: string;
  longitude?: number;
  latitude?: number;
  meetingPoints?: MeetingPointItem[];
  images?: ActivityImageItem[];
  managers?: ActivityManagerItem[];
  itineraries?: ActivityItineraryItem[];
  feeItems?: ActivityFeeItem[];
  equipmentIds?: string[];
  models?: ActivityModelItem[];
}

export interface ActivityPageReqVO {
  pageNo?: number;
  pageSize?: number;
  status?: ActivityStatus | 'all';
  categoryId?: string;
  subcategoryId?: string;
  city?: string;
  publisherUserId?: string;
  title?: string;
}

export interface ActivitySummaryKPI {
  totalCount: number;
  publishedCount: number;
  inProgressCount: number;
  auditingCount: number;
  draftCount: number;
  endedCount: number;
  cancelledCount: number;
  totalParticipants: number;
  totalRevenue: number;
}

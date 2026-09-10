/**
 * 标签管理体系数据类型定义
 * 对齐后端 yudao-module-user (AdminTagController, AdminTagTypeController, AdminInitialTagConfigController)
 */

export type TagStatus = 'active' | 'disabled';

export interface TagTypeItem {
  id: string | number;
  name: string;
  status: TagStatus;
  maxSelectQuantity: number; // 最大可选数量，0=不限
  sort: number;
  createdAt?: string;
  updatedAt?: string;
  // 前端视图扩展属性
  tagCount?: number;
  userCount?: number;
  description?: string;
  icon?: string;
}

export interface AdminTagTypePageReqVO {
  pageNo?: number;
  pageSize?: number;
  name?: string;
  status?: TagStatus | 'all';
}

export interface AdminTagTypeCreateReqVO {
  name: string;
  status: TagStatus;
  maxSelectQuantity: number;
  sort: number;
  description?: string;
  icon?: string;
}

export interface AdminTagTypeUpdateReqVO extends AdminTagTypeCreateReqVO {
  id: string | number;
}

export interface TagItem {
  id: string | number;
  tagTypeId: string | number;
  tagTypeName?: string;
  name: string;
  iconUrl?: string;
  status: TagStatus;
  sort: number;
  createdAt?: string;
  updatedAt?: string;
  // 视图扩展
  color?: string;
  userCount?: number;
}

export interface AdminTagPageReqVO {
  pageNo?: number;
  pageSize?: number;
  tagTypeId?: string | number | 'all';
  name?: string;
  status?: TagStatus | 'all';
}

export interface AdminTagCreateReqVO {
  tagTypeId: string | number;
  name: string;
  status: TagStatus;
  sort: number;
  iconUrl?: string;
  color?: string;
}

export interface AdminTagUpdateReqVO extends AdminTagCreateReqVO {
  id: string | number;
}

export interface InitialTagConfigItem {
  id: string | number;
  scene: string; // 场景代码，如 REGISTER_FIRST_LOGIN, ONBOARDING_PROFILE, ACTIVITY_PREF
  tagTypeId: string | number;
  tagTypeName?: string;
  tagId?: string | number | null; // 为空表示该类型下所有 active 标签全部展示
  tagName?: string;
  status: TagStatus;
  sort: number;
  createdAt?: string;
}

export interface AdminInitialTagConfigCreateReqVO {
  scene: string;
  tagTypeId: string | number;
  tagId?: string | number | null;
  status: TagStatus;
  sort: number;
}

export interface AdminInitialTagConfigUpdateReqVO extends AdminInitialTagConfigCreateReqVO {
  id: string | number;
}

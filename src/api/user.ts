import { request } from '@/api/request';
import type {
  AdminUserPageReqVO,
  AdminUserRespVO,
  ApiResponse,
  PageResult,
  UserItem,
  UserListResult,
  UserQueryParams,
  UserStatisticsRespVO,
  UserStatus,
} from '@/types';
import { formatDateTime } from '@/utils/time';

/**
 * 转换后端 UserStatus 映射
 * 后端: 1=正常, 2=禁用/封禁, 3=注销
 */
export function mapBackendStatusToFrontend(rawStatus?: number): UserStatus {
  if (rawStatus === 2) return 'banned';
  if (rawStatus === 3) return 'cancelled';
  return 'normal';
}

export function mapFrontendStatusToBackend(status: UserStatus | number): 1 | 2 | 3 {
  if (typeof status === 'number') {
    if (status === 2 || status === 3) return status;
    return 1;
  }
  if (status === 'banned' || status === 'muted') return 2;
  if (status === 'cancelled' || status === 'cancelling') return 3;
  return 1;
}

/**
 * 获取用户分页列表 (直调后台接口 GET /admin-api/user/users/page)
 */
export const getUserList = async (
  params: UserQueryParams,
): Promise<ApiResponse<UserListResult>> => {
  const reqVo: AdminUserPageReqVO = {
    userId: params.userId,
    phoneNumber: params.phoneNumber,
    nickname: params.nickname || params.keyword,
    status:
      params.status !== undefined && params.status !== 'all'
        ? mapFrontendStatusToBackend(params.status)
        : undefined,
    qualification:
      params.qualification !== undefined && params.qualification !== 'all'
        ? Number(params.qualification)
        : undefined,
    certified:
      params.certified !== undefined && params.certified !== 'all'
        ? Boolean(params.certified)
        : undefined,
    createTime: params.dateRange,
    pageNo: params.pageNo || params.page || 1,
    pageSize: params.pageSize || 10,
  };

  const res = await request<PageResult<AdminUserRespVO>>({
    url: '/user/users/page',
    method: 'GET',
    params: reqVo,
  });

  const list: UserItem[] = (res.data?.list || []).map((vo) => ({
    id: String(vo.id),
    userId: vo.userId,
    uid: String(vo.userId),
    username: String(vo.userId),
    nickname: vo.nickname,
    avatar: vo.avatarUrl,
    avatarUrl: vo.avatarUrl,
    phoneNumber: vo.phoneNumber,
    phone: vo.phoneNumber,
    rawStatus: vo.status,
    status: mapBackendStatusToFrontend(vo.status),
    qualification: vo.qualification,
    verifyStatus:
      vo.qualification === 2 ? 'enterprise' : vo.qualification === 1 ? 'personal' : 'unverified',
    certified: vo.certified,
    initStatus: vo.initStatus,
    createTime: formatDateTime(vo.createTime),
    registerTime: formatDateTime(vo.createTime),
    fanCount: vo.fanCount || 0,
    followCount: vo.followCount || 0,
    friendCount: vo.friendCount || 0,
    personalAuths: vo.personalAuths,
  }));

  return {
    code: res.code,
    data: {
      list,
      total: res.data?.total || 0,
      page: reqVo.pageNo || 1,
      pageSize: reqVo.pageSize || 10,
    },
    message: res.message || 'success',
  };
};

/**
 * 获取用户详情 (直调后台接口 GET /admin-api/user/users/get?id=)
 */
export const getUserDetail = async (id: string | number): Promise<ApiResponse<AdminUserRespVO>> => {
  return request<AdminUserRespVO>({
    url: '/user/users/get',
    method: 'GET',
    params: { id },
  });
};

/**
 * 更新用户状态 (直调后台接口 PUT /admin-api/user/users/update-status)
 */
export const updateUserStatus = async (
  id: string | number,
  status: 1 | 2 | 3 | UserStatus,
): Promise<ApiResponse<boolean>> => {
  const backendStatus = mapFrontendStatusToBackend(status);
  return request<boolean>({
    url: '/user/users/update-status',
    method: 'PUT',
    data: { id, status: backendStatus },
  });
};

/**
 * 获取用户统计概览 (直调后台接口 GET /admin-api/user/statistics/summary)
 */
export const getUserStatisticsSummary = async (): Promise<ApiResponse<UserStatisticsRespVO>> => {
  return request<UserStatisticsRespVO>({
    url: '/user/statistics/summary',
    method: 'GET',
  });
};

/**
 * 批量更新用户状态
 */
export const batchUpdateUserStatus = async (
  ids: string[],
  status: UserStatus | number,
): Promise<ApiResponse<{ count: number }>> => {
  const backendStatus = mapFrontendStatusToBackend(status);
  await Promise.all(ids.map((id) => updateUserStatus(id, backendStatus)));
  return {
    code: 200,
    data: { count: ids.length },
    message: `已批量更新 ${ids.length} 个用户的状态`,
  };
};

export interface ExecuteBanParams {
  userIds: string[];
  punishType: 'account' | 'comment' | 'post' | 'warning' | 'credit_deduct';
  duration: string;
  expireTime: string;
  reason: string;
  remark?: string;
  notifyUser?: boolean;
}

/**
 * 执行违规封禁/处罚 (对接后台 update-status 接口)
 */
export const executeUserBan = async (
  params: ExecuteBanParams,
): Promise<ApiResponse<{ updatedCount: number }>> => {
  // 账号封禁时调用 backend update-status (status=2)
  if (params.punishType === 'account') {
    await Promise.all(params.userIds.map((id) => updateUserStatus(id, 2)));
  }
  return {
    code: 200,
    data: { updatedCount: params.userIds.length },
    message: '违规处罚执行成功',
  };
};

/**
 * 获取用于全量导出的用户数据
 */
export const getAllFilteredUsers = async (
  params: Omit<UserQueryParams, 'page' | 'pageSize'>,
): Promise<UserItem[]> => {
  const res = await getUserList({ ...params, page: 1, pageSize: 99999 });
  return res.data.list;
};

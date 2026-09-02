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

// 测试环境模拟数据集 (完全对应后端 AdminUserRespVO 结构)
const mockUsers: UserItem[] = [
  {
    id: '1',
    userId: 100001,
    uid: '100001',
    username: 'geek_vanguard',
    nickname: '极客先锋·Tech',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    avatarUrl:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    phoneNumber: '13800138001',
    phone: '13800138001',
    status: 'normal',
    rawStatus: 1,
    qualification: 2,
    verifyStatus: 'enterprise',
    verifyInfo: '数码科技认证企业机构',
    certified: true,
    initStatus: 1,
    createTime: '2024-03-15T14:20:00',
    registerTime: '2024-03-15 14:20:00',
    fanCount: 245000,
    followCount: 128,
    friendCount: 64,
    personalAuths: [
      {
        realName: '李*峰',
        idCard: '110101********3412',
        authTime: '2024-03-15 14:30:00',
      },
    ],
    gender: 'male',
    email: 'geek_vanguard@tech.com',
    bio: '专注硬核科技评测与前沿数码产品体验，每周五晚八点直播！',
  },
  {
    id: '2',
    userId: 100002,
    uid: '100002',
    username: 'sweet_foodie',
    nickname: '小甜心美食志',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    avatarUrl:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    phoneNumber: '13911223344',
    phone: '13911223344',
    status: 'normal',
    rawStatus: 1,
    qualification: 1,
    verifyStatus: 'personal',
    verifyInfo: '美食领域知名认证博主',
    certified: true,
    initStatus: 1,
    createTime: '2023-11-08T09:12:30',
    registerTime: '2023-11-08 09:12:30',
    fanCount: 680000,
    followCount: 310,
    friendCount: 156,
    personalAuths: [
      {
        realName: '陈*甜',
        idCard: '310104********7821',
        authTime: '2023-11-08 10:00:00',
      },
    ],
    gender: 'female',
    email: 'sweet_dessert@foodie.cn',
    bio: '探寻城市巷尾的绝美风味，带你吃遍大江南北 🍰🍲',
  },
  {
    id: '3',
    userId: 100003,
    uid: '100003',
    username: 'future_ai_lab',
    nickname: '智元未来科技官方',
    avatar:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    avatarUrl:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    phoneNumber: '13888886666',
    phone: '13888886666',
    status: 'normal',
    rawStatus: 1,
    qualification: 2,
    verifyStatus: 'enterprise',
    verifyInfo: '北京智元人工智能科技有限公司官方',
    certified: true,
    initStatus: 1,
    createTime: '2024-01-10T16:40:11',
    registerTime: '2024-01-10 16:40:11',
    fanCount: 152000,
    followCount: 45,
    friendCount: 20,
    personalAuths: [
      {
        realName: '赵*明 (法人)',
        idCard: '110108********5619',
        authTime: '2024-01-10 17:00:00',
      },
    ],
    gender: 'unknown',
    email: 'contact@futureai.io',
    bio: '用智能改变未来，构建下一代 AI 生产力工具矩阵。',
  },
  {
    id: '4',
    userId: 100004,
    uid: '100004',
    username: 'zhang_san_travel',
    nickname: '张三走天涯',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    avatarUrl:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    phoneNumber: '13666778899',
    phone: '13666778899',
    status: 'normal',
    rawStatus: 1,
    qualification: 1,
    verifyStatus: 'personal',
    verifyInfo: '已通过个人实名认证',
    certified: true,
    initStatus: 1,
    createTime: '2025-05-18T11:05:00',
    registerTime: '2025-05-18 11:05:00',
    fanCount: 18600,
    followCount: 98,
    friendCount: 45,
    personalAuths: [
      {
        realName: '张*三',
        idCard: '440106********2311',
        authTime: '2025-05-18 11:30:00',
      },
    ],
    gender: 'male',
    email: 'zhangsan_travel@163.com',
    bio: '一台相机，一个背包，行走在路上。',
  },
  {
    id: '5',
    userId: 100005,
    uid: '100005',
    username: 'spammer_bot_99',
    nickname: '每日福利领取点我',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    avatarUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    phoneNumber: '17099887766',
    phone: '17099887766',
    status: 'banned',
    rawStatus: 2,
    verifyStatus: 'unverified',
    certified: false,
    initStatus: 1,
    accountBanExpireTime: 'permanent',
    banReason: '发布黑产引流广告及低俗兼职诈骗外链',
    createTime: '2026-08-19T18:22:00',
    registerTime: '2026-08-19 18:22:00',
    fanCount: 120,
    followCount: 890,
    friendCount: 5,
    gender: 'female',
    bio: '该账号因发布垃圾广告及违规营销信息已被系统永久封禁。',
  },
  {
    id: '6',
    userId: 100006,
    uid: '100006',
    username: 'troll_master',
    nickname: '夜幕狂刀',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    avatarUrl:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    phoneNumber: '18822334455',
    phone: '18822334455',
    status: 'banned',
    rawStatus: 2,
    verifyStatus: 'unverified',
    certified: false,
    initStatus: 1,
    accountBanExpireTime: '2026-09-09 19:40:00',
    banReason: '在多个热门作品评论区频繁发布恶意辱骂与人身攻击言论',
    createTime: '2025-10-01T12:00:00',
    registerTime: '2025-10-01 12:00:00',
    fanCount: 65,
    followCount: 420,
    friendCount: 12,
    gender: 'male',
    bio: '账号违规已被封禁处置。',
  },
  {
    id: '7',
    userId: 100007,
    uid: '100007',
    username: 'music_echo',
    nickname: '云端吉他社',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    avatarUrl:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    phoneNumber: '13799887766',
    phone: '13799887766',
    status: 'normal',
    rawStatus: 1,
    qualification: 1,
    verifyStatus: 'personal',
    verifyInfo: '原创音乐人 / 流行吉他弹唱',
    certified: true,
    initStatus: 1,
    createTime: '2024-07-22T15:30:00',
    registerTime: '2024-07-22 15:30:00',
    fanCount: 198000,
    followCount: 156,
    friendCount: 88,
    personalAuths: [
      {
        realName: '林*音',
        idCard: '330106********4528',
        authTime: '2024-07-22 16:00:00',
      },
    ],
    gender: 'female',
    email: 'echo_guitar@music.org',
    bio: '愿音乐能治愈你的每一个不眠之夜 🎵🎸',
  },
  {
    id: '8',
    userId: 100008,
    uid: '100008',
    username: 'retired_user_88',
    nickname: '岁月静好_已注销',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    avatarUrl:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    phoneNumber: '13500223311',
    phone: '13500223311',
    status: 'cancelled',
    rawStatus: 3,
    verifyStatus: 'unverified',
    certified: false,
    initStatus: 0,
    createTime: '2023-01-15T10:00:00',
    registerTime: '2023-01-15 10:00:00',
    fanCount: 0,
    followCount: 0,
    friendCount: 0,
    gender: 'unknown',
    bio: '该账号已完成注销流程。',
  },
];

let currentDataset: UserItem[] = [...mockUsers];

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
 * 获取用户分页列表 (测试分支：优先真实请求，离线/测试自适应 Mock 兜底)
 */
export const getUserList = async (
  params: UserQueryParams,
): Promise<ApiResponse<UserListResult>> => {
  try {
    const reqVo: AdminUserPageReqVO = {
      userId: params.userId !== undefined && params.userId !== '' ? params.userId : undefined,
      phoneNumber: params.phoneNumber ? String(params.phoneNumber).trim() : undefined,
      nickname: params.nickname
        ? String(params.nickname).trim()
        : params.keyword
          ? String(params.keyword).trim()
          : undefined,
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
      createTime: params.dateRange && params.dateRange.length === 2 ? params.dateRange : undefined,
      pageNo: params.pageNo || params.page || 1,
      pageSize: params.pageSize || 10,
    };

    const res = await request<PageResult<AdminUserRespVO>>({
      url: '/user/users/page',
      method: 'GET',
      params: reqVo,
    });

    if ((res.code === 200 || res.code === 0) && res.data) {
      const list: UserItem[] = (res.data.list || []).map((vo) => ({
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
          vo.qualification === 2
            ? 'enterprise'
            : vo.qualification === 1
              ? 'personal'
              : 'unverified',
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
        code: 200,
        data: {
          list,
          total: res.data.total,
          page: reqVo.pageNo || 1,
          pageSize: reqVo.pageSize || 10,
        },
        message: 'success',
      };
    }
  } catch {
    // 离线/测试环境使用本地 Mock 容灾
  }

  // 离线本地过滤
  await new Promise((resolve) => setTimeout(resolve, 150));

  let filtered = [...currentDataset];

  if (params.userId) {
    const uStr = String(params.userId).toLowerCase();
    filtered = filtered.filter(
      (u) => String(u.userId).includes(uStr) || String(u.uid).includes(uStr),
    );
  }

  if (params.phoneNumber) {
    const pStr = params.phoneNumber.trim();
    filtered = filtered.filter((u) => u.phoneNumber?.includes(pStr) || u.phone?.includes(pStr));
  }

  if (params.nickname) {
    const nStr = params.nickname.toLowerCase();
    filtered = filtered.filter((u) => u.nickname.toLowerCase().includes(nStr));
  }

  if (params.keyword) {
    const k = params.keyword.toLowerCase();
    filtered = filtered.filter(
      (u) =>
        u.nickname.toLowerCase().includes(k) ||
        String(u.userId).includes(k) ||
        u.phoneNumber?.includes(k),
    );
  }

  if (params.status && params.status !== 'all') {
    const targetStatus =
      typeof params.status === 'number' ? mapBackendStatusToFrontend(params.status) : params.status;
    filtered = filtered.filter((u) => u.status === targetStatus);
  }

  if (params.qualification && params.qualification !== 'all') {
    const qNum = Number(params.qualification);
    filtered = filtered.filter((u) => u.qualification === qNum);
  }

  if (params.certified !== undefined && params.certified !== 'all') {
    const cBool = Boolean(params.certified);
    filtered = filtered.filter((u) => u.certified === cBool);
  }

  const page = params.pageNo || params.page || 1;
  const pageSize = params.pageSize || 10;
  const start = (page - 1) * pageSize;
  const list = filtered.slice(start, start + pageSize);

  return {
    code: 200,
    data: {
      list,
      total: filtered.length,
      page,
      pageSize,
    },
    message: 'success',
  };
};

/**
 * 获取用户详情 (测试分支：带本地 Mock 容灾)
 */
export const getUserDetail = async (id: string | number): Promise<ApiResponse<AdminUserRespVO>> => {
  try {
    const res = await request<AdminUserRespVO>({
      url: '/user/users/get',
      method: 'GET',
      params: { id },
    });
    if ((res.code === 200 || res.code === 0) && res.data) {
      return res;
    }
  } catch {
    // ignore
  }

  const user = currentDataset.find((u) => u.id === String(id));
  if (!user) {
    return { code: 404, data: {} as any, message: '用户不存在' };
  }

  return {
    code: 200,
    data: {
      id: user.id,
      userId: user.userId,
      phoneNumber: user.phoneNumber || user.phone || '',
      status: user.rawStatus || mapFrontendStatusToBackend(user.status),
      nickname: user.nickname,
      avatarUrl: user.avatarUrl || user.avatar,
      qualification: user.qualification,
      certified: user.certified || false,
      initStatus: user.initStatus || 1,
      createTime: formatDateTime(user.createTime),
      fanCount: user.fanCount,
      followCount: user.followCount,
      friendCount: user.friendCount,
      personalAuths: user.personalAuths,
    },
    message: 'success',
  };
};

/**
 * 更新用户状态 (测试分支：带本地 Mock 容灾)
 */
export const updateUserStatus = async (
  id: string | number,
  status: 1 | 2 | 3 | UserStatus,
): Promise<ApiResponse<boolean>> => {
  const backendStatus = mapFrontendStatusToBackend(status);

  try {
    const res = await request<boolean>({
      url: '/user/users/update-status',
      method: 'PUT',
      data: { id, status: backendStatus },
    });
    if (res.code === 200 || res.code === 0) {
      return res;
    }
  } catch {
    // ignore
  }

  const targetIndex = currentDataset.findIndex((u) => u.id === String(id));
  if (targetIndex !== -1) {
    currentDataset[targetIndex] = {
      ...currentDataset[targetIndex],
      rawStatus: backendStatus,
      status: mapBackendStatusToFrontend(backendStatus),
    };
  }

  return {
    code: 200,
    data: true,
    message: '用户状态更新成功',
  };
};

/**
 * 获取用户统计概览 (测试分支：带本地 Mock 容灾)
 */
export const getUserStatisticsSummary = async (): Promise<ApiResponse<UserStatisticsRespVO>> => {
  try {
    const res = await request<UserStatisticsRespVO>({
      url: '/user/statistics/summary',
      method: 'GET',
    });
    if ((res.code === 200 || res.code === 0) && res.data) {
      return res;
    }
  } catch {
    // ignore
  }

  return {
    code: 200,
    data: {
      totalCount: 158200,
      normalCount: 154800,
      disabledCount: 2400,
      cancelledCount: 1000,
      todayNewCount: 380,
      weekNewCount: 2450,
      monthNewCount: 10200,
    },
    message: 'success',
  };
};

/**
 * 批量更新用户状态
 */
export const batchUpdateUserStatus = async (
  ids: string[],
  status: UserStatus | number,
): Promise<ApiResponse<{ count: number }>> => {
  const backendStatus = mapFrontendStatusToBackend(status);
  const frontendStatus = mapBackendStatusToFrontend(backendStatus);

  currentDataset = currentDataset.map((u) => {
    if (ids.includes(u.id)) {
      return {
        ...u,
        rawStatus: backendStatus,
        status: frontendStatus,
      };
    }
    return u;
  });

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
 * 执行违规封禁/处罚
 */
export const executeUserBan = async (
  params: ExecuteBanParams,
): Promise<ApiResponse<{ updatedCount: number }>> => {
  currentDataset = currentDataset.map((u) => {
    if (params.userIds.includes(u.id)) {
      return {
        ...u,
        rawStatus: 2,
        status: 'banned' as UserStatus,
        accountBanExpireTime: params.expireTime,
        banReason: params.reason,
      };
    }
    return u;
  });

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

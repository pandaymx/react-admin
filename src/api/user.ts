import type { ApiResponse, UserItem, UserListResult, UserQueryParams, UserStatus } from '@/types';

// 初始模拟测试数据（模拟抖音/社媒等平台真实多维度用户画像）
const mockUsers: UserItem[] = [
  {
    id: '1',
    uid: 'dy_98263102',
    username: 'geek_vanguard',
    nickname: '极客先锋·Tech',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    gender: 'male',
    verifyStatus: 'creator',
    verifyInfo: '数码科技领域优质创作者',
    status: 'normal',
    commentCount: 15420,
    commentStatus: 'allowed',
    postCount: 382,
    likeCount: 980400,
    followerCount: 245000,
    activityCount: 45,
    lastActiveTime: '2026-09-02 10:45:12',
    activeStatus: 'online',
    registerTime: '2024-03-15 14:20:00',
    email: 'geek_vanguard@tech.com',
    phone: '13800138001',
    bio: '专注硬核科技评测与前沿数码产品体验，每周五晚八点直播！',
  },
  {
    id: '2',
    uid: 'dy_87219904',
    username: 'sweet_foodie',
    nickname: '小甜心美食志',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    gender: 'female',
    verifyStatus: 'creator',
    verifyInfo: '美食生活领域知名博主',
    status: 'normal',
    commentCount: 28900,
    commentStatus: 'allowed',
    postCount: 615,
    likeCount: 2310000,
    followerCount: 680000,
    activityCount: 88,
    lastActiveTime: '2026-09-02 09:30:00',
    activeStatus: 'recent',
    registerTime: '2023-11-08 09:12:30',
    email: 'sweet_dessert@foodie.cn',
    phone: '13911223344',
    bio: '探寻城市巷尾的绝美风味，带你吃遍大江南北 🍰🍲',
  },
  {
    id: '3',
    uid: 'dy_66881122',
    username: 'future_ai_lab',
    nickname: '智元未来科技官方',
    avatar:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    gender: 'unknown',
    verifyStatus: 'enterprise',
    verifyInfo: '北京智元人工智能科技有限公司官方账号',
    status: 'normal',
    commentCount: 4320,
    commentStatus: 'allowed',
    postCount: 128,
    likeCount: 450000,
    followerCount: 152000,
    activityCount: 32,
    lastActiveTime: '2026-09-02 08:15:20',
    activeStatus: 'recent',
    registerTime: '2024-01-10 16:40:11',
    email: 'contact@futureai.io',
    phone: '010-88886666',
    bio: '用智能改变未来，构建下一代 AI 生产力工具矩阵。',
  },
  {
    id: '4',
    uid: 'dy_55410982',
    username: 'zhang_san_travel',
    nickname: '张三走天涯',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    gender: 'male',
    verifyStatus: 'personal',
    verifyInfo: '已通过个人实名身份认证',
    status: 'normal',
    commentCount: 1890,
    commentStatus: 'allowed',
    postCount: 94,
    likeCount: 52000,
    followerCount: 18600,
    activityCount: 12,
    lastActiveTime: '2026-09-01 22:10:05',
    activeStatus: 'offline',
    registerTime: '2025-05-18 11:05:00',
    email: 'zhangsan_travel@163.com',
    phone: '13666778899',
    bio: '一台相机，一个背包，行走在路上。',
  },
  {
    id: '5',
    uid: 'dy_33219011',
    username: 'spammer_bot_99',
    nickname: '每日福利领取点我',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    gender: 'female',
    verifyStatus: 'unverified',
    status: 'banned',
    commentCount: 340,
    commentStatus: 'forbidden',
    commentBanExpireTime: 'permanent',
    postCount: 12,
    postStatus: 'forbidden',
    postBanExpireTime: 'permanent',
    likeCount: 45,
    followerCount: 120,
    activityCount: 2,
    lastActiveTime: '2026-08-20 14:00:00',
    activeStatus: 'offline',
    registerTime: '2026-08-19 18:22:00',
    bio: '该账号因发布垃圾广告及违规营销信息已被系统永久封禁。',
  },
  {
    id: '6',
    uid: 'dy_12093847',
    username: 'troll_master',
    nickname: '夜幕狂刀',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    gender: 'male',
    verifyStatus: 'unverified',
    status: 'muted',
    commentCount: 2450,
    commentStatus: 'forbidden',
    commentBanExpireTime: '2026-09-08 19:40:00',
    postCount: 4,
    postStatus: 'forbidden',
    postBanExpireTime: '2026-09-05 12:00:00',
    likeCount: 120,
    followerCount: 65,
    activityCount: 5,
    lastActiveTime: '2026-09-01 19:40:12',
    activeStatus: 'offline',
    registerTime: '2025-10-01 12:00:00',
    bio: '账号违规已被禁言7天，禁言期间无法发布评论及作品。',
  },
  {
    id: '7',
    uid: 'dy_77341209',
    username: 'music_echo',
    nickname: '云端吉他社',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    gender: 'female',
    verifyStatus: 'creator',
    verifyInfo: '原创音乐人 / 流行吉他弹唱达人',
    status: 'normal',
    commentCount: 9600,
    commentStatus: 'allowed',
    postCount: 210,
    likeCount: 780000,
    followerCount: 198000,
    activityCount: 28,
    lastActiveTime: '2026-09-02 10:12:44',
    activeStatus: 'online',
    registerTime: '2024-07-22 15:30:00',
    email: 'echo_guitar@music.org',
    phone: '13799887766',
    bio: '愿音乐能治愈你的每一个不眠之夜 🎵🎸',
  },
  {
    id: '8',
    uid: 'dy_99018274',
    username: 'cyber_security_pro',
    nickname: '网络安全哨兵',
    avatar:
      'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    gender: 'male',
    verifyStatus: 'personal',
    verifyInfo: '国家注册信息安全专业人员 (CISP)',
    status: 'normal',
    commentCount: 5120,
    commentStatus: 'allowed',
    postCount: 165,
    likeCount: 340000,
    followerCount: 89000,
    activityCount: 39,
    lastActiveTime: '2026-09-02 07:50:00',
    activeStatus: 'recent',
    registerTime: '2024-05-11 20:10:00',
    email: 'sec_sentinel@cisp.net',
    phone: '13500223311',
    bio: '科普网络反诈与隐私防护，提高全网安全防护意识。',
  },
  {
    id: '9',
    uid: 'dy_44120938',
    username: 'old_account_retired',
    nickname: '已注销_8892',
    avatar:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    gender: 'unknown',
    verifyStatus: 'unverified',
    status: 'cancelled',
    commentCount: 12,
    commentStatus: 'forbidden',
    postCount: 0,
    likeCount: 0,
    followerCount: 0,
    activityCount: 0,
    lastActiveTime: '2025-12-31 00:00:00',
    activeStatus: 'offline',
    registerTime: '2023-01-01 10:00:00',
    bio: '用户已自主申请注销账号。',
  },
  {
    id: '10',
    uid: 'dy_66239108',
    username: 'campus_dance_crew',
    nickname: '高校街舞社联',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    gender: 'female',
    verifyStatus: 'enterprise',
    verifyInfo: '青年街舞文化交流促进中心',
    status: 'normal',
    commentCount: 18200,
    commentStatus: 'allowed',
    postCount: 420,
    likeCount: 1540000,
    followerCount: 390000,
    activityCount: 65,
    lastActiveTime: '2026-09-02 10:50:33',
    activeStatus: 'online',
    registerTime: '2024-09-01 10:30:00',
    email: 'dance_crew@campus.edu.cn',
    phone: '13812345678',
    bio: '燃烧青春，舞动热血！各大高校赛事与齐舞展示平台。',
  },
  {
    id: '11',
    uid: 'dy_22394018',
    username: 'newbie_coder',
    nickname: '代码小白日记',
    avatar:
      'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    gender: 'male',
    verifyStatus: 'pending',
    verifyInfo: '个人实名认证身份材料审核中',
    status: 'normal',
    commentCount: 420,
    commentStatus: 'allowed',
    postCount: 18,
    likeCount: 3200,
    followerCount: 840,
    activityCount: 8,
    lastActiveTime: '2026-09-02 01:20:11',
    activeStatus: 'recent',
    registerTime: '2026-06-10 14:15:00',
    bio: '记录从零转码前端开发的每日打卡与踩坑日记。',
  },
  {
    id: '12',
    uid: 'dy_99182345',
    username: 'nature_wildlife',
    nickname: '野性自然影像',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    gender: 'male',
    verifyStatus: 'creator',
    verifyInfo: '国家地理签约摄影师 / 野生动物纪录片创作者',
    status: 'normal',
    commentCount: 36500,
    commentStatus: 'allowed',
    postCount: 512,
    likeCount: 4890000,
    followerCount: 1250000,
    activityCount: 74,
    lastActiveTime: '2026-09-02 06:40:00',
    activeStatus: 'recent',
    registerTime: '2023-04-20 08:30:00',
    email: 'wildlife@photo.com',
    phone: '13988776655',
    bio: '用镜头守护大地生灵，记录大自然的壮美与真实 🦁🦅',
  },
  {
    id: '13',
    uid: 'dy_77889900',
    username: 'leaving_soon_user',
    nickname: '风清云淡_待注销',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    gender: 'male',
    verifyStatus: 'unverified',
    status: 'cancelling',
    commentCount: 88,
    commentStatus: 'forbidden',
    postCount: 5,
    likeCount: 620,
    followerCount: 230,
    activityCount: 1,
    lastActiveTime: '2026-09-01 15:30:00',
    activeStatus: 'offline',
    registerTime: '2024-03-15 10:00:00',
    email: 'leaving_user@qq.com',
    phone: '13866554433',
    bio: '用户已于 2026-09-01 申请账号注销，当前处于 15 天注销冷静期中。',
  },
];

let currentDataset = [...mockUsers];

/**
 * 获取用户列表（支持多条件组合查询与分页）
 * 模拟异步 API 请求
 */
export const getUserList = async (
  params: UserQueryParams = {},
): Promise<ApiResponse<UserListResult>> => {
  // 模拟网络延迟 250ms
  await new Promise((resolve) => setTimeout(resolve, 250));

  let filtered = [...currentDataset];

  // 1. 关键词查询 (昵称/用户名)
  if (params.keyword?.trim()) {
    const kw = params.keyword.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.nickname.toLowerCase().includes(kw) || item.username.toLowerCase().includes(kw),
    );
  }

  // 2. UID 精准/模糊查询
  if (params.uid?.trim()) {
    const uidQuery = params.uid.trim().toLowerCase();
    filtered = filtered.filter((item) => item.uid.toLowerCase().includes(uidQuery));
  }

  // 3. 认证状态过滤
  if (params.verifyStatus && params.verifyStatus !== 'all') {
    filtered = filtered.filter((item) => item.verifyStatus === params.verifyStatus);
  }

  // 4. 账号状态过滤
  if (params.status && params.status !== 'all') {
    filtered = filtered.filter((item) => item.status === params.status);
  }

  // 5. 活跃在线状态过滤
  if (params.activeStatus && params.activeStatus !== 'all') {
    filtered = filtered.filter((item) => item.activeStatus === params.activeStatus);
  }

  // 6. 注册时间范围过滤
  if (params.dateRange && params.dateRange.length === 2) {
    const [start, end] = params.dateRange;
    if (start && end) {
      filtered = filtered.filter((item) => {
        const itemDate = item.registerTime.slice(0, 10);
        return itemDate >= start && itemDate <= end;
      });
    }
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const total = filtered.length;
  const startIndex = (page - 1) * pageSize;
  const list = filtered.slice(startIndex, startIndex + pageSize);

  return {
    code: 200,
    data: {
      list,
      total,
      page,
      pageSize,
    },
    message: 'success',
  };
};

/**
 * 更新用户账号状态（正常/封禁/禁言/注销）
 */
export const updateUserStatus = async (
  id: string,
  status: UserStatus,
): Promise<ApiResponse<{ id: string; status: UserStatus }>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const targetIndex = currentDataset.findIndex((u) => u.id === id);
  if (targetIndex === -1) {
    return {
      code: 404,
      data: { id, status },
      message: '用户不存在',
    };
  }

  currentDataset[targetIndex] = {
    ...currentDataset[targetIndex],
    status,
    commentStatus:
      status === 'banned' || status === 'muted' || status === 'cancelled' ? 'forbidden' : 'allowed',
  };

  return {
    code: 200,
    data: { id, status },
    message: '用户状态更新成功',
  };
};

/**
 * 批量更新用户状态
 */
export const batchUpdateUserStatus = async (
  ids: string[],
  status: UserStatus,
): Promise<ApiResponse<{ count: number }>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  currentDataset = currentDataset.map((u) => {
    if (ids.includes(u.id)) {
      return {
        ...u,
        status,
        commentStatus:
          status === 'banned' || status === 'muted' || status === 'cancelled'
            ? 'forbidden'
            : 'allowed',
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
  punishType: 'account' | 'comment' | 'post';
  duration: string;
  expireTime: string; // 'permanent' 或 'YYYY-MM-DD HH:mm:ss'
  reason: string;
  remark?: string;
  notifyUser?: boolean;
}

/**
 * 执行按时间周期的违规封禁/禁言/禁发处置
 */
export const executeUserBan = async (
  params: ExecuteBanParams,
): Promise<ApiResponse<{ updatedCount: number }>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  currentDataset = currentDataset.map((u) => {
    if (params.userIds.includes(u.id)) {
      if (params.punishType === 'account') {
        return {
          ...u,
          status: 'banned' as UserStatus,
          accountBanExpireTime: params.expireTime,
          banReason: params.reason,
          commentStatus: 'forbidden' as const,
          commentBanExpireTime: params.expireTime,
          postStatus: 'forbidden' as const,
          postBanExpireTime: params.expireTime,
        };
      }
      if (params.punishType === 'comment') {
        return {
          ...u,
          commentStatus: 'forbidden' as const,
          commentBanExpireTime: params.expireTime,
          banReason: params.reason,
        };
      }
      if (params.punishType === 'post') {
        return {
          ...u,
          postStatus: 'forbidden' as const,
          postBanExpireTime: params.expireTime,
          banReason: params.reason,
        };
      }
    }
    return u;
  });

  return {
    code: 200,
    data: { updatedCount: params.userIds.length },
    message: '封禁处置执行成功',
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

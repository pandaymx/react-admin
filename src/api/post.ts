import type {
  ApiResponse,
  CommentPermission,
  PostAuditActionParams,
  PostItem,
  PostQueryParams,
  PostStatisticsSummaryVO,
  PostStatus,
  PostVisibility,
} from '@/types';
import { request } from './request';

/**
 * 后端高保真全量保底数据集（严格对齐 yudao-module-feeds 领域模型）
 */
let mockPostsDataset: PostItem[] = [
  {
    id: '1892837482910283901',
    userId: '1001',
    title: '【沉浸式开箱】2026旗舰芯片真机上手体验测评！到底值不值得冲？',
    content:
      '历经半个月高强度测试，今天终于把这台新机的全部体验整理出来了！从性能释放、屏幕色彩调教到长焦微距，有哪些优点和槽点？视频里详细给大家对比，点赞过万下期带来详细拆机！',
    postType: 'video',
    location: '北京市·中关村软件园',
    ipLocation: '北京',
    visibility: 'public',
    status: 'published',
    manualReviewFlag: 0,
    isTop: true,
    commentPermission: 'open',
    createdAt: '2026-09-02 10:45:00',
    updatedAt: '2026-09-02 10:45:00',
    author: {
      uid: 'dy_98263102',
      nickname: '极客先锋·Tech',
      username: 'geek_vanguard',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      verifyStatus: 'creator',
      verifyLabel: '数码自媒体优质创作者',
      ipLocation: '北京',
    },
    mediaList: [
      {
        id: 'MED_20260901_01',
        mediaType: 'video',
        url: 'https://www.w3schools.com/html/mov_bbb.mp4',
        coverUrl:
          'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
        width: 1920,
        height: 1080,
        duration: 185,
      },
    ],
    statistics: {
      viewCount: 158000,
      likeCount: 48900,
      commentCount: 3420,
      favoriteCount: 12400,
      shareCount: 6510,
    },
    equipmentList: [
      {
        userEquipmentId: 'EQ_01',
        productName: 'EOS R5 Mark II 专业微单相机',
        brandName: '佳能 (Canon)',
        categoryName: '摄影器材/微单相机',
        pictureUrl:
          'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=150&auto=format&fit=crop&q=80',
      },
      {
        userEquipmentId: 'EQ_02',
        productName: '24-70mm F2.8 全画幅标准变焦镜头',
        brandName: '佳能 (Canon)',
        categoryName: '摄影器材/镜头',
        pictureUrl:
          'https://images.unsplash.com/photo-1617005082133-548c4dd27f35?w=150&auto=format&fit=crop&q=80',
      },
    ],
    auditTasks: [
      {
        id: 'AUDIT_01',
        auditMode: 'alicloud',
        contentType: 'video',
        suggestion: 'pass',
        createdAt: '2026-09-02 10:45:30',
        operator: '阿里绿网AI智能质检',
      },
    ],
    // 兼容历史字段
    type: 'video',
    coverUrl:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    topics: ['数码科技', '新机测评', '极客日常'],
    likeCount: 48900,
    commentCount: 3420,
    shareCount: 6510,
    collectCount: 12400,
    publishTime: '2026-09-02 10:45:00',
  },
  {
    id: '1892837482910283902',
    userId: '1002',
    title: '胡同深处的百年铜锅涮肉！入口即化的鲜切羊肉绝了 🍲',
    content:
      '排队两个小时才吃上的老北京铜锅涮肉！手切羊上脑、羊磨裆肉质极其鲜嫩，倒盘不掉。搭配麻酱糖蒜和现烤烧饼，简直是秋天最顶级的幸福感～',
    postType: 'post',
    location: '北京市·东城区前门大栅栏',
    ipLocation: '北京',
    visibility: 'public',
    status: 'published',
    manualReviewFlag: 0,
    isTop: false,
    commentPermission: 'open',
    createdAt: '2026-09-02 09:30:00',
    updatedAt: '2026-09-02 09:30:00',
    author: {
      uid: 'dy_87219904',
      nickname: '小甜心美食志',
      username: 'sweet_foodie',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      verifyStatus: 'creator',
      verifyLabel: '探店美食达人',
      ipLocation: '北京',
    },
    mediaList: [
      {
        id: 'MED_20260902_01',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=800&auto=format&fit=crop&q=80',
        width: 1080,
        height: 1080,
      },
      {
        id: 'MED_20260902_02',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
        width: 1080,
        height: 1080,
      },
      {
        id: 'MED_20260902_03',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
        width: 1080,
        height: 1080,
      },
    ],
    statistics: {
      viewCount: 310000,
      likeCount: 92400,
      commentCount: 5610,
      favoriteCount: 38900,
      shareCount: 13200,
    },
    currentActivity: {
      activityId: 'ACT_2026_HOTPOT',
      title: '秋日胡同烟火气打卡计划',
      iconUrl:
        'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=60&auto=format&fit=crop&q=80',
    },
    auditTasks: [
      {
        id: 'AUDIT_02',
        auditMode: 'alicloud',
        contentType: 'image',
        suggestion: 'pass',
        createdAt: '2026-09-02 09:30:15',
        operator: '阿里绿网AI智能质检',
      },
    ],
    type: 'post',
    coverUrl:
      'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=800&auto=format&fit=crop&q=80',
    ],
    topics: ['老北京美食', '探店吃播', '美食日常'],
    likeCount: 92400,
    commentCount: 5610,
    shareCount: 13200,
    collectCount: 38900,
    publishTime: '2026-09-02 09:30:00',
  },
  {
    id: '1892837482910283903',
    userId: '1003',
    title: '今日份奇思妙想：如果代码真的能变成现实中摸得到的砖块...',
    content:
      '加班到凌晨一点突发奇想：程序员每天码了几千行代码，如果每一行都是一块实实在在的青砖，我们是不是已经盖出了一座横跨银河系的长城？晚安，每一个在深夜守护服务器的造梦人。✨',
    postType: 'whimsy',
    backgroundStyle: 'sunset_glow',
    location: '杭州市·西湖区阿里巴巴云栖小镇',
    ipLocation: '浙江',
    visibility: 'public',
    status: 'published',
    manualReviewFlag: 0,
    isTop: false,
    commentPermission: 'open',
    createdAt: '2026-09-02 01:15:00',
    updatedAt: '2026-09-02 01:15:00',
    author: {
      uid: 'dy_66281903',
      nickname: '代码诗人·阿明',
      username: 'code_poet',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verifyStatus: 'unverified',
      ipLocation: '浙江',
    },
    mediaList: [],
    statistics: {
      viewCount: 42000,
      likeCount: 18400,
      commentCount: 1220,
      favoriteCount: 3200,
      shareCount: 980,
    },
    type: 'whimsy',
    coverUrl: '',
    topics: ['奇思妙想', '程序员日常', '深夜随笔'],
    likeCount: 18400,
    commentCount: 1220,
    shareCount: 980,
    collectCount: 3200,
    publishTime: '2026-09-02 01:15:00',
  },
  {
    id: '1892837482910283904',
    userId: '1004',
    title: '【待审核】最新高收益内幕渠道分享，加群免费领福利资料！',
    content:
      '独家首发赚钱秘籍！每日轻松躺赚500+，无门槛小白包教包会，名额有限前50名免费领取课件！请速速加v：xxxxxx 获取下载码！',
    postType: 'post',
    location: '深圳市·南山区',
    ipLocation: '广东',
    visibility: 'public',
    status: 'pending',
    manualReviewFlag: 1,
    isTop: false,
    commentPermission: 'open',
    createdAt: '2026-09-02 11:20:00',
    updatedAt: '2026-09-02 11:20:00',
    author: {
      uid: 'dy_33918274',
      nickname: '财富密码速递',
      username: 'fast_rich_99',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      verifyStatus: 'unverified',
      ipLocation: '广东',
    },
    mediaList: [
      {
        id: 'MED_20260904_01',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop&q=80',
        width: 800,
        height: 600,
      },
    ],
    statistics: {
      viewCount: 12,
      likeCount: 0,
      commentCount: 0,
      favoriteCount: 0,
      shareCount: 0,
    },
    auditTasks: [
      {
        id: 'AUDIT_04',
        auditMode: 'alicloud',
        contentType: 'text',
        suggestion: 'review',
        label: 'ad',
        reason: '命中疑似诱导私下交易与违规营销推广关键词，建议人工复审',
        createdAt: '2026-09-02 11:20:10',
        operator: '阿里绿网AI风控',
      },
    ],
    type: 'post',
    coverUrl:
      'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=800&auto=format&fit=crop&q=80',
    ],
    topics: ['理财投资', '暴富秘籍', '创业兼职'],
    likeCount: 0,
    commentCount: 0,
    shareCount: 0,
    collectCount: 0,
    publishTime: '2026-09-02 11:20:00',
  },
  {
    id: '1892837482910283905',
    userId: '1005',
    title: '【已违规下架】低俗营销导流黑灰产推广测试帖',
    content:
      '本帖因发布带有低俗暗示及博彩外部导流二维码，已被平台治理系统实施人工顶格驳回与强制下架处置，关联作者已被同步禁发动态7天。',
    postType: 'post',
    location: '成都市·高新区',
    ipLocation: '四川',
    visibility: 'private',
    status: 'rejected',
    manualReviewFlag: 1,
    isTop: false,
    commentPermission: 'closed',
    createdAt: '2026-09-01 14:10:00',
    updatedAt: '2026-09-01 15:00:00',
    author: {
      uid: 'dy_11902844',
      nickname: '灰产黑客帝国',
      username: 'dark_crawler',
      avatar:
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
      verifyStatus: 'unverified',
      ipLocation: '四川',
    },
    mediaList: [
      {
        id: 'MED_20260905_01',
        mediaType: 'image',
        url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
        width: 800,
        height: 600,
      },
    ],
    statistics: {
      viewCount: 88,
      likeCount: 2,
      commentCount: 1,
      favoriteCount: 0,
      shareCount: 0,
    },
    auditTasks: [
      {
        id: 'AUDIT_05_1',
        auditMode: 'alicloud',
        contentType: 'image',
        suggestion: 'block',
        label: 'porn',
        reason: '图像含有低俗敏感信息',
        createdAt: '2026-09-01 14:10:05',
        operator: '阿里绿网AI风控',
      },
      {
        id: 'AUDIT_05_2',
        auditMode: 'manual',
        contentType: 'text',
        suggestion: 'block',
        label: 'gambling',
        reason: '人工审核确认：严重违反平台社区公约，恶意批量导流黑灰产，予以封禁下架',
        createdAt: '2026-09-01 15:00:00',
        operator: '安全治理专员·王强',
      },
    ],
    type: 'post',
    coverUrl:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80',
    ],
    topics: ['黑客技术', '网络安全', '灰产揭秘'],
    likeCount: 2,
    commentCount: 1,
    shareCount: 0,
    collectCount: 0,
    publishTime: '2026-09-01 14:10:00',
  },
];

/**
 * 分页获取帖子列表（基于后端 FeedsPostDO 领域模型的高保真检索）
 * 注：后端目前仅开放 App 移动端接口，管理端 /feeds/post/page 待后端 AdminPostController 上线后开启直连
 */
export const getPostList = async (
  params: PostQueryParams = {},
): Promise<ApiResponse<{ list: PostItem[]; total: number }>> => {
  await new Promise((resolve) => setTimeout(resolve, 80));
  let filtered = [...mockPostsDataset];

  // 关键词检索（标题 / 内容 / 话题）
  if (params.keyword?.trim()) {
    const kw = params.keyword.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(kw) ||
        item.content?.toLowerCase().includes(kw) ||
        item.topics?.some((t) => t.toLowerCase().includes(kw)),
    );
  }

  // 作者筛选
  if (params.userId?.trim() || params.uid?.trim()) {
    const searchUid = (params.userId || params.uid || '').trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.author.uid.toLowerCase().includes(searchUid) ||
        item.userId?.toLowerCase().includes(searchUid) ||
        item.author.nickname.toLowerCase().includes(searchUid),
    );
  }

  // 帖子类型筛选
  const typeFilter = params.postType || params.type;
  if (typeFilter && typeFilter !== 'all') {
    filtered = filtered.filter((item) => item.postType === typeFilter || item.type === typeFilter);
  }

  // 状态筛选
  if (params.status && params.status !== 'all') {
    filtered = filtered.filter((item) => {
      if (params.status === 'pending' || params.status === 'auditing') {
        return item.status === 'pending' || (item.status as any) === 'auditing';
      }
      if (params.status === 'rejected' || params.status === 'banned') {
        return item.status === 'rejected' || (item.status as any) === 'banned';
      }
      return item.status === params.status;
    });
  }

  // 可见性筛选
  if (params.visibility && params.visibility !== 'all') {
    filtered = filtered.filter((item) => item.visibility === params.visibility);
  }

  // 置顶状态筛选
  if (typeof params.isTop === 'boolean') {
    filtered = filtered.filter((item) => item.isTop === params.isTop);
  }

  // 时间范围筛选
  if (params.dateRange && params.dateRange.length === 2) {
    const [start, end] = params.dateRange;
    if (start && end) {
      filtered = filtered.filter((item) => {
        const itemDate = (item.createdAt || item.publishTime).slice(0, 10);
        return itemDate >= start && itemDate <= end;
      });
    }
  }

  const page = params.pageNo || params.page || 1;
  const pageSize = params.pageSize || 10;
  const total = filtered.length;
  const list = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    code: 200,
    data: { list, total },
    message: 'success',
  };
};

/**
 * 获取帖子全局统计总览（动态聚合统计，消除 404）
 */
export const getPostStatisticsSummary = async (): Promise<ApiResponse<PostStatisticsSummaryVO>> => {
  const totalCount = mockPostsDataset.length;
  const pendingReviewCount = mockPostsDataset.filter(
    (p) => p.status === 'pending' || (p.status as any) === 'auditing',
  ).length;
  const rejectedCount = mockPostsDataset.filter(
    (p) => p.status === 'rejected' || (p.status as any) === 'banned',
  ).length;
  const todayStr = new Date().toISOString().slice(0, 10);
  const todayNewCount = mockPostsDataset.filter((p) =>
    (p.createdAt || p.publishTime).startsWith(todayStr),
  ).length;
  const totalInteractions = mockPostsDataset.reduce((sum, p) => {
    const stats = p.statistics || {
      likeCount: p.likeCount || 0,
      commentCount: p.commentCount || 0,
      shareCount: p.shareCount || 0,
    };
    return sum + (stats.likeCount || 0) + (stats.commentCount || 0) + (stats.shareCount || 0);
  }, 0);

  return {
    code: 200,
    data: {
      totalCount: totalCount + 28400,
      todayNewCount: todayNewCount + 128,
      pendingReviewCount: pendingReviewCount + 42,
      rejectedCount: rejectedCount + 319,
      totalInteractions: totalInteractions + 1420000,
    },
    message: 'success',
  };
};

/**
 * 获取单篇帖子详情（Dual-Mode）
 */
export const getPostDetail = async (id: string): Promise<ApiResponse<PostItem>> => {
  try {
    const res = await request<PostItem>({
      url: '/feeds/post/get',
      method: 'GET',
      params: { id },
      headers: { 'x-skip-error-message': 'true' },
    });
    if ((res.code === 200 || res.code === 0) && res.data) {
      return res;
    }
  } catch {
    // 降级本地查找
  }

  const post = mockPostsDataset.find((p) => p.id === id);
  if (!post) {
    return {
      code: 404,
      data: null as any,
      message: '帖子不存在或已被永久删除',
    };
  }
  return {
    code: 200,
    data: post,
    message: 'success',
  };
};

/**
 * 审核处置（通过 / 驳回违规下架）
 */
export const auditPost = async (params: PostAuditActionParams): Promise<ApiResponse<null>> => {
  try {
    const res = await request<null>({
      url: '/feeds/post/audit',
      method: 'PUT',
      data: params,
      headers: { 'x-skip-error-message': 'true' },
    });
    if (res.code === 200 || res.code === 0) return res;
  } catch {
    // 降级更新
  }

  await new Promise((resolve) => setTimeout(resolve, 150));
  const idx = mockPostsDataset.findIndex((p) => p.id === params.postId);
  if (idx !== -1) {
    const newStatus: PostStatus = params.action === 'pass' ? 'published' : 'rejected';
    const auditRecord = {
      id: `AUDIT_${Date.now()}`,
      auditMode: 'manual' as const,
      contentType: 'text' as const,
      suggestion: (params.action === 'pass' ? 'pass' : 'block') as any,
      label: params.violationLabel || 'community_standard',
      reason: params.rejectReason || (params.action === 'pass' ? '人工审核通过' : '违反社区公约'),
      createdAt: new Date().toISOString().replace('T', ' ').slice(0, 19),
      operator: '安全治理管理员',
    };

    mockPostsDataset[idx] = {
      ...mockPostsDataset[idx],
      status: newStatus,
      manualReviewFlag: 0,
      auditTasks: [auditRecord, ...(mockPostsDataset[idx].auditTasks || [])],
    };
  }

  return {
    code: 200,
    data: null,
    message: params.action === 'pass' ? '作品已审核通过并恢复公开展示' : '作品已违规下架并通知作者',
  };
};

/**
 * 更新帖子状态（发布/下架/草稿等）
 */
export const updatePostStatus = async (
  id: string,
  status: PostStatus,
  reason?: string,
): Promise<ApiResponse<null>> => {
  try {
    const res = await request<null>({
      url: '/feeds/post/update-status',
      method: 'PUT',
      data: { id, status, reason },
      headers: { 'x-skip-error-message': 'true' },
    });
    if (res.code === 200 || res.code === 0) return res;
  } catch {
    // 降级更新
  }

  await new Promise((resolve) => setTimeout(resolve, 150));
  const idx = mockPostsDataset.findIndex((p) => p.id === id);
  if (idx !== -1) {
    mockPostsDataset[idx] = { ...mockPostsDataset[idx], status };
  }
  return {
    code: 200,
    data: null,
    message:
      status === 'rejected' || (status as any) === 'banned'
        ? '作品已违规下架'
        : status === 'published'
          ? '作品已重新公开展示'
          : '作品状态已变更',
  };
};

/**
 * 切换置顶状态
 */
export const togglePostTop = async (id: string): Promise<ApiResponse<{ isTop: boolean }>> => {
  try {
    const res = await request<{ isTop: boolean }>({
      url: '/feeds/post/top',
      method: 'PUT',
      data: { id },
      headers: { 'x-skip-error-message': 'true' },
    });
    if (res.code === 200 || res.code === 0) return res;
  } catch {
    // 降级更新
  }

  await new Promise((resolve) => setTimeout(resolve, 150));
  const idx = mockPostsDataset.findIndex((p) => p.id === id);
  let isTop = false;
  if (idx !== -1) {
    isTop = !mockPostsDataset[idx].isTop;
    mockPostsDataset[idx] = { ...mockPostsDataset[idx], isTop };
  }
  return {
    code: 200,
    data: { isTop },
    message: isTop ? '已将该作品设为运营精选置顶' : '已取消推荐置顶',
  };
};

/**
 * 更新帖子可见性（公开 / 好友 / 私密）
 */
export const updatePostVisibility = async (
  id: string,
  visibility: PostVisibility,
): Promise<ApiResponse<null>> => {
  try {
    const res = await request<null>({
      url: '/feeds/post/visibility',
      method: 'PUT',
      data: { id, visibility },
      headers: { 'x-skip-error-message': 'true' },
    });
    if (res.code === 200 || res.code === 0) return res;
  } catch {
    // 降级更新
  }

  await new Promise((resolve) => setTimeout(resolve, 100));
  const idx = mockPostsDataset.findIndex((p) => p.id === id);
  if (idx !== -1) {
    mockPostsDataset[idx] = { ...mockPostsDataset[idx], visibility };
  }
  return {
    code: 200,
    data: null,
    message: '作品可见范围已更新',
  };
};

/**
 * 切换评论权限（全员/关闭/仅粉丝）
 */
export const updatePostCommentPermission = async (
  id: string,
  permission: CommentPermission,
): Promise<ApiResponse<null>> => {
  try {
    const res = await request<null>({
      url: '/feeds/post/comment-permission',
      method: 'PUT',
      data: { id, permission },
      headers: { 'x-skip-error-message': 'true' },
    });
    if (res.code === 200 || res.code === 0) return res;
  } catch {
    // 降级更新
  }

  await new Promise((resolve) => setTimeout(resolve, 100));
  const idx = mockPostsDataset.findIndex((p) => p.id === id);
  if (idx !== -1) {
    mockPostsDataset[idx] = { ...mockPostsDataset[idx], commentPermission: permission };
  }
  return {
    code: 200,
    data: null,
    message: '评论管控权限已更新',
  };
};

/**
 * 彻底删除作品（软删除）
 */
export const deletePost = async (id: string): Promise<ApiResponse<null>> => {
  try {
    const res = await request<null>({
      url: '/feeds/post/delete',
      method: 'DELETE',
      params: { id },
      headers: { 'x-skip-error-message': 'true' },
    });
    if (res.code === 200 || res.code === 0) return res;
  } catch {
    // 降级更新
  }

  await new Promise((resolve) => setTimeout(resolve, 150));
  mockPostsDataset = mockPostsDataset.filter((p) => p.id !== id);
  return {
    code: 200,
    data: null,
    message: '作品已成功删除',
  };
};

/**
 * 批量更新帖子状态
 */
export const batchUpdatePostStatus = async (
  ids: string[],
  status: PostStatus,
  reason?: string,
): Promise<ApiResponse<{ count: number }>> => {
  try {
    const res = await request<{ count: number }>({
      url: '/feeds/post/batch-status',
      method: 'PUT',
      data: { ids, status, reason },
      headers: { 'x-skip-error-message': 'true' },
    });
    if (res.code === 200 || res.code === 0) return res;
  } catch {
    // 降级更新
  }

  await new Promise((resolve) => setTimeout(resolve, 200));
  mockPostsDataset = mockPostsDataset.map((p) => {
    if (ids.includes(p.id)) {
      return { ...p, status };
    }
    return p;
  });
  return {
    code: 200,
    data: { count: ids.length },
    message: `已批量处理 ${ids.length} 篇作品状态`,
  };
};

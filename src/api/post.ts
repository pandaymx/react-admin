import type {
  ApiResponse,
  CommentPermission,
  PostAuditStatus,
  PostItem,
  PostQueryParams,
} from '@/types';

const mockPosts: PostItem[] = [
  {
    id: 'POST_202609001',
    title:
      '【沉浸式开箱】2026旗舰芯片真机上手体验测评！到底值不值得冲？#数码科技 #新机测评 #极客日常',
    type: 'video',
    coverUrl:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    topics: ['数码科技', '新机测评', '极客日常'],
    author: {
      uid: 'dy_98263102',
      nickname: '极客先锋·Tech',
      username: 'geek_vanguard',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      verifyStatus: 'creator',
    },
    likeCount: 48900,
    commentCount: 3420,
    shareCount: 6510,
    collectCount: 12400,
    status: 'published',
    commentPermission: 'open',
    isTop: true,
    publishTime: '2026-09-02 10:45:00',
  },
  {
    id: 'POST_202609002',
    title: '胡同深处的百年铜锅涮肉！入口即化的鲜切羊肉绝了 🍲 #老北京美食 #探店吃播 #美食日常',
    type: 'video',
    coverUrl:
      'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=500&auto=format&fit=crop&q=80',
    videoUrl: 'https://www.w3schools.com/html/mov_bbb.mp4',
    topics: ['老北京美食', '探店吃播', '美食日常'],
    author: {
      uid: 'dy_87219904',
      nickname: '小甜心美食志',
      username: 'sweet_foodie',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
      verifyStatus: 'creator',
    },
    likeCount: 92400,
    commentCount: 5610,
    shareCount: 13200,
    collectCount: 38900,
    status: 'published',
    commentPermission: 'open',
    isTop: false,
    publishTime: '2026-09-02 09:30:00',
  },
  {
    id: 'POST_202609003',
    title: '指弹吉他《晴天》治愈前奏教学｜零基础也能学会的小技巧 🎸 #吉他教学 #晴天 #原创音乐',
    type: 'video',
    coverUrl:
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&auto=format&fit=crop&q=80',
    topics: ['吉他教学', '晴天', '原创音乐'],
    author: {
      uid: 'dy_77341209',
      nickname: '云端吉他社',
      username: 'music_echo',
      avatar:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      verifyStatus: 'creator',
    },
    likeCount: 34100,
    commentCount: 1890,
    shareCount: 4200,
    collectCount: 9800,
    status: 'published',
    commentPermission: 'fans_only',
    isTop: false,
    publishTime: '2026-09-02 08:20:00',
  },
  {
    id: 'POST_202609004',
    title: '用长焦镜头记录野生雪豹！高原绝美雪域生灵 🐆🏔️ #野生动物摄影 #国家地理 #自然风光',
    type: 'image_text',
    coverUrl:
      'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?w=500&auto=format&fit=crop&q=80',
    images: [
      'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?w=800&auto=format&fit=crop&q=80',
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=800&auto=format&fit=crop&q=80',
    ],
    topics: ['野生动物摄影', '国家地理', '自然风光'],
    author: {
      uid: 'dy_99182345',
      nickname: '野性自然影像',
      username: 'nature_wildlife',
      avatar:
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      verifyStatus: 'creator',
    },
    likeCount: 125000,
    commentCount: 8900,
    shareCount: 24000,
    collectCount: 56000,
    status: 'published',
    commentPermission: 'open',
    isTop: true,
    publishTime: '2026-09-01 20:15:00',
  },
  {
    id: 'POST_202609005',
    title: 'AI 自动剪辑与超分辨率模型升级发布会直播回顾 🤖 #人工智能 #未来科技 #产品发布',
    type: 'video',
    coverUrl:
      'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=500&auto=format&fit=crop&q=80',
    topics: ['人工智能', '未来科技', '产品发布'],
    author: {
      uid: 'dy_66881122',
      nickname: '智元未来科技官方',
      username: 'future_ai_lab',
      avatar:
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
      verifyStatus: 'enterprise',
    },
    likeCount: 18200,
    commentCount: 620,
    shareCount: 3100,
    collectCount: 4500,
    status: 'published',
    commentPermission: 'open',
    isTop: false,
    publishTime: '2026-09-01 15:30:00',
  },
  {
    id: 'POST_202609006',
    title: '【内部渠道免费送】最新旗舰手机点击链接直接领！#福利 #免单',
    type: 'video',
    coverUrl:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
    topics: ['福利', '免单'],
    author: {
      uid: 'dy_33219011',
      nickname: '每日福利领取点我',
      username: 'spammer_bot_99',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      verifyStatus: 'unverified',
    },
    likeCount: 12,
    commentCount: 45,
    shareCount: 2,
    collectCount: 0,
    status: 'banned',
    commentPermission: 'closed',
    isTop: false,
    publishTime: '2026-08-20 12:00:00',
  },
];

let postsDataset = [...mockPosts];

/**
 * 获取帖子/作品列表
 */
export const getPostList = async (
  params: PostQueryParams = {},
): Promise<ApiResponse<{ list: PostItem[]; total: number }>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let filtered = [...postsDataset];

  if (params.keyword?.trim()) {
    const kw = params.keyword.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.title.toLowerCase().includes(kw) ||
        item.topics.some((t) => t.toLowerCase().includes(kw)) ||
        item.author.nickname.toLowerCase().includes(kw),
    );
  }

  if (params.uid?.trim()) {
    const uidKw = params.uid.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.author.uid.toLowerCase().includes(uidKw) || item.id.toLowerCase().includes(uidKw),
    );
  }

  if (params.type && params.type !== 'all') {
    filtered = filtered.filter((item) => item.type === params.type);
  }

  if (params.status && params.status !== 'all') {
    filtered = filtered.filter((item) => item.status === params.status);
  }

  if (params.commentPermission && params.commentPermission !== 'all') {
    filtered = filtered.filter((item) => item.commentPermission === params.commentPermission);
  }

  if (params.dateRange && params.dateRange.length === 2) {
    const [start, end] = params.dateRange;
    if (start && end) {
      filtered = filtered.filter((item) => {
        const itemDate = item.publishTime.slice(0, 10);
        return itemDate >= start && itemDate <= end;
      });
    }
  }

  const page = params.page || 1;
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
 * 更新帖子状态（公开/审核中/下架）
 */
export const updatePostStatus = async (
  id: string,
  status: PostAuditStatus,
): Promise<ApiResponse<null>> => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const idx = postsDataset.findIndex((p) => p.id === id);
  if (idx !== -1) {
    postsDataset[idx] = { ...postsDataset[idx], status };
  }
  return {
    code: 200,
    data: null,
    message: status === 'banned' ? '帖子已违规下架' : '帖子状态已更新',
  };
};

/**
 * 切换评论权限（全员/关闭/仅粉丝）
 */
export const updatePostCommentPermission = async (
  id: string,
  permission: CommentPermission,
): Promise<ApiResponse<null>> => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const idx = postsDataset.findIndex((p) => p.id === id);
  if (idx !== -1) {
    postsDataset[idx] = { ...postsDataset[idx], commentPermission: permission };
  }
  return {
    code: 200,
    data: null,
    message: '评论权限已更新',
  };
};

/**
 * 置顶 / 取消置顶
 */
export const togglePostTop = async (id: string): Promise<ApiResponse<{ isTop: boolean }>> => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const idx = postsDataset.findIndex((p) => p.id === id);
  let isTop = false;
  if (idx !== -1) {
    isTop = !postsDataset[idx].isTop;
    postsDataset[idx] = { ...postsDataset[idx], isTop };
  }
  return {
    code: 200,
    data: { isTop },
    message: isTop ? '已将该作品设为推荐置顶' : '已取消置顶',
  };
};

/**
 * 批量更新帖子状态
 */
export const batchUpdatePostStatus = async (
  ids: string[],
  status: PostAuditStatus,
): Promise<ApiResponse<{ count: number }>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  postsDataset = postsDataset.map((p) => {
    if (ids.includes(p.id)) {
      return { ...p, status };
    }
    return p;
  });
  return {
    code: 200,
    data: { count: ids.length },
    message: `已批量更新 ${ids.length} 个作品状态`,
  };
};

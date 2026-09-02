import type { ApiResponse, CommentItem, CommentQueryParams, CommentStatus } from '@/types';

// 评论 Mock 数据集
const mockComments: CommentItem[] = [
  {
    id: 'CMT_10001',
    postId: 'POST_202609001',
    postTitle: '【沉浸式开箱】2026旗舰芯片真机上手体验测评！到底值不值得冲？',
    postCover:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_87219904',
      nickname: '小甜心美食志',
      username: 'sweet_foodie',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    content: '博主测评太专业细致了！特别是发热控制对比，瞬间拔草了之前的犹豫！🔥',
    likeCount: 1420,
    replyCount: 28,
    status: 'top',
    riskTag: 'normal',
    createTime: '2026-09-02 10:48:12',
    ipLocation: '上海',
  },
  {
    id: 'CMT_10002',
    postId: 'POST_202609001',
    postTitle: '【沉浸式开箱】2026旗舰芯片真机上手体验测评！到底值不值得冲？',
    postCover:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_22394018',
      nickname: '代码小白日记',
      username: 'newbie_coder',
      avatar:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    },
    content: '请问续航在开启最高画质游戏下能支撑多久？有测过重度使用场景吗？',
    likeCount: 89,
    replyCount: 4,
    status: 'normal',
    riskTag: 'normal',
    createTime: '2026-09-02 10:55:00',
    ipLocation: '北京',
  },
  {
    id: 'CMT_10003',
    postId: 'POST_202609001',
    postTitle: '【沉浸式开箱】2026旗舰芯片真机上手体验测评！到底值不值得冲？',
    postCover:
      'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_33219011',
      nickname: '每日福利领取点我',
      username: 'spammer_bot_99',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    content: '最新同款手机低价内购渠道，点击主页头像加微免费领取优惠券红包！',
    likeCount: 1,
    replyCount: 0,
    status: 'hidden',
    riskTag: 'ad_suspect',
    createTime: '2026-09-02 11:00:22',
    ipLocation: '广东',
  },
  {
    id: 'CMT_10004',
    postId: 'POST_202609002',
    postTitle: '胡同深处的百年铜锅涮肉！入口即化的鲜切羊肉绝了 🍲',
    postCover:
      'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_55410982',
      nickname: '张三走天涯',
      username: 'zhang_san_travel',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    content: '这家店我上周刚去过！糖蒜和麻酱底料真是一绝，建议一定要早点去排队。',
    likeCount: 520,
    replyCount: 12,
    status: 'normal',
    riskTag: 'normal',
    createTime: '2026-09-02 09:40:15',
    ipLocation: '北京',
  },
  {
    id: 'CMT_10005',
    postId: 'POST_202609002',
    postTitle: '胡同深处的百年铜锅涮肉！入口即化的鲜切羊肉绝了 🍲',
    postCover:
      'https://images.unsplash.com/photo-1543353071-873f17a7a088?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_12093847',
      nickname: '夜幕狂刀',
      username: 'troll_master',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    content: '收了多少广告费啊？这么难吃也吹，真是服了你们这些探店博主。',
    likeCount: 15,
    replyCount: 9,
    status: 'hidden',
    riskTag: 'abuse',
    createTime: '2026-09-02 10:12:00',
    ipLocation: '河北',
  },
  {
    id: 'CMT_10006',
    postId: 'POST_202609003',
    postTitle: '指弹吉他《晴天》治愈前奏教学｜零基础也能学会的小技巧 🎸',
    postCover:
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_98263102',
      nickname: '极客先锋·Tech',
      username: 'geek_vanguard',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    content: '按和弦的手法讲解得好清晰，终于搞懂击弦和滑音的过渡节奏了！',
    likeCount: 380,
    replyCount: 5,
    status: 'normal',
    riskTag: 'normal',
    createTime: '2026-09-02 10:30:00',
    ipLocation: '浙江',
  },
  {
    id: 'CMT_10007',
    postId: 'POST_202609003',
    postTitle: '指弹吉他《晴天》治愈前奏教学｜零基础也能学会的小技巧 🎸',
    postCover:
      'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_88990011',
      nickname: '刷粉推广大师',
      username: 'growth_bot',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    content: '代涨播放量、粉丝关注、双击点赞，低价高效，需要的滴滴',
    likeCount: 0,
    replyCount: 0,
    status: 'hidden',
    riskTag: 'spam',
    createTime: '2026-09-02 10:35:10',
    ipLocation: '江苏',
  },
  {
    id: 'CMT_10008',
    postId: 'POST_202609004',
    postTitle: '用长焦镜头记录野生雪豹！高原绝美雪域生灵 🐆🏔️',
    postCover:
      'https://images.unsplash.com/photo-1564349683136-77e08dba1ef6?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_99018274',
      nickname: '网络安全哨兵',
      username: 'cyber_security_pro',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
    content: '致敬摄影师！在那种零下二三十度的极寒环境蹲守，太不容易了。画面非常震撼！',
    likeCount: 2900,
    replyCount: 42,
    status: 'top',
    riskTag: 'normal',
    createTime: '2026-09-02 07:15:00',
    ipLocation: '四川',
  },
];

let commentsDataset = [...mockComments];

/**
 * 查询评论列表（支持按帖子 ID、关键词、UID、风险标签、状态过滤）
 */
export const getCommentList = async (
  params: CommentQueryParams = {},
): Promise<ApiResponse<{ list: CommentItem[]; total: number }>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let filtered = [...commentsDataset];

  // 1. 按指定帖子 ID 过滤（单帖评论抽屉）
  if (params.postId?.trim()) {
    filtered = filtered.filter((item) => item.postId === params.postId?.trim());
  }

  // 2. 关键词过滤（评论正文 / 所属帖子标题）
  if (params.keyword?.trim()) {
    const kw = params.keyword.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.content.toLowerCase().includes(kw) || item.postTitle.toLowerCase().includes(kw),
    );
  }

  // 3. 用户 UID 过滤
  if (params.uid?.trim()) {
    const uidKw = params.uid.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.author.uid.toLowerCase().includes(uidKw) ||
        item.author.nickname.toLowerCase().includes(uidKw),
    );
  }

  // 4. 状态过滤
  if (params.status && params.status !== 'all') {
    filtered = filtered.filter((item) => item.status === params.status);
  }

  // 5. 风险标签过滤
  if (params.riskTag && params.riskTag !== 'all') {
    filtered = filtered.filter((item) => item.riskTag === params.riskTag);
  }

  // 6. 日期过滤
  if (params.dateRange && params.dateRange.length === 2) {
    const [start, end] = params.dateRange;
    if (start && end) {
      filtered = filtered.filter((item) => {
        const itemDate = item.createTime.slice(0, 10);
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
 * 更新评论状态（正常/隐藏/置顶）
 */
export const updateCommentStatus = async (
  id: string,
  status: CommentStatus,
): Promise<ApiResponse<null>> => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  const idx = commentsDataset.findIndex((c) => c.id === id);
  if (idx !== -1) {
    commentsDataset[idx] = { ...commentsDataset[idx], status };
  }
  return {
    code: 200,
    data: null,
    message:
      status === 'top' ? '已置顶该评论' : status === 'hidden' ? '已隐藏违规评论' : '已恢复正常展示',
  };
};

/**
 * 删除单个评论
 */
export const deleteComment = async (id: string): Promise<ApiResponse<null>> => {
  await new Promise((resolve) => setTimeout(resolve, 150));
  commentsDataset = commentsDataset.filter((c) => c.id !== id);
  return {
    code: 200,
    data: null,
    message: '评论已彻底删除',
  };
};

/**
 * 批量删除评论
 */
export const batchDeleteComments = async (
  ids: string[],
): Promise<ApiResponse<{ count: number }>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  commentsDataset = commentsDataset.filter((c) => !ids.includes(c.id));
  return {
    code: 200,
    data: { count: ids.length },
    message: `成功批量删除 ${ids.length} 条评论`,
  };
};

/**
 * 批量更新评论状态
 */
export const batchUpdateCommentStatus = async (
  ids: string[],
  status: CommentStatus,
): Promise<ApiResponse<{ count: number }>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  commentsDataset = commentsDataset.map((c) => {
    if (ids.includes(c.id)) {
      return { ...c, status };
    }
    return c;
  });
  return {
    code: 200,
    data: { count: ids.length },
    message: `成功更新 ${ids.length} 条评论状态`,
  };
};

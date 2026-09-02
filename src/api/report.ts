import type {
  ApiResponse,
  PenaltyAction,
  ReportItem,
  ReportQueryParams,
  ReportStatus,
} from '@/types';
import { updateCommentStatus } from './comment';
import { updatePostStatus } from './post';
import { updateUserStatus } from './user';

const mockReports: ReportItem[] = [
  {
    id: 'RPT_202609001',
    targetType: 'post',
    reason: 'ad_fraud',
    reasonDesc: '视频中夹带虚假免单钓鱼链接，涉嫌冒充官方开展抽奖诈骗引流！',
    evidenceImages: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    ],
    reporter: {
      uid: 'dy_98263102',
      nickname: '极客先锋·Tech',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    target: {
      targetId: 'POST_202609006',
      targetType: 'post',
      titleOrContent: '【内部渠道免费送】最新旗舰手机点击链接直接领！#福利 #免单',
      coverUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      targetUser: {
        uid: 'dy_33219011',
        nickname: '每日福利领取点我',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    },
    status: 'pending',
    createTime: '2026-09-02 11:05:00',
  },
  {
    id: 'RPT_202609002',
    targetType: 'comment',
    reason: 'abuse',
    reasonDesc: '该用户在评论区持续对我进行人身攻击、语言辱骂，严重影响正常创作交流。',
    evidenceImages: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    ],
    reporter: {
      uid: 'dy_87219904',
      nickname: '小甜心美食志',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    target: {
      targetId: 'CMT_10005',
      targetType: 'comment',
      titleOrContent: '收了多少广告费啊？这么难吃也吹，真是服了你们这些探店博主。',
      targetUser: {
        uid: 'dy_12093847',
        nickname: '夜幕狂刀',
        avatar:
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      },
    },
    status: 'pending',
    createTime: '2026-09-02 10:25:30',
  },
  {
    id: 'RPT_202609003',
    targetType: 'user',
    reason: 'ad_fraud',
    reasonDesc: '该账号批量私信发送微信黑产广告与低俗引流内容，严重扰乱平台秩序。',
    evidenceImages: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    ],
    reporter: {
      uid: 'dy_55410982',
      nickname: '张三走天涯',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    target: {
      targetId: 'dy_33219011',
      targetType: 'user',
      titleOrContent: '用户个性签名及主页含有黑灰产营销联系方式',
      targetUser: {
        uid: 'dy_33219011',
        nickname: '每日福利领取点我',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    },
    status: 'processed',
    penaltyAction: 'ban_user',
    handleRemark: '经核查属批量违规黑产引流账号，已对账号进行全站永久封禁。',
    handler: '安全风控组 (admin)',
    handleTime: '2026-09-02 10:00:00',
    createTime: '2026-09-02 09:12:00',
  },
  {
    id: 'RPT_202609004',
    targetType: 'post',
    reason: 'copyright',
    reasonDesc: '该吉他教学视频未经许可抄袭本人原创吉他谱编曲与和弦指法结构。',
    evidenceImages: [],
    reporter: {
      uid: 'dy_12093847',
      nickname: '夜幕狂刀',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    target: {
      targetId: 'POST_202609003',
      targetType: 'post',
      titleOrContent: '指弹吉他《晴天》治愈前奏教学｜零基础也能学会的小技巧 🎸',
      coverUrl:
        'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=500&auto=format&fit=crop&q=80',
      targetUser: {
        uid: 'dy_77341209',
        nickname: '云端吉他社',
        avatar:
          'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
      },
    },
    status: 'rejected',
    penaltyAction: 'none',
    handleRemark:
      '经平台版权比对，《晴天》为公开发行流行曲目，教学视频为创作者自行真人出镜示范，未构成实质性编曲侵权，举报不予支持。',
    handler: '版权法务审核员',
    handleTime: '2026-09-02 09:30:00',
    createTime: '2026-09-01 21:40:00',
  },
  {
    id: 'RPT_202609005',
    targetType: 'comment',
    reason: 'ad_fraud',
    reasonDesc: '评论区公开发布代刷播放量、买粉丝的营销黑产广告。',
    evidenceImages: [],
    reporter: {
      uid: 'dy_77341209',
      nickname: '云端吉他社',
      avatar:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
    target: {
      targetId: 'CMT_10007',
      targetType: 'comment',
      titleOrContent: '代涨播放量、粉丝关注、双击点赞，低价高效，需要的滴滴',
      targetUser: {
        uid: 'dy_88990011',
        nickname: '刷粉推广大师',
        avatar:
          'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      },
    },
    status: 'pending',
    createTime: '2026-09-02 10:40:00',
  },
];

let reportsDataset = [...mockReports];

/**
 * 查询举报列表
 */
export const getReportList = async (
  params: ReportQueryParams = {},
): Promise<ApiResponse<{ list: ReportItem[]; total: number }>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let filtered = [...reportsDataset];

  // 1. 关键词查询 (单号 / 理由 / 举报人 / 被举报人 / 目标标题)
  if (params.keyword?.trim()) {
    const kw = params.keyword.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.id.toLowerCase().includes(kw) ||
        item.reasonDesc.toLowerCase().includes(kw) ||
        item.reporter.nickname.toLowerCase().includes(kw) ||
        item.target.targetUser.nickname.toLowerCase().includes(kw) ||
        Boolean(item.target.titleOrContent?.toLowerCase().includes(kw)),
    );
  }

  // 2. 举报类型过滤
  if (params.targetType && params.targetType !== 'all') {
    filtered = filtered.filter((item) => item.targetType === params.targetType);
  }

  // 3. 违规原因过滤
  if (params.reason && params.reason !== 'all') {
    filtered = filtered.filter((item) => item.reason === params.reason);
  }

  // 4. 处理状态过滤
  if (params.status && params.status !== 'all') {
    filtered = filtered.filter((item) => item.status === params.status);
  }

  // 5. 日期范围过滤
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
 * 处置举报并联动业务状态
 */
export const handleReport = async (
  id: string,
  status: ReportStatus,
  penaltyAction: PenaltyAction,
  handleRemark: string,
): Promise<ApiResponse<null>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const targetIdx = reportsDataset.findIndex((r) => r.id === id);
  if (targetIdx === -1) {
    return { code: 404, data: null, message: '未找到该举报记录' };
  }

  const report = reportsDataset[targetIdx];
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  // 联动处罚逻辑
  if (status === 'processed') {
    if (penaltyAction === 'ban_post' && report.target.targetType === 'post') {
      await updatePostStatus(report.target.targetId, 'banned');
    } else if (penaltyAction === 'delete_comment' && report.target.targetType === 'comment') {
      await updateCommentStatus(report.target.targetId, 'hidden');
    } else if (penaltyAction === 'mute_user') {
      await updateUserStatus(report.target.targetUser.uid, 'muted');
    } else if (penaltyAction === 'ban_user') {
      await updateUserStatus(report.target.targetUser.uid, 'banned');
    }
  }

  reportsDataset[targetIdx] = {
    ...reportsDataset[targetIdx],
    status,
    penaltyAction,
    handleRemark,
    handler: '安全风控管理员 (admin)',
    handleTime: now,
  };

  return {
    code: 200,
    data: null,
    message: status === 'processed' ? '举报处置完成并已施加处罚' : '已驳回该举报申请',
  };
};

/**
 * 批量处理举报
 */
export const batchHandleReports = async (
  ids: string[],
  status: ReportStatus,
  handleRemark: string,
): Promise<ApiResponse<{ count: number }>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  reportsDataset = reportsDataset.map((r) => {
    if (ids.includes(r.id)) {
      return {
        ...r,
        status,
        handleRemark,
        handler: '安全风控管理员 (admin)',
        handleTime: now,
      };
    }
    return r;
  });

  return {
    code: 200,
    data: { count: ids.length },
    message: `已批量处理 ${ids.length} 条举报`,
  };
};

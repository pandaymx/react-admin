import type {
  ApiResponse,
  PenaltyAction,
  ReporterInfo,
  ReportItem,
  ReportQueryParams,
  ReportStatus,
  ReportSummaryVO,
  TargetUserInfo,
} from '@/types';
import { formatDateTime } from '@/utils/time';
import { updateCommentStatus } from './comment';
import { updatePostStatus } from './post';
import { request } from './request';
import { updateUserStatus } from './user';

const mockReports: ReportItem[] = [
  {
    id: '1001',
    targetType: 'post',
    reason: 'ad_fraud',
    reasonDesc: '视频中夹带虚假免单钓鱼链接，涉嫌冒充官方开展抽奖诈骗引流！',
    evidenceImages: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80',
    ],
    reporter: {
      userId: '1001',
      uid: 'dy_98263102',
      nickname: '极客先锋·Tech',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    targetUser: {
      userId: '1005',
      uid: 'dy_33219011',
      nickname: '每日福利领取点我',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      violationCount: 2,
    },
    targetSnapshot: {
      targetId: '1892837482910283905',
      targetType: 'post',
      title: '【内部渠道免费送】最新旗舰手机点击链接直接领！#福利 #免单',
      coverUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      currentStatus: 'published',
      publishTime: '2026-09-02 11:05:00',
    },
    target: {
      targetId: '1892837482910283905',
      targetType: 'post',
      titleOrContent: '【内部渠道免费送】最新旗舰手机点击链接直接领！#福利 #免单',
      coverUrl:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop&q=80',
      targetUser: {
        userId: '1005',
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
    id: '1002',
    targetType: 'comment',
    reason: 'abuse',
    reasonDesc: '该用户在评论区持续对我进行人身攻击、语言辱骂，严重影响正常创作交流。',
    evidenceImages: [
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
    ],
    reporter: {
      userId: '1002',
      uid: 'dy_87219904',
      nickname: '小甜心美食志',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    targetUser: {
      userId: '1008',
      uid: 'dy_66778899',
      nickname: '喷子不打烊',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      violationCount: 4,
    },
    target: {
      targetId: 'CMT_10005',
      targetType: 'comment',
      titleOrContent: '收了多少广告费啊？这么难吃也吹，真是服了你们这些探店博主。',
      targetUser: {
        userId: '1008',
        uid: 'dy_66778899',
        nickname: '喷子不打烊',
        avatar:
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      },
    },
    status: 'pending',
    createTime: '2026-09-02 09:12:00',
  },
];

const normalizedMockReports: ReportItem[] = mockReports.map((item) => ({
  ...item,
  reporter: {
    ...item.reporter,
    userNo: item.reporter.userNo || item.reporter.uid.replace(/^dy_/, ''),
    userId: item.reporter.userId,
  },
  targetUser: item.targetUser
    ? {
        ...item.targetUser,
        userNo: item.targetUser.userNo || item.targetUser.uid.replace(/^dy_/, ''),
        userId: item.targetUser.userId,
      }
    : undefined,
  target: {
    ...item.target,
    targetUser: {
      ...item.target.targetUser,
      userNo: item.target.targetUser.userNo || item.target.targetUser.uid.replace(/^dy_/, ''),
      userId: item.target.targetUser.userId,
    },
  },
}));

let reportsDataset: ReportItem[] = [...normalizedMockReports];

/**
 * 获取举报统计概览（Dual-Mode）
 */
export const getReportSummary = async (): Promise<ApiResponse<ReportSummaryVO>> => {
  try {
    const res = await request<ReportSummaryVO>({
      url: '/feeds/report/summary',
      method: 'GET',
      headers: { 'x-skip-error-message': 'true' },
    });
    if ((res.code === 200 || res.code === 0) && res.data) {
      return res;
    }
  } catch {
    // 降级动态聚合
  }

  const pendingCount = reportsDataset.filter((r) => r.status === 'pending').length;
  const resolvedCount = reportsDataset.filter(
    (r) => r.status === 'resolved' || (r.status as any) === 'processed',
  ).length;
  const rejectedCount = reportsDataset.filter((r) => r.status === 'rejected').length;

  return {
    code: 200,
    data: {
      pendingCount: pendingCount + 18,
      todayNewCount: 26,
      resolvedCount: resolvedCount + 382,
      rejectedCount: rejectedCount + 94,
      avgHandleTimeMinutes: 15,
    },
    message: 'success',
  };
};

/**
 * 查询举报列表（Dual-Mode：对接后端 AdminFeedsReportController 聚合数据）
 */
export const getReportList = async (
  params: ReportQueryParams = {},
): Promise<ApiResponse<{ list: ReportItem[]; total: number }>> => {
  try {
    const pageNo = params.pageNo || params.page || 1;
    const pageSize = params.pageSize || 10;
    const res = await request<{ list: any[]; total: number }>({
      url: '/feeds/report/page',
      method: 'GET',
      params: {
        status: params.status !== 'all' ? params.status : undefined,
        targetType: params.targetType !== 'all' ? params.targetType : undefined,
        pageNo,
        pageSize,
      },
      headers: { 'x-skip-error-message': 'true' },
    });

    if ((res.code === 200 || res.code === 0) && res.data?.list) {
      const list: ReportItem[] = res.data.list.map((r) => {
        const reporterUserNo =
          r.reporter?.userNo ||
          r.reporterUserNo ||
          r.reporter?.uid?.replace(/^dy_/, '') ||
          r.reporterUserId ||
          '';
        const reporterUid = r.reporter?.uid || r.reporter?.userNo || r.reporterUserId || '未知';
        const reporterInfo: ReporterInfo = {
          userId: r.reporter?.userId || r.reporterUserId,
          userNo: reporterUserNo,
          uid: reporterUid,
          nickname:
            r.reporter?.nickname || `用户_${(reporterUserNo || reporterUid || '').slice(-4)}`,
          avatar:
            r.reporter?.avatar ||
            'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        };

        const targetUserNo =
          r.targetUser?.userNo ||
          r.targetUserNo ||
          r.targetUser?.uid?.replace(/^dy_/, '') ||
          r.targetUserId ||
          '';
        const targetUid = r.targetUser?.uid || r.targetUser?.userNo || r.targetUserId || '未知';
        const targetUserInfo: TargetUserInfo = {
          userId: r.targetUser?.userId || r.targetUserId,
          userNo: targetUserNo,
          uid: targetUid,
          nickname:
            r.targetUser?.nickname || `创作者_${(targetUserNo || targetUid || '').slice(-4)}`,
          avatar:
            r.targetUser?.avatar ||
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          violationCount: r.targetUser?.violationCount || 0,
        };
        const snapshot = r.targetSnapshot || {};

        return {
          id: String(r.id),
          targetType: r.targetType || 'post',
          targetId: r.targetId || snapshot.targetId,
          reason: r.reasonCode || 'other',
          reasonCode: r.reasonCode,
          reasonDesc: r.reasonText || '举报反馈违规',
          evidenceImages: r.evidenceImages || [],
          reporter: reporterInfo,
          targetUser: targetUserInfo,
          targetSnapshot: snapshot,
          target: {
            targetId: r.targetId || snapshot.targetId || '',
            targetType: r.targetType || 'post',
            titleOrContent: snapshot.title || snapshot.content || '被举报内容快照',
            coverUrl: snapshot.coverUrl,
            targetUser: targetUserInfo,
          },
          status: r.status || 'pending',
          penaltyAction: r.handling?.action || 'none',
          handleRemark: r.handling?.memo || '',
          handler: r.handling?.handlerName || r.handling?.handlerUserId || '',
          handleTime: r.handling?.handleTime,
          createTime: formatDateTime(r.createdAt || '2026-09-04 10:00:00'),
        };
      });

      return {
        code: 200,
        data: { list, total: Number(res.data.total) || list.length },
        message: 'success',
      };
    }
  } catch {
    // 降级本地离线检索
  }

  await new Promise((resolve) => setTimeout(resolve, 80));
  let filtered = [...reportsDataset];

  // 1. 关键词查询
  if (params.keyword?.trim()) {
    const kw = params.keyword.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.id.toLowerCase().includes(kw) ||
        item.reasonDesc.toLowerCase().includes(kw) ||
        item.reporter.nickname.toLowerCase().includes(kw) ||
        item.reporter.uid.toLowerCase().includes(kw) ||
        Boolean(item.reporter.userNo?.toLowerCase().includes(kw)) ||
        item.target.targetUser.nickname.toLowerCase().includes(kw) ||
        item.target.targetUser.uid.toLowerCase().includes(kw) ||
        Boolean(item.target.targetUser.userNo?.toLowerCase().includes(kw)) ||
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
 * 处置举报并联动业务状态
 */
export const handleReport = async (
  id: string,
  status: ReportStatus,
  penaltyAction: PenaltyAction,
  handleRemark: string,
): Promise<ApiResponse<null>> => {
  try {
    const actionMap: Record<string, string> = {
      ban_post: 'delete_target',
      delete_comment: 'delete_target',
      mute_user: 'temp_ban',
      ban_user: 'perm_ban',
      warn_user: 'warn_user',
      none: 'dismiss',
    };
    const backendAction = actionMap[penaltyAction] || penaltyAction;

    const res = await request<boolean>({
      url: '/feeds/report/handle',
      method: 'PUT',
      data: {
        reportId: Number(id) || id,
        action: backendAction,
        memo: handleRemark,
      },
      headers: { 'x-skip-error-message': 'true' },
    });
    if (res.code === 200 || res.code === 0)
      return { code: 200, data: null, message: '举报处置成功' };
  } catch {
    // 降级本地更新
  }

  await new Promise((resolve) => setTimeout(resolve, 150));
  const targetIdx = reportsDataset.findIndex((r) => r.id === id);
  if (targetIdx !== -1) {
    const report = reportsDataset[targetIdx];
    const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

    if (status === 'processed' || status === 'resolved') {
      if (penaltyAction === 'ban_post' && report.target.targetType === 'post') {
        await updatePostStatus(report.target.targetId, 'rejected');
      } else if (penaltyAction === 'delete_comment' && report.target.targetType === 'comment') {
        await updateCommentStatus(report.target.targetId, 'deleted');
      } else if (penaltyAction === 'mute_user') {
        const targetUserId =
          report.target.targetUser.userId ||
          report.target.targetUser.userNo ||
          report.target.targetUser.uid;
        await updateUserStatus(targetUserId, 'muted');
      } else if (penaltyAction === 'ban_user') {
        const targetUserId =
          report.target.targetUser.userId ||
          report.target.targetUser.userNo ||
          report.target.targetUser.uid;
        await updateUserStatus(targetUserId, 'banned');
      }
    }

    reportsDataset[targetIdx] = {
      ...reportsDataset[targetIdx],
      status,
      penaltyAction,
      handleRemark,
      handler: '安全合规管理员',
      handleTime: now,
    };
  }

  return {
    code: 200,
    data: null,
    message:
      status === 'resolved' || status === 'processed'
        ? '举报处置完成并已施加处罚'
        : '已驳回该举报申请',
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
  try {
    const res = await request<number>({
      url: '/feeds/report/batch-handle',
      method: 'PUT',
      data: {
        reportIds: ids.map((i) => Number(i) || i),
        action: status === 'rejected' ? 'dismiss' : 'delete_target',
        memo: handleRemark,
      },
      headers: { 'x-skip-error-message': 'true' },
    });
    if (res.code === 200 || res.code === 0) {
      return {
        code: 200,
        data: { count: Number(res.data) || ids.length },
        message: `已批量处理 ${ids.length} 条举报`,
      };
    }
  } catch {
    // 降级本地批量更新
  }

  await new Promise((resolve) => setTimeout(resolve, 150));
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  reportsDataset = reportsDataset.map((r) => {
    if (ids.includes(r.id)) {
      return {
        ...r,
        status,
        handleRemark,
        handler: '安全合规管理员',
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

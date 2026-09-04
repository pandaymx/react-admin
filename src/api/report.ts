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
 * 将后端 AdminFeedsReportRespVO 统一转换为前端 ReportItem
 */
export const convertBackendReport = (r: any): ReportItem => {
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
      r.reporter?.nickname || `用户_${String(reporterUserNo || reporterUid || '').slice(-4)}`,
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
      r.targetUser?.nickname || `创作者_${String(targetUserNo || targetUid || '').slice(-4)}`,
    avatar:
      r.targetUser?.avatar ||
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    violationCount: Number(r.targetUser?.violationCount) || 0,
  };
  const snapshot = r.targetSnapshot || {};

  // 解析举证图片（支持 evidenceImages 数组或 evidenceUrls JSON 字符串）
  let evidenceImages: string[] = [];
  if (Array.isArray(r.evidenceImages) && r.evidenceImages.length > 0) {
    evidenceImages = r.evidenceImages.filter(Boolean);
  } else if (typeof r.evidenceUrls === 'string' && r.evidenceUrls.trim()) {
    try {
      const parsed = JSON.parse(r.evidenceUrls);
      if (Array.isArray(parsed)) evidenceImages = parsed.filter(Boolean);
    } catch {}
  }

  // 状态映射：后端 resolved 映射为前端 processed
  let status: ReportStatus = r.status || 'pending';
  if (status === 'resolved') {
    status = 'processed';
  } else if (status === 'cancelled') {
    status = 'ignored';
  }

  // 原因描述解析：如果后端有 reasonText，则使用 reasonText，否则根据 reasonCode 匹配友好描述
  const reasonTextMap: Record<string, string> = {
    porn: '色情低俗内容违规',
    abuse: '侮辱谩骂/人身攻击违规',
    spam: '恶意营销/垃圾广告违规',
    fraud: '涉嫌诈骗/非法引流',
    other: '其他违反社区规范行为',
  };
  const reasonDesc = r.reasonText || reasonTextMap[r.reasonCode] || '违规举报投诉反馈';

  // 处罚动作映射
  let penaltyAction: PenaltyAction = 'none';
  if (r.handling?.action) {
    const action = r.handling.action;
    if (action === 'delete_target') {
      penaltyAction = r.targetType === 'comment' ? 'delete_comment' : 'ban_post';
    } else if (action === 'temp_ban') {
      penaltyAction = 'mute_user';
    } else if (action === 'perm_ban') {
      penaltyAction = 'ban_user';
    } else if (action === 'warn_user') {
      penaltyAction = 'warn_user';
    } else if (action === 'dismiss') {
      penaltyAction = 'none';
    } else {
      penaltyAction = action;
    }
  }

  // 历史处置记录转换
  const handlingHistory = Array.isArray(r.handlingHistory)
    ? r.handlingHistory.map((h: any) => ({
        id: h.id,
        handlerUserId: h.handlerUserId,
        handlerName: h.handlerName || h.handlerUserId || '安全管理员',
        action: h.action,
        actionDetail: h.actionDetail,
        memo: h.memo,
        handleTime: formatDateTime(h.handleTime || h.createdAt),
      }))
    : [];

  return {
    id: String(r.id),
    targetType: (r.targetType || 'post') as any,
    targetId: r.targetId || snapshot.targetId,
    reason: (r.reasonCode || 'other') as any,
    reasonCode: r.reasonCode,
    reasonDesc,
    evidenceImages,
    reporter: reporterInfo,
    targetUser: targetUserInfo,
    targetSnapshot: {
      targetId: snapshot.targetId || r.targetId || '',
      targetType: snapshot.targetType || r.targetType || 'post',
      title: snapshot.title,
      content: snapshot.content,
      coverUrl: snapshot.coverUrl,
      currentStatus: snapshot.currentStatus || snapshot.status,
      publishTime: formatDateTime(snapshot.publishTime),
    },
    target: {
      targetId: r.targetId || snapshot.targetId || '',
      targetType: (r.targetType || 'post') as any,
      titleOrContent:
        snapshot.title ||
        snapshot.content ||
        (r.targetType === 'user' ? '用户违规行为投诉' : '被举报内容快照'),
      coverUrl: snapshot.coverUrl,
      targetUser: targetUserInfo,
    },
    status,
    penaltyAction,
    handleRemark: r.handling?.memo || '',
    handler: r.handling?.handlerName || r.handling?.handlerUserId || '',
    handleTime: formatDateTime(r.handling?.handleTime),
    createTime: formatDateTime(r.createdAt || r.createTime || Date.now()),
    handling: r.handling
      ? {
          id: r.handling.id,
          handlerUserId: r.handling.handlerUserId,
          handlerName: r.handling.handlerName || r.handling.handlerUserId || '安全管理员',
          action: penaltyAction,
          actionDetail: r.handling.actionDetail,
          memo: r.handling.memo,
          handleTime: formatDateTime(r.handling.handleTime),
        }
      : undefined,
    handlingHistory,
  };
};

/**
 * 获取举报统计概览（直连后端 GET /feeds/report/summary，支持 Mock 降级）
 */
export const getReportSummary = async (): Promise<ApiResponse<ReportSummaryVO>> => {
  try {
    const res = await request<ReportSummaryVO>({
      url: '/feeds/report/summary',
      method: 'GET',
      headers: { 'x-skip-error-message': 'true' },
    });
    if ((res.code === 200 || res.code === 0) && res.data) {
      return {
        code: 200,
        data: {
          pendingCount: Number(res.data.pendingCount) || 0,
          todayNewCount: Number(res.data.todayNewCount) || 0,
          resolvedCount: Number(res.data.resolvedCount) || 0,
          rejectedCount: Number(res.data.rejectedCount) || 0,
          avgHandleTimeMinutes: Number(res.data.avgHandleTimeMinutes) || 0,
        },
        message: 'success',
      };
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
 * 查询举报列表（直连后端 GET /feeds/report/page，支持双模降级）
 */
export const getReportList = async (
  params: ReportQueryParams = {},
): Promise<ApiResponse<{ list: ReportItem[]; total: number }>> => {
  try {
    const pageNo = params.pageNo || params.page || 1;
    const pageSize = params.pageSize || 10;

    // 状态映射：前端 processed 对应后端 resolved，ignored 对应 cancelled
    let backendStatus: string | undefined;
    if (params.status && params.status !== 'all') {
      if (params.status === 'processed') backendStatus = 'resolved';
      else if (params.status === 'ignored') backendStatus = 'cancelled';
      else backendStatus = params.status;
    }

    // 原因代码映射：对齐 FeedsReportReasonCode (porn, abuse, spam, fraud, other)
    let backendReasonCode: string | undefined;
    if (params.reason && params.reason !== 'all') {
      const reasonCodeMap: Record<string, string> = {
        ad_fraud: 'spam',
        gambling: 'fraud',
        porn: 'porn',
        abuse: 'abuse',
        spam: 'spam',
        fraud: 'fraud',
        other: 'other',
      };
      backendReasonCode = reasonCodeMap[params.reason] || params.reason;
    }

    // 时间范围格式化为 [YYYY-MM-DD 00:00:00, YYYY-MM-DD 23:59:59]
    let createTime: [string, string] | undefined;
    if (
      params.dateRange &&
      params.dateRange.length === 2 &&
      params.dateRange[0] &&
      params.dateRange[1]
    ) {
      const start = params.dateRange[0].includes(' ')
        ? params.dateRange[0]
        : `${params.dateRange[0]} 00:00:00`;
      const end = params.dateRange[1].includes(' ')
        ? params.dateRange[1]
        : `${params.dateRange[1]} 23:59:59`;
      createTime = [start, end];
    }

    const queryParams: Record<string, any> = {
      pageNo,
      pageSize,
    };
    if (backendStatus) queryParams.status = backendStatus;
    if (params.targetType && params.targetType !== 'all')
      queryParams.targetType = params.targetType;
    if (backendReasonCode) queryParams.reasonCode = backendReasonCode;
    if (createTime) queryParams.createTime = createTime;

    // 关键词：若是纯数字可作为 reporterUserId 或 targetUserId
    if (params.keyword?.trim()) {
      const kw = params.keyword.trim();
      if (/^\d+$/.test(kw)) {
        queryParams.reporterUserId = kw;
      }
    }

    const res = await request<{ list: any[]; total: number }>({
      url: '/feeds/report/page',
      method: 'GET',
      params: queryParams,
      headers: { 'x-skip-error-message': 'true' },
    });

    if ((res.code === 200 || res.code === 0) && res.data?.list) {
      const list: ReportItem[] = res.data.list.map(convertBackendReport);
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
 * 查询单条举报工单详情（直连后端 GET /feeds/report/get?id=xxx，支持 Mock 降级）
 */
export const getReportDetail = async (id: string | number): Promise<ApiResponse<ReportItem>> => {
  try {
    const res = await request<any>({
      url: '/feeds/report/get',
      method: 'GET',
      params: { id: Number(id) || id },
      headers: { 'x-skip-error-message': 'true' },
    });
    if ((res.code === 200 || res.code === 0) && res.data) {
      return {
        code: 200,
        data: convertBackendReport(res.data),
        message: 'success',
      };
    }
  } catch {
    // 降级本地查找
  }

  const item = reportsDataset.find((r) => r.id === String(id));
  if (item) {
    return { code: 200, data: item, message: 'success' };
  }
  return { code: 404, data: null as any, message: '未查询到该工单' };
};

/**
 * 处置举报并联动业务状态（直连后端 PUT /feeds/report/handle，支持 Mock 降级）
 */
export const handleReport = async (
  id: string,
  status: ReportStatus,
  penaltyAction: PenaltyAction,
  handleRemark: string,
  extra?: { targetType?: string; durationDays?: number },
): Promise<ApiResponse<null>> => {
  try {
    let backendAction: string;
    let actionDetail: string | undefined;

    if (status === 'rejected') {
      backendAction = 'dismiss';
    } else {
      const actionMap: Record<string, string> = {
        ban_post: 'delete_target',
        delete_comment: 'delete_target',
        mute_user: 'temp_ban',
        ban_user: 'perm_ban',
        warn_user: 'warn_user',
        none: 'dismiss',
      };
      backendAction = actionMap[penaltyAction] || penaltyAction;

      // 如果目标是 user 且动作为 delete_target，纠正为 warn_user
      if (extra?.targetType === 'user' && backendAction === 'delete_target') {
        backendAction = 'warn_user';
      }

      // 如果是 temp_ban，后端必须携带包含 duration_days 的 actionDetail JSON
      if (backendAction === 'temp_ban') {
        actionDetail = JSON.stringify({
          duration_days: extra?.durationDays || 7,
          ban_reason: handleRemark,
        });
      }
    }

    const res = await request<boolean>({
      url: '/feeds/report/handle',
      method: 'PUT',
      data: {
        reportId: Number(id) || id,
        action: backendAction,
        actionDetail,
        memo: handleRemark,
        notifyAuthor: true,
      },
      headers: { 'x-skip-error-message': 'true' },
    });
    if (res.code === 200 || res.code === 0) {
      return {
        code: 200,
        data: null,
        message: status === 'rejected' ? '已驳回该举报申请' : '举报处置成功',
      };
    }
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
 * 批量处理举报（直连后端 PUT /feeds/report/batch-handle，支持 Mock 降级）
 */
export const batchHandleReports = async (
  ids: string[],
  status: ReportStatus,
  handleRemark: string,
  action: 'dismiss' | 'delete_target' | 'warn_user' = 'delete_target',
): Promise<ApiResponse<{ count: number }>> => {
  try {
    const backendAction = status === 'rejected' ? 'dismiss' : action;
    const res = await request<number>({
      url: '/feeds/report/batch-handle',
      method: 'PUT',
      data: {
        reportIds: ids.map((i) => Number(i) || i),
        action: backendAction,
        memo: handleRemark,
        notifyAuthor: true,
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

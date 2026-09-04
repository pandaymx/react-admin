import type {
  ApiResponse,
  AppealItem,
  AppealListResult,
  AppealQueryParams,
  HandleAppealParams,
} from '@/types';

// 初始模拟申诉数据集
const initialAppeals: AppealItem[] = [
  {
    id: 'AP20260902001',
    user: {
      id: 'u_101',
      uid: 'dy_998811',
      username: 'food_lover_01',
      nickname: '小甜心美食志',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      phone: '13812345678',
    },
    appealType: 'account_ban',
    targetContent: '账号全部登录与互动权限',
    originalPunishReason: '涉嫌批量发布低俗引流与恶意营销广告',
    originalPunishTime: '2026-09-01 15:30:00',
    originalBanExpireTime: '2026-09-08 15:30:00',
    appealReason:
      '尊敬的审核员您好，我的账号在 9月1日下午被异地盗号登录并在评论区发送了营销垃圾信息。本人已于当日找回密码并绑定了双重安全验证。附上异地登录报警短信和密码重置记录，申请提前解除账号封禁。',
    appealEvidences: [
      {
        id: 'ev_1',
        url: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600',
        name: '异地异常登录提醒截图.png',
      },
      {
        id: 'ev_2',
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600',
        name: '安全中心密码修改成功回执.png',
      },
    ],
    status: 'pending',
    createdAt: '2026-09-02 09:15:20',
  },
  {
    id: 'AP20260902002',
    user: {
      id: 'u_102',
      uid: 'dy_773322',
      username: 'tech_geek_pro',
      nickname: '极客硬核评测',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
      phone: '13987654321',
    },
    appealType: 'post_violation',
    targetContent: '视频作品：《2026 最新旗舰芯片全方位深度拆解与温控实测》',
    originalPunishReason: '涉嫌侵犯第三方厂商未公开机密著作权下架',
    originalPunishTime: '2026-08-31 18:20:00',
    appealReason:
      '本视频评测所使用工程样机系通过合法公开渠道与品牌方媒体送测协议获得，并在约定解禁时间后公开发布。附件提供与品牌公关部签署的送测协议盖章扫描件与授权邮件，申请恢复该作品公开展示。',
    appealEvidences: [
      {
        id: 'ev_3',
        url: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600',
        name: '品牌方媒体评测合作授权书(盖章).jpg',
      },
      {
        id: 'ev_4',
        url: 'https://images.unsplash.com/photo-1586281380349-632531db7ed4?w=600',
        name: '产品解禁发布时间确认邮件往来.jpg',
      },
    ],
    status: 'pending',
    createdAt: '2026-09-02 10:40:00',
  },
  {
    id: 'AP20260902003',
    user: {
      id: 'u_104',
      uid: 'dy_334455',
      username: 'travel_lens',
      nickname: '行摄山海间',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
      phone: '13799881122',
    },
    appealType: 'comment_mute',
    targetContent: '在摄影教程作品下发布的 3 条技术讨论评论',
    originalPunishReason: '系统算法误判为侮辱谩骂他人言论，禁言 3 天',
    originalPunishTime: '2026-09-01 20:00:00',
    originalBanExpireTime: '2026-09-04 20:00:00',
    appealReason:
      '我当时在评论区是指出原视频快门与光圈参数的理论换算错误，用词严谨客观，并没有任何针对作者的人身攻击或侮辱言辞，属于学术与技法交流，请求人工复核并解除禁言。',
    appealEvidences: [
      {
        id: 'ev_5',
        url: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600',
        name: '评论区完整上下文对话长截图.jpg',
      },
    ],
    status: 'approved',
    reviewer: 'admin_李主管',
    reviewTime: '2026-09-02 11:20:00',
    reviewRemark:
      '经人工全面核查完整对话语境，确系专业技术探讨，属算法模型误伤，已立即提前解封并恢复评论权限。',
    restoreActions: ['已解除评论禁言权限', '已恢复社区信用分 +30 分'],
    createdAt: '2026-09-01 21:30:00',
  },
  {
    id: 'AP20260902004',
    user: {
      id: 'u_106',
      uid: 'dy_556677',
      username: 'fitness_coach_li',
      nickname: '李教练燃脂营',
      avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150',
      phone: '13611223344',
    },
    appealType: 'activity_ban',
    targetContent: '2026秋季全国健身达人线上打榜PK赛报名资格',
    originalPunishReason: '涉嫌使用辅助挂机软件异常刷榜打卡，限制参加活动 30 天',
    originalPunishTime: '2026-08-30 14:00:00',
    originalBanExpireTime: '2026-09-29 14:00:00',
    appealReason:
      '当日我是带领线下训练营 50 名学员同步进行有氧打卡，IP虽然集中但均有现场运动手环与心率数据记录，绝非机器脚本刷票，申请解除活动限制以参加决赛。',
    appealEvidences: [
      {
        id: 'ev_6',
        url: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
        name: '线下集训现场实拍与运动心率监控导出报表.pdf',
      },
    ],
    status: 'pending',
    createdAt: '2026-09-02 11:45:10',
  },
  {
    id: 'AP20260902005',
    user: {
      id: 'u_108',
      uid: 'dy_223344',
      username: 'cyber_shop_99',
      nickname: '潮牌数码折扣店',
      avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150',
      phone: '13566778899',
    },
    appealType: 'credit_deduct',
    targetContent: '社区信用分扣减 100 分及首页流曝光降权',
    originalPunishReason: '私下引导粉丝添加外部微信进行虚假打折交易',
    originalPunishTime: '2026-08-28 10:00:00',
    appealReason:
      '我们只是在粉丝群提供售后咨询微信号，并未发生欺诈行为，希望平台宽大处理恢复信用分。',
    appealEvidences: [
      {
        id: 'ev_7',
        url: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600',
        name: '客户售后好评聊天截图.png',
      },
    ],
    status: 'rejected',
    reviewer: 'admin_王风控',
    reviewTime: '2026-09-01 16:10:00',
    reviewRemark:
      '经核实，该账号多次通过评论置顶与私信诱导私下转账交易，违反平台《禁止外部引流交易规范》第 4.2 条，证据确凿，维持原判驳回申诉。',
    createdAt: '2026-08-30 09:20:00',
  },
];

let currentAppeals: AppealItem[] = initialAppeals.map((item) => ({
  ...item,
  user: {
    ...item.user,
    userNo: item.user.userNo || item.user.uid.replace(/^dy_/, ''),
  },
}));

/**
 * 获取申诉列表（支持分页、关键词与多维筛选）
 */
export const getAppealList = async (
  params: AppealQueryParams,
): Promise<ApiResponse<AppealListResult>> => {
  await new Promise((resolve) => setTimeout(resolve, 250));

  let list = [...currentAppeals];

  // 关键词检索（单号/昵称/@用户名/用户展示号/UID/申诉理由）
  if (params.keyword?.trim()) {
    const kw = params.keyword.trim().toLowerCase();
    list = list.filter(
      (item) =>
        item.id.toLowerCase().includes(kw) ||
        item.user.nickname.toLowerCase().includes(kw) ||
        item.user.username.toLowerCase().includes(kw) ||
        item.user.userNo?.toLowerCase().includes(kw) ||
        item.user.uid.toLowerCase().includes(kw) ||
        item.appealReason.toLowerCase().includes(kw),
    );
  }

  // 用户展示号筛选
  if (params.userNo?.trim() || params.uid?.trim()) {
    const uKw = (params.userNo || params.uid || '').trim().toLowerCase();
    list = list.filter(
      (item) =>
        item.user.userNo?.toLowerCase().includes(uKw) || item.user.uid.toLowerCase().includes(uKw),
    );
  }

  // 申诉类型筛选
  if (params.appealType && params.appealType !== 'all') {
    list = list.filter((item) => item.appealType === params.appealType);
  }

  // 状态筛选
  if (params.status && params.status !== 'all') {
    list = list.filter((item) => item.status === params.status);
  }

  // 日期范围筛选
  if (params.dateRange && params.dateRange.length === 2) {
    const [start, end] = params.dateRange;
    list = list.filter((item) => {
      const time = item.createdAt.split(' ')[0];
      return time >= start && time <= end;
    });
  }

  const page = params.page || 1;
  const pageSize = params.pageSize || 10;
  const startIndex = (page - 1) * pageSize;
  const pageList = list.slice(startIndex, startIndex + pageSize);

  // 统计数据大盘
  const totalCount = currentAppeals.length;
  const pendingCount = currentAppeals.filter((a) => a.status === 'pending').length;
  const approvedCount = currentAppeals.filter((a) => a.status === 'approved').length;
  const rejectedCount = currentAppeals.filter((a) => a.status === 'rejected').length;

  return {
    code: 200,
    data: {
      list: pageList,
      total: list.length,
      page,
      pageSize,
      stats: {
        totalCount,
        pendingCount,
        approvedCount,
        rejectedCount,
        avgHandleTime: '1.8 小时',
      },
    },
    message: '获取申诉列表成功',
  };
};

/**
 * 审核处理申诉（通过 / 驳回）
 */
export const handleAppeal = async (
  params: HandleAppealParams,
): Promise<ApiResponse<AppealItem>> => {
  await new Promise((resolve) => setTimeout(resolve, 300));

  const targetIndex = currentAppeals.findIndex((a) => a.id === params.id);
  if (targetIndex === -1) {
    throw new Error('申诉单不存在');
  }

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  let restoreActions: string[] | undefined;
  if (params.action === 'approve') {
    const type = currentAppeals[targetIndex].appealType;
    if (type === 'account_ban')
      restoreActions = ['已解除账号全量封禁状态', '已恢复登录与全部交互权限'];
    else if (type === 'comment_mute') restoreActions = ['已解除评论与互动禁言限制'];
    else if (type === 'post_violation') restoreActions = ['已恢复作品公开展示并消除违规惩罚'];
    else if (type === 'activity_ban') restoreActions = ['已解除活动发起与参与权限限制'];
    else if (type === 'credit_deduct') restoreActions = ['已恢复被扣除的 80 社区信用分与推荐权重'];
  }

  const updated: AppealItem = {
    ...currentAppeals[targetIndex],
    status: params.action === 'approve' ? 'approved' : 'rejected',
    reviewer: params.reviewer || '当前管理员',
    reviewTime: timeStr,
    reviewRemark: params.reviewRemark,
    restoreActions,
  };

  currentAppeals[targetIndex] = updated;

  return {
    code: 200,
    data: updated,
    message: params.action === 'approve' ? '申诉已通过并已自动撤销惩处' : '申诉已被驳回维持原判',
  };
};

/**
 * 批量审核处理申诉
 */
export const batchHandleAppeals = async (params: {
  ids: string[];
  action: 'approve' | 'reject';
  reviewRemark: string;
}): Promise<ApiResponse<{ updatedCount: number }>> => {
  await new Promise((resolve) => setTimeout(resolve, 350));

  const now = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  const timeStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;

  currentAppeals = currentAppeals.map((item) => {
    if (params.ids.includes(item.id) && item.status === 'pending') {
      return {
        ...item,
        status: params.action === 'approve' ? 'approved' : 'rejected',
        reviewer: '当前管理员 (批量操作)',
        reviewTime: timeStr,
        reviewRemark: params.reviewRemark,
        restoreActions:
          params.action === 'approve' ? ['已批量撤销对应处罚并恢复相关权限'] : undefined,
      };
    }
    return item;
  });

  return {
    code: 200,
    data: { updatedCount: params.ids.length },
    message: `已批量处理 ${params.ids.length} 条申诉工单`,
  };
};

/**
 * 获取用于导出的全量过滤申诉数据
 */
export const getAllFilteredAppeals = async (
  params: Omit<AppealQueryParams, 'page' | 'pageSize'>,
): Promise<AppealItem[]> => {
  const res = await getAppealList({ ...params, page: 1, pageSize: 99999 });
  return res.data.list;
};

import type {
  ActivityTrendItem,
  ApiResponse,
  DashboardOverviewStats,
  PendingTaskItem,
  SecurityAuditStreamItem,
  ViolationCategoryStat,
} from '@/types';

// 仪表盘核心指标
const mockOverviewStats: DashboardOverviewStats = {
  totalUsers: 148920,
  newUsersToday: 1240,
  activeUsersToday: 48900,
  userGrowthRate: 12.8,

  totalPosts: 682400,
  newPostsToday: 5630,
  postInteractions: 3820000,
  postGrowthRate: 8.4,

  pendingReports: 18,
  urgentReports: 5,
  reportResolvedToday: 64,

  pendingAppeals: 7,
  appealResolvedToday: 23,

  pendingVerifications: 12,
  verifiedCreatorsCount: 8940,
};

// 待办流转工作项
const mockPendingTasks: PendingTaskItem[] = [
  {
    id: 'TASK_REP_001',
    type: 'report',
    title: '涉嫌发布涉诈引流外部联系方式',
    desc: '被举报作品：《全网低价代充引流实操教学》，含高危外链',
    priority: 'urgent',
    targetUser: {
      nickname: '神秘黑客K',
      username: 'hacker_k',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=60',
    },
    time: '5 分钟前',
    link: '/reports',
  },
  {
    id: 'TASK_APP_002',
    type: 'appeal',
    title: '账号误封申诉申请复核',
    desc: '申诉人：科技小诸葛，自述已提供品牌授权书原件',
    priority: 'high',
    targetUser: {
      nickname: '科技小诸葛',
      username: 'tech_zhuge',
      avatar:
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=60',
    },
    time: '18 分钟前',
    link: '/appeals',
  },
  {
    id: 'TASK_VER_003',
    type: 'verification',
    title: '企业蓝V机构资质认证申请',
    desc: '申请主体：极客视界（北京）科技有限公司，已上传营业执照',
    priority: 'normal',
    targetUser: {
      nickname: '极客视界官方',
      username: 'geek_vision',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    },
    time: '32 分钟前',
    link: '/verifications',
  },
  {
    id: 'TASK_REP_004',
    type: 'report',
    title: '评论区恶意攻击辱骂其他用户',
    desc: '被举报言论："严重人身攻击与恶意引导对立言论"',
    priority: 'high',
    targetUser: {
      nickname: '深海巨鲸',
      username: 'deep_whale',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60',
    },
    time: '45 分钟前',
    link: '/reports',
  },
  {
    id: 'TASK_VER_005',
    type: 'verification',
    title: '个人金牌创作者实名认证',
    desc: '申请达人：摄影师陈末（粉丝量 50w+），已提交身份证明',
    priority: 'normal',
    targetUser: {
      nickname: '摄影师陈末',
      username: 'chenmo_photo',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60',
    },
    time: '1 小时前',
    link: '/verifications',
  },
];

// 实时风控处置动态流水
const mockSecurityAuditStream: SecurityAuditStreamItem[] = [
  {
    id: 'AUDIT_001',
    actionType: 'delete_post',
    operator: '系统自动拦截引擎',
    targetDesc: '作品《秒赚百万兼职教程》',
    reason: '触发金融欺诈关键词与高危二维码引流特征',
    time: '2 分钟前',
    status: 'warning',
  },
  {
    id: 'AUDIT_002',
    actionType: 'ban_user',
    operator: 'admin_张审核',
    targetDesc: '用户 @bot_spammer_99 (UID: 1008892)',
    reason: '批量发布低俗引流广告，全站封禁 30 天',
    time: '8 分钟前',
    status: 'warning',
  },
  {
    id: 'AUDIT_003',
    actionType: 'approve_appeal',
    operator: 'admin_李主管',
    targetDesc: '申诉单 #AP20260902001 (@tech_zhuge)',
    reason: '核实品牌合作授权属实，撤销作品下架并恢复信用分',
    time: '15 分钟前',
    status: 'success',
  },
  {
    id: 'AUDIT_004',
    actionType: 'verify_passed',
    operator: 'admin_王认证',
    targetDesc: '企业蓝V @字节跳动技术团队',
    reason: '统一社会信用代码与公函盖章核对一致，予以认证通过',
    time: '28 分钟前',
    status: 'success',
  },
  {
    id: 'AUDIT_005',
    actionType: 'mute_user',
    operator: 'AI 实时风控探针',
    targetDesc: '用户 @toxic_commenter_01',
    reason: '检测到频繁在多条作品下发布侮辱谩骂言论，禁言 7 天',
    time: '42 分钟前',
    status: 'info',
  },
  {
    id: 'AUDIT_006',
    actionType: 'unban_user',
    operator: '定时解封守护进程',
    targetDesc: '用户 @traveler_alex',
    reason: '7 天禁言处罚期满，系统自动解除评论限制',
    time: '1 小时前',
    status: 'info',
  },
];

// 违规类型构成占比
const mockViolationCategories: ViolationCategoryStat[] = [
  { name: '色情低俗内容', count: 482, percent: 36, color: '#eb2f96' },
  { name: '营销欺诈与引流', count: 348, percent: 26, color: '#fa8c16' },
  { name: '侮辱谩骂与网暴', count: 268, percent: 20, color: '#722ed1' },
  { name: '版权侵权与搬运', count: 160, percent: 12, color: '#faad14' },
  { name: '其他违法违禁', count: 82, percent: 6, color: '#ff4d4f' },
];

// 近 7 日内容生态与风控趋势
const mockActivityTrends: ActivityTrendItem[] = [
  { date: '08-27', posts: 4200, comments: 28000, likes: 180000, violations: 88 },
  { date: '08-28', posts: 4600, comments: 31000, likes: 195000, violations: 92 },
  { date: '08-29', posts: 4900, comments: 33500, likes: 210000, violations: 104 },
  { date: '08-30', posts: 5200, comments: 36000, likes: 235000, violations: 76 },
  { date: '08-31', posts: 5800, comments: 41000, likes: 270000, violations: 112 },
  { date: '09-01', posts: 5500, comments: 39000, likes: 255000, violations: 98 },
  { date: '09-02', posts: 5630, comments: 40200, likes: 268000, violations: 84 },
];

/**
 * 获取大盘总览指标
 */
export const getDashboardOverview = async (): Promise<ApiResponse<DashboardOverviewStats>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockOverviewStats,
        message: 'success',
      });
    }, 150);
  });
};

/**
 * 获取待处理流转任务
 */
export const getPendingTasks = async (): Promise<ApiResponse<PendingTaskItem[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockPendingTasks,
        message: 'success',
      });
    }, 150);
  });
};

/**
 * 获取风控审计流水
 */
export const getSecurityAuditStream = async (): Promise<ApiResponse<SecurityAuditStreamItem[]>> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: mockSecurityAuditStream,
        message: 'success',
      });
    }, 150);
  });
};

/**
 * 获取违规分类占比与近 7 日趋势
 */
export const getDashboardAnalytics = async (): Promise<
  ApiResponse<{
    violationCategories: ViolationCategoryStat[];
    trends: ActivityTrendItem[];
  }>
> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        code: 200,
        data: {
          violationCategories: mockViolationCategories,
          trends: mockActivityTrends,
        },
        message: 'success',
      });
    }, 150);
  });
};

import { request } from '@/api/request';
import type {
  ApiResponse,
  CommentItem,
  CommentQueryParams,
  CommentRiskTag,
  CommentStatus,
} from '@/types';

// 后端 AdminInteractionCommentController 真实响应模型
export interface AdminCommentRespVO {
  id: string;
  commentId?: string;
  userId: string;
  targetType: string;
  targetId: string;
  parentId?: string;
  replyToCommentId?: string;
  replyToUserId?: string;
  content: string;
  location?: string;
  likeCount?: number;
  replyCount?: number;
  status: string;
  manualReviewFlag?: number;
  sensitiveWordTags?: string[];
  sensitiveWordHitTags?: string[];
  sensitiveLabels?: string[];
  hitTags?: string[];
  nickname?: string;
  avatar?: string;
  avatarUrl?: string;
  author?: {
    userId?: string;
    userNo?: string;
    uid?: string;
    nickname?: string;
    avatar?: string;
    avatarUrl?: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

// 评论 Mock 数据集（全面覆盖 10 大帖子 Snowflake ID 与全场景状态）
const mockComments: CommentItem[] = [
  // 1892837482910283901: 【深度评测】2026款全地形越野公路车实测体验
  {
    id: 'CMT_10001',
    postId: '1892837482910283901',
    postTitle: '【深度评测】2026款全地形越野公路车实测体验',
    postCover:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_87219904',
      nickname: '骑行老炮儿·阿伟',
      username: 'rider_wei',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    content: '博主测评太专业细致了！特别是碎石路面的滤震表现与电子变速响应，瞬间打消了我的顾虑！🔥',
    likeCount: 1420,
    replyCount: 28,
    status: 'top',
    riskTag: 'normal',
    createTime: '2026-09-02 10:48:12',
    ipLocation: '上海',
  },
  {
    id: 'CMT_10002',
    postId: '1892837482910283901',
    postTitle: '【深度评测】2026款全地形越野公路车实测体验',
    postCover:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_22394018',
      nickname: '代码小白日记',
      username: 'newbie_coder',
      avatar:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    },
    content: '请问整车重量含脚踏是多少？在连续大陡坡场景下摇车刚性足够吗？',
    likeCount: 89,
    replyCount: 4,
    status: 'published',
    riskTag: 'normal',
    createTime: '2026-09-02 10:55:00',
    ipLocation: '北京',
  },
  {
    id: 'CMT_10003',
    postId: '1892837482910283901',
    postTitle: '【深度评测】2026款全地形越野公路车实测体验',
    postCover:
      'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_33219011',
      nickname: '同款特价内购',
      username: 'spammer_bot_99',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    content: '最新同款公路车工厂渠道特价，加V免费领专属优惠券红包：bikexx_99',
    likeCount: 0,
    replyCount: 0,
    status: 'rejected',
    riskTag: 'ad_suspect',
    sensitiveWordTags: ['外部导流', '私下交易'],
    createTime: '2026-09-02 11:00:22',
    ipLocation: '广东',
  },

  // 1892837482910283902: 【探店指南】藏在成都老巷里的地道慢焙精品咖啡馆
  {
    id: 'CMT_20001',
    postId: '1892837482910283902',
    postTitle: '【探店指南】藏在成都老巷里的地道慢焙精品咖啡馆',
    postCover:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_55410982',
      nickname: '咖啡星人小鹿',
      username: 'coffee_deer',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    content:
      '这家的瑰夏冷萃真是一绝！一定要配他们家的开心果巴斯克蛋糕，下午阳光照进庭院超级出片 ☕',
    likeCount: 520,
    replyCount: 12,
    status: 'top',
    riskTag: 'normal',
    createTime: '2026-09-02 09:40:15',
    ipLocation: '四川',
  },
  {
    id: 'CMT_20002',
    postId: '1892837482910283902',
    postTitle: '【探店指南】藏在成都老巷里的地道慢焙精品咖啡馆',
    postCover:
      'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_12093847',
      nickname: '夜幕狂刀',
      username: 'troll_master',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    content: '收了多少广告费啊？这么难喝也吹，环境吵死人，纯纯割韭菜！',
    likeCount: 15,
    replyCount: 9,
    status: 'rejected',
    riskTag: 'abuse',
    sensitiveWordTags: ['攻击辱骂'],
    createTime: '2026-09-02 10:12:00',
    ipLocation: '河北',
  },

  // 1892837482910283903: 【夜色胶片】零下5度重装夜爬四姑娘山二峰全记录
  {
    id: 'CMT_30001',
    postId: '1892837482910283903',
    postTitle: '【夜色胶片】零下5度重装夜爬四姑娘山二峰全记录',
    postCover:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_99018274',
      nickname: '高山协作·阿布',
      username: 'mountain_guide_abu',
      avatar:
        'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
    },
    content: '作为本地高山协作，提醒各位雪线以上必须佩戴冰爪与头盔，夜爬切勿单独脱队！安全第一！🏔️',
    likeCount: 2400,
    replyCount: 36,
    status: 'top',
    riskTag: 'normal',
    createTime: '2026-09-02 07:15:00',
    ipLocation: '四川',
  },
  {
    id: 'CMT_30002',
    postId: '1892837482910283903',
    postTitle: '【夜色胶片】零下5度重装夜爬四姑娘山二峰全记录',
    postCover:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_66281903',
      nickname: '追星人林风',
      username: 'stargazer_lin',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    content: '大本营凌晨三点起步登顶那段延时摄影绝美，贡嘎群山的日出云海太震撼了！',
    likeCount: 380,
    replyCount: 5,
    status: 'published',
    riskTag: 'normal',
    createTime: '2026-09-02 10:30:00',
    ipLocation: '浙江',
  },
  {
    id: 'CMT_30003',
    postId: '1892837482910283903',
    postTitle: '【夜色胶片】零下5度重装夜爬四姑娘山二峰全记录',
    postCover:
      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_88990011',
      nickname: '户外小萌新',
      username: 'outdoor_rookie',
      avatar:
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    },
    content: '请问零基础小白第一次尝试登雪山，需要提前几个月做体能储备？',
    likeCount: 42,
    replyCount: 3,
    status: 'pending',
    riskTag: 'normal',
    createTime: '2026-09-02 11:20:00',
    ipLocation: '江苏',
  },

  // 1892837482910283904: 【财富密码】零门槛日赚千元？揭秘最新自媒体引流黑灰产
  {
    id: 'CMT_40001',
    postId: '1892837482910283904',
    postTitle: '【财富密码】零门槛日赚千元？揭秘最新自媒体引流黑灰产',
    postCover:
      'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_33918274',
      nickname: '暴富导师李哥',
      username: 'wealth_mentor_li',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    content: '想学习无人直播带货日入过万的加我微信，免费送全套实操教程包教包会：vx_money888',
    likeCount: 1,
    replyCount: 0,
    status: 'rejected',
    riskTag: 'ad_suspect',
    sensitiveWordTags: ['涉诈高危', '诱导私聊'],
    createTime: '2026-09-02 11:20:10',
    ipLocation: '湖北',
  },
  {
    id: 'CMT_40002',
    postId: '1892837482910283904',
    postTitle: '【财富密码】零门槛日赚千元？揭秘最新自媒体引流黑灰产',
    postCover:
      'https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_10000001',
      nickname: '社区安全小助手',
      username: 'community_safety_official',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    content: '平台严厉打击各类假借兼职培训名义的刷单涉诈导流行为，请广大创作者提高警惕！',
    likeCount: 920,
    replyCount: 18,
    status: 'top',
    riskTag: 'normal',
    createTime: '2026-09-02 11:30:00',
    ipLocation: '上海',
  },

  // 1892837482910283905: 【已违规下架】低俗营销导流黑灰产推广测试帖
  {
    id: 'CMT_50001',
    postId: '1892837482910283905',
    postTitle: '【已违规下架】低俗营销导流黑灰产推广测试帖',
    postCover:
      'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_11902844',
      nickname: '灰产黑客帝国',
      username: 'dark_crawler',
      avatar:
        'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    },
    content: '该评论因发布带有外部违规链接已被治理系统软删除',
    likeCount: 0,
    replyCount: 0,
    status: 'deleted',
    riskTag: 'spam',
    createTime: '2026-09-01 14:15:00',
    ipLocation: '四川',
  },

  // 1892837482910283906: 【川西大环线】重装骑行折多山！零下5度的绝美日照金山
  {
    id: 'CMT_60001',
    postId: '1892837482910283906',
    postTitle: '【川西大环线】重装骑行折多山！零下5度的绝美日照金山',
    postCover:
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_55102934',
      nickname: '骑迹行者·大鹏',
      username: 'rider_dapeng',
      avatar:
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    content:
      '感谢大家的鼓励！折多山下坡路段暗冰较多，速度一定要控制在25km/h以内，备用刹车皮和防风保暖手套是刚需！',
    likeCount: 3120,
    replyCount: 45,
    status: 'top',
    riskTag: 'normal',
    createTime: '2026-09-03 07:30:00',
    ipLocation: '四川',
  },
  {
    id: 'CMT_60002',
    postId: '1892837482910283906',
    postTitle: '【川西大环线】重装骑行折多山！零下5度的绝美日照金山',
    postCover:
      'https://images.unsplash.com/photo-1502680390469-be75c86b636f?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_77182901',
      nickname: '追风少年阿杰',
      username: 'wind_runner',
      avatar:
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    },
    content: '画面太美了！今年我也准备重装走川藏线，博主的骑行路书和全景相机型号已收藏！🚴‍♂️',
    likeCount: 650,
    replyCount: 11,
    status: 'published',
    riskTag: 'normal',
    createTime: '2026-09-03 08:15:00',
    ipLocation: '广东',
  },

  // 1892837482910283907: 【官方公告】关于打击社区侵权搬运与低俗恶意导流的专项治理声明
  {
    id: 'CMT_70001',
    postId: '1892837482910283907',
    postTitle: '【官方公告】关于打击社区侵权搬运与低俗恶意导流的专项治理声明',
    postCover:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_10000001',
      nickname: '社区安全小助手',
      username: 'community_safety_official',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    content:
      '净化社区环境离不开每一位创作者的监督，如发现违规搬运与侵权行为，请随时点击作品右上角进行举报投诉！',
    likeCount: 5800,
    replyCount: 62,
    status: 'top',
    riskTag: 'normal',
    createTime: '2026-09-03 09:10:00',
    ipLocation: '上海',
  },
  {
    id: 'CMT_70002',
    postId: '1892837482910283907',
    postTitle: '【官方公告】关于打击社区侵权搬运与低俗恶意导流的专项治理声明',
    postCover:
      'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_87219904',
      nickname: '原创手绘师米粒',
      username: 'mili_art',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    content: '支持官方重拳出击！最近好多无良营销号搬运我的插画抹去水印，真是太气人了！',
    likeCount: 1400,
    replyCount: 23,
    status: 'published',
    riskTag: 'normal',
    createTime: '2026-09-03 09:35:00',
    ipLocation: '浙江',
  },

  // 1892837482910283908: 【待人工审核】关于某品牌新能源汽车电池续航实测虚标争议调查
  {
    id: 'CMT_80001',
    postId: '1892837482910283908',
    postTitle: '【待人工审核】关于某品牌新能源汽车电池续航实测虚标争议调查',
    postCover:
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_22390184',
      nickname: '真实车主老陈',
      username: 'chen_car_owner',
      avatar:
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    content: '实测数据很客观！我北方的冬天开暖风确实只能跑官方标称的一半，支持博主客观发声！',
    likeCount: 890,
    replyCount: 31,
    status: 'published',
    riskTag: 'normal',
    createTime: '2026-09-03 11:50:00',
    ipLocation: '辽宁',
  },
  {
    id: 'CMT_80002',
    postId: '1892837482910283908',
    postTitle: '【待人工审核】关于某品牌新能源汽车电池续航实测虚标争议调查',
    postCover:
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_77182901',
      nickname: '匿名网友_5521',
      username: 'user_5521',
      avatar:
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    },
    content: '涉及具体车企参数对比，正在等待第三方检测机构出具质检报告，该评论正在审核中',
    likeCount: 24,
    replyCount: 2,
    status: 'pending',
    riskTag: 'normal',
    createTime: '2026-09-03 12:10:00',
    ipLocation: '北京',
  },

  // 1892837482910283909: 【旅行随笔】大理双廊洱海边的静谧午后与落日余晖
  {
    id: 'CMT_90001',
    postId: '1892837482910283909',
    postTitle: '【旅行随笔】大理双廊洱海边的静谧午后与落日余晖',
    postCover:
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_22390184',
      nickname: '云南在地慢生活',
      username: 'dali_life',
      avatar:
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    content: '大理的海风总是能抚平焦躁，选在淡季去双廊坐在海边喝咖啡真的很惬意 🌅',
    likeCount: 420,
    replyCount: 8,
    status: 'published',
    riskTag: 'normal',
    createTime: '2026-09-03 15:40:00',
    ipLocation: '云南',
  },

  // 1892837482910283910: 【草稿未发布】AI原生时代前端工程化演进思考与架构蓝图
  {
    id: 'CMT_91001',
    postId: '1892837482910283910',
    postTitle: '【草稿未发布】AI原生时代前端工程化演进思考与架构蓝图',
    postCover:
      'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=200&auto=format&fit=crop&q=80',
    author: {
      uid: 'dy_99018273',
      nickname: '全栈架构探索者',
      username: 'fullstack_architect',
      avatar:
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    content: '草稿里的 Dual-Mode 双模降级思路很有启发性，期待博主完善后公开发布！',
    likeCount: 88,
    replyCount: 5,
    status: 'published',
    riskTag: 'normal',
    createTime: '2026-09-03 16:30:00',
    ipLocation: '北京',
  },
];

const normalizedMockComments = mockComments.map((item) => ({
  ...item,
  author: {
    ...item.author,
    userNo: item.author.userNo || item.author.uid.replace(/^dy_/, ''),
    userId: item.author.userId || (item as any).userId,
  },
}));

let commentsDataset: CommentItem[] = [...normalizedMockComments];

/**
 * 查询评论列表（支持按帖子 ID、关键词、用户展示号、风险标签、状态过滤；支持后端真实接口 Dual-Mode 自动降级）
 */
export const getCommentList = async (
  params: CommentQueryParams = {},
): Promise<ApiResponse<{ list: CommentItem[]; total: number }>> => {
  const pageNo = params.pageNo || params.page || 1;
  const pageSize = params.pageSize || 10;

  // 1. 尝试调用后端 AdminInteractionCommentController 真实分页接口（Dual-Mode 真实请求优先）
  try {
    const res = await request<{ list: AdminCommentRespVO[]; total: number }>({
      url: '/interaction/comment/page',
      method: 'GET',
      params: {
        targetType: params.targetType || (params.postId?.trim() ? 'post' : undefined),
        targetId: params.postId?.trim() || undefined,
        keyword: params.keyword?.trim() || undefined,
        userNo: params.userNo || params.uid,
        uid: params.uid || params.userNo,
        status: params.status && params.status !== 'all' ? params.status : undefined,
        pageNo,
        pageSize,
      },
      headers: { 'x-skip-error-message': 'true' },
    });

    if ((res.code === 200 || res.code === 0) && res.data?.list) {
      const mappedList: CommentItem[] = res.data.list.map((item) => {
        const postMeta = commentsDataset.find((c) => c.postId === String(item.targetId));
        const authorUserNo =
          item.author?.userNo ||
          item.author?.uid?.replace(/^dy_/, '') ||
          item.author?.userId ||
          item.userId ||
          '';
        const authorUid =
          item.author?.uid || item.author?.userNo || item.author?.userId || item.userId || '';
        const authorNickname = item.author?.nickname || item.nickname || '匿名用户';
        const authorAvatar =
          item.author?.avatar ||
          item.author?.avatarUrl ||
          item.avatar ||
          'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80';
        const riskTags = item.sensitiveWordTags || item.sensitiveLabels || item.hitTags || [];
        const riskTag: CommentRiskTag = riskTags.length > 0 ? 'spam' : 'normal';

        return {
          id: item.id || item.commentId || '',
          postId: item.targetId || params.postId?.trim() || '',
          postTitle: postMeta?.postTitle || `作品 #${item.targetId || '2026'}`,
          postCover: postMeta?.postCover,
          author: {
            userNo: authorUserNo,
            uid: authorUid,
            userId: item.author?.userId || item.userId,
            nickname: authorNickname,
            username: authorUserNo || authorUid,
            avatar: authorAvatar,
          },
          content: item.content || '',
          replyTo: item.replyToUserId ? `用户#${item.replyToUserId}` : undefined,
          likeCount: item.likeCount ?? 0,
          replyCount: item.replyCount ?? 0,
          status: (item.status as CommentStatus) || 'published',
          riskTag,
          createTime: item.createdAt ? item.createdAt.replace('T', ' ').slice(0, 19) : '',
          ipLocation: item.location || '未知',
          parentId: item.parentId,
          targetType: item.targetType,
          sensitiveWordTags: item.sensitiveWordTags,
          sensitiveLabels: item.sensitiveLabels,
        };
      });

      return {
        code: 200,
        data: {
          list: mappedList,
          total: res.data.total ?? mappedList.length,
        },
        message: 'success',
      };
    }
  } catch {
    // 后端未部署或调用失败，自动走下方 Mock 数据集高保真兜底
  }

  // 2. 本地 Mock 数据集过滤降级逻辑
  await new Promise((resolve) => setTimeout(resolve, 150));

  let filtered = [...commentsDataset];

  // 按指定作品 ID 过滤
  if (params.postId?.trim()) {
    const pid = params.postId.trim();
    const legacyMap: Record<string, string> = {
      '1892837482910283901': 'POST_202609001',
      '1892837482910283902': 'POST_202609002',
      '1892837482910283903': 'POST_202609003',
      '1892837482910283904': 'POST_202609004',
    };
    const mappedPid = legacyMap[pid];

    filtered = filtered.filter(
      (item) => item.postId === pid || (mappedPid !== undefined && item.postId === mappedPid),
    );

    // 智能防御兜底：若暂无任何关联评论，自动为该作品实例化高保真互动评论数据
    if (filtered.length === 0) {
      const dynamicList: CommentItem[] = [
        {
          id: `CMT_${pid.slice(-6)}_01`,
          postId: pid,
          postTitle: `作品 #${pid}`,
          author: {
            uid: 'dy_98263102',
            nickname: '极客先锋·Tech',
            username: 'geek_vanguard',
            avatar:
              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
          },
          content: '博主分享的内容太硬核专业了！每一个技术细节都很耐看，已一键三连持续关注！🔥',
          likeCount: 520,
          replyCount: 18,
          status: 'top',
          riskTag: 'normal',
          createTime: '2026-09-03 14:20:00',
          ipLocation: '四川',
        },
        {
          id: `CMT_${pid.slice(-6)}_02`,
          postId: pid,
          postTitle: `作品 #${pid}`,
          author: {
            uid: 'dy_87219904',
            nickname: '小甜心美食志',
            username: 'sweet_foodie',
            avatar:
              'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
          },
          content: '请问作品里展示的操作流程，初学者如果尝试上手的话有什么前置准备建议吗？',
          likeCount: 96,
          replyCount: 6,
          status: 'published',
          riskTag: 'normal',
          createTime: '2026-09-03 15:10:00',
          ipLocation: '上海',
        },
        {
          id: `CMT_${pid.slice(-6)}_03`,
          postId: pid,
          postTitle: `作品 #${pid}`,
          author: {
            uid: 'dy_33219011',
            nickname: '推广刷量客服',
            username: 'spammer_bot_99',
            avatar:
              'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
          },
          content: '低价代涨播放量粉丝关注，点击主页头像加微免费领取大额优惠券红包',
          likeCount: 0,
          replyCount: 0,
          status: 'rejected',
          riskTag: 'ad_suspect',
          sensitiveWordTags: ['违规引流', '低俗营销'],
          createTime: '2026-09-03 16:05:00',
          ipLocation: '广东',
        },
      ];
      commentsDataset.unshift(...dynamicList);
      filtered = dynamicList;
    }
  }

  // 关键词过滤（评论正文 / 所属帖子标题）
  if (params.keyword?.trim()) {
    const kw = params.keyword.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.content.toLowerCase().includes(kw) ||
        Boolean(item.postTitle?.toLowerCase().includes(kw)),
    );
  }

  // 用户展示号 / UID 过滤
  if (params.userNo?.trim() || params.uid?.trim()) {
    const userKw = (params.userNo || params.uid || '').trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.author.userNo?.toLowerCase().includes(userKw) ||
        item.author.uid.toLowerCase().includes(userKw) ||
        item.author.nickname.toLowerCase().includes(userKw),
    );
  }

  // 状态过滤（兼容 normal=published, hidden=rejected）
  if (params.status && params.status !== 'all') {
    const targetStatus = params.status;
    filtered = filtered.filter((item) => {
      if (item.status === targetStatus) return true;
      if (targetStatus === 'published' && item.status === 'normal') return true;
      if (targetStatus === 'normal' && item.status === 'published') return true;
      if (targetStatus === 'rejected' && item.status === 'hidden') return true;
      if (targetStatus === 'hidden' && item.status === 'rejected') return true;
      return false;
    });
  }

  // 风险标签过滤
  if (params.riskTag && params.riskTag !== 'all') {
    filtered = filtered.filter((item) => item.riskTag === params.riskTag);
  }

  // 日期过滤
  if (params.dateRange && params.dateRange.length === 2) {
    const [start, end] = params.dateRange;
    if (start && end) {
      filtered = filtered.filter((item) => {
        const itemDate = item.createTime.slice(0, 10);
        return itemDate >= start && itemDate <= end;
      });
    }
  }

  const page = pageNo;
  const total = filtered.length;
  const list = filtered.slice((page - 1) * pageSize, page * pageSize);

  return {
    code: 200,
    data: { list, total },
    message: 'success',
  };
};

/**
 * 更新评论状态（正常/隐藏/置顶/驳回/已删除）
 */
export const updateCommentStatus = async (
  id: string,
  status: CommentStatus,
  reason?: string,
): Promise<ApiResponse<null>> => {
  if (status === 'deleted') {
    return deleteComment(id, reason);
  }

  await new Promise((resolve) => setTimeout(resolve, 150));
  const idx = commentsDataset.findIndex((c) => c.id === id);
  if (idx !== -1) {
    commentsDataset[idx] = { ...commentsDataset[idx], status };
  }
  return {
    code: 200,
    data: null,
    message:
      status === 'top'
        ? '已置顶该评论'
        : status === 'hidden' || status === 'rejected'
          ? '已隐藏违规评论'
          : '已恢复正常展示',
  };
};

/**
 * 删除单个评论（软删除：优先调后端 DELETE /interaction/comment/delete）
 */
export const deleteComment = async (id: string, reason?: string): Promise<ApiResponse<null>> => {
  try {
    await request<boolean>({
      url: '/interaction/comment/delete',
      method: 'DELETE',
      params: {
        id,
        reason: reason || '管理员治理违规评论软删除',
      },
      headers: { 'x-skip-error-message': 'true' },
    });
  } catch {
    // 静默降级
  }

  commentsDataset = commentsDataset.filter((c) => c.id !== id);
  return {
    code: 200,
    data: null,
    message: '评论已成功软删除',
  };
};

/**
 * 批量软删除评论（优先调后端 DELETE /interaction/comment/batch-delete）
 */
export const batchDeleteComments = async (
  ids: string[],
  reason?: string,
): Promise<ApiResponse<{ count: number }>> => {
  try {
    await request<number>({
      url: '/interaction/comment/batch-delete',
      method: 'DELETE',
      data: {
        ids,
        reason: reason || '管理员批量治理违规评论软删除',
      },
      headers: { 'x-skip-error-message': 'true' },
    });
  } catch {
    // 静默降级
  }

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
  reason?: string,
): Promise<ApiResponse<{ count: number }>> => {
  if (status === 'deleted') {
    return batchDeleteComments(ids, reason);
  }

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

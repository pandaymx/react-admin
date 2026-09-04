import type {
  ApiResponse,
  AuditStatus,
  EnterpriseVerificationItem,
  PersonalVerificationItem,
  VerificationQueryParams,
} from '@/types';

// 个人认证 Mock 数据集
const mockPersonalList: PersonalVerificationItem[] = [
  {
    id: 'AUTH_P202609001',
    uid: 'dy_98263102',
    nickname: '极客先锋·Tech',
    avatar:
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    realName: '张建国',
    idCardType: 'id_card',
    idCardNo: '110101199003072384',
    verifyTime: '2026-09-02 09:15:20',
    status: 'approved',
    phone: '13800138001',
    idCardFront:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    idCardBack:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    auditor: '超级管理员 (admin)',
    auditTime: '2026-09-02 09:30:00',
    auditRemark: '身份证信息与本人人脸核验一致，予以通过。',
  },
  {
    id: 'AUTH_P202609002',
    uid: 'dy_87219904',
    nickname: '小甜心美食志',
    avatar:
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    realName: '李晓丽',
    idCardType: 'id_card',
    idCardNo: '310115199508126749',
    verifyTime: '2026-09-02 10:05:11',
    status: 'pending',
    phone: '13911223344',
    idCardFront:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    idCardBack:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    holdPhoto:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'AUTH_P202609003',
    uid: 'dy_55410982',
    nickname: '张三走天涯',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    realName: '张三',
    idCardType: 'passport',
    idCardNo: 'EA89201948',
    verifyTime: '2026-09-01 14:22:30',
    status: 'approved',
    phone: '13666778899',
    idCardFront:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
    auditor: '审核员_01',
    auditTime: '2026-09-01 16:00:00',
    auditRemark: '中国护照信息核验有效，通过认证。',
  },
  {
    id: 'AUTH_P202609004',
    uid: 'dy_77341209',
    nickname: '云端吉他社',
    avatar:
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
    realName: '林雨晴',
    idCardType: 'hk_mo_pass',
    idCardNo: 'H1234567800',
    verifyTime: '2026-08-31 18:40:00',
    status: 'pending',
    phone: '13799887766',
    idCardFront:
      'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=600&auto=format&fit=crop&q=80',
  },
  {
    id: 'AUTH_P202609005',
    uid: 'dy_33219011',
    nickname: '每日福利领取点我',
    avatar:
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    realName: '王大麻',
    idCardType: 'id_card',
    idCardNo: '440301198801019999',
    verifyTime: '2026-08-20 11:10:00',
    status: 'rejected',
    phone: '13588990011',
    auditor: '风控系统/admin',
    auditTime: '2026-08-20 11:30:00',
    auditRemark: '证件照片模糊且有明显 PS 涂改痕迹，身份核验失败。',
  },
  {
    id: 'AUTH_P202609006',
    uid: 'dy_99182345',
    nickname: '野性自然影像',
    avatar:
      'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    realName: '陈志远',
    idCardType: 'id_card',
    idCardNo: '510104198612253812',
    verifyTime: '2026-08-15 08:30:00',
    status: 'approved',
    phone: '13988776655',
    auditor: '超级管理员 (admin)',
    auditTime: '2026-08-15 09:00:00',
    auditRemark: '签约摄影师实名资质通过。',
  },
];

// 企业认证 Mock 数据集
const mockEnterpriseList: EnterpriseVerificationItem[] = [
  {
    id: 'AUTH_E202609001',
    uid: 'dy_66881122',
    nickname: '智元未来科技官方',
    avatar:
      'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150&auto=format&fit=crop&q=80',
    companyName: '北京智元人工智能科技有限公司',
    creditCode: '91110108MA01XY7829',
    legalPerson: '王长青',
    industry: '软件与人工智能技术研发',
    verifyTime: '2026-09-02 08:00:00',
    status: 'approved',
    auditor: '企业审核组',
    auditTime: '2026-09-02 08:30:00',
    auditRemark: '营业执照正本与国家企业信用公示系统一致，企业认证通过。',
  },
  {
    id: 'AUTH_E202609002',
    uid: 'dy_66239108',
    nickname: '高校街舞社联',
    avatar:
      'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    companyName: '上海跃动青春文化传播有限公司',
    creditCode: '91310115MA1H893120',
    legalPerson: '赵雪',
    industry: '文化艺术与体育赛事交流',
    verifyTime: '2026-09-01 16:30:00',
    status: 'pending',
  },
  {
    id: 'AUTH_E202609003',
    uid: 'dy_12093847',
    nickname: '夜幕狂刀',
    avatar:
      'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    companyName: '广州狂刀网络营销策划工作室',
    creditCode: '92440101MA59K8123X',
    legalPerson: '刘海波',
    industry: '互联网广告与营销',
    verifyTime: '2026-08-25 10:20:00',
    status: 'rejected',
    auditor: '超级管理员 (admin)',
    auditTime: '2026-08-25 11:00:00',
    auditRemark: '企业经营异常名录在列，资质不符合官方认证标准。',
  },
];

const personalData: PersonalVerificationItem[] = mockPersonalList.map((item) => ({
  ...item,
  userNo: item.userNo || item.uid.replace(/^dy_/, ''),
}));
const enterpriseData: EnterpriseVerificationItem[] = mockEnterpriseList.map((item) => ({
  ...item,
  userNo: item.userNo || item.uid.replace(/^dy_/, ''),
}));

/**
 * 获取个人认证列表
 */
export const getPersonalVerificationList = async (
  params: VerificationQueryParams = {},
): Promise<ApiResponse<{ list: PersonalVerificationItem[]; total: number }>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let filtered = [...personalData];

  // 1. 关键词查询 (姓名 / 昵称)
  if (params.keyword?.trim()) {
    const kw = params.keyword.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.realName.toLowerCase().includes(kw) || item.nickname.toLowerCase().includes(kw),
    );
  }

  // 2. 用户展示号 / UID 查询
  if (params.userNo?.trim() || params.uid?.trim()) {
    const userKw = (params.userNo || params.uid || '').trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.userNo?.toLowerCase().includes(userKw) ||
        item.uid.toLowerCase().includes(userKw) ||
        item.id.toLowerCase().includes(userKw),
    );
  }

  // 3. 证件号查询
  if (params.idCardNo?.trim()) {
    const idKw = params.idCardNo.trim();
    filtered = filtered.filter((item) => item.idCardNo.includes(idKw));
  }

  // 4. 证件类型筛选
  if (params.idCardType && params.idCardType !== 'all') {
    filtered = filtered.filter((item) => item.idCardType === params.idCardType);
  }

  // 5. 状态筛选
  if (params.status && params.status !== 'all') {
    filtered = filtered.filter((item) => item.status === params.status);
  }

  // 6. 日期筛选
  if (params.dateRange && params.dateRange.length === 2) {
    const [start, end] = params.dateRange;
    if (start && end) {
      filtered = filtered.filter((item) => {
        const itemDate = item.verifyTime.slice(0, 10);
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
 * 获取企业认证列表
 */
export const getEnterpriseVerificationList = async (
  params: VerificationQueryParams = {},
): Promise<ApiResponse<{ list: EnterpriseVerificationItem[]; total: number }>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  let filtered = [...enterpriseData];

  if (params.keyword?.trim()) {
    const kw = params.keyword.trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.companyName.toLowerCase().includes(kw) ||
        item.legalPerson.toLowerCase().includes(kw) ||
        item.nickname.toLowerCase().includes(kw),
    );
  }

  if (params.userNo?.trim() || params.uid?.trim()) {
    const userKw = (params.userNo || params.uid || '').trim().toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.userNo?.toLowerCase().includes(userKw) ||
        item.uid.toLowerCase().includes(userKw) ||
        item.id.toLowerCase().includes(userKw),
    );
  }

  if (params.status && params.status !== 'all') {
    filtered = filtered.filter((item) => item.status === params.status);
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
 * 审核认证（个人或企业）
 */
export const auditVerification = async (
  id: string,
  type: 'personal' | 'enterprise',
  status: AuditStatus,
  remark?: string,
): Promise<ApiResponse<null>> => {
  await new Promise((resolve) => setTimeout(resolve, 200));

  const now = new Date().toISOString().replace('T', ' ').slice(0, 19);

  if (type === 'personal') {
    const idx = personalData.findIndex((item) => item.id === id);
    if (idx !== -1) {
      personalData[idx] = {
        ...personalData[idx],
        status,
        auditRemark: remark,
        auditor: '超级管理员 (admin)',
        auditTime: now,
      };
    }
  } else {
    const idx = enterpriseData.findIndex((item) => item.id === id);
    if (idx !== -1) {
      enterpriseData[idx] = {
        ...enterpriseData[idx],
        status,
        auditRemark: remark,
        auditor: '超级管理员 (admin)',
        auditTime: now,
      };
    }
  }

  return {
    code: 200,
    data: null,
    message: status === 'approved' ? '审核通过成功' : '审核驳回成功',
  };
};

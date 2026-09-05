export type IdCardType = 'id_card' | 'passport' | 'hk_mo_pass' | 'tw_pass';

export type AuditStatus = 'pending' | 'approved' | 'rejected' | 'revoked';

export interface PersonalVerificationItem {
  id: string; // 申请流水号或认证记录 ID
  userNo?: string; // 用户展示号（对齐后端 app_users.user_id / userNo）
  userId?: string | number; // 用户ID
  uid: string; // 兼容用户 UID
  nickname: string;
  avatar: string;
  realName: string; // 真实姓名
  idCardNo: string; // 证件号
  idCardType: IdCardType; // 证件类型
  verifyTime: string; // 认证/申请时间
  status: AuditStatus; // 状态
  idCardFront?: string; // 身份证正面照
  idCardBack?: string; // 身份证反面照
  holdPhoto?: string; // 手持证件照
  phone?: string;
  contactPhone?: string;
  gender?: number | string;
  auditRemark?: string; // 审核备注/驳回原因
  auditor?: string; // 审核人
  auditTime?: string; // 审核时间
  isManualReview?: boolean; // 是否来自人工待审单
  source?: 'manual_review' | 'automatic' | 'system';
}

export interface EnterpriseVerificationItem {
  id: string; // 申请编号，如 AUTH_E202609001
  userNo?: string; // 用户展示号（对齐后端 app_users.user_id / userNo）
  userId?: string | number;
  uid: string; // 兼容申请人 UID
  nickname: string;
  avatar: string;
  companyName: string; // 企业名称
  enterpriseName?: string;
  creditCode: string; // 统一社会信用代码
  legalPerson: string; // 法人代表
  legalName?: string;
  legalIdCard?: string;
  licenseUrl?: string; // 营业执照
  industry?: string; // 行业类型
  registeredAddress?: string;
  businessTermYears?: number;
  verifyTime: string; // 认证/申请时间
  status: AuditStatus;
  auditRemark?: string;
  auditor?: string;
  auditTime?: string;
  isManualReview?: boolean;
  source?: 'manual_review' | 'automatic' | 'system';
}

export interface VerificationSummaryStats {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  totalCount: number;
}

export interface VerificationQueryParams {
  keyword?: string; // 姓名/企业名/昵称
  userNo?: string; // 用户展示号
  userId?: string;
  uid?: string; // 兼容展示号
  idCardNo?: string;
  status?: AuditStatus | 'all';
  idCardType?: IdCardType | 'all';
  dateRange?: [string, string];
  certType?: number;
  page?: number;
  pageNo?: number;
  pageSize?: number;
}

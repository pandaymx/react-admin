export type IdCardType = 'id_card' | 'passport' | 'hk_mo_pass' | 'tw_pass';

export type AuditStatus = 'pending' | 'approved' | 'rejected' | 'revoked';

export interface PersonalVerificationItem {
  id: string; // 申请流水号，如 AUTH_P202609001
  uid: string; // 用户 UID
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
  auditRemark?: string; // 审核备注/驳回原因
  auditor?: string; // 审核人
  auditTime?: string; // 审核时间
}

export interface EnterpriseVerificationItem {
  id: string; // 申请编号，如 AUTH_E202609001
  uid: string; // 申请人 UID
  nickname: string;
  avatar: string;
  companyName: string; // 企业名称
  creditCode: string; // 统一社会信用代码
  legalPerson: string; // 法人代表
  licenseUrl?: string; // 营业执照
  industry?: string; // 行业类型
  verifyTime: string; // 认证/申请时间
  status: AuditStatus;
  auditRemark?: string;
  auditor?: string;
  auditTime?: string;
}

export interface VerificationQueryParams {
  keyword?: string; // 姓名/企业名/昵称
  uid?: string;
  idCardNo?: string;
  status?: AuditStatus | 'all';
  idCardType?: IdCardType | 'all';
  dateRange?: [string, string];
  page?: number;
  pageSize?: number;
}

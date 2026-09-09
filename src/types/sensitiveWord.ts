/**
 * 敏感词管理相关数据类型定义
 */

export type SensitiveWordStatus = 0 | 1; // 0: 启用/开启, 1: 禁用/关闭

/**
 * 敏感词前端展示与数据模型
 */
export interface SensitiveWordItem {
  id: number;
  name: string; // 敏感词
  tags: string[]; // 标签数组，例如 ['政治', '广告', '色情', '辱骂']
  status: number; // 0: 开启, 1: 关闭
  description?: string; // 备注说明
  createTime: string; // 创建时间
}

/**
 * 敏感词列表分页查询请求参数
 */
export interface SensitiveWordQueryParams {
  name?: string;
  tag?: string;
  status?: number | string;
  createTime?: [string, string] | string[];
  pageNo?: number;
  pageSize?: number;
}

/**
 * 敏感词保存（新增/编辑）参数
 */
export interface SensitiveWordSaveReqVO {
  id?: number;
  name: string;
  tags: string[];
  status: number;
  description?: string;
}

/**
 * 在线敏感词文本校验测试请求
 */
export interface SensitiveWordTestReqVO {
  text: string;
  tags?: string[];
}

/**
 * 在线敏感词文本校验测试响应
 */
export interface SensitiveWordTestRespVO {
  sensitiveWords: string[]; // 命中敏感词列表
  replacedText: string; // 脱敏替换后文本
  hasSensitive: boolean; // 是否存在敏感词
}

/**
 * 敏感词综合统计指标
 */
export interface SensitiveWordStats {
  totalCount: number; // 词库总量
  enabledCount: number; // 生效中
  disabledCount: number; // 停用中
  tagCount: number; // 覆盖标签分类数
}

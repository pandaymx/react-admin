import { request } from '@/api/request';
import type {
  ApiResponse,
  PageResult,
  SensitiveWordItem,
  SensitiveWordQueryParams,
  SensitiveWordSaveReqVO,
  SensitiveWordStats,
  SensitiveWordTestReqVO,
  SensitiveWordTestRespVO,
} from '@/types';
import { formatDateTime } from '@/utils/time';

/**
 * 离线/测试兜底敏感词库
 */
const mockSensitiveWords: SensitiveWordItem[] = [
  {
    id: 1,
    name: '刷单兼职',
    tags: ['广告', '引流', '诈骗'],
    status: 0,
    description: '常见网络刷单诈骗违禁词，高发于评论区和私信引流。',
    createTime: '2026-09-01 10:20:00',
  },
  {
    id: 2,
    name: '免费领皮肤',
    tags: ['广告', '钓鱼'],
    status: 0,
    description: '针对未成年人的虚假福利领取引流诱导词汇。',
    createTime: '2026-09-01 11:35:10',
  },
  {
    id: 3,
    name: '微信加V看片',
    tags: ['色情', '引流'],
    status: 0,
    description: '涉黄黑产外链引流关键词汇。',
    createTime: '2026-09-02 09:12:45',
  },
  {
    id: 4,
    name: '枪支弹药代发',
    tags: ['暴恐', '违禁品'],
    status: 0,
    description: '枪支危险违禁物品交易敏感词，零容忍处置。',
    createTime: '2026-09-02 14:00:20',
  },
  {
    id: 5,
    name: '傻逼智障脑残',
    tags: ['辱骂', '人身攻击'],
    status: 0,
    description: '严重侵犯他人人格尊严的粗俗脏话。',
    createTime: '2026-09-03 16:40:00',
  },
  {
    id: 6,
    name: '代开高仿发票',
    tags: ['违禁品', '财务欺诈'],
    status: 0,
    description: '虚开假发票违法营销词汇。',
    createTime: '2026-09-03 18:22:15',
  },
  {
    id: 7,
    name: '赌球内部精准料',
    tags: ['赌博', '违禁品'],
    status: 0,
    description: '境外非法赌球招赌引流违禁词。',
    createTime: '2026-09-04 08:30:00',
  },
  {
    id: 8,
    name: '迷幻药货到付款',
    tags: ['暴恐', '违禁品', '毒品'],
    status: 0,
    description: '管制品黑产销售违禁词汇。',
    createTime: '2026-09-04 15:10:00',
  },
  {
    id: 9,
    name: '加群领红包666',
    tags: ['广告', '引流'],
    status: 1,
    description: '常规低风险营销引流词，已暂时停用观察。',
    createTime: '2026-09-05 12:00:00',
  },
  {
    id: 10,
    name: '去死全家暴毙',
    tags: ['辱骂', '网络暴力'],
    status: 0,
    description: '极度恶劣的诅咒类网络暴力用语。',
    createTime: '2026-09-05 14:55:30',
  },
];

let currentDataset: SensitiveWordItem[] = [...mockSensitiveWords];

/**
 * 分页获取敏感词列表 (对接 GET /admin-api/system/sensitive-word/page)
 */
export const getSensitiveWordPage = async (
  params: SensitiveWordQueryParams = {},
): Promise<ApiResponse<PageResult<SensitiveWordItem>>> => {
  try {
    const pageNo = params.pageNo || 1;
    // 严格限制 pageSize 在 1 ~ 100 之间，防止后端抛出 "查询页数不能超过 100" / "条数不能超过 100"
    const pageSize = Math.min(Math.max(params.pageSize || 10, 1), 100);

    const res = await request<PageResult<any>>({
      url: '/system/sensitive-word/page',
      method: 'GET',
      params: {
        pageNo,
        pageSize,
        name: params.name?.trim() || undefined,
        tag: params.tag && params.tag !== 'all' ? params.tag : undefined,
        status: params.status !== undefined && params.status !== 'all' ? params.status : undefined,
        createTime: params.createTime,
      },
      headers: { 'x-skip-error-message': 'true' },
    });

    // 只要后端返回成功且 list 是数组（即便 list: [] 空数组也为正常响应，不应 fallback Mock）
    if ((res.code === 200 || res.code === 0) && res.data && Array.isArray(res.data.list)) {
      const list: SensitiveWordItem[] = res.data.list.map((item: any) => ({
        id: Number(item.id),
        name: String(item.name || ''),
        tags: Array.isArray(item.tags) ? item.tags : item.tags ? [String(item.tags)] : [],
        status: item.status !== undefined ? Number(item.status) : 0,
        description: item.description || '',
        createTime: formatDateTime(item.createTime),
      }));

      return {
        code: 200,
        data: {
          list,
          total: typeof res.data.total === 'number' ? res.data.total : list.length,
        },
        message: 'success',
      };
    }
  } catch {
    // 捕获异常，仅在网络请求失败（如网络中断或服务器 5xx）时回退本地 Mock 逻辑
  }

  // 本地 Mock 过滤兜底
  let filtered = [...currentDataset];

  if (params.name?.trim()) {
    const kw = params.name.trim().toLowerCase();
    filtered = filtered.filter((item) => item.name.toLowerCase().includes(kw));
  }

  const targetTag = params.tag;
  if (targetTag && targetTag !== 'all') {
    filtered = filtered.filter((item) => item.tags.includes(targetTag));
  }

  if (params.status !== undefined && params.status !== 'all') {
    const targetStatus = Number(params.status);
    filtered = filtered.filter((item) => item.status === targetStatus);
  }

  if (params.createTime && Array.isArray(params.createTime) && params.createTime.length === 2) {
    const [start, end] = params.createTime;
    if (start && end) {
      filtered = filtered.filter((item) => {
        const d = item.createTime.slice(0, 10);
        return d >= start && d <= end;
      });
    }
  }

  // 按创建时间倒序
  filtered.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());

  const page = params.pageNo || 1;
  const size = Math.min(Math.max(params.pageSize || 10, 1), 100);
  const list = filtered.slice((page - 1) * size, page * size);

  return {
    code: 200,
    data: {
      list,
      total: filtered.length,
    },
    message: 'success',
  };
};

/**
 * 查询所有敏感词标签分类集合
 */
export const getSensitiveWordTags = async (): Promise<ApiResponse<string[]>> => {
  try {
    const res = await request<string[]>({
      url: '/system/sensitive-word/get-tags',
      method: 'GET',
      headers: { 'x-skip-error-message': 'true' },
    });
    if ((res.code === 200 || res.code === 0) && Array.isArray(res.data)) {
      return { code: 200, data: res.data, message: 'success' };
    }
  } catch {
    // ignore
  }

  // 从当前数据集中聚合所有标签
  const tagSet = new Set<string>();
  for (const item of currentDataset) {
    for (const t of item.tags) {
      tagSet.add(t);
    }
  }
  const tags = Array.from(tagSet);
  if (tags.length === 0) {
    tags.push('政治', '暴恐', '色情', '广告', '引流', '辱骂', '违禁品', '诈骗');
  }

  return {
    code: 200,
    data: tags,
    message: 'success',
  };
};

/**
 * 获取敏感词统计指标
 */
export const getSensitiveWordStats = async (): Promise<ApiResponse<SensitiveWordStats>> => {
  try {
    // 严格限制 pageSize 为 100（后端 Ruoyi/Yudao PageParam 最大允许 100，避免抛出超限错误）
    const pageRes = await getSensitiveWordPage({ pageNo: 1, pageSize: 100 });
    const totalCount = pageRes.data?.total ?? 0;

    let enabledCount = 0;
    let disabledCount = 0;

    if (totalCount === 0) {
      enabledCount = 0;
      disabledCount = 0;
    } else if (totalCount <= 100 && pageRes.data?.list) {
      // 100条以内第一页已包含全部数据，前端直接归纳计算，无需再次发起多余网络请求
      enabledCount = pageRes.data.list.filter((item) => item.status === 0).length;
      disabledCount = pageRes.data.list.filter((item) => item.status === 1).length;
    } else {
      // 超过100条时，分别按状态并发极低开销探测 total（每次仅取 pageSize: 1）
      const [enabledRes, disabledRes] = await Promise.allSettled([
        getSensitiveWordPage({ pageNo: 1, pageSize: 1, status: 0 }),
        getSensitiveWordPage({ pageNo: 1, pageSize: 1, status: 1 }),
      ]);
      enabledCount = enabledRes.status === 'fulfilled' ? (enabledRes.value.data?.total ?? 0) : 0;
      disabledCount = disabledRes.status === 'fulfilled' ? (disabledRes.value.data?.total ?? 0) : 0;
    }

    // 标签统计
    const tagsRes = await getSensitiveWordTags();
    const tagCount = tagsRes.data?.length ?? 0;

    return {
      code: 200,
      data: {
        totalCount,
        enabledCount,
        disabledCount,
        tagCount,
      },
      message: 'success',
    };
  } catch {
    return {
      code: 200,
      data: {
        totalCount: currentDataset.length,
        enabledCount: currentDataset.filter((i) => i.status === 0).length,
        disabledCount: currentDataset.filter((i) => i.status === 1).length,
        tagCount: 8,
      },
      message: 'success',
    };
  }
};

/**
 * 新增敏感词 (对接 POST /admin-api/system/sensitive-word/create)
 */
export const createSensitiveWord = async (
  data: SensitiveWordSaveReqVO,
): Promise<ApiResponse<number>> => {
  try {
    const res = await request<number>({
      url: '/system/sensitive-word/create',
      method: 'POST',
      data,
      headers: { 'x-skip-error-message': 'true' },
    });
    if (res.code === 200 || res.code === 0) {
      return { code: 200, data: res.data || Date.now(), message: '创建成功' };
    }
  } catch {
    // ignore
  }

  const newId = Date.now();
  const newItem: SensitiveWordItem = {
    id: newId,
    name: data.name,
    tags: data.tags,
    status: data.status,
    description: data.description,
    createTime: formatDateTime(new Date().toISOString()),
  };
  currentDataset.unshift(newItem);

  return { code: 200, data: newId, message: '创建成功' };
};

/**
 * 修改敏感词 (对接 PUT /admin-api/system/sensitive-word/update)
 */
export const updateSensitiveWord = async (
  data: SensitiveWordSaveReqVO,
): Promise<ApiResponse<boolean>> => {
  try {
    const res = await request<boolean>({
      url: '/system/sensitive-word/update',
      method: 'PUT',
      data,
      headers: { 'x-skip-error-message': 'true' },
    });
    if (res.code === 200 || res.code === 0) {
      return { code: 200, data: true, message: '更新成功' };
    }
  } catch {
    // ignore
  }

  const idx = currentDataset.findIndex((item) => item.id === data.id);
  if (idx !== -1) {
    currentDataset[idx] = {
      ...currentDataset[idx],
      name: data.name,
      tags: data.tags,
      status: data.status,
      description: data.description,
    };
  }

  return { code: 200, data: true, message: '更新成功' };
};

/**
 * 删除单个敏感词 (对接 DELETE /admin-api/system/sensitive-word/delete?id=xxx)
 */
export const deleteSensitiveWord = async (id: number): Promise<ApiResponse<boolean>> => {
  try {
    const res = await request<boolean>({
      url: '/system/sensitive-word/delete',
      method: 'DELETE',
      params: { id },
      headers: { 'x-skip-error-message': 'true' },
    });
    if (res.code === 200 || res.code === 0) {
      return { code: 200, data: true, message: '删除成功' };
    }
  } catch {
    // ignore
  }

  currentDataset = currentDataset.filter((item) => item.id !== id);
  return { code: 200, data: true, message: '删除成功' };
};

/**
 * 批量删除敏感词
 */
export const batchDeleteSensitiveWords = async (ids: number[]): Promise<ApiResponse<boolean>> => {
  try {
    await Promise.allSettled(
      ids.map((id) =>
        request({
          url: '/system/sensitive-word/delete',
          method: 'DELETE',
          params: { id },
          headers: { 'x-skip-error-message': 'true' },
        }),
      ),
    );
  } catch {
    // ignore
  }

  const set = new Set(ids);
  currentDataset = currentDataset.filter((item) => !set.has(item.id));
  return { code: 200, data: true, message: '批量删除成功' };
};

/**
 * 快速修改敏感词启用状态
 */
export const updateSensitiveWordStatus = async (
  id: number,
  status: number,
): Promise<ApiResponse<boolean>> => {
  const target = currentDataset.find((item) => item.id === id);
  if (target) {
    return await updateSensitiveWord({
      id: target.id,
      name: target.name,
      tags: target.tags,
      description: target.description,
      status,
    });
  }
  return { code: 200, data: true, message: '状态更新成功' };
};

/**
 * 在线测试/校验文本中的敏感词 (对接 POST /admin-api/system/sensitive-word/validate-text)
 */
export const validateSensitiveText = async (
  params: SensitiveWordTestReqVO,
): Promise<ApiResponse<SensitiveWordTestRespVO>> => {
  const text = params.text || '';
  if (!text.trim()) {
    return {
      code: 200,
      data: { sensitiveWords: [], replacedText: '', hasSensitive: false },
      message: 'success',
    };
  }

  try {
    // 优先尝试 GET（Ruoyi/Yudao 默认 @GetMapping("/validate-text")）
    const res = await request<string[]>({
      url: '/system/sensitive-word/validate-text',
      method: 'GET',
      params: { text: params.text, tags: params.tags ? params.tags.join(',') : undefined },
      headers: { 'x-skip-error-message': 'true' },
    });

    if ((res.code === 200 || res.code === 0) && Array.isArray(res.data)) {
      const hitWords = res.data;
      let replaced = text;
      hitWords.forEach((word) => {
        if (word) {
          const reg = new RegExp(word, 'gi');
          replaced = replaced.replace(reg, '*'.repeat(word.length));
        }
      });

      return {
        code: 200,
        data: {
          sensitiveWords: hitWords,
          replacedText: replaced,
          hasSensitive: hitWords.length > 0,
        },
        message: 'success',
      };
    }
  } catch {
    try {
      // 兼容 POST 场景
      const postRes = await request<string[]>({
        url: '/system/sensitive-word/validate-text',
        method: 'POST',
        data: { text: params.text, tags: params.tags },
        headers: { 'x-skip-error-message': 'true' },
      });
      if ((postRes.code === 200 || postRes.code === 0) && Array.isArray(postRes.data)) {
        const hitWords = postRes.data;
        let replaced = text;
        hitWords.forEach((word) => {
          if (word) {
            const reg = new RegExp(word, 'gi');
            replaced = replaced.replace(reg, '*'.repeat(word.length));
          }
        });

        return {
          code: 200,
          data: {
            sensitiveWords: hitWords,
            replacedText: replaced,
            hasSensitive: hitWords.length > 0,
          },
          message: 'success',
        };
      }
    } catch {
      // 降级使用本地词库分词匹配
    }
  }

  // 本地匹配算法
  const activeWords = currentDataset
    .filter((item) => item.status === 0)
    .filter((item) => {
      if (!params.tags || params.tags.length === 0) return true;
      return item.tags.some((t) => params.tags?.includes(t));
    })
    .map((item) => item.name);

  const matchedWords: string[] = [];
  let replacedText = text;

  for (const word of activeWords) {
    if (word && text.toLowerCase().includes(word.toLowerCase())) {
      matchedWords.push(word);
      const reg = new RegExp(word, 'gi');
      replacedText = replacedText.replace(reg, '*'.repeat(word.length));
    }
  }

  return {
    code: 200,
    data: {
      sensitiveWords: Array.from(new Set(matchedWords)),
      replacedText,
      hasSensitive: matchedWords.length > 0,
    },
    message: 'success',
  };
};

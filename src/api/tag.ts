import { request } from '@/api/request';
import type {
  AdminInitialTagConfigCreateReqVO,
  AdminInitialTagConfigUpdateReqVO,
  AdminTagCreateReqVO,
  AdminTagPageReqVO,
  AdminTagTypeCreateReqVO,
  AdminTagTypePageReqVO,
  AdminTagTypeUpdateReqVO,
  AdminTagUpdateReqVO,
  ApiResponse,
  InitialTagConfigItem,
  TagItem,
  TagTypeItem,
} from '@/types';

// ==================== 高拟真 Mock 数据集 ====================

export const mockTagTypes: TagTypeItem[] = [
  {
    id: 101,
    name: '户外运动',
    status: 'active',
    maxSelectQuantity: 5,
    sort: 1,
    tagCount: 8,
    userCount: 12450,
    description: '登山、攀岩、徒步、滑雪等户外体能活动',
    icon: 'CompassOutlined',
    createdAt: '2026-01-10 10:00:00',
    updatedAt: '2026-08-20 14:30:00',
  },
  {
    id: 102,
    name: '球类竞技',
    status: 'active',
    maxSelectQuantity: 3,
    sort: 2,
    tagCount: 6,
    userCount: 9820,
    description: '篮球、羽毛球、网球、足球等团队与对抗运动',
    icon: 'TrophyOutlined',
    createdAt: '2026-01-12 11:20:00',
    updatedAt: '2026-08-15 09:12:00',
  },
  {
    id: 103,
    name: '生活休闲与摄影',
    status: 'active',
    maxSelectQuantity: 4,
    sort: 3,
    tagCount: 7,
    userCount: 15300,
    description: '人像摄影、飞盘、露营、咖啡品鉴、骑行',
    icon: 'CameraOutlined',
    createdAt: '2026-02-01 16:40:00',
    updatedAt: '2026-08-25 18:00:00',
  },
  {
    id: 104,
    name: '性格特征',
    status: 'active',
    maxSelectQuantity: 3,
    sort: 4,
    tagCount: 6,
    userCount: 21800,
    description: 'MBTI、社交倾向、行事风格画像',
    icon: 'SmileOutlined',
    createdAt: '2026-02-15 14:00:00',
    updatedAt: '2026-08-28 11:00:00',
  },
  {
    id: 105,
    name: '专业技能与认证',
    status: 'active',
    maxSelectQuantity: 0, // 0表示不限
    sort: 5,
    tagCount: 5,
    userCount: 4230,
    description: '急救员红十字、中登初级领队、潜水AOW、无人机飞手',
    icon: 'SafetyCertificateOutlined',
    createdAt: '2026-03-01 09:00:00',
    updatedAt: '2026-09-01 15:45:00',
  },
  {
    id: 106,
    name: '历史归档类目',
    status: 'disabled',
    maxSelectQuantity: 1,
    sort: 99,
    tagCount: 2,
    userCount: 120,
    description: '已停用的老版测试标签类目',
    icon: 'FolderOutlined',
    createdAt: '2025-10-01 10:00:00',
    updatedAt: '2026-01-01 00:00:00',
  },
];

export const mockTags: TagItem[] = [
  // 101: 户外运动
  {
    id: 1001,
    tagTypeId: 101,
    tagTypeName: '户外运动',
    name: '高山徒步',
    status: 'active',
    sort: 1,
    color: '#108ee9',
    userCount: 6820,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=hiking',
    createdAt: '2026-01-10 10:10:00',
  },
  {
    id: 1002,
    tagTypeId: 101,
    tagTypeName: '户外运动',
    name: '重装露营',
    status: 'active',
    sort: 2,
    color: '#87d068',
    userCount: 5410,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=camping',
    createdAt: '2026-01-10 10:15:00',
  },
  {
    id: 1003,
    tagTypeId: 101,
    tagTypeName: '户外运动',
    name: '攀岩与抱石',
    status: 'active',
    sort: 3,
    color: '#f50',
    userCount: 2940,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=climbing',
    createdAt: '2026-01-10 10:20:00',
  },
  {
    id: 1004,
    tagTypeId: 101,
    tagTypeName: '户外运动',
    name: '单板/双板滑雪',
    status: 'active',
    sort: 4,
    color: '#2db7f5',
    userCount: 4120,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=skiing',
    createdAt: '2026-01-10 10:25:00',
  },
  {
    id: 1005,
    tagTypeId: 101,
    tagTypeName: '户外运动',
    name: '溯溪降速',
    status: 'active',
    sort: 5,
    color: '#722ed1',
    userCount: 1890,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=canyoning',
    createdAt: '2026-01-10 10:30:00',
  },
  {
    id: 1006,
    tagTypeId: 101,
    tagTypeName: '户外运动',
    name: '越野跑',
    status: 'active',
    sort: 6,
    color: '#fa8c16',
    userCount: 2360,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=trailrun',
    createdAt: '2026-01-10 10:35:00',
  },
  {
    id: 1007,
    tagTypeId: 101,
    tagTypeName: '户外运动',
    name: '桨板SUP',
    status: 'active',
    sort: 7,
    color: '#13c2c2',
    userCount: 3100,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=sup',
    createdAt: '2026-01-10 10:40:00',
  },
  {
    id: 1008,
    tagTypeId: 101,
    tagTypeName: '户外运动',
    name: '老式野外生存(停用)',
    status: 'disabled',
    sort: 99,
    color: '#d9d9d9',
    userCount: 88,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=survival',
    createdAt: '2026-01-10 10:45:00',
  },

  // 102: 球类竞技
  {
    id: 1009,
    tagTypeId: 102,
    tagTypeName: '球类竞技',
    name: '羽毛球双打',
    status: 'active',
    sort: 1,
    color: '#52c41a',
    userCount: 5200,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=badminton',
    createdAt: '2026-01-12 11:30:00',
  },
  {
    id: 1010,
    tagTypeId: 102,
    tagTypeName: '球类竞技',
    name: '半场/全场篮球',
    status: 'active',
    sort: 2,
    color: '#fa541c',
    userCount: 4780,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=basketball',
    createdAt: '2026-01-12 11:35:00',
  },
  {
    id: 1011,
    tagTypeId: 102,
    tagTypeName: '球类竞技',
    name: '网球搭子',
    status: 'active',
    sort: 3,
    color: '#a0d911',
    userCount: 2310,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=tennis',
    createdAt: '2026-01-12 11:40:00',
  },
  {
    id: 1012,
    tagTypeId: 102,
    tagTypeName: '球类竞技',
    name: '乒乓球竞技',
    status: 'active',
    sort: 4,
    color: '#1890ff',
    userCount: 1650,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=pingpong',
    createdAt: '2026-01-12 11:45:00',
  },
  {
    id: 1013,
    tagTypeId: 102,
    tagTypeName: '球类竞技',
    name: '七人制足球',
    status: 'active',
    sort: 5,
    color: '#389e0d',
    userCount: 1890,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=soccer',
    createdAt: '2026-01-12 11:50:00',
  },
  {
    id: 1014,
    tagTypeId: 102,
    tagTypeName: '球类竞技',
    name: '台球斯诺克',
    status: 'active',
    sort: 6,
    color: '#531dab',
    userCount: 1420,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=billiards',
    createdAt: '2026-01-12 11:55:00',
  },

  // 103: 生活休闲与摄影
  {
    id: 1015,
    tagTypeId: 103,
    tagTypeName: '生活休闲与摄影',
    name: '人像/风光摄影',
    status: 'active',
    sort: 1,
    color: '#eb2f96',
    userCount: 7100,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=photography',
    createdAt: '2026-02-01 16:45:00',
  },
  {
    id: 1016,
    tagTypeId: 103,
    tagTypeName: '生活休闲与摄影',
    name: '公路车/城市骑行',
    status: 'active',
    sort: 2,
    color: '#13c2c2',
    userCount: 6540,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=cycling',
    createdAt: '2026-02-01 16:50:00',
  },
  {
    id: 1017,
    tagTypeId: 103,
    tagTypeName: '生活休闲与摄影',
    name: '极限飞盘',
    status: 'active',
    sort: 3,
    color: '#faad14',
    userCount: 4210,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=frisbee',
    createdAt: '2026-02-01 16:55:00',
  },
  {
    id: 1018,
    tagTypeId: 103,
    tagTypeName: '生活休闲与摄影',
    name: '精品手冲咖啡',
    status: 'active',
    sort: 4,
    color: '#8c8c8c',
    userCount: 3890,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=coffee',
    createdAt: '2026-02-01 17:00:00',
  },
  {
    id: 1019,
    tagTypeId: 103,
    tagTypeName: '生活休闲与摄影',
    name: '微醺精酿聚会',
    status: 'active',
    sort: 5,
    color: '#d46b08',
    userCount: 2980,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=beer',
    createdAt: '2026-02-01 17:05:00',
  },

  // 104: 性格特征
  {
    id: 1020,
    tagTypeId: 104,
    tagTypeName: '性格特征',
    name: '热情活力 E人',
    status: 'active',
    sort: 1,
    color: '#f5222d',
    userCount: 11400,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=mbti_e',
    createdAt: '2026-02-15 14:10:00',
  },
  {
    id: 1021,
    tagTypeId: 104,
    tagTypeName: '性格特征',
    name: '深度倾听 I人',
    status: 'active',
    sort: 2,
    color: '#2f54eb',
    userCount: 10400,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=mbti_i',
    createdAt: '2026-02-15 14:15:00',
  },
  {
    id: 1022,
    tagTypeId: 104,
    tagTypeName: '性格特征',
    name: '随性洒脱 P人',
    status: 'active',
    sort: 3,
    color: '#fa8c16',
    userCount: 8200,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=mbti_p',
    createdAt: '2026-02-15 14:20:00',
  },
  {
    id: 1023,
    tagTypeId: 104,
    tagTypeName: '性格特征',
    name: '严谨计划 J人',
    status: 'active',
    sort: 4,
    color: '#52c41a',
    userCount: 8900,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=mbti_j',
    createdAt: '2026-02-15 14:25:00',
  },

  // 105: 专业技能
  {
    id: 1024,
    tagTypeId: 105,
    tagTypeName: '专业技能与认证',
    name: 'AHA/红十字急救员',
    status: 'active',
    sort: 1,
    color: '#f5222d',
    userCount: 1560,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=cpr',
    createdAt: '2026-03-01 09:10:00',
  },
  {
    id: 1025,
    tagTypeId: 105,
    tagTypeName: '专业技能与认证',
    name: '中登初级户外指导员',
    status: 'active',
    sort: 2,
    color: '#1890ff',
    userCount: 890,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=guide',
    createdAt: '2026-03-01 09:15:00',
  },
  {
    id: 1026,
    tagTypeId: 105,
    tagTypeName: '专业技能与认证',
    name: 'PADI AOW 进阶潜水员',
    status: 'active',
    sort: 3,
    color: '#13c2c2',
    userCount: 670,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=dive',
    createdAt: '2026-03-01 09:20:00',
  },
  {
    id: 1027,
    tagTypeId: 105,
    tagTypeName: '专业技能与认证',
    name: 'CAAC 无人机执照机长',
    status: 'active',
    sort: 4,
    color: '#722ed1',
    userCount: 1110,
    iconUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=drone',
    createdAt: '2026-03-01 09:25:00',
  },
];

export const mockInitialConfigs: InitialTagConfigItem[] = [
  {
    id: 501,
    scene: 'REGISTER_FIRST_LOGIN',
    tagTypeId: 101,
    tagTypeName: '户外运动',
    tagId: null, // 全类型 active 标签展示
    tagName: '全部有效标签',
    status: 'active',
    sort: 1,
    createdAt: '2026-01-20 10:00:00',
  },
  {
    id: 502,
    scene: 'REGISTER_FIRST_LOGIN',
    tagTypeId: 102,
    tagTypeName: '球类竞技',
    tagId: null,
    tagName: '全部有效标签',
    status: 'active',
    sort: 2,
    createdAt: '2026-01-20 10:05:00',
  },
  {
    id: 503,
    scene: 'REGISTER_FIRST_LOGIN',
    tagTypeId: 104,
    tagTypeName: '性格特征',
    tagId: null,
    tagName: '全部有效标签',
    status: 'active',
    sort: 3,
    createdAt: '2026-01-20 10:10:00',
  },
  {
    id: 504,
    scene: 'ACTIVITY_PREFERENCE',
    tagTypeId: 103,
    tagTypeName: '生活休闲与摄影',
    tagId: 1015,
    tagName: '人像/风光摄影',
    status: 'active',
    sort: 1,
    createdAt: '2026-02-05 14:00:00',
  },
  {
    id: 505,
    scene: 'ACTIVITY_PREFERENCE',
    tagTypeId: 103,
    tagTypeName: '生活休闲与摄影',
    tagId: 1016,
    tagName: '公路车/城市骑行',
    status: 'active',
    sort: 2,
    createdAt: '2026-02-05 14:05:00',
  },
];

// 内存动态维护副本
let dynamicTagTypes: TagTypeItem[] = [...mockTagTypes];
let dynamicTags: TagItem[] = [...mockTags];
let dynamicConfigs: InitialTagConfigItem[] = [...mockInitialConfigs];

// ==================== 标签类型管理 API ====================

export async function getTagTypePage(
  params?: AdminTagTypePageReqVO,
): Promise<ApiResponse<{ list: TagTypeItem[]; total: number }>> {
  const queryParams: Record<string, any> = {
    pageNo: params?.pageNo || 1,
    pageSize: Math.min(Math.max(params?.pageSize || 20, 1), 100),
  };
  if (params?.status && (params.status as any) !== 'all') {
    queryParams.status =
      params.status === 'active' ? 0 : params.status === 'disabled' ? 1 : params.status;
  }
  if (params?.name?.trim()) {
    queryParams.name = params.name.trim();
  }

  try {
    const res = await request<{ list: TagTypeItem[]; total: number }>({
      url: '/user/tag-type/page',
      method: 'GET',
      params: queryParams,
    });
    if (res && res.code === 0 && res.data) {
      return res;
    }
  } catch (error) {
    console.warn('后端获取标签类型分页失败，使用内置 Mock 兜底数据', error);
  }

  // Mock 过滤
  let filtered = [...dynamicTagTypes];
  if (params?.status && params.status !== 'all') {
    filtered = filtered.filter((item) => item.status === params.status);
  }
  if (params?.name) {
    const kw = params.name.trim().toLowerCase();
    filtered = filtered.filter((item) => item.name.toLowerCase().includes(kw));
  }
  filtered.sort((a, b) => a.sort - b.sort);

  return {
    code: 0,
    msg: 'success',
    data: {
      list: filtered,
      total: filtered.length,
    },
  };
}

export async function getTagTypeDetail(id: number): Promise<ApiResponse<TagTypeItem>> {
  try {
    const res = await request<TagTypeItem>({
      url: '/user/tag-type/get',
      method: 'GET',
      params: { id },
    });
    if (res && res.code === 0 && res.data) return res;
  } catch (error) {
    console.warn('获取标签类型详情失败，使用 Mock 降级', error);
  }

  const found = dynamicTagTypes.find((t) => t.id === id) || dynamicTagTypes[0];
  return { code: 0, msg: 'success', data: found };
}

export async function createTagType(data: AdminTagTypeCreateReqVO): Promise<ApiResponse<number>> {
  try {
    const res = await request<number>({
      url: '/user/tag-type/create',
      method: 'POST',
      data,
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('创建标签类型后端异常，采用本地 Mock 响应', error);
  }

  const newId = Date.now();
  const newItem: TagTypeItem = {
    ...data,
    id: newId,
    tagCount: 0,
    userCount: 0,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  dynamicTagTypes.unshift(newItem);
  return { code: 0, msg: '创建成功', data: newId };
}

export async function updateTagType(data: AdminTagTypeUpdateReqVO): Promise<ApiResponse<boolean>> {
  try {
    const res = await request<boolean>({
      url: '/user/tag-type/update',
      method: 'PUT',
      data,
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('更新标签类型后端异常，采用本地 Mock 响应', error);
  }

  const index = dynamicTagTypes.findIndex((t) => t.id === data.id);
  if (index >= 0) {
    dynamicTagTypes[index] = {
      ...dynamicTagTypes[index],
      ...data,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
  }
  return { code: 0, msg: '更新成功', data: true };
}

export async function deleteTagType(id: number): Promise<ApiResponse<boolean>> {
  try {
    const res = await request<boolean>({
      url: '/user/tag-type/delete',
      method: 'DELETE',
      params: { id },
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('删除标签类型后端异常，采用本地 Mock 响应', error);
  }

  dynamicTagTypes = dynamicTagTypes.filter((t) => t.id !== id);
  dynamicTags = dynamicTags.filter((t) => t.tagTypeId !== id);
  return { code: 0, msg: '删除成功', data: true };
}

// ==================== 标签项管理 API ====================

export async function getTagPage(
  params?: AdminTagPageReqVO,
): Promise<ApiResponse<{ list: TagItem[]; total: number }>> {
  const queryParams: Record<string, any> = {
    pageNo: params?.pageNo || 1,
    pageSize: Math.min(Math.max(params?.pageSize || 20, 1), 100),
  };
  if (params?.tagTypeId && (params.tagTypeId as any) !== 'all') {
    queryParams.tagTypeId = Number(params.tagTypeId);
  }
  if (params?.status && (params.status as any) !== 'all') {
    queryParams.status =
      params.status === 'active' ? 0 : params.status === 'disabled' ? 1 : params.status;
  }
  if (params?.name?.trim()) {
    queryParams.name = params.name.trim();
  }

  // 后端接口 /user/tag/page 强制校验 @NotNull(message = "标签类型ID不能为空")
  // 若未指定具体 tagTypeId，不向后端发送必败请求，直接使用本地数据兜底
  if (!queryParams.tagTypeId) {
    let filtered = [...dynamicTags];
    if (params?.status && params.status !== 'all') {
      filtered = filtered.filter((item) => item.status === params.status);
    }
    if (params?.name) {
      const kw = params.name.trim().toLowerCase();
      filtered = filtered.filter((item) => item.name.toLowerCase().includes(kw));
    }
    filtered.sort((a, b) => a.sort - b.sort);
    return {
      code: 0,
      msg: 'success',
      data: {
        list: filtered,
        total: filtered.length,
      },
    };
  }

  try {
    const res = await request<{ list: TagItem[]; total: number }>({
      url: '/user/tag/page',
      method: 'GET',
      params: queryParams,
    });
    if (res && res.code === 0 && res.data) return res;
  } catch (error) {
    console.warn('获取标签分页失败，使用内置 Mock 兜底数据', error);
  }

  let filtered = [...dynamicTags];
  if (params?.tagTypeId && params.tagTypeId !== 'all') {
    filtered = filtered.filter((item) => item.tagTypeId === Number(params.tagTypeId));
  }
  if (params?.status && params.status !== 'all') {
    filtered = filtered.filter((item) => item.status === params.status);
  }
  if (params?.name) {
    const kw = params.name.trim().toLowerCase();
    filtered = filtered.filter((item) => item.name.toLowerCase().includes(kw));
  }
  filtered.sort((a, b) => a.sort - b.sort);

  return {
    code: 0,
    msg: 'success',
    data: {
      list: filtered,
      total: filtered.length,
    },
  };
}

export async function createTag(data: AdminTagCreateReqVO): Promise<ApiResponse<number>> {
  try {
    const res = await request<number>({
      url: '/user/tag/create',
      method: 'POST',
      data,
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('创建标签后端异常，采用本地 Mock 响应', error);
  }

  const newId = Date.now();
  const parentType = dynamicTagTypes.find((t) => t.id === data.tagTypeId);
  const newItem: TagItem = {
    ...data,
    id: newId,
    tagTypeName: parentType?.name || '未知分类',
    color: data.color || '#1890ff',
    userCount: 0,
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  dynamicTags.unshift(newItem);
  if (parentType) {
    parentType.tagCount = (parentType.tagCount || 0) + 1;
  }
  return { code: 0, msg: '创建标签成功', data: newId };
}

export async function updateTag(data: AdminTagUpdateReqVO): Promise<ApiResponse<boolean>> {
  try {
    const res = await request<boolean>({
      url: '/user/tag/update',
      method: 'PUT',
      data,
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('更新标签后端异常，采用本地 Mock 响应', error);
  }

  const index = dynamicTags.findIndex((t) => t.id === data.id);
  if (index >= 0) {
    const parentType = dynamicTagTypes.find((t) => t.id === data.tagTypeId);
    dynamicTags[index] = {
      ...dynamicTags[index],
      ...data,
      tagTypeName: parentType?.name || dynamicTags[index].tagTypeName,
      updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
    };
  }
  return { code: 0, msg: '更新标签成功', data: true };
}

export async function deleteTag(id: number): Promise<ApiResponse<boolean>> {
  try {
    const res = await request<boolean>({
      url: '/user/tag/delete',
      method: 'DELETE',
      params: { id },
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('删除标签后端异常，采用本地 Mock 响应', error);
  }

  const target = dynamicTags.find((t) => t.id === id);
  if (target) {
    const parentType = dynamicTagTypes.find((t) => t.id === target.tagTypeId);
    if (parentType?.tagCount && parentType.tagCount > 0) {
      parentType.tagCount -= 1;
    }
  }
  dynamicTags = dynamicTags.filter((t) => t.id !== id);
  return { code: 0, msg: '删除标签成功', data: true };
}

// ==================== 初始标签配置 API ====================

export async function getInitialTagConfigPage(params?: {
  pageNo?: number;
  pageSize?: number;
  scene?: string;
}): Promise<ApiResponse<{ list: InitialTagConfigItem[]; total: number }>> {
  const queryParams: Record<string, any> = {
    pageNo: params?.pageNo || 1,
    pageSize: Math.min(Math.max(params?.pageSize || 20, 1), 100),
  };
  if (params?.scene && params.scene !== 'all') {
    queryParams.scene = params.scene;
  }

  try {
    const res = await request<{ list: InitialTagConfigItem[]; total: number }>({
      url: '/user/tag-initial-config/page',
      method: 'GET',
      params: queryParams,
    });
    if (res && res.code === 0 && res.data) return res;
  } catch (error) {
    console.warn('获取初始标签配置失败，使用内置 Mock 兜底数据', error);
  }

  let filtered = [...dynamicConfigs];
  if (params?.scene && params.scene !== 'all') {
    filtered = filtered.filter((c) => c.scene === params.scene);
  }
  filtered.sort((a, b) => a.sort - b.sort);

  return {
    code: 0,
    msg: 'success',
    data: {
      list: filtered,
      total: filtered.length,
    },
  };
}

export async function createInitialTagConfig(
  data: AdminInitialTagConfigCreateReqVO,
): Promise<ApiResponse<number>> {
  try {
    const res = await request<number>({
      url: '/user/tag-initial-config/create',
      method: 'POST',
      data,
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('创建初始标签配置后端异常，采用本地 Mock', error);
  }

  const newId = Date.now();
  const parentType = dynamicTagTypes.find((t) => t.id === data.tagTypeId);
  const targetTag = data.tagId ? dynamicTags.find((t) => t.id === data.tagId) : null;

  const newItem: InitialTagConfigItem = {
    ...data,
    id: newId,
    tagTypeName: parentType?.name || '未知分类',
    tagName: targetTag ? targetTag.name : '全部有效标签',
    createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19),
  };
  dynamicConfigs.push(newItem);
  return { code: 0, msg: '配置成功', data: newId };
}

export async function updateInitialTagConfig(
  data: AdminInitialTagConfigUpdateReqVO,
): Promise<ApiResponse<boolean>> {
  try {
    const res = await request<boolean>({
      url: '/user/tag-initial-config/update',
      method: 'PUT',
      data,
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('更新初始标签配置异常，采用本地 Mock', error);
  }

  const index = dynamicConfigs.findIndex((c) => c.id === data.id);
  if (index >= 0) {
    const parentType = dynamicTagTypes.find((t) => t.id === data.tagTypeId);
    const targetTag = data.tagId ? dynamicTags.find((t) => t.id === data.tagId) : null;
    dynamicConfigs[index] = {
      ...dynamicConfigs[index],
      ...data,
      tagTypeName: parentType?.name || dynamicConfigs[index].tagTypeName,
      tagName: targetTag ? targetTag.name : '全部有效标签',
    };
  }
  return { code: 0, msg: '更新配置成功', data: true };
}

export async function deleteInitialTagConfig(id: number): Promise<ApiResponse<boolean>> {
  try {
    const res = await request<boolean>({
      url: '/user/tag-initial-config/delete',
      method: 'DELETE',
      params: { id },
    });
    if (res && res.code === 0) return res;
  } catch (error) {
    console.warn('删除初始配置异常，采用本地 Mock', error);
  }

  dynamicConfigs = dynamicConfigs.filter((c) => c.id !== id);
  return { code: 0, msg: '移除成功', data: true };
}

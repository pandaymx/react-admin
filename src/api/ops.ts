import type {
  ApiResponse,
  OpsAlertEventItem,
  OpsAlertRuleItem,
  OpsDependencyItem,
  OpsHostItem,
  OpsResourcePolicy,
  OpsServiceItem,
  OpsSummaryStats,
} from '@/types';

// ======================= 高拟真运维数据集 =======================

const mockServices: OpsServiceItem[] = [
  {
    id: 'svc-1',
    name: 'gateway-server',
    chineseName: 'API 网关服务',
    version: '1.0.0-RELEASE',
    status: 'UP',
    host: '172.17.75.184',
    port: 48080,
    responseTime: 12,
    uptime: '28天 14小时',
    lastProbeTime: '2026-09-09 18:50:00',
    instanceCount: 2,
    jvmHeapUsage: 45,
    cpuUsage: 14,
    probeEndpoint: '/actuator/health',
    details: {
      diskSpace: { status: 'UP', total: '100GB', free: '68GB' },
      db: { status: 'UP', activeConnections: 12, maxConnections: 100 },
      redis: { status: 'UP', version: '7.2.4' },
    },
  },
  {
    id: 'svc-2',
    name: 'ops-server',
    chineseName: '运维监控中心',
    version: '1.0.0-SNAPSHOT',
    status: 'UP',
    host: '172.17.75.184',
    port: 48093,
    responseTime: 16,
    uptime: '15天 8小时',
    lastProbeTime: '2026-09-09 18:50:02',
    instanceCount: 1,
    jvmHeapUsage: 38,
    cpuUsage: 9,
    probeEndpoint: '/actuator/health',
    details: {
      diskSpace: { status: 'UP', total: '100GB', free: '68GB' },
      redis: { status: 'UP', version: '7.2.4' },
    },
  },
  {
    id: 'svc-3',
    name: 'user-server',
    chineseName: '用户与认证中心',
    version: '1.0.0-RELEASE',
    status: 'UP',
    host: '172.17.75.184',
    port: 48081,
    responseTime: 22,
    uptime: '28天 14小时',
    lastProbeTime: '2026-09-09 18:50:01',
    instanceCount: 2,
    jvmHeapUsage: 62,
    cpuUsage: 25,
    probeEndpoint: '/actuator/health',
    details: {
      diskSpace: { status: 'UP', total: '100GB', free: '68GB' },
      db: { status: 'UP', activeConnections: 24, maxConnections: 150 },
      redis: { status: 'UP', version: '7.2.4' },
    },
  },
  {
    id: 'svc-4',
    name: 'feeds-server',
    chineseName: '内容与动态服务',
    version: '1.0.0-RELEASE',
    status: 'UP',
    host: '172.17.75.184',
    port: 48082,
    responseTime: 31,
    uptime: '19天 6小时',
    lastProbeTime: '2026-09-09 18:50:03',
    instanceCount: 2,
    jvmHeapUsage: 58,
    cpuUsage: 32,
    probeEndpoint: '/actuator/health',
    details: {
      diskSpace: { status: 'UP', total: '100GB', free: '68GB' },
      db: { status: 'UP', activeConnections: 35, maxConnections: 200 },
      redis: { status: 'UP', version: '7.2.4' },
    },
  },
  {
    id: 'svc-5',
    name: 'interaction-server',
    chineseName: '评论点赞互动服务',
    version: '1.0.0-RELEASE',
    status: 'UP',
    host: '172.17.75.158',
    port: 48083,
    responseTime: 19,
    uptime: '21天 11小时',
    lastProbeTime: '2026-09-09 18:50:04',
    instanceCount: 2,
    jvmHeapUsage: 49,
    cpuUsage: 18,
    probeEndpoint: '/actuator/health',
    details: {
      diskSpace: { status: 'UP', total: '200GB', free: '142GB' },
      db: { status: 'UP', activeConnections: 18, maxConnections: 150 },
      redis: { status: 'UP', version: '7.2.4' },
    },
  },
  {
    id: 'svc-6',
    name: 'activity-server',
    chineseName: '营销活动中台',
    version: '1.0.0-RELEASE',
    status: 'UP',
    host: '172.17.75.158',
    port: 48084,
    responseTime: 26,
    uptime: '12天 3小时',
    lastProbeTime: '2026-09-09 18:50:05',
    instanceCount: 1,
    jvmHeapUsage: 52,
    cpuUsage: 15,
    probeEndpoint: '/actuator/health',
    details: {
      diskSpace: { status: 'UP', total: '200GB', free: '142GB' },
      db: { status: 'UP', activeConnections: 14, maxConnections: 100 },
      redis: { status: 'UP', version: '7.2.4' },
    },
  },
  {
    id: 'svc-7',
    name: 'infra-server',
    chineseName: '基础设施与定时调度',
    version: '1.0.0-RELEASE',
    status: 'DEGRADED',
    host: '172.17.75.158',
    port: 48085,
    responseTime: 148,
    uptime: '7天 22小时',
    lastProbeTime: '2026-09-09 18:50:06',
    instanceCount: 1,
    jvmHeapUsage: 78,
    cpuUsage: 48,
    probeEndpoint: '/actuator/health',
    details: {
      diskSpace: { status: 'UP', total: '200GB', free: '142GB' },
      db: { status: 'DEGRADED', activeConnections: 88, maxConnections: 100 },
      redis: { status: 'UP', version: '7.2.4' },
    },
  },
  {
    id: 'svc-8',
    name: 'pay-server',
    chineseName: '统一支付中台',
    version: '1.0.0-RELEASE',
    status: 'UP',
    host: '172.17.75.158',
    port: 48086,
    responseTime: 18,
    uptime: '30天 0小时',
    lastProbeTime: '2026-09-09 18:50:07',
    instanceCount: 2,
    jvmHeapUsage: 41,
    cpuUsage: 12,
    probeEndpoint: '/actuator/health',
    details: {
      diskSpace: { status: 'UP', total: '200GB', free: '142GB' },
      db: { status: 'UP', activeConnections: 16, maxConnections: 120 },
      redis: { status: 'UP', version: '7.2.4' },
    },
  },
];

const mockDependencies: OpsDependencyItem[] = [
  {
    name: 'MySQL 8.0 Primary',
    category: 'database',
    status: 'UP',
    host: '172.17.75.158',
    port: 3306,
    connectionCount: 195,
    maxConnectionCount: 800,
    latencyMs: 1.8,
    description: '业务主数据库集群（读写节点，双机热备）',
  },
  {
    name: 'Redis 7.2 Cluster',
    category: 'cache',
    status: 'UP',
    host: '172.17.75.158',
    port: 6379,
    connectionCount: 340,
    maxConnectionCount: 5000,
    memoryUsage: '3.4GB / 8.0GB',
    latencyMs: 0.6,
    description: '高可用 Redis 缓存集群，命中率 99.2%',
  },
  {
    name: 'Nacos 2.3.2 Cluster',
    category: 'registry',
    status: 'UP',
    host: '172.17.75.184',
    port: 8848,
    connectionCount: 64,
    maxConnectionCount: 1000,
    latencyMs: 1.2,
    description: '微服务服务注册中心与统一配置管理中心',
  },
  {
    name: 'RabbitMQ 3.12 Cluster',
    category: 'mq',
    status: 'UP',
    host: '172.17.75.184',
    port: 5672,
    connectionCount: 42,
    maxConnectionCount: 2000,
    latencyMs: 2.1,
    description: '核心异步消息事件总线，队列积压为 0',
  },
];

const mockHosts: OpsHostItem[] = [
  {
    id: 'host-1',
    hostName: 'qxj-app-core-01',
    ip: '172.17.75.184',
    os: 'Ubuntu 22.04 LTS (Kernel 5.15)',
    cpuCores: 8,
    cpuUsage: 34.5,
    memoryTotal: 32,
    memoryUsed: 18.2,
    memoryUsage: 56.8,
    diskTotal: 500,
    diskUsed: 198,
    diskUsage: 39.6,
    loadAverage: [1.82, 1.45, 1.2],
    status: 'UP',
  },
  {
    id: 'host-2',
    hostName: 'qxj-app-data-02',
    ip: '172.17.75.158',
    os: 'Ubuntu 22.04 LTS (Kernel 5.15)',
    cpuCores: 16,
    cpuUsage: 46.2,
    memoryTotal: 64,
    memoryUsed: 44.8,
    memoryUsage: 70.0,
    diskTotal: 1000,
    diskUsed: 412,
    diskUsage: 41.2,
    loadAverage: [3.12, 2.85, 2.4],
    status: 'UP',
  },
];

const mockAlerts: OpsAlertEventItem[] = [
  {
    id: 'alt-1',
    fingerprint: 'infra.probe.latency|infra-server',
    ruleCode: 'SVC_PROBE_LATENCY_HIGH',
    ruleName: '微服务探针响应延时过高',
    target: 'infra-server',
    severity: 'WARNING',
    state: 'FIRING',
    currentValue: 148,
    threshold: 100,
    unit: 'ms',
    triggeredAt: '2026-09-09 18:32:10',
    message: '基础设施服务(infra-server) 健康检查延时达到 148ms，超过 100ms 警戒线。',
    acknowledged: false,
  },
  {
    id: 'alt-2',
    fingerprint: 'host.memory.usage|qxj-app-data-02',
    ruleCode: 'HOST_MEMORY_USAGE_HIGH',
    ruleName: '宿主节点内存占用超限',
    target: 'qxj-app-data-02 (172.17.75.158)',
    severity: 'WARNING',
    state: 'FIRING',
    currentValue: 70.0,
    threshold: 70.0,
    unit: '%',
    triggeredAt: '2026-09-09 18:41:05',
    message: '数据节点宿主机内存使用率达到 70.0%，触碰预警阈值。',
    acknowledged: true,
  },
  {
    id: 'alt-3',
    fingerprint: 'db.slow_query|MySQL Primary',
    ruleCode: 'DB_SLOW_QUERY_SPIKE',
    ruleName: '数据库慢查询频率突增',
    target: 'MySQL 8.0 Primary',
    severity: 'INFO',
    state: 'RESOLVED',
    currentValue: 2,
    threshold: 10,
    unit: 'ops/s',
    triggeredAt: '2026-09-09 17:15:00',
    resolvedAt: '2026-09-09 17:35:12',
    message: '数据库慢查询数量已回落至安全区间（当前 2 ops/s）。',
    acknowledged: true,
  },
];

const mockAlertRules: OpsAlertRuleItem[] = [
  {
    id: 'rule-1',
    ruleCode: 'SVC_DOWN',
    ruleName: '微服务离线或不可达',
    metric: 'service.probe.status',
    operator: '==',
    threshold: 0,
    unit: '状态码',
    severity: 'CRITICAL',
    enabled: true,
    durationSeconds: 15,
    description: '健康检查连续 3 次探测失败立即触发 P0 级严重告警。',
  },
  {
    id: 'rule-2',
    ruleCode: 'SVC_PROBE_LATENCY_HIGH',
    ruleName: '微服务探针响应延时过高',
    metric: 'service.probe.latency',
    operator: '>',
    threshold: 100,
    unit: 'ms',
    severity: 'WARNING',
    enabled: true,
    durationSeconds: 60,
    description: '微服务健康检查延时超过 100ms 并持续 1 分钟触发预警。',
  },
  {
    id: 'rule-3',
    ruleCode: 'HOST_MEMORY_USAGE_HIGH',
    ruleName: '宿主节点内存占用超限',
    metric: 'host.memory.used.percent',
    operator: '>=',
    threshold: 70,
    unit: '%',
    severity: 'WARNING',
    enabled: true,
    durationSeconds: 120,
    description: '宿主机可用内存不足 30% 时触发告警。',
  },
  {
    id: 'rule-4',
    ruleCode: 'HOST_CPU_USAGE_CRITICAL',
    ruleName: '宿主机 CPU 持续满载',
    metric: 'host.cpu.used.percent',
    operator: '>=',
    threshold: 90,
    unit: '%',
    severity: 'CRITICAL',
    enabled: true,
    durationSeconds: 180,
    description: '宿主机 CPU 持续 3 分钟高于 90% 触发严重告警。',
  },
  {
    id: 'rule-5',
    ruleCode: 'JVM_HEAP_USAGE_HIGH',
    ruleName: 'JVM 堆内存溢出风险',
    metric: 'jvm.heap.used.percent',
    operator: '>=',
    threshold: 80,
    unit: '%',
    severity: 'WARNING',
    enabled: true,
    durationSeconds: 60,
    description: 'JVM 老年代/堆内存占用超过 80% 触发预警。',
  },
];

let currentResourcePolicy: OpsResourcePolicy = {
  hostCpuWarningPercent: 80,
  hostCpuCriticalPercent: 90,
  hostMemoryWarningPercent: 70,
  hostMemoryCriticalPercent: 90,
  jvmHeapWarningPercent: 80,
  jvmHeapCriticalPercent: 90,
  probeTimeoutMillis: 1500,
  autoRefreshInterval: 30,
};

// ======================= API 接口实现 =======================

/**
 * 获取运维监控大盘核心统计与健康评分
 */
export const getOpsSummaryStats = async (): Promise<ApiResponse<OpsSummaryStats>> => {
  const upServices = mockServices.filter((s) => s.status === 'UP').length;
  const downServices = mockServices.filter((s) => s.status === 'DOWN').length;
  const degradedServices = mockServices.filter((s) => s.status === 'DEGRADED').length;
  const activeAlerts = mockAlerts.filter((a) => a.state === 'FIRING').length;

  // 综合计算系统健康评分
  let healthScore = 100;
  healthScore -= downServices * 25;
  healthScore -= degradedServices * 10;
  healthScore -= activeAlerts * 5;
  healthScore = Math.max(0, Math.min(100, healthScore));

  const cpuAvgUsage = Math.round(
    mockHosts.reduce((acc, h) => acc + h.cpuUsage, 0) / mockHosts.length,
  );
  const memoryAvgUsage = Math.round(
    mockHosts.reduce((acc, h) => acc + h.memoryUsage, 0) / mockHosts.length,
  );
  const jvmHeapAvgUsage = Math.round(
    mockServices.reduce((acc, s) => acc + s.jvmHeapUsage, 0) / mockServices.length,
  );

  return {
    code: 200,
    data: {
      healthScore,
      totalServices: mockServices.length,
      upServices,
      downServices,
      degradedServices,
      activeAlerts,
      hostCount: mockHosts.length,
      cpuAvgUsage,
      memoryAvgUsage,
      jvmHeapAvgUsage,
    },
    message: 'success',
  };
};

/**
 * 获取微服务资产及探针状态列表
 */
export const getOpsServices = async (): Promise<ApiResponse<OpsServiceItem[]>> => {
  return {
    code: 200,
    data: [...mockServices],
    message: 'success',
  };
};

/**
 * 手动触发单项微服务探针探测
 */
export const triggerServiceProbe = async (
  serviceId: string,
): Promise<ApiResponse<OpsServiceItem>> => {
  const target = mockServices.find((s) => s.id === serviceId);
  if (!target) {
    throw new Error('服务不存在');
  }

  // 模拟微小的探针延迟波动
  const delta = Math.floor(Math.random() * 8) - 4;
  target.responseTime = Math.max(8, target.responseTime + delta);
  target.lastProbeTime = new Date().toISOString().replace('T', ' ').slice(0, 19);

  return {
    code: 200,
    data: { ...target },
    message: `服务「${target.name}」探针探测完成：${target.status}`,
  };
};

/**
 * 获取中间件与基础设施资产列表
 */
export const getOpsDependencies = async (): Promise<ApiResponse<OpsDependencyItem[]>> => {
  return {
    code: 200,
    data: [...mockDependencies],
    message: 'success',
  };
};

/**
 * 获取宿主机硬件资源快照列表
 */
export const getOpsHosts = async (): Promise<ApiResponse<OpsHostItem[]>> => {
  return {
    code: 200,
    data: [...mockHosts],
    message: 'success',
  };
};

/**
 * 获取实时运维告警事件列表
 */
export const getOpsAlerts = async (): Promise<ApiResponse<OpsAlertEventItem[]>> => {
  return {
    code: 200,
    data: [...mockAlerts],
    message: 'success',
  };
};

/**
 * 确认/处置单条告警事件
 */
export const acknowledgeAlert = async (alertId: string): Promise<ApiResponse<boolean>> => {
  const item = mockAlerts.find((a) => a.id === alertId);
  if (item) {
    item.acknowledged = true;
  }
  return {
    code: 200,
    data: true,
    message: '告警已确认处置',
  };
};

/**
 * 获取告警规则目录
 */
export const getOpsAlertRules = async (): Promise<ApiResponse<OpsAlertRuleItem[]>> => {
  return {
    code: 200,
    data: [...mockAlertRules],
    message: 'success',
  };
};

/**
 * 获取资源告警与探测策略配置
 */
export const getOpsResourcePolicy = async (): Promise<ApiResponse<OpsResourcePolicy>> => {
  return {
    code: 200,
    data: { ...currentResourcePolicy },
    message: 'success',
  };
};

/**
 * 更新资源告警与探测策略配置
 */
export const saveOpsResourcePolicy = async (
  policy: OpsResourcePolicy,
): Promise<ApiResponse<boolean>> => {
  currentResourcePolicy = { ...policy };
  return {
    code: 200,
    data: true,
    message: '监控阈值策略已更新并即时生效',
  };
};

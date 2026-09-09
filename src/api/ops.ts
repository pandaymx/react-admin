import type {
  ApiResponse,
  JvmDetailInfo,
  OpsAlertEventItem,
  OpsAlertRuleItem,
  OpsDependencyItem,
  OpsHostItem,
  OpsResourcePolicy,
  OpsServiceItem,
  OpsSummaryStats,
  RedisCommandStat,
  RedisConfigItem,
  RedisDbStat,
  RedisInfoItem,
  ServerHostDetail,
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

// ======================= Redis 深度监控数据集 =======================

const mockRedisInfo: RedisInfoItem = {
  version: '7.2.4',
  redisMode: 'sentinel',
  port: 6379,
  runDays: 42,
  connectedClients: 84,
  connectedClientsPeak: 216,
  blockedClients: 0,
  usedMemoryHuman: '1.42 GB',
  usedMemoryBytes: 1524695040,
  usedMemoryRssHuman: '1.68 GB',
  usedMemoryPeakHuman: '2.10 GB',
  maxMemoryHuman: '4.00 GB',
  maxMemoryBytes: 4294967296,
  maxMemoryPolicy: 'volatile-lru',
  memFragmentationRatio: 1.18,
  keyspaceHits: 842190,
  keyspaceMisses: 21940,
  hitRate: 97.46,
  instantaneousOpsPerSec: 1840,
  totalKeys: 68420,
  expiredKeys: 12840,
  evictedKeys: 0,
  aofEnabled: true,
  rdbLastSaveStatus: 'ok',
  rdbLastSaveTime: '2026-09-09 19:00:15',
};

const mockRedisConfigs: RedisConfigItem[] = [
  {
    key: 'maxmemory',
    value: '4294967296 (4.00 GB)',
    description: 'Redis 实例允许使用的最大物理内存上限，达到后执行淘汰策略',
    defaultValue: '0 (无限制)',
    category: 'memory',
    dynamicEditable: true,
  },
  {
    key: 'maxmemory-policy',
    value: 'volatile-lru',
    description: '内存达到上限后的淘汰算法（从设置了过期的键中根据 LRU 淘汰）',
    defaultValue: 'noeviction',
    category: 'memory',
    dynamicEditable: true,
  },
  {
    key: 'timeout',
    value: '300',
    description: '客户端闲置超时时间（秒），超过则主动断开连接，0 表示永不断开',
    defaultValue: '0',
    category: 'network',
    dynamicEditable: true,
  },
  {
    key: 'databases',
    value: '16',
    description: '支持的数据库分区总数（从 db0 到 db15）',
    defaultValue: '16',
    category: 'general',
    dynamicEditable: false,
  },
  {
    key: 'save',
    value: '900 1 300 10 60 10000',
    description: 'RDB 自动快照触发规则：900秒内有1次写，或300秒10次写，或60秒1万次写',
    defaultValue: '3600 1 300 100 60 10000',
    category: 'persistence',
    dynamicEditable: true,
  },
  {
    key: 'appendonly',
    value: 'yes',
    description: '是否开启 AOF (Append Only File) 增量命令追加持久化',
    defaultValue: 'no',
    category: 'persistence',
    dynamicEditable: true,
  },
  {
    key: 'appendfsync',
    value: 'everysec',
    description: 'AOF 刷盘同步策略（everysec 每秒异步刷盘，兼顾性能与数据安全）',
    defaultValue: 'everysec',
    category: 'persistence',
    dynamicEditable: true,
  },
  {
    key: 'tcp-backlog',
    value: '511',
    description: '高并发场景下的 TCP 已完成握手连接队列深度',
    defaultValue: '511',
    category: 'network',
    dynamicEditable: false,
  },
  {
    key: 'tcp-keepalive',
    value: '300',
    description: '发送 TCP 保活心跳探活探测周期（秒）',
    defaultValue: '300',
    category: 'network',
    dynamicEditable: true,
  },
  {
    key: 'slowlog-log-slower-than',
    value: '10000',
    description: '慢查询判定阈值（微秒），超过 10ms 的查询记录入慢日志',
    defaultValue: '10000',
    category: 'general',
    dynamicEditable: true,
  },
  {
    key: 'slowlog-max-len',
    value: '1024',
    description: '慢查询日志队列最大保留条数',
    defaultValue: '128',
    category: 'general',
    dynamicEditable: true,
  },
  {
    key: 'hash-max-listpack-entries',
    value: '512',
    description: 'Hash 结构启用紧凑 listpack 编码的最大字段数，超过转为散列表',
    defaultValue: '512',
    category: 'memory',
    dynamicEditable: true,
  },
  {
    key: 'zset-max-listpack-entries',
    value: '128',
    description: '有序集合启用紧凑编码的最大元素数',
    defaultValue: '128',
    category: 'memory',
    dynamicEditable: true,
  },
  {
    key: 'activedefrag',
    value: 'yes',
    description: '是否开启主动内存碎片整理机制，避免长时间运行产生的碎片膨胀',
    defaultValue: 'no',
    category: 'memory',
    dynamicEditable: true,
  },
  {
    key: 'hz',
    value: '10',
    description: '后台定时任务执行频率（每秒执行检查过期、清理超时的周期次数）',
    defaultValue: '10',
    category: 'general',
    dynamicEditable: true,
  },
];

const mockRedisDbStats: RedisDbStat[] = [
  { dbIndex: 0, dbName: 'db0 (登录鉴权与Token)', keys: 38200, expires: 31400, avgTtlMs: 7200000 },
  {
    dbIndex: 1,
    dbName: 'db1 (动态内容与用户缓存)',
    keys: 18400,
    expires: 12100,
    avgTtlMs: 86400000,
  },
  { dbIndex: 2, dbName: 'db2 (分布式限流与锁Lock4j)', keys: 7600, expires: 7600, avgTtlMs: 60000 },
  { dbIndex: 3, dbName: 'db3 (支付状态与幂等Token)', keys: 4220, expires: 3900, avgTtlMs: 1800000 },
];

const mockRedisCommandStats: RedisCommandStat[] = [
  { command: 'GET', calls: 384200, usec: 153680, usecPerCall: 0.4, percentage: 42.5 },
  { command: 'SET / SETEX', calls: 189400, usec: 94700, usecPerCall: 0.5, percentage: 21.0 },
  { command: 'HGET / HGETALL', calls: 112000, usec: 67200, usecPerCall: 0.6, percentage: 12.4 },
  { command: 'LRANGE / LPUSH', calls: 54000, usec: 43200, usecPerCall: 0.8, percentage: 6.0 },
  { command: 'ZADD / ZREVRANGE', calls: 48000, usec: 40800, usecPerCall: 0.85, percentage: 5.3 },
  { command: 'DEL', calls: 32000, usec: 19200, usecPerCall: 0.6, percentage: 3.5 },
  { command: 'EVAL / Lua脚本', calls: 24000, usec: 36000, usecPerCall: 1.5, percentage: 2.7 },
  { command: 'PING / 探活心跳', calls: 58000, usec: 11600, usecPerCall: 0.2, percentage: 6.6 },
];

// ======================= 服务器硬件与系统数据集 =======================

const mockServerDetail: ServerHostDetail = {
  id: 'host-1',
  sys: {
    computerName: 'prod-k8s-node-01',
    computerIp: '172.17.75.184',
    publicIp: '192.168.1.2',
    osName: 'Alibaba Cloud Linux 3.2104 LTS',
    osArch: 'x86_64 (amd64)',
    kernelVersion: 'Linux 5.10.134-16.1.al8.x86_64',
    uptime: '48天 16小时 32分',
    runtimeEnv: '生产集群节点 (K8s Worker Node)',
  },
  cpu: {
    cpuNum: 16,
    cpuModel: 'Intel(R) Xeon(R) Platinum 8369B CPU @ 2.70GHz',
    userPercent: 28.4,
    sysPercent: 9.8,
    idlePercent: 61.8,
    waitPercent: 0.0,
    totalPercent: 38.2,
    loadAvg1m: 2.14,
    loadAvg5m: 1.88,
    loadAvg15m: 1.62,
  },
  mem: {
    totalGb: 64.0,
    usedGb: 39.8,
    freeGb: 14.2,
    bufferCachedGb: 10.0,
    usagePercent: 62.19,
    swapTotalGb: 8.0,
    swapUsedGb: 0.42,
    swapFreeGb: 7.58,
    swapUsagePercent: 5.25,
  },
  disks: [
    {
      dirName: '/',
      sysTypeName: 'ext4',
      typeName: '系统根挂载分区',
      totalGb: 100.0,
      usedGb: 42.6,
      freeGb: 57.4,
      usagePercent: 42.6,
      status: 'normal',
    },
    {
      dirName: '/data',
      sysTypeName: 'xfs',
      typeName: '高速 SSD 数据盘',
      totalGb: 500.0,
      usedGb: 284.0,
      freeGb: 216.0,
      usagePercent: 56.8,
      status: 'normal',
    },
    {
      dirName: '/var/log',
      sysTypeName: 'ext4',
      typeName: '容器与系统日志分区',
      totalGb: 200.0,
      usedGb: 148.2,
      freeGb: 51.8,
      usagePercent: 74.1,
      status: 'warning',
    },
  ],
  network: [
    {
      interfaceName: 'eth0',
      ip: '172.17.75.184',
      rxSpeedKb: 1420.5,
      txSpeedKb: 2890.2,
      rxTotalMb: 124800,
      txTotalMb: 358400,
      tcpEstablished: 486,
      tcpTimeWait: 92,
      tcpCloseWait: 6,
    },
  ],
};

// ======================= JVM 详细分代数据集 =======================

const mockJvmDetail: JvmDetailInfo = {
  serviceCode: 'user-server',
  chineseName: '用户中心服务 (User Service)',
  jvmName: 'OpenJDK 64-Bit Server VM',
  jvmVersion: '17.0.12+7-LTS',
  javaHome: '/opt/java/openjdk-17',
  startTime: '2026-08-20 10:15:00',
  uptime: '20天 8小时 45分',
  initHeapMb: 2048,
  maxHeapMb: 8192,
  usedHeapMb: 4620,
  committedHeapMb: 6144,
  heapUsagePercent: 56.4,
  edenUsedMb: 1280,
  edenMaxMb: 2048,
  oldGenUsedMb: 3040,
  oldGenMaxMb: 5120,
  metaspaceUsedMb: 184,
  metaspaceMaxMb: 512,
  youngGcCount: 1482,
  youngGcTimeMs: 18420,
  fullGcCount: 3,
  fullGcTimeMs: 420,
  threadCount: 142,
  peakThreadCount: 280,
  daemonThreadCount: 96,
  deadlockedThreadCount: 0,
};

// ======================= 扩展 API 接口实现 =======================

/**
 * 获取 Redis 运行状态与键空间信息
 */
export const getRedisInfo = async (_env?: string): Promise<ApiResponse<RedisInfoItem>> => {
  return {
    code: 200,
    data: { ...mockRedisInfo },
    message: 'success',
  };
};

/**
 * 获取 Redis 核心配置参数列表
 */
export const getRedisConfigs = async (_env?: string): Promise<ApiResponse<RedisConfigItem[]>> => {
  return {
    code: 200,
    data: [...mockRedisConfigs],
    message: 'success',
  };
};

/**
 * 获取 Redis 分库统计
 */
export const getRedisDbStats = async (_env?: string): Promise<ApiResponse<RedisDbStat[]>> => {
  return {
    code: 200,
    data: [...mockRedisDbStats],
    message: 'success',
  };
};

/**
 * 获取 Redis 常用命令耗时与频率统计
 */
export const getRedisCommandStats = async (
  _env?: string,
): Promise<ApiResponse<RedisCommandStat[]>> => {
  return {
    code: 200,
    data: [...mockRedisCommandStats],
    message: 'success',
  };
};

/**
 * 获取服务器完整硬件与系统快照
 */
export const getServerDetail = async (
  _hostId?: string,
  _env?: string,
): Promise<ApiResponse<ServerHostDetail>> => {
  return {
    code: 200,
    data: { ...mockServerDetail },
    message: 'success',
  };
};

/**
 * 获取 JVM 深度分代指标与垃圾回收快照
 */
export const getJvmDetail = async (
  _serviceCode?: string,
  _env?: string,
): Promise<ApiResponse<JvmDetailInfo>> => {
  return {
    code: 200,
    data: { ...mockJvmDetail },
    message: 'success',
  };
};

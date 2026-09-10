/**
 * 系统运维与服务监控数据模型契约
 */

export type OpsStatus = 'UP' | 'DOWN' | 'DEGRADED' | 'UNKNOWN';

export type AlertSeverity = 'CRITICAL' | 'WARNING' | 'INFO';

export type AlertState = 'FIRING' | 'RESOLVED' | 'MUTED';

/**
 * 核心指标卡片数据
 */
export interface OpsSummaryStats {
  healthScore: number; // 健康度评分 0-100
  totalServices: number; // 微服务总数
  upServices: number; // 正常运行服务
  downServices: number; // 异常故障服务
  degradedServices: number; // 亚健康降级服务
  activeAlerts: number; // 活跃触发中告警
  hostCount: number; // 宿主机节点数
  cpuAvgUsage: number; // 宿主平均 CPU 使用率 %
  memoryAvgUsage: number; // 宿主平均内存使用率 %
  jvmHeapAvgUsage: number; // JVM 堆内存平均使用率 %
}

/**
 * 微服务资产及探针快照
 */
export interface OpsServiceItem {
  id: string;
  name: string; // 如 user-server
  chineseName: string; // 如 用户中心服务
  version: string; // 版本号 如 1.0.0-SNAPSHOT
  status: OpsStatus; // 运行状态
  host: string; // 运行宿主 IP
  port: number; // 端口
  responseTime: number; // 探针响应延时 ms
  uptime: string; // 连续运行时长 如 14天 6小时
  lastProbeTime: string; // 最近探针探测时间
  instanceCount: number; // 运行实例数
  jvmHeapUsage: number; // JVM 堆占用率 %
  cpuUsage: number; // CPU 使用率 %
  probeEndpoint: string; // 如 /actuator/health
  details?: {
    diskSpace?: { status: string; total: string; free: string };
    db?: { status: string; activeConnections: number; maxConnections: number };
    redis?: { status: string; version: string };
  };
}

/**
 * 中间件/依赖组件资产
 */
export interface OpsDependencyItem {
  name: string; // 如 MySQL 8.0, Redis Cluster
  category: 'database' | 'cache' | 'mq' | 'registry' | 'search';
  status: OpsStatus;
  host: string;
  port: number;
  connectionCount: number;
  maxConnectionCount: number;
  memoryUsage?: string;
  latencyMs: number;
  description: string;
}

/**
 * 运维告警规则
 */
export interface OpsAlertRuleItem {
  id: string;
  ruleCode: string;
  ruleName: string;
  metric: string; // 如 host.memory.used.percent
  operator: '>' | '>=' | '<' | '==' | '!=';
  threshold: number;
  unit: string;
  severity: AlertSeverity;
  enabled: boolean;
  durationSeconds: number; // 持续时间阈值
  description: string;
}

/**
 * 实时告警事件
 */
export interface OpsAlertEventItem {
  id: string;
  fingerprint: string; // 告警指纹
  ruleCode: string;
  ruleName: string;
  target: string; // 告警对象 如 user-server / node-1
  severity: AlertSeverity;
  state: AlertState;
  currentValue: number;
  threshold: number;
  unit: string;
  triggeredAt: string;
  resolvedAt?: string;
  message: string;
  acknowledged: boolean; // 是否已确认
}

/**
 * 宿主机资源快照
 */
export interface OpsHostItem {
  id: string;
  hostName: string;
  ip: string;
  os: string;
  cpuCores: number;
  cpuUsage: number; // %
  memoryTotal: number; // GB
  memoryUsed: number; // GB
  memoryUsage: number; // %
  diskTotal: number; // GB
  diskUsed: number; // GB
  diskUsage: number; // %
  loadAverage: [number, number, number]; // 1m, 5m, 15m
  status: OpsStatus;
}

/**
 * JVM 与资源阈值配置
 */
export interface OpsResourcePolicy {
  hostCpuWarningPercent: number;
  hostCpuCriticalPercent: number;
  hostMemoryWarningPercent: number;
  hostMemoryCriticalPercent: number;
  jvmHeapWarningPercent: number;
  jvmHeapCriticalPercent: number;
  probeTimeoutMillis: number;
  autoRefreshInterval: number;
}

/**
 * Redis 基础运行指标与键空间
 */
export interface RedisInfoItem {
  version: string;
  redisMode: 'standalone' | 'sentinel' | 'cluster';
  port: number;
  runDays: number;
  connectedClients: number;
  connectedClientsPeak: number;
  blockedClients: number;
  usedMemoryHuman: string;
  usedMemoryBytes: number;
  usedMemoryRssHuman: string;
  usedMemoryPeakHuman: string;
  maxMemoryHuman: string;
  maxMemoryBytes: number;
  maxMemoryPolicy: string;
  memFragmentationRatio: number; // 碎片率
  keyspaceHits: number;
  keyspaceMisses: number;
  hitRate: number; // 命中率 %
  instantaneousOpsPerSec: number; // QPS
  totalKeys: number;
  expiredKeys: number;
  evictedKeys: number;
  aofEnabled: boolean;
  rdbLastSaveStatus: string;
  rdbLastSaveTime: string;
}

/**
 * Redis 核心配置项
 */
export interface RedisConfigItem {
  key: string;
  value: string;
  description: string;
  defaultValue: string;
  category: 'memory' | 'persistence' | 'network' | 'client' | 'general';
  dynamicEditable: boolean;
}

/**
 * Redis DB 数据库键统计
 */
export interface RedisDbStat {
  dbIndex: number;
  dbName: string;
  keys: number;
  expires: number;
  avgTtlMs: number;
}

/**
 * Redis 命令耗时与调用统计
 */
export interface RedisCommandStat {
  command: string;
  calls: number;
  usec: number;
  usecPerCall: number;
  percentage: number;
}

/**
 * 服务器 CPU 详细指标
 */
export interface ServerCpuDetail {
  cpuNum: number;
  cpuModel: string;
  userPercent: number;
  sysPercent: number;
  idlePercent: number;
  waitPercent: number;
  totalPercent: number;
  loadAvg1m: number;
  loadAvg5m: number;
  loadAvg15m: number;
}

/**
 * 服务器内存与交换分区
 */
export interface ServerMemDetail {
  totalGb: number;
  usedGb: number;
  freeGb: number;
  usagePercent: number;
  bufferCachedGb: number;
  swapTotalGb: number;
  swapUsedGb: number;
  swapFreeGb: number;
  swapUsagePercent: number;
}

/**
 * 服务器磁盘挂载点
 */
export interface ServerDiskItem {
  dirName: string;
  sysTypeName: string;
  typeName: string;
  totalGb: number;
  usedGb: number;
  freeGb: number;
  usagePercent: number;
  status: 'normal' | 'warning' | 'danger';
}

/**
 * 服务器网络与 TCP 连接
 */
export interface ServerNetworkItem {
  interfaceName: string;
  ip: string;
  rxSpeedKb: number;
  txSpeedKb: number;
  rxTotalMb: number;
  txTotalMb: number;
  tcpEstablished: number;
  tcpTimeWait: number;
  tcpCloseWait: number;
}

/**
 * 服务器系统档案
 */
export interface ServerSysInfo {
  computerName: string;
  computerIp: string;
  publicIp: string;
  osName: string;
  osArch: string;
  kernelVersion: string;
  uptime: string;
  runtimeEnv: string;
}

/**
 * 服务器完整详细快照
 */
export interface ServerHostDetail {
  id: string;
  sys: ServerSysInfo;
  cpu: ServerCpuDetail;
  mem: ServerMemDetail;
  disks: ServerDiskItem[];
  network: ServerNetworkItem[];
}

/**
 * JVM 深度分代与垃圾回收指标
 */
export interface JvmDetailInfo {
  serviceCode: string;
  chineseName: string;
  jvmName: string;
  jvmVersion: string;
  javaHome: string;
  startTime: string;
  uptime: string;
  initHeapMb: number;
  maxHeapMb: number;
  usedHeapMb: number;
  committedHeapMb: number;
  heapUsagePercent: number;
  edenUsedMb: number;
  edenMaxMb: number;
  oldGenUsedMb: number;
  oldGenMaxMb: number;
  metaspaceUsedMb: number;
  metaspaceMaxMb: number;
  youngGcCount: number;
  youngGcTimeMs: number;
  fullGcCount: number;
  fullGcTimeMs: number;
  threadCount: number;
  peakThreadCount: number;
  daemonThreadCount: number;
  deadlockedThreadCount: number;
}

/**
 * 日志级别与分类
 */
export type LogLevel = 'DEBUG' | 'INFO' | 'WARN' | 'ERROR';

export type LogCategory = 'app' | 'access' | 'slow_sql' | 'redis' | 'gc' | 'system';

/**
 * 运维日志文件资产
 */
export interface OpsLogFileItem {
  id: string;
  fileName: string;
  serviceCode: string;
  serviceName: string;
  category: LogCategory;
  level: LogLevel;
  sizeBytes: number;
  sizeHuman: string;
  lineCount: number;
  updatedAt: string;
  filePath: string;
  compressed: boolean;
}

/**
 * 单条日志行记录
 */
export interface OpsLogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  thread: string;
  logger: string;
  traceId?: string;
  message: string;
  stackTrace?: string;
}

/**
 * 日志大盘统计
 */
export interface OpsLogSummary {
  totalFiles: number;
  totalSizeBytes: number;
  totalSizeHuman: string;
  todayErrorCount: number;
  todayWarnCount: number;
  logDiskUsagePercent: number;
}

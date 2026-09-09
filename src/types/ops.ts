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

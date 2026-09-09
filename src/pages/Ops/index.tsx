import {
  AlertOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudServerOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  ExclamationCircleOutlined,
  HddOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  message,
  Popconfirm,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tabs,
  Tag,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  acknowledgeAlert,
  getOpsAlertRules,
  getOpsAlerts,
  getOpsDependencies,
  getOpsHosts,
  getOpsResourcePolicy,
  getOpsServices,
  getOpsSummaryStats,
  triggerServiceProbe,
} from '@/api/ops';
import { useThemeStore } from '@/store/theme';
import type {
  OpsAlertEventItem,
  OpsAlertRuleItem,
  OpsDependencyItem,
  OpsHostItem,
  OpsResourcePolicy,
  OpsServiceItem,
  OpsSummaryStats,
} from '@/types';
import { AlertRulesModal } from './components/AlertRulesModal';
import { ResourcePolicyModal } from './components/ResourcePolicyModal';
import { ServiceDetailDrawer } from './components/ServiceDetailDrawer';

const { Text } = Typography;

export const OpsDashboardPage: React.FC = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const { token } = theme.useToken();

  const [loading, setLoading] = useState<boolean>(false);
  const [environment, setEnvironment] = useState<string>('production');
  const [autoRefresh, setAutoRefresh] = useState<boolean>(true);
  const [refreshCountdown, setRefreshCountdown] = useState<number>(30);

  // 数据状态
  const [stats, setStats] = useState<OpsSummaryStats>({
    healthScore: 95,
    totalServices: 8,
    upServices: 7,
    downServices: 0,
    degradedServices: 1,
    activeAlerts: 2,
    hostCount: 2,
    cpuAvgUsage: 40,
    memoryAvgUsage: 63,
    jvmHeapAvgUsage: 53,
  });

  const [services, setServices] = useState<OpsServiceItem[]>([]);
  const [dependencies, setDependencies] = useState<OpsDependencyItem[]>([]);
  const [hosts, setHosts] = useState<OpsHostItem[]>([]);
  const [alerts, setAlerts] = useState<OpsAlertEventItem[]>([]);
  const [alertRules, setAlertRules] = useState<OpsAlertRuleItem[]>([]);
  const [policy, setPolicy] = useState<OpsResourcePolicy>({
    hostCpuWarningPercent: 80,
    hostCpuCriticalPercent: 90,
    hostMemoryWarningPercent: 70,
    hostMemoryCriticalPercent: 90,
    jvmHeapWarningPercent: 80,
    jvmHeapCriticalPercent: 90,
    probeTimeoutMillis: 1500,
    autoRefreshInterval: 30,
  });

  // 弹窗与抽屉控制
  const [selectedService, setSelectedService] = useState<OpsServiceItem | null>(null);
  const [detailDrawerOpen, setDetailDrawerOpen] = useState<boolean>(false);
  const [rulesModalOpen, setRulesModalOpen] = useState<boolean>(false);
  const [policyModalOpen, setPolicyModalOpen] = useState<boolean>(false);

  // 告警表格筛选
  const [alertSeverityFilter, setAlertSeverityFilter] = useState<string>('all');
  const [alertStateFilter, setAlertStateFilter] = useState<string>('all');

  // 加载全量运维数据
  const loadAllData = useCallback(async (isSilent = false) => {
    if (!isSilent) setLoading(true);
    try {
      const [statsRes, svcsRes, depsRes, hostsRes, alertsRes, rulesRes, policyRes] =
        await Promise.allSettled([
          getOpsSummaryStats(),
          getOpsServices(),
          getOpsDependencies(),
          getOpsHosts(),
          getOpsAlerts(),
          getOpsAlertRules(),
          getOpsResourcePolicy(),
        ]);

      if (statsRes.status === 'fulfilled') setStats(statsRes.value.data);
      if (svcsRes.status === 'fulfilled') setServices(svcsRes.value.data);
      if (depsRes.status === 'fulfilled') setDependencies(depsRes.value.data);
      if (hostsRes.status === 'fulfilled') setHosts(hostsRes.value.data);
      if (alertsRes.status === 'fulfilled') setAlerts(alertsRes.value.data);
      if (rulesRes.status === 'fulfilled') setAlertRules(rulesRes.value.data);
      if (policyRes.status === 'fulfilled') setPolicy(policyRes.value.data);
    } catch {
      message.error('加载系统运维数据异常');
    } finally {
      if (!isSilent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAllData();
  }, [loadAllData]);

  // 自动轮询定时器
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (!autoRefresh) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    setRefreshCountdown(policy.autoRefreshInterval || 30);
    timerRef.current = setInterval(() => {
      setRefreshCountdown((prev) => {
        if (prev <= 1) {
          loadAllData(true);
          return policy.autoRefreshInterval || 30;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoRefresh, policy.autoRefreshInterval, loadAllData]);

  // 手动单个探活探测
  const handleProbeService = async (service: OpsServiceItem) => {
    try {
      const res = await triggerServiceProbe(service.id);
      if (res.code === 200 && res.data) {
        message.success(`服务「${service.name}」探针探测成功 (${res.data.responseTime}ms)`);
        setServices((prev) => prev.map((item) => (item.id === service.id ? res.data : item)));
      }
    } catch {
      message.error('探测失败');
    }
  };

  // 告警确认处置
  const handleAcknowledgeAlert = async (alertId: string) => {
    try {
      const res = await acknowledgeAlert(alertId);
      if (res.code === 200) {
        message.success('告警已确认处置');
        setAlerts((prev) => prev.map((a) => (a.id === alertId ? { ...a, acknowledged: true } : a)));
      }
    } catch {
      message.error('处置失败');
    }
  };

  // 服务状态标签
  const renderStatusTag = (status: string) => {
    switch (status) {
      case 'UP':
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            正常 (UP)
          </Tag>
        );
      case 'DOWN':
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            离线 (DOWN)
          </Tag>
        );
      case 'DEGRADED':
        return (
          <Tag color="warning" icon={<ExclamationCircleOutlined />}>
            降级 (DEGRADED)
          </Tag>
        );
      default:
        return (
          <Tag color="default" icon={<QuestionCircleOutlined />}>
            未知 (UNKNOWN)
          </Tag>
        );
    }
  };

  // 过滤后的告警列表
  const filteredAlerts = alerts.filter((alert) => {
    const matchSev = alertSeverityFilter === 'all' || alert.severity === alertSeverityFilter;
    const matchState = alertStateFilter === 'all' || alert.state === alertStateFilter;
    return matchSev && matchState;
  });

  // 微服务表格列定义
  const serviceColumns: TableProps<OpsServiceItem>['columns'] = [
    {
      title: '服务名称 / 业务标识',
      dataIndex: 'name',
      key: 'name',
      width: 200,
      render: (name: string, record) => (
        <Space direction="vertical" size={2}>
          <span style={{ fontWeight: 600 }}>{name}</span>
          <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
            {record.chineseName}
          </span>
        </Space>
      ),
    },
    {
      title: '部署版本',
      dataIndex: 'version',
      key: 'version',
      width: 140,
      render: (v: string) => <Tag color="blue">{v}</Tag>,
    },
    {
      title: '宿主节点与端口',
      key: 'endpoint',
      width: 170,
      render: (_, r) => (
        <code>
          {r.host}:{r.port}
        </code>
      ),
    },
    {
      title: '探针健康状态',
      dataIndex: 'status',
      key: 'status',
      width: 140,
      render: (status: string) => renderStatusTag(status),
    },
    {
      title: '探针延时',
      dataIndex: 'responseTime',
      key: 'responseTime',
      width: 110,
      sorter: (a, b) => a.responseTime - b.responseTime,
      render: (ms: number) => {
        let color = '#52c41a';
        if (ms > 100) color = '#ff4d4f';
        else if (ms > 50) color = '#faad14';
        return <strong style={{ color }}>{ms} ms</strong>;
      },
    },
    {
      title: 'JVM 堆占用',
      dataIndex: 'jvmHeapUsage',
      key: 'jvmHeapUsage',
      width: 160,
      sorter: (a, b) => a.jvmHeapUsage - b.jvmHeapUsage,
      render: (pct: number) => (
        <Space style={{ width: '100%' }}>
          <Progress
            percent={pct}
            size="small"
            status={pct > 80 ? 'exception' : 'normal'}
            strokeColor={pct > 80 ? '#ff4d4f' : pct > 60 ? '#faad14' : '#52c41a'}
          />
        </Space>
      ),
    },
    {
      title: '实例数',
      dataIndex: 'instanceCount',
      key: 'instanceCount',
      width: 90,
      render: (cnt: number) => <Badge count={cnt} showZero color="#108ee9" />,
    },
    {
      title: '最近探测时间',
      dataIndex: 'lastProbeTime',
      key: 'lastProbeTime',
      width: 170,
      render: (t: string) => (
        <span style={{ fontSize: 12, color: token.colorTextSecondary }}>{t}</span>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      fixed: 'right',
      width: 140,
      render: (_, r) => (
        <Space size={8}>
          <Button type="link" size="small" onClick={() => handleProbeService(r)}>
            探测
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              setSelectedService(r);
              setDetailDrawerOpen(true);
            }}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  // 告警表格列定义
  const alertColumns: TableProps<OpsAlertEventItem>['columns'] = [
    {
      title: '严重级别',
      dataIndex: 'severity',
      key: 'severity',
      width: 110,
      render: (sev: string) => {
        if (sev === 'CRITICAL') return <Tag color="error">严重 P0</Tag>;
        if (sev === 'WARNING') return <Tag color="warning">警告 P1</Tag>;
        return <Tag color="blue">提示 P2</Tag>;
      },
    },
    {
      title: '告警状态',
      dataIndex: 'state',
      key: 'state',
      width: 110,
      render: (state: string) =>
        state === 'FIRING' ? (
          <Badge status="error" text="触发中" />
        ) : (
          <Badge status="success" text="已恢复" />
        ),
    },
    {
      title: '告警规则与对象',
      key: 'ruleTarget',
      width: 240,
      render: (_, r) => (
        <Space direction="vertical" size={2}>
          <span style={{ fontWeight: 600 }}>{r.ruleName}</span>
          <span style={{ fontSize: 12, color: token.colorTextSecondary }}>
            目标: <code>{r.target}</code>
          </span>
        </Space>
      ),
    },
    {
      title: '指标触碰详情',
      key: 'metrics',
      width: 180,
      render: (_, r) => (
        <span>
          当前:{' '}
          <strong style={{ color: '#cf1322' }}>
            {r.currentValue} {r.unit}
          </strong>{' '}
          (阈值: {r.threshold} {r.unit})
        </span>
      ),
    },
    {
      title: '触发时间',
      dataIndex: 'triggeredAt',
      key: 'triggeredAt',
      width: 170,
    },
    {
      title: '告警描述',
      dataIndex: 'message',
      key: 'message',
      ellipsis: true,
    },
    {
      title: '处置操作',
      key: 'action',
      fixed: 'right',
      width: 110,
      render: (_, r) =>
        r.acknowledged ? (
          <Tag color="default">已确认</Tag>
        ) : (
          <Popconfirm
            title="确认已处置该告警？"
            onConfirm={() => handleAcknowledgeAlert(r.id)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" size="small">
              确认处置
            </Button>
          </Popconfirm>
        ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 顶部控制栏与环境切换 */}
      <Card
        variant="borderless"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          borderRadius: 8,
          background: token.colorBgContainer,
        }}
      >
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 16,
          }}
        >
          <Space size={12} align="center">
            <DashboardOutlined style={{ fontSize: 24, color: token.colorPrimary }} />
            <div>
              <div style={{ fontSize: 18, fontWeight: 600 }}>系统运维与微服务监控中心</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                全方位覆盖服务健康探针、基础设施中间件拓扑、实时告警及宿主机资源监控
              </Text>
            </div>
          </Space>

          <Space wrap size={16} align="center">
            <Space size={6}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                运行环境:
              </Text>
              <Select
                value={environment}
                onChange={setEnvironment}
                style={{ width: 140 }}
                options={[
                  { label: '🟢 生产集群 (Prod)', value: 'production' },
                  { label: '🟡 预发验证 (Stage)', value: 'staging' },
                  { label: '🔵 本地开发 (Local)', value: 'local' },
                ]}
              />
            </Space>

            <Space size={8}>
              <Switch
                checked={autoRefresh}
                onChange={setAutoRefresh}
                checkedChildren="自动刷新"
                unCheckedChildren="暂停"
              />
              {autoRefresh && (
                <Tag color="cyan" style={{ margin: 0 }}>
                  {refreshCountdown}s 后同步
                </Tag>
              )}
            </Space>

            <Button
              type="primary"
              icon={<ReloadOutlined />}
              loading={loading}
              onClick={() => loadAllData()}
            >
              全量探测刷新
            </Button>

            <Button icon={<SettingOutlined />} onClick={() => setPolicyModalOpen(true)}>
              策略配置
            </Button>
          </Space>
        </div>
      </Card>

      {/* 4 个顶层 KPI 统计看板 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              borderLeft: `4px solid ${stats.healthScore >= 90 ? '#52c41a' : '#faad14'}`,
            }}
          >
            <Statistic
              title={
                <Space>
                  <ThunderboltOutlined
                    style={{ color: stats.healthScore >= 90 ? '#52c41a' : '#faad14' }}
                  />
                  <span>集群综合健康评分</span>
                </Space>
              }
              value={stats.healthScore}
              suffix="/ 100 分"
              styles={{
                content: {
                  color: stats.healthScore >= 90 ? '#52c41a' : '#faad14',
                  fontWeight: 600,
                },
              }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: token.colorTextSecondary }}>
              <span>正常: </span>
              <strong style={{ color: '#52c41a' }}>{stats.upServices}</strong>
              <span style={{ margin: '0 6px' }}>|</span>
              <span>降级: </span>
              <strong style={{ color: '#faad14' }}>{stats.degradedServices}</strong>
              <span style={{ margin: '0 6px' }}>|</span>
              <span>离线: </span>
              <strong style={{ color: '#ff4d4f' }}>{stats.downServices}</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              borderLeft: '4px solid #1677ff',
            }}
          >
            <Statistic
              title={
                <Space>
                  <CloudServerOutlined style={{ color: '#1677ff' }} />
                  <span>核心微服务资产</span>
                </Space>
              }
              value={stats.totalServices}
              suffix="个服务"
              styles={{ content: { color: '#1677ff', fontWeight: 600 } }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: token.colorTextSecondary }}>
              <span>宿主物理节点: </span>
              <strong>{stats.hostCount} 台</strong>
              <span style={{ margin: '0 6px' }}>|</span>
              <span>探针就绪率 100%</span>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              borderLeft: `4px solid ${stats.activeAlerts > 0 ? '#faad14' : '#52c41a'}`,
            }}
          >
            <Statistic
              title={
                <Space>
                  <AlertOutlined
                    style={{ color: stats.activeAlerts > 0 ? '#faad14' : '#52c41a' }}
                  />
                  <span>当前活跃告警事件</span>
                </Space>
              }
              value={stats.activeAlerts}
              suffix="条触发中"
              styles={{
                content: {
                  color: stats.activeAlerts > 0 ? '#faad14' : '#52c41a',
                  fontWeight: 600,
                },
              }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: token.colorTextSecondary }}>
              <span>监控规则总数: </span>
              <strong>{alertRules.length} 条已启用</strong>
            </div>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              borderLeft: '4px solid #722ed1',
            }}
          >
            <Statistic
              title={
                <Space>
                  <HddOutlined style={{ color: '#722ed1' }} />
                  <span>集群资源平均负荷</span>
                </Space>
              }
              value={stats.memoryAvgUsage}
              suffix="% 内存"
              styles={{ content: { color: '#722ed1', fontWeight: 600 } }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: token.colorTextSecondary }}>
              <span>平均 CPU: </span>
              <strong>{stats.cpuAvgUsage}%</strong>
              <span style={{ margin: '0 6px' }}>|</span>
              <span>JVM 堆均值: </span>
              <strong>{stats.jvmHeapAvgUsage}%</strong>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 核心 Tab 功能分栏 */}
      <Card
        variant="borderless"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          borderRadius: 8,
          background: token.colorBgContainer,
        }}
      >
        <Tabs
          defaultActiveKey="overview"
          items={[
            {
              key: 'overview',
              label: (
                <Space>
                  <DashboardOutlined />
                  <span>监控总览与拓扑</span>
                </Space>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                  {/* 微服务健康状态栅格卡片 */}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>
                      微服务集群健康探测矩阵
                    </div>
                    <Row gutter={[12, 12]}>
                      {services.map((svc) => (
                        <Col xs={24} sm={12} md={8} lg={6} key={svc.id}>
                          <Card
                            size="small"
                            hoverable
                            onClick={() => {
                              setSelectedService(svc);
                              setDetailDrawerOpen(true);
                            }}
                            style={{
                              borderRadius: 6,
                              borderColor:
                                svc.status === 'DOWN'
                                  ? '#ff4d4f'
                                  : svc.status === 'DEGRADED'
                                    ? '#faad14'
                                    : token.colorBorderSecondary,
                            }}
                          >
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 6,
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>{svc.name}</span>
                              {renderStatusTag(svc.status)}
                            </div>
                            <div
                              style={{
                                fontSize: 12,
                                color: token.colorTextSecondary,
                                display: 'flex',
                                justifyContent: 'space-between',
                              }}
                            >
                              <span>{svc.chineseName}</span>
                              <span>{svc.responseTime} ms</span>
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>

                  {/* 中间件基础设施状态 */}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>
                      中间件与核心基础设施 (Dependencies)
                    </div>
                    <Row gutter={[16, 16]}>
                      {dependencies.map((dep) => (
                        <Col xs={24} sm={12} md={6} key={dep.name}>
                          <Card
                            size="small"
                            title={
                              <Space>
                                <DatabaseOutlined style={{ color: token.colorPrimary }} />
                                <span>{dep.name}</span>
                              </Space>
                            }
                            extra={renderStatusTag(dep.status)}
                            style={{ borderRadius: 6 }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                              <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
                                {dep.description}
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: 12,
                                }}
                              >
                                <span>连接池:</span>
                                <strong>
                                  {dep.connectionCount} / {dep.maxConnectionCount}
                                </strong>
                              </div>
                              <div
                                style={{
                                  display: 'flex',
                                  justifyContent: 'space-between',
                                  fontSize: 12,
                                }}
                              >
                                <span>网络延时:</span>
                                <strong style={{ color: '#52c41a' }}>{dep.latencyMs} ms</strong>
                              </div>
                              {dep.memoryUsage && (
                                <div
                                  style={{
                                    display: 'flex',
                                    justifyContent: 'space-between',
                                    fontSize: 12,
                                  }}
                                >
                                  <span>内存消耗:</span>
                                  <strong>{dep.memoryUsage}</strong>
                                </div>
                              )}
                            </div>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>

                  {/* 宿主机硬件资源 */}
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>
                      宿主机计算节点资源负荷
                    </div>
                    <Row gutter={[16, 16]}>
                      {hosts.map((host) => (
                        <Col xs={24} sm={12} key={host.id}>
                          <Card
                            size="small"
                            title={
                              <Space>
                                <CloudServerOutlined />
                                <span>
                                  {host.hostName} ({host.ip})
                                </span>
                              </Space>
                            }
                            extra={<Tag color="cyan">{host.os}</Tag>}
                            style={{ borderRadius: 6 }}
                          >
                            <Descriptions
                              size="small"
                              column={2}
                              bordered
                              styles={{
                                label: {
                                  background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#fafafa',
                                },
                              }}
                            >
                              <Descriptions.Item label="CPU 核心与占用">
                                <Space>
                                  <span>{host.cpuCores} 核</span>
                                  <Progress
                                    percent={host.cpuUsage}
                                    size="small"
                                    style={{ width: 100 }}
                                  />
                                </Space>
                              </Descriptions.Item>
                              <Descriptions.Item label="内存利用率">
                                <Space>
                                  <span>
                                    {host.memoryUsed}G / {host.memoryTotal}G
                                  </span>
                                  <Progress
                                    percent={host.memoryUsage}
                                    size="small"
                                    status={host.memoryUsage > 70 ? 'exception' : 'normal'}
                                    strokeColor={host.memoryUsage > 70 ? '#faad14' : '#52c41a'}
                                    style={{ width: 100 }}
                                  />
                                </Space>
                              </Descriptions.Item>
                              <Descriptions.Item label="磁盘空间占用">
                                <span>
                                  {host.diskUsed}G / {host.diskTotal}G ({host.diskUsage}%)
                                </span>
                              </Descriptions.Item>
                              <Descriptions.Item label="系统负载 (1/5/15m)">
                                <code>{host.loadAverage.join(' / ')}</code>
                              </Descriptions.Item>
                            </Descriptions>
                          </Card>
                        </Col>
                      ))}
                    </Row>
                  </div>
                </div>
              ),
            },
            {
              key: 'services',
              label: (
                <Space>
                  <CloudServerOutlined />
                  <span>微服务与健康探针</span>
                </Space>
              ),
              children: (
                <div>
                  <Table<OpsServiceItem>
                    rowKey="id"
                    columns={serviceColumns}
                    dataSource={services}
                    loading={loading}
                    pagination={false}
                    bordered
                    scroll={{ x: 1200 }}
                  />
                </div>
              ),
            },
            {
              key: 'alerts',
              label: (
                <Space>
                  <AlertOutlined />
                  <span>实时告警事件中心</span>
                  {stats.activeAlerts > 0 && <Badge count={stats.activeAlerts} size="small" />}
                </Space>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {/* 告警过滤工具条 */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: 12,
                    }}
                  >
                    <Space size={12}>
                      <Select
                        value={alertSeverityFilter}
                        onChange={setAlertSeverityFilter}
                        style={{ width: 140 }}
                        options={[
                          { label: '全部等级', value: 'all' },
                          { label: '🚨 严重 (P0)', value: 'CRITICAL' },
                          { label: '⚠️ 预警 (P1)', value: 'WARNING' },
                          { label: 'ℹ️ 提示 (P2)', value: 'INFO' },
                        ]}
                      />
                      <Select
                        value={alertStateFilter}
                        onChange={setAlertStateFilter}
                        style={{ width: 130 }}
                        options={[
                          { label: '全部状态', value: 'all' },
                          { label: '🔥 触发中', value: 'FIRING' },
                          { label: '✅ 已恢复', value: 'RESOLVED' },
                        ]}
                      />
                    </Space>

                    <Button icon={<SettingOutlined />} onClick={() => setRulesModalOpen(true)}>
                      查看告警规则目录 ({alertRules.length})
                    </Button>
                  </div>

                  <Table<OpsAlertEventItem>
                    rowKey="id"
                    columns={alertColumns}
                    dataSource={filteredAlerts}
                    loading={loading}
                    pagination={false}
                    bordered
                    scroll={{ x: 1100 }}
                  />
                </div>
              ),
            },
            {
              key: 'resources',
              label: (
                <Space>
                  <HddOutlined />
                  <span>JVM 性能与监控策略</span>
                </Space>
              ),
              children: (
                <Row gutter={[16, 16]}>
                  <Col xs={24} md={12}>
                    <Card title="JVM 运行时堆内存快照" size="small" style={{ borderRadius: 6 }}>
                      <Descriptions
                        bordered
                        size="small"
                        column={1}
                        styles={{
                          label: {
                            background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#fafafa',
                            width: 160,
                          },
                        }}
                      >
                        <Descriptions.Item label="堆内存利用率 (Heap)">
                          <Progress percent={stats.jvmHeapAvgUsage} status="active" />
                        </Descriptions.Item>
                        <Descriptions.Item label="已提交堆容量 (Committed)">
                          <code>1024 MB (固定预分配)</code>
                        </Descriptions.Item>
                        <Descriptions.Item label="最大堆上限 (Max Heap)">
                          <code>2048 MB (-Xmx2g)</code>
                        </Descriptions.Item>
                        <Descriptions.Item label="非堆元空间 (Metaspace)">
                          <code>142 MB / 256 MB (55.4%)</code>
                        </Descriptions.Item>
                        <Descriptions.Item label="垃圾收集器 (GC)">
                          <code>G1GC (年轻代耗时均值 12ms)</code>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>

                  <Col xs={24} md={12}>
                    <Card
                      title="当前生效的阈值策略 (Policy)"
                      size="small"
                      extra={
                        <Button
                          type="link"
                          icon={<SettingOutlined />}
                          onClick={() => setPolicyModalOpen(true)}
                        >
                          调整策略
                        </Button>
                      }
                      style={{ borderRadius: 6 }}
                    >
                      <Descriptions
                        bordered
                        size="small"
                        column={1}
                        styles={{
                          label: {
                            background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#fafafa',
                            width: 180,
                          },
                        }}
                      >
                        <Descriptions.Item label="宿主机 CPU 阈值">
                          <span>
                            警告: <strong>{policy.hostCpuWarningPercent}%</strong> / 严重:{' '}
                            <strong style={{ color: '#ff4d4f' }}>
                              {policy.hostCpuCriticalPercent}%
                            </strong>
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="宿主机内存阈值">
                          <span>
                            警告: <strong>{policy.hostMemoryWarningPercent}%</strong> / 严重:{' '}
                            <strong style={{ color: '#ff4d4f' }}>
                              {policy.hostMemoryCriticalPercent}%
                            </strong>
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="JVM 堆内存阈值">
                          <span>
                            警告: <strong>{policy.jvmHeapWarningPercent}%</strong> / 严重:{' '}
                            <strong style={{ color: '#ff4d4f' }}>
                              {policy.jvmHeapCriticalPercent}%
                            </strong>
                          </span>
                        </Descriptions.Item>
                        <Descriptions.Item label="探针超时时限">
                          <span>{policy.probeTimeoutMillis} 毫秒 (超限视作降级)</span>
                        </Descriptions.Item>
                        <Descriptions.Item label="自动刷新周期">
                          <span>每 {policy.autoRefreshInterval} 秒自动同步</span>
                        </Descriptions.Item>
                      </Descriptions>
                    </Card>
                  </Col>
                </Row>
              ),
            },
          ]}
        />
      </Card>

      {/* 弹窗与抽屉 */}
      <ServiceDetailDrawer
        open={detailDrawerOpen}
        service={selectedService}
        onClose={() => setDetailDrawerOpen(false)}
        onProbeSuccess={(updated) => {
          setServices((prev) => prev.map((s) => (s.id === updated.id ? updated : s)));
        }}
      />

      <AlertRulesModal
        open={rulesModalOpen}
        rules={alertRules}
        onClose={() => setRulesModalOpen(false)}
      />

      <ResourcePolicyModal
        open={policyModalOpen}
        policy={policy}
        onClose={() => setPolicyModalOpen(false)}
        onSuccess={(updated) => setPolicy(updated)}
      />
    </div>
  );
};

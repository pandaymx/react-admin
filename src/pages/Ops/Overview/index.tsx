import {
  AlertOutlined,
  ArrowRightOutlined,
  CheckCircleOutlined,
  CloudServerOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  HddOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  message,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getOpsAlerts, getOpsDependencies, getOpsServices, getOpsSummaryStats } from '@/api/ops';
import type {
  OpsAlertEventItem,
  OpsDependencyItem,
  OpsServiceItem,
  OpsSummaryStats,
} from '@/types';

const { Title, Text } = Typography;

export const OpsOverviewPage: React.FC = () => {
  const {
    token: {
      colorBgContainer,
      colorBorderSecondary,
      borderRadiusLG,
      colorPrimary,
      colorSuccess,
      colorWarning,
      colorError,
    },
  } = theme.useToken();

  const navigate = useNavigate();
  const [loading, setLoading] = useState<boolean>(false);
  const [env, setEnv] = useState<'prod' | 'staging' | 'test' | 'dev'>('prod');
  const [stats, setStats] = useState<OpsSummaryStats | null>(null);
  const [services, setServices] = useState<OpsServiceItem[]>([]);
  const [dependencies, setDependencies] = useState<OpsDependencyItem[]>([]);
  const [alerts, setAlerts] = useState<OpsAlertEventItem[]>([]);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [statsRes, servicesRes, depsRes, alertsRes] = await Promise.all([
        getOpsSummaryStats(),
        getOpsServices(env),
        getOpsDependencies(env),
        getOpsAlerts(),
      ]);

      if (statsRes.code === 200) setStats(statsRes.data);
      if (servicesRes.code === 200) setServices(servicesRes.data);
      if (depsRes.code === 200) setDependencies(depsRes.data);
      if (alertsRes.code === 200) setAlerts(alertsRes.data);

      setLastRefreshed(new Date().toLocaleTimeString());
    } catch {
      message.error('加载系统运维大盘数据失败');
    } finally {
      setLoading(false);
    }
  }, [env]);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(timer);
  }, [loadData]);

  const activeAlerts = alerts.filter((a) => !a.acknowledged);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 顶部控制栏 */}
      <Card
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="middle">
              <DashboardOutlined style={{ fontSize: 24, color: colorPrimary }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  系统运维与集群全景大盘
                </Title>
                <Text type="secondary">
                  多微服务节点健康拓扑、中间件集群状态流、服务器资源水位与全局运维入口
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text type="secondary">所属环境：</Text>
              <Select
                value={env}
                onChange={setEnv}
                style={{ width: 140 }}
                options={[
                  { label: '生产集群 (Prod)', value: 'prod' },
                  { label: '预发布环境 (Staging)', value: 'staging' },
                  { label: '集成测试 (Test)', value: 'test' },
                  { label: '开发测试 (Dev)', value: 'dev' },
                ]}
              />
              <Button icon={<ReloadOutlined spin={loading} />} onClick={loadData} loading={loading}>
                刷新
              </Button>
              {lastRefreshed && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  更新: {lastRefreshed}
                </Text>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* KPI 指标看板 */}
      {stats && (
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                borderRadius: borderRadiusLG,
                background: colorBgContainer,
                border: `1px solid ${colorBorderSecondary}`,
              }}
            >
              <Statistic
                title="集群综合健康度"
                value={stats.healthScore}
                suffix="/ 100"
                valueStyle={{
                  color: stats.healthScore >= 90 ? colorSuccess : colorWarning,
                  fontWeight: 'bold',
                }}
                prefix={<CheckCircleOutlined />}
              />
              <div style={{ marginTop: 8 }}>
                <Progress percent={stats.healthScore} size="small" strokeColor={colorSuccess} />
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                borderRadius: borderRadiusLG,
                background: colorBgContainer,
                border: `1px solid ${colorBorderSecondary}`,
              }}
            >
              <Statistic
                title="微服务运行正常率"
                value={stats.upServices}
                suffix={`/ ${stats.totalServices}`}
                valueStyle={{ color: colorPrimary, fontWeight: 'bold' }}
                prefix={<CloudServerOutlined />}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">亚健康: {stats.degradedServices}</Text>
                <Tag color="green">
                  健康率 {((stats.upServices / stats.totalServices) * 100).toFixed(0)}%
                </Tag>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                borderRadius: borderRadiusLG,
                background: colorBgContainer,
                border: `1px solid ${colorBorderSecondary}`,
              }}
            >
              <Statistic
                title="未处置告警事件"
                value={activeAlerts.length}
                valueStyle={{
                  color: activeAlerts.length > 0 ? colorError : colorSuccess,
                  fontWeight: 'bold',
                }}
                prefix={<AlertOutlined />}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">总告警: {alerts.length}</Text>
                <Tag color={activeAlerts.length > 0 ? 'red' : 'green'}>
                  {activeAlerts.length > 0 ? '待管理员处理' : '全部已确认'}
                </Tag>
              </div>
            </Card>
          </Col>

          <Col xs={24} sm={12} lg={6}>
            <Card
              style={{
                borderRadius: borderRadiusLG,
                background: colorBgContainer,
                border: `1px solid ${colorBorderSecondary}`,
              }}
            >
              <Statistic
                title="宿主平均 CPU / 内存"
                value={`${stats.cpuAvgUsage}% / ${stats.memoryAvgUsage}%`}
                valueStyle={{ color: colorPrimary, fontWeight: 'bold' }}
                prefix={<HddOutlined />}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">JVM 堆: {stats.jvmHeapAvgUsage}%</Text>
                <Tag color="blue">{stats.hostCount} 个节点</Tag>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* 快捷导航入口栏 */}
      <Card
        title={
          <Space>
            <ThunderboltOutlined style={{ color: colorPrimary }} />
            <span>运维专业子模块快捷直达</span>
          </Space>
        }
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card
              hoverable
              size="small"
              onClick={() => navigate('/ops/server')}
              style={{ textAlign: 'center', borderColor: colorBorderSecondary }}
            >
              <HddOutlined style={{ fontSize: 28, color: colorPrimary, marginBottom: 8 }} />
              <div style={{ fontWeight: 600 }}>服务器监控</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                CPU/内存/多磁盘/网络
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card
              hoverable
              size="small"
              onClick={() => navigate('/ops/redis')}
              style={{ textAlign: 'center', borderColor: colorBorderSecondary }}
            >
              <DatabaseOutlined style={{ fontSize: 28, color: '#f5222d', marginBottom: 8 }} />
              <div style={{ fontWeight: 600 }}>Redis 监控</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                内存碎片/命中率/配置表
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card
              hoverable
              size="small"
              onClick={() => navigate('/ops/services')}
              style={{ textAlign: 'center', borderColor: colorBorderSecondary }}
            >
              <CloudServerOutlined style={{ fontSize: 28, color: colorSuccess, marginBottom: 8 }} />
              <div style={{ fontWeight: 600 }}>微服务探针</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                8大微服务心跳与探针
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card
              hoverable
              size="small"
              onClick={() => navigate('/ops/jvm')}
              style={{ textAlign: 'center', borderColor: colorBorderSecondary }}
            >
              <DashboardOutlined style={{ fontSize: 28, color: '#722ed1', marginBottom: 8 }} />
              <div style={{ fontWeight: 600 }}>JVM 监控</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                堆分代/GC统计/线程大盘
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card
              hoverable
              size="small"
              onClick={() => navigate('/ops/alerts')}
              style={{ textAlign: 'center', borderColor: colorBorderSecondary }}
            >
              <AlertOutlined style={{ fontSize: 28, color: colorWarning, marginBottom: 8 }} />
              <div style={{ fontWeight: 600 }}>告警中心</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                规则目录/阈值策略设置
              </Text>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8} lg={4}>
            <Card
              hoverable
              size="small"
              onClick={loadData}
              style={{ textAlign: 'center', borderColor: colorBorderSecondary }}
            >
              <ReloadOutlined style={{ fontSize: 28, color: '#13c2c2', marginBottom: 8 }} />
              <div style={{ fontWeight: 600 }}>一键巡检</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                全链路健康度探测
              </Text>
            </Card>
          </Col>
        </Row>
      </Card>

      {/* 微服务集群拓扑卡片流 */}
      <Card
        title={
          <Space>
            <CloudServerOutlined style={{ color: colorPrimary }} />
            <span>核心微服务运行拓扑</span>
            <Tag color="blue">8 个微服务</Tag>
          </Space>
        }
        extra={
          <Button type="link" onClick={() => navigate('/ops/services')}>
            查看微服务探针详情 <ArrowRightOutlined />
          </Button>
        }
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <Row gutter={[16, 16]}>
          {services.map((svc) => (
            <Col xs={24} sm={12} md={8} lg={6} key={svc.id}>
              <Card
                size="small"
                style={{
                  borderRadius: 8,
                  borderColor: svc.status === 'UP' ? colorBorderSecondary : colorWarning,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text strong>{svc.chineseName}</Text>
                  {svc.status === 'UP' ? (
                    <Badge status="success" text="UP" />
                  ) : svc.status === 'DEGRADED' ? (
                    <Badge status="warning" text="DEGRADED" />
                  ) : (
                    <Badge status="error" text="DOWN" />
                  )}
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>
                  <code>
                    {svc.name}:{svc.port}
                  </code>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <Text type="secondary">响应: {svc.responseTime}ms</Text>
                  <Text type="secondary">CPU: {svc.cpuUsage}%</Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>

      {/* 基础设施与中间件拓扑 */}
      <Card
        title={
          <Space>
            <DatabaseOutlined style={{ color: colorPrimary }} />
            <span>中间件与基础设施拓扑</span>
            <Tag color="purple">4 个高可用组件</Tag>
          </Space>
        }
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <Row gutter={[16, 16]}>
          {dependencies.map((dep) => (
            <Col xs={24} sm={12} lg={6} key={dep.name}>
              <Card size="small" style={{ borderRadius: 8, borderColor: colorBorderSecondary }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text strong>{dep.name}</Text>
                  <Badge status={dep.status === 'UP' ? 'success' : 'warning'} text={dep.status} />
                </div>
                <div style={{ fontSize: 12, color: '#8c8c8c', marginBottom: 6 }}>
                  {dep.description}
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
                  <Text type="secondary">延时: {dep.latencyMs}ms</Text>
                  <Text type="secondary">
                    连接: {dep.connectionCount}/{dep.maxConnectionCount}
                  </Text>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      </Card>
    </div>
  );
};

export default OpsOverviewPage;

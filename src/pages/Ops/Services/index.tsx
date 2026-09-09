import {
  CloudServerOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  Input,
  message,
  Progress,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  theme,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { getOpsServices, triggerServiceProbe } from '@/api/ops';
import type { OpsServiceItem } from '@/types';
import { ServiceDetailDrawer } from '../components/ServiceDetailDrawer';

const { Title, Text } = Typography;

export const OpsServicesPage: React.FC = () => {
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

  const [loading, setLoading] = useState(false);
  const [env, setEnv] = useState<'prod' | 'staging' | 'test' | 'dev'>('prod');
  const [services, setServices] = useState<OpsServiceItem[]>([]);
  const [searchText, setSearchText] = useState('');
  const [probingId, setProbingId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<OpsServiceItem | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getOpsServices(env);
      if (res.code === 200 && res.data) {
        setServices(res.data);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch {
      message.error('获取微服务列表失败');
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

  const handleProbe = async (item: OpsServiceItem) => {
    try {
      setProbingId(item.id);
      const res = await triggerServiceProbe(item.id);
      if (res.code === 200 && res.data) {
        message.success(
          `服务 [${item.chineseName}] 心跳健康探活成功，延时: ${res.data.responseTime}ms`,
        );
        loadData();
      }
    } catch {
      message.error(`探测服务 [${item.chineseName}] 失败`);
    } finally {
      setProbingId(null);
    }
  };

  const handleViewDetail = (item: OpsServiceItem) => {
    setSelectedService(item);
    setDrawerOpen(true);
  };

  const filteredServices = services.filter(
    (s) =>
      s.chineseName.includes(searchText) ||
      s.name.includes(searchText) ||
      String(s.port).includes(searchText),
  );

  const columns: ColumnsType<OpsServiceItem> = [
    {
      title: '服务名称',
      key: 'name',
      render: (_, r) => (
        <Space>
          <CloudServerOutlined style={{ color: colorPrimary, fontSize: 16 }} />
          <div>
            <div style={{ fontWeight: 600 }}>{r.chineseName}</div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              <code>{r.name}</code>
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '端口与实例',
      key: 'port',
      render: (_, r) => (
        <div>
          <div>
            端口: <code>{r.port}</code>
          </div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            实例: {r.instanceCount} 节点 ({r.host})
          </Text>
        </div>
      ),
    },
    {
      title: '健康状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        if (status === 'UP') return <Badge status="success" text="正常 (UP)" />;
        if (status === 'DEGRADED') return <Badge status="warning" text="降级 (DEGRADED)" />;
        return <Badge status="error" text="故障 (DOWN)" />;
      },
    },
    {
      title: '响应延时',
      dataIndex: 'responseTime',
      key: 'responseTime',
      width: 130,
      sorter: (a, b) => a.responseTime - b.responseTime,
      render: (ms) => (
        <Text style={{ color: ms > 100 ? colorWarning : colorSuccess, fontWeight: 500 }}>
          {ms} ms
        </Text>
      ),
    },
    {
      title: 'CPU 水位',
      dataIndex: 'cpuUsage',
      key: 'cpuUsage',
      width: 160,
      render: (cpu: number) => (
        <Space style={{ width: '100%' }}>
          <Progress
            percent={cpu}
            size="small"
            strokeColor={cpu > 80 ? colorError : colorPrimary}
            style={{ width: 100, margin: 0 }}
          />
          <Text type="secondary">{cpu}%</Text>
        </Space>
      ),
    },
    {
      title: 'JVM 堆水位',
      dataIndex: 'jvmHeapUsage',
      key: 'jvmHeapUsage',
      width: 160,
      render: (heap: number) => (
        <Space style={{ width: '100%' }}>
          <Progress
            percent={heap}
            size="small"
            strokeColor={heap > 80 ? colorWarning : '#722ed1'}
            style={{ width: 100, margin: 0 }}
          />
          <Text type="secondary">{heap}%</Text>
        </Space>
      ),
    },
    {
      title: '连续运行',
      dataIndex: 'uptime',
      key: 'uptime',
      render: (val) => <Tag>{val}</Tag>,
    },
    {
      title: '操作',
      key: 'action',
      width: 190,
      render: (_, r) => (
        <Space size="small">
          <Button
            size="small"
            type="primary"
            ghost
            icon={<ThunderboltOutlined />}
            loading={probingId === r.id}
            onClick={() => handleProbe(r)}
          >
            心跳探活
          </Button>
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleViewDetail(r)}>
            指标详情
          </Button>
        </Space>
      ),
    },
  ];

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
              <CloudServerOutlined style={{ fontSize: 24, color: colorPrimary }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  微服务集群健康与即时探活
                </Title>
                <Text type="secondary">
                  集中管理 8 大核心微服务注册心跳、端口占用、响应延迟及 HikariCP 连接池快照
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Input
                placeholder="搜索服务名称/端口..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                allowClear
                style={{ width: 220 }}
              />
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

      {/* 微服务表格 */}
      <Card
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <Table<OpsServiceItem>
          rowKey="id"
          columns={columns}
          dataSource={filteredServices}
          pagination={false}
          loading={loading}
        />
      </Card>

      {/* 详情抽屉 */}
      <ServiceDetailDrawer
        open={drawerOpen}
        service={selectedService}
        onClose={() => setDrawerOpen(false)}
        onProbeSuccess={(updated) => {
          setSelectedService(updated);
          loadData();
        }}
      />
    </div>
  );
};

export default OpsServicesPage;

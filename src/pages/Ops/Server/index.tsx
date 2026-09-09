import {
  CloudServerOutlined,
  DashboardOutlined,
  DatabaseOutlined,
  GlobalOutlined,
  HddOutlined,
  InfoCircleOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  message,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { getServerDetail } from '@/api/ops';
import type { ServerDiskItem, ServerHostDetail, ServerNetworkItem } from '@/types';

const { Title, Text } = Typography;

export const OpsServerPage: React.FC = () => {
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
  const [data, setData] = useState<ServerHostDetail | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getServerDetail('host-1', env);
      if (res.code === 200 && res.data) {
        setData(res.data);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch {
      message.error('获取服务器硬件监控数据失败');
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

  if (!data) {
    return (
      <Card
        style={{ borderRadius: borderRadiusLG, background: colorBgContainer }}
        loading={loading}
      >
        <div style={{ height: 400 }} />
      </Card>
    );
  }

  const { sys, cpu, mem, disks, network } = data;

  const diskColumns: ColumnsType<ServerDiskItem> = [
    {
      title: '挂载目录',
      dataIndex: 'dirName',
      key: 'dirName',
      render: (text) => (
        <Space>
          <HddOutlined style={{ color: colorPrimary }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '分区说明',
      dataIndex: 'typeName',
      key: 'typeName',
      render: (text) => <Text type="secondary">{text}</Text>,
    },
    {
      title: '文件系统',
      dataIndex: 'sysTypeName',
      key: 'sysTypeName',
      render: (text) => <Tag>{text}</Tag>,
    },
    {
      title: '总容量',
      dataIndex: 'totalGb',
      key: 'totalGb',
      render: (val) => `${val.toFixed(1)} GB`,
    },
    {
      title: '已用空间',
      dataIndex: 'usedGb',
      key: 'usedGb',
      render: (val) => `${val.toFixed(1)} GB`,
    },
    {
      title: '可用空间',
      dataIndex: 'freeGb',
      key: 'freeGb',
      render: (val) => `${val.toFixed(1)} GB`,
    },
    {
      title: '使用率',
      dataIndex: 'usagePercent',
      key: 'usagePercent',
      width: 260,
      render: (percent: number, record: ServerDiskItem) => {
        let strokeColor = colorSuccess;
        if (record.status === 'warning') strokeColor = colorWarning;
        if (record.status === 'danger') strokeColor = colorError;
        return (
          <Space style={{ width: '100%' }}>
            <Progress
              percent={percent}
              size="small"
              strokeColor={strokeColor}
              style={{ width: 180, margin: 0 }}
            />
            <Text type="secondary">{percent}%</Text>
          </Space>
        );
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        if (status === 'normal') return <Badge status="success" text="正常健康" />;
        if (status === 'warning') return <Badge status="warning" text="容量警戒" />;
        return <Badge status="error" text="严重不足" />;
      },
    },
  ];

  const netColumns: ColumnsType<ServerNetworkItem> = [
    {
      title: '网卡接口',
      dataIndex: 'interfaceName',
      key: 'interfaceName',
      render: (text) => (
        <Space>
          <GlobalOutlined style={{ color: colorPrimary }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '分配 IP',
      dataIndex: 'ip',
      key: 'ip',
      render: (text) => <Text copyable>{text}</Text>,
    },
    {
      title: '实时接收 (RX)',
      dataIndex: 'rxSpeedKb',
      key: 'rxSpeedKb',
      render: (val) => (
        <Text style={{ color: colorSuccess, fontWeight: 500 }}>
          ↓ {(val / 1024).toFixed(2)} MB/s ({val.toFixed(0)} KB/s)
        </Text>
      ),
    },
    {
      title: '实时发送 (TX)',
      dataIndex: 'txSpeedKb',
      key: 'txSpeedKb',
      render: (val) => (
        <Text style={{ color: colorPrimary, fontWeight: 500 }}>
          ↑ {(val / 1024).toFixed(2)} MB/s ({val.toFixed(0)} KB/s)
        </Text>
      ),
    },
    {
      title: '累计接收',
      dataIndex: 'rxTotalMb',
      key: 'rxTotalMb',
      render: (val) => `${(val / 1024).toFixed(2)} GB`,
    },
    {
      title: '累计发送',
      dataIndex: 'txTotalMb',
      key: 'txTotalMb',
      render: (val) => `${(val / 1024).toFixed(2)} GB`,
    },
    {
      title: 'TCP 连接状态',
      key: 'tcp',
      render: (_, r) => (
        <Space size="small">
          <Tag color="green">EST: {r.tcpEstablished}</Tag>
          <Tag color="orange">TW: {r.tcpTimeWait}</Tag>
          <Tag color="red">CW: {r.tcpCloseWait}</Tag>
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
                  服务器与系统硬件监控
                </Title>
                <Text type="secondary">
                  实时探测 Linux 计算节点 CPU 负载、物理内存/Swap 分区、多磁盘挂载点与网络吞吐指标
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
                  更新时间: {lastRefreshed}
                </Text>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 服务器基本档案 */}
      <Card
        title={
          <Space>
            <SafetyCertificateOutlined style={{ color: colorPrimary }} />
            <span>服务器系统档案</span>
            <Tag color="blue">{sys.runtimeEnv}</Tag>
          </Space>
        }
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <Descriptions bordered size="small" column={{ xxl: 4, xl: 4, lg: 2, md: 2, sm: 1, xs: 1 }}>
          <Descriptions.Item label="主机名称">
            <Text strong>{sys.computerName}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="内网 IP">
            <Text copyable>{sys.computerIp}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="公网/网关 IP">
            <Text copyable>{sys.publicIp}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="持续运行时间">
            <Tag color="green">{sys.uptime}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="操作系统">{sys.osName}</Descriptions.Item>
          <Descriptions.Item label="系统内核版本">
            <code>{sys.kernelVersion}</code>
          </Descriptions.Item>
          <Descriptions.Item label="CPU 架构">{sys.osArch}</Descriptions.Item>
          <Descriptions.Item label="运行状态">
            <Badge status="processing" text="在线运行中 (K8s Ready)" />
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* CPU 与 内存 核心看板 */}
      <Row gutter={[16, 16]}>
        {/* CPU 监控 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <DashboardOutlined style={{ color: colorPrimary }} />
                <span>CPU 处理器监控</span>
                <Tag>{cpu.cpuNum} 物理核心</Tag>
              </Space>
            }
            style={{
              height: '100%',
              borderRadius: borderRadiusLG,
              background: colorBgContainer,
              border: `1px solid ${colorBorderSecondary}`,
            }}
          >
            <div style={{ marginBottom: 16 }}>
              <Text type="secondary" style={{ fontSize: 13 }}>
                处理器型号：{cpu.cpuModel}
              </Text>
            </div>

            <Row gutter={16} align="middle">
              <Col span={10} style={{ textAlign: 'center' }}>
                <Progress
                  type="dashboard"
                  percent={cpu.totalPercent}
                  size={140}
                  strokeColor={cpu.totalPercent > 80 ? colorError : colorPrimary}
                  format={(p) => (
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 'bold' }}>{p}%</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>CPU 总使用率</div>
                    </div>
                  )}
                />
              </Col>
              <Col span={14}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div>
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}
                    >
                      <Text type="secondary">用户态 (User):</Text>
                      <Text strong>{cpu.userPercent}%</Text>
                    </div>
                    <Progress
                      percent={cpu.userPercent}
                      size="small"
                      strokeColor={colorPrimary}
                      showInfo={false}
                    />
                  </div>
                  <div>
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}
                    >
                      <Text type="secondary">系统态 (System):</Text>
                      <Text strong>{cpu.sysPercent}%</Text>
                    </div>
                    <Progress
                      percent={cpu.sysPercent}
                      size="small"
                      strokeColor={colorWarning}
                      showInfo={false}
                    />
                  </div>
                  <div>
                    <div
                      style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}
                    >
                      <Text type="secondary">空闲率 (Idle):</Text>
                      <Text strong>{cpu.idlePercent}%</Text>
                    </div>
                    <Progress
                      percent={cpu.idlePercent}
                      size="small"
                      strokeColor={colorSuccess}
                      showInfo={false}
                    />
                  </div>
                </div>
              </Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

            <div>
              <Text strong style={{ marginBottom: 8, display: 'block' }}>
                系统平均负载 (Load Average)：
              </Text>
              <Row gutter={16}>
                <Col span={8}>
                  <Statistic
                    title="1 分钟负载"
                    value={cpu.loadAvg1m}
                    precision={2}
                    valueStyle={{
                      color: cpu.loadAvg1m > cpu.cpuNum ? colorError : colorSuccess,
                      fontSize: 20,
                    }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="5 分钟负载"
                    value={cpu.loadAvg5m}
                    precision={2}
                    valueStyle={{
                      color: cpu.loadAvg5m > cpu.cpuNum ? colorError : colorSuccess,
                      fontSize: 20,
                    }}
                  />
                </Col>
                <Col span={8}>
                  <Statistic
                    title="15 分钟负载"
                    value={cpu.loadAvg15m}
                    precision={2}
                    valueStyle={{
                      color: cpu.loadAvg15m > cpu.cpuNum ? colorError : colorSuccess,
                      fontSize: 20,
                    }}
                  />
                </Col>
              </Row>
            </div>
          </Card>
        </Col>

        {/* 内存监控 */}
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <DatabaseOutlined style={{ color: colorPrimary }} />
                <span>物理内存与 Swap 交换区</span>
                <Tag color="geekblue">物理内存 {mem.totalGb.toFixed(1)} GB</Tag>
              </Space>
            }
            style={{
              height: '100%',
              borderRadius: borderRadiusLG,
              background: colorBgContainer,
              border: `1px solid ${colorBorderSecondary}`,
            }}
          >
            <Row gutter={16} align="middle">
              <Col span={10} style={{ textAlign: 'center' }}>
                <Progress
                  type="dashboard"
                  percent={Number(mem.usagePercent.toFixed(1))}
                  size={140}
                  strokeColor={mem.usagePercent > 85 ? colorError : colorPrimary}
                  format={(p) => (
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 'bold' }}>{p}%</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>内存已使用</div>
                    </div>
                  )}
                />
              </Col>
              <Col span={14}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">总物理内存：</Text>
                    <Text strong>{mem.totalGb.toFixed(1)} GB</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">已使用 (Used)：</Text>
                    <Text style={{ color: colorPrimary, fontWeight: 600 }}>
                      {mem.usedGb.toFixed(1)} GB
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">剩余可用 (Free)：</Text>
                    <Text style={{ color: colorSuccess, fontWeight: 600 }}>
                      {mem.freeGb.toFixed(1)} GB
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">系统缓冲 (Buffers/Cached)：</Text>
                    <Text>{mem.bufferCachedGb.toFixed(1)} GB</Text>
                  </div>
                </div>
              </Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 8,
                }}
              >
                <Space>
                  <Text strong>Swap 交换分区监控：</Text>
                  <Tooltip title="Swap 利用率过高说明物理内存严重不足并发生磁盘换页，会导致微服务响应激增">
                    <InfoCircleOutlined style={{ color: '#8c8c8c' }} />
                  </Tooltip>
                </Space>
                <Tag color={mem.swapUsagePercent > 30 ? 'orange' : 'green'}>
                  已用 {mem.swapUsedGb.toFixed(2)} GB / 总计 {mem.swapTotalGb.toFixed(1)} GB (
                  {mem.swapUsagePercent}%)
                </Tag>
              </div>
              <Progress
                percent={Number(mem.swapUsagePercent.toFixed(1))}
                status={mem.swapUsagePercent > 50 ? 'exception' : 'normal'}
                strokeColor={mem.swapUsagePercent > 30 ? colorWarning : colorSuccess}
              />
            </div>
          </Card>
        </Col>
      </Row>

      {/* 多磁盘挂载点空间 */}
      <Card
        title={
          <Space>
            <HddOutlined style={{ color: colorPrimary }} />
            <span>磁盘存储与挂载分区监控</span>
            <Tag color="purple">{disks.length} 个挂载卷</Tag>
          </Space>
        }
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <Table<ServerDiskItem>
          rowKey="dirName"
          columns={diskColumns}
          dataSource={disks}
          pagination={false}
          size="middle"
        />
      </Card>

      {/* 网络流量与 TCP 连接 */}
      <Card
        title={
          <Space>
            <GlobalOutlined style={{ color: colorPrimary }} />
            <span>网络网卡实时吞吐与 TCP 连接</span>
          </Space>
        }
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <Table<ServerNetworkItem>
          rowKey="interfaceName"
          columns={netColumns}
          dataSource={network}
          pagination={false}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default OpsServerPage;

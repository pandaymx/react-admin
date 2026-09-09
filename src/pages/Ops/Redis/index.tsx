import {
  AimOutlined,
  ClockCircleOutlined,
  DatabaseOutlined,
  FireOutlined,
  PieChartOutlined,
  ReloadOutlined,
  SearchOutlined,
  SettingOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  Descriptions,
  Input,
  message,
  Progress,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  theme,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { getRedisCommandStats, getRedisConfigs, getRedisDbStats, getRedisInfo } from '@/api/ops';
import type { RedisCommandStat, RedisConfigItem, RedisDbStat, RedisInfoItem } from '@/types';

const { Title, Text } = Typography;

export const OpsRedisPage: React.FC = () => {
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
  const [info, setInfo] = useState<RedisInfoItem | null>(null);
  const [configs, setConfigs] = useState<RedisConfigItem[]>([]);
  const [dbStats, setDbStats] = useState<RedisDbStat[]>([]);
  const [cmdStats, setCmdStats] = useState<RedisCommandStat[]>([]);
  const [configSearch, setConfigSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [infoRes, configsRes, dbRes, cmdRes] = await Promise.all([
        getRedisInfo(env),
        getRedisConfigs(env),
        getRedisDbStats(env),
        getRedisCommandStats(env),
      ]);

      if (infoRes.code === 200 && infoRes.data) setInfo(infoRes.data);
      if (configsRes.code === 200 && configsRes.data) setConfigs(configsRes.data);
      if (dbRes.code === 200 && dbRes.data) setDbStats(dbRes.data);
      if (cmdRes.code === 200 && cmdRes.data) setCmdStats(cmdRes.data);

      setLastRefreshed(new Date().toLocaleTimeString());
    } catch {
      message.error('获取 Redis 监控与配置数据失败');
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

  // 配置筛选
  const filteredConfigs = configs.filter((item) => {
    const matchesSearch =
      item.key.toLowerCase().includes(configSearch.toLowerCase()) ||
      item.description.toLowerCase().includes(configSearch.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const configColumns: ColumnsType<RedisConfigItem> = [
    {
      title: '配置项名称 (Key)',
      dataIndex: 'key',
      key: 'key',
      width: 260,
      render: (key) => (
        <Space>
          <SettingOutlined style={{ color: colorPrimary }} />
          <Text code copyable>
            {key}
          </Text>
        </Space>
      ),
    },
    {
      title: '当前生效值 (Value)',
      dataIndex: 'value',
      key: 'value',
      width: 240,
      render: (val, r) => (
        <Tag
          color={
            r.category === 'memory' ? 'orange' : r.category === 'persistence' ? 'blue' : 'default'
          }
          style={{ fontSize: 13, padding: '2px 8px' }}
        >
          {val}
        </Tag>
      ),
    },
    {
      title: '所属分类',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (cat: string) => {
        const catMap: Record<string, { label: string; color: string }> = {
          memory: { label: '内存控制', color: 'volcano' },
          persistence: { label: '持久化', color: 'blue' },
          network: { label: '网络连接', color: 'green' },
          client: { label: '客户端', color: 'purple' },
          general: { label: '基础通用', color: 'cyan' },
        };
        const cur = catMap[cat] || { label: cat, color: 'default' };
        return <Tag color={cur.color}>{cur.label}</Tag>;
      },
    },
    {
      title: '官方默认值',
      dataIndex: 'defaultValue',
      key: 'defaultValue',
      width: 160,
      render: (val) => <Text type="secondary">{val}</Text>,
    },
    {
      title: '功能作用说明',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: '动态热改',
      dataIndex: 'dynamicEditable',
      key: 'dynamicEditable',
      width: 110,
      render: (editable: boolean) =>
        editable ? (
          <Badge status="success" text="CONFIG SET" />
        ) : (
          <Badge status="default" text="需重启" />
        ),
    },
  ];

  const dbColumns: ColumnsType<RedisDbStat> = [
    {
      title: '数据库分区',
      dataIndex: 'dbName',
      key: 'dbName',
      render: (text) => (
        <Space>
          <DatabaseOutlined style={{ color: colorPrimary }} />
          <Text strong>{text}</Text>
        </Space>
      ),
    },
    {
      title: '键总数 (Keys)',
      dataIndex: 'keys',
      key: 'keys',
      render: (val) => (
        <Text strong style={{ color: colorPrimary }}>
          {val.toLocaleString()} 个
        </Text>
      ),
    },
    {
      title: '设置过期键 (Expires)',
      dataIndex: 'expires',
      key: 'expires',
      render: (val) => `${val.toLocaleString()} 个`,
    },
    {
      title: '平均 TTL 存活时长',
      dataIndex: 'avgTtlMs',
      key: 'avgTtlMs',
      render: (ms) => `${(ms / 1000 / 60).toFixed(1)} 分钟`,
    },
  ];

  const cmdColumns: ColumnsType<RedisCommandStat> = [
    {
      title: '命令名称',
      dataIndex: 'command',
      key: 'command',
      render: (cmd) => (
        <Text code strong>
          {cmd}
        </Text>
      ),
    },
    {
      title: '调用频次 (Calls)',
      dataIndex: 'calls',
      key: 'calls',
      render: (val) => val.toLocaleString(),
    },
    {
      title: '平均耗时',
      dataIndex: 'usecPerCall',
      key: 'usecPerCall',
      render: (val) => `${val.toFixed(2)} μs`,
    },
    {
      title: '耗时占比',
      dataIndex: 'percentage',
      key: 'percentage',
      width: 200,
      render: (percent: number) => (
        <Space style={{ width: '100%' }}>
          <Progress
            percent={percent}
            size="small"
            strokeColor={colorPrimary}
            style={{ width: 120, margin: 0 }}
          />
          <Text type="secondary">{percent}%</Text>
        </Space>
      ),
    },
  ];

  const memUsagePercent = info
    ? Number(((info.usedMemoryBytes / info.maxMemoryBytes) * 100).toFixed(1))
    : 0;

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
              <ThunderboltOutlined style={{ fontSize: 24, color: '#f5222d' }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  Redis 监控与核心配置中心
                </Title>
                <Text type="secondary">
                  监控 Redis 运行状态、内存碎片率、缓存命中率、键空间分布及常用核心参数配置
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text type="secondary">环境切换：</Text>
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

      {/* Redis 核心指标卡片流 */}
      {info && (
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
                title={
                  <Space>
                    <DatabaseOutlined />
                    <span>Redis 版本与架构</span>
                  </Space>
                }
                value={`v${info.version}`}
                valueStyle={{ color: colorPrimary, fontWeight: 'bold' }}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">模式: {info.redisMode.toUpperCase()}</Text>
                <Tag color="green">已运行 {info.runDays} 天</Tag>
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
                title={
                  <Space>
                    <AimOutlined />
                    <span>缓存键空间命中率</span>
                  </Space>
                }
                value={info.hitRate}
                suffix="%"
                precision={2}
                valueStyle={{ color: colorSuccess, fontWeight: 'bold' }}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">命中: {info.keyspaceHits.toLocaleString()}</Text>
                <Text type="secondary">未中: {info.keyspaceMisses.toLocaleString()}</Text>
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
                title={
                  <Space>
                    <PieChartOutlined />
                    <span>已用内存 / 上限</span>
                  </Space>
                }
                value={info.usedMemoryHuman}
                valueStyle={{ color: colorPrimary, fontWeight: 'bold' }}
              />
              <div style={{ marginTop: 8 }}>
                <Progress
                  percent={memUsagePercent}
                  size="small"
                  strokeColor={memUsagePercent > 80 ? colorError : colorPrimary}
                />
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
                title={
                  <Space>
                    <FireOutlined />
                    <span>每秒命令吞吐 (QPS)</span>
                  </Space>
                }
                value={info.instantaneousOpsPerSec}
                suffix="ops/s"
                valueStyle={{ color: colorWarning, fontWeight: 'bold' }}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">Key 总量: {info.totalKeys.toLocaleString()}</Text>
                <Tag color="blue">客户端: {info.connectedClients}</Tag>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* Redis 深度详情概览 */}
      {info && (
        <Card
          title={
            <Space>
              <DatabaseOutlined style={{ color: colorPrimary }} />
              <span>Redis 实例运行参数档案</span>
            </Space>
          }
          style={{
            borderRadius: borderRadiusLG,
            background: colorBgContainer,
            border: `1px solid ${colorBorderSecondary}`,
          }}
        >
          <Descriptions
            bordered
            size="small"
            column={{ xxl: 4, xl: 4, lg: 2, md: 2, sm: 1, xs: 1 }}
          >
            <Descriptions.Item label="服务端口">
              <code>{info.port}</code>
            </Descriptions.Item>
            <Descriptions.Item label="内存碎片率">
              <Space>
                <Text strong>{info.memFragmentationRatio}</Text>
                <Tag color={info.memFragmentationRatio > 1.5 ? 'orange' : 'green'}>
                  {info.memFragmentationRatio > 1.5 ? '碎片偏高' : '碎片健康'}
                </Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="物理内存 RSS">{info.usedMemoryRssHuman}</Descriptions.Item>
            <Descriptions.Item label="历史内存峰值">{info.usedMemoryPeakHuman}</Descriptions.Item>
            <Descriptions.Item label="内存淘汰策略">
              <Tag color="geekblue">{info.maxMemoryPolicy}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="AOF 持久化">
              <Badge
                status={info.aofEnabled ? 'success' : 'default'}
                text={info.aofEnabled ? '已开启 (everysec)' : '未开启'}
              />
            </Descriptions.Item>
            <Descriptions.Item label="RDB 快照状态">
              <Tag color="green">{info.rdbLastSaveStatus.toUpperCase()}</Tag>
            </Descriptions.Item>
            <Descriptions.Item label="上次 RDB 快照时间">{info.rdbLastSaveTime}</Descriptions.Item>
          </Descriptions>
        </Card>
      )}

      {/* 分库统计与命令耗时分布 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <DatabaseOutlined style={{ color: colorPrimary }} />
                <span>分库键空间分布 (DB Keyspace)</span>
              </Space>
            }
            style={{
              height: '100%',
              borderRadius: borderRadiusLG,
              background: colorBgContainer,
              border: `1px solid ${colorBorderSecondary}`,
            }}
          >
            <Table<RedisDbStat>
              rowKey="dbName"
              columns={dbColumns}
              dataSource={dbStats}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>

        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <ClockCircleOutlined style={{ color: colorPrimary }} />
                <span>常用命令耗时与频次分布</span>
              </Space>
            }
            style={{
              height: '100%',
              borderRadius: borderRadiusLG,
              background: colorBgContainer,
              border: `1px solid ${colorBorderSecondary}`,
            }}
          >
            <Table<RedisCommandStat>
              rowKey="command"
              columns={cmdColumns}
              dataSource={cmdStats}
              pagination={false}
              size="small"
            />
          </Card>
        </Col>
      </Row>

      {/* 核心配置参数管理面板 */}
      <Card
        title={
          <Space>
            <SettingOutlined style={{ color: colorPrimary }} />
            <span>Redis 核心配置参数面板 (Redis Config)</span>
            <Tag color="blue">共 {filteredConfigs.length} 项</Tag>
          </Space>
        }
        extra={
          <Space>
            <Radio.Group
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              size="small"
            >
              <Radio.Button value="all">全部</Radio.Button>
              <Radio.Button value="memory">内存策略</Radio.Button>
              <Radio.Button value="persistence">持久化</Radio.Button>
              <Radio.Button value="network">网络/连接</Radio.Button>
              <Radio.Button value="general">通用</Radio.Button>
            </Radio.Group>
            <Input
              placeholder="搜索参数名或描述..."
              prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
              value={configSearch}
              onChange={(e) => setConfigSearch(e.target.value)}
              allowClear
              style={{ width: 220 }}
              size="small"
            />
          </Space>
        }
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <Table<RedisConfigItem>
          rowKey="key"
          columns={configColumns}
          dataSource={filteredConfigs}
          pagination={{ pageSize: 8, showTotal: (t) => `共 ${t} 项配置` }}
          size="middle"
        />
      </Card>
    </div>
  );
};

export default OpsRedisPage;

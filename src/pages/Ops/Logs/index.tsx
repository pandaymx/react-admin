import {
  ClearOutlined,
  CloudDownloadOutlined,
  DatabaseOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileDoneOutlined,
  FileTextOutlined,
  FolderOpenOutlined,
  HddOutlined,
  ReloadOutlined,
  SearchOutlined,
  WarningOutlined,
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
import { downloadOpsLogFile, getOpsLogFiles, getOpsLogSummary } from '@/api/ops';
import type { LogCategory, LogLevel, OpsLogFileItem, OpsLogSummary } from '@/types';
import { LogViewerDrawer } from '../components/LogViewerDrawer';

const { Title, Text } = Typography;

export const OpsLogsPage: React.FC = () => {
  const {
    token: {
      colorBgContainer,
      colorBorderSecondary,
      borderRadiusLG,
      colorPrimary,
      colorSuccess,
      colorError,
    },
  } = theme.useToken();

  const [loading, setLoading] = useState<boolean>(false);
  const [env, setEnv] = useState<'prod' | 'staging' | 'test' | 'dev'>('prod');
  const [summary, setSummary] = useState<OpsLogSummary | null>(null);
  const [logFiles, setLogFiles] = useState<OpsLogFileItem[]>([]);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 筛选字段
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedLevel, setSelectedLevel] = useState<string>('all');

  // 查看抽屉
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const [currentFile, setCurrentFile] = useState<OpsLogFileItem | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [sumRes, filesRes] = await Promise.all([
        getOpsLogSummary(env),
        getOpsLogFiles({
          env,
          serviceCode: selectedService,
          category: selectedCategory,
          level: selectedLevel,
          keyword: searchKeyword,
        }),
      ]);

      if (sumRes.code === 200 && sumRes.data) setSummary(sumRes.data);
      if (filesRes.code === 200 && filesRes.data) setLogFiles(filesRes.data);

      setLastRefreshed(new Date().toLocaleTimeString());
    } catch {
      message.error('获取系统日志文件列表失败');
    } finally {
      setLoading(false);
    }
  }, [env, selectedService, selectedCategory, selectedLevel, searchKeyword]);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleDownloadSingle = (file: OpsLogFileItem) => {
    downloadOpsLogFile(file);
    message.success(`已开始下载日志: ${file.fileName}`);
  };

  const handleBatchDownload = () => {
    const selectedFiles = logFiles.filter((f) => selectedRowKeys.includes(f.id));
    if (selectedFiles.length === 0) return;

    selectedFiles.forEach((file, index) => {
      setTimeout(() => {
        downloadOpsLogFile(file);
      }, index * 200);
    });

    message.success(`已触发 ${selectedFiles.length} 个日志文件的批量下载`);
  };

  const handleView = (file: OpsLogFileItem) => {
    setCurrentFile(file);
    setDrawerOpen(true);
  };

  const handleResetFilters = () => {
    setSearchKeyword('');
    setSelectedService('all');
    setSelectedCategory('all');
    setSelectedLevel('all');
  };

  const columns: ColumnsType<OpsLogFileItem> = [
    {
      title: '日志文件名称',
      key: 'fileName',
      render: (_, r) => (
        <Space size="small">
          <FileTextOutlined style={{ color: colorPrimary, fontSize: 16 }} />
          <div>
            <Space size={4}>
              <Text strong style={{ fontSize: 13 }}>
                {r.fileName}
              </Text>
              {r.compressed && (
                <Tag color="purple" style={{ fontSize: 11, padding: '0 4px' }}>
                  GZ
                </Tag>
              )}
            </Space>
            <div>
              <Tooltip title={r.filePath}>
                <Text type="secondary" style={{ fontSize: 11, cursor: 'pointer' }}>
                  <code>{r.filePath}</code>
                </Text>
              </Tooltip>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '所属服务 / 组件',
      key: 'serviceName',
      render: (_, r) => (
        <div>
          <div>{r.serviceName}</div>
          <Text type="secondary" style={{ fontSize: 12 }}>
            <code>{r.serviceCode}</code>
          </Text>
        </div>
      ),
    },
    {
      title: '日志类别',
      dataIndex: 'category',
      key: 'category',
      width: 120,
      render: (cat: LogCategory) => {
        const catMap: Record<LogCategory, { label: string; color: string }> = {
          app: { label: '应用业务', color: 'blue' },
          access: { label: '访问审计', color: 'cyan' },
          slow_sql: { label: '慢查询', color: 'orange' },
          redis: { label: 'Redis 缓存', color: 'volcano' },
          gc: { label: 'JVM GC', color: 'purple' },
          system: { label: '系统内核', color: 'geekblue' },
        };
        const item = catMap[cat] || { label: cat, color: 'default' };
        return <Tag color={item.color}>{item.label}</Tag>;
      },
    },
    {
      title: '级别',
      dataIndex: 'level',
      key: 'level',
      width: 90,
      render: (lvl: LogLevel) => {
        if (lvl === 'ERROR') return <Badge status="error" text="ERROR" />;
        if (lvl === 'WARN') return <Badge status="warning" text="WARN" />;
        if (lvl === 'INFO') return <Badge status="processing" text="INFO" />;
        return <Badge status="default" text="DEBUG" />;
      },
    },
    {
      title: '文件大小',
      dataIndex: 'sizeHuman',
      key: 'sizeHuman',
      width: 110,
      sorter: (a, b) => a.sizeBytes - b.sizeBytes,
      render: (val) => <Text strong>{val}</Text>,
    },
    {
      title: '预估总行数',
      dataIndex: 'lineCount',
      key: 'lineCount',
      width: 120,
      sorter: (a, b) => a.lineCount - b.lineCount,
      render: (val) => `${val.toLocaleString()} 行`,
    },
    {
      title: '最后产生更新时间',
      dataIndex: 'updatedAt',
      key: 'updatedAt',
      width: 170,
      sorter: (a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime(),
    },
    {
      title: '操作',
      key: 'action',
      width: 200,
      render: (_, r) => (
        <Space size="small">
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(r)}>
            在线查看
          </Button>
          <Button
            size="small"
            type="primary"
            ghost
            icon={<DownloadOutlined />}
            onClick={() => handleDownloadSingle(r)}
          >
            下载日志
          </Button>
        </Space>
      ),
    },
  ];

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => setSelectedRowKeys(keys),
  };

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
              <FolderOpenOutlined style={{ fontSize: 24, color: colorPrimary }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  系统运维日志管理与日志下载
                </Title>
                <Text type="secondary">
                  集中归档微服务应用日志、网关审计日志、慢 SQL、Redis
                  缓存与系统内核日志，支持在线终端查看与即时文件下载
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
                  更新: {lastRefreshed}
                </Text>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* KPI 统计指标卡片 */}
      {summary && (
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
                title="活跃日志文件数"
                value={summary.totalFiles}
                suffix="个"
                valueStyle={{ color: colorPrimary, fontWeight: 'bold' }}
                prefix={<FileDoneOutlined />}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">微服务覆盖: 8 个</Text>
                <Tag color="blue">自动轮转归档</Tag>
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
                title="日志累计存储量"
                value={summary.totalSizeHuman}
                valueStyle={{ color: colorPrimary, fontWeight: 'bold' }}
                prefix={<HddOutlined />}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">日志分区利用率: {summary.logDiskUsagePercent}%</Text>
                <Progress
                  percent={summary.logDiskUsagePercent}
                  size="small"
                  strokeColor={summary.logDiskUsagePercent > 80 ? colorError : colorSuccess}
                  style={{ width: 90 }}
                  showInfo={false}
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
                title="今日异常 (ERROR)"
                value={summary.todayErrorCount}
                suffix="次"
                valueStyle={{
                  color: summary.todayErrorCount > 0 ? colorError : colorSuccess,
                  fontWeight: 'bold',
                }}
                prefix={<WarningOutlined />}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">今日警告: {summary.todayWarnCount} 次</Text>
                <Tag color={summary.todayErrorCount > 0 ? 'red' : 'green'}>
                  {summary.todayErrorCount > 0 ? '需运维排查' : '无严重异常'}
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
                title="日志导出与下载"
                value="免配置直下"
                valueStyle={{ color: colorSuccess, fontWeight: 'bold' }}
                prefix={<CloudDownloadOutlined />}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between' }}>
                <Text type="secondary">支持格式: .log, .gz</Text>
                <Tag color="green">UTF-8 编码</Tag>
              </div>
            </Card>
          </Col>
        </Row>
      )}

      {/* 筛选与操作工具栏 */}
      <Card
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
        styles={{ body: { padding: '16px' } }}
      >
        <Row gutter={[16, 16]} align="middle" justify="space-between">
          <Col xs={24} md={18}>
            <Space wrap size="middle">
              <Input
                placeholder="搜索日志文件名称、服务、路径..."
                prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                allowClear
                style={{ width: 260 }}
              />
              <Select
                value={selectedService}
                onChange={setSelectedService}
                style={{ width: 160 }}
                options={[
                  { label: '全部服务/组件', value: 'all' },
                  { label: '网关 (gateway-server)', value: 'gateway-server' },
                  { label: '用户中心 (user-server)', value: 'user-server' },
                  { label: '内容动态 (feeds-server)', value: 'feeds-server' },
                  { label: '系统运维 (ops-server)', value: 'ops-server' },
                  { label: '互动评论 (interaction)', value: 'interaction-server' },
                  { label: '营销活动 (activity2)', value: 'activity2-server' },
                  { label: '数据库 (MySQL)', value: 'mysql' },
                  { label: '缓存 (Redis)', value: 'redis' },
                  { label: '系统 (System)', value: 'system' },
                ]}
              />
              <Select
                value={selectedCategory}
                onChange={setSelectedCategory}
                style={{ width: 140 }}
                options={[
                  { label: '全部类别', value: 'all' },
                  { label: '应用业务 (app)', value: 'app' },
                  { label: '访问审计 (access)', value: 'access' },
                  { label: '慢查询 (slow_sql)', value: 'slow_sql' },
                  { label: 'Redis 缓存 (redis)', value: 'redis' },
                  { label: 'JVM GC (gc)', value: 'gc' },
                  { label: '系统内核 (system)', value: 'system' },
                ]}
              />
              <Select
                value={selectedLevel}
                onChange={setSelectedLevel}
                style={{ width: 120 }}
                options={[
                  { label: '全部级别', value: 'all' },
                  { label: 'INFO 正常', value: 'INFO' },
                  { label: 'WARN 警告', value: 'WARN' },
                  { label: 'ERROR 错误', value: 'ERROR' },
                  { label: 'DEBUG 调试', value: 'DEBUG' },
                ]}
              />
              <Button icon={<ClearOutlined />} onClick={handleResetFilters}>
                重置
              </Button>
            </Space>
          </Col>

          <Col xs={24} md={6} style={{ textAlign: 'right' }}>
            <Space>
              <Button
                type="primary"
                icon={<CloudDownloadOutlined />}
                disabled={selectedRowKeys.length === 0}
                onClick={handleBatchDownload}
              >
                批量下载选中日志 ({selectedRowKeys.length})
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 日志文件表格 */}
      <Card
        title={
          <Space>
            <DatabaseOutlined style={{ color: colorPrimary }} />
            <span>日志归档列表</span>
            <Tag color="blue">{logFiles.length} 个文件</Tag>
          </Space>
        }
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <Table<OpsLogFileItem>
          rowKey="id"
          rowSelection={rowSelection}
          columns={columns}
          dataSource={logFiles}
          pagination={{ pageSize: 10, showTotal: (t) => `共 ${t} 个日志文件` }}
          loading={loading}
          size="middle"
        />
      </Card>

      {/* 实时在线终端抽屉 */}
      <LogViewerDrawer open={drawerOpen} file={currentFile} onClose={() => setDrawerOpen(false)} />
    </div>
  );
};

export default OpsLogsPage;

import {
  AlertOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileTextOutlined,
  HourglassOutlined,
  MessageOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Image,
  Input,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { batchHandleReports, getReportList, getReportSummary } from '@/api/report';
import { type ColumnOptionItem, useColumnSettings } from '@/components/ColumnSetting';
import type {
  ReportItem,
  ReportQueryParams,
  ReportReason,
  ReportStatus,
  ReportSummaryVO,
  ReportTargetType,
} from '@/types';
import { exportToCsv } from '@/utils/export';
import { HandleReportModal } from './components/HandleReportModal';
import { ReportDetailDrawer } from './components/ReportDetailDrawer';

const { Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const reportColumnOptions: ColumnOptionItem[] = [
  { key: 'target', title: '被举报主体与目标', required: true },
  { key: 'reporter', title: '举报人信息' },
  { key: 'reason', title: '违规原因及详细说明' },
  { key: 'evidence', title: '证据截图' },
  { key: 'status', title: '处理状态' },
  { key: 'createTime', title: '举报提交时间' },
  { key: 'action', title: '操作列', required: true },
];

export const ReportsPage: React.FC = () => {
  const { checkedKeys, ColumnSettingComponent } = useColumnSettings(
    'reports_table',
    reportColumnOptions,
  );
  const [form] = Form.useForm();
  const [activeTab, setActiveTab] = useState<ReportTargetType | 'all'>('all');
  const [loading, setLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [batchLoading, setBatchLoading] = useState<boolean>(false);
  const [reportList, setReportList] = useState<ReportItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 风控看板统计
  const [summary, setSummary] = useState<ReportSummaryVO>({
    pendingCount: 0,
    todayNewCount: 0,
    resolvedCount: 0,
    rejectedCount: 0,
    avgHandleTimeMinutes: 0,
  });
  const [summaryLoading, setSummaryLoading] = useState<boolean>(false);

  // 处置弹窗
  const [handleModalOpen, setHandleModalOpen] = useState<boolean>(false);
  const [selectedReport, setSelectedReport] = useState<ReportItem | null>(null);

  // 详情抽屉
  const [detailDrawerOpen, setDetailDrawerOpen] = useState<boolean>(false);
  const [currentRecord, setCurrentRecord] = useState<ReportItem | null>(null);

  const fetchSummary = useCallback(async () => {
    setSummaryLoading(true);
    try {
      const res = await getReportSummary();
      if ((res.code === 200 || res.code === 0) && res.data) {
        setSummary(res.data);
      }
    } catch {
      // 忽略
    } finally {
      setSummaryLoading(false);
    }
  }, []);

  const fetchData = useCallback(
    async (page = 1, size = 10, targetType = activeTab) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const params: ReportQueryParams = {
          keyword: values.keyword,
          targetType: targetType === 'all' ? undefined : targetType,
          reason: values.reason,
          status: values.status,
          page,
          pageSize: size,
        };

        if (values.dateRange && values.dateRange.length === 2) {
          params.dateRange = [
            values.dateRange[0].format('YYYY-MM-DD'),
            values.dateRange[1].format('YYYY-MM-DD'),
          ];
        }

        const res = await getReportList(params);
        if (res.code === 200 || res.code === 0) {
          setReportList(res.data.list);
          setTotal(res.data.total);
          setCurrentPage(page);
          setPageSize(size);
        }
      } catch (err: any) {
        message.error(err.message || '获取举报列表失败');
      } finally {
        setLoading(false);
      }
    },
    [activeTab, form],
  );

  useEffect(() => {
    fetchData(1, 10, activeTab);
    fetchSummary();
  }, [fetchData, fetchSummary, activeTab]);

  const handleTabChange = (key: string) => {
    const tabKey = key as ReportTargetType | 'all';
    setActiveTab(tabKey);
    fetchData(1, pageSize, tabKey);
  };

  const handleSearch = () => {
    fetchData(1, pageSize);
  };

  const handleReset = () => {
    form.resetFields();
    fetchData(1, pageSize);
  };

  // 批量处置
  const handleBatchAction = async (status: ReportStatus, action: 'dismiss' | 'delete_target') => {
    if (selectedRowKeys.length === 0) return;
    setBatchLoading(true);
    try {
      const ids = selectedRowKeys.map(String);
      const remark =
        status === 'rejected' ? '批量驳回未属实举报' : '经批量审核核实违规属实，已执行下架处置';
      const res = await batchHandleReports(ids, status, remark, action);
      if (res.code === 200 || res.code === 0) {
        message.success(res.message || `成功批量处理 ${ids.length} 条工单`);
        setSelectedRowKeys([]);
        fetchData(currentPage, pageSize);
        fetchSummary();
      }
    } catch (err: any) {
      message.error(err.message || '批量处理失败');
    } finally {
      setBatchLoading(false);
    }
  };

  // 导出报表
  const handleExport = () => {
    setExportLoading(true);
    try {
      if (!reportList.length) {
        message.warning('当前无举报数据可导出');
        return;
      }
      exportToCsv(
        [
          { title: '举报单号', key: 'id' },
          {
            title: '举报类型',
            key: 'targetType',
            render: (r) =>
              r.targetType === 'post' ? '作品' : r.targetType === 'comment' ? '评论' : '用户',
          },
          { title: '举报人昵称', key: 'reporter', render: (r) => r.reporter.nickname },
          {
            title: '举报人UID',
            key: 'reporter',
            render: (r) => r.reporter.uid || r.reporter.userNo || '',
          },
          { title: '被举报人昵称', key: 'target', render: (r) => r.target.targetUser.nickname },
          {
            title: '被举报人UID',
            key: 'target',
            render: (r) => r.target.targetUser.uid || r.target.targetUser.userNo || '',
          },
          { title: '违规原因描述', key: 'reasonDesc' },
          {
            title: '处理状态',
            key: 'status',
            render: (r) =>
              r.status === 'processed'
                ? '已处置'
                : r.status === 'rejected'
                  ? '已驳回'
                  : r.status === 'ignored'
                    ? '已忽略'
                    : '待审核',
          },
          { title: '处置说明', key: 'handleRemark' },
          { title: '处理人', key: 'handler' },
          { title: '处理时间', key: 'handleTime' },
          { title: '举报提交时间', key: 'createTime' },
        ],
        reportList,
        '违规举报审核处理数据列表',
      );
      message.success(`成功导出 ${reportList.length} 条举报工单数据`);
    } catch (err: any) {
      message.error(err.message || '导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  const renderReasonTag = (reason: ReportReason | string) => {
    const map: Record<string, { label: string; color: string }> = {
      illegal: { label: '违法违禁', color: 'red' },
      porn: { label: '色情低俗', color: 'volcano' },
      abuse: { label: '侮辱谩骂/网暴', color: 'magenta' },
      spam: { label: '广告引流/营销', color: 'orange' },
      ad_fraud: { label: '广告引流/营销', color: 'orange' },
      fraud: { label: '涉赌涉诈/欺诈', color: 'red' },
      gambling: { label: '涉赌涉诈/欺诈', color: 'red' },
      copyright: { label: '抄袭侵权', color: 'purple' },
      rumor: { label: '不实谣言', color: 'geekblue' },
      other: { label: '其他违规', color: 'default' },
    };
    const item = map[reason] || { label: '其他违规', color: 'default' };
    return <Tag color={item.color}>{item.label}</Tag>;
  };

  const renderStatusBadge = (status: ReportStatus) => {
    switch (status) {
      case 'pending':
        return (
          <Badge status="processing" text={<Text style={{ color: '#1677ff' }}>待审核处理</Text>} />
        );
      case 'processed':
      case 'resolved':
        return <Badge status="success" text={<Text type="success">违规已处置</Text>} />;
      case 'rejected':
        return <Badge status="error" text={<Text type="danger">已驳回举报</Text>} />;
      case 'ignored':
      case 'cancelled':
        return <Badge status="default" text={<Text type="secondary">已忽略/撤销</Text>} />;
      default:
        return <Badge status="default" text="未知" />;
    }
  };

  const renderTargetTypeTag = (type: ReportTargetType) => {
    switch (type) {
      case 'post':
        return (
          <Tag color="purple" icon={<FileTextOutlined />}>
            作品举报
          </Tag>
        );
      case 'comment':
        return (
          <Tag color="cyan" icon={<MessageOutlined />}>
            评论举报
          </Tag>
        );
      case 'user':
        return (
          <Tag color="blue" icon={<UserOutlined />}>
            用户举报
          </Tag>
        );
      default:
        return <Tag>其他</Tag>;
    }
  };

  const columns: TableProps<ReportItem>['columns'] = [
    {
      title: '举报单号',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (id: string) => (
        <Text code copyable={{ tooltips: ['复制单号', '已复制'] }} style={{ fontSize: 12 }}>
          {id}
        </Text>
      ),
    },
    {
      title: '类型',
      dataIndex: 'targetType',
      key: 'targetType',
      width: 120,
      render: (type: ReportTargetType) => renderTargetTypeTag(type),
    },
    {
      title: '被举报对象与内容',
      key: 'target',
      width: 260,
      render: (_, record) => (
        <div>
          <Space size={6} style={{ marginBottom: 4 }}>
            <Avatar src={record.target.targetUser.avatar} size={22} icon={<UserOutlined />} />
            <Text strong style={{ fontSize: 12 }}>
              {record.target.targetUser.nickname}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              UID: {record.target.targetUser.uid || record.target.targetUser.userNo}
            </Text>
          </Space>
          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
            {record.target.coverUrl && (
              <img
                src={record.target.coverUrl}
                alt="目标封面"
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 4,
                  objectFit: 'cover',
                  flexShrink: 0,
                }}
              />
            )}
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{ margin: 0, fontSize: 12, color: '#262626' }}
              title={record.target.titleOrContent}
            >
              {record.target.titleOrContent || '用户账号违规'}
            </Paragraph>
          </div>
        </div>
      ),
    },
    {
      title: '举报人',
      key: 'reporter',
      width: 150,
      render: (_, record) => (
        <Space size={6}>
          <Avatar src={record.reporter.avatar} size={28} icon={<UserOutlined />} />
          <div>
            <Text strong style={{ fontSize: 12, display: 'block' }}>
              {record.reporter.nickname}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              UID: {record.reporter.uid || record.reporter.userNo}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '违规原因及陈述',
      key: 'reason',
      width: 220,
      render: (_, record) => (
        <div>
          <div style={{ marginBottom: 2 }}>
            {renderReasonTag(record.reasonCode || record.reason)}
          </div>
          <Paragraph
            ellipsis={{ rows: 2 }}
            style={{ margin: 0, fontSize: 12, color: '#595959' }}
            title={record.reasonDesc}
          >
            {record.reasonDesc}
          </Paragraph>
        </div>
      ),
    },
    {
      title: '证据截图',
      key: 'evidence',
      width: 120,
      render: (_, record) =>
        record.evidenceImages?.length > 0 ? (
          <Image.PreviewGroup>
            <Space size={4}>
              {record.evidenceImages.map((img) => (
                <Image
                  key={img}
                  src={img}
                  width={40}
                  height={40}
                  style={{ borderRadius: 4, objectFit: 'cover' }}
                />
              ))}
            </Space>
          </Image.PreviewGroup>
        ) : (
          <Text type="secondary" style={{ fontSize: 12 }}>
            无截图
          </Text>
        ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: ReportStatus) => renderStatusBadge(status),
    },
    {
      title: '举报时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 150,
      render: (time: string) => <Text style={{ fontSize: 12 }}>{time}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 150,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'pending' ? (
            <Button
              type="primary"
              size="small"
              onClick={() => {
                setSelectedReport(record);
                setHandleModalOpen(true);
              }}
            >
              处置
            </Button>
          ) : (
            <Button
              type="link"
              size="small"
              onClick={() => {
                setSelectedReport(record);
                setHandleModalOpen(true);
              }}
            >
              重审
            </Button>
          )}

          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentRecord(record);
              setDetailDrawerOpen(true);
            }}
          >
            详情
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 顶部风控概览统计卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          <Card
            size="small"
            style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}
          >
            <Statistic
              title="待处理举报工单"
              value={summary.pendingCount}
              valueStyle={{ color: '#fa8c16', fontWeight: 700 }}
              prefix={<ClockCircleOutlined />}
              loading={summaryLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          <Card
            size="small"
            style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}
          >
            <Statistic
              title="今日新增举报数"
              value={summary.todayNewCount}
              valueStyle={{ color: '#1677ff', fontWeight: 700 }}
              prefix={<AlertOutlined />}
              loading={summaryLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          <Card
            size="small"
            style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}
          >
            <Statistic
              title="累计已核实处置"
              value={summary.resolvedCount}
              valueStyle={{ color: '#52c41a', fontWeight: 700 }}
              prefix={<CheckCircleOutlined />}
              loading={summaryLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          <Card
            size="small"
            style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}
          >
            <Statistic
              title="累计已驳回工单"
              value={summary.rejectedCount}
              valueStyle={{ color: '#ff4d4f', fontWeight: 700 }}
              prefix={<StopOutlined />}
              loading={summaryLoading}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
          <Card
            size="small"
            style={{ borderRadius: 8, boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)' }}
          >
            <Statistic
              title="平均处理响应耗时"
              value={summary.avgHandleTimeMinutes}
              suffix="分钟"
              valueStyle={{ color: '#722ed1', fontWeight: 700 }}
              prefix={<HourglassOutlined />}
              loading={summaryLoading}
            />
          </Card>
        </Col>
      </Row>

      {/* 分类 Tabs */}
      <Tabs
        activeKey={activeTab}
        onChange={handleTabChange}
        type="card"
        items={[
          { key: 'all', label: '全部举报工单' },
          { key: 'post', label: '作品帖子举报' },
          { key: 'comment', label: '评论互动举报' },
          { key: 'user', label: '用户账号举报' },
        ]}
      />

      {/* 搜索表单 */}
      <Card
        variant="borderless"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          borderRadius: 8,
        }}
      >
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSearch}
          initialValues={{
            reason: 'all',
            status: 'all',
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="关键词/ID" name="keyword" style={{ marginBottom: 0 }}>
                <Input placeholder="输入单号 / 理由 / 用户ID" allowClear />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={5}>
              <Form.Item label="违规原因" name="reason" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部原因', value: 'all' },
                    { label: '广告引流/营销 (spam)', value: 'spam' },
                    { label: '侮辱谩骂/网暴 (abuse)', value: 'abuse' },
                    { label: '色情低俗 (porn)', value: 'porn' },
                    { label: '涉赌涉诈/欺诈 (fraud)', value: 'fraud' },
                    { label: '其他违规 (other)', value: 'other' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={4}>
              <Form.Item label="处理状态" name="status" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部状态', value: 'all' },
                    { label: '待审核处理', value: 'pending' },
                    { label: '违规已处置', value: 'processed' },
                    { label: '已驳回举报', value: 'rejected' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={5}>
              <Form.Item label="举报时间" name="dateRange" style={{ marginBottom: 0 }}>
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={4}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
                <Button
                  type="primary"
                  htmlType="submit"
                  icon={<SearchOutlined />}
                  loading={loading}
                >
                  查询
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 数据表格 */}
      <Card
        variant="borderless"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          borderRadius: 8,
        }}
        title={
          <Space wrap>
            <span style={{ fontSize: 16, fontWeight: 600 }}>举报受理列表</span>
            <Tag color="volcano">共 {total} 起工单</Tag>
            {selectedRowKeys.length > 0 && (
              <Space>
                <Tag color="blue">已勾选 {selectedRowKeys.length} 项</Tag>
                <Popconfirm
                  title="批量处置确认"
                  description={`确定对选中的 ${selectedRowKeys.length} 条举报执行违规处置吗？`}
                  onConfirm={() => handleBatchAction('processed', 'delete_target')}
                  okText="确定处置"
                >
                  <Button type="primary" size="small" loading={batchLoading}>
                    批量核实处置
                  </Button>
                </Popconfirm>
                <Popconfirm
                  title="批量驳回确认"
                  description={`确定驳回选中的 ${selectedRowKeys.length} 条举报吗？`}
                  onConfirm={() => handleBatchAction('rejected', 'dismiss')}
                  okText="确定驳回"
                >
                  <Button danger size="small" loading={batchLoading}>
                    批量驳回
                  </Button>
                </Popconfirm>
              </Space>
            )}
          </Space>
        }
        extra={
          <Space>
            <Button icon={<DownloadOutlined />} onClick={handleExport} loading={exportLoading}>
              导出举报报表
            </Button>
            {ColumnSettingComponent}
            <Tooltip title="刷新列表">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchData();
                  fetchSummary();
                }}
                loading={loading}
              />
            </Tooltip>
          </Space>
        }
      >
        <Table<ReportItem>
          rowKey="id"
          columns={columns.filter((col) => !col.key || checkedKeys.includes(col.key as string))}
          dataSource={reportList}
          loading={loading}
          scroll={{ x: 1300 }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: total,
            showSizeChanger: true,
            showQuickJumper: true,
            pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'],
            showTotal: (allTotal) => `共 ${allTotal} 条举报工单`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
              fetchData(page, size);
            },
          }}
        />
      </Card>

      {/* 处置弹窗 */}
      <HandleReportModal
        open={handleModalOpen}
        report={selectedReport}
        onSuccess={() => {
          setHandleModalOpen(false);
          fetchData(currentPage, pageSize);
          fetchSummary();
        }}
        onCancel={() => setHandleModalOpen(false)}
      />

      {/* 详情抽屉 */}
      <ReportDetailDrawer
        open={detailDrawerOpen}
        report={currentRecord}
        onClose={() => setDetailDrawerOpen(false)}
        onHandleClick={() => {
          setSelectedReport(currentRecord);
          setDetailDrawerOpen(false);
          setHandleModalOpen(true);
        }}
      />
    </div>
  );
};

export default ReportsPage;

import {
  AuditOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  DownloadOutlined,
  EyeOutlined,
  FileImageOutlined,
  LockOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  ThunderboltOutlined,
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
  Modal,
  message,
  Popconfirm,
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
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  batchHandleAppeals,
  getAllFilteredAppeals,
  getAppealList,
  handleAppeal,
} from '@/api/appeal';
import type { AppealItem, AppealQueryParams, AppealStatus, AppealType } from '@/types';
import { exportToCsv } from '@/utils/export';
import { AppealDetailDrawer } from './components/AppealDetailDrawer';

const { Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

export const AppealsPage: React.FC = () => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [appealList, setAppealList] = useState<AppealItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 统计数据
  const [stats, setStats] = useState({
    totalCount: 0,
    pendingCount: 0,
    approvedCount: 0,
    rejectedCount: 0,
    avgHandleTime: '1.8 小时',
  });

  // 详情抽屉状态
  const [detailDrawerVisible, setDetailDrawerVisible] = useState<boolean>(false);
  const [currentAppeal, setCurrentAppeal] = useState<AppealItem | null>(null);

  // 防抖自动检索引用
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  const fetchData = useCallback(
    async (page = currentPage, size = pageSize) => {
      setLoading(true);
      try {
        const formValues = form.getFieldsValue();
        const params: AppealQueryParams = {
          keyword: formValues.keyword,
          appealType: formValues.appealType,
          status: formValues.status,
          page,
          pageSize: size,
        };

        if (formValues.dateRange && formValues.dateRange.length === 2) {
          params.dateRange = [
            formValues.dateRange[0].format('YYYY-MM-DD'),
            formValues.dateRange[1].format('YYYY-MM-DD'),
          ];
        }

        const res = await getAppealList(params);
        if (res.code === 200) {
          setAppealList(res.data.list);
          setTotal(res.data.total);
          setCurrentPage(res.data.page);
          setPageSize(res.data.pageSize);
          if (res.data.stats) {
            setStats(res.data.stats);
          }
        }
      } catch (err: any) {
        message.error(err.message || '获取申诉列表失败');
      } finally {
        setLoading(false);
      }
    },
    [form, currentPage, pageSize],
  );

  useEffect(() => {
    fetchData(1, 10);
  }, [fetchData]);

  // 即输即查防抖联动
  const handleFormValuesChange = (changedValues: any) => {
    if ('keyword' in changedValues) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        fetchData(1, pageSize);
      }, 300);
    } else {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      fetchData(1, pageSize);
    }
  };

  const handleSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    fetchData(1, pageSize);
  };

  const handleReset = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    form.resetFields();
    fetchData(1, pageSize);
  };

  // 快捷审核单条申诉
  const handleQuickReview = async (record: AppealItem, action: 'approve' | 'reject') => {
    try {
      const remark =
        action === 'approve'
          ? '经人工核实证据属实，予以撤销原处罚并恢复相应权限。'
          : '经核实原违规行为成立，举证不足以推翻原判定，维持原判。';
      await handleAppeal({
        id: record.id,
        action,
        reviewRemark: remark,
      });
      message.success(action === 'approve' ? '申诉已通过并已自动撤销处罚' : '申诉已被驳回');
      fetchData(currentPage, pageSize);
    } catch (err: any) {
      message.error(err.message || '审核处理失败');
    }
  };

  // 批量审核处理
  const handleBatchReview = (action: 'approve' | 'reject') => {
    const ids = selectedRowKeys as string[];
    if (ids.length === 0) return;

    Modal.confirm({
      title: action === 'approve' ? '批量通过确认' : '批量驳回确认',
      content: `确定对已选中的 ${ids.length} 条申诉执行【${action === 'approve' ? '通过并撤销处罚' : '驳回维持原判'}】吗？`,
      okText: '确认执行',
      okButtonProps: { danger: action === 'reject' },
      onOk: async () => {
        try {
          await batchHandleAppeals({
            ids,
            action,
            reviewRemark:
              action === 'approve'
                ? '批量审核通过，已自动撤销惩处并恢复权限。'
                : '批量复核驳回，维持原违规处罚决定。',
          });
          message.success(`已成功批量处理 ${ids.length} 条申诉工单`);
          setSelectedRowKeys([]);
          fetchData(currentPage, pageSize);
        } catch (err: any) {
          message.error(err.message || '批量处理失败');
        }
      },
    });
  };

  // 抽屉内部提交审核
  const handleDrawerReviewSubmit = async (values: {
    id: string;
    action: 'approve' | 'reject';
    reviewRemark: string;
    notifyUser: boolean;
  }) => {
    try {
      await handleAppeal(values);
      message.success(values.action === 'approve' ? '申诉已通过并已自动撤销处罚' : '申诉已驳回');
      setDetailDrawerVisible(false);
      fetchData(currentPage, pageSize);
    } catch (err: any) {
      message.error(err.message || '审核提交失败');
    }
  };

  // 数据导出
  const handleExport = async (type: 'selected' | 'all') => {
    setExportLoading(true);
    try {
      let dataToExport: AppealItem[] = [];
      if (type === 'selected') {
        dataToExport = appealList.filter((item) => selectedRowKeys.includes(item.id));
      } else {
        const formValues = form.getFieldsValue();
        dataToExport = await getAllFilteredAppeals({
          keyword: formValues.keyword,
          appealType: formValues.appealType,
          status: formValues.status,
        });
      }

      const typeMap: Record<AppealType, string> = {
        account_ban: '账号封禁',
        comment_mute: '评论禁言',
        post_violation: '作品下架',
        activity_ban: '活动限制',
        credit_deduct: '信用扣分',
      };

      const statusMap: Record<AppealStatus, string> = {
        pending: '待审核',
        approved: '申诉通过',
        rejected: '申诉驳回',
      };

      exportToCsv(
        [
          { title: '申诉工单号', key: 'id' },
          {
            title: '申诉用户昵称',
            key: 'user_nickname',
            render: (r: AppealItem) => r.user.nickname,
          },
          {
            title: '申诉用户名',
            key: 'user_username',
            render: (r: AppealItem) => `@${r.user.username}`,
          },
          { title: '申诉用户UID', key: 'user_uid', render: (r: AppealItem) => r.user.uid },
          {
            title: '联系手机',
            key: 'user_phone',
            render: (r: AppealItem) =>
              r.user.phone ? r.user.phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2') : '未绑定',
          },
          {
            title: '申诉业务类型',
            key: 'appealType',
            render: (r: AppealItem) => typeMap[r.appealType] || r.appealType,
          },
          { title: '原始处罚原因', key: 'originalPunishReason' },
          { title: '原始处罚时间', key: 'originalPunishTime' },
          { title: '申诉陈述理由', key: 'appealReason' },
          {
            title: '处理状态',
            key: 'status',
            render: (r: AppealItem) => statusMap[r.status] || r.status,
          },
          { title: '审核管理员', key: 'reviewer', render: (r: AppealItem) => r.reviewer || '-' },
          {
            title: '审核判定时间',
            key: 'reviewTime',
            render: (r: AppealItem) => r.reviewTime || '-',
          },
          {
            title: '审核结论意见',
            key: 'reviewRemark',
            render: (r: AppealItem) => r.reviewRemark || '-',
          },
          { title: '申诉提交时间', key: 'createdAt' },
        ],
        dataToExport,
        '用户违规申诉工单报表',
      );
      message.success(`成功导出 ${dataToExport.length} 条申诉记录`);
    } catch (err: any) {
      message.error(err.message || '导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  const renderAppealTypeTag = (type: AppealType) => {
    switch (type) {
      case 'account_ban':
        return (
          <Tag icon={<LockOutlined />} color="red">
            账号封禁
          </Tag>
        );
      case 'comment_mute':
        return (
          <Tag icon={<StopOutlined />} color="orange">
            评论禁言
          </Tag>
        );
      case 'post_violation':
        return (
          <Tag icon={<FileImageOutlined />} color="purple">
            作品下架
          </Tag>
        );
      case 'activity_ban':
        return <Tag color="cyan">活动限制</Tag>;
      case 'credit_deduct':
        return <Tag color="blue">信用扣分</Tag>;
    }
  };

  const renderStatusBadge = (status: AppealStatus) => {
    switch (status) {
      case 'pending':
        return <Badge status="processing" text="⏳ 待人工复核" />;
      case 'approved':
        return <Badge status="success" text="🟢 申诉通过" />;
      case 'rejected':
        return <Badge status="error" text="🔴 维持原判" />;
    }
  };

  const columns: TableProps<AppealItem>['columns'] = [
    {
      title: '申诉单号 / 提交时间',
      key: 'id',
      width: 170,
      render: (_, record) => (
        <div>
          <Space size={4}>
            <Text strong copyable={{ text: record.id }}>
              {record.id}
            </Text>
          </Space>
          <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
            <ClockCircleOutlined style={{ marginRight: 4 }} />
            {record.createdAt}
          </div>
        </div>
      ),
    },
    {
      title: '申诉人信息',
      key: 'user',
      width: 200,
      render: (_, record) => (
        <Space size={10} align="center">
          <Avatar src={record.user.avatar} size={38} icon={<UserOutlined />} />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Text strong style={{ fontSize: 13 }}>
                {record.user.nickname}
              </Text>
            </div>
            <div style={{ fontSize: 11, color: '#8c8c8c' }}>
              <span>@{record.user.username}</span>
              <span style={{ margin: '0 4px' }}>·</span>
              <span>UID: {record.user.uid}</span>
            </div>
          </div>
        </Space>
      ),
    },
    {
      title: '申诉类型',
      dataIndex: 'appealType',
      key: 'appealType',
      width: 120,
      render: (type: AppealType) => renderAppealTypeTag(type),
    },
    {
      title: '原始处罚原因',
      dataIndex: 'originalPunishReason',
      key: 'originalPunishReason',
      width: 200,
      render: (text: string, record) => (
        <Tooltip
          title={`处罚时间: ${record.originalPunishTime} | 期限: ${record.originalBanExpireTime || '永久'}`}
        >
          <div>
            <Text type="danger" ellipsis style={{ maxWidth: 190, display: 'block' }}>
              {text}
            </Text>
            {record.originalBanExpireTime && (
              <Text type="secondary" style={{ fontSize: 11 }}>
                原定封禁至: {record.originalBanExpireTime}
              </Text>
            )}
          </div>
        </Tooltip>
      ),
    },
    {
      title: '申诉理由与证据材料',
      key: 'appealReason',
      width: 230,
      render: (_, record) => (
        <div>
          <Tooltip title={record.appealReason}>
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{ margin: 0, fontSize: 12, lineHeight: '1.4' }}
            >
              {record.appealReason}
            </Paragraph>
          </Tooltip>
          {record.appealEvidences.length > 0 && (
            <div style={{ marginTop: 4 }}>
              <Image.PreviewGroup>
                <Space size={4}>
                  {record.appealEvidences.slice(0, 3).map((ev) => (
                    <Image
                      key={ev.id}
                      src={ev.url}
                      width={28}
                      height={28}
                      style={{ objectFit: 'cover', borderRadius: 4, border: '1px solid #e8e8e8' }}
                    />
                  ))}
                  {record.appealEvidences.length > 3 && (
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      +{record.appealEvidences.length - 3}
                    </Text>
                  )}
                </Space>
              </Image.PreviewGroup>
            </div>
          )}
        </div>
      ),
    },
    {
      title: '处理状态',
      dataIndex: 'status',
      key: 'status',
      width: 130,
      render: (status: AppealStatus) => renderStatusBadge(status),
    },
    {
      title: '审核结论 / 审核人',
      key: 'review',
      width: 170,
      render: (_, record) =>
        record.status === 'pending' ? (
          <Text type="secondary" style={{ fontSize: 12 }}>
            等待分配处理
          </Text>
        ) : (
          <div>
            <Tooltip title={record.reviewRemark}>
              <Text ellipsis style={{ maxWidth: 150, display: 'block', fontSize: 12 }}>
                {record.reviewRemark}
              </Text>
            </Tooltip>
            <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
              <span>{record.reviewer}</span>
              <span style={{ margin: '0 4px' }}>·</span>
              <span>{record.reviewTime?.split(' ')[0]}</span>
            </div>
          </div>
        ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 160,
      render: (_, record) => (
        <Space size="small">
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={() => {
              setCurrentAppeal(record);
              setDetailDrawerVisible(true);
            }}
          >
            {record.status === 'pending' ? '核查裁决' : '详情'}
          </Button>

          {record.status === 'pending' && (
            <>
              <Popconfirm
                title="通过申诉确认"
                description={`确定通过【${record.user.nickname}】的申诉并自动撤销处罚吗？`}
                onConfirm={() => handleQuickReview(record, 'approve')}
                okText="通过"
                cancelText="取消"
              >
                <Button type="link" size="small" style={{ color: '#52c41a' }}>
                  通过
                </Button>
              </Popconfirm>

              <Popconfirm
                title="驳回申诉确认"
                description={`确定驳回【${record.user.nickname}】的申诉并维持原判吗？`}
                onConfirm={() => handleQuickReview(record, 'reject')}
                okText="驳回"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Button type="link" size="small" danger>
                  驳回
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 顶部指标统计大盘 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6} lg={4}>
          <Card
            size="small"
            style={{
              borderRadius: 8,
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Statistic
              title="申诉工单总数"
              value={stats.totalCount}
              prefix={<AuditOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={5}>
          <Card
            size="small"
            style={{
              borderRadius: 8,
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Statistic
              title="待人工复核"
              value={stats.pendingCount}
              valueStyle={{ color: '#faad14', fontWeight: 600 }}
              prefix={<ClockCircleOutlined style={{ color: '#faad14' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={5}>
          <Card
            size="small"
            style={{
              borderRadius: 8,
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Statistic
              title="申诉成功 (已撤销处罚)"
              value={stats.approvedCount}
              valueStyle={{ color: '#52c41a', fontWeight: 600 }}
              prefix={<CheckCircleFilled style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={5}>
          <Card
            size="small"
            style={{
              borderRadius: 8,
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Statistic
              title="申诉驳回 (维持原判)"
              value={stats.rejectedCount}
              valueStyle={{ color: '#ff4d4f', fontWeight: 600 }}
              prefix={<CloseCircleFilled style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6} lg={5}>
          <Card
            size="small"
            style={{
              borderRadius: 8,
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Statistic
              title="平均复核时效"
              value={stats.avgHandleTime}
              valueStyle={{ color: '#1677ff', fontSize: 20, fontWeight: 600 }}
              prefix={<ThunderboltOutlined style={{ color: '#1677ff' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索与多维筛选卡片 */}
      <Card
        variant="borderless"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          borderRadius: 8,
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSearch}
          onValuesChange={handleFormValuesChange}
          initialValues={{
            appealType: 'all',
            status: 'all',
          }}
        >
          <Row gutter={[16, 12]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="工单检索" name="keyword" style={{ marginBottom: 0 }}>
                <Input
                  placeholder="搜索单号 / 申诉人 / UID / 理由"
                  allowClear
                  prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="申诉业务类型" name="appealType" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部申诉类型', value: 'all' },
                    { label: '🔒 账号封禁申诉', value: 'account_ban' },
                    { label: '🚫 评论禁言申诉', value: 'comment_mute' },
                    { label: '⚠️ 作品下架申诉', value: 'post_violation' },
                    { label: '🎪 活动限制申诉', value: 'activity_ban' },
                    { label: '📉 信用扣分申诉', value: 'credit_deduct' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="审核处理状态" name="status" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部处理状态', value: 'all' },
                    { label: '⏳ 待人工复核', value: 'pending' },
                    { label: '🟢 申诉已通过', value: 'approved' },
                    { label: '🔴 申诉已驳回', value: 'rejected' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="申诉提交时间范围" name="dateRange" style={{ marginBottom: 0 }}>
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['提交起始日期', '提交截止日期']}
                />
              </Form.Item>
            </Col>

            <Col xs={24} style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
              <Space size="middle">
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

      {/* 数据表格卡片 */}
      <Card
        variant="borderless"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          borderRadius: 8,
        }}
        title={
          <Space>
            <AuditOutlined style={{ color: '#1677ff' }} />
            <Text strong>申诉工单列表</Text>
            <Tag color="blue">共 {total} 条记录</Tag>
          </Space>
        }
        extra={
          <Space wrap>
            {selectedRowKeys.length > 0 && (
              <Space>
                <Text type="secondary">已选择 {selectedRowKeys.length} 项</Text>
                <Button
                  size="small"
                  style={{ color: '#52c41a', borderColor: '#52c41a' }}
                  onClick={() => handleBatchReview('approve')}
                >
                  批量通过
                </Button>
                <Button size="small" danger onClick={() => handleBatchReview('reject')}>
                  批量驳回
                </Button>
                <Button
                  size="small"
                  icon={<DownloadOutlined />}
                  onClick={() => handleExport('selected')}
                  loading={exportLoading}
                >
                  导出选中 ({selectedRowKeys.length})
                </Button>
              </Space>
            )}

            <Button
              icon={<DownloadOutlined />}
              onClick={() => handleExport('all')}
              loading={exportLoading}
            >
              导出全部报表
            </Button>

            <Tooltip title="刷新列表">
              <Button icon={<ReloadOutlined />} onClick={() => fetchData()} loading={loading} />
            </Tooltip>
          </Space>
        }
      >
        <Table<AppealItem>
          rowKey="id"
          columns={columns}
          dataSource={appealList}
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
            showTotal: (t) => `共 ${t} 条申诉`,
            onChange: (page, size) => fetchData(page, size),
          }}
        />
      </Card>

      {/* 申诉核查与审核决策抽屉 */}
      <AppealDetailDrawer
        open={detailDrawerVisible}
        appeal={currentAppeal}
        onClose={() => setDetailDrawerVisible(false)}
        onReviewSubmit={handleDrawerReviewSubmit}
      />
    </div>
  );
};

export default AppealsPage;

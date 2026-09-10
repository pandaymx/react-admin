import {
  CheckCircleOutlined,
  CompassOutlined,
  DeleteOutlined,
  EditOutlined,
  EnvironmentOutlined,
  EyeOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  SyncOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Image,
  Input,
  message,
  Popconfirm,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tabs,
  Tag,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  cancelActivity,
  deleteActivity,
  getActivityPage,
  getActivitySummaryKPI,
} from '@/api/activity';
import type {
  ActivityDetailRespVO,
  ActivityItem,
  ActivityPageReqVO,
  ActivityStatus,
  ActivitySummaryKPI,
} from '@/types';
import { ActivityCancelModal } from './components/ActivityCancelModal';
import { ActivityDetailDrawer } from './components/ActivityDetailDrawer';
import { ActivityWizardModal } from './components/ActivityWizardModal';

const { Title, Text } = Typography;

const STATUS_CONFIG: Record<
  number,
  {
    label: string;
    color: string;
    status: 'default' | 'success' | 'processing' | 'error' | 'warning';
  }
> = {
  0: { label: '草稿', color: 'default', status: 'default' },
  5: { label: '审核中', color: 'processing', status: 'processing' },
  1: { label: '已发布', color: 'success', status: 'success' },
  2: { label: '进行中', color: 'warning', status: 'warning' },
  3: { label: '已结束', color: 'default', status: 'default' },
  4: { label: '已取消', color: 'error', status: 'error' },
  6: { label: '已驳回', color: 'error', status: 'error' },
};

export const ActivitiesPage: React.FC = () => {
  const {
    token: {
      colorBgContainer,
      colorBorderSecondary,
      borderRadiusLG,
      colorPrimary,
      colorSuccess,
      colorWarning,
    },
  } = theme.useToken();

  const [loading, setLoading] = useState<boolean>(false);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [kpi, setKpi] = useState<ActivitySummaryKPI | null>(null);

  // 筛选状态
  const [activeTabStatus, setActiveTabStatus] = useState<string>('all');
  const [searchTitle, setSearchTitle] = useState<string>('');
  const [cityFilter, setCityFilter] = useState<string>('all');

  // 弹窗与抽屉控制
  const [wizardOpen, setWizardOpen] = useState<boolean>(false);
  const [editingActivity, setEditingActivity] = useState<ActivityDetailRespVO | null>(null);

  const [detailDrawerOpen, setDetailDrawerOpen] = useState<boolean>(false);
  const [selectedActivityId, setSelectedActivityId] = useState<string | null>(null);

  const [cancelModalOpen, setCancelModalOpen] = useState<boolean>(false);
  const [targetCancelActivity, setTargetCancelActivity] = useState<ActivityItem | null>(null);

  // 拉取数据
  const fetchActivities = useCallback(async () => {
    try {
      setLoading(true);
      const params: ActivityPageReqVO = {
        pageNo: 1,
        pageSize: 50,
        status: activeTabStatus === 'all' ? 'all' : (Number(activeTabStatus) as ActivityStatus),
        city: cityFilter === 'all' ? undefined : cityFilter,
        title: searchTitle.trim() || undefined,
      };
      const [listRes, kpiRes] = await Promise.all([
        getActivityPage(params),
        getActivitySummaryKPI(),
      ]);

      if (listRes.code === 0 && listRes.data) {
        setActivities(listRes.data.list);
        setTotal(listRes.data.total);
      }
      if (kpiRes.code === 0 && kpiRes.data) {
        setKpi(kpiRes.data);
      }
    } catch {
      message.error('加载活动列表失败');
    } finally {
      setLoading(false);
    }
  }, [activeTabStatus, cityFilter, searchTitle]);

  useEffect(() => {
    fetchActivities();
  }, [fetchActivities]);

  // 取消活动回调
  const handleConfirmCancel = async (id: string, reason: string) => {
    await cancelActivity(id, reason);
    message.success('已取消该活动并触发退款通知');
    setCancelModalOpen(false);
    fetchActivities();
  };

  // 删除活动
  const handleDelete = async (record: ActivityItem) => {
    if (record.status !== 0 && record.status !== 4) {
      message.error('安全约束：仅允许删除处于「草稿」或「已取消」状态的活动！');
      return;
    }
    await deleteActivity(record.id);
    message.success('活动已物理删除');
    fetchActivities();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 顶部标题栏与新建按钮 */}
      <Card
        styles={{ body: { padding: '16px 24px' } }}
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <Space align="center" size={10}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: `${colorPrimary}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CompassOutlined style={{ fontSize: 22, color: colorPrimary }} />
            </div>
            <div>
              <Title level={4} style={{ margin: 0 }}>
                活动全生命周期运营中心
              </Title>
              <Text type="secondary" style={{ fontSize: 13 }}>
                全方位管控户外探险、球类竞技、休闲摄影活动发布、多子表整包调度、报名流水与成员履约
              </Text>
            </div>
          </Space>

          <Space>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingActivity(null);
                setWizardOpen(true);
              }}
            >
              发布新活动 (5步向导)
            </Button>
            <Button icon={<ReloadOutlined />} onClick={fetchActivities}>
              刷新
            </Button>
          </Space>
        </div>
      </Card>

      {/* KPI 指标大盘 */}
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="全部活动主档"
              value={kpi?.totalCount || 0}
              valueStyle={{ color: colorPrimary, fontWeight: 700 }}
              prefix={<CompassOutlined />}
              suffix="场"
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="已发布/报名中"
              value={kpi?.publishedCount || 0}
              valueStyle={{ color: colorSuccess, fontWeight: 700 }}
              prefix={<CheckCircleOutlined />}
              suffix="场"
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="当前进行中"
              value={kpi?.inProgressCount || 0}
              valueStyle={{ color: colorWarning, fontWeight: 700 }}
              prefix={<SyncOutlined spin />}
              suffix="场"
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="待审核/草稿"
              value={(kpi?.auditingCount || 0) + (kpi?.draftCount || 0)}
              valueStyle={{ color: '#722ed1', fontWeight: 700 }}
              prefix={<EditOutlined />}
              suffix="场"
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="累计成团人次"
              value={kpi?.totalParticipants || 0}
              valueStyle={{ color: '#13c2c2', fontWeight: 700 }}
              prefix={<TeamOutlined />}
              suffix="人"
            />
          </Card>
        </Col>
        <Col xs={12} sm={8} lg={4}>
          <Card bordered styles={{ body: { padding: '16px 20px' } }}>
            <Statistic
              title="累计产生流水"
              value={kpi?.totalRevenue || 0}
              valueStyle={{ color: '#fa8c16', fontWeight: 700 }}
              prefix={<WalletOutlined />}
              formatter={(val) => `¥${Number(val).toLocaleString()}`}
            />
          </Card>
        </Col>
      </Row>

      {/* 列表主体卡片 */}
      <Card
        bordered
        styles={{ body: { padding: '12px 20px 20px' } }}
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
      >
        {/* 状态管道 Tabs */}
        <Tabs
          activeKey={activeTabStatus}
          onChange={(key) => setActiveTabStatus(key)}
          style={{ marginBottom: 12 }}
          items={[
            { key: 'all', label: `全部活动 (${kpi?.totalCount || 0})` },
            { key: '1', label: `已发布 (${kpi?.publishedCount || 0})` },
            { key: '2', label: `进行中 (${kpi?.inProgressCount || 0})` },
            { key: '5', label: `审核中 (${kpi?.auditingCount || 0})` },
            { key: '0', label: `草稿箱 (${kpi?.draftCount || 0})` },
            { key: '3', label: `已结束 (${kpi?.endedCount || 0})` },
            { key: '4', label: `已取消 (${kpi?.cancelledCount || 0})` },
          ]}
        />

        {/* 搜索与过滤工具栏 */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
            marginBottom: 16,
          }}
        >
          <Space wrap>
            <Input
              placeholder="搜索活动标题 / 关键字..."
              prefix={<SearchOutlined style={{ color: '#aaa' }} />}
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              allowClear
              style={{ width: 260 }}
            />

            <Select
              value={cityFilter}
              onChange={(val) => setCityFilter(val)}
              style={{ width: 140 }}
              options={[
                { label: '全部城市', value: 'all' },
                { label: '北京', value: '北京' },
                { label: '杭州', value: '杭州' },
                { label: '宝鸡/西安', value: '宝鸡' },
                { label: '西宁', value: '西宁' },
                { label: '张家口', value: '张家口' },
              ]}
            />
          </Space>

          <Text type="secondary" style={{ fontSize: 13 }}>
            共筛选出 <strong>{total}</strong> 条活动记录
          </Text>
        </div>

        {/* 表格 */}
        <Table<ActivityItem>
          rowKey="id"
          dataSource={activities}
          loading={loading}
          pagination={{ pageSize: 10, showSizeChanger: true }}
          columns={[
            {
              title: '活动主档',
              key: 'title',
              width: 320,
              render: (_, record) => (
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <Image
                    src={
                      record.coverUrl ||
                      'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=200&q=80'
                    }
                    width={72}
                    height={52}
                    style={{ objectFit: 'cover', borderRadius: 6 }}
                  />
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                    <Text strong style={{ fontSize: 13, lineHeight: 1.3 }}>
                      {record.title}
                    </Text>
                    <Space size={4} wrap>
                      <Tag color="geekblue" style={{ fontSize: 11, margin: 0 }}>
                        <EnvironmentOutlined /> {record.city}
                      </Tag>
                      <Tag color="cyan" style={{ fontSize: 11, margin: 0 }}>
                        {record.subcategoryName || '户外活动'}
                      </Tag>
                    </Space>
                  </div>
                </div>
              ),
            },
            {
              title: '报名健康度',
              key: 'enrollment',
              width: 170,
              render: (_, record) => {
                const percent = record.maxParticipants
                  ? Math.min(
                      100,
                      Math.round((record.currentEnrollCount / record.maxParticipants) * 100),
                    )
                  : 0;
                return (
                  <div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 12,
                        marginBottom: 2,
                      }}
                    >
                      <Text>
                        {record.currentEnrollCount} / {record.maxParticipants} 人
                      </Text>
                      <Text type="secondary">{percent}%</Text>
                    </div>
                    <Progress
                      percent={percent}
                      size="small"
                      showInfo={false}
                      strokeColor={
                        percent >= 100 ? '#52c41a' : percent >= 70 ? colorPrimary : '#fa8c16'
                      }
                    />
                  </div>
                );
              },
            },
            {
              title: '收费模式',
              key: 'fee',
              width: 130,
              render: (_, record) => (
                <div>
                  <Text strong style={{ color: '#fa8c16', fontSize: 14 }}>
                    {record.feeMode === 'FREE' ? '免费' : `¥${record.feeAmount}`}
                  </Text>
                  <Tag style={{ marginLeft: 6, fontSize: 11 }}>
                    {record.feeMode === 'FREE'
                      ? '公益'
                      : record.feeMode === 'AA'
                        ? 'AA制'
                        : '固定收费'}
                  </Tag>
                </div>
              ),
            },
            {
              title: '起止时间',
              key: 'time',
              width: 170,
              render: (_, record) => (
                <div style={{ fontSize: 12 }}>
                  <Text>{record.startTime?.substring(0, 16)}</Text>
                  <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>
                    至 {record.endTime?.substring(5, 16)}
                  </Text>
                </div>
              ),
            },
            {
              title: '发布者',
              key: 'publisher',
              width: 140,
              render: (_, record) => (
                <Space size={8}>
                  <Avatar src={record.publisherAvatarUrl} icon={<UserOutlined />} size="small" />
                  <div>
                    <Text style={{ fontSize: 12 }}>
                      {record.publisherNickname || record.publisherUserId}
                    </Text>
                    <Text type="secondary" style={{ display: 'block', fontSize: 10 }}>
                      ID: {record.publisherUserId}
                    </Text>
                  </div>
                </Space>
              ),
            },
            {
              title: '状态',
              dataIndex: 'status',
              width: 95,
              render: (st: number) => {
                const conf = STATUS_CONFIG[st] || { label: '未知', color: 'default' };
                return <Tag color={conf.color}>{conf.label}</Tag>;
              },
            },
            {
              title: '操作',
              key: 'action',
              width: 170,
              render: (_, record) => (
                <Space size="small">
                  <Button
                    type="link"
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => {
                      setSelectedActivityId(record.id);
                      setDetailDrawerOpen(true);
                    }}
                  >
                    详情
                  </Button>

                  {record.status === 0 && (
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={() => {
                        setEditingActivity(record as ActivityDetailRespVO);
                        setWizardOpen(true);
                      }}
                    >
                      编辑
                    </Button>
                  )}

                  {record.status !== 3 && record.status !== 4 && (
                    <Button
                      type="link"
                      danger
                      size="small"
                      icon={<StopOutlined />}
                      onClick={() => {
                        setTargetCancelActivity(record);
                        setCancelModalOpen(true);
                      }}
                    >
                      取消
                    </Button>
                  )}

                  {(record.status === 0 || record.status === 4) && (
                    <Popconfirm
                      title="确认彻底删除该活动？"
                      description="仅草稿或已取消状态活动允许删除，删除后不可恢复"
                      onConfirm={() => handleDelete(record)}
                      okText="确认删除"
                      okButtonProps={{ danger: true }}
                      cancelText="取消"
                    >
                      <Button type="link" danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                  )}
                </Space>
              ),
            },
          ]}
        />
      </Card>

      {/* 5步向导发布工作台 */}
      <ActivityWizardModal
        open={wizardOpen}
        editingActivity={editingActivity}
        onClose={() => setWizardOpen(false)}
        onSuccess={fetchActivities}
      />

      {/* 活动全景详情抽屉 */}
      <ActivityDetailDrawer
        open={detailDrawerOpen}
        activityId={selectedActivityId}
        onClose={() => setDetailDrawerOpen(false)}
        onEdit={(act) => {
          setDetailDrawerOpen(false);
          setEditingActivity(act);
          setWizardOpen(true);
        }}
      />

      {/* 取消原因确认弹窗 */}
      <ActivityCancelModal
        open={cancelModalOpen}
        activity={targetCancelActivity}
        onClose={() => setCancelModalOpen(false)}
        onConfirm={handleConfirmCancel}
      />
    </div>
  );
};

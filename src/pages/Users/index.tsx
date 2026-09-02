import {
  CheckCircleFilled,
  ClockCircleOutlined,
  DownloadOutlined,
  EyeOutlined,
  LockOutlined,
  ManOutlined,
  MoreOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateFilled,
  SearchOutlined,
  StarFilled,
  StopOutlined,
  UnlockOutlined,
  UserOutlined,
  WomanOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Form,
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
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

import {
  batchUpdateUserStatus,
  getAllFilteredUsers,
  getUserList,
  updateUserStatus,
} from '@/api/user';
import type { ActiveStatus, UserItem, UserQueryParams, UserStatus, VerifyStatus } from '@/types';
import { exportToCsv } from '@/utils/export';

const { Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

export const UsersPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 抽屉详情状态
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);

  // 新建/编辑弹窗占位
  const [editModalVisible, setEditModalVisible] = useState<boolean>(false);

  // 获取用户数据
  const fetchData = useCallback(
    async (page = 1, size = 10) => {
      setLoading(true);
      try {
        const formValues = form.getFieldsValue();
        const params: UserQueryParams = {
          keyword: formValues.keyword,
          uid: formValues.uid,
          verifyStatus: formValues.verifyStatus,
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

        const res = await getUserList(params);
        if (res.code === 200) {
          setUserList(res.data.list);
          setTotal(res.data.total);
          setCurrentPage(res.data.page);
          setPageSize(res.data.pageSize);
        }
      } catch (err: any) {
        message.error(err.message || '获取用户列表失败');
      } finally {
        setLoading(false);
      }
    },
    [form],
  );

  useEffect(() => {
    fetchData(1, 10);
  }, [fetchData]);

  // 搜索
  const handleSearch = () => {
    fetchData(1, pageSize);
  };

  // 重置
  const handleReset = () => {
    form.resetFields();
    fetchData(1, pageSize);
  };

  // 切换用户状态 (正常 / 封禁 / 禁言 / 注销)
  const handleStatusChange = async (record: UserItem, newStatus: UserStatus) => {
    try {
      const res = await updateUserStatus(record.id, newStatus);
      if (res.code === 200) {
        message.success(`已将用户【${record.nickname}】状态更新`);
        fetchData(currentPage, pageSize);
        if (currentUser?.id === record.id) {
          setCurrentUser({ ...currentUser, status: newStatus });
        }
      }
    } catch {
      message.error('更新用户状态失败');
    }
  };

  // 批量更新状态
  const handleBatchStatus = async (status: UserStatus) => {
    if (!selectedRowKeys.length) {
      message.warning('请先勾选需要操作的用户');
      return;
    }
    try {
      const ids = selectedRowKeys as string[];
      const res = await batchUpdateUserStatus(ids, status);
      if (res.code === 200) {
        message.success(res.message);
        setSelectedRowKeys([]);
        fetchData(currentPage, pageSize);
      }
    } catch {
      message.error('批量操作失败');
    }
  };

  // 数据导出
  const handleExport = async (type: 'all' | 'selected') => {
    setExportLoading(true);
    try {
      let exportData: UserItem[] = [];
      if (type === 'selected') {
        if (!selectedRowKeys.length) {
          message.warning('请先勾选需要导出的用户数据');
          setExportLoading(false);
          return;
        }
        exportData = userList.filter((item) => selectedRowKeys.includes(item.id));
      } else {
        const formValues = form.getFieldsValue();
        const params: Omit<UserQueryParams, 'page' | 'pageSize'> = {
          keyword: formValues.keyword,
          uid: formValues.uid,
          verifyStatus: formValues.verifyStatus,
          status: formValues.status,
        };
        if (formValues.dateRange && formValues.dateRange.length === 2) {
          params.dateRange = [
            formValues.dateRange[0].format('YYYY-MM-DD'),
            formValues.dateRange[1].format('YYYY-MM-DD'),
          ];
        }
        exportData = await getAllFilteredUsers(params);
      }

      if (!exportData.length) {
        message.info('当前条件下暂无用户数据可导出');
        return;
      }

      exportToCsv(
        [
          { title: '用户ID', key: 'id' },
          { title: 'UID', key: 'uid' },
          { title: '昵称', key: 'nickname' },
          { title: '用户名', key: 'username' },
          {
            title: '性别',
            key: 'gender',
            render: (r) => (r.gender === 'male' ? '男' : r.gender === 'female' ? '女' : '未知'),
          },
          {
            title: '认证状态',
            key: 'verifyStatus',
            render: (r) => {
              const map: Record<VerifyStatus, string> = {
                creator: '达人认证',
                enterprise: '企业认证',
                personal: '个人实名',
                pending: '认证审核中',
                unverified: '未认证',
              };
              return map[r.verifyStatus] || '未认证';
            },
          },
          { title: '认证信息', key: 'verifyInfo' },
          {
            title: '账号状态',
            key: 'status',
            render: (r) => {
              const map: Record<UserStatus, string> = {
                normal: '正常',
                banned: '已封禁',
                muted: '已禁言',
                cancelled: '已注销',
              };
              return map[r.status] || '未知';
            },
          },
          { title: '评论数', key: 'commentCount' },
          {
            title: '评论状态',
            key: 'commentStatus',
            render: (r) => (r.commentStatus === 'allowed' ? '正常发言' : '已禁评'),
          },
          { title: '作品数', key: 'postCount' },
          { title: '获赞总数', key: 'likeCount' },
          { title: '粉丝数', key: 'followerCount' },
          { title: '参与活动数', key: 'activityCount' },
          { title: '最后活跃时间', key: 'lastActiveTime' },
          { title: '注册时间', key: 'registerTime' },
          { title: '联系电话', key: 'phone' },
          { title: '电子邮箱', key: 'email' },
        ],
        exportData,
        type === 'selected' ? `用户数据_已选${exportData.length}条` : '用户管理数据列表',
      );

      message.success(`成功导出 ${exportData.length} 条用户数据`);
    } catch (err: any) {
      message.error(err.message || '导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  // 认证状态 Tag 渲染
  const renderVerifyTag = (verifyStatus: VerifyStatus, verifyInfo?: string) => {
    let tag = <Tag color="default">未认证</Tag>;
    if (verifyStatus === 'pending') {
      tag = (
        <Tag color="processing" icon={<ClockCircleOutlined />} style={{ borderRadius: 10 }}>
          审核中
        </Tag>
      );
    } else if (verifyStatus === 'creator') {
      tag = (
        <Tag color="gold" icon={<StarFilled />} style={{ borderRadius: 10 }}>
          达人认证
        </Tag>
      );
    } else if (verifyStatus === 'enterprise') {
      tag = (
        <Tag color="blue" icon={<SafetyCertificateFilled />} style={{ borderRadius: 10 }}>
          企业认证
        </Tag>
      );
    } else if (verifyStatus === 'personal') {
      tag = (
        <Tag color="cyan" icon={<CheckCircleFilled />} style={{ borderRadius: 10 }}>
          实名认证
        </Tag>
      );
    }

    if (verifyInfo) {
      return (
        <Tooltip title={verifyInfo} placement="topLeft">
          <span style={{ cursor: 'pointer' }}>{tag}</span>
        </Tooltip>
      );
    }
    return tag;
  };

  // 账号状态 Badge 渲染
  const renderAccountStatus = (status: UserStatus) => {
    switch (status) {
      case 'normal':
        return <Badge status="success" text={<Text type="success">正常</Text>} />;
      case 'banned':
        return <Badge status="error" text={<Text type="danger">已封禁</Text>} />;
      case 'muted':
        return <Badge status="warning" text={<Text style={{ color: '#fa8c16' }}>已禁言</Text>} />;
      case 'cancelled':
        return <Badge status="default" text={<Text type="secondary">已注销</Text>} />;
      default:
        return <Badge status="default" text="未知" />;
    }
  };

  // 活跃状态指示
  const renderActiveStatusDot = (activeStatus: ActiveStatus, lastActiveTime: string) => {
    let dotColor = '#bfbfbf';
    let textDesc = '离线';
    if (activeStatus === 'online') {
      dotColor = '#52c41a';
      textDesc = '当前在线';
    } else if (activeStatus === 'recent') {
      dotColor = '#1677ff';
      textDesc = '近期活跃';
    }

    return (
      <Tooltip title={`状态: ${textDesc} | 时间: ${lastActiveTime}`}>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <span
            style={{
              width: 8,
              height: 8,
              borderRadius: '50%',
              backgroundColor: dotColor,
              display: 'inline-block',
            }}
          />
          <Text style={{ fontSize: 13 }}>{lastActiveTime.slice(5, 16)}</Text>
        </span>
      </Tooltip>
    );
  };

  // 表格列定义
  const columns: TableProps<UserItem>['columns'] = [
    {
      title: '用户',
      dataIndex: 'nickname',
      key: 'user',
      width: 260,
      render: (_, record) => {
        const handleOpenDetail = () => {
          setCurrentUser(record);
          setDrawerVisible(true);
        };

        return (
          <Space size={12} orientation="horizontal" align="center">
            <Avatar
              src={record.avatar}
              size={44}
              icon={<UserOutlined />}
              onClick={handleOpenDetail}
              style={{
                border: '2px solid #f0f0f0',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            />
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <Space size={4}>
                <button
                  type="button"
                  onClick={handleOpenDetail}
                  style={{
                    background: 'none',
                    border: 'none',
                    padding: 0,
                    margin: 0,
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'inherit',
                    textAlign: 'left',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.color = '#1677ff';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.color = 'inherit';
                  }}
                >
                  {record.nickname}
                </button>
                {record.gender === 'male' && (
                  <ManOutlined style={{ color: '#1677ff', fontSize: 12 }} />
                )}
                {record.gender === 'female' && (
                  <WomanOutlined style={{ color: '#eb2f96', fontSize: 12 }} />
                )}
              </Space>
              <Text
                type="secondary"
                copyable={{ text: record.username, tooltips: ['复制用户名', '已复制'] }}
                style={{ fontSize: 12 }}
              >
                @{record.username}
              </Text>
            </div>
          </Space>
        );
      },
    },
    {
      title: '认证状态',
      dataIndex: 'verifyStatus',
      key: 'verifyStatus',
      width: 130,
      render: (verifyStatus: VerifyStatus, record) =>
        renderVerifyTag(verifyStatus, record.verifyInfo),
    },
    {
      title: '账号状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: UserStatus) => renderAccountStatus(status),
    },
    {
      title: '评论',
      dataIndex: 'commentCount',
      key: 'comment',
      width: 140,
      sorter: (a, b) => a.commentCount - b.commentCount,
      render: (count: number, record) => (
        <div>
          <div>
            <Text strong style={{ fontSize: 13 }}>
              {count.toLocaleString()}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {' '}
              条
            </Text>
          </div>
          <div>
            {record.commentStatus === 'allowed' ? (
              <Tag color="green" style={{ fontSize: 11, padding: '0 4px', margin: 0 }}>
                正常互动
              </Tag>
            ) : (
              <Tag color="error" style={{ fontSize: 11, padding: '0 4px', margin: 0 }}>
                已禁言评论
              </Tag>
            )}
          </div>
        </div>
      ),
    },
    {
      title: '发帖',
      dataIndex: 'postCount',
      key: 'post',
      width: 140,
      sorter: (a, b) => a.postCount - b.postCount,
      render: (count: number, record) => (
        <div>
          <div>
            <Text strong style={{ fontSize: 13 }}>
              {count.toLocaleString()}
            </Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {' '}
              篇作品
            </Text>
          </div>
          <Text type="secondary" style={{ fontSize: 11 }}>
            获赞 {(record.likeCount / 10000).toFixed(1)}w
          </Text>
        </div>
      ),
    },
    {
      title: '活动',
      dataIndex: 'activityCount',
      key: 'activity',
      width: 180,
      sorter: (a, b) => a.activityCount - b.activityCount,
      render: (count: number, record) => (
        <div>
          <div style={{ marginBottom: 2 }}>
            <Tag color="purple" style={{ fontSize: 11, margin: 0, borderRadius: 4 }}>
              参与 {count} 场活动
            </Tag>
          </div>
          <div>{renderActiveStatusDot(record.activeStatus, record.lastActiveTime)}</div>
        </div>
      ),
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => {
        const moreMenuItems = [
          {
            key: 'detail',
            icon: <EyeOutlined />,
            label: '查看完整画像',
            onClick: () => {
              setCurrentUser(record);
              setDrawerVisible(true);
            },
          },
          {
            key: 'edit',
            icon: <UserOutlined />,
            label: '编辑资料',
            onClick: () => {
              setCurrentUser(record);
              setEditModalVisible(true);
            },
          },
          {
            type: 'divider' as const,
          },
          {
            key: 'status-normal',
            icon: <UnlockOutlined />,
            label: '恢复正常',
            disabled: record.status === 'normal',
            onClick: () => handleStatusChange(record, 'normal'),
          },
          {
            key: 'status-muted',
            icon: <StopOutlined />,
            label: '禁言用户',
            disabled: record.status === 'muted',
            onClick: () => handleStatusChange(record, 'muted'),
          },
          {
            key: 'status-banned',
            icon: <LockOutlined />,
            label: '封禁账号',
            danger: true,
            disabled: record.status === 'banned',
            onClick: () => handleStatusChange(record, 'banned'),
          },
        ];

        return (
          <Space size="small">
            <Button
              type="link"
              size="small"
              icon={<EyeOutlined />}
              onClick={() => {
                setCurrentUser(record);
                setDrawerVisible(true);
              }}
            >
              详情
            </Button>
            {record.status === 'banned' ? (
              <Popconfirm
                title="解封确认"
                description={`确定要解除用户【${record.nickname}】的封禁状态吗？`}
                onConfirm={() => handleStatusChange(record, 'normal')}
                okText="解封"
                cancelText="取消"
              >
                <Button type="link" size="small" style={{ color: '#52c41a' }}>
                  解封
                </Button>
              </Popconfirm>
            ) : (
              <Popconfirm
                title="封禁确认"
                description={`确定要封禁用户【${record.nickname}】吗？封禁后用户无法登录互动。`}
                onConfirm={() => handleStatusChange(record, 'banned')}
                okText="确定封禁"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Button type="link" size="small" danger>
                  封禁
                </Button>
              </Popconfirm>
            )}
            <Dropdown menu={{ items: moreMenuItems }} trigger={['click']} placement="bottomRight">
              <Button type="text" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
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
          layout="horizontal"
          onFinish={handleSearch}
          initialValues={{
            verifyStatus: 'all',
            status: 'all',
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="用户搜索" name="keyword" style={{ marginBottom: 0 }}>
                <Input
                  placeholder="搜索昵称 / @用户名"
                  allowClear
                  prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={4}>
              <Form.Item label="认证状态" name="verifyStatus" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部认证', value: 'all' },
                    { label: '认证审核中', value: 'pending' },
                    { label: '未认证', value: 'unverified' },
                    { label: '实名认证', value: 'personal' },
                    { label: '企业认证(蓝V)', value: 'enterprise' },
                    { label: '达人认证(黄V)', value: 'creator' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={4}>
              <Form.Item label="账号状态" name="status" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部状态', value: 'all' },
                    { label: '正常', value: 'normal' },
                    { label: '已封禁', value: 'banned' },
                    { label: '已禁言', value: 'muted' },
                    { label: '已注销', value: 'cancelled' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={10} lg={6}>
              <Form.Item label="注册日期" name="dateRange" style={{ marginBottom: 0 }}>
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={6} lg={4}>
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

      {/* 数据表格卡片 */}
      <Card
        variant="borderless"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          borderRadius: 8,
        }}
        title={
          <Space size="middle">
            <span style={{ fontSize: 16, fontWeight: 600 }}>用户数据列表</span>
            <Tag color="blue">共 {total} 名用户</Tag>
          </Space>
        }
        extra={
          <Space wrap>
            {selectedRowKeys.length > 0 && (
              <Space>
                <Text type="secondary">已选择 {selectedRowKeys.length} 项</Text>
                <Button size="small" onClick={() => handleBatchStatus('normal')}>
                  批量恢复正常
                </Button>
                <Button size="small" danger onClick={() => handleBatchStatus('banned')}>
                  批量封禁
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
              导出全部数据
            </Button>

            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentUser(null);
                setEditModalVisible(true);
              }}
            >
              新建用户
            </Button>

            <Tooltip title="刷新当前列表">
              <Button icon={<ReloadOutlined />} onClick={() => fetchData()} loading={loading} />
            </Tooltip>
          </Space>
        }
      >
        <Table<UserItem>
          rowKey="id"
          columns={columns}
          dataSource={userList}
          loading={loading}
          scroll={{ x: 1200 }}
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
            pageSizeOptions: ['10', '20', '50'],
            showTotal: (allTotal) => `共 ${allTotal} 条记录`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
              fetchData(page, size);
            },
          }}
        />
      </Card>

      {/* 用户完整画像抽屉 */}
      <Drawer
        title="用户全景画像与详细档案"
        placement="right"
        size="large"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          currentUser && (
            <Space>
              {currentUser.status === 'banned' ? (
                <Button type="primary" onClick={() => handleStatusChange(currentUser, 'normal')}>
                  解封账号
                </Button>
              ) : (
                <Button danger onClick={() => handleStatusChange(currentUser, 'banned')}>
                  封禁账号
                </Button>
              )}
            </Space>
          )
        }
      >
        {currentUser && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <Avatar src={currentUser.avatar} size={72} icon={<UserOutlined />} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {currentUser.nickname}
                  </Title>
                  {renderVerifyTag(currentUser.verifyStatus, currentUser.verifyInfo)}
                </div>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">UID: </Text>
                  <Text code copyable>
                    {currentUser.uid}
                  </Text>
                  <Text type="secondary" style={{ marginLeft: 12 }}>
                    用户名: @{currentUser.username}
                  </Text>
                </div>
              </div>
            </div>

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
                <Card size="small" variant="borderless" style={{ background: '#f6ffed' }}>
                  <Statistic
                    title="作品发帖数"
                    value={currentUser.postCount}
                    valueStyle={{ color: '#3f8600' }}
                    suffix="篇"
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" variant="borderless" style={{ background: '#e6f4ff' }}>
                  <Statistic
                    title="获赞总数"
                    value={currentUser.likeCount}
                    valueStyle={{ color: '#0958d9' }}
                    formatter={(val) => `${(Number(val) / 10000).toFixed(1)}w`}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" variant="borderless" style={{ background: '#fff7e6' }}>
                  <Statistic
                    title="粉丝总数"
                    value={currentUser.followerCount}
                    valueStyle={{ color: '#d46b08' }}
                    formatter={(val) => `${(Number(val) / 10000).toFixed(1)}w`}
                  />
                </Card>
              </Col>
              <Col span={6}>
                <Card size="small" variant="borderless" style={{ background: '#f9f0ff' }}>
                  <Statistic
                    title="评论互动数"
                    value={currentUser.commentCount}
                    valueStyle={{ color: '#531dab' }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

            <Descriptions title="基本资料" column={2} bordered size="small">
              <Descriptions.Item label="账号状态">
                {renderAccountStatus(currentUser.status)}
              </Descriptions.Item>
              <Descriptions.Item label="认证类型">
                {renderVerifyTag(currentUser.verifyStatus, currentUser.verifyInfo)}
              </Descriptions.Item>
              <Descriptions.Item label="认证描述" span={2}>
                {currentUser.verifyInfo || '暂无认证说明'}
              </Descriptions.Item>
              <Descriptions.Item label="性别">
                {currentUser.gender === 'male'
                  ? '男'
                  : currentUser.gender === 'female'
                    ? '女'
                    : '保密'}
              </Descriptions.Item>
              <Descriptions.Item label="参与活动数">
                {currentUser.activityCount} 场
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                {currentUser.phone || '未绑定'}
              </Descriptions.Item>
              <Descriptions.Item label="电子邮箱">
                {currentUser.email || '未绑定'}
              </Descriptions.Item>
              <Descriptions.Item label="注册时间">{currentUser.registerTime}</Descriptions.Item>
              <Descriptions.Item label="最近活跃时间">
                {currentUser.lastActiveTime}
              </Descriptions.Item>
              <Descriptions.Item label="个性签名" span={2}>
                {currentUser.bio || '这个人很懒，什么都没有留下~'}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>

      {/* 新建/编辑用户 Modal */}
      <Modal
        title={currentUser ? `编辑用户【${currentUser.nickname}】` : '新建用户'}
        open={editModalVisible}
        onOk={() => {
          message.success('操作成功（Mock已就绪，后期对接后端保存接口）');
          setEditModalVisible(false);
        }}
        onCancel={() => setEditModalVisible(false)}
        destroyOnClose
      >
        <Paragraph type="secondary" style={{ marginTop: 12 }}>
          用户模块已标准化分层，当前为 Mock 数据交互模式。保存动作将触发 API 提交并刷新列表。
        </Paragraph>
        <Form
          layout="vertical"
          initialValues={currentUser || { gender: 'male', verifyStatus: 'unverified' }}
        >
          <Form.Item
            label="用户昵称"
            name="nickname"
            rules={[{ required: true, message: '请输入昵称' }]}
          >
            <Input placeholder="例如：极客创作者" />
          </Form.Item>
          <Form.Item
            label="抖音 UID"
            name="uid"
            rules={[{ required: true, message: '请输入 UID' }]}
          >
            <Input placeholder="例如：dy_998811" />
          </Form.Item>
          <Form.Item
            label="用户名"
            name="username"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="例如：geek_tech" />
          </Form.Item>
          <Form.Item label="认证类型" name="verifyStatus">
            <Select
              options={[
                { label: '未认证', value: 'unverified' },
                { label: '个人实名认证', value: 'personal' },
                { label: '企业认证(蓝V)', value: 'enterprise' },
                { label: '达人认证(黄V)', value: 'creator' },
              ]}
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

const { Title } = Typography;

export default UsersPage;

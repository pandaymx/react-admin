import {
  CheckCircleFilled,
  DownloadOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  IdcardOutlined,
  LockOutlined,
  MoreOutlined,
  PhoneOutlined,
  ReloadOutlined,
  SafetyCertificateFilled,
  SearchOutlined,
  StopOutlined,
  TeamOutlined,
  UnlockOutlined,
  UserDeleteOutlined,
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
  Descriptions,
  Divider,
  Drawer,
  Dropdown,
  Form,
  Input,
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
  batchUpdateUserStatus,
  executeUserBan,
  getAllFilteredUsers,
  getUserList,
  getUserStatisticsSummary,
  updateUserStatus,
} from '@/api/user';
import { type ColumnOptionItem, useColumnSettings } from '@/components/ColumnSetting';
import type {
  AdminUserPageReqVO,
  UserItem,
  UserQueryParams,
  UserStatisticsRespVO,
  UserStatus,
  VerifyStatus,
} from '@/types';
import { exportToCsv } from '@/utils/export';
import { formatBanRemainingTime, formatDateTime } from '@/utils/time';
import { type BanPunishType, UserBanModal } from './components/UserBanModal';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// 可选列配置清单（对齐后端 AdminUserRespVO 字段，核心关键列锁定）
const userColumnOptions: ColumnOptionItem[] = [
  { key: 'user', title: '用户信息 (头像/昵称/展示号)', required: true },
  { key: 'phoneNumber', title: '联系手机号' },
  { key: 'qualification', title: '认证类型 (个人/企业)' },
  { key: 'certified', title: '实名认证状态' },
  { key: 'status', title: '账号状态与处罚' },
  { key: 'fans', title: '粉丝/关注/好友数' },
  { key: 'createTime', title: '注册时间' },
  { key: 'action', title: '操作列', required: true },
];

export const UsersPage: React.FC = () => {
  const { token } = theme.useToken();
  const { checkedKeys, ColumnSettingComponent } = useColumnSettings(
    'users_table',
    userColumnOptions,
  );
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [userList, setUserList] = useState<UserItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 全局用户概览统计
  const [summary, setSummary] = useState<UserStatisticsRespVO>({
    totalCount: 0,
    normalCount: 0,
    disabledCount: 0,
    cancelledCount: 0,
    todayNewCount: 0,
    weekNewCount: 0,
    monthNewCount: 0,
  });

  // 基础档案详情抽屉状态
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [isPhoneRevealed, setIsPhoneRevealed] = useState<boolean>(false);

  // 封禁处置弹窗状态
  const [banModalVisible, setBanModalVisible] = useState<boolean>(false);
  const [banTargetUsers, setBanTargetUsers] = useState<UserItem[]>([]);
  const [banDefaultPunishType, setBanDefaultPunishType] = useState<BanPunishType>('account');

  // 防抖定时器引用
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 手机号脱敏工具函数
  const formatMaskedPhone = (phone?: string, isRevealed = false) => {
    if (!phone) return '未绑定';
    if (isRevealed) return phone;
    return phone
      .replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
      .replace(/^(\d{3,4}-)\d{4}(\d{4})$/, '$1****$2');
  };

  // 加载统计概览
  const fetchSummary = useCallback(async () => {
    try {
      const res = await getUserStatisticsSummary();
      if (res.code === 200 && res.data) {
        setSummary(res.data);
      }
    } catch {
      // ignore
    }
  }, []);

  // 获取用户列表数据 (对接 GET /admin-api/user/users/page)
  const fetchData = useCallback(
    async (page = 1, size = 10) => {
      setLoading(true);
      try {
        const formValues = form.getFieldsValue();
        const params: UserQueryParams = {
          userId: formValues.userId,
          phoneNumber: formValues.phoneNumber,
          nickname: formValues.nickname,
          status: formValues.status,
          qualification: formValues.qualification,
          certified: formValues.certified,
          pageNo: page,
          pageSize: size,
        };

        if (formValues.dateRange && formValues.dateRange.length === 2) {
          params.dateRange = [
            formValues.dateRange[0].format('YYYY-MM-DD 00:00:00'),
            formValues.dateRange[1].format('YYYY-MM-DD 23:59:59'),
          ];
        }

        const res = await getUserList(params);
        if (res.code === 200 && res.data) {
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
    fetchSummary();
  }, [fetchData, fetchSummary]);

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

  const handleFormValuesChange = (changedValues: any) => {
    if (
      'userId' in changedValues ||
      'phoneNumber' in changedValues ||
      'nickname' in changedValues
    ) {
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

  // 状态变更 (正常 1 / 禁用 2 / 注销 3)
  const handleStatusChange = async (record: UserItem, newStatus: UserStatus) => {
    try {
      const res = await updateUserStatus(record.id, newStatus);
      if (res.code === 200) {
        message.success('账号状态更新成功');
        fetchData(currentPage, pageSize);
        fetchSummary();
      }
    } catch {
      message.error('更新状态失败');
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
        fetchSummary();
      }
    } catch {
      message.error('批量更新状态失败');
    }
  };

  // 打开违规处置弹窗
  const handleOpenBanModal = (users: UserItem[], defaultType: BanPunishType = 'account') => {
    if (!users.length) {
      message.warning('请先勾选目标用户');
      return;
    }
    setBanTargetUsers(users);
    setBanDefaultPunishType(defaultType);
    setBanModalVisible(true);
  };

  // 确认执行封禁
  const handleConfirmBan = async (values: {
    punishType: BanPunishType;
    duration: string;
    expireTime: string;
    reason: string;
    remark?: string;
    notifyUser: boolean;
  }) => {
    try {
      const userIds = banTargetUsers.map((u) => u.id);
      const res = await executeUserBan({ ...values, userIds });
      if (res.code === 200) {
        message.success(res.message);
        setBanModalVisible(false);
        setSelectedRowKeys([]);
        fetchData(currentPage, pageSize);
        fetchSummary();
      }
    } catch {
      message.error('执行处置失败');
    }
  };

  // 导出 CSV
  const handleExport = async (type: 'all' | 'selected' = 'all') => {
    setExportLoading(true);
    try {
      let dataToExport: UserItem[] = [];

      if (type === 'selected') {
        dataToExport = userList.filter((u) => selectedRowKeys.includes(u.id));
        if (!dataToExport.length) {
          message.warning('请先勾选要导出的用户');
          setExportLoading(false);
          return;
        }
      } else {
        const formValues = form.getFieldsValue();
        const params: AdminUserPageReqVO = {
          userId: formValues.userId,
          phoneNumber: formValues.phoneNumber,
          nickname: formValues.nickname,
          status: formValues.status !== 'all' ? formValues.status : undefined,
          qualification: formValues.qualification !== 'all' ? formValues.qualification : undefined,
          certified: formValues.certified !== 'all' ? formValues.certified : undefined,
        };
        dataToExport = await getAllFilteredUsers(params);
      }

      if (!dataToExport.length) {
        message.warning('当前无数据可导出');
        setExportLoading(false);
        return;
      }

      exportToCsv(
        [
          { title: '展示号(UID)', key: 'userId' },
          { title: '用户昵称', key: 'nickname' },
          {
            title: '联系手机号',
            key: 'phoneNumber',
            render: (r) => formatMaskedPhone(r.phoneNumber || r.phone, false),
          },
          {
            title: '认证类型',
            key: 'qualification',
            render: (r) =>
              r.qualification === 2 ? '企业认证' : r.qualification === 1 ? '个人认证' : '未认证',
          },
          {
            title: '实名状态',
            key: 'certified',
            render: (r) => (r.certified ? '已实名' : '未实名'),
          },
          {
            title: '账号状态',
            key: 'status',
            render: (r) =>
              r.status === 'banned' ? '已封禁' : r.status === 'cancelled' ? '已注销' : '正常',
          },
          { title: '粉丝数', key: 'fanCount' },
          { title: '关注数', key: 'followCount' },
          { title: '好友数', key: 'friendCount' },
          {
            title: '注册时间',
            key: 'createTime',
            render: (r) => formatDateTime(r.createTime || r.registerTime),
          },
        ],
        dataToExport,
        '用户管理数据报表',
      );

      message.success(`成功导出 ${dataToExport.length} 条用户数据`);
    } catch (err: any) {
      message.error(err.message || '导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  // 认证标签渲染 (1=个人，2=企业，其余未认证)
  const renderQualificationTag = (qualification?: number, verifyStatus?: VerifyStatus) => {
    if (qualification === 2 || verifyStatus === 'enterprise') {
      return (
        <Tag color="blue" icon={<SafetyCertificateFilled />} style={{ borderRadius: 10 }}>
          企业认证
        </Tag>
      );
    }
    if (qualification === 1 || verifyStatus === 'personal') {
      return (
        <Tag color="cyan" icon={<CheckCircleFilled />} style={{ borderRadius: 10 }}>
          个人认证
        </Tag>
      );
    }
    return (
      <Tag color="default" style={{ borderRadius: 10 }}>
        未认证
      </Tag>
    );
  };

  // 账号状态渲染 (1=正常, 2=禁用, 3=注销)
  const renderAccountStatus = (record: UserItem) => {
    const status = record.status;
    const banInfo = formatBanRemainingTime(record.accountBanExpireTime);

    switch (status) {
      case 'normal':
        return <Badge status="success" text={<Text type="success">正常</Text>} />;
      case 'banned': {
        const tooltipContent = (
          <div style={{ fontSize: 12 }}>
            <div style={{ fontWeight: 600, color: '#ff4d4f', marginBottom: 2 }}>
              🚫 账号处于禁用/封禁中
            </div>
            <div>处罚原因: {record.banReason || '违反平台社区公约与安全规定'}</div>
            <div>
              到期时间:{' '}
              {record.accountBanExpireTime === 'permanent'
                ? '永久封禁'
                : record.accountBanExpireTime || '永久'}
            </div>
            {banInfo.text && <div>剩余时间: {banInfo.text}</div>}
          </div>
        );
        return (
          <div>
            <Tooltip title={tooltipContent}>
              <Space size={4} style={{ cursor: 'help' }}>
                <Badge
                  status="error"
                  text={
                    <Text type="danger" strong>
                      已禁用
                    </Text>
                  }
                />
                <Tag color="error" style={{ fontSize: 10, padding: '0 3px', margin: 0 }}>
                  {banInfo.text || '永久'}
                </Tag>
              </Space>
            </Tooltip>
            {record.banReason && (
              <Tooltip title={`封禁原因: ${record.banReason}`}>
                <div
                  style={{
                    fontSize: 11,
                    color: '#ff4d4f',
                    marginTop: 2,
                    maxWidth: 135,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {record.banReason}
                </div>
              </Tooltip>
            )}
          </div>
        );
      }
      case 'cancelled':
        return <Badge status="default" text={<Text type="secondary">已注销</Text>} />;
      default:
        return <Badge status="default" text="未知" />;
    }
  };

  // 表格列定义 (对齐 AdminUserRespVO)
  const columns: TableProps<UserItem>['columns'] = [
    {
      title: '用户',
      dataIndex: 'nickname',
      key: 'user',
      width: 250,
      render: (_, record) => {
        const handleOpenDetail = () => {
          setCurrentUser(record);
          setDrawerVisible(true);
        };

        return (
          <Space size={12} orientation="horizontal" align="center">
            <Avatar
              src={record.avatarUrl || record.avatar}
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
              <Space size={4} style={{ marginTop: 2 }}>
                <Text
                  type="secondary"
                  copyable={{
                    text: String(record.userId || record.uid),
                    tooltips: ['复制展示号', '已复制'],
                  }}
                  style={{ fontSize: 12 }}
                >
                  UID: {record.userId || record.uid}
                </Text>
                {record.initStatus === 0 && (
                  <Tag style={{ fontSize: 10, padding: '0 3px', margin: 0 }}>保底账号</Tag>
                )}
              </Space>
            </div>
          </Space>
        );
      },
    },
    {
      title: '联系手机号',
      dataIndex: 'phoneNumber',
      key: 'phoneNumber',
      width: 150,
      render: (phone: string, record) => {
        const p = phone || record.phone;
        return (
          <Text code copyable={p ? { text: p, tooltips: ['复制手机号', '已复制'] } : false}>
            {formatMaskedPhone(p, false)}
          </Text>
        );
      },
    },
    {
      title: '认证类型',
      dataIndex: 'qualification',
      key: 'qualification',
      width: 120,
      render: (q: number, record) => renderQualificationTag(q, record.verifyStatus),
    },
    {
      title: '实名认证',
      dataIndex: 'certified',
      key: 'certified',
      width: 110,
      render: (certified: boolean) =>
        certified ? (
          <Tag color="green" icon={<CheckCircleFilled />}>
            已实名
          </Tag>
        ) : (
          <Tag color="default">未实名</Tag>
        ),
    },
    {
      title: '账号状态',
      dataIndex: 'status',
      key: 'status',
      width: 160,
      render: (_, record) => renderAccountStatus(record),
    },
    {
      title: '粉丝 / 关注 / 好友',
      key: 'fans',
      width: 170,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>
            <Text type="secondary">粉丝: </Text>
            <Text strong>{(record.fanCount || 0).toLocaleString()}</Text>
          </div>
          <div>
            <Text type="secondary">关注: </Text>
            <span>{record.followCount || 0}</span>
            <Text type="secondary" style={{ marginLeft: 6 }}>
              好友:{' '}
            </Text>
            <span>{record.friendCount || 0}</span>
          </div>
        </div>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (time: any, record) => {
        return <Text style={{ fontSize: 12 }}>{formatDateTime(time || record.registerTime)}</Text>;
      },
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => {
        const moreMenuItems = [
          {
            key: 'punish-setting',
            icon: <StopOutlined style={{ color: '#ff4d4f' }} />,
            label: '违规处置设置',
            onClick: () => handleOpenBanModal([record], 'account'),
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
            key: 'status-banned',
            icon: <LockOutlined />,
            label: '禁用账号',
            danger: true,
            disabled: record.status === 'banned',
            onClick: () => handleOpenBanModal([record], 'account'),
          },
          {
            key: 'status-cancelled',
            icon: <UserDeleteOutlined />,
            label: '设为已注销',
            disabled: record.status === 'cancelled',
            onClick: () => handleStatusChange(record, 'cancelled'),
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
                description={`确定要解除用户【${record.nickname}】的禁用状态吗？`}
                onConfirm={() => handleStatusChange(record, 'normal')}
                okText="解封"
                cancelText="取消"
              >
                <Button type="link" size="small" style={{ color: '#52c41a' }}>
                  解封
                </Button>
              </Popconfirm>
            ) : (
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleOpenBanModal([record], 'account')}
              >
                禁用
              </Button>
            )}
            <Dropdown menu={{ items: moreMenuItems }} trigger={['click']} placement="bottomRight">
              <Button type="text" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  const selectedUsers = userList.filter((item) => selectedRowKeys.includes(item.id));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 顶部指标统计大盘 (对接 GET /admin-api/user/statistics/summary) */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: 8,
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Statistic
              title="用户总数"
              value={summary.totalCount || total}
              valueStyle={{ color: '#1677ff', fontSize: 22, fontWeight: 600 }}
              prefix={<TeamOutlined style={{ color: '#1677ff' }} />}
              suffix={
                <Tag color="blue" style={{ fontSize: 11, marginLeft: 8 }}>
                  今日+{summary.todayNewCount || 0}
                </Tag>
              }
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: 8,
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Statistic
              title="正常活跃状态"
              value={summary.normalCount || total}
              valueStyle={{ color: '#52c41a', fontSize: 22, fontWeight: 600 }}
              prefix={<CheckCircleFilled style={{ color: '#52c41a' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: 8,
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Statistic
              title="违规禁用/封禁"
              value={summary.disabledCount || 0}
              valueStyle={{ color: '#ff4d4f', fontSize: 22, fontWeight: 600 }}
              prefix={<StopOutlined style={{ color: '#ff4d4f' }} />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card
            size="small"
            style={{
              borderRadius: 8,
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Statistic
              title="已注销档案"
              value={summary.cancelledCount || 0}
              valueStyle={{ color: '#8c8c8c', fontSize: 22, fontWeight: 600 }}
              prefix={<UserDeleteOutlined style={{ color: '#8c8c8c' }} />}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索与多维筛选卡片 (对齐 AdminUserPageReqVO) */}
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
            qualification: 'all',
            status: 'all',
            certified: 'all',
          }}
        >
          <Row gutter={[16, 12]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="展示号(UID)" name="userId" style={{ marginBottom: 0 }}>
                <Input placeholder="输入用户展示号 / UID" allowClear />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="联系手机号" name="phoneNumber" style={{ marginBottom: 0 }}>
                <Input
                  placeholder="输入联系手机号"
                  allowClear
                  prefix={<PhoneOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="用户昵称" name="nickname" style={{ marginBottom: 0 }}>
                <Input
                  placeholder="输入用户昵称"
                  allowClear
                  prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="账号状态" name="status" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部状态', value: 'all' },
                    { label: '🟢 正常 (1)', value: 1 },
                    { label: '🔴 禁用/封禁 (2)', value: 2 },
                    { label: '⚪ 已注销 (3)', value: 3 },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="认证类型" name="qualification" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部认证类型', value: 'all' },
                    { label: '🟢 个人认证 (1)', value: 1 },
                    { label: '🔵 企业认证 (2)', value: 2 },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="实名认证" name="certified" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部实名状态', value: 'all' },
                    { label: '🟢 已实名认证', value: true },
                    { label: '⚪ 未实名', value: false },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={16} md={12} lg={8}>
              <Form.Item label="注册时间范围" name="dateRange" style={{ marginBottom: 0 }}>
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['注册起始日期', '注册截止日期']}
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              sm={8}
              md={12}
              lg={4}
              style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end' }}
            >
              <Space size="middle" style={{ marginBottom: 0 }}>
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
                <Button
                  size="small"
                  danger
                  onClick={() => handleOpenBanModal(selectedUsers, 'account')}
                >
                  批量禁用
                </Button>
                <Button size="small" onClick={() => handleBatchStatus('normal')}>
                  批量恢复正常
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

            {ColumnSettingComponent}

            <Tooltip title="刷新列表">
              <Button icon={<ReloadOutlined />} onClick={() => fetchData(currentPage, pageSize)} />
            </Tooltip>
          </Space>
        }
      >
        <Table<UserItem>
          rowKey="id"
          columns={columns.filter((col) => !col.key || checkedKeys.includes(col.key as string))}
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

      {/* 用户基础档案与管理详情抽屉 (对接 GET /admin-api/user/users/get) */}
      <Drawer
        title="用户档案详情"
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
                <Button danger onClick={() => handleOpenBanModal([currentUser], 'account')}>
                  禁用账号
                </Button>
              )}
            </Space>
          )
        }
      >
        {currentUser && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <Avatar
                src={currentUser.avatarUrl || currentUser.avatar}
                size={72}
                icon={<UserOutlined />}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Title level={4} style={{ margin: 0 }}>
                    {currentUser.nickname}
                  </Title>
                  {renderQualificationTag(currentUser.qualification, currentUser.verifyStatus)}
                  {currentUser.certified && (
                    <Tag color="green" icon={<CheckCircleFilled />}>
                      已实名
                    </Tag>
                  )}
                </div>
                <div style={{ marginTop: 4 }}>
                  <Text type="secondary">展示号(UID): </Text>
                  <Text code copyable>
                    {currentUser.userId || currentUser.uid}
                  </Text>
                  {currentUser.initStatus === 0 && (
                    <Tag style={{ marginLeft: 8 }}>系统保底未初始化</Tag>
                  )}
                </div>
              </div>
            </div>

            {/* 违规处罚置顶预警横幅 */}
            {currentUser.status === 'banned' && (
              <Card
                size="small"
                style={{
                  background: token.colorFillAlter,
                  border: '1px solid #ff4d4f',
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Space>
                    <StopOutlined style={{ color: '#ff4d4f', fontSize: 20 }} />
                    <div>
                      <Text strong style={{ color: '#ff4d4f', fontSize: 14 }}>
                        当前账号已被平台禁用/封禁
                      </Text>
                      <div style={{ fontSize: 12, color: '#8c8c8c', marginTop: 2 }}>
                        <span>
                          处罚原因: {currentUser.banReason || '违反平台社区公约与安全规定'}
                        </span>
                        <span style={{ margin: '0 6px' }}>·</span>
                        <span>
                          封禁期限:{' '}
                          {currentUser.accountBanExpireTime === 'permanent'
                            ? '永久封禁'
                            : currentUser.accountBanExpireTime || '限制中'}{' '}
                          (
                          {formatBanRemainingTime(currentUser.accountBanExpireTime).text ||
                            '生效中'}
                          )
                        </span>
                      </div>
                    </div>
                  </Space>
                  <Button
                    size="small"
                    danger
                    onClick={() => handleOpenBanModal([currentUser], 'account')}
                  >
                    修改处置
                  </Button>
                </div>
              </Card>
            )}

            {/* 社交互动指标卡 */}
            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={8}>
                <Card
                  size="small"
                  variant="borderless"
                  style={{
                    background: token.colorFillAlter,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: 8,
                  }}
                >
                  <Statistic
                    title="粉丝总数"
                    value={currentUser.fanCount || 0}
                    valueStyle={{ color: '#1677ff', fontWeight: 600 }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  size="small"
                  variant="borderless"
                  style={{
                    background: token.colorFillAlter,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: 8,
                  }}
                >
                  <Statistic
                    title="关注总数"
                    value={currentUser.followCount || 0}
                    valueStyle={{ color: '#52c41a', fontWeight: 600 }}
                  />
                </Card>
              </Col>
              <Col span={8}>
                <Card
                  size="small"
                  variant="borderless"
                  style={{
                    background: token.colorFillAlter,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: 8,
                  }}
                >
                  <Statistic
                    title="好友总数"
                    value={currentUser.friendCount || 0}
                    valueStyle={{ color: '#fa8c16', fontWeight: 600 }}
                  />
                </Card>
              </Col>
            </Row>

            {/* 实名认证档案专区 */}
            <Divider style={{ margin: '16px 0' }} />
            <div style={{ marginBottom: 16 }}>
              <Space style={{ marginBottom: 8 }}>
                <IdcardOutlined style={{ color: '#1677ff' }} />
                <Text strong style={{ fontSize: 14 }}>
                  实名身份档案 (Personal Auth)
                </Text>
              </Space>

              {currentUser.personalAuths && currentUser.personalAuths.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {currentUser.personalAuths.map((auth, idx) => (
                    <Card
                      key={auth.idCard || idx}
                      size="small"
                      style={{ background: token.colorFillAlter, borderRadius: 6 }}
                    >
                      <Row gutter={16}>
                        <Col span={8}>
                          <Text type="secondary">真实姓名: </Text>
                          <Text strong>{auth.realName}</Text>
                        </Col>
                        <Col span={8}>
                          <Text type="secondary">身份证号: </Text>
                          <Text code>{auth.idCard}</Text>
                        </Col>
                        <Col span={8}>
                          <Text type="secondary">认证时间: </Text>
                          <Text>{auth.authTime}</Text>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card size="small" style={{ background: token.colorFillAlter, borderRadius: 6 }}>
                  <Text type="secondary">
                    {currentUser.certified ? '已通过实名校验' : '暂无实名认证记录'}
                  </Text>
                </Card>
              )}
            </div>

            <Divider style={{ margin: '16px 0' }} />

            <Descriptions title="基本资料" column={2} bordered size="small">
              <Descriptions.Item label="展示号(UID)">
                <Text code copyable>
                  {currentUser.userId || currentUser.uid}
                </Text>
              </Descriptions.Item>
              <Descriptions.Item label="账号状态">
                {renderAccountStatus(currentUser)}
              </Descriptions.Item>
              <Descriptions.Item label="认证类型">
                {renderQualificationTag(currentUser.qualification, currentUser.verifyStatus)}
              </Descriptions.Item>
              <Descriptions.Item label="实名认证">
                {currentUser.certified ? (
                  <Tag color="green">已实名</Tag>
                ) : (
                  <Tag color="default">未实名</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                <Space size={6}>
                  <Text
                    code
                    copyable={
                      currentUser.phoneNumber || currentUser.phone
                        ? { text: currentUser.phoneNumber || currentUser.phone || '' }
                        : false
                    }
                  >
                    {formatMaskedPhone(
                      currentUser.phoneNumber || currentUser.phone,
                      isPhoneRevealed,
                    )}
                  </Text>
                  {(currentUser.phoneNumber || currentUser.phone) && (
                    <Tooltip title={isPhoneRevealed ? '隐藏真实手机号' : '查看完整手机号'}>
                      <Button
                        type="text"
                        size="small"
                        icon={isPhoneRevealed ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                        onClick={() => setIsPhoneRevealed((prev) => !prev)}
                        style={{ color: '#1677ff', padding: '0 4px' }}
                      />
                    </Tooltip>
                  )}
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="初始化状态">
                {currentUser.initStatus === 1 ? (
                  <Tag color="blue">已初始化</Tag>
                ) : (
                  <Tag color="default">系统保底</Tag>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="注册时间" span={2}>
                {formatDateTime(currentUser.createTime || currentUser.registerTime)}
              </Descriptions.Item>
            </Descriptions>
          </div>
        )}
      </Drawer>

      {/* 违规处罚惩戒弹窗 */}
      <UserBanModal
        open={banModalVisible}
        users={banTargetUsers}
        defaultPunishType={banDefaultPunishType}
        onCancel={() => setBanModalVisible(false)}
        onOk={handleConfirmBan}
      />
    </div>
  );
};

export default UsersPage;

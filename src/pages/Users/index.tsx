import {
  BarChartOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  DownloadOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  ManOutlined,
  MoreOutlined,
  ReloadOutlined,
  SafetyCertificateFilled,
  SearchOutlined,
  StarFilled,
  StopOutlined,
  UnlockOutlined,
  UserDeleteOutlined,
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
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  batchUpdateUserStatus,
  executeUserBan,
  getAllFilteredUsers,
  getUserList,
  updateUserStatus,
} from '@/api/user';
import type { ActiveStatus, UserItem, UserQueryParams, UserStatus, VerifyStatus } from '@/types';
import { exportToCsv } from '@/utils/export';
import { formatBanRemainingTime } from '@/utils/time';
import { type BanPunishType, UserBanModal } from './components/UserBanModal';
import { UserPersonaDrawer } from './components/UserPersonaDrawer';

const { Text } = Typography;
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

  // 基础档案详情抽屉状态
  const [drawerVisible, setDrawerVisible] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(null);
  const [isPhoneRevealed, setIsPhoneRevealed] = useState<boolean>(false);

  // 大数据 AI 用户画像抽屉状态
  const [personaDrawerVisible, setPersonaDrawerVisible] = useState<boolean>(false);
  const [personaUser, setPersonaUser] = useState<UserItem | null>(null);

  // 封禁处置弹窗状态
  const [banModalVisible, setBanModalVisible] = useState<boolean>(false);
  const [banTargetUsers, setBanTargetUsers] = useState<UserItem[]>([]);
  const [banDefaultPunishType, setBanDefaultPunishType] = useState<BanPunishType>('account');

  // 手机号脱敏工具函数
  const formatMaskedPhone = (phone?: string, isRevealed = false) => {
    if (!phone) return '未绑定';
    if (isRevealed) return phone;
    return phone
      .replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
      .replace(/^(\d{3,4}-)\d{4}(\d{4})$/, '$1****$2');
  };

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
          activeStatus: formValues.activeStatus,
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

  // 防抖自动检索定时器引用
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 清理防抖定时器
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 表单字段变动即刻触发查询（输入框 300ms 防抖，下拉框/日期立即触发）
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

  // 手动点击搜索
  const handleSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    fetchData(1, pageSize);
  };

  // 重置搜索
  const handleReset = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    form.resetFields();
    fetchData(1, pageSize);
  };

  // 打开封禁处置弹窗
  const handleOpenBanModal = (users: UserItem[], defaultType: BanPunishType = 'account') => {
    if (!users.length) return;
    setBanTargetUsers(users);
    setBanDefaultPunishType(defaultType);
    setBanModalVisible(true);
  };

  // 确认执行封禁处置
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
      await executeUserBan({
        userIds,
        ...values,
      });
      const typeDesc =
        values.punishType === 'account'
          ? '账号全量封禁'
          : values.punishType === 'comment'
            ? '评论禁言'
            : '作品禁发';
      message.success(`已成功对 ${banTargetUsers.length} 名用户执行【${typeDesc}】`);
      setBanModalVisible(false);
      if (currentUser && userIds.includes(currentUser.id)) {
        setDrawerVisible(false);
      }
      setSelectedRowKeys([]);
      fetchData(currentPage, pageSize);
    } catch (err: any) {
      message.error(err.message || '封禁处置执行失败');
    }
  };

  // 状态变更操作 (解封/恢复正常/申请注销)
  const handleStatusChange = async (record: UserItem, nextStatus: UserStatus) => {
    try {
      await updateUserStatus(record.id, nextStatus);
      const statusMap: Record<UserStatus, string> = {
        normal: '正常',
        banned: '已封禁',
        muted: '已禁言',
        cancelling: '注销中',
        cancelled: '已注销',
      };
      message.success(`用户【${record.nickname}】状态已更新为：${statusMap[nextStatus]}`);
      if (currentUser?.id === record.id) {
        setCurrentUser({ ...currentUser, status: nextStatus });
      }
      fetchData(currentPage, pageSize);
    } catch (err: any) {
      message.error(err.message || '更新状态失败');
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
                cancelling: '注销中',
                cancelled: '已注销',
              };
              return map[r.status] || '未知';
            },
          },
          { title: '评论数', key: 'commentCount' },
          {
            title: '评论权限',
            key: 'commentStatus',
            render: (r) =>
              r.commentStatus === 'allowed'
                ? '正常互动'
                : `已禁言(${formatBanRemainingTime(r.commentBanExpireTime).text || '限制中'})`,
          },
          { title: '作品数', key: 'postCount' },
          {
            title: '发帖权限',
            key: 'postStatus',
            render: (r) =>
              r.postStatus === 'forbidden'
                ? `已禁发(${formatBanRemainingTime(r.postBanExpireTime).text || '限制中'})`
                : '正常发布',
          },
          { title: '获赞总数', key: 'likeCount' },
          { title: '粉丝数', key: 'followerCount' },
          {
            title: '在线状态',
            key: 'activeStatus',
            render: (r) =>
              r.activeStatus === 'online'
                ? '当前在线'
                : r.activeStatus === 'recent'
                  ? '最近在线'
                  : '长期离线',
          },
          { title: '参与活动总数', key: 'activityCount' },
          {
            title: '线上活动场次',
            key: 'onlineActivityCount',
            render: (r) => r.onlineActivityCount ?? Math.max(0, r.activityCount - 2),
          },
          {
            title: '线下活动场次',
            key: 'offlineActivityCount',
            render: (r) => r.offlineActivityCount ?? Math.min(r.activityCount, 2),
          },
          { title: '最后活跃时间', key: 'lastActiveTime' },
          { title: '注册时间', key: 'registerTime' },
          { title: '联系电话', key: 'phone', render: (r) => formatMaskedPhone(r.phone, false) },
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
      case 'cancelling':
        return <Badge status="warning" text={<Text style={{ color: '#d46b08' }}>注销中</Text>} />;
      case 'cancelled':
        return <Badge status="default" text={<Text type="secondary">已注销</Text>} />;
      default:
        return <Badge status="default" text="未知" />;
    }
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
      title: '在线状态',
      dataIndex: 'activeStatus',
      key: 'activeStatus',
      width: 130,
      render: (activeStatus: ActiveStatus, record) => {
        let badge = <Badge status="default" text={<Text type="secondary">长期离线</Text>} />;
        if (activeStatus === 'online') {
          badge = (
            <Badge
              status="success"
              text={
                <Text type="success" strong>
                  当前在线
                </Text>
              }
            />
          );
        } else if (activeStatus === 'recent') {
          badge = (
            <Badge status="processing" text={<Text style={{ color: '#1677ff' }}>最近在线</Text>} />
          );
        }
        return (
          <div>
            <div>{badge}</div>
            <Text type="secondary" style={{ fontSize: 11 }}>
              {record.lastActiveTime.slice(5, 16)}
            </Text>
          </div>
        );
      },
    },
    {
      title: '评论',
      dataIndex: 'commentCount',
      key: 'comment',
      width: 155,
      sorter: (a, b) => a.commentCount - b.commentCount,
      render: (count: number, record) => {
        const banInfo = formatBanRemainingTime(record.commentBanExpireTime);
        return (
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
                <Tooltip title={banInfo.fullDesc}>
                  <Space size={2} style={{ cursor: 'help' }}>
                    <Tag color="error" style={{ fontSize: 11, padding: '0 4px', margin: 0 }}>
                      已禁言
                    </Tag>
                    {banInfo.text && (
                      <Text type="danger" style={{ fontSize: 11 }}>
                        ({banInfo.text})
                      </Text>
                    )}
                  </Space>
                </Tooltip>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: '发帖',
      dataIndex: 'postCount',
      key: 'post',
      width: 155,
      sorter: (a, b) => a.postCount - b.postCount,
      render: (count: number, record) => {
        const banInfo = formatBanRemainingTime(record.postBanExpireTime);
        return (
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
            <div>
              {record.postStatus === 'forbidden' ? (
                <Tooltip title={banInfo.fullDesc}>
                  <Space size={2} style={{ cursor: 'help' }}>
                    <Tag color="error" style={{ fontSize: 11, padding: '0 4px', margin: 0 }}>
                      已禁发
                    </Tag>
                    {banInfo.text && (
                      <Text type="danger" style={{ fontSize: 11 }}>
                        ({banInfo.text})
                      </Text>
                    )}
                  </Space>
                </Tooltip>
              ) : (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  获赞 {(record.likeCount / 10000).toFixed(1)}w
                </Text>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: '活动参与',
      dataIndex: 'activityCount',
      key: 'activity',
      width: 170,
      sorter: (a, b) => a.activityCount - b.activityCount,
      render: (count: number, record) => {
        const onlineCount = record.onlineActivityCount ?? Math.max(0, count - 2);
        const offlineCount = record.offlineActivityCount ?? Math.min(count, 2);
        return (
          <div>
            <div style={{ marginBottom: 4 }}>
              <Text strong style={{ fontSize: 13 }}>
                {count}
              </Text>
              <Text type="secondary" style={{ fontSize: 12 }}>
                {' '}
                场活动
              </Text>
            </div>
            <Space size={4} wrap>
              <Tag color="cyan" style={{ fontSize: 11, padding: '0 4px', margin: 0 }}>
                线上: {onlineCount}
              </Tag>
              <Tag color="geekblue" style={{ fontSize: 11, padding: '0 4px', margin: 0 }}>
                线下: {offlineCount}
              </Tag>
            </Space>
          </div>
        );
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
            key: 'persona',
            icon: <BarChartOutlined style={{ color: '#1677ff' }} />,
            label: '查看用户画像',
            onClick: () => {
              setPersonaUser(record);
              setPersonaDrawerVisible(true);
            },
          },
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
            key: 'status-muted',
            icon: <StopOutlined />,
            label: '禁言用户',
            disabled: record.status === 'muted',
            onClick: () => handleOpenBanModal([record], 'comment'),
          },
          {
            key: 'status-cancelling',
            icon: <UserDeleteOutlined />,
            label: '申请注销',
            disabled: record.status === 'cancelling' || record.status === 'cancelled',
            onClick: () => handleStatusChange(record, 'cancelling'),
          },
          {
            key: 'status-banned',
            icon: <LockOutlined />,
            label: '封禁账号',
            danger: true,
            disabled: record.status === 'banned',
            onClick: () => handleOpenBanModal([record], 'account'),
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
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleOpenBanModal([record], 'account')}
              >
                封禁
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
            verifyStatus: 'all',
            status: 'all',
            activeStatus: 'all',
          }}
        >
          <Row gutter={[16, 12]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="用户搜索" name="keyword" style={{ marginBottom: 0 }}>
                <Input
                  placeholder="搜索昵称 / @用户名 / UID"
                  allowClear
                  prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="认证状态" name="verifyStatus" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部认证状态', value: 'all' },
                    { label: '⏳ 认证审核中', value: 'pending' },
                    { label: '⚪ 未认证', value: 'unverified' },
                    { label: '🟢 个人实名认证', value: 'personal' },
                    { label: '🔵 企业认证(蓝V)', value: 'enterprise' },
                    { label: '🟡 达人认证(黄V)', value: 'creator' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="账号状态" name="status" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部账号状态', value: 'all' },
                    { label: '🟢 正常状态', value: 'normal' },
                    { label: '🔴 已封禁', value: 'banned' },
                    { label: '🟠 已禁言', value: 'muted' },
                    { label: '⏳ 注销冷静期中', value: 'cancelling' },
                    { label: '⚪ 已注销', value: 'cancelled' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="在线活跃状态" name="activeStatus" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部活跃状态', value: 'all' },
                    { label: '🟢 当前在线', value: 'online' },
                    { label: '🔵 最近在线', value: 'recent' },
                    { label: '⚪ 长期离线', value: 'offline' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={16} md={14} lg={12}>
              <Form.Item label="用户注册时间范围" name="dateRange" style={{ marginBottom: 0 }}>
                <RangePicker
                  style={{ width: '100%' }}
                  placeholder={['注册起始日期', '注册截止日期']}
                />
              </Form.Item>
            </Col>

            <Col
              xs={24}
              sm={8}
              md={10}
              lg={12}
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
                  批量封禁
                </Button>
                <Button size="small" onClick={() => handleOpenBanModal(selectedUsers, 'comment')}>
                  批量禁言
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

      {/* 用户基础档案与管理详情抽屉 */}
      <Drawer
        title="用户档案与账号管理详情"
        placement="right"
        size="large"
        open={drawerVisible}
        onClose={() => setDrawerVisible(false)}
        extra={
          currentUser && (
            <Space>
              <Button
                icon={<BarChartOutlined style={{ color: '#1677ff' }} />}
                onClick={() => {
                  setPersonaUser(currentUser);
                  setPersonaDrawerVisible(true);
                }}
              >
                查看 AI 用户画像
              </Button>
              {currentUser.status === 'banned' ? (
                <Button type="primary" onClick={() => handleStatusChange(currentUser, 'normal')}>
                  解封账号
                </Button>
              ) : currentUser.status === 'cancelling' ? (
                <Button type="primary" onClick={() => handleStatusChange(currentUser, 'normal')}>
                  撤销注销申请（恢复正常）
                </Button>
              ) : (
                <Button danger onClick={() => handleOpenBanModal([currentUser], 'account')}>
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
              <Descriptions.Item label="活动参与情况">
                <Space size={4}>
                  <Tag color="purple">共 {currentUser.activityCount} 场</Tag>
                  <Tag color="cyan">
                    线上:{' '}
                    {currentUser.onlineActivityCount ?? Math.max(0, currentUser.activityCount - 2)}
                  </Tag>
                  <Tag color="geekblue">
                    线下:{' '}
                    {currentUser.offlineActivityCount ?? Math.min(currentUser.activityCount, 2)}
                  </Tag>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="联系电话">
                <Space size={6}>
                  <Text code copyable={currentUser.phone ? { text: currentUser.phone } : false}>
                    {formatMaskedPhone(currentUser.phone, isPhoneRevealed)}
                  </Text>
                  {currentUser.phone && (
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
              <Descriptions.Item label="电子邮箱">
                {currentUser.email || '未绑定'}
              </Descriptions.Item>
              <Descriptions.Item label="评论互动权限">
                {currentUser.commentStatus === 'allowed' ? (
                  <Tag color="green">正常发言</Tag>
                ) : (
                  <Space size={4}>
                    <Tag color="error">已禁言</Tag>
                    <Text type="danger" style={{ fontSize: 12 }}>
                      {formatBanRemainingTime(currentUser.commentBanExpireTime).fullDesc}
                    </Text>
                  </Space>
                )}
              </Descriptions.Item>
              <Descriptions.Item label="作品发布权限">
                {currentUser.postStatus === 'forbidden' ? (
                  <Space size={4}>
                    <Tag color="error">已禁发作品</Tag>
                    <Text type="danger" style={{ fontSize: 12 }}>
                      {formatBanRemainingTime(currentUser.postBanExpireTime).fullDesc}
                    </Text>
                  </Space>
                ) : (
                  <Tag color="green">正常发布</Tag>
                )}
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

      {/* 大数据 AI 用户画像抽屉 */}
      <UserPersonaDrawer
        open={personaDrawerVisible}
        user={personaUser}
        onClose={() => setPersonaDrawerVisible(false)}
      />

      {/* 违规封禁与期限处置弹窗 */}
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

const { Title } = Typography;

export default UsersPage;

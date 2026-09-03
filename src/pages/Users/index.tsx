import {
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CommentOutlined,
  DownloadOutlined,
  ExclamationCircleOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FileTextOutlined,
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
  getUserContentRestrictions,
  getUserList,
  getUserStatisticsSummary,
  revokeUserContentRestriction,
  updateUserStatus,
} from '@/api/user';
import { type ColumnOptionItem, useColumnSettings } from '@/components/ColumnSetting';
import type {
  AdminUserPageReqVO,
  ContentRestrictionItem,
  UserItem,
  UserQueryParams,
  UserStatisticsRespVO,
  UserStatus,
} from '@/types';
import { exportToCsv } from '@/utils/export';
import { formatDateTime } from '@/utils/time';
import { type BanPunishType, UserBanModal } from './components/UserBanModal';

const { Text, Title } = Typography;
const { RangePicker } = DatePicker;

// 内容治理限制类型 UI 呈现元信息
const RESTRICTION_TYPE_META: Record<
  string,
  { label: string; color: string; icon: React.ReactNode; badgeText: string }
> = {
  account: {
    label: '全量封号',
    color: '#ff4d4f',
    icon: <StopOutlined />,
    badgeText: '封号中',
  },
  post: {
    label: '禁发动态',
    color: '#eb2f96',
    icon: <FileTextOutlined />,
    badgeText: '禁发帖',
  },
  comment: {
    label: '禁止评论',
    color: '#fa8c16',
    icon: <CommentOutlined />,
    badgeText: '禁评',
  },
  activity_publish: {
    label: '禁发活动',
    color: '#722ed1',
    icon: <CalendarOutlined />,
    badgeText: '禁发活动',
  },
};

// 静态时间差换算纯函数（无定时器 setInterval 性能开销，专为千行长列表优化）
const formatRemainingDuration = (
  endAt?: string | null,
): { text: string; isPermanent: boolean; isExpired: boolean } => {
  if (!endAt || endAt === 'permanent') {
    return { text: '永久管控', isPermanent: true, isExpired: false };
  }
  const end = new Date(endAt).getTime();
  const now = Date.now();
  const diffMs = end - now;

  if (Number.isNaN(end) || diffMs <= 0) {
    return { text: '已到期', isPermanent: false, isExpired: true };
  }

  const hours = Math.floor(diffMs / (1000 * 60 * 60));
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) {
    return {
      text: `剩余 ${days}天${remainingHours > 0 ? ` ${remainingHours}小时` : ''}`,
      isPermanent: false,
      isExpired: false,
    };
  }
  const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
  return {
    text: `剩余 ${hours}小时${minutes}分`,
    isPermanent: false,
    isExpired: false,
  };
};

// 可选列配置清单（对齐后端 AdminUserRespVO 字段，核心关键列锁定）
const userColumnOptions: ColumnOptionItem[] = [
  { key: 'user', title: '用户信息 (头像/昵称/展示号)', required: true },
  { key: 'phoneNumber', title: '联系手机号' },
  { key: 'certification', title: '用户认证状态' },
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

  // 子表格展开行与按需缓存状态 (Dual-Mode 策略：优先复用聚合，缺失则懒加载)
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [restrictionsMap, setRestrictionsMap] = useState<Record<string, ContentRestrictionItem[]>>(
    {},
  );
  const [restrictionLoadingMap, setRestrictionLoadingMap] = useState<Record<string, boolean>>({});

  // 展开行按需拉取或复用缓存
  const handleExpand = async (expanded: boolean, record: UserItem) => {
    if (expanded) {
      setExpandedRowKeys((prev) => [...prev, record.id]);
      const restrictions = record.restrictions;
      if (restrictions && restrictions.length > 0) {
        setRestrictionsMap((prev) => ({ ...prev, [record.id]: restrictions }));
        return;
      }
      if (!restrictionsMap[record.id]) {
        setRestrictionLoadingMap((prev) => ({ ...prev, [record.id]: true }));
        try {
          const res = await getUserContentRestrictions({ userId: record.id, status: 'active' });
          if (res.data?.list) {
            setRestrictionsMap((prev) => ({ ...prev, [record.id]: res.data.list }));
          }
        } finally {
          setRestrictionLoadingMap((prev) => ({ ...prev, [record.id]: false }));
        }
      }
    } else {
      setExpandedRowKeys((prev) => prev.filter((k) => k !== record.id));
    }
  };

  // 快捷解除限制 (带局部乐观更新，避免整页刷新白屏闪烁)
  const handleRevokeRestriction = async (userId: string, restrictionId: number | string) => {
    try {
      const res = await revokeUserContentRestriction({
        restrictionId,
        reason: '管理员在控制台子表快捷解封',
      });
      if (res.code === 200 || res.code === 0) {
        message.success('已解除该项内容治理限制');

        // 局部乐观更新 restrictionsMap
        setRestrictionsMap((prev) => {
          const currentList = prev[userId] || [];
          const nextList = currentList.filter((r) => String(r.id) !== String(restrictionId));
          return { ...prev, [userId]: nextList };
        });

        // 局部更新主表 userList
        setUserList((prev) =>
          prev.map((u) => {
            if (u.id === userId) {
              const nextRestrictions = (u.restrictions || []).filter(
                (r) => String(r.id) !== String(restrictionId),
              );
              const stillHasActive = nextRestrictions.some((r) => r.status === 'active');
              return {
                ...u,
                restrictions: nextRestrictions,
                status: stillHasActive ? u.status : ('normal' as UserStatus),
                rawStatus: stillHasActive ? u.rawStatus : 1,
                accountBanExpireTime: stillHasActive ? u.accountBanExpireTime : undefined,
                banReason: stillHasActive ? u.banReason : undefined,
              };
            }
            return u;
          }),
        );

        // 同步更新抽屉中的 currentUser
        setCurrentUser((prev) => {
          if (prev && prev.id === userId) {
            const nextRestrictions = (prev.restrictions || []).filter(
              (r) => String(r.id) !== String(restrictionId),
            );
            const stillHasActive = nextRestrictions.some((r) => r.status === 'active');
            return {
              ...prev,
              restrictions: nextRestrictions,
              status: stillHasActive ? prev.status : ('normal' as UserStatus),
              rawStatus: stillHasActive ? prev.rawStatus : 1,
              accountBanExpireTime: stillHasActive ? prev.accountBanExpireTime : undefined,
              banReason: stillHasActive ? prev.banReason : undefined,
            };
          }
          return prev;
        });
      }
    } catch (err: any) {
      message.error(err?.message || '解除限制失败');
    }
  };

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
      if ((res.code === 200 || res.code === 0) && res.data) {
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
        if ((res.code === 200 || res.code === 0) && res.data) {
          setUserList(res.data.list);
          setTotal(res.data.total);
          setCurrentPage(res.data.page || page);
          setPageSize(res.data.pageSize || size);
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
      if (res.code === 200 || res.code === 0) {
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
      if (res.code === 200 || res.code === 0) {
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
      if (res.code === 200 || res.code === 0) {
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
            title: '认证状态',
            key: 'certificationLabel',
            render: (r) => r.certificationLabel || '未实名',
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

  // 认证状态单字段渲染 (依据后端统一输出的 certificationLabel: 企业认证 | 个人认证 | 审核中 | 未实名)
  const renderCertificationTag = (label?: string) => {
    const text = label || '未实名';
    switch (text) {
      case '企业认证':
        return (
          <Tag color="blue" icon={<SafetyCertificateFilled />} style={{ borderRadius: 10 }}>
            企业认证
          </Tag>
        );
      case '个人认证':
        return (
          <Tag color="cyan" icon={<CheckCircleFilled />} style={{ borderRadius: 10 }}>
            个人认证
          </Tag>
        );
      case '审核中':
        return (
          <Tag color="orange" icon={<ClockCircleOutlined />} style={{ borderRadius: 10 }}>
            审核中
          </Tag>
        );
      case '未实名':
        return (
          <Tag color="default" style={{ borderRadius: 10 }}>
            未实名
          </Tag>
        );
      default:
        return (
          <Tag color="default" style={{ borderRadius: 10 }}>
            {text}
          </Tag>
        );
    }
  };

  // 账号状态渲染：正常用户简洁展示，违规/处罚用户展示内嵌微型子表（每一行展示处罚项与剩余时效格式）
  const renderAccountStatus = (record: UserItem) => {
    const status = record.status;
    const userRestrictions = (restrictionsMap[record.id] || record.restrictions || []).filter(
      (r) => r.status === 'active',
    );

    // 1. 若无任何处罚且状态为正常
    if (status === 'normal' && userRestrictions.length === 0) {
      return <Badge status="success" text={<Text type="success">正常</Text>} />;
    }

    if (status === 'cancelled') {
      return <Badge status="default" text={<Text type="secondary">已注销</Text>} />;
    }

    // 2. 处于处罚/管控中：组装所有生效惩罚列表
    const allItems: Array<{
      id: string | number;
      type: string;
      label: string;
      color: string;
      icon: React.ReactNode;
      badgeText: string;
      reason: string;
      endAt?: string | null;
    }> = [];

    // 若有 restrictions，以 restrictions 为准
    if (userRestrictions.length > 0) {
      for (const r of userRestrictions) {
        const meta = RESTRICTION_TYPE_META[r.restrictionType] || {
          label: r.restrictionType,
          color: 'volcano',
          icon: <ExclamationCircleOutlined />,
          badgeText: r.restrictionType,
        };
        allItems.push({
          id: r.id,
          type: r.restrictionType,
          label: meta.label,
          color: meta.color,
          icon: meta.icon,
          badgeText: meta.badgeText,
          reason: r.reason,
          endAt: r.endAt,
        });
      }
    } else if (status === 'banned') {
      allItems.push({
        id: 'mock-account',
        type: 'account',
        label: '全量封号',
        color: '#ff4d4f',
        icon: <StopOutlined />,
        badgeText: '封号中',
        reason: record.banReason || '违反平台社区公约与治理规定',
        endAt: record.accountBanExpireTime,
      });
    } else if (status === 'muted') {
      allItems.push({
        id: 'mock-comment',
        type: 'comment',
        label: '违规禁评',
        color: '#fa8c16',
        icon: <CommentOutlined />,
        badgeText: '禁评',
        reason: record.banReason || '评论区违规发言',
        endAt: record.accountBanExpireTime,
      });
    }

    // 3. 渲染为内嵌微型子表结构：每一行独立展现处罚项目与剩余时间格式
    return (
      <div
        style={{
          border: '1px solid #ffccc7',
          borderRadius: 6,
          background: '#fffaf9',
          overflow: 'hidden',
          boxShadow: '0 1px 2px rgba(255, 77, 79, 0.05)',
          maxWidth: 240,
        }}
      >
        {/* 微型子表表头 */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '2px 8px',
            background: '#fff1f0',
            borderBottom: '1px solid #ffccc7',
            color: '#cf1322',
            fontWeight: 600,
            fontSize: 11,
          }}
        >
          <span>违规处罚项</span>
          <span>剩余时间</span>
        </div>

        {/* 每一行处罚与剩余时间 */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {allItems.map((item, idx) => {
            const duration = formatRemainingDuration(item.endAt);
            const isLast = idx === allItems.length - 1;
            const tooltipTitle = (
              <div style={{ fontSize: 12 }}>
                <div style={{ fontWeight: 600, color: item.color }}>{item.label}</div>
                <div>原因: {item.reason}</div>
                <div>时效: {item.endAt ? `${item.endAt} (${duration.text})` : '永久管控'}</div>
              </div>
            );

            return (
              <Tooltip key={item.id} title={tooltipTitle} placement="top">
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '3px 8px',
                    borderBottom: isLast ? 'none' : '1px solid #f0f0f0',
                    backgroundColor: idx % 2 === 0 ? '#ffffff' : '#fafafa',
                    transition: 'background 0.2s',
                  }}
                >
                  <Tag
                    color={item.color}
                    icon={item.icon}
                    style={{
                      margin: 0,
                      fontSize: 10,
                      lineHeight: '18px',
                      padding: '0 4px',
                      borderRadius: 4,
                    }}
                  >
                    {item.badgeText}
                  </Tag>

                  <span
                    style={{
                      fontSize: 11,
                      fontWeight: 600,
                      color: duration.isPermanent ? '#cf1322' : '#d46b08',
                    }}
                  >
                    {duration.text}
                  </span>
                </div>
              </Tooltip>
            );
          })}
        </div>
      </div>
    );
  };

  // 嵌套展开子表格渲染 (当前生效中的内容治理与功能处罚清单)
  const expandedRowRender = (record: UserItem) => {
    const list = (restrictionsMap[record.id] || record.restrictions || []).filter(
      (r) => r.status === 'active',
    );
    const isLoading = restrictionLoadingMap[record.id] || false;

    return (
      <Card
        size="small"
        title={
          <Space size={8}>
            <span style={{ fontSize: 13, fontWeight: 600, color: '#262626' }}>
              🛡️ 生效中的内容治理与功能处罚清单
            </span>
            <Tag color="processing" style={{ borderRadius: 10, fontSize: 11 }}>
              UID: {record.userId || record.id}
            </Tag>
            <Tag color="purple" style={{ borderRadius: 10, fontSize: 11 }}>
              {record.nickname}
            </Tag>
          </Space>
        }
        variant="borderless"
        style={{
          margin: '4px 0 8px 38px',
          backgroundColor: '#fafcff',
          border: '1px solid #e6f4ff',
          borderRadius: 8,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        }}
      >
        <Table<ContentRestrictionItem>
          size="small"
          rowKey="id"
          loading={isLoading}
          dataSource={list}
          pagination={false}
          columns={[
            {
              title: '受限功能/处罚类型',
              dataIndex: 'restrictionType',
              key: 'restrictionType',
              width: 150,
              render: (type: string) => {
                const meta = RESTRICTION_TYPE_META[type] || {
                  label: type,
                  color: 'default',
                  icon: <ExclamationCircleOutlined />,
                };
                return (
                  <Tag color={meta.color} icon={meta.icon} style={{ borderRadius: 10 }}>
                    {meta.label}
                  </Tag>
                );
              },
            },
            {
              title: '状态',
              dataIndex: 'status',
              key: 'status',
              width: 90,
              render: () => <Badge status="error" text="生效中" />,
            },
            {
              title: '时效期限 / 倒计时',
              dataIndex: 'endAt',
              key: 'endAt',
              width: 200,
              render: (endAt: string | null) => {
                const duration = formatRemainingDuration(endAt);
                return (
                  <Space orientation="vertical" size={2}>
                    <span style={{ fontSize: 12 }}>{endAt || '永久管控'}</span>
                    <Tag
                      color={duration.isPermanent ? 'error' : 'warning'}
                      style={{ fontSize: 10, padding: '0 4px', margin: 0, borderRadius: 8 }}
                    >
                      {duration.text}
                    </Tag>
                  </Space>
                );
              },
            },
            {
              title: '违规处罚原因',
              dataIndex: 'reason',
              key: 'reason',
              ellipsis: true,
              render: (reason: string) => (
                <Tooltip title={reason}>
                  <span style={{ fontSize: 12, color: '#595959' }}>
                    {reason || '违反平台社区公约与治理规则'}
                  </span>
                </Tooltip>
              ),
            },
            {
              title: '处置来源',
              dataIndex: 'sourceType',
              key: 'sourceType',
              width: 100,
              render: (src: string) => {
                if (src === 'manual') return <Tag color="blue">人工处置</Tag>;
                if (src === 'report') return <Tag color="volcano">举报受理</Tag>;
                if (src === 'rule') return <Tag color="cyan">规则风控</Tag>;
                return <Tag color="default">{src || '系统'}</Tag>;
              },
            },
            {
              title: '生效时间',
              dataIndex: 'startAt',
              key: 'startAt',
              width: 160,
              render: (time: string) => (
                <span style={{ fontSize: 12, color: '#8c8c8c' }}>{time || '-'}</span>
              ),
            },
            {
              title: '操作',
              key: 'action',
              width: 100,
              render: (_, item: ContentRestrictionItem) => (
                <Popconfirm
                  title="解除处罚确认"
                  description={`确定要立即解除该用户的【${
                    RESTRICTION_TYPE_META[item.restrictionType]?.label || item.restrictionType
                  }】限制吗？`}
                  onConfirm={() => handleRevokeRestriction(record.id, item.id)}
                  okText="确认解除"
                  cancelText="取消"
                >
                  <Button type="link" size="small" danger style={{ padding: 0 }}>
                    解除限制
                  </Button>
                </Popconfirm>
              ),
            },
          ]}
          locale={{
            emptyText: (
              <div style={{ padding: '12px 0', color: '#8c8c8c' }}>
                该用户当前无生效中的内容治理限制
              </div>
            ),
          }}
        />
      </Card>
    );
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
      title: '用户认证',
      dataIndex: 'certificationLabel',
      key: 'certification',
      width: 120,
      render: (_: any, record) => renderCertificationTag(record.certificationLabel),
    },
    {
      title: '账号状态',
      dataIndex: 'status',
      key: 'status',
      width: 250,
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
          columns={columns.filter((col) => {
            if (!col.key) return true;
            const k = col.key as string;
            if (k === 'certification') {
              return (
                checkedKeys.includes('certification') ||
                checkedKeys.includes('qualification') ||
                checkedKeys.includes('certified')
              );
            }
            return checkedKeys.includes(k);
          })}
          dataSource={userList}
          loading={loading}
          scroll={{ x: 1200 }}
          expandable={{
            expandedRowRender,
            rowExpandable: (record) => {
              const activeRestrictions = (
                restrictionsMap[record.id] ||
                record.restrictions ||
                []
              ).filter((r) => r.status === 'active');
              return record.status !== 'normal' || activeRestrictions.length > 0;
            },
            expandedRowKeys,
            onExpand: handleExpand,
          }}
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
                  {renderCertificationTag(
                    currentUser.certificationLabel ||
                      currentUser.certificationSummary?.certificationLabel,
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

            {/* 违规处罚与内容安全治理专栏 */}
            {(currentUser.status !== 'normal' ||
              (currentUser.restrictions && currentUser.restrictions.length > 0)) && (
              <Card
                size="small"
                title={
                  <Space>
                    <StopOutlined style={{ color: '#ff4d4f' }} />
                    <span style={{ fontWeight: 600, color: '#ff4d4f' }}>
                      内容治理管控与违规限制清单
                    </span>
                  </Space>
                }
                style={{
                  background: '#fff2f0',
                  border: '1px solid #ffccc7',
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <Table<ContentRestrictionItem>
                  size="small"
                  rowKey="id"
                  pagination={false}
                  dataSource={(
                    restrictionsMap[currentUser.id] ||
                    currentUser.restrictions ||
                    []
                  ).filter((r) => r.status === 'active')}
                  columns={[
                    {
                      title: '受限功能',
                      dataIndex: 'restrictionType',
                      key: 'restrictionType',
                      width: 120,
                      render: (type: string) => {
                        const meta = RESTRICTION_TYPE_META[type] || {
                          label: type,
                          color: 'default',
                          icon: <ExclamationCircleOutlined />,
                        };
                        return (
                          <Tag color={meta.color} icon={meta.icon} style={{ borderRadius: 10 }}>
                            {meta.label}
                          </Tag>
                        );
                      },
                    },
                    {
                      title: '时效期限',
                      dataIndex: 'endAt',
                      key: 'endAt',
                      width: 160,
                      render: (endAt: string | null) => {
                        const dur = formatRemainingDuration(endAt);
                        return (
                          <Space orientation="vertical" size={1}>
                            <span style={{ fontSize: 11 }}>{endAt || '永久'}</span>
                            <Tag
                              color={dur.isPermanent ? 'error' : 'warning'}
                              style={{ fontSize: 10 }}
                            >
                              {dur.text}
                            </Tag>
                          </Space>
                        );
                      },
                    },
                    {
                      title: '处罚原因',
                      dataIndex: 'reason',
                      key: 'reason',
                      render: (reason: string) => (
                        <span style={{ fontSize: 12 }}>{reason || '违反社区规范'}</span>
                      ),
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 80,
                      render: (_, item) => (
                        <Popconfirm
                          title="确定解除此项限制？"
                          onConfirm={() => handleRevokeRestriction(currentUser.id, item.id)}
                        >
                          <Button type="link" size="small" danger style={{ padding: 0 }}>
                            解除
                          </Button>
                        </Popconfirm>
                      ),
                    },
                  ]}
                  locale={{
                    emptyText: (
                      <div style={{ padding: '8px 0', color: '#8c8c8c' }}>
                        当前账号全量封禁中，无细分内容项
                      </div>
                    ),
                  }}
                />
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
                    {(currentUser.certificationLabel ||
                      currentUser.certificationSummary?.certificationLabel) === '未实名'
                      ? '暂无实名认证记录'
                      : `当前认证状态：${currentUser.certificationLabel || currentUser.certificationSummary?.certificationLabel}`}
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
              <Descriptions.Item label="认证状态">
                {renderCertificationTag(
                  currentUser.certificationLabel ||
                    currentUser.certificationSummary?.certificationLabel,
                )}
              </Descriptions.Item>
              <Descriptions.Item label="认证生效时间">
                {currentUser.certificationSummary?.primary?.certifiedAt
                  ? formatDateTime(currentUser.certificationSummary.primary.certifiedAt)
                  : currentUser.personalAuths?.[0]?.authTime
                    ? formatDateTime(currentUser.personalAuths[0].authTime)
                    : '-'}
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

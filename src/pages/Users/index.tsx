import {
  BarChartOutlined,
  CalendarOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CommentOutlined,
  DownloadOutlined,
  DownOutlined,
  ExclamationCircleOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  FileTextOutlined,
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
import type { MenuProps, TableProps } from 'antd';
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
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  batchUpdateUserStatus,
  executeUserBan,
  getAllFilteredUsers,
  getUserContentRestrictions,
  getUserList,
  revokeAllUserRestrictions,
  revokeUserContentRestriction,
  updateUserStatus,
} from '@/api/user';
import { type ColumnOptionItem, useColumnSettings } from '@/components/ColumnSetting';
import type {
  ActiveStatus,
  ContentRestrictionItem,
  UserItem,
  UserQueryParams,
  UserStatus,
  VerifyStatus,
} from '@/types';
import { exportToCsv } from '@/utils/export';
import { formatBanRemainingTime } from '@/utils/time';
import {
  type BanPunishType,
  type SinglePenaltyConfig,
  UserBanModal,
} from './components/UserBanModal';
import { UserPersonaDrawer } from './components/UserPersonaDrawer';

const { Text } = Typography;
const { RangePicker } = DatePicker;

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

const formatRemainingDuration = (
  endAt?: string | null,
  nowTimestamp: number = Date.now(),
): { text: string; isPermanent: boolean; isExpired: boolean; isUrgent: boolean } => {
  if (!endAt || endAt === 'permanent') {
    return { text: '永久管控', isPermanent: true, isExpired: false, isUrgent: false };
  }

  const cleanEndStr = endAt.includes('T') ? endAt : endAt.replace(' ', 'T');
  let end = new Date(cleanEndStr).getTime();
  if (Number.isNaN(end)) {
    end = new Date(endAt).getTime();
    if (Number.isNaN(end)) {
      return { text: '时效计算中', isPermanent: false, isExpired: false, isUrgent: false };
    }
  }

  const diffMs = end - nowTimestamp;
  if (diffMs <= 0) {
    return { text: '已到期', isPermanent: false, isExpired: true, isUrgent: false };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const seconds = totalSeconds % 60;
  const totalMinutes = Math.floor(totalSeconds / 60);
  const minutes = totalMinutes % 60;
  const totalHours = Math.floor(totalMinutes / 60);
  const hours = totalHours % 24;
  const days = Math.floor(totalHours / 24);

  const pad = (n: number) => String(n).padStart(2, '0');

  if (days > 0) {
    return {
      text: `剩余 ${days}天 ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
      isPermanent: false,
      isExpired: false,
      isUrgent: false,
    };
  }

  return {
    text: `剩余 ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`,
    isPermanent: false,
    isExpired: false,
    isUrgent: totalHours < 1,
  };
};

const userColumnOptions: ColumnOptionItem[] = [
  { key: 'user', title: '用户信息 (头像/昵称/UID)', required: true },
  { key: 'verifyStatus', title: '认证状态' },
  { key: 'status', title: '账号状态与封禁处罚' },
  { key: 'activeStatus', title: '在线状态与活跃时间' },
  { key: 'comment', title: '评论数与禁言状态' },
  { key: 'post', title: '作品数与获赞' },
  { key: 'activity', title: '活动参与明细' },
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

  // 子表格展开行与按需缓存状态 (Dual-Mode 策略：优先复用聚合，缺失则懒加载)
  const [expandedRowKeys, setExpandedRowKeys] = useState<React.Key[]>([]);
  const [restrictionsMap, setRestrictionsMap] = useState<Record<string, ContentRestrictionItem[]>>(
    {},
  );
  const [restrictionLoadingMap, setRestrictionLoadingMap] = useState<Record<string, boolean>>({});

  // 展开行按需拉取或复用缓存
  // 单一全局心跳定时器：每秒驱动全页面所有微型子表格与展开行实时倒计时跳动（高性能零卡顿）
  const [currentTimestamp, setCurrentTimestamp] = useState<number>(() => Date.now());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTimestamp(Date.now());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  // 快捷解除限制 (带局部乐观更新)
  const handleRevokeRestriction = async (userId: string, restrictionId: number | string) => {
    try {
      const res = await revokeUserContentRestriction({
        restrictionId,
        reason: '管理员在控制台子表快捷解封',
      });
      if (res.code === 200 || res.code === 0) {
        message.success('已解除该项内容治理限制');

        setRestrictionsMap((prev) => {
          const currentList = prev[userId] || [];
          const nextList = currentList.filter((r) => String(r.id) !== String(restrictionId));
          return { ...prev, [userId]: nextList };
        });

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
                accountBanExpireTime: stillHasActive ? u.accountBanExpireTime : undefined,
                banReason: stillHasActive ? u.banReason : undefined,
              };
            }
            return u;
          }),
        );

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
    penalties: SinglePenaltyConfig[];
    punishTypes: BanPunishType[];
    punishType?: BanPunishType;
    duration?: string;
    expireTime?: string;
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

  // 一键全量解除指定用户的所有生效处罚
  const handleRevokeAllRestrictions = async (userId: string) => {
    try {
      const res = await revokeAllUserRestrictions(userId);
      if (res.code === 200 || res.code === 0) {
        message.success(res.message || '已成功解除该用户的全部处罚并恢复正常');
        setRestrictionsMap((prev) => ({ ...prev, [userId]: [] }));
        fetchData(currentPage, pageSize);
      }
    } catch {
      message.error('解除处罚失败');
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
          maxWidth: 270,
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
          <span>时效 / 快捷解除</span>
        </div>

        {/* 每一行处罚与剩余时间 */}
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          {allItems.map((item, idx) => {
            const duration = formatRemainingDuration(item.endAt, currentTimestamp);
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
                  <Popconfirm
                    title="解除限制确认"
                    description={`确定要解除用户【${record.nickname}】的【${item.label}】限制吗？`}
                    onConfirm={(e) => {
                      e?.stopPropagation();
                      if (item.type === 'account') {
                        handleStatusChange(record, 'normal');
                      } else {
                        handleRevokeRestriction(record.id, item.id);
                      }
                    }}
                    okText="解除"
                    cancelText="取消"
                  >
                    <Button
                      type="link"
                      size="small"
                      danger
                      style={{
                        padding: '0 2px',
                        fontSize: 11,
                        height: 'auto',
                        lineHeight: '14px',
                      }}
                      onClick={(e) => e.stopPropagation()}
                    >
                      解除
                    </Button>
                  </Popconfirm>
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
              UID: {record.uid || record.id}
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
                const duration = formatRemainingDuration(endAt, currentTimestamp);
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
      width: 250,
      render: (_, record) => renderAccountStatus(record),
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
      width: 220,
      render: (_, record) => {
        const isRestricted =
          record.status !== 'normal' || record.restrictions?.some((r) => r.status === 'active');

        const moreMenuItems: MenuProps['items'] = [
          {
            key: 'persona',
            icon: <BarChartOutlined style={{ color: '#1677ff' }} />,
            label: '查看大数据全景画像',
            onClick: () => {
              setPersonaUser(record);
              setPersonaDrawerVisible(true);
            },
          },
          {
            type: 'divider',
          },
          {
            key: 'moderation-sub',
            icon: <StopOutlined style={{ color: '#ff4d4f' }} />,
            label: '违规处置与惩戒',
            children: [
              {
                key: 'open-ban-modal',
                icon: <StopOutlined style={{ color: '#ff4d4f' }} />,
                label: '打开违规处置设置...',
                onClick: () => handleOpenBanModal([record], 'comment'),
              },
              {
                type: 'divider',
              },
              {
                key: 'quick-ban-comment-1h',
                label: '⚡ 快捷禁言 1小时',
                onClick: () =>
                  handleConfirmBan({
                    penalties: [{ punishType: 'comment', duration: '1h', expireTime: '' }],
                    punishTypes: ['comment'],
                    reason: '管理员快捷评论禁言1小时',
                    notifyUser: true,
                  }),
              },
              {
                key: 'quick-ban-post-1d',
                label: '📝 快捷禁发动态 1天',
                onClick: () =>
                  handleConfirmBan({
                    penalties: [{ punishType: 'post', duration: '1d', expireTime: '' }],
                    punishTypes: ['post'],
                    reason: '管理员快捷动态禁发1天',
                    notifyUser: true,
                  }),
              },
              {
                key: 'quick-ban-activity-7d',
                label: '🎪 快捷禁发活动 7天',
                onClick: () =>
                  handleConfirmBan({
                    penalties: [{ punishType: 'activity', duration: '7d', expireTime: '' }],
                    punishTypes: ['activity'],
                    reason: '管理员快捷活动禁发7天',
                    notifyUser: true,
                  }),
              },
              {
                key: 'quick-ban-account',
                icon: <LockOutlined />,
                label: '🚫 顶格全量封号',
                danger: true,
                disabled: record.status === 'banned',
                onClick: () => handleOpenBanModal([record], 'account'),
              },
              {
                type: 'divider',
              },
              {
                key: 'revoke-all',
                label: '🟢 一键解除全部惩罚',
                disabled: !isRestricted,
                onClick: () => handleRevokeAllRestrictions(record.id),
              },
            ],
          },
          {
            type: 'divider',
          },
          {
            key: 'status-sub',
            icon: <UnlockOutlined />,
            label: '账号状态变更',
            children: [
              {
                key: 'status-normal',
                icon: <UnlockOutlined />,
                label: '恢复正常状态',
                disabled: record.status === 'normal',
                onClick: () => handleStatusChange(record, 'normal'),
              },
              {
                key: 'status-cancelled',
                icon: <UserDeleteOutlined />,
                label: '设为已注销',
                disabled: record.status === 'cancelled',
                onClick: () => handleStatusChange(record, 'cancelled'),
              },
            ],
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
            {isRestricted ? (
              <Popconfirm
                title="解除全部惩罚确认"
                description={`确定要一键解除用户【${record.nickname}】的所有生效惩罚并恢复正常吗？`}
                onConfirm={() => handleRevokeAllRestrictions(record.id)}
                okText="解除惩罚"
                cancelText="取消"
              >
                <Button type="link" size="small" style={{ color: '#52c41a', fontWeight: 600 }}>
                  解除惩罚
                </Button>
              </Popconfirm>
            ) : (
              <Button
                type="link"
                size="small"
                danger
                onClick={() => handleOpenBanModal([record], 'comment')}
              >
                违规处置
              </Button>
            )}
            <Dropdown
              menu={{ items: moreMenuItems }}
              trigger={['hover', 'click']}
              placement="bottomRight"
              getPopupContainer={() => document.body}
            >
              <Button
                type="text"
                size="small"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '0 4px',
                  color: '#1677ff',
                }}
              >
                <MoreOutlined style={{ fontSize: 13 }} />
                <span>更多</span>
                <DownOutlined style={{ fontSize: 10 }} />
              </Button>
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

            {ColumnSettingComponent}

            <Tooltip title="刷新列表">
              <Button icon={<ReloadOutlined />} onClick={() => fetchData(currentPage, pageSize)} />
            </Tooltip>
          </Space>
        }
      >
        <Table<UserItem>
          rowKey="id"
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

            {/* 违规处罚置顶预警横幅 */}
            {(currentUser.status === 'banned' || currentUser.status === 'muted') && (
              <Card
                size="small"
                style={{
                  background: token.colorFillAlter,
                  border: `1px solid ${currentUser.status === 'banned' ? '#ff4d4f' : '#faad14'}`,
                  borderRadius: 8,
                  marginBottom: 16,
                }}
              >
                <div
                  style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                >
                  <Space>
                    <StopOutlined
                      style={{
                        color: currentUser.status === 'banned' ? '#ff4d4f' : '#faad14',
                        fontSize: 20,
                      }}
                    />
                    <div>
                      <Text
                        strong
                        style={{
                          color: currentUser.status === 'banned' ? '#ff4d4f' : '#faad14',
                          fontSize: 14,
                        }}
                      >
                        {currentUser.status === 'banned'
                          ? '当前账号已被全站封禁'
                          : '当前账号处于违规禁言惩戒中'}
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
                          {formatBanRemainingTime(
                            currentUser.accountBanExpireTime || currentUser.commentBanExpireTime,
                          ).text || '生效中'}
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

            <Row gutter={16} style={{ marginBottom: 24 }}>
              <Col span={6}>
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
                    title="作品发帖数"
                    value={currentUser.postCount}
                    valueStyle={{ color: '#52c41a', fontWeight: 600 }}
                    suffix="篇"
                  />
                </Card>
              </Col>
              <Col span={6}>
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
                    title="获赞总数"
                    value={currentUser.likeCount}
                    valueStyle={{ color: '#1677ff', fontWeight: 600 }}
                    formatter={(val) => `${(Number(val) / 10000).toFixed(1)}w`}
                  />
                </Card>
              </Col>
              <Col span={6}>
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
                    value={currentUser.followerCount}
                    valueStyle={{ color: '#fa8c16', fontWeight: 600 }}
                    formatter={(val) => `${(Number(val) / 10000).toFixed(1)}w`}
                  />
                </Card>
              </Col>
              <Col span={6}>
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
                    title="评论互动数"
                    value={currentUser.commentCount}
                    valueStyle={{ color: '#722ed1', fontWeight: 600 }}
                  />
                </Card>
              </Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

            <Descriptions title="基本资料" column={2} bordered size="small">
              <Descriptions.Item label="账号状态">
                {renderAccountStatus(currentUser)}
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

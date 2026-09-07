import {
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  HistoryOutlined,
  ReloadOutlined,
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
  Empty,
  Modal,
  message,
  Popconfirm,
  Radio,
  Row,
  Segmented,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Timeline,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { getUserPunishmentHistory, revokeUserContentRestriction } from '@/api/user';
import { useThemeStore } from '@/store/theme';
import type { ContentRestrictionItem, UserItem } from '@/types';
import { formatDateTime } from '@/utils/time';

const { Text } = Typography;

export interface UserPunishmentHistoryModalProps {
  open: boolean;
  onCancel: () => void;
  user: UserItem | null;
  onRevokeSuccess?: () => void;
}

// 处罚类型元数据映射
const PUNISH_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode; badgeText: string }
> = {
  account: {
    label: '全量封号',
    color: '#ff4d4f',
    icon: <StopOutlined />,
    badgeText: '全量封号',
  },
  post: {
    label: '禁发动态',
    color: '#eb2f96',
    icon: <FileTextOutlined />,
    badgeText: '禁发动态',
  },
  comment: {
    label: '禁止评论',
    color: '#fa8c16',
    icon: <CommentOutlined />,
    badgeText: '禁止评论',
  },
  activity_publish: {
    label: '禁发活动',
    color: '#722ed1',
    icon: <CalendarOutlined />,
    badgeText: '禁发活动',
  },
};

export const UserPunishmentHistoryModal: React.FC<UserPunishmentHistoryModalProps> = ({
  open,
  onCancel,
  user,
  onRevokeSuccess,
}) => {
  const { token } = theme.useToken();
  const isDark = useThemeStore((s) => s.isDark);

  const [loading, setLoading] = useState(false);
  const [historyList, setHistoryList] = useState<ContentRestrictionItem[]>([]);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'revoked' | 'expired'>('all');
  const [viewMode, setViewMode] = useState<'table' | 'timeline'>('table');
  const [actionLoadingMap, setActionLoadingMap] = useState<Record<string | number, boolean>>({});

  // 加载该用户的处罚历史记录
  const fetchHistory = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    try {
      const res = await getUserPunishmentHistory(user.id || user.userId || '');
      if ((res.code === 200 || res.code === 0) && Array.isArray(res.data)) {
        setHistoryList(res.data);
      } else {
        // 若接口未返回列表，尝试读取当前 user.restrictions 兜底
        setHistoryList(user.restrictions || []);
      }
    } catch {
      setHistoryList(user.restrictions || []);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (open && user) {
      setStatusFilter('all');
      fetchHistory();
    }
  }, [open, user, fetchHistory]);

  // 解除单项处罚
  const handleRevoke = async (item: ContentRestrictionItem) => {
    if (!user) return;
    setActionLoadingMap((prev) => ({ ...prev, [item.id]: true }));
    try {
      const res = await revokeUserContentRestriction({
        restrictionId: item.id,
        reason: '管理员在违规处罚历史面板中解除',
      });
      if (res.code === 200 || res.code === 0) {
        message.success('已成功解除该项违规处罚');
        // 本地更新该项状态
        const nowStr = new Date().toISOString().replace('T', ' ').substring(0, 19);
        setHistoryList((prev) =>
          prev.map((r) =>
            r.id === item.id
              ? {
                  ...r,
                  status: 'revoked',
                  revokedAt: nowStr,
                  revokeReason: '管理员在历史面板中解除',
                  revokedBy: '当前管理员',
                }
              : r,
          ),
        );
        onRevokeSuccess?.();
      } else {
        message.error(res.message || '解除处罚失败');
      }
    } catch (err: any) {
      message.error(err.message || '解除处罚失败');
    } finally {
      setActionLoadingMap((prev) => ({ ...prev, [item.id]: false }));
    }
  };

  // 统计概览
  const stats = useMemo(() => {
    const total = historyList.length;
    const active = historyList.filter((r) => r.status === 'active').length;
    const revoked = historyList.filter((r) => r.status === 'revoked').length;
    const expired = historyList.filter((r) => r.status === 'expired').length;
    return { total, active, revoked, expired };
  }, [historyList]);

  // 根据当前状态筛选的数据
  const filteredList = useMemo(() => {
    if (statusFilter === 'all') return historyList;
    return historyList.filter((r) => r.status === statusFilter);
  }, [historyList, statusFilter]);

  if (!user) return null;

  // 表格列配置
  const columns: TableProps<ContentRestrictionItem>['columns'] = [
    {
      title: '受限功能 / 处置类型',
      dataIndex: 'restrictionType',
      key: 'restrictionType',
      width: 140,
      render: (type: string) => {
        const meta = PUNISH_TYPE_CONFIG[type] || {
          label: type,
          color: 'default',
          icon: <ExclamationCircleOutlined />,
        };
        return (
          <Tag color={meta.color} icon={meta.icon} style={{ borderRadius: 6, fontWeight: 500 }}>
            {meta.label}
          </Tag>
        );
      },
    },
    {
      title: '处置状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        if (status === 'active') {
          return <Badge status="error" text={<Text type="danger">生效中</Text>} />;
        }
        if (status === 'revoked') {
          return <Badge status="success" text={<Text type="success">已解除</Text>} />;
        }
        return <Badge status="default" text={<Text type="secondary">已到期</Text>} />;
      },
    },
    {
      title: '违规原因与说明',
      dataIndex: 'reason',
      key: 'reason',
      ellipsis: true,
      render: (reason: string) => (
        <Tooltip title={reason} placement="topLeft">
          <span style={{ fontSize: 13, color: token.colorText }}>
            {reason || '违反平台治理公约规定'}
          </span>
        </Tooltip>
      ),
    },
    {
      title: '处置期限 / 生效时间',
      key: 'timeRange',
      width: 220,
      render: (_, r) => {
        const isPermanent = !r.endAt || r.endAt === 'permanent';
        return (
          <div style={{ fontSize: 12 }}>
            <div>
              <Text type="secondary">生效: </Text>
              <span>{formatDateTime(r.startAt || r.createdAt)}</span>
            </div>
            <div>
              <Text type="secondary">截止: </Text>
              {isPermanent ? (
                <Tag color="error" style={{ fontSize: 10, lineHeight: '16px' }}>
                  永久管控
                </Tag>
              ) : (
                <span>{formatDateTime(r.endAt)}</span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: '解除信息',
      key: 'revokedInfo',
      width: 180,
      render: (_, r) => {
        if (r.status === 'revoked') {
          return (
            <div style={{ fontSize: 12 }}>
              <div style={{ color: '#52c41a' }}>
                <CheckCircleOutlined style={{ marginRight: 4 }} />
                {r.revokedAt ? formatDateTime(r.revokedAt) : '已解除'}
              </div>
              {r.revokeReason && (
                <Tooltip title={r.revokeReason}>
                  <Text type="secondary" ellipsis style={{ maxWidth: 160, display: 'block' }}>
                    原因: {r.revokeReason}
                  </Text>
                </Tooltip>
              )}
              {r.revokedBy && (
                <Text type="secondary" style={{ fontSize: 11 }}>
                  经办: {r.revokedBy}
                </Text>
              )}
            </div>
          );
        }
        if (r.status === 'expired') {
          return (
            <Text type="secondary" style={{ fontSize: 12 }}>
              到期自然解除
            </Text>
          );
        }
        return <Text type="secondary">-</Text>;
      },
    },
    {
      title: '来源',
      dataIndex: 'sourceType',
      key: 'sourceType',
      width: 90,
      render: (src: string) => {
        if (src === 'manual') return <Tag color="blue">人工处置</Tag>;
        if (src === 'report') return <Tag color="volcano">举报受理</Tag>;
        if (src === 'rule') return <Tag color="cyan">规则风控</Tag>;
        return <Tag color="default">{src || '系统'}</Tag>;
      },
    },
    {
      title: '操作',
      key: 'action',
      width: 90,
      fixed: 'right',
      render: (_, item) => {
        if (item.status === 'active') {
          return (
            <Popconfirm
              title="确定解除此项处罚？"
              description={`解除后用户将恢复【${PUNISH_TYPE_CONFIG[item.restrictionType]?.label || item.restrictionType}】权限。`}
              onConfirm={() => handleRevoke(item)}
              okText="确认解除"
              cancelText="取消"
            >
              <Button
                type="link"
                size="small"
                danger
                loading={actionLoadingMap[item.id]}
                style={{ padding: 0 }}
              >
                解除处罚
              </Button>
            </Popconfirm>
          );
        }
        return (
          <Text type="secondary" style={{ fontSize: 12 }}>
            无需操作
          </Text>
        );
      },
    },
  ];

  return (
    <Modal
      open={open}
      onCancel={onCancel}
      footer={null}
      width={940}
      title={
        <Space size={8}>
          <HistoryOutlined style={{ color: '#1677ff', fontSize: 18 }} />
          <span style={{ fontSize: 16, fontWeight: 600 }}>用户违规处置与历史惩戒档案</span>
        </Space>
      }
      styles={{
        body: { maxHeight: '72vh', overflowY: 'auto', paddingRight: 4 },
      }}
    >
      {/* 顶部用户信息与处置大盘摘要卡片 */}
      <Card
        size="small"
        style={{
          background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f8fafd',
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 8,
          marginBottom: 16,
        }}
      >
        <Row gutter={[16, 12]} align="middle">
          <Col xs={24} sm={12} md={10}>
            <Space size={12} align="center">
              <Avatar
                src={user.avatarUrl || user.avatar}
                size={52}
                icon={<UserOutlined />}
                style={{ border: '2px solid #fff', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }}
              />
              <div>
                <Space size={6}>
                  <Text strong style={{ fontSize: 15 }}>
                    {user.nickname}
                  </Text>
                  <Tag color="processing" style={{ borderRadius: 10, fontSize: 11 }}>
                    UID: {user.userId || user.id}
                  </Tag>
                </Space>
                <div style={{ marginTop: 4, fontSize: 12, color: token.colorTextSecondary }}>
                  <span>手机: {user.phoneNumber || user.phone || '未绑定'}</span>
                  <span style={{ margin: '0 8px' }}>·</span>
                  <span>实名: {user.certificationLabel || '未实名'}</span>
                </div>
              </div>
            </Space>
          </Col>

          {/* 4 项关键统计徽标 */}
          <Col xs={24} sm={12} md={14}>
            <Row gutter={8}>
              <Col span={6}>
                <div
                  style={{
                    background: token.colorBgContainer,
                    padding: '6px 8px',
                    borderRadius: 6,
                    textAlign: 'center',
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  <Statistic
                    title={<span style={{ fontSize: 11 }}>累计受罚</span>}
                    value={stats.total}
                    valueStyle={{ fontSize: 18, fontWeight: 600, color: '#1677ff' }}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div
                  style={{
                    background: token.colorBgContainer,
                    padding: '6px 8px',
                    borderRadius: 6,
                    textAlign: 'center',
                    border: `1px solid ${stats.active > 0 ? '#ffccc7' : token.colorBorderSecondary}`,
                  }}
                >
                  <Statistic
                    title={<span style={{ fontSize: 11 }}>正在生效</span>}
                    value={stats.active}
                    valueStyle={{ fontSize: 18, fontWeight: 600, color: '#ff4d4f' }}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div
                  style={{
                    background: token.colorBgContainer,
                    padding: '6px 8px',
                    borderRadius: 6,
                    textAlign: 'center',
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  <Statistic
                    title={<span style={{ fontSize: 11 }}>已解除</span>}
                    value={stats.revoked}
                    valueStyle={{ fontSize: 18, fontWeight: 600, color: '#52c41a' }}
                  />
                </div>
              </Col>
              <Col span={6}>
                <div
                  style={{
                    background: token.colorBgContainer,
                    padding: '6px 8px',
                    borderRadius: 6,
                    textAlign: 'center',
                    border: `1px solid ${token.colorBorderSecondary}`,
                  }}
                >
                  <Statistic
                    title={<span style={{ fontSize: 11 }}>已到期</span>}
                    value={stats.expired}
                    valueStyle={{ fontSize: 18, fontWeight: 600, color: '#8c8c8c' }}
                  />
                </div>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* 控制栏：状态过滤 + 视图切换 + 刷新 */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
          flexWrap: 'wrap',
          gap: 8,
        }}
      >
        <Radio.Group
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          buttonStyle="solid"
          size="small"
        >
          <Radio.Button value="all">全部记录 ({stats.total})</Radio.Button>
          <Radio.Button value="active">🔴 正在生效 ({stats.active})</Radio.Button>
          <Radio.Button value="revoked">🟢 已解除 ({stats.revoked})</Radio.Button>
          <Radio.Button value="expired">⚪ 已到期 ({stats.expired})</Radio.Button>
        </Radio.Group>

        <Space size={8}>
          <Segmented
            size="small"
            value={viewMode}
            onChange={(val) => setViewMode(val as 'table' | 'timeline')}
            options={[
              { label: '列表明细', value: 'table' },
              { label: '时间线溯源', value: 'timeline' },
            ]}
          />
          <Tooltip title="刷新记录">
            <Button size="small" icon={<ReloadOutlined spin={loading} />} onClick={fetchHistory} />
          </Tooltip>
        </Space>
      </div>

      {/* 内容主体展示 */}
      <Spin spinning={loading}>
        {filteredList.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description={
              statusFilter === 'all'
                ? '该用户良好合规，暂无违规处罚历史记录'
                : '当前筛选分类下无处置记录'
            }
            style={{ margin: '40px 0' }}
          />
        ) : viewMode === 'table' ? (
          <Table<ContentRestrictionItem>
            size="small"
            rowKey="id"
            columns={columns}
            dataSource={filteredList}
            pagination={filteredList.length > 5 ? { pageSize: 5, size: 'small' } : false}
            bordered
            scroll={{ x: 780 }}
          />
        ) : (
          /* 时间线展示模式 */
          <div style={{ padding: '16px 24px 8px 16px' }}>
            <Timeline
              mode="left"
              items={filteredList.map((item) => {
                const isAct = item.status === 'active';
                const isRev = item.status === 'revoked';
                const meta = PUNISH_TYPE_CONFIG[item.restrictionType] || {
                  label: item.restrictionType,
                  color: 'default',
                  icon: <ExclamationCircleOutlined />,
                };

                return {
                  key: item.id,
                  color: isAct ? 'red' : isRev ? 'green' : 'gray',
                  dot: isAct ? (
                    <StopOutlined style={{ fontSize: 14, color: '#ff4d4f' }} />
                  ) : isRev ? (
                    <CheckCircleOutlined style={{ fontSize: 14, color: '#52c41a' }} />
                  ) : (
                    <ClockCircleOutlined style={{ fontSize: 14, color: '#8c8c8c' }} />
                  ),
                  children: (
                    <Card
                      size="small"
                      style={{
                        marginBottom: 12,
                        borderRadius: 6,
                        border: isAct ? '1px solid #ffa39e' : undefined,
                        background: isAct
                          ? isDark
                            ? 'rgba(255, 77, 79, 0.08)'
                            : '#fff1f0'
                          : undefined,
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          marginBottom: 4,
                        }}
                      >
                        <Space size={6}>
                          <Tag color={meta.color} icon={meta.icon}>
                            {meta.label}
                          </Tag>
                          <Badge
                            status={isAct ? 'error' : isRev ? 'success' : 'default'}
                            text={isAct ? '正在生效' : isRev ? '已解除' : '已到期'}
                          />
                        </Space>
                        <Text type="secondary" style={{ fontSize: 12 }}>
                          {formatDateTime(item.startAt || item.createdAt)}
                        </Text>
                      </div>

                      <div style={{ fontSize: 13, margin: '6px 0', color: token.colorText }}>
                        <strong>违规原因：</strong>
                        {item.reason || '违反社区规范与管理条例'}
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                          fontSize: 12,
                          color: token.colorTextSecondary,
                        }}
                      >
                        <span>
                          期限：
                          {!item.endAt || item.endAt === 'permanent'
                            ? '永久管控'
                            : `至 ${formatDateTime(item.endAt)}`}
                        </span>
                        {isRev && (
                          <span style={{ color: '#52c41a' }}>
                            解除理由：{item.revokeReason || '人工解除'}
                          </span>
                        )}
                        {isAct && (
                          <Popconfirm
                            title="确定解除此项处罚？"
                            onConfirm={() => handleRevoke(item)}
                            okText="解除"
                            cancelText="取消"
                          >
                            <Button type="link" size="small" danger style={{ padding: 0 }}>
                              解除此项处罚
                            </Button>
                          </Popconfirm>
                        )}
                      </div>
                    </Card>
                  ),
                };
              })}
            />
          </div>
        )}
      </Spin>
    </Modal>
  );
};

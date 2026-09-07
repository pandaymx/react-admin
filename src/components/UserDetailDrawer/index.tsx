import {
  ExclamationCircleOutlined,
  ExportOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  HistoryOutlined,
  IdcardOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  message,
  Popconfirm,
  Row,
  Space,
  Spin,
  Statistic,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import { fetchUserDetailByNo, updateUserStatus } from '@/api/user';
import { UserPunishmentHistoryModal } from '@/pages/Users/components/UserPunishmentHistoryModal';
import { useThemeStore } from '@/store/theme';
import type { ContentRestrictionItem, UserItem, UserStatus } from '@/types';
import { formatDateTime } from '@/utils/time';

const { Title, Text } = Typography;

export interface UserDetailDrawerProps {
  open: boolean;
  onClose: () => void;
  user?: UserItem | null;
  userIdOrNo?: string | number | null;
  onStatusChange?: (user: UserItem, newStatus: 'normal' | 'banned') => void;
}

const RESTRICTION_TYPE_META: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  post: { label: '禁止发帖', color: 'error', icon: <StopOutlined /> },
  comment: { label: '禁止评论', color: 'warning', icon: <ExclamationCircleOutlined /> },
  im: { label: '私聊禁言', color: 'purple', icon: <StopOutlined /> },
  live: { label: '禁止直播', color: 'magenta', icon: <StopOutlined /> },
  activity: { label: '限制活动', color: 'orange', icon: <ExclamationCircleOutlined /> },
  profile_edit: { label: '禁止修改资料', color: 'volcano', icon: <StopOutlined /> },
  account: { label: '全量账号封禁', color: 'red', icon: <StopOutlined /> },
};

export const UserDetailDrawer: React.FC<UserDetailDrawerProps> = ({
  open,
  onClose,
  user: initialUser,
  userIdOrNo,
  onStatusChange,
}) => {
  const { token } = theme.useToken();
  const { isDark } = useThemeStore();

  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserItem | null>(initialUser || null);
  const [isPhoneRevealed, setIsPhoneRevealed] = useState(false);
  const [historyModalVisible, setHistoryModalVisible] = useState(false);

  // 监听打开与用户标识变化
  useEffect(() => {
    if (!open) {
      setIsPhoneRevealed(false);
      return;
    }

    if (initialUser) {
      setCurrentUser(initialUser);
      return;
    }

    if (userIdOrNo) {
      setLoading(true);
      fetchUserDetailByNo(userIdOrNo)
        .then((res) => {
          setCurrentUser(res);
        })
        .catch(() => {
          message.error('获取用户档案失败');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [open, initialUser, userIdOrNo]);

  // 格式化脱敏手机号
  const formatMaskedPhone = (phone?: string, revealed = false) => {
    if (!phone) return '-';
    if (revealed) return phone;
    return phone.replace(/(\d{3})\d{4}(\d{4})/, '$1****$2');
  };

  // 格式化限制时效
  const formatRemainingDuration = (endAt: string | null) => {
    if (!endAt) return { text: '永久封禁 / 管控', isPermanent: true };
    const diff = new Date(endAt).getTime() - Date.now();
    if (diff <= 0) return { text: '已到期', isPermanent: false };
    const hours = Math.ceil(diff / (1000 * 60 * 60));
    if (hours < 24) return { text: `剩余 ${hours} 小时`, isPermanent: false };
    const days = Math.ceil(hours / 24);
    return { text: `剩余 ${days} 天`, isPermanent: false };
  };

  // 认证状态标签
  const renderCertificationTag = (label?: string) => {
    const text = label || '未实名';
    switch (text) {
      case '企业认证':
        return (
          <Tag color="blue" style={{ borderRadius: 10 }}>
            企业官方认证
          </Tag>
        );
      case '个人认证':
        return (
          <Tag color="green" style={{ borderRadius: 10 }}>
            个人实名认证
          </Tag>
        );
      case '审核中':
        return (
          <Tag color="orange" style={{ borderRadius: 10 }}>
            认证审核中
          </Tag>
        );
      default:
        return (
          <Tag color="default" style={{ borderRadius: 10 }}>
            未实名
          </Tag>
        );
    }
  };

  // 状态变更操作
  const handleToggleStatus = async () => {
    if (!currentUser) return;
    const targetStatus: UserStatus = currentUser.status === 'banned' ? 'normal' : 'banned';
    try {
      const res = await updateUserStatus(currentUser.id, targetStatus);
      if (res.code === 200 || res.code === 0) {
        message.success(targetStatus === 'normal' ? '用户账号已成功解封' : '用户账号已封禁');
        const updated: UserItem = { ...currentUser, status: targetStatus };
        setCurrentUser(updated);
        onStatusChange?.(updated, targetStatus);
      }
    } catch {
      message.error('操作失败，请稍后重试');
    }
  };

  const displayUserNo = currentUser?.userNo || currentUser?.userId || currentUser?.uid || '';

  return (
    <>
      <Drawer
        title="用户档案详情"
        placement="right"
        size="large"
        open={open}
        onClose={onClose}
        extra={
          currentUser && (
            <Space>
              <Button
                type="link"
                size="small"
                icon={<ExportOutlined />}
                href={`#/users?userNo=${displayUserNo}`}
                target="_blank"
                style={{ padding: '0 6px' }}
              >
                用户列表中查看
              </Button>
              {currentUser.status === 'banned' ? (
                <Button type="primary" size="small" onClick={handleToggleStatus}>
                  解封账号
                </Button>
              ) : (
                <Popconfirm
                  title="确认禁用此用户账号？"
                  description="禁用后该用户将无法登录与发布内容"
                  onConfirm={handleToggleStatus}
                  okButtonProps={{ danger: true }}
                >
                  <Button danger size="small">
                    禁用账号
                  </Button>
                </Popconfirm>
              )}
            </Space>
          )
        }
      >
        <Spin spinning={loading}>
          {currentUser ? (
            <div>
              {/* 头部基本资料 */}
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
                  <div style={{ marginTop: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text type="secondary" style={{ fontSize: 13 }}>
                      展示号(UID):
                    </Text>
                    <Text code copyable strong style={{ fontSize: 13, color: '#1677ff' }}>
                      {displayUserNo}
                    </Text>
                    {currentUser.initStatus === 0 && (
                      <Tag style={{ marginLeft: 4 }}>系统保底未初始化</Tag>
                    )}
                  </div>
                </div>
              </div>

              {/* 违规处罚与内容安全治理专栏 */}
              {currentUser.status !== 'normal' ||
              (currentUser.restrictions && currentUser.restrictions.length > 0) ? (
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
                  extra={
                    <Button
                      type="link"
                      size="small"
                      icon={<HistoryOutlined />}
                      onClick={() => setHistoryModalVisible(true)}
                    >
                      处罚历史档案
                    </Button>
                  }
                  style={{
                    background: isDark ? 'rgba(255, 77, 79, 0.08)' : '#fff2f0',
                    border: isDark ? '1px solid rgba(255, 77, 79, 0.3)' : '1px solid #ffccc7',
                    borderRadius: 8,
                    marginBottom: 16,
                  }}
                >
                  <Table<ContentRestrictionItem>
                    size="small"
                    rowKey="id"
                    pagination={false}
                    dataSource={(currentUser.restrictions || []).filter(
                      (r) => r.status === 'active',
                    )}
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
                            <Space direction="vertical" size={1}>
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
              ) : (
                <div style={{ marginBottom: 16 }}>
                  <Button
                    icon={<HistoryOutlined />}
                    onClick={() => setHistoryModalVisible(true)}
                    style={{ width: '100%', borderRadius: 6 }}
                  >
                    查看该用户违规与处罚历史档案
                  </Button>
                </div>
              )}

              {/* 社交互动指标卡 */}
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={8}>
                  <Card
                    size="small"
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
                    {displayUserNo}
                  </Text>
                </Descriptions.Item>
                <Descriptions.Item label="账号状态">
                  {currentUser.status === 'banned' ? (
                    <Tag color="red">已封禁</Tag>
                  ) : currentUser.status === 'cancelled' ? (
                    <Tag color="default">已注销</Tag>
                  ) : (
                    <Tag color="green">正常</Tag>
                  )}
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
          ) : (
            !loading && (
              <div style={{ textAlign: 'center', padding: '40px 0', color: '#8c8c8c' }}>
                未找到该用户的详细档案数据
              </div>
            )
          )}
        </Spin>
      </Drawer>

      {/* 处罚历史档案弹窗 */}
      {currentUser && (
        <UserPunishmentHistoryModal
          open={historyModalVisible}
          onCancel={() => setHistoryModalVisible(false)}
          user={currentUser}
        />
      )}
    </>
  );
};

export default UserDetailDrawer;

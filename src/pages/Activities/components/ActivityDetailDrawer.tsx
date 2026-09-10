import {
  CalendarOutlined,
  ClockCircleOutlined,
  CompassOutlined,
  EnvironmentOutlined,
  InfoCircleOutlined,
  TeamOutlined,
  UserOutlined,
  WalletOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Descriptions,
  Drawer,
  Empty,
  Image,
  Progress,
  Row,
  Space,
  Spin,
  Table,
  Tabs,
  Tag,
  Timeline,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import { getActivityDetail } from '@/api/activity';
import { useThemeStore } from '@/store/theme';
import type { ActivityDetailRespVO, ActivityEnrollmentItem } from '@/types';

const { Title, Text, Paragraph } = Typography;

interface ActivityDetailDrawerProps {
  open: boolean;
  activityId: string | null;
  onClose: () => void;
  onEdit?: (detail: ActivityDetailRespVO) => void;
}

const STATUS_CONFIG: Record<
  number,
  {
    label: string;
    color: string;
    badge: 'default' | 'success' | 'processing' | 'error' | 'warning';
  }
> = {
  0: { label: '草稿', color: 'default', badge: 'default' },
  5: { label: '审核中', color: 'processing', badge: 'processing' },
  1: { label: '已发布', color: 'success', badge: 'success' },
  2: { label: '进行中', color: 'warning', badge: 'warning' },
  3: { label: '已结束', color: 'default', badge: 'default' },
  4: { label: '已取消', color: 'error', badge: 'error' },
  6: { label: '已驳回', color: 'error', badge: 'error' },
};

export const ActivityDetailDrawer: React.FC<ActivityDetailDrawerProps> = ({
  open,
  activityId,
  onClose,
  onEdit,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const {
    token: { colorBorderSecondary, colorPrimary },
  } = theme.useToken();

  const [loading, setLoading] = useState<boolean>(false);
  const [detail, setDetail] = useState<ActivityDetailRespVO | null>(null);

  useEffect(() => {
    if (open && activityId) {
      setLoading(true);
      getActivityDetail(activityId)
        .then((res) => {
          if (res.code === 0 && res.data) {
            setDetail(res.data);
          }
        })
        .finally(() => setLoading(false));
    }
  }, [open, activityId]);

  if (!detail) return null;

  const statusInfo = STATUS_CONFIG[detail.status] || {
    label: '未知',
    color: 'default',
    badge: 'default',
  };
  const enrollPercent = detail.maxParticipants
    ? Math.min(100, Math.round((detail.currentEnrollCount / detail.maxParticipants) * 100))
    : 0;

  return (
    <Drawer
      title={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            width: '100%',
            paddingRight: 20,
          }}
        >
          <Space>
            <CompassOutlined style={{ color: colorPrimary }} />
            <span>活动全景详情 — {detail.id}</span>
            <Tag color={statusInfo.color}>{statusInfo.label}</Tag>
          </Space>
          {detail.status === 0 && onEdit && (
            <Button type="primary" size="small" onClick={() => onEdit(detail)}>
              编辑草稿
            </Button>
          )}
        </div>
      }
      open={open}
      onClose={onClose}
      width={900}
      destroyOnClose
    >
      <Spin spinning={loading}>
        {/* 顶部主图横幅与基本信息 */}
        <div
          style={{
            borderRadius: 12,
            overflow: 'hidden',
            marginBottom: 20,
            border: `1px solid ${colorBorderSecondary}`,
            background: isDark ? '#1a1a1a' : '#fafafa',
          }}
        >
          <Row>
            <Col xs={24} sm={8}>
              <Image
                src={
                  detail.coverUrl ||
                  'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=600&q=80'
                }
                alt={detail.title}
                style={{ width: '100%', height: 180, objectFit: 'cover' }}
              />
            </Col>
            <Col
              xs={24}
              sm={16}
              style={{
                padding: 16,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <Space wrap style={{ marginBottom: 6 }}>
                  <Tag color="blue">{detail.categoryName || '户外活动'}</Tag>
                  <Tag color="cyan">{detail.subcategoryName || '徒步探索'}</Tag>
                  <Tag color="geekblue">
                    <EnvironmentOutlined /> {detail.city}
                  </Tag>
                </Space>
                <Title level={4} style={{ margin: '4px 0 8px' }}>
                  {detail.title}
                </Title>
                <Space size={16} wrap style={{ fontSize: 13, color: '#888' }}>
                  <span>
                    <ClockCircleOutlined /> 起止：{detail.startTime.substring(0, 16)} ~{' '}
                    {detail.endTime.substring(0, 16)}
                  </span>
                </Space>
              </div>

              <div
                style={{
                  marginTop: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <Space>
                  <Avatar src={detail.publisherAvatarUrl} icon={<UserOutlined />} size="small" />
                  <Text style={{ fontSize: 13 }}>
                    发布者：<strong>{detail.publisherNickname || detail.publisherUserId}</strong>
                  </Text>
                </Space>

                <Space size={12}>
                  <Text style={{ fontSize: 13 }}>
                    费用：
                    <strong style={{ fontSize: 16, color: '#fa8c16' }}>
                      {detail.feeMode === 'FREE' ? '免费' : `¥${detail.feeAmount}`}
                    </strong>{' '}
                    (
                    {detail.feeMode === 'FREE'
                      ? '公益免费'
                      : detail.feeMode === 'AA'
                        ? 'AA分摊'
                        : '固定付费'}
                    )
                  </Text>
                </Space>
              </div>
            </Col>
          </Row>
        </div>

        {/* 报名人数成团进度条 */}
        <Card
          size="small"
          bordered
          style={{ marginBottom: 20, background: isDark ? '#1a1a1a' : '#fff' }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 6,
            }}
          >
            <Space>
              <TeamOutlined style={{ color: colorPrimary }} />
              <Text strong>成团报名进度</Text>
            </Space>
            <Text>
              已报 <strong>{detail.currentEnrollCount}</strong> / 上限 {detail.maxParticipants} 人
              (成团线: {detail.minParticipants} 人)
            </Text>
          </div>
          <Progress
            percent={enrollPercent}
            status={enrollPercent >= 100 ? 'success' : enrollPercent >= 60 ? 'normal' : 'active'}
            strokeColor={enrollPercent >= 100 ? '#52c41a' : colorPrimary}
          />
        </Card>

        {/* 核心 Tab 页签 */}
        <Tabs
          defaultActiveKey="overview"
          items={[
            {
              key: 'overview',
              label: (
                <span>
                  <InfoCircleOutlined /> 活动概况与须知
                </span>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <Card title="基本参数与要求" size="small" bordered>
                    <Descriptions column={{ xs: 1, sm: 2, md: 3 }} size="small">
                      <Descriptions.Item label="报名截止时间">
                        {detail.enrollDeadline}
                      </Descriptions.Item>
                      <Descriptions.Item label="年龄要求区间">
                        {detail.ageMin} 岁 ~ {detail.ageMax} 岁
                      </Descriptions.Item>
                      <Descriptions.Item label="退改保障规则">
                        {detail.refundRuleType || '活动开始前24小时支持全额退订'}
                      </Descriptions.Item>
                      <Descriptions.Item label="发布时间">{detail.createdAt}</Descriptions.Item>
                      <Descriptions.Item label="最后更新">{detail.updatedAt}</Descriptions.Item>
                      {detail.status === 4 && (
                        <Descriptions.Item label="取消原因说明" span={3}>
                          <Text type="danger">
                            {detail.rejectReason || '管理员/发布者主动取消'}
                          </Text>
                        </Descriptions.Item>
                      )}
                    </Descriptions>
                  </Card>

                  <Card title="活动详情介绍" size="small" bordered>
                    <Paragraph style={{ whiteSpace: 'pre-wrap', lineHeight: 1.8 }}>
                      {detail.introduction || '暂无详细介绍'}
                    </Paragraph>
                  </Card>

                  <Card title="报名须知与安全指引" size="small" bordered>
                    <Descriptions column={1} size="small" layout="vertical">
                      <Descriptions.Item label="📌 报名须知">
                        <Text type="secondary">
                          {detail.enrollNotice || '遵守团队纪律，不擅自脱离队伍。'}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="⚠️ 安全注意事项">
                        <Text type="secondary">
                          {detail.caution || '高风险户外活动请务必注意个人防护，听从领队指挥。'}
                        </Text>
                      </Descriptions.Item>
                      <Descriptions.Item label="💡 贴心温馨提示">
                        <Text type="secondary">
                          {detail.tips || '建议自备垃圾袋，倡导无痕户外 (LNT) 理念。'}
                        </Text>
                      </Descriptions.Item>
                    </Descriptions>
                  </Card>
                </div>
              ),
            },
            {
              key: 'itinerary',
              label: (
                <span>
                  <CalendarOutlined /> 行程单与集合点
                </span>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* 集合地点 */}
                  <Card title="集合地点打点" size="small" bordered>
                    {detail.meetingPoints?.length === 0 ? (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂未设置集合地点" />
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {detail.meetingPoints.map((mp, idx) => (
                          <div
                            key={mp.id || idx}
                            style={{
                              padding: 12,
                              borderRadius: 8,
                              border: `1px solid ${colorBorderSecondary}`,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Space>
                              <EnvironmentOutlined style={{ color: '#fa541c', fontSize: 16 }} />
                              <div>
                                <Text strong>{mp.name}</Text>
                                {mp.address && (
                                  <Text type="secondary" style={{ display: 'block', fontSize: 12 }}>
                                    {mp.address}
                                  </Text>
                                )}
                              </div>
                            </Space>
                            <Tag color="orange">集合时间：{mp.timeText}</Tag>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* 时间轴行程 */}
                  <Card title="行程路线规划 (Itinerary)" size="small" bordered>
                    {detail.itineraries?.length === 0 ? (
                      <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="暂无行程规划安排" />
                    ) : (
                      <Timeline
                        items={detail.itineraries.map((it) => ({
                          color: 'blue',
                          children: (
                            <div>
                              <Space>
                                <Tag color="geekblue">第 {it.dayNo} 天</Tag>
                                <Text strong>{it.timeText}</Text>
                              </Space>
                              <p style={{ marginTop: 4, color: '#555' }}>{it.content}</p>
                            </div>
                          ),
                        }))}
                      />
                    )}
                  </Card>
                </div>
              ),
            },
            {
              key: 'enrollments',
              label: (
                <span>
                  <TeamOutlined /> 报名名单 ({detail.enrollments?.length || 0})
                </span>
              ),
              children: (
                <Card size="small" bordered>
                  <Table<ActivityEnrollmentItem>
                    rowKey="id"
                    dataSource={detail.enrollments || []}
                    pagination={false}
                    size="middle"
                    columns={[
                      {
                        title: '用户',
                        dataIndex: 'nickname',
                        render: (name, record) => (
                          <Space>
                            <Avatar src={record.avatarUrl} size="small" />
                            <div>
                              <Text strong>{name}</Text>
                              <Text type="secondary" style={{ display: 'block', fontSize: 11 }}>
                                ID: {record.userId}
                              </Text>
                            </div>
                          </Space>
                        ),
                      },
                      {
                        title: '联系手机',
                        dataIndex: 'phone',
                        render: (phone) => phone || '未留手机号',
                      },
                      {
                        title: '报名人次',
                        dataIndex: 'enrollCount',
                        align: 'center',
                        render: (cnt) => `${cnt} 人`,
                      },
                      {
                        title: '报名状态',
                        dataIndex: 'status',
                        render: (st) =>
                          st === 'CONFIRMED' ? (
                            <Tag color="green">报名成功</Tag>
                          ) : st === 'CHECKED_IN' ? (
                            <Tag color="blue">已签到</Tag>
                          ) : (
                            <Tag color="red">已退款/取消</Tag>
                          ),
                      },
                      {
                        title: '支付状态',
                        dataIndex: 'paymentStatus',
                        render: (ps) =>
                          ps === 'PAID' ? (
                            <Tag color="success">已支付</Tag>
                          ) : ps === 'FREE' ? (
                            <Tag color="default">免费单</Tag>
                          ) : (
                            <Tag color="warning">已退款</Tag>
                          ),
                      },
                      {
                        title: '报名时间',
                        dataIndex: 'createdAt',
                      },
                    ]}
                  />
                </Card>
              ),
            },
            {
              key: 'managers_equipments',
              label: (
                <span>
                  <WalletOutlined /> 费用·领队·装备
                </span>
              ),
              children: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {/* 费用清单 */}
                  <Card title="费用包含与不包含明细" size="small" bordered>
                    {detail.feeItems?.length === 0 ? (
                      <Text type="secondary">未设置具体明细项</Text>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {detail.feeItems.map((fi, idx) => (
                          <div
                            key={fi.id || idx}
                            style={{
                              padding: '8px 12px',
                              borderRadius: 6,
                              background: isDark ? '#222' : '#f9f9f9',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                            }}
                          >
                            <Space>
                              <Tag color={fi.feeType === 'exclude' ? 'error' : 'success'}>
                                {fi.feeType === 'exclude' ? '自费项' : '已包含'}
                              </Tag>
                              <Text strong>{fi.title}</Text>
                            </Space>
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              {fi.content}
                            </Text>
                          </div>
                        ))}
                      </div>
                    )}
                  </Card>

                  {/* 装备引用 */}
                  <Card title="推荐/必带装备建议" size="small" bordered>
                    {detail.equipmentRefs?.length === 0 ? (
                      <Text type="secondary">无特殊装备要求</Text>
                    ) : (
                      <Space wrap>
                        {detail.equipmentRefs.map((eq) => (
                          <Tag key={eq} color="purple">
                            🛡️ {eq}
                          </Tag>
                        ))}
                      </Space>
                    )}
                  </Card>

                  {/* 领队向导 */}
                  <Card title="随队管理人员与领队" size="small" bordered>
                    {detail.managers?.length === 0 ? (
                      <Text type="secondary">未分配领队</Text>
                    ) : (
                      <Row gutter={[12, 12]}>
                        {detail.managers.map((mng, idx) => (
                          <Col span={12} key={mng.id || idx}>
                            <div
                              style={{
                                padding: 12,
                                borderRadius: 8,
                                border: `1px solid ${colorBorderSecondary}`,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 12,
                              }}
                            >
                              <Avatar src={mng.avatarUrl} icon={<UserOutlined />} size={40} />
                              <div>
                                <Text strong>{mng.nickname || mng.userId}</Text>
                                <Tag color="blue" style={{ display: 'block', marginTop: 4 }}>
                                  {mng.role}
                                </Tag>
                              </div>
                            </div>
                          </Col>
                        ))}
                      </Row>
                    )}
                  </Card>

                  {/* 活动图片图库 */}
                  <Card title="活动图库画廊 (多图)" size="small" bordered>
                    <Image.PreviewGroup>
                      <Space wrap size={10}>
                        {detail.images?.map((img, idx) => (
                          <div key={img.id || idx} style={{ position: 'relative' }}>
                            <Image
                              src={img.url}
                              width={110}
                              height={80}
                              style={{ objectFit: 'cover', borderRadius: 6 }}
                            />
                            {img.isCover === 1 && (
                              <Tag
                                color="gold"
                                style={{
                                  position: 'absolute',
                                  top: 4,
                                  right: 4,
                                  margin: 0,
                                  fontSize: 10,
                                }}
                              >
                                封面
                              </Tag>
                            )}
                          </div>
                        ))}
                      </Space>
                    </Image.PreviewGroup>
                  </Card>
                </div>
              ),
            },
          ]}
        />
      </Spin>
    </Drawer>
  );
};

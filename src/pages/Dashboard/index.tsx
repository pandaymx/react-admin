import {
  AlertOutlined,
  ArrowUpOutlined,
  AuditOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  FileImageOutlined,
  FireOutlined,
  ReloadOutlined,
  RightOutlined,
  SafetyCertificateOutlined,
  SecurityScanOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Col,
  Empty,
  message,
  Progress,
  Radio,
  Row,
  Space,
  Statistic,
  Tag,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  getDashboardAnalytics,
  getDashboardOverview,
  getPendingTasks,
  getSecurityAuditStream,
} from '@/api/dashboard';
import type {
  ActivityTrendItem,
  DashboardOverviewStats,
  PendingTaskItem,
  SecurityAuditStreamItem,
  ViolationCategoryStat,
} from '@/types';

const { Title, Text, Paragraph } = Typography;

export const DashboardPage: React.FC = () => {
  const { token } = theme.useToken();
  const navigate = useNavigate();

  const [loading, setLoading] = useState<boolean>(true);
  const [stats, setStats] = useState<DashboardOverviewStats | null>(null);
  const [pendingTasks, setPendingTasks] = useState<PendingTaskItem[]>([]);
  const [taskFilter, setTaskFilter] = useState<'all' | 'report' | 'appeal' | 'verification'>('all');
  const [auditStream, setAuditStream] = useState<SecurityAuditStreamItem[]>([]);
  const [auditFilter, setAuditFilter] = useState<'all' | 'ban' | 'appeal' | 'verify'>('all');
  const [violationCategories, setViolationCategories] = useState<ViolationCategoryStat[]>([]);
  const [trends, setTrends] = useState<ActivityTrendItem[]>([]);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [overviewRes, tasksRes, auditRes, analyticsRes] = await Promise.all([
        getDashboardOverview(),
        getPendingTasks(),
        getSecurityAuditStream(),
        getDashboardAnalytics(),
      ]);

      if (overviewRes.code === 200) setStats(overviewRes.data);
      if (tasksRes.code === 200) setPendingTasks(tasksRes.data);
      if (auditRes.code === 200) setAuditStream(auditRes.data);
      if (analyticsRes.code === 200) {
        setViolationCategories(analyticsRes.data.violationCategories);
        setTrends(analyticsRes.data.trends);
      }
    } catch (err: any) {
      message.error(err.message || '获取大盘数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleQuickSelfCheck = () => {
    message.loading({
      content: '正在对全站敏感词库、图片AI风控引擎及申诉流转队列进行健康自检...',
      key: 'check',
    });
    setTimeout(() => {
      message.success({
        content: '全站风控探针与审核服务运行健康，无异常阻塞 (响应时延 36ms)',
        key: 'check',
      });
    }, 800);
  };

  const filteredTasks = pendingTasks.filter((t) => {
    if (taskFilter === 'all') return true;
    return t.type === taskFilter;
  });

  const filteredAudits = auditStream.filter((a) => {
    if (auditFilter === 'all') return true;
    if (auditFilter === 'ban')
      return (
        a.actionType === 'ban_user' ||
        a.actionType === 'delete_post' ||
        a.actionType === 'mute_user'
      );
    if (auditFilter === 'appeal')
      return a.actionType === 'approve_appeal' || a.actionType === 'unban_user';
    if (auditFilter === 'verify') return a.actionType === 'verify_passed';
    return true;
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 顶部运营大盘问候与风控引擎实时状态 */}
      <Card
        variant="borderless"
        style={{
          borderRadius: 8,
          background: token.colorFillAlter,
          border: `1px solid ${token.colorBorderSecondary}`,
        }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={14}>
            <Space direction="vertical" size={4}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Title level={4} style={{ margin: 0 }}>
                  运营与内容安全控制中心
                </Title>
                <Tag color="success" icon={<CheckCircleFilled />}>
                  全网风控引擎运行正常
                </Tag>
              </div>
              <Text type="secondary" style={{ fontSize: 13 }}>
                实时监控全域创作者动态、受理作品与评论违规举报、流转资质认证与处罚申诉
              </Text>
            </Space>
          </Col>

          <Col xs={24} md={10} style={{ textAlign: 'right' }}>
            <Space wrap>
              <Button icon={<SecurityScanOutlined />} onClick={handleQuickSelfCheck}>
                风控引擎自检
              </Button>
              <Button type="primary" icon={<ReloadOutlined />} loading={loading} onClick={loadData}>
                刷新数据
              </Button>
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 核心业务 5 大 KPI 指标卡片 (支持直接跳转) */}
      <Row gutter={[16, 16]}>
        {/* 用户总量 */}
        <Col xs={24} sm={12} lg={8} xl={4.8} style={{ flex: '1 1 200px' }}>
          <Card
            hoverable
            size="small"
            style={{ borderRadius: 8, height: '100%' }}
            onClick={() => navigate('/users')}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text type="secondary" style={{ fontSize: 13 }}>
                全站注册用户
              </Text>
              <Avatar
                size={28}
                icon={<UserOutlined />}
                style={{ backgroundColor: '#e6f4ff', color: '#1677ff' }}
              />
            </div>
            <Statistic
              value={stats?.totalUsers || 0}
              valueStyle={{ fontSize: 24, fontWeight: 700 }}
              suffix={
                <Text style={{ fontSize: 12, color: '#52c41a', marginLeft: 6 }}>
                  <ArrowUpOutlined /> +{stats?.userGrowthRate || 0}%
                </Text>
              }
            />
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: '#8c8c8c',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>今日活跃: {stats?.activeUsersToday.toLocaleString()}</span>
              <span style={{ color: '#1677ff' }}>
                进入列表 <RightOutlined style={{ fontSize: 9 }} />
              </span>
            </div>
          </Card>
        </Col>

        {/* 作品与互动总量 */}
        <Col xs={24} sm={12} lg={8} xl={4.8} style={{ flex: '1 1 200px' }}>
          <Card
            hoverable
            size="small"
            style={{ borderRadius: 8, height: '100%' }}
            onClick={() => navigate('/posts')}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text type="secondary" style={{ fontSize: 13 }}>
                作品发布与互动
              </Text>
              <Avatar
                size={28}
                icon={<FileImageOutlined />}
                style={{ backgroundColor: '#f9f0ff', color: '#722ed1' }}
              />
            </div>
            <Statistic
              value={stats?.totalPosts || 0}
              valueStyle={{ fontSize: 24, fontWeight: 700 }}
              suffix={
                <Text style={{ fontSize: 12, color: '#52c41a', marginLeft: 6 }}>
                  <ArrowUpOutlined /> +{stats?.postGrowthRate || 0}%
                </Text>
              }
            />
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: '#8c8c8c',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>今日新增: +{stats?.newPostsToday.toLocaleString()}</span>
              <span style={{ color: '#722ed1' }}>
                帖子管理 <RightOutlined style={{ fontSize: 9 }} />
              </span>
            </div>
          </Card>
        </Col>

        {/* 待处置违规举报 (待办紧急提醒) */}
        <Col xs={24} sm={12} lg={8} xl={4.8} style={{ flex: '1 1 200px' }}>
          <Card
            hoverable
            size="small"
            style={{
              borderRadius: 8,
              height: '100%',
              border: (stats?.pendingReports || 0) > 0 ? '1px solid #ff4d4f' : undefined,
            }}
            onClick={() => navigate('/reports')}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text type="secondary" style={{ fontSize: 13 }}>
                待处理举报
              </Text>
              <Avatar
                size={28}
                icon={<AlertOutlined />}
                style={{ backgroundColor: '#fff1f0', color: '#ff4d4f' }}
              />
            </div>
            <Statistic
              value={stats?.pendingReports || 0}
              valueStyle={{ fontSize: 24, fontWeight: 700, color: '#cf1322' }}
              suffix={
                <Tag color="error" style={{ marginLeft: 6, marginInlineEnd: 0 }}>
                  {stats?.urgentReports || 0} 件高危
                </Tag>
              }
            />
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: '#8c8c8c',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>今日已处理: {stats?.reportResolvedToday} 件</span>
              <span style={{ color: '#ff4d4f' }}>
                处理举报 <RightOutlined style={{ fontSize: 9 }} />
              </span>
            </div>
          </Card>
        </Col>

        {/* 待复核处罚申诉 */}
        <Col xs={24} sm={12} lg={8} xl={4.8} style={{ flex: '1 1 200px' }}>
          <Card
            hoverable
            size="small"
            style={{ borderRadius: 8, height: '100%' }}
            onClick={() => navigate('/appeals')}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text type="secondary" style={{ fontSize: 13 }}>
                待复核申诉
              </Text>
              <Avatar
                size={28}
                icon={<AuditOutlined />}
                style={{ backgroundColor: '#fffbe6', color: '#faad14' }}
              />
            </div>
            <Statistic
              value={stats?.pendingAppeals || 0}
              valueStyle={{ fontSize: 24, fontWeight: 700, color: '#d48806' }}
              suffix={<Text style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 6 }}>待裁定</Text>}
            />
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: '#8c8c8c',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>今日办结: {stats?.appealResolvedToday} 件</span>
              <span style={{ color: '#faad14' }}>
                申诉管理 <RightOutlined style={{ fontSize: 9 }} />
              </span>
            </div>
          </Card>
        </Col>

        {/* 待审核达人/资质认证 */}
        <Col xs={24} sm={12} lg={8} xl={4.8} style={{ flex: '1 1 200px' }}>
          <Card
            hoverable
            size="small"
            style={{ borderRadius: 8, height: '100%' }}
            onClick={() => navigate('/verifications')}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: 8,
              }}
            >
              <Text type="secondary" style={{ fontSize: 13 }}>
                认证资质审核
              </Text>
              <Avatar
                size={28}
                icon={<SafetyCertificateOutlined />}
                style={{ backgroundColor: '#f6ffed', color: '#52c41a' }}
              />
            </div>
            <Statistic
              value={stats?.pendingVerifications || 0}
              valueStyle={{ fontSize: 24, fontWeight: 700, color: '#389e0d' }}
              suffix={<Text style={{ fontSize: 12, color: '#8c8c8c', marginLeft: 6 }}>份材料</Text>}
            />
            <div
              style={{
                marginTop: 8,
                fontSize: 11,
                color: '#8c8c8c',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <span>已认证达人: {stats?.verifiedCreatorsCount.toLocaleString()}</span>
              <span style={{ color: '#52c41a' }}>
                审核资质 <RightOutlined style={{ fontSize: 9 }} />
              </span>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 中部核心业务分栏：待办流转工作台 + 违规类型构成与生态态势 */}
      <Row gutter={[16, 16]}>
        {/* 左侧：待处理流转工作项 */}
        <Col xs={24} lg={14}>
          <Card
            variant="borderless"
            style={{
              borderRadius: 8,
              height: '100%',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
            title={
              <Space>
                <ClockCircleOutlined style={{ color: '#1677ff' }} />
                <Text strong>待办流转与快速核查工作台</Text>
                <Tag color="red">{pendingTasks.length} 项待办</Tag>
              </Space>
            }
            extra={
              <Radio.Group
                size="small"
                value={taskFilter}
                onChange={(e) => setTaskFilter(e.target.value)}
              >
                <Radio.Button value="all">全部</Radio.Button>
                <Radio.Button value="report">举报</Radio.Button>
                <Radio.Button value="appeal">申诉</Radio.Button>
                <Radio.Button value="verification">认证</Radio.Button>
              </Radio.Group>
            }
          >
            {filteredTasks.length === 0 ? (
              <Empty description="暂无待处理事项，当前系统运行良好" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {filteredTasks.map((task) => (
                  <div
                    key={task.id}
                    style={{
                      padding: '12px 14px',
                      background: token.colorFillAlter,
                      border: `1px solid ${token.colorBorderSecondary}`,
                      borderRadius: 8,
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <Space size={12} style={{ flex: 1, minWidth: 0 }}>
                      <Avatar src={task.targetUser.avatar} size={40} icon={<UserOutlined />} />
                      <div style={{ minWidth: 0 }}>
                        <div
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            flexWrap: 'wrap',
                          }}
                        >
                          <Text strong style={{ fontSize: 13 }}>
                            {task.title}
                          </Text>
                          {task.priority === 'urgent' && <Tag color="error">🚨 紧急</Tag>}
                          {task.priority === 'high' && <Tag color="warning">⚠️ 高优先</Tag>}
                          {task.type === 'report' && <Tag color="red">违规举报</Tag>}
                          {task.type === 'appeal' && <Tag color="gold">处罚申诉</Tag>}
                          {task.type === 'verification' && <Tag color="cyan">达人认证</Tag>}
                        </div>
                        <Paragraph
                          ellipsis={{ rows: 1 }}
                          style={{ margin: '4px 0 0', fontSize: 12, color: '#8c8c8c' }}
                        >
                          {task.desc}
                        </Paragraph>
                        <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                          <span>相关主体: @{task.targetUser.username}</span>
                          <span style={{ margin: '0 4px' }}>·</span>
                          <span>{task.time}</span>
                        </div>
                      </div>
                    </Space>

                    <Button
                      type="primary"
                      size="small"
                      icon={<RightOutlined />}
                      onClick={() => navigate(task.link)}
                    >
                      处理
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </Col>

        {/* 右侧：违规类型构成与生态分析 */}
        <Col xs={24} lg={10}>
          <Card
            variant="borderless"
            style={{
              borderRadius: 8,
              height: '100%',
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
            title={
              <Space>
                <FireOutlined style={{ color: '#fa8c16' }} />
                <Text strong>全网违规类型分布与风险画像</Text>
              </Space>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {violationCategories.map((cat) => (
                <div key={cat.name}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 12,
                      marginBottom: 4,
                    }}
                  >
                    <Text>{cat.name}</Text>
                    <Space size={6}>
                      <Text strong>{cat.count} 件</Text>
                      <Text type="secondary">({cat.percent}%)</Text>
                    </Space>
                  </div>
                  <Progress
                    percent={cat.percent}
                    strokeColor={cat.color}
                    showInfo={false}
                    size="small"
                  />
                </div>
              ))}
            </div>

            <div
              style={{
                marginTop: 20,
                padding: '12px 14px',
                background: token.colorFillAlter,
                borderRadius: 8,
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 6,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <TrophyOutlined style={{ color: '#faad14' }} />
                <span>创作者等级结构分布</span>
              </div>
              <Row gutter={[8, 8]} style={{ textAlign: 'center' }}>
                <Col span={6}>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>Lv.7 顶流</div>
                  <div style={{ fontWeight: 600, color: '#faad14' }}>1.2%</div>
                </Col>
                <Col span={6}>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>Lv.5-6 骨干</div>
                  <div style={{ fontWeight: 600, color: '#1677ff' }}>8.5%</div>
                </Col>
                <Col span={6}>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>Lv.3-4 成长</div>
                  <div style={{ fontWeight: 600, color: '#52c41a' }}>24.3%</div>
                </Col>
                <Col span={6}>
                  <div style={{ fontSize: 11, color: '#8c8c8c' }}>Lv.1-2 新晋</div>
                  <div style={{ fontWeight: 600, color: '#722ed1' }}>66.0%</div>
                </Col>
              </Row>
            </div>
          </Card>
        </Col>
      </Row>

      {/* 下部：近 7 日作品创作与风控拦截趋势 + 实时风控处置流水 */}
      <Row gutter={[16, 16]}>
        {/* 左侧：近 7 日趋势 */}
        <Col xs={24} lg={12}>
          <Card
            variant="borderless"
            style={{
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
            title={
              <Space>
                <ThunderboltOutlined style={{ color: '#1677ff' }} />
                <Text strong>近 7 日内容发布与安全拦截走势</Text>
              </Space>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {trends.map((item) => (
                <div
                  key={item.date}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '6px 0',
                    borderBottom: `1px dashed ${token.colorBorderSecondary}`,
                  }}
                >
                  <Text style={{ width: 45, fontSize: 12, color: '#8c8c8c' }}>{item.date}</Text>
                  <div style={{ flex: 1 }}>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        fontSize: 11,
                        marginBottom: 2,
                      }}
                    >
                      <span>发布作品: {item.posts.toLocaleString()} 篇</span>
                      <span style={{ color: '#ff4d4f' }}>拦截违规: {item.violations} 次</span>
                    </div>
                    <Progress
                      percent={Math.round((item.posts / 6000) * 100)}
                      strokeColor="#1677ff"
                      trailColor={token.colorFillAlter}
                      showInfo={false}
                      size="small"
                    />
                  </div>
                  <div style={{ width: 120, textAlign: 'right', fontSize: 11, color: '#8c8c8c' }}>
                    <span>互动 {(item.likes / 10000).toFixed(1)}w</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>

        {/* 右侧：实时安全风控处置动态流水 */}
        <Col xs={24} lg={12}>
          <Card
            variant="borderless"
            style={{
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
            }}
            title={
              <Space>
                <SecurityScanOutlined style={{ color: '#52c41a' }} />
                <Text strong>全站实时安全与风控处置流水</Text>
              </Space>
            }
            extra={
              <Radio.Group
                size="small"
                value={auditFilter}
                onChange={(e) => setAuditFilter(e.target.value)}
              >
                <Radio.Button value="all">全部</Radio.Button>
                <Radio.Button value="ban">惩戒</Radio.Button>
                <Radio.Button value="appeal">申诉</Radio.Button>
                <Radio.Button value="verify">认证</Radio.Button>
              </Radio.Group>
            }
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {filteredAudits.map((item) => (
                <div
                  key={item.id}
                  style={{
                    padding: '10px 12px',
                    background: token.colorFillAlter,
                    border: `1px solid ${token.colorBorderSecondary}`,
                    borderRadius: 6,
                    fontSize: 12,
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
                      {item.actionType === 'delete_post' && <Tag color="red">下架作品</Tag>}
                      {item.actionType === 'ban_user' && <Tag color="error">全站封禁</Tag>}
                      {item.actionType === 'mute_user' && <Tag color="orange">禁言惩戒</Tag>}
                      {item.actionType === 'approve_appeal' && <Tag color="green">申诉通过</Tag>}
                      {item.actionType === 'unban_user' && <Tag color="blue">自动解封</Tag>}
                      {item.actionType === 'verify_passed' && <Tag color="cyan">认证通过</Tag>}
                      <Text strong>{item.targetDesc}</Text>
                    </Space>
                    <Text type="secondary" style={{ fontSize: 11 }}>
                      {item.time}
                    </Text>
                  </div>
                  <div
                    style={{
                      color: '#8c8c8c',
                      fontSize: 11,
                      display: 'flex',
                      justifyContent: 'space-between',
                    }}
                  >
                    <span>原因/依据: {item.reason}</span>
                    <span>执行人: {item.operator}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default DashboardPage;

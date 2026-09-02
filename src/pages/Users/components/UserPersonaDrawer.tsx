import {
  BarChartOutlined,
  CrownOutlined,
  FireOutlined,
  ThunderboltOutlined,
  TrophyOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Card,
  Col,
  Descriptions,
  Divider,
  Drawer,
  Progress,
  Row,
  Space,
  Statistic,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import type { UserItem, UserPersona } from '@/types';

const { Text } = Typography;

interface UserPersonaDrawerProps {
  open: boolean;
  user: UserItem | null;
  onClose: () => void;
}

/**
 * 默认/根据用户信息智能派生画像数据
 */
const getDerivedPersona = (user: UserItem): UserPersona => {
  if (user.persona) return user.persona;

  const isHighFollower = (user.followerCount || user.fanCount || 0) > 100000;
  const isHighPost = (user.postCount || 0) > 100;
  const isBanned = user.status === 'banned' || user.status === 'muted';

  const creditScore = isBanned ? 480 : isHighFollower ? 820 : 710;
  const creatorLevel = isHighFollower ? 7 : isHighPost ? 5 : 3;

  return {
    creditScore,
    creatorLevel,
    tags: [
      {
        category: '价值定位',
        list: isHighFollower
          ? [
              { name: '头部顶流达人', color: 'gold', desc: '全平台粉丝影响力排名前 1%' },
              { name: '爆款制造机', color: 'volcano', desc: '月均诞生 10w+ 互动爆款作品' },
              { name: '高商业变现价值', color: 'orange', desc: '具备卓越的品牌商单带货转化能力' },
            ]
          : [
              { name: '潜力成长创作者', color: 'blue', desc: '处于活跃创作与粉丝快速增长期' },
              { name: '垂直领域深耕', color: 'cyan', desc: '专注垂直细分赛道内容产出' },
            ],
      },
      {
        category: '行为特征',
        list: [
          { name: '夜间高频活跃', color: 'purple', desc: '20:00 - 24:00 为作品发布与互动高峰期' },
          { name: '高粉丝黏性', color: 'magenta', desc: '粉丝复评与完播率高出大盘 35%' },
          {
            name: '积极参与官方活动',
            color: 'geekblue',
            desc: `已累计参与 ${user.activityCount} 场线上线下盛典`,
          },
        ],
      },
      {
        category: '风控合规',
        list: isBanned
          ? [
              { name: '重点风控监控', color: 'red', desc: '当前处于违规处罚限制周期' },
              { name: '历史违规 2 次', color: 'error', desc: '存在违规引流/违禁词历史记录' },
            ]
          : [
              { name: 'S级信用极好', color: 'green', desc: '信用分超过 92% 的平台创作者' },
              { name: '合规模范用户', color: 'success', desc: '近 180 天违规率 0%，系统免检' },
            ],
      },
    ],
    dimensions: [
      { subject: '内容质量', score: isHighFollower ? 96 : 82, fullMark: 100 },
      { subject: '粉丝互动度', score: isHighFollower ? 91 : 78, fullMark: 100 },
      { subject: '商业变现力', score: isHighFollower ? 94 : 65, fullMark: 100 },
      { subject: '活跃频次', score: 88, fullMark: 100 },
      { subject: '社区信用度', score: isBanned ? 45 : 98, fullMark: 100 },
      { subject: '破圈传播力', score: isHighFollower ? 90 : 70, fullMark: 100 },
    ],
    audience: {
      genderRatio: {
        male: user.gender === 'female' ? 38 : 58,
        female: user.gender === 'female' ? 62 : 42,
      },
      ageDistribution: [
        { range: '18-24 岁', percent: 45 },
        { range: '25-34 岁', percent: 38 },
        { range: '35-44 岁', percent: 12 },
        { range: '45 岁以上', percent: 5 },
      ],
      topRegions: [
        { region: '广东', percent: 28 },
        { region: '浙江', percent: 22 },
        { region: '北京', percent: 18 },
        { region: '江苏', percent: 14 },
        { region: '四川', percent: 10 },
      ],
      activePeakTime: '20:30 - 23:30 (晚间黄金档)',
    },
    metrics: {
      avgPlayFinishRate: isHighFollower ? 68.5 : 49.2,
      interactionRate: isHighFollower ? 9.2 : 5.8,
      commercialIndex: isHighFollower ? 92 : 64,
      estimatedAdQuote: isHighFollower ? '¥18,000 - ¥28,000 /条' : '¥2,500 - ¥5,000 /条',
      violationCount: isBanned ? 2 : 0,
    },
  };
};

export const UserPersonaDrawer: React.FC<UserPersonaDrawerProps> = ({ open, user, onClose }) => {
  const { token } = theme.useToken();
  if (!user) return null;

  const persona = getDerivedPersona(user);

  return (
    <Drawer
      title={
        <Space size={8}>
          <BarChartOutlined style={{ color: '#1677ff', fontSize: 18 }} />
          <span>用户大数据与 AI 全景画像</span>
          <Tag color="blue" style={{ marginLeft: 6, borderRadius: 10 }}>
            AI 智能分析
          </Tag>
        </Space>
      }
      placement="right"
      width={760}
      open={open}
      onClose={onClose}
      destroyOnClose
    >
      <div>
        {/* 顶部创作者名片与信用概览 */}
        <Card
          size="small"
          style={{
            background: 'linear-gradient(135deg, #0958d9 0%, #1677ff 60%, #69b1ff 100%)',
            color: '#fff',
            borderRadius: 12,
            marginBottom: 20,
            border: 'none',
          }}
        >
          <Row gutter={16} align="middle">
            <Col xs={24} sm={14}>
              <Space size={14} orientation="horizontal">
                <Avatar
                  src={user.avatar}
                  size={64}
                  icon={<UserOutlined />}
                  style={{ border: '2px solid rgba(255,255,255,0.8)' }}
                />
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Text strong style={{ fontSize: 18, color: '#fff' }}>
                      {user.nickname}
                    </Text>
                    <Tag
                      color="gold"
                      icon={<CrownOutlined />}
                      style={{
                        margin: 0,
                        fontWeight: 600,
                        borderRadius: 10,
                        background: '#faad14',
                        color: '#fff',
                        border: 'none',
                      }}
                    >
                      Lv.{persona.creatorLevel} 创作者
                    </Tag>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.85)', fontSize: 12 }}>
                      @{user.username} · UID: {user.uid}
                    </Text>
                  </div>
                  <div style={{ marginTop: 4 }}>
                    <Text style={{ color: 'rgba(255,255,255,0.75)', fontSize: 11 }}>
                      {user.bio || '暂无个性签名'}
                    </Text>
                  </div>
                </div>
              </Space>
            </Col>

            <Col xs={24} sm={10} style={{ textAlign: 'right' }}>
              <div
                style={{
                  display: 'inline-block',
                  textAlign: 'center',
                  background: 'rgba(255,255,255,0.15)',
                  padding: '10px 18px',
                  borderRadius: 10,
                }}
              >
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.85)' }}>社区信用分</div>
                <div style={{ fontSize: 28, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                  {persona.creditScore}
                </div>
                <Tag
                  color={persona.creditScore > 750 ? 'success' : 'warning'}
                  style={{ margin: '4px 0 0', border: 'none' }}
                >
                  {persona.creditScore > 800
                    ? '极佳 (S+)'
                    : persona.creditScore > 700
                      ? '良好 (A)'
                      : '一般 (B)'}
                </Tag>
              </div>
            </Col>
          </Row>
        </Card>

        {/* 关键商业与互动指标 */}
        <Row gutter={[12, 12]} style={{ marginBottom: 20 }}>
          <Col span={6}>
            <Card
              size="small"
              variant="borderless"
              style={{
                background: token.colorFillAlter,
                border: `1px solid ${token.colorBorderSecondary}`,
                textAlign: 'center',
                borderRadius: 8,
              }}
            >
              <Statistic
                title="预估平均完播率"
                value={persona.metrics.avgPlayFinishRate}
                suffix="%"
                valueStyle={{ color: '#52c41a', fontSize: 18, fontWeight: 600 }}
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
                textAlign: 'center',
                borderRadius: 8,
              }}
            >
              <Statistic
                title="互动转化指数"
                value={persona.metrics.interactionRate}
                suffix="%"
                valueStyle={{ color: '#1677ff', fontSize: 18, fontWeight: 600 }}
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
                textAlign: 'center',
                borderRadius: 8,
              }}
            >
              <Statistic
                title="商业化价值指数"
                value={persona.metrics.commercialIndex}
                valueStyle={{ color: '#fa8c16', fontSize: 18, fontWeight: 600 }}
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
                textAlign: 'center',
                borderRadius: 8,
              }}
            >
              <Statistic
                title="历史违规惩罚"
                value={persona.metrics.violationCount}
                suffix="次"
                valueStyle={{
                  color: persona.metrics.violationCount > 0 ? '#ff4d4f' : '#52c41a',
                  fontSize: 18,
                  fontWeight: 600,
                }}
              />
            </Card>
          </Col>
        </Row>

        {/* AI 多维画像标签体系 */}
        <Card
          size="small"
          title={
            <Space>
              <FireOutlined style={{ color: '#fa541c' }} />
              <span>AI 智能多维标签画像</span>
            </Space>
          }
          style={{ marginBottom: 20, borderRadius: 8 }}
        >
          {persona.tags.map((tagGroup) => (
            <div key={tagGroup.category} style={{ marginBottom: 12 }}>
              <Text strong style={{ fontSize: 13, marginRight: 12, color: '#595959' }}>
                {tagGroup.category}:
              </Text>
              <Space wrap size={6}>
                {tagGroup.list.map((tag) => (
                  <Tooltip key={tag.name} title={tag.desc}>
                    <Tag
                      color={tag.color}
                      style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, cursor: 'help' }}
                    >
                      {tag.name}
                    </Tag>
                  </Tooltip>
                ))}
              </Space>
            </div>
          ))}
        </Card>

        {/* 综合能力与维度评分 */}
        <Card
          size="small"
          title={
            <Space>
              <TrophyOutlined style={{ color: '#faad14' }} />
              <span>创作者六维能力大盘评估</span>
            </Space>
          }
          style={{ marginBottom: 20, borderRadius: 8 }}
        >
          <Row gutter={[16, 12]}>
            {persona.dimensions.map((dim) => (
              <Col span={12} key={dim.subject}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text style={{ fontSize: 12 }}>{dim.subject}</Text>
                  <Text strong style={{ fontSize: 12, color: '#1677ff' }}>
                    {dim.score} / {dim.fullMark}
                  </Text>
                </div>
                <Progress
                  percent={dim.score}
                  showInfo={false}
                  strokeColor={
                    dim.score >= 90 ? '#52c41a' : dim.score >= 75 ? '#1677ff' : '#faad14'
                  }
                  size="small"
                />
              </Col>
            ))}
          </Row>
        </Card>

        {/* 粉丝受众人口属性分布 */}
        <Card
          size="small"
          title={
            <Space>
              <UserOutlined style={{ color: '#13c2c2' }} />
              <span>粉丝受众画像分布</span>
            </Space>
          }
          style={{ marginBottom: 20, borderRadius: 8 }}
        >
          <Row gutter={24}>
            {/* 性别比例 */}
            <Col span={12}>
              <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                受众性别构成
              </Text>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 12, color: '#1677ff', width: 60 }}>
                  男 {persona.audience.genderRatio.male}%
                </span>
                <div style={{ flex: 1 }}>
                  <Progress
                    percent={persona.audience.genderRatio.male}
                    success={{ percent: 0 }}
                    strokeColor="#1677ff"
                    trailColor="#eb2f96"
                    showInfo={false}
                    size="small"
                  />
                </div>
                <span style={{ fontSize: 12, color: '#eb2f96', width: 60, textAlign: 'right' }}>
                  女 {persona.audience.genderRatio.female}%
                </span>
              </div>

              <div style={{ marginTop: 16 }}>
                <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 6 }}>
                  粉丝活跃黄金时段
                </Text>
                <Tag color="geekblue" style={{ fontSize: 12, padding: '2px 8px' }}>
                  {persona.audience.activePeakTime}
                </Tag>
              </div>
            </Col>

            {/* 年龄分布 */}
            <Col span={12}>
              <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
                年龄层受众占比
              </Text>
              {persona.audience.ageDistribution.map((age) => (
                <div key={age.range} style={{ marginBottom: 6 }}>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: 11,
                      marginBottom: 2,
                    }}
                  >
                    <span>{age.range}</span>
                    <span>{age.percent}%</span>
                  </div>
                  <Progress
                    percent={age.percent}
                    showInfo={false}
                    size="small"
                    strokeColor="#722ed1"
                  />
                </div>
              ))}
            </Col>
          </Row>

          <Divider style={{ margin: '14px 0' }} />

          {/* 核心地域分布 */}
          <div>
            <Text strong style={{ fontSize: 12, display: 'block', marginBottom: 8 }}>
              核心粉丝地域分布 TOP 5
            </Text>
            <Space wrap size={8}>
              {persona.audience.topRegions.map((reg, idx) => (
                <Tag
                  key={reg.region}
                  color={idx === 0 ? 'volcano' : idx === 1 ? 'orange' : 'default'}
                  style={{ borderRadius: 4 }}
                >
                  TOP {idx + 1} {reg.region} ({reg.percent}%)
                </Tag>
              ))}
            </Space>
          </div>
        </Card>

        {/* 商业合作与投产预估 */}
        <Card
          size="small"
          title={
            <Space>
              <ThunderboltOutlined style={{ color: '#722ed1' }} />
              <span>商业变现与商单合作评估</span>
            </Space>
          }
          style={{ borderRadius: 8 }}
        >
          <Descriptions size="small" column={2} bordered>
            <Descriptions.Item label="预估商单报价区间">
              <Text strong style={{ color: '#d4380d', fontSize: 13 }}>
                {persona.metrics.estimatedAdQuote}
              </Text>
            </Descriptions.Item>
            <Descriptions.Item label="商业契合赛道">
              <Space size={4}>
                <Tag color="blue">品牌种草</Tag>
                <Tag color="cyan">直播带货</Tag>
                <Tag color="gold">联名定制</Tag>
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="创作者合作等级" span={2}>
              <Badge
                status="processing"
                text={`Lv.${persona.creatorLevel} 官方认证签约创作者（优先推荐商单派发）`}
              />
            </Descriptions.Item>
          </Descriptions>
        </Card>
      </div>
    </Drawer>
  );
};

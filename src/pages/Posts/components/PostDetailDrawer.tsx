import {
  CalendarOutlined,
  CameraOutlined,
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  CompassOutlined,
  CustomerServiceOutlined,
  EnvironmentOutlined,
  ExclamationCircleFilled,
  EyeOutlined,
  HeartOutlined,
  MessageOutlined,
  PictureOutlined,
  SafetyCertificateOutlined,
  ShareAltOutlined,
  StarOutlined,
  TagOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Col,
  Divider,
  Drawer,
  Empty,
  Image,
  Row,
  Space,
  Statistic,
  Tag,
  Timeline,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useThemeStore } from '@/store/theme';
import type { PostItem, PostMediaItem } from '@/types';
import { formatDateTime } from '@/utils/time';

const { Title, Text, Paragraph } = Typography;

interface PostDetailDrawerProps {
  open: boolean;
  post: PostItem | null;
  onClose: () => void;
  onAuditClick?: (post: PostItem) => void;
}

export const PostDetailDrawer: React.FC<PostDetailDrawerProps> = ({
  open,
  post,
  onClose,
  onAuditClick,
}) => {
  const { token } = theme.useToken();
  const isDark = useThemeStore((state) => state.isDark);

  if (!post) return null;

  const type = post.postType || post.type || 'post';
  const status = post.status;
  const isVideo = type === 'video';
  const isWhimsy = type === 'whimsy';
  const isImageText = type === 'post' || type === 'image_text';

  const stats = post.statistics || {
    likeCount: post.likeCount || 0,
    commentCount: post.commentCount || 0,
    shareCount: post.shareCount || 0,
    favoriteCount: post.collectCount || 0,
    viewCount: (post.likeCount || 0) * 4,
  };

  const mediaList: PostMediaItem[] =
    post.mediaList && post.mediaList.length > 0
      ? post.mediaList
      : isVideo && (post.videoUrl || post.coverUrl)
        ? [
            {
              mediaType: 'video',
              url: post.videoUrl || '',
              coverUrl: post.coverUrl,
            },
          ]
        : (post.images || []).map((imgUrl) => ({
            mediaType: 'image',
            url: imgUrl,
          }));

  // 格式化秒数为时分秒
  const formatSeconds = (sec?: number) => {
    if (!sec) return '00:00';
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  return (
    <Drawer
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Space size={8}>
            <span style={{ fontSize: 16, fontWeight: 700 }}>作品全景画像与详情</span>
            <Tag color="blue" style={{ borderRadius: 10 }}>
              ID: {post.id}
            </Tag>
            {post.isTop && (
              <Tag color="gold" icon={<StarOutlined />}>
                精选置顶
              </Tag>
            )}
          </Space>
          {onAuditClick && status === 'pending' && (
            <Button
              type="primary"
              size="small"
              danger
              icon={<SafetyCertificateOutlined />}
              onClick={() => onAuditClick(post)}
            >
              立即审核处置
            </Button>
          )}
        </div>
      }
      placement="right"
      width={720}
      onClose={onClose}
      open={open}
      destroyOnClose
    >
      <div style={{ paddingBottom: 24 }}>
        {/* 审核违规告警条 */}
        {status === 'rejected' && (
          <Alert
            message="该作品当前处于【违规下架】管控状态"
            description={
              post.auditTasks && post.auditTasks.length > 0
                ? post.auditTasks[0].reason
                : '该作品因严重违反平台社区公约已被强制下架'
            }
            type="error"
            showIcon
            icon={<CloseCircleFilled />}
            style={{ marginBottom: 16 }}
          />
        )}

        {status === 'pending' && (
          <Alert
            message="作品处于【待人工复审】队列中"
            description="已通过自动化智能机审，正等待运营安全专员进行内容合规核查。"
            type="warning"
            showIcon
            icon={<ExclamationCircleFilled />}
            style={{ marginBottom: 16 }}
          />
        )}

        {/* 媒体预览区块 */}
        <Card
          size="small"
          title={
            <Space>
              {isVideo ? (
                <VideoCameraOutlined style={{ color: '#1677ff' }} />
              ) : isWhimsy ? (
                <CustomerServiceOutlined style={{ color: '#722ed1' }} />
              ) : (
                <PictureOutlined style={{ color: '#52c41a' }} />
              )}
              <span style={{ fontWeight: 600 }}>
                {isVideo
                  ? '短视频视听预览'
                  : isWhimsy
                    ? '奇思妙想艺术卡片'
                    : `图文多图画廊 (${mediaList.length} 张)`}
              </span>
            </Space>
          }
          style={{
            marginBottom: 16,
            background: isDark ? token.colorBgElevated : '#fafcff',
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {isVideo && mediaList[0] && (
            <div>
              {mediaList[0].url ? (
                <video
                  src={mediaList[0].url}
                  poster={mediaList[0].coverUrl || post.coverUrl}
                  controls
                  style={{
                    width: '100%',
                    maxHeight: 380,
                    borderRadius: 8,
                    backgroundColor: '#000000',
                  }}
                >
                  <track kind="captions" />
                </video>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px 0' }}>
                  <Image
                    src={mediaList[0].coverUrl || post.coverUrl}
                    style={{ maxHeight: 260, borderRadius: 8 }}
                  />
                </div>
              )}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: 8,
                  fontSize: 12,
                  color: isDark ? token.colorTextSecondary : '#8c8c8c',
                }}
              >
                <span>
                  时长: {formatSeconds(mediaList[0].duration)} | 分辨率:{' '}
                  {mediaList[0].width || 1080}×{mediaList[0].height || 1920}
                </span>
                <Tag color="blue">MP4 / H.264</Tag>
              </div>
            </div>
          )}

          {isImageText && (
            <div>
              {mediaList.length > 0 ? (
                <Image.PreviewGroup>
                  <Row gutter={[8, 8]}>
                    {mediaList.map((m, idx) => (
                      <Col
                        span={mediaList.length === 1 ? 24 : mediaList.length <= 4 ? 12 : 8}
                        key={m.id || idx}
                      >
                        <div
                          style={{
                            position: 'relative',
                            borderRadius: 6,
                            overflow: 'hidden',
                            backgroundColor: isDark ? '#141414' : '#f0f0f0',
                            aspectRatio: '1/1',
                          }}
                        >
                          <Image
                            src={m.url}
                            style={{
                              width: '100%',
                              height: '100%',
                              objectFit: 'cover',
                            }}
                          />
                        </div>
                      </Col>
                    ))}
                  </Row>
                </Image.PreviewGroup>
              ) : (
                <Empty description="暂无图文相册数据" />
              )}
            </div>
          )}

          {isWhimsy && (
            <div
              style={{
                padding: '24px 20px',
                borderRadius: 8,
                background: isDark
                  ? 'linear-gradient(135deg, #2b1d3a 0%, #1f2747 100%)'
                  : 'linear-gradient(135deg, #fdfbfb 0%, #ebedee 100%)',
                border: isDark ? '1px solid rgba(255,255,255,0.1)' : '1px solid #d9d9d9',
                textAlign: 'center',
              }}
            >
              <div style={{ fontSize: 24, marginBottom: 8 }}>✨</div>
              <Paragraph
                style={{
                  fontSize: 15,
                  fontWeight: 500,
                  lineHeight: 1.8,
                  marginBottom: 0,
                  fontStyle: 'italic',
                }}
              >
                “{post.content || post.title}”
              </Paragraph>
              <div style={{ marginTop: 12, fontSize: 12, color: token.colorTextSecondary }}>
                奇思妙想样式主题: {post.backgroundStyle || '默认星云'}
              </div>
            </div>
          )}
        </Card>

        {/* 标题与正文 */}
        <Card
          size="small"
          title={<span style={{ fontWeight: 600 }}>作品标题与详细文案</span>}
          style={{
            marginBottom: 16,
            background: isDark ? token.colorBgElevated : '#ffffff',
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Title level={5} style={{ marginTop: 0, marginBottom: 8 }}>
            {post.title}
          </Title>
          <Paragraph
            style={{
              fontSize: 13,
              lineHeight: 1.7,
              color: isDark ? token.colorText : '#434343',
              whiteSpace: 'pre-wrap',
            }}
          >
            {post.content || '未填写正文补充内容'}
          </Paragraph>

          {/* 话题标签 */}
          {post.topics && post.topics.length > 0 && (
            <div style={{ marginTop: 12 }}>
              <Space wrap size={[4, 6]}>
                {post.topics.map((t) => (
                  <Tag key={t} color="cyan" icon={<TagOutlined />}>
                    #{t}
                  </Tag>
                ))}
              </Space>
            </div>
          )}

          <Divider style={{ margin: '12px 0' }} />

          <Row gutter={[16, 8]}>
            <Col span={8}>
              <Space size={4} style={{ fontSize: 12, color: token.colorTextSecondary }}>
                <ClockCircleOutlined />
                <span>发布时间: {formatDateTime(post.createdAt ?? post.publishTime)}</span>
              </Space>
            </Col>
            <Col span={8}>
              <Space size={4} style={{ fontSize: 12, color: token.colorTextSecondary }}>
                <EnvironmentOutlined />
                <span>发布位置: {post.location || '未标记定位'}</span>
              </Space>
            </Col>
            <Col span={8}>
              <Space size={4} style={{ fontSize: 12, color: token.colorTextSecondary }}>
                <CompassOutlined />
                <span>IP 属地: {post.ipLocation || post.author.ipLocation || '未知'}</span>
              </Space>
            </Col>
          </Row>
        </Card>

        {/* 作者档案与发布信息 */}
        <Card
          size="small"
          title={<span style={{ fontWeight: 600 }}>创作者与发布者档案</span>}
          style={{
            marginBottom: 16,
            background: isDark ? token.colorBgElevated : '#ffffff',
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Avatar src={post.author.avatar} size={54} icon={<UserOutlined />} />
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 15, fontWeight: 700 }}>{post.author.nickname}</span>
                {post.author.verifyStatus === 'creator' && (
                  <Tag color="orange" style={{ borderRadius: 10, margin: 0, fontSize: 11 }}>
                    达人创作者
                  </Tag>
                )}
                {post.author.verifyStatus === 'enterprise' && (
                  <Tag color="blue" style={{ borderRadius: 10, margin: 0, fontSize: 11 }}>
                    企业官方
                  </Tag>
                )}
              </div>
              <div style={{ marginTop: 4, fontSize: 12, color: token.colorTextSecondary }}>
                展示号 UID: <Text code>{post.author.uid || post.author.userNo}</Text> | 用户名: @
                {post.author.username || 'user'}
              </div>
              {post.author.verifyLabel && (
                <div style={{ marginTop: 4, fontSize: 12, color: '#d46b08' }}>
                  认证头衔: {post.author.verifyLabel}
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* 关联活动或装备 */}
        {(post.currentActivity || (post.equipmentList && post.equipmentList.length > 0)) && (
          <Card
            size="small"
            title={<span style={{ fontWeight: 600 }}>关联装备与同城活动</span>}
            style={{
              marginBottom: 16,
              background: isDark ? token.colorBgElevated : '#ffffff',
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            {post.currentActivity && (
              <div style={{ marginBottom: 12 }}>
                <Alert
                  message={`正在参加活动：${post.currentActivity.title}`}
                  type="info"
                  showIcon
                  icon={<CalendarOutlined />}
                />
              </div>
            )}

            {post.equipmentList && post.equipmentList.length > 0 && (
              <Row gutter={[10, 10]}>
                {post.equipmentList.map((eq, i) => (
                  <Col span={12} key={eq.userEquipmentId || i}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: 8,
                        borderRadius: 6,
                        border: `1px solid ${token.colorBorderSecondary}`,
                        background: isDark ? token.colorFillAlter : '#fafafa',
                      }}
                    >
                      <Avatar
                        src={eq.pictureUrl}
                        shape="square"
                        size={40}
                        icon={<CameraOutlined />}
                      />
                      <div style={{ overflow: 'hidden' }}>
                        <div
                          style={{
                            fontWeight: 600,
                            fontSize: 12,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {eq.productName}
                        </div>
                        <div style={{ fontSize: 11, color: token.colorTextSecondary }}>
                          {eq.brandName} · {eq.categoryName}
                        </div>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            )}
          </Card>
        )}

        {/* 传播与互动数据指标 */}
        <Card
          size="small"
          title={<span style={{ fontWeight: 600 }}>数据指标与互动量分析</span>}
          style={{
            marginBottom: 16,
            background: isDark ? token.colorBgElevated : '#ffffff',
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={12} sm={8} md={4} style={{ flex: 1, minWidth: 120 }}>
              <Statistic
                title="浏览曝光次数"
                value={stats.viewCount}
                valueStyle={{ color: '#1677ff', fontSize: 18 }}
                prefix={<EyeOutlined />}
              />
            </Col>
            <Col xs={12} sm={8} md={4} style={{ flex: 1, minWidth: 120 }}>
              <Statistic
                title="累计获赞数"
                value={stats.likeCount}
                valueStyle={{ color: '#ff4d4f', fontSize: 18 }}
                prefix={<HeartOutlined />}
              />
            </Col>
            <Col xs={12} sm={8} md={4} style={{ flex: 1, minWidth: 120 }}>
              <Statistic
                title="评论互动量"
                value={stats.commentCount}
                valueStyle={{ color: '#fa8c16', fontSize: 18 }}
                prefix={<MessageOutlined />}
              />
            </Col>
            <Col xs={12} sm={8} md={4} style={{ flex: 1, minWidth: 120 }}>
              <Statistic
                title="用户收藏量"
                value={stats.favoriteCount}
                valueStyle={{ color: '#faad14', fontSize: 18 }}
                prefix={<StarOutlined />}
              />
            </Col>
            <Col xs={12} sm={8} md={4} style={{ flex: 1, minWidth: 120 }}>
              <Statistic
                title="转发分享量"
                value={stats.shareCount}
                valueStyle={{ color: '#722ed1', fontSize: 18 }}
                prefix={<ShareAltOutlined />}
              />
            </Col>
          </Row>
        </Card>

        {/* 内容安全审核流转记录 */}
        <Card
          size="small"
          title={<span style={{ fontWeight: 600 }}>内容安全合规与审核记录</span>}
          style={{
            background: isDark ? token.colorBgElevated : '#ffffff',
            border: `1px solid ${token.colorBorderSecondary}`,
          }}
        >
          {post.auditTasks && post.auditTasks.length > 0 ? (
            <Timeline
              style={{ marginTop: 12 }}
              items={post.auditTasks.map((task) => {
                const isPass = task.suggestion === 'pass';
                return {
                  color: isPass ? 'green' : 'red',
                  dot: isPass ? <CheckCircleFilled /> : <CloseCircleFilled />,
                  children: (
                    <div style={{ fontSize: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Tag color={task.auditMode === 'alicloud' ? 'cyan' : 'purple'}>
                          {task.auditMode === 'alicloud' ? '智能AI机审' : '人工运营复审'}
                        </Tag>
                        <Tag color={isPass ? 'success' : 'error'}>
                          {isPass ? '审核通过' : '审核驳回'}
                        </Tag>
                        {task.label && <Tag color="volcano">命中标签: {task.label}</Tag>}
                      </div>
                      <div style={{ marginTop: 4, color: isDark ? token.colorText : '#595959' }}>
                        {task.reason || (isPass ? '内容符合社区发布公约' : '不符合社区发布标准')}
                      </div>
                      <div style={{ marginTop: 2, color: token.colorTextSecondary, fontSize: 11 }}>
                        {formatDateTime(task.createdAt)} · 操作人: {task.operator || '系统质检'}
                      </div>
                    </div>
                  ),
                };
              })}
            />
          ) : (
            <div
              style={{ textAlign: 'center', padding: '16px 0', color: token.colorTextSecondary }}
            >
              暂无历史审核争议记录，发布时机审默认放行
            </div>
          )}
        </Card>
      </div>
    </Drawer>
  );
};

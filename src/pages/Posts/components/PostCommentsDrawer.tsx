import {
  DeleteOutlined,
  MessageOutlined,
  ReloadOutlined,
  StarFilled,
  StopOutlined,
  UserOutlined,
  VerticalAlignTopOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Button,
  Card,
  Divider,
  Drawer,
  Empty,
  Input,
  List,
  message,
  Popconfirm,
  Select,
  Space,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

import { deleteComment, getCommentList, updateCommentStatus } from '@/api/comment';
import { updateUserStatus } from '@/api/user';
import type { CommentItem, CommentStatus, PostItem } from '@/types';

const { Text, Paragraph } = Typography;

interface PostCommentsDrawerProps {
  open: boolean;
  post: PostItem | null;
  onClose: () => void;
  onCommentCountChange?: () => void;
}

export const PostCommentsDrawer: React.FC<PostCommentsDrawerProps> = ({
  open,
  post,
  onClose,
  onCommentCountChange,
}) => {
  const { token } = theme.useToken();
  const [loading, setLoading] = useState<boolean>(false);
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [filterKeyword, setFilterKeyword] = useState<string>('');
  const [filterStatus, setFilterStatus] = useState<CommentStatus | 'all'>('all');

  const fetchComments = useCallback(async () => {
    if (!post) return;
    setLoading(true);
    try {
      const res = await getCommentList({
        postId: post.id,
        keyword: filterKeyword,
        status: filterStatus,
        pageSize: 100,
      });
      if (res.code === 200) {
        setComments(res.data.list);
      }
    } catch {
      message.error('获取该作品评论列表失败');
    } finally {
      setLoading(false);
    }
  }, [post, filterKeyword, filterStatus]);

  useEffect(() => {
    if (open && post) {
      setFilterKeyword('');
      setFilterStatus('all');
      fetchComments();
    }
  }, [open, post, fetchComments]);

  // 更新评论状态 (置顶/隐藏/恢复)
  const handleStatusChange = async (item: CommentItem, newStatus: CommentStatus) => {
    try {
      const res = await updateCommentStatus(item.id, newStatus);
      if (res.code === 200) {
        message.success(res.message);
        fetchComments();
      }
    } catch {
      message.error('更新评论状态失败');
    }
  };

  // 删除评论
  const handleDeleteComment = async (item: CommentItem) => {
    try {
      const res = await deleteComment(item.id);
      if (res.code === 200) {
        message.success('评论已删除');
        fetchComments();
        onCommentCountChange?.();
      }
    } catch {
      message.error('删除评论失败');
    }
  };

  // 快捷禁言发评人
  const handleMuteUser = async (item: CommentItem) => {
    try {
      const res = await updateUserStatus(item.author.uid, 'muted');
      if (res.code === 200) {
        message.success(`已将用户【${item.author.nickname}】禁言`);
      }
    } catch {
      message.error('禁言操作失败');
    }
  };

  // 风险标签渲染
  const renderRiskTag = (risk: CommentItem['riskTag']) => {
    switch (risk) {
      case 'ad_suspect':
        return <Tag color="error">疑似引流广告</Tag>;
      case 'abuse':
        return <Tag color="magenta">攻击辱骂</Tag>;
      case 'spam':
        return <Tag color="warning">垃圾灌水</Tag>;
      default:
        return null;
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <MessageOutlined style={{ color: '#1677ff' }} />
          <span>作品专属评论互动管理</span>
        </Space>
      }
      placement="right"
      width={720}
      open={open}
      onClose={onClose}
      extra={
        <Tooltip title="刷新评论列表">
          <Button icon={<ReloadOutlined />} onClick={fetchComments} loading={loading} />
        </Tooltip>
      }
    >
      {post && (
        <div>
          {/* 作品信息摘要卡片 */}
          <Card
            size="small"
            style={{
              backgroundColor: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              marginBottom: 16,
              borderRadius: 8,
            }}
          >
            <div style={{ display: 'flex', gap: 12 }}>
              <img
                src={post.coverUrl}
                alt="封面"
                style={{
                  width: 80,
                  height: 80,
                  objectFit: 'cover',
                  borderRadius: 6,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1, minWidth: 0 }}>
                <Paragraph
                  ellipsis={{ rows: 2 }}
                  strong
                  style={{ margin: '0 0 4px 0', fontSize: 13 }}
                >
                  {post.title}
                </Paragraph>
                <Space size="middle" style={{ fontSize: 12, color: '#8c8c8c' }}>
                  <span>作者: {post.author.nickname}</span>
                  <span>获赞: {post.likeCount.toLocaleString()}</span>
                  <span>评论总数: {post.commentCount.toLocaleString()}</span>
                </Space>
              </div>
            </div>
          </Card>

          {/* 筛选与搜索工具条 */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              marginBottom: 16,
              gap: 12,
            }}
          >
            <Input.Search
              placeholder="搜索评论内容或评论人"
              allowClear
              value={filterKeyword}
              onChange={(e) => setFilterKeyword(e.target.value)}
              onSearch={fetchComments}
              style={{ width: 260 }}
            />

            <Space>
              <Select
                value={filterStatus}
                onChange={(val) => setFilterStatus(val)}
                style={{ width: 120 }}
                options={[
                  { label: '全部状态', value: 'all' },
                  { label: '正常展示', value: 'normal' },
                  { label: '作者置顶', value: 'top' },
                  { label: '违规隐藏', value: 'hidden' },
                ]}
              />
              <Button type="primary" size="middle" onClick={fetchComments}>
                筛选
              </Button>
            </Space>
          </div>

          <Divider style={{ margin: '12px 0' }} />

          {/* 评论列表 */}
          <List
            loading={loading}
            dataSource={comments}
            locale={{ emptyText: <Empty description="当前作品暂无匹配评论" /> }}
            renderItem={(item) => (
              <List.Item
                key={item.id}
                style={{
                  padding: '14px 8px',
                  backgroundColor: item.status === 'top' ? '#f6ffed' : 'transparent',
                  borderRadius: 6,
                  marginBottom: 8,
                  border: item.status === 'top' ? '1px solid #b7eb8f' : '1px solid #f0f0f0',
                }}
                actions={[
                  item.status === 'top' ? (
                    <Button
                      key="untop"
                      type="link"
                      size="small"
                      onClick={() => handleStatusChange(item, 'normal')}
                    >
                      取消置顶
                    </Button>
                  ) : (
                    <Button
                      key="top"
                      type="link"
                      size="small"
                      icon={<VerticalAlignTopOutlined />}
                      onClick={() => handleStatusChange(item, 'top')}
                    >
                      置顶
                    </Button>
                  ),
                  item.status === 'hidden' ? (
                    <Button
                      key="unhide"
                      type="link"
                      size="small"
                      style={{ color: '#52c41a' }}
                      onClick={() => handleStatusChange(item, 'normal')}
                    >
                      恢复展示
                    </Button>
                  ) : (
                    <Button
                      key="hide"
                      type="link"
                      size="small"
                      danger
                      onClick={() => handleStatusChange(item, 'hidden')}
                    >
                      隐藏
                    </Button>
                  ),
                  <Popconfirm
                    key="mute"
                    title="禁言确认"
                    description={`确定对用户【${item.author.nickname}】执行封禁/禁言吗？`}
                    onConfirm={() => handleMuteUser(item)}
                  >
                    <Button type="text" size="small" danger icon={<StopOutlined />}>
                      禁言
                    </Button>
                  </Popconfirm>,
                  <Popconfirm
                    key="del"
                    title="删除评论"
                    description="确定永久删除这条评论吗？"
                    onConfirm={() => handleDeleteComment(item)}
                  >
                    <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                  </Popconfirm>,
                ]}
              >
                <List.Item.Meta
                  avatar={<Avatar src={item.author.avatar} icon={<UserOutlined />} />}
                  title={
                    <Space size="small">
                      <Text strong style={{ fontSize: 13 }}>
                        {item.author.nickname}
                      </Text>
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        UID: {item.author.uid}
                      </Text>
                      {item.ipLocation && (
                        <Tag style={{ fontSize: 10, margin: 0, padding: '0 4px' }}>
                          IP: {item.ipLocation}
                        </Tag>
                      )}
                      {item.status === 'top' && (
                        <Tag color="green" icon={<StarFilled />} style={{ margin: 0 }}>
                          置顶
                        </Tag>
                      )}
                      {item.status === 'hidden' && (
                        <Tag color="red" style={{ margin: 0 }}>
                          已隐藏
                        </Tag>
                      )}
                      {renderRiskTag(item.riskTag)}
                    </Space>
                  }
                  description={
                    <div style={{ marginTop: 4 }}>
                      <Paragraph style={{ margin: '4px 0', fontSize: 13, color: '#262626' }}>
                        {item.content}
                      </Paragraph>
                      <Space size="middle" style={{ fontSize: 11, color: '#8c8c8c' }}>
                        <span>获赞 {item.likeCount}</span>
                        <span>回复 {item.replyCount}</span>
                        <span>{item.createTime}</span>
                      </Space>
                    </div>
                  }
                />
              </List.Item>
            )}
          />
        </div>
      )}
    </Drawer>
  );
};

export default PostCommentsDrawer;

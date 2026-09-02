import {
  CommentOutlined,
  DownloadOutlined,
  EyeOutlined,
  FileImageOutlined,
  LockOutlined,
  MoreOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SearchOutlined,
  StarFilled,
  StarOutlined,
  UnlockOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Dropdown,
  Form,
  Image,
  Input,
  Modal,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Table,
  Tag,
  Tooltip,
  Typography,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';

import {
  batchUpdatePostStatus,
  getPostList,
  togglePostTop,
  updatePostCommentPermission,
  updatePostStatus,
} from '@/api/post';
import type {
  CommentPermission,
  PostAuditStatus,
  PostItem,
  PostQueryParams,
  PostType,
} from '@/types';
import { exportToCsv } from '@/utils/export';
import { PostCommentsDrawer } from './components/PostCommentsDrawer';

const { Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

export const PostsPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [postList, setPostList] = useState<PostItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 评论抽屉状态
  const [commentDrawerOpen, setCommentDrawerOpen] = useState<boolean>(false);
  const [selectedPost, setSelectedPost] = useState<PostItem | null>(null);

  // 视频预览 Modal
  const [previewModalOpen, setPreviewModalOpen] = useState<boolean>(false);
  const [previewPost, setPreviewPost] = useState<PostItem | null>(null);

  const fetchData = useCallback(
    async (page?: number, size?: number) => {
      const targetPage = page ?? currentPage;
      const targetSize = size ?? pageSize;
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const params: PostQueryParams = {
          keyword: values.keyword,
          uid: values.uid,
          type: values.type,
          status: values.status,
          commentPermission: values.commentPermission,
          page: targetPage,
          pageSize: targetSize,
        };

        if (values.dateRange && values.dateRange.length === 2) {
          params.dateRange = [
            values.dateRange[0].format('YYYY-MM-DD'),
            values.dateRange[1].format('YYYY-MM-DD'),
          ];
        }

        const res = await getPostList(params);
        if (res.code === 200) {
          setPostList(res.data.list);
          setTotal(res.data.total);
          setCurrentPage(targetPage);
          setPageSize(targetSize);
        }
      } catch (err: any) {
        message.error(err.message || '获取帖子列表失败');
      } finally {
        setLoading(false);
      }
    },
    [currentPage, pageSize, form],
  );

  useEffect(() => {
    fetchData(1, pageSize);
  }, [fetchData, pageSize]);

  const handleSearch = () => {
    setCurrentPage(1);
    fetchData(1, pageSize);
  };

  const handleReset = () => {
    form.resetFields();
    setCurrentPage(1);
    fetchData(1, pageSize);
  };

  // 切换置顶
  const handleToggleTop = async (record: PostItem) => {
    try {
      const res = await togglePostTop(record.id);
      if (res.code === 200) {
        message.success(res.message);
        fetchData();
      }
    } catch {
      message.error('切换置顶失败');
    }
  };

  // 更新审核状态
  const handleStatusChange = async (record: PostItem, newStatus: PostAuditStatus) => {
    try {
      const res = await updatePostStatus(record.id, newStatus);
      if (res.code === 200) {
        message.success(res.message);
        fetchData();
      }
    } catch {
      message.error('更新状态失败');
    }
  };

  // 更新评论权限
  const handleCommentPermissionChange = async (record: PostItem, perm: CommentPermission) => {
    try {
      const res = await updatePostCommentPermission(record.id, perm);
      if (res.code === 200) {
        message.success(res.message);
        fetchData();
      }
    } catch {
      message.error('更新评论权限失败');
    }
  };

  // 批量更新状态
  const handleBatchStatus = async (status: PostAuditStatus) => {
    if (!selectedRowKeys.length) {
      message.warning('请先勾选需要操作的帖子');
      return;
    }
    try {
      const ids = selectedRowKeys as string[];
      const res = await batchUpdatePostStatus(ids, status);
      if (res.code === 200) {
        message.success(res.message);
        setSelectedRowKeys([]);
        fetchData();
      }
    } catch {
      message.error('批量更新失败');
    }
  };

  // 导出数据
  const handleExport = () => {
    setExportLoading(true);
    try {
      if (!postList.length) {
        message.warning('当前无数据可导出');
        return;
      }
      exportToCsv(
        [
          { title: '作品ID', key: 'id' },
          { title: '作品标题文案', key: 'title' },
          {
            title: '作品类型',
            key: 'type',
            render: (r) => (r.type === 'video' ? '短视频' : '图文动态'),
          },
          { title: '发布者昵称', key: 'author', render: (r) => r.author.nickname },
          { title: '发布者UID', key: 'author', render: (r) => r.author.uid },
          { title: '点赞数', key: 'likeCount' },
          { title: '评论数', key: 'commentCount' },
          { title: '转发分享数', key: 'shareCount' },
          { title: '收藏数', key: 'collectCount' },
          {
            title: '评论权限',
            key: 'commentPermission',
            render: (r) =>
              r.commentPermission === 'open'
                ? '全员开放'
                : r.commentPermission === 'fans_only'
                  ? '仅粉丝可评'
                  : '已关闭评论',
          },
          {
            title: '审核状态',
            key: 'status',
            render: (r) =>
              r.status === 'published'
                ? '公开展示'
                : r.status === 'auditing'
                  ? '审核中'
                  : r.status === 'banned'
                    ? '已下架'
                    : '仅自己可见',
          },
          { title: '发布时间', key: 'publishTime' },
        ],
        postList,
        '作品帖子管理数据列表',
      );
      message.success(`成功导出 ${postList.length} 条作品数据`);
    } catch (err: any) {
      message.error(err.message || '导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  const renderStatusBadge = (status: PostAuditStatus, isTop: boolean) => {
    let badge = <Badge status="default" text="未知" />;
    if (status === 'published') {
      badge = <Badge status="success" text={<Text type="success">公开展示</Text>} />;
    } else if (status === 'auditing') {
      badge = <Badge status="processing" text={<Text style={{ color: '#1677ff' }}>审核中</Text>} />;
    } else if (status === 'banned') {
      badge = <Badge status="error" text={<Text type="danger">违规下架</Text>} />;
    } else if (status === 'private') {
      badge = <Badge status="default" text={<Text type="secondary">私密动态</Text>} />;
    }

    return (
      <Space size={4}>
        {badge}
        {isTop && (
          <Tag
            color="gold"
            icon={<StarFilled />}
            style={{ fontSize: 10, margin: 0, padding: '0 4px' }}
          >
            置顶
          </Tag>
        )}
      </Space>
    );
  };

  const renderCommentPermissionTag = (perm: CommentPermission) => {
    switch (perm) {
      case 'open':
        return <Tag color="green">全员可评</Tag>;
      case 'fans_only':
        return <Tag color="blue">仅粉丝</Tag>;
      case 'closed':
        return <Tag color="red">关闭评论</Tag>;
      default:
        return <Tag>未知</Tag>;
    }
  };

  const columns: TableProps<PostItem>['columns'] = [
    {
      title: '作品ID',
      dataIndex: 'id',
      key: 'id',
      width: 150,
      render: (id: string) => (
        <Text code copyable={{ tooltips: ['复制作品ID', '已复制'] }} style={{ fontSize: 12 }}>
          {id}
        </Text>
      ),
    },
    {
      title: '作品内容与封面',
      key: 'content',
      width: 280,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
          <button
            type="button"
            aria-label="预览作品封面"
            style={{
              position: 'relative',
              width: 60,
              height: 60,
              flexShrink: 0,
              cursor: 'pointer',
              borderRadius: 6,
              overflow: 'hidden',
              border: 'none',
              padding: 0,
              background: 'transparent',
            }}
            onClick={() => {
              setPreviewPost(record);
              setPreviewModalOpen(true);
            }}
          >
            <img
              src={record.coverUrl}
              alt="封面"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            {record.type === 'video' ? (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(0,0,0,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontSize: 18,
                }}
              >
                <PlayCircleOutlined />
              </div>
            ) : (
              <div
                style={{
                  position: 'absolute',
                  right: 2,
                  bottom: 2,
                  background: 'rgba(0,0,0,0.5)',
                  color: '#fff',
                  fontSize: 10,
                  padding: '1px 3px',
                  borderRadius: 3,
                }}
              >
                图文
              </div>
            )}
          </button>

          <div style={{ flex: 1, minWidth: 0 }}>
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{ margin: 0, fontSize: 13, fontWeight: 500 }}
              title={record.title}
            >
              {record.title}
            </Paragraph>
            <div style={{ marginTop: 4 }}>
              {record.topics.slice(0, 2).map((t) => (
                <Tag key={t} style={{ fontSize: 10, padding: '0 4px', margin: '0 4px 0 0' }}>
                  #{t}
                </Tag>
              ))}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: '发布者',
      key: 'author',
      width: 170,
      render: (_, record) => (
        <Space size={8}>
          <Avatar src={record.author.avatar} size={36} icon={<UserOutlined />} />
          <div>
            <Text strong style={{ fontSize: 13, display: 'block' }}>
              {record.author.nickname}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              UID: {record.author.uid}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '类型',
      dataIndex: 'type',
      key: 'type',
      width: 100,
      render: (type: PostType) =>
        type === 'video' ? (
          <Tag icon={<VideoCameraOutlined />} color="purple">
            短视频
          </Tag>
        ) : (
          <Tag icon={<FileImageOutlined />} color="cyan">
            图文
          </Tag>
        ),
    },
    {
      title: '互动数据',
      key: 'interaction',
      width: 180,
      render: (_, record) => (
        <div style={{ fontSize: 12 }}>
          <div>
            <Text type="secondary">点赞: </Text>
            <Text strong>{record.likeCount.toLocaleString()}</Text>
          </div>
          <div>
            <Text type="secondary">评论: </Text>
            <Text strong style={{ color: '#1677ff' }}>
              {record.commentCount.toLocaleString()}
            </Text>
          </div>
          <div>
            <Text type="secondary">分享/收藏: </Text>
            <span>
              {record.shareCount} / {record.collectCount}
            </span>
          </div>
        </div>
      ),
    },
    {
      title: '评论权限',
      dataIndex: 'commentPermission',
      key: 'commentPermission',
      width: 110,
      render: (perm: CommentPermission) => renderCommentPermissionTag(perm),
    },
    {
      title: '状态',
      key: 'status',
      width: 130,
      render: (_, record) => renderStatusBadge(record.status, record.isTop),
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: 160,
      render: (time: string) => <Text style={{ fontSize: 12 }}>{time}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 200,
      render: (_, record) => {
        const moreMenus = [
          {
            key: 'preview',
            icon: <EyeOutlined />,
            label: '预览作品内容',
            onClick: () => {
              setPreviewPost(record);
              setPreviewModalOpen(true);
            },
          },
          {
            key: 'top',
            icon: record.isTop ? <StarOutlined /> : <StarFilled />,
            label: record.isTop ? '取消置顶' : '推荐置顶',
            onClick: () => handleToggleTop(record),
          },
          {
            type: 'divider' as const,
          },
          {
            key: 'perm-open',
            label: '允许全员评论',
            disabled: record.commentPermission === 'open',
            onClick: () => handleCommentPermissionChange(record, 'open'),
          },
          {
            key: 'perm-fans',
            label: '仅允许粉丝评论',
            disabled: record.commentPermission === 'fans_only',
            onClick: () => handleCommentPermissionChange(record, 'fans_only'),
          },
          {
            key: 'perm-close',
            label: '关闭该作品评论',
            disabled: record.commentPermission === 'closed',
            onClick: () => handleCommentPermissionChange(record, 'closed'),
          },
          {
            type: 'divider' as const,
          },
          {
            key: 'status-ban',
            icon: <LockOutlined />,
            label: '违规下架',
            danger: true,
            disabled: record.status === 'banned',
            onClick: () => handleStatusChange(record, 'banned'),
          },
          {
            key: 'status-restore',
            icon: <UnlockOutlined />,
            label: '恢复公开展示',
            disabled: record.status === 'published',
            onClick: () => handleStatusChange(record, 'published'),
          },
        ];

        return (
          <Space size="small">
            <Button
              type="primary"
              size="small"
              icon={<CommentOutlined />}
              onClick={() => {
                setSelectedPost(record);
                setCommentDrawerOpen(true);
              }}
            >
              管理评论
            </Button>

            {record.status === 'banned' ? (
              <Popconfirm
                title="恢复作品"
                description="确定恢复该作品公开展示吗？"
                onConfirm={() => handleStatusChange(record, 'published')}
              >
                <Button type="link" size="small" style={{ color: '#52c41a' }}>
                  恢复
                </Button>
              </Popconfirm>
            ) : (
              <Popconfirm
                title="下架作品"
                description="确定下架该违规作品吗？"
                onConfirm={() => handleStatusChange(record, 'banned')}
                okButtonProps={{ danger: true }}
              >
                <Button type="link" size="small" danger>
                  下架
                </Button>
              </Popconfirm>
            )}

            <Dropdown menu={{ items: moreMenus }} trigger={['click']} placement="bottomRight">
              <Button type="text" size="small" icon={<MoreOutlined />} />
            </Dropdown>
          </Space>
        );
      },
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 搜索表单 */}
      <Card
        variant="borderless"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          borderRadius: 8,
        }}
      >
        <Form
          form={form}
          layout="horizontal"
          onFinish={handleSearch}
          initialValues={{
            type: 'all',
            status: 'all',
            commentPermission: 'all',
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="作品搜索" name="keyword" style={{ marginBottom: 0 }}>
                <Input placeholder="输入标题文案 / #话题" allowClear />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={5}>
              <Form.Item label="发布者" name="uid" style={{ marginBottom: 0 }}>
                <Input placeholder="输入作者 UID / 昵称" allowClear />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={4}>
              <Form.Item label="作品类型" name="type" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部类型', value: 'all' },
                    { label: '短视频', value: 'video' },
                    { label: '图文动态', value: 'image_text' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={4}>
              <Form.Item label="审核状态" name="status" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部状态', value: 'all' },
                    { label: '公开展示', value: 'published' },
                    { label: '审核中', value: 'auditing' },
                    { label: '违规下架', value: 'banned' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={5}>
              <Form.Item label="评论权限" name="commentPermission" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部权限', value: 'all' },
                    { label: '全员可评', value: 'open' },
                    { label: '仅粉丝可评', value: 'fans_only' },
                    { label: '关闭评论', value: 'closed' },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} sm={12} md={10} lg={8}>
              <Form.Item label="发布日期" name="dateRange" style={{ marginBottom: 0 }}>
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={14} lg={16}>
              <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
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

      {/* 数据表格 */}
      <Card
        variant="borderless"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          borderRadius: 8,
        }}
        title={
          <Space>
            <span style={{ fontSize: 16, fontWeight: 600 }}>作品帖子数据列表</span>
            <Tag color="purple">共 {total} 部作品</Tag>
          </Space>
        }
        extra={
          <Space wrap>
            {selectedRowKeys.length > 0 && (
              <Space>
                <Text type="secondary">已选择 {selectedRowKeys.length} 项</Text>
                <Button size="small" onClick={() => handleBatchStatus('published')}>
                  批量恢复公开
                </Button>
                <Button size="small" danger onClick={() => handleBatchStatus('banned')}>
                  批量下架
                </Button>
              </Space>
            )}

            <Button icon={<DownloadOutlined />} onClick={handleExport} loading={exportLoading}>
              导出作品数据
            </Button>
            <Tooltip title="刷新列表">
              <Button icon={<ReloadOutlined />} onClick={() => fetchData()} loading={loading} />
            </Tooltip>
          </Space>
        }
      >
        <Table<PostItem>
          rowKey="id"
          columns={columns}
          dataSource={postList}
          loading={loading}
          scroll={{ x: 1300 }}
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
            showTotal: (allTotal) => `共 ${allTotal} 条作品记录`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
              fetchData(page, size);
            },
          }}
        />
      </Card>

      {/* 作品评论管理抽屉 */}
      <PostCommentsDrawer
        open={commentDrawerOpen}
        post={selectedPost}
        onClose={() => setCommentDrawerOpen(false)}
        onCommentCountChange={() => fetchData()}
      />

      {/* 媒体预览弹窗 */}
      <Modal
        title={previewPost?.title}
        open={previewModalOpen}
        footer={null}
        onCancel={() => setPreviewModalOpen(false)}
        width={680}
        destroyOnClose
      >
        {previewPost && (
          <div style={{ marginTop: 12 }}>
            {previewPost.type === 'video' ? (
              <div
                style={{
                  textAlign: 'center',
                  backgroundColor: '#000',
                  borderRadius: 8,
                  padding: 8,
                }}
              >
                <video
                  src={previewPost.videoUrl || 'https://www.w3schools.com/html/mov_bbb.mp4'}
                  controls
                  autoPlay
                  style={{ maxHeight: 420, maxWidth: '100%', borderRadius: 6 }}
                >
                  <track kind="captions" srcLang="zh" label="中文字幕" />
                </video>
              </div>
            ) : (
              <div style={{ display: 'flex', gap: 12, overflowX: 'auto', padding: 8 }}>
                {previewPost.images?.map((img) => (
                  <Image key={img} src={img} style={{ height: 260, borderRadius: 6 }} />
                ))}
              </div>
            )}
            <Paragraph style={{ marginTop: 16, color: '#595959', fontSize: 13 }}>
              {previewPost.title}
            </Paragraph>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PostsPage;

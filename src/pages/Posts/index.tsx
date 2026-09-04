import {
  AlertOutlined,
  CheckCircleOutlined,
  CommentOutlined,
  CustomerServiceOutlined,
  DeleteOutlined,
  DownloadOutlined,
  DownOutlined,
  EyeOutlined,
  HeartOutlined,
  MessageOutlined,
  PictureOutlined,
  PlayCircleOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  SearchOutlined,
  ShareAltOutlined,
  StarFilled,
  StarOutlined,
  StopOutlined,
  UnlockOutlined,
  UserOutlined,
  VideoCameraOutlined,
} from '@ant-design/icons';
import type { MenuProps, TableProps } from 'antd';
import {
  Alert,
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
  auditPost,
  batchUpdatePostStatus,
  deletePost,
  getPostList,
  getPostStatisticsSummary,
  togglePostTop,
  updatePostVisibility,
} from '@/api/post';
import { type ColumnOptionItem, useColumnSettings } from '@/components/ColumnSetting';
import { useThemeStore } from '@/store/theme';
import type {
  PostAuditActionParams,
  PostItem,
  PostQueryParams,
  PostStatisticsSummaryVO,
  PostStatus,
} from '@/types';
import { exportToCsv } from '@/utils/export';
import { formatDateTime } from '@/utils/time';
import { PostAuditModal } from './components/PostAuditModal';
import { PostCommentsDrawer } from './components/PostCommentsDrawer';
import { PostDetailDrawer } from './components/PostDetailDrawer';

const { Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// 列配置定义
const postColumnOptions: ColumnOptionItem[] = [
  { key: 'content', title: '作品内容与封面', required: true },
  { key: 'author', title: '发布作者' },
  { key: 'type', title: '作品形式与可见性' },
  { key: 'interaction', title: '互动数据 (获赞/评论/收藏/分享)' },
  { key: 'status', title: '合规与发布状态' },
  { key: 'publishTime', title: '发布时间' },
  { key: 'id', title: '作品编号 (ID)' },
  { key: 'action', title: '操作列', required: true },
];

export const PostsPage: React.FC = () => {
  const { token } = theme.useToken();
  const isDark = useThemeStore((state) => state.isDark);
  const { checkedKeys, ColumnSettingComponent } = useColumnSettings(
    'posts_table',
    postColumnOptions,
  );
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [postList, setPostList] = useState<PostItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 全局数据概览
  const [summary, setSummary] = useState<PostStatisticsSummaryVO>({
    totalCount: 0,
    todayNewCount: 0,
    pendingReviewCount: 0,
    rejectedCount: 0,
    totalInteractions: 0,
  });

  // 抽屉与弹窗状态
  const [detailDrawerVisible, setDetailDrawerVisible] = useState<boolean>(false);
  const [currentPost, setCurrentPost] = useState<PostItem | null>(null);
  const [commentsDrawerVisible, setCommentsDrawerVisible] = useState<boolean>(false);
  const [commentTargetPost, setCommentTargetPost] = useState<PostItem | null>(null);
  const [auditModalVisible, setAuditModalVisible] = useState<boolean>(false);
  const [auditTargetPost, setAuditTargetPost] = useState<PostItem | null>(null);

  // 防抖定时器引用
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, []);

  // 加载统计概览
  const fetchSummary = useCallback(async () => {
    try {
      const res = await getPostStatisticsSummary();
      if ((res.code === 200 || res.code === 0) && res.data) {
        setSummary(res.data);
      }
    } catch {
      // ignore
    }
  }, []);

  // 加载列表数据
  const fetchData = useCallback(
    async (page = 1, size = 10) => {
      setLoading(true);
      try {
        const formValues = form.getFieldsValue();
        const params: PostQueryParams = {
          keyword: formValues.keyword,
          userId: formValues.userId,
          userNo: formValues.userNo || formValues.uid,
          uid: formValues.uid || formValues.userNo,
          postType: formValues.postType,
          status: formValues.status,
          visibility: formValues.visibility,
          pageNo: page,
          pageSize: size,
        };

        if (formValues.dateRange && formValues.dateRange.length === 2) {
          params.dateRange = [
            formValues.dateRange[0].startOf('day').format('YYYY-MM-DD HH:mm:ss'),
            formValues.dateRange[1].endOf('day').format('YYYY-MM-DD HH:mm:ss'),
          ];
        }

        const res = await getPostList(params);
        if ((res.code === 200 || res.code === 0) && res.data) {
          setPostList(res.data.list);
          setTotal(res.data.total);
          setCurrentPage(page);
          setPageSize(size);
        }
      } catch (err: any) {
        message.error(err.message || '获取作品列表失败');
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

  // 表单变更防抖搜索
  const handleFormChange = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      fetchData(1, pageSize);
    }, 400);
  };

  // 重置筛选
  const handleReset = () => {
    form.resetFields();
    fetchData(1, pageSize);
  };

  // 置顶切换
  const handleToggleTop = async (record: PostItem) => {
    try {
      const res = await togglePostTop(record.id);
      if (res.code === 200 || res.code === 0) {
        message.success(res.message || (res.data?.isTop ? '已置顶推荐' : '已取消置顶'));
        setPostList((prev) =>
          prev.map((p) => (p.id === record.id ? { ...p, isTop: res.data?.isTop ?? !p.isTop } : p)),
        );
      }
    } catch (err: any) {
      message.error(err?.message || '操作失败');
    }
  };

  // 审核/违规处置
  const handleAuditConfirm = async (params: PostAuditActionParams) => {
    try {
      const res = await auditPost(params);
      if (res.code === 200 || res.code === 0) {
        message.success(res.message || '处置已执行生效');
        fetchData(currentPage, pageSize);
        fetchSummary();
      }
    } catch (err: any) {
      message.error(err?.message || '处置失败');
    }
  };

  // 单篇删除
  const handleDeletePost = async (id: string) => {
    try {
      const res = await deletePost(id);
      if (res.code === 200 || res.code === 0) {
        message.success('作品已彻底删除');
        fetchData(currentPage, pageSize);
        fetchSummary();
      }
    } catch (err: any) {
      message.error(err?.message || '删除失败');
    }
  };

  // 批量操作
  const handleBatchStatus = async (targetStatus: PostStatus) => {
    if (selectedRowKeys.length === 0) {
      message.warning('请先勾选需要批量操作的作品');
      return;
    }
    try {
      const ids = selectedRowKeys.map((k) => String(k));
      const res = await batchUpdatePostStatus(
        ids,
        targetStatus,
        targetStatus === 'rejected' ? '批量合规违规处置下架' : '批量放行通过',
      );
      if (res.code === 200 || res.code === 0) {
        message.success(res.message || `已成功批量处理 ${ids.length} 篇作品`);
        setSelectedRowKeys([]);
        fetchData(currentPage, pageSize);
        fetchSummary();
      }
    } catch (err: any) {
      message.error(err?.message || '批量操作失败');
    }
  };

  // 导出 CSV
  const handleExport = async () => {
    setExportLoading(true);
    try {
      const res = await getPostList({ pageSize: 1000 });
      if ((res.code === 200 || res.code === 0) && res.data?.list) {
        const exportCols = [
          { title: '作品ID', key: 'id' },
          { title: '作品标题', key: 'title' },
          { title: '作品类型', key: 'postType', render: (r: any) => r.postType || r.type },
          { title: '发布作者', key: 'author', render: (r: any) => r.author?.nickname || '' },
          {
            title: '作者UID',
            key: 'uid',
            render: (r: any) => r.author?.uid || r.author?.userNo || '',
          },
          { title: '状态', key: 'status' },
          { title: '是否置顶', key: 'isTop', render: (r: any) => (r.isTop ? '是' : '否') },
          {
            title: '点赞数',
            key: 'likeCount',
            render: (r: any) => r.statistics?.likeCount ?? r.likeCount ?? 0,
          },
          {
            title: '评论数',
            key: 'commentCount',
            render: (r: any) => r.statistics?.commentCount ?? r.commentCount ?? 0,
          },
          {
            title: '收藏数',
            key: 'favoriteCount',
            render: (r: any) => r.statistics?.favoriteCount ?? r.collectCount ?? 0,
          },
          {
            title: '分享数',
            key: 'shareCount',
            render: (r: any) => r.statistics?.shareCount ?? r.shareCount ?? 0,
          },
          {
            title: '发布时间',
            key: 'publishTime',
            render: (r: any) => formatDateTime(r.createdAt ?? r.publishTime),
          },
        ];
        exportToCsv(
          exportCols,
          res.data.list,
          `内容帖子数据报表_${new Date().toISOString().slice(0, 10)}`,
        );
        message.success('导出数据报表成功');
      }
    } catch (err: any) {
      message.error(err?.message || '导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  // 渲染操作列下拉多级菜单
  const renderActionMenu = (record: PostItem): MenuProps['items'] => {
    const isPending = record.status === 'pending' || (record.status as any) === 'auditing';
    const isRejected = record.status === 'rejected' || (record.status as any) === 'banned';

    return [
      {
        key: 'detail',
        label: '查看全景详情与多媒体',
        icon: <EyeOutlined style={{ color: '#1677ff' }} />,
        onClick: () => {
          setCurrentPost(record);
          setDetailDrawerVisible(true);
        },
      },
      {
        key: 'comments',
        label: `作品评论管理 (${record.statistics?.commentCount ?? record.commentCount ?? 0})`,
        icon: <CommentOutlined style={{ color: '#52c41a' }} />,
        onClick: () => {
          setCommentTargetPost(record);
          setCommentsDrawerVisible(true);
        },
      },
      { type: 'divider' },
      {
        key: 'audit-sub',
        label: '合规治理与审核',
        icon: <SafetyCertificateOutlined style={{ color: '#fa8c16' }} />,
        children: [
          ...(isPending
            ? [
                {
                  key: 'pass-quick',
                  label: '审核放行 (恢复公开展示)',
                  icon: <CheckCircleOutlined style={{ color: '#52c41a' }} />,
                  onClick: () => handleAuditConfirm({ postId: record.id, action: 'pass' }),
                },
              ]
            : []),
          {
            key: 'audit-modal',
            label: isRejected ? '重新复核放行' : '违规下架 / 审核驳回',
            icon: <StopOutlined style={{ color: '#ff4d4f' }} />,
            onClick: () => {
              setAuditTargetPost(record);
              setAuditModalVisible(true);
            },
          },
        ],
      },
      {
        key: 'visibility-sub',
        label: '可见范围管控',
        icon: <UnlockOutlined />,
        children: [
          {
            key: 'vis-public',
            label: '公开所有人可见 (public)',
            onClick: () =>
              updatePostVisibility(record.id, 'public').then(() =>
                fetchData(currentPage, pageSize),
              ),
          },
          {
            key: 'vis-friend',
            label: '仅好友互关可见 (friend)',
            onClick: () =>
              updatePostVisibility(record.id, 'friend').then(() =>
                fetchData(currentPage, pageSize),
              ),
          },
          {
            key: 'vis-private',
            label: '仅作者自己可见 (private)',
            onClick: () =>
              updatePostVisibility(record.id, 'private').then(() =>
                fetchData(currentPage, pageSize),
              ),
          },
        ],
      },
      {
        key: 'toggle-top',
        label: record.isTop ? '取消精选置顶' : '设为运营精选置顶',
        icon: record.isTop ? <StarFilled style={{ color: '#faad14' }} /> : <StarOutlined />,
        onClick: () => handleToggleTop(record),
      },
      { type: 'divider' },
      {
        key: 'delete',
        label: (
          <Popconfirm
            title="删除作品确认"
            description="确定要彻底删除该作品吗？删除后不可逆！"
            onConfirm={() => handleDeletePost(record.id)}
            okText="删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <span style={{ color: '#ff4d4f' }}>彻底删除作品</span>
          </Popconfirm>
        ),
        icon: <DeleteOutlined style={{ color: '#ff4d4f' }} />,
      },
    ];
  };

  // 表格列定义
  const columns: TableProps<PostItem>['columns'] = [
    {
      title: '作品内容与封面',
      dataIndex: 'content',
      key: 'content',
      width: 320,
      render: (_, record) => {
        const type = record.postType || record.type;
        const isVideo = type === 'video';
        const isWhimsy = type === 'whimsy';
        const media = record.mediaList?.[0];
        const cover = record.coverUrl || media?.coverUrl || media?.url;
        const durationSec = media?.duration;

        return (
          <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
            {/* 封面与形态徽标 */}
            <div
              style={{
                position: 'relative',
                width: 72,
                height: 72,
                flexShrink: 0,
                borderRadius: 6,
                overflow: 'hidden',
                backgroundColor: isDark ? '#1f1f1f' : '#f0f0f0',
                border: `1px solid ${token.colorBorderSecondary}`,
              }}
            >
              {cover ? (
                <Image
                  src={cover}
                  alt={record.title}
                  style={{ width: 72, height: 72, objectFit: 'cover' }}
                  preview={false}
                />
              ) : isWhimsy ? (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: isDark
                      ? 'linear-gradient(135deg, #2b1d3a, #1f2747)'
                      : 'linear-gradient(135deg, #fa709a, #fee140)',
                    color: '#ffffff',
                    fontWeight: 700,
                    fontSize: 20,
                  }}
                >
                  ✨
                </div>
              ) : (
                <div
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#8c8c8c',
                  }}
                >
                  无图
                </div>
              )}

              {/* 视频时长角标 */}
              {isVideo && (
                <div
                  style={{
                    position: 'absolute',
                    bottom: 2,
                    right: 2,
                    background: 'rgba(0,0,0,0.65)',
                    color: '#ffffff',
                    fontSize: 10,
                    padding: '1px 3px',
                    borderRadius: 3,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 2,
                  }}
                >
                  <PlayCircleOutlined />
                  <span>
                    {durationSec
                      ? `${Math.floor(durationSec / 60)}:${String(durationSec % 60).padStart(2, '0')}`
                      : '视频'}
                  </span>
                </div>
              )}

              {/* 多图张数角标 */}
              {!isVideo &&
                !isWhimsy &&
                (record.mediaList?.length || record.images?.length || 0) > 1 && (
                  <div
                    style={{
                      position: 'absolute',
                      top: 2,
                      right: 2,
                      background: 'rgba(0,0,0,0.6)',
                      color: '#ffffff',
                      fontSize: 10,
                      padding: '0 3px',
                      borderRadius: 3,
                    }}
                  >
                    {record.mediaList?.length || record.images?.length}图
                  </div>
                )}
            </div>

            {/* 标题与文案 */}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                {record.isTop && (
                  <Tag
                    color="gold"
                    style={{ margin: 0, padding: '0 4px', fontSize: 10, lineHeight: '16px' }}
                  >
                    置顶
                  </Tag>
                )}
                <Button
                  type="link"
                  style={{
                    padding: 0,
                    height: 'auto',
                    fontWeight: 600,
                    fontSize: 13,
                    color: isDark ? token.colorTextHeading : '#262626',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    maxWidth: 220,
                  }}
                  onClick={() => {
                    setCurrentPost(record);
                    setDetailDrawerVisible(true);
                  }}
                >
                  {record.title}
                </Button>
              </div>

              <Paragraph
                ellipsis={{ rows: 2 }}
                style={{
                  fontSize: 12,
                  color: isDark ? token.colorTextSecondary : '#595959',
                  marginBottom: 4,
                  lineHeight: 1.5,
                }}
              >
                {record.content || '暂无正文描述'}
              </Paragraph>

              {/* 话题标签 */}
              {record.topics && record.topics.length > 0 && (
                <Space wrap size={[2, 2]}>
                  {record.topics.slice(0, 3).map((t) => (
                    <Tag
                      key={t}
                      style={{
                        margin: 0,
                        fontSize: 10,
                        padding: '0 3px',
                        lineHeight: '16px',
                        borderRadius: 2,
                      }}
                    >
                      #{t}
                    </Tag>
                  ))}
                </Space>
              )}
            </div>
          </div>
        );
      },
    },
    {
      title: '发布作者',
      dataIndex: 'author',
      key: 'author',
      width: 170,
      render: (_, record) => {
        const author = record.author;
        return (
          <Space size={8} align="center">
            <Avatar src={author.avatar} size={36} icon={<UserOutlined />} />
            <div style={{ lineHeight: 1.3 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  color: isDark ? token.colorText : '#262626',
                }}
              >
                {author.nickname}
              </div>
              <div style={{ fontSize: 11, color: token.colorTextSecondary }}>
                UID: {author.uid || author.userNo}
              </div>
              {author.verifyStatus === 'creator' && (
                <Tag
                  color="orange"
                  style={{
                    margin: 0,
                    fontSize: 10,
                    padding: '0 3px',
                    lineHeight: '14px',
                    borderRadius: 6,
                  }}
                >
                  创作者
                </Tag>
              )}
            </div>
          </Space>
        );
      },
    },
    {
      title: '作品形式与可见性',
      key: 'type',
      width: 140,
      render: (_, record) => {
        const type = record.postType || record.type;
        const vis = record.visibility || 'public';
        return (
          <Space direction="vertical" size={4}>
            {type === 'video' && (
              <Tag color="blue" icon={<VideoCameraOutlined />} style={{ margin: 0 }}>
                短视频
              </Tag>
            )}
            {(type === 'post' || type === 'image_text') && (
              <Tag color="green" icon={<PictureOutlined />} style={{ margin: 0 }}>
                图文相册
              </Tag>
            )}
            {type === 'whimsy' && (
              <Tag color="purple" icon={<CustomerServiceOutlined />} style={{ margin: 0 }}>
                奇思妙想
              </Tag>
            )}

            <span style={{ fontSize: 11, color: token.colorTextSecondary }}>
              {vis === 'public'
                ? '🌐 所有人可见'
                : vis === 'friend'
                  ? '👥 仅互关好友'
                  : '🔒 仅作者可见'}
            </span>
          </Space>
        );
      },
    },
    {
      title: '互动数据指标',
      key: 'interaction',
      width: 150,
      render: (_, record) => {
        const stats = record.statistics || {
          likeCount: record.likeCount || 0,
          commentCount: record.commentCount || 0,
          shareCount: record.shareCount || 0,
          favoriteCount: record.collectCount || 0,
        };
        return (
          <div style={{ fontSize: 12, lineHeight: 1.6, color: token.colorTextSecondary }}>
            <div>
              <HeartOutlined style={{ color: '#ff4d4f', marginRight: 4 }} />
              获赞: <Text strong>{stats.likeCount.toLocaleString()}</Text>
            </div>
            <div>
              <MessageOutlined style={{ color: '#1677ff', marginRight: 4 }} />
              评论: {stats.commentCount.toLocaleString()}
            </div>
            <div>
              <StarOutlined style={{ color: '#faad14', marginRight: 4 }} />
              收藏: {stats.favoriteCount.toLocaleString()}
            </div>
            <div>
              <ShareAltOutlined style={{ color: '#722ed1', marginRight: 4 }} />
              分享: {stats.shareCount.toLocaleString()}
            </div>
          </div>
        );
      },
    },
    {
      title: '合规与发布状态',
      key: 'status',
      width: 130,
      render: (_, record) => {
        const isPending = record.status === 'pending' || (record.status as any) === 'auditing';
        const isRejected = record.status === 'rejected' || (record.status as any) === 'banned';
        const isPublished = record.status === 'published';

        if (isPublished) {
          return <Badge status="success" text="正常公开" />;
        }
        if (isPending) {
          return <Badge status="warning" text="待人工复审" />;
        }
        if (isRejected) {
          const reason = record.auditTasks?.[0]?.reason || '违反社区公约';
          return (
            <Tooltip title={`违规原因: ${reason}`}>
              <Badge
                status="error"
                text={<span style={{ color: '#ff4d4f', cursor: 'pointer' }}>违规已下架</span>}
              />
            </Tooltip>
          );
        }
        return <Badge status="default" text={record.status} />;
      },
    },
    {
      title: '发布时间',
      dataIndex: 'publishTime',
      key: 'publishTime',
      width: 160,
      render: (_, record) => {
        const time = formatDateTime(record.createdAt ?? record.publishTime);
        return <span style={{ fontSize: 12, color: token.colorTextSecondary }}>{time}</span>;
      },
    },
    {
      title: '作品ID',
      dataIndex: 'id',
      key: 'id',
      width: 170,
      render: (id) => (
        <Text copyable style={{ fontSize: 11 }}>
          {id}
        </Text>
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 130,
      fixed: 'right',
      render: (_, record) => {
        return (
          <Dropdown
            menu={{ items: renderActionMenu(record) }}
            trigger={['click']}
            placement="bottomRight"
            getPopupContainer={() => document.body}
          >
            <Button
              type="link"
              size="small"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 4,
                fontWeight: 600,
                color: '#1677ff',
                padding: '2px 8px',
                borderRadius: 4,
              }}
            >
              <span>管理</span>
              <DownOutlined style={{ fontSize: 10 }} />
            </Button>
          </Dropdown>
        );
      },
    },
  ];

  // 过滤显示列
  const visibleColumns = columns.filter((col) => {
    if (col.key === 'content' || col.key === 'action') return true;
    return checkedKeys.includes(col.key as string);
  });

  return (
    <div style={{ padding: '0 4px' }}>
      {/* 顶部指标统计看板 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
        <Col xs={24} sm={12} md={8} lg={4} xl={4}>
          <Card
            size="small"
            style={{
              background: isDark ? token.colorBgContainer : '#ffffff',
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 8,
            }}
          >
            <Statistic
              title="作品收录总量"
              value={summary.totalCount}
              valueStyle={{ color: '#1677ff', fontWeight: 700 }}
              prefix={<PictureOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          <Card
            size="small"
            style={{
              background: isDark ? token.colorBgContainer : '#ffffff',
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 8,
            }}
          >
            <Statistic
              title="今日新增发布"
              value={summary.todayNewCount}
              valueStyle={{ color: '#52c41a', fontWeight: 700 }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          <Card
            size="small"
            style={{
              background: isDark ? token.colorBgContainer : '#ffffff',
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 8,
            }}
          >
            <Statistic
              title="待人工复审"
              value={summary.pendingReviewCount}
              valueStyle={{ color: '#fa8c16', fontWeight: 700 }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          <Card
            size="small"
            style={{
              background: isDark ? token.colorBgContainer : '#ffffff',
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 8,
            }}
          >
            <Statistic
              title="违规已下架"
              value={summary.rejectedCount}
              valueStyle={{ color: '#ff4d4f', fontWeight: 700 }}
              prefix={<StopOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={5} xl={5}>
          <Card
            size="small"
            style={{
              background: isDark ? token.colorBgContainer : '#ffffff',
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 8,
            }}
          >
            <Statistic
              title="累计互动总量"
              value={summary.totalInteractions}
              valueStyle={{ color: '#722ed1', fontWeight: 700 }}
              prefix={<HeartOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索与过滤表单 */}
      <Card
        size="small"
        style={{
          marginBottom: 16,
          background: isDark ? token.colorBgContainer : '#ffffff',
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 8,
        }}
      >
        <Form form={form} layout="vertical" onValuesChange={handleFormChange}>
          <Row gutter={[16, 0]}>
            <Col xs={24} sm={12} md={6} lg={5}>
              <Form.Item label="作品关键词" name="keyword">
                <Input
                  placeholder="输入标题 / 正文 / 话题"
                  allowClear
                  prefix={<SearchOutlined />}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item label="作者 UID / 昵称" name="uid">
                <Input placeholder="输入作者 UID 或昵称" allowClear prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item label="作品形式" name="postType" initialValue="all">
                <Select
                  options={[
                    { label: '全部形式', value: 'all' },
                    { label: '🎥 短视频 (video)', value: 'video' },
                    { label: '🖼️ 图文帖子 (post)', value: 'post' },
                    { label: '✨ 奇思妙想 (whimsy)', value: 'whimsy' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item label="合规管控状态" name="status" initialValue="all">
                <Select
                  options={[
                    { label: '全部状态', value: 'all' },
                    { label: '🟢 正常已发布', value: 'published' },
                    { label: '🟠 待人工审核', value: 'pending' },
                    { label: '🔴 违规已下架', value: 'rejected' },
                    { label: '⚪ 草稿状态', value: 'draft' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item label="可见范围" name="visibility" initialValue="all">
                <Select
                  options={[
                    { label: '全部范围', value: 'all' },
                    { label: '公开可见 (public)', value: 'public' },
                    { label: '仅好友互关 (friend)', value: 'friend' },
                    { label: '仅作者可见 (private)', value: 'private' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={8} lg={5}>
              <Form.Item label="发布时间范围" name="dateRange">
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row justify="space-between" align="middle">
            <Col>
              <Space>
                <Button
                  type="primary"
                  icon={<SearchOutlined />}
                  onClick={() => fetchData(1, pageSize)}
                >
                  查询
                </Button>
                <Button icon={<ReloadOutlined />} onClick={handleReset}>
                  重置
                </Button>
              </Space>
            </Col>
            <Col>
              <Space>
                {ColumnSettingComponent}
                <Button icon={<DownloadOutlined />} loading={exportLoading} onClick={handleExport}>
                  导出数据 (CSV)
                </Button>
              </Space>
            </Col>
          </Row>
        </Form>
      </Card>

      {/* 批量操作工具条 */}
      {selectedRowKeys.length > 0 && (
        <Alert
          style={{ marginBottom: 12, borderRadius: 6 }}
          type="info"
          showIcon
          message={
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                width: '100%',
              }}
            >
              <span>
                已选择 <Text strong>{selectedRowKeys.length}</Text> 篇作品
              </span>
              <Space size={8}>
                <Button size="small" type="primary" onClick={() => handleBatchStatus('published')}>
                  批量审核通过
                </Button>
                <Button size="small" danger onClick={() => handleBatchStatus('rejected')}>
                  批量违规下架
                </Button>
                <Button size="small" onClick={() => setSelectedRowKeys([])}>
                  取消选择
                </Button>
              </Space>
            </div>
          }
        />
      )}

      {/* 数据表格 */}
      <Card
        size="small"
        style={{
          background: isDark ? token.colorBgContainer : '#ffffff',
          border: `1px solid ${token.colorBorderSecondary}`,
          borderRadius: 8,
        }}
      >
        <Table<PostItem>
          rowKey="id"
          columns={visibleColumns}
          dataSource={postList}
          loading={loading}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showTotal: (t) => `共 ${t} 篇作品`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50'],
            onChange: (p, s) => fetchData(p, s),
          }}
          rowSelection={{
            selectedRowKeys,
            onChange: (keys) => setSelectedRowKeys(keys),
          }}
          scroll={{ x: 1200 }}
        />
      </Card>

      {/* 帖子全景详情抽屉 */}
      <PostDetailDrawer
        open={detailDrawerVisible}
        post={currentPost}
        onClose={() => setDetailDrawerVisible(false)}
        onAuditClick={(post) => {
          setAuditTargetPost(post);
          setAuditModalVisible(true);
        }}
      />

      {/* 评论管理抽屉 */}
      <PostCommentsDrawer
        open={commentsDrawerVisible}
        post={commentTargetPost}
        onClose={() => setCommentsDrawerVisible(false)}
      />

      {/* 审核与违规处置弹窗 */}
      <PostAuditModal
        open={auditModalVisible}
        post={auditTargetPost}
        onCancel={() => setAuditModalVisible(false)}
        onConfirm={handleAuditConfirm}
      />
    </div>
  );
};

export default PostsPage;

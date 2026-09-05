import {
  DownloadOutlined,
  EyeInvisibleOutlined,
  EyeOutlined,
  ReloadOutlined,
  SearchOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  DatePicker,
  Form,
  Input,
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
  batchDeleteComments,
  batchUpdateCommentStatus,
  deleteComment,
  getCommentList,
  updateCommentStatus,
} from '@/api/comment';
import { updateUserStatus } from '@/api/user';
import { type ColumnOptionItem, useColumnSettings } from '@/components/ColumnSetting';
import type { CommentItem, CommentQueryParams, CommentRiskTag, CommentStatus } from '@/types';
import { exportToCsv } from '@/utils/export';

const { Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

const commentColumnOptions: ColumnOptionItem[] = [
  { key: 'user', title: '发评人信息 (头像/昵称/账号)', required: true },
  { key: 'content', title: '评论内容与互动数', required: true },
  { key: 'post', title: '所属作品信息' },
  { key: 'status', title: '评论审核状态' },
  { key: 'riskTags', title: 'AI 风险识别标签' },
  { key: 'createTime', title: '发表时间' },
  { key: 'action', title: '操作列', required: true },
];

export const CommentsPage: React.FC = () => {
  const { checkedKeys, ColumnSettingComponent } = useColumnSettings(
    'comments_table',
    commentColumnOptions,
  );
  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [commentList, setCommentList] = useState<CommentItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  const fetchData = useCallback(
    async (page = 1, size = 10) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        const params: CommentQueryParams = {
          keyword: values.keyword,
          userNo: values.uid,
          uid: values.uid,
          postId: values.postId,
          status: values.status,
          riskTag: values.riskTag,
          page,
          pageSize: size,
        };

        if (values.dateRange && values.dateRange.length === 2) {
          params.dateRange = [
            values.dateRange[0].format('YYYY-MM-DD'),
            values.dateRange[1].format('YYYY-MM-DD'),
          ];
        }

        const res = await getCommentList(params);
        if (res.code === 200) {
          setCommentList(res.data.list);
          setTotal(res.data.total);
          setCurrentPage(page);
          setPageSize(size);
        }
      } catch (err: any) {
        message.error(err.message || '获取评论列表失败');
      } finally {
        setLoading(false);
      }
    },
    [form],
  );

  useEffect(() => {
    fetchData(1, 10);
  }, [fetchData]);

  const handleSearch = () => {
    fetchData(1, pageSize);
  };

  const handleReset = () => {
    form.resetFields();
    fetchData(1, pageSize);
  };

  // 修改单条状态
  const handleStatusChange = async (record: CommentItem, newStatus: CommentStatus) => {
    try {
      const res = await updateCommentStatus(record.id, newStatus);
      if (res.code === 200) {
        message.success(res.message);
        fetchData();
      }
    } catch {
      message.error('更新评论状态失败');
    }
  };

  // 删除单条评论
  const handleDelete = async (record: CommentItem) => {
    try {
      const res = await deleteComment(record.id);
      if (res.code === 200) {
        message.success(res.message);
        fetchData();
      }
    } catch {
      message.error('删除评论失败');
    }
  };

  // 快捷禁言
  const handleMuteUser = async (record: CommentItem) => {
    try {
      const targetUserId = record.author.userId || record.author.userNo || record.author.uid;
      const res = await updateUserStatus(targetUserId, 'muted');
      if (res.code === 200) {
        message.success(`已将用户【${record.author.nickname}】禁言`);
      }
    } catch {
      message.error('禁言失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (!selectedRowKeys.length) {
      message.warning('请先勾选要删除的评论');
      return;
    }
    try {
      const ids = selectedRowKeys as string[];
      const res = await batchDeleteComments(ids);
      if (res.code === 200) {
        message.success(res.message);
        setSelectedRowKeys([]);
        fetchData();
      }
    } catch {
      message.error('批量删除失败');
    }
  };

  // 批量隐藏
  const handleBatchStatus = async (status: CommentStatus) => {
    if (!selectedRowKeys.length) {
      message.warning('请先勾选要操作的评论');
      return;
    }
    try {
      const ids = selectedRowKeys as string[];
      const res = await batchUpdateCommentStatus(ids, status);
      if (res.code === 200) {
        message.success(res.message);
        setSelectedRowKeys([]);
        fetchData();
      }
    } catch {
      message.error('批量操作失败');
    }
  };

  // 导出数据
  const handleExport = () => {
    setExportLoading(true);
    try {
      if (!commentList.length) {
        message.warning('当前暂无可导出的评论');
        return;
      }
      exportToCsv(
        [
          { title: '评论ID', key: 'id' },
          { title: '所属作品ID', key: 'postId' },
          { title: '所属作品标题', key: 'postTitle' },
          { title: '评论人昵称', key: 'author', render: (r) => r.author.nickname },
          {
            title: '评论人UID',
            key: 'author',
            render: (r) => r.author.uid || r.author.userNo || '',
          },
          { title: '评论正文内容', key: 'content' },
          { title: '获赞数', key: 'likeCount' },
          { title: '子回复数', key: 'replyCount' },
          {
            title: '风险标签',
            key: 'riskTag',
            render: (r) => {
              const map: Record<CommentRiskTag, string> = {
                normal: '正常',
                ad_suspect: '疑似广告引流',
                abuse: '攻击辱骂',
                spam: '垃圾灌水',
              };
              return map[r.riskTag] || '正常';
            },
          },
          {
            title: '状态',
            key: 'status',
            render: (r) =>
              r.status === 'top' ? '作者置顶' : r.status === 'hidden' ? '违规隐藏' : '正常展示',
          },
          { title: '发评时间', key: 'createTime' },
          { title: 'IP属地', key: 'ipLocation' },
        ],
        commentList,
        '全站评论互动风控数据列表',
      );
      message.success(`成功导出 ${commentList.length} 条评论数据`);
    } catch (err: any) {
      message.error(err.message || '导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  const renderRiskTag = (risk: CommentRiskTag) => {
    switch (risk) {
      case 'ad_suspect':
        return <Tag color="error">疑似引流广告</Tag>;
      case 'abuse':
        return <Tag color="magenta">攻击辱骂</Tag>;
      case 'spam':
        return <Tag color="warning">垃圾灌水</Tag>;
      case 'normal':
        return <Tag color="success">安全合规</Tag>;
      default:
        return null;
    }
  };

  const columns: TableProps<CommentItem>['columns'] = [
    {
      title: '评论ID',
      dataIndex: 'id',
      key: 'id',
      width: 130,
      render: (id: string) => (
        <Text code copyable={{ tooltips: ['复制ID', '已复制'] }} style={{ fontSize: 12 }}>
          {id}
        </Text>
      ),
    },
    {
      title: '评论内容',
      key: 'content',
      width: 280,
      render: (_, record) => (
        <div>
          <Paragraph style={{ margin: 0, fontSize: 13 }}>{record.content}</Paragraph>
          <Space size="middle" style={{ marginTop: 4, fontSize: 11, color: '#8c8c8c' }}>
            {record.ipLocation && <span>IP: {record.ipLocation}</span>}
            <span>赞 {record.likeCount}</span>
            <span>回复 {record.replyCount}</span>
          </Space>
        </div>
      ),
    },
    {
      title: '所属作品',
      key: 'post',
      width: 240,
      render: (_, record) => (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {record.postCover && (
            <img
              src={record.postCover}
              alt="作品封面"
              style={{ width: 44, height: 44, borderRadius: 4, objectFit: 'cover', flexShrink: 0 }}
            />
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <Paragraph
              ellipsis={{ rows: 2 }}
              style={{ margin: 0, fontSize: 12 }}
              title={record.postTitle}
            >
              {record.postTitle}
            </Paragraph>
            <Text type="secondary" style={{ fontSize: 11 }}>
              ID: {record.postId}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '评论人',
      key: 'author',
      width: 160,
      render: (_, record) => (
        <Space size={8}>
          <Avatar src={record.author.avatar} size={32} icon={<UserOutlined />} />
          <div>
            <Text strong style={{ fontSize: 12, display: 'block' }}>
              {record.author.nickname}
            </Text>
            <Text type="secondary" style={{ fontSize: 11 }}>
              UID: {record.author.uid || record.author.userNo}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: '风险标签',
      dataIndex: 'riskTag',
      key: 'riskTag',
      width: 120,
      render: (risk: CommentRiskTag) => renderRiskTag(risk),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 110,
      render: (status: CommentStatus) => {
        if (status === 'top') {
          return <Badge status="success" text={<Text type="success">作者置顶</Text>} />;
        }
        if (status === 'hidden' || status === 'rejected') {
          return <Badge status="error" text={<Text type="danger">违规隐藏</Text>} />;
        }
        if (status === 'pending') {
          return <Badge status="warning" text={<Text type="warning">待审核</Text>} />;
        }
        if (status === 'deleted') {
          return <Badge status="default" text={<Text type="secondary">已删除</Text>} />;
        }
        return <Badge status="processing" text="正常展示" />;
      },
    },
    {
      title: '发评时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 160,
      render: (time: string) => <Text style={{ fontSize: 12 }}>{time}</Text>,
    },
    {
      title: '操作',
      key: 'action',
      fixed: 'right',
      width: 180,
      render: (_, record) => (
        <Space size="small">
          {record.status === 'deleted' ? (
            <Space size={4}>
              <Text type="secondary" style={{ fontSize: 12 }}>
                已软删除
              </Text>
              <Button
                type="link"
                size="small"
                icon={<EyeOutlined />}
                style={{ color: '#52c41a', padding: '0 4px' }}
                onClick={() => handleStatusChange(record, 'published')}
              >
                恢复展示
              </Button>
            </Space>
          ) : (
            <>
              {record.status === 'hidden' || record.status === 'rejected' ? (
                <Button
                  type="link"
                  size="small"
                  icon={<EyeOutlined />}
                  style={{ color: '#52c41a' }}
                  onClick={() => handleStatusChange(record, 'published')}
                >
                  展示
                </Button>
              ) : (
                <Button
                  type="link"
                  size="small"
                  icon={<EyeInvisibleOutlined />}
                  danger
                  onClick={() => handleStatusChange(record, 'hidden')}
                >
                  隐藏
                </Button>
              )}

              <Popconfirm
                title="禁言发评人"
                description={`确定对用户【${record.author.nickname}】执行禁言处置吗？`}
                onConfirm={() => handleMuteUser(record)}
              >
                <Button type="link" size="small" style={{ color: '#fa8c16' }}>
                  禁言
                </Button>
              </Popconfirm>

              <Popconfirm
                title="删除确认"
                description="确定软删除此条评论及其子回复吗？"
                onConfirm={() => handleDelete(record)}
              >
                <Button type="link" size="small" danger>
                  删除
                </Button>
              </Popconfirm>
            </>
          )}
        </Space>
      ),
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
            status: 'all',
            riskTag: 'all',
          }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="评论内容" name="keyword" style={{ marginBottom: 0 }}>
                <Input placeholder="输入评论关键词或作品标题" allowClear />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={5}>
              <Form.Item label="评论人" name="uid" style={{ marginBottom: 0 }}>
                <Input placeholder="输入发评人 UID / 昵称" allowClear />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={4}>
              <Form.Item label="风险识别" name="riskTag" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部风险', value: 'all' },
                    { label: '安全合规', value: 'normal' },
                    { label: '疑似引流广告', value: 'ad_suspect' },
                    { label: '攻击辱骂', value: 'abuse' },
                    { label: '垃圾灌水', value: 'spam' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={4}>
              <Form.Item label="评论状态" name="status" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部状态', value: 'all' },
                    { label: '正常展示 (published)', value: 'published' },
                    { label: '审核中 (pending)', value: 'pending' },
                    { label: '违规隐藏 (rejected)', value: 'rejected' },
                    { label: '已软删除 (deleted)', value: 'deleted' },
                    { label: '作者置顶 (top)', value: 'top' },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={5}>
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

          <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="作品 ID" name="postId" style={{ marginBottom: 0 }}>
                <Input placeholder="输入作品 Snowflake ID 筛选" allowClear />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={10} lg={8}>
              <Form.Item label="发评日期" name="dateRange" style={{ marginBottom: 0 }}>
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
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
            <span style={{ fontSize: 16, fontWeight: 600 }}>全站评论互动风控列表</span>
            <Tag color="cyan">共 {total} 条评论</Tag>
          </Space>
        }
        extra={
          <Space wrap>
            {selectedRowKeys.length > 0 && (
              <Space>
                <Text type="secondary">已选择 {selectedRowKeys.length} 条</Text>
                <Button size="small" onClick={() => handleBatchStatus('published')}>
                  批量恢复展示
                </Button>
                <Button size="small" danger onClick={() => handleBatchStatus('hidden')}>
                  批量隐藏违规
                </Button>
                <Popconfirm
                  title="批量删除"
                  description={`确定删除已勾选的 ${selectedRowKeys.length} 条评论吗？`}
                  onConfirm={handleBatchDelete}
                >
                  <Button size="small" danger type="primary">
                    批量删除
                  </Button>
                </Popconfirm>
              </Space>
            )}

            <Button icon={<DownloadOutlined />} onClick={handleExport} loading={exportLoading}>
              导出评论数据
            </Button>
            {ColumnSettingComponent}
            <Tooltip title="刷新列表">
              <Button icon={<ReloadOutlined />} onClick={() => fetchData()} loading={loading} />
            </Tooltip>
          </Space>
        }
      >
        <Table<CommentItem>
          rowKey="id"
          columns={columns.filter((col) => !col.key || checkedKeys.includes(col.key as string))}
          dataSource={commentList}
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
            pageSizeOptions: ['10', '20', '50', '100', '200', '500', '1000'],
            showTotal: (allTotal) => `共 ${allTotal} 条评论`,
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
              fetchData(page, size);
            },
          }}
        />
      </Card>
    </div>
  );
};

export default CommentsPage;

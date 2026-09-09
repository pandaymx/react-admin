import {
  CheckCircleOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  ExperimentOutlined,
  FileProtectOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  StopOutlined,
  TagOutlined,
} from '@ant-design/icons';
import type { TableProps } from 'antd';
import {
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
  Statistic,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  batchDeleteSensitiveWords,
  deleteSensitiveWord,
  getSensitiveWordPage,
  getSensitiveWordStats,
  getSensitiveWordTags,
  updateSensitiveWordStatus,
} from '@/api/sensitiveWord';
import { useThemeStore } from '@/store/theme';
import type { SensitiveWordItem, SensitiveWordQueryParams, SensitiveWordStats } from '@/types';
import { exportToCsv } from '@/utils/export';
import { formatDateTime } from '@/utils/time';
import { SensitiveWordModal } from './components/SensitiveWordModal';
import { SensitiveWordTesterDrawer } from './components/SensitiveWordTesterDrawer';

const { Text, Paragraph } = Typography;
const { RangePicker } = DatePicker;

// 标签色彩映射
const TAG_COLORS: Record<string, string> = {
  政治: 'red',
  暴恐: 'volcano',
  色情: 'magenta',
  广告: 'orange',
  引流: 'gold',
  辱骂: 'purple',
  违禁品: 'geekblue',
  诈骗: 'cyan',
  网络暴力: 'purple',
  钓鱼: 'lime',
  财务欺诈: 'blue',
  毒品: 'volcano',
};

export const SensitiveWordsPage: React.FC = () => {
  const [form] = Form.useForm();
  const isDark = useThemeStore((state) => state.isDark);
  const {
    token: { colorBorderSecondary },
  } = theme.useToken();

  const [loading, setLoading] = useState<boolean>(false);
  const [exportLoading, setExportLoading] = useState<boolean>(false);
  const [dataList, setDataList] = useState<SensitiveWordItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);

  // 标签集
  const [availableTags, setAvailableTags] = useState<string[]>([]);

  // 统计数据
  const [stats, setStats] = useState<SensitiveWordStats>({
    totalCount: 0,
    enabledCount: 0,
    disabledCount: 0,
    tagCount: 0,
  });

  // 弹窗状态
  const [modalVisible, setModalVisible] = useState<boolean>(false);
  const [currentEditRecord, setCurrentEditRecord] = useState<SensitiveWordItem | null>(null);

  // 测试台抽屉
  const [testerOpen, setTesterOpen] = useState<boolean>(false);

  // 防抖 Timer
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // 获取统计指标
  const fetchStats = useCallback(async () => {
    try {
      const res = await getSensitiveWordStats();
      if (res.code === 200 && res.data) {
        setStats(res.data);
      }
    } catch {
      // ignore
    }
  }, []);

  // 获取所有标签
  const fetchTags = useCallback(async () => {
    try {
      const res = await getSensitiveWordTags();
      if (res.code === 200 && res.data) {
        setAvailableTags(res.data);
      }
    } catch {
      // ignore
    }
  }, []);

  // 获取列表数据
  const fetchData = useCallback(
    async (page = 1, size = 10) => {
      setLoading(true);
      try {
        const values = form.getFieldsValue();
        let dateParams: [string, string] | undefined;
        if (values.dateRange && values.dateRange.length === 2) {
          dateParams = [
            values.dateRange[0].format('YYYY-MM-DD'),
            values.dateRange[1].format('YYYY-MM-DD'),
          ];
        }

        const params: SensitiveWordQueryParams = {
          name: values.name?.trim() || undefined,
          tag: values.tag && values.tag !== 'all' ? values.tag : undefined,
          status:
            values.status !== undefined && values.status !== 'all' ? values.status : undefined,
          createTime: dateParams,
          pageNo: page,
          pageSize: size,
        };

        const res = await getSensitiveWordPage(params);
        if (res.code === 200 && res.data) {
          setDataList(res.data.list);
          setTotal(res.data.total);
          setCurrentPage(page);
          setPageSize(size);
        }
      } catch (err: any) {
        message.error(err.message || '获取敏感词列表失败');
      } finally {
        setLoading(false);
      }
    },
    [form],
  );

  useEffect(() => {
    fetchData(1, 10);
    fetchStats();
    fetchTags();
  }, [fetchData, fetchStats, fetchTags]);

  // 查询
  const handleSearch = () => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    fetchData(1, pageSize);
  };

  // 300ms 防抖即输即查
  const handleValuesChange = (changedValues: any) => {
    if ('name' in changedValues) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      debounceTimerRef.current = setTimeout(() => {
        fetchData(1, pageSize);
      }, 300);
    } else {
      fetchData(1, pageSize);
    }
  };

  // 重置
  const handleReset = () => {
    form.resetFields();
    fetchData(1, pageSize);
  };

  // 切换单条状态
  const handleStatusChange = async (record: SensitiveWordItem, checked: boolean) => {
    const newStatus = checked ? 0 : 1;
    try {
      const res = await updateSensitiveWordStatus(record, newStatus);
      if (res.code === 200 || res.code === 0) {
        message.success(`敏感词「${record.name}」已${newStatus === 0 ? '启用' : '停用'}`);
        setDataList((prev) =>
          prev.map((item) => (item.id === record.id ? { ...item, status: newStatus } : item)),
        );
        fetchStats();
      }
    } catch (err: any) {
      message.error(err?.message || '状态更新失败');
    }
  };

  // 删除单条
  const handleDelete = async (record: SensitiveWordItem) => {
    try {
      const res = await deleteSensitiveWord(record.id);
      if (res.code === 200 || res.code === 0) {
        message.success('敏感词删除成功');
        fetchData(currentPage, pageSize);
        fetchStats();
      }
    } catch {
      message.error('删除失败');
    }
  };

  // 批量删除
  const handleBatchDelete = async () => {
    if (selectedRowKeys.length === 0) return;
    try {
      const ids = selectedRowKeys.map((k) => Number(k));
      const res = await batchDeleteSensitiveWords(ids);
      if (res.code === 200 || res.code === 0) {
        message.success(`已成功批量删除 ${ids.length} 个敏感词`);
        setSelectedRowKeys([]);
        fetchData(1, pageSize);
        fetchStats();
      }
    } catch {
      message.error('批量删除失败');
    }
  };

  // 导出 CSV
  const handleExport = () => {
    setExportLoading(true);
    try {
      if (dataList.length === 0) {
        message.warning('当前列表暂无数据可导出');
        return;
      }

      exportToCsv(
        [
          { title: '敏感词编号', key: 'id' },
          { title: '敏感词内容', key: 'name' },
          {
            title: '标签分类',
            key: 'tags',
            render: (r: SensitiveWordItem) => (r.tags ? r.tags.join(' / ') : ''),
          },
          {
            title: '启用状态',
            key: 'status',
            render: (r: SensitiveWordItem) => (r.status === 0 ? '启用中' : '已停用'),
          },
          { title: '备注描述', key: 'description' },
          { title: '创建时间', key: 'createTime' },
        ],
        dataList,
        '敏感词治理配置清单',
      );
      message.success(`成功导出 ${dataList.length} 条敏感词记录`);
    } catch (err: any) {
      message.error(err.message || '导出失败');
    } finally {
      setExportLoading(false);
    }
  };

  // 表格列配置
  const columns: TableProps<SensitiveWordItem>['columns'] = [
    {
      title: '编号',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id: number) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          #{id}
        </Text>
      ),
    },
    {
      title: '敏感词汇',
      dataIndex: 'name',
      key: 'name',
      width: 180,
      render: (name: string) => (
        <Space size={6}>
          <Text
            strong
            copyable={{ tooltips: ['复制敏感词', '已复制'] }}
            style={{ fontSize: 14, color: isDark ? '#ff7875' : '#cf1322' }}
          >
            {name}
          </Text>
        </Space>
      ),
    },
    {
      title: '分类标签',
      dataIndex: 'tags',
      key: 'tags',
      width: 220,
      render: (tags: string[]) => (
        <Space wrap size={[4, 4]}>
          {tags && tags.length > 0 ? (
            tags.map((tag) => (
              <Tag
                key={tag}
                color={TAG_COLORS[tag] || 'blue'}
                style={{ borderRadius: 4, margin: 0 }}
              >
                {tag}
              </Tag>
            ))
          ) : (
            <Tag color="default">未分类</Tag>
          )}
        </Space>
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: number, record) => (
        <Space orientation="horizontal" size={8}>
          <Popconfirm
            title={status === 0 ? '确定停用该敏感词？' : '确定重新启用该敏感词？'}
            description={
              status === 0
                ? '停用后发帖与评论将不再拦截该词汇'
                : '启用后系统将即时拦截包含该词的内容'
            }
            onConfirm={() => handleStatusChange(record, status !== 0)}
            okText="确认变更"
            cancelText="取消"
          >
            <Switch
              size="small"
              checked={status === 0}
              checkedChildren="生效"
              unCheckedChildren="停用"
            />
          </Popconfirm>
          <Text style={{ fontSize: 12, color: status === 0 ? '#52c41a' : '#8c8c8c' }}>
            {status === 0 ? '启用中' : '已停用'}
          </Text>
        </Space>
      ),
    },
    {
      title: '备注说明',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true,
      render: (desc: string) => (
        <Paragraph
          ellipsis={{ rows: 2, tooltip: desc }}
          style={{ marginBottom: 0, fontSize: 12, color: '#595959' }}
        >
          {desc || '—'}
        </Paragraph>
      ),
    },
    {
      title: '创建时间',
      dataIndex: 'createTime',
      key: 'createTime',
      width: 170,
      render: (time: string) => (
        <Text style={{ fontSize: 12, color: '#8c8c8c' }}>{formatDateTime(time)}</Text>
      ),
    },
    {
      title: '操作',
      key: 'actions',
      width: 140,
      fixed: 'right',
      render: (_, record) => (
        <Space size={4}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => {
              setCurrentEditRecord(record);
              setModalVisible(true);
            }}
          >
            编辑
          </Button>

          <Popconfirm
            title="确认彻底删除该敏感词？"
            description="删除后风控拦截规则将立即移除该词条，且不可恢复。"
            onConfirm={() => handleDelete(record)}
            okText="彻底删除"
            cancelText="取消"
            okButtonProps={{ danger: true }}
          >
            <Button type="link" size="small" danger icon={<DeleteOutlined />}>
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 顶部风控指标看板 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              borderLeft: '4px solid #1677ff',
            }}
          >
            <Statistic
              title={
                <Space>
                  <FileProtectOutlined style={{ color: '#1677ff' }} />
                  <span>敏感词库总量</span>
                </Space>
              }
              value={stats.totalCount}
              suffix="个"
              styles={{ content: { color: '#1677ff', fontWeight: 600 } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              borderLeft: '4px solid #52c41a',
            }}
          >
            <Statistic
              title={
                <Space>
                  <CheckCircleOutlined style={{ color: '#52c41a' }} />
                  <span>生效拦截中</span>
                </Space>
              }
              value={stats.enabledCount}
              suffix="个"
              styles={{ content: { color: '#52c41a', fontWeight: 600 } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              borderLeft: '4px solid #faad14',
            }}
          >
            <Statistic
              title={
                <Space>
                  <StopOutlined style={{ color: '#faad14' }} />
                  <span>暂停停用中</span>
                </Space>
              }
              value={stats.disabledCount}
              suffix="个"
              styles={{ content: { color: '#faad14', fontWeight: 600 } }}
            />
          </Card>
        </Col>

        <Col xs={24} sm={12} md={6}>
          <Card
            hoverable
            style={{
              borderRadius: 8,
              boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
              borderLeft: '4px solid #722ed1',
            }}
          >
            <Statistic
              title={
                <Space>
                  <TagOutlined style={{ color: '#722ed1' }} />
                  <span>涵盖分类类别</span>
                </Space>
              }
              value={stats.tagCount}
              suffix="类"
              styles={{ content: { color: '#722ed1', fontWeight: 600 } }}
            />
          </Card>
        </Col>
      </Row>

      {/* 搜索与过滤表单卡片 */}
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
          onValuesChange={handleValuesChange}
          initialValues={{ status: 'all', tag: 'all' }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="敏感词" name="name" style={{ marginBottom: 0 }}>
                <Input placeholder="输入敏感词关键词搜索 (即输即查)" allowClear />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="分类标签" name="tag" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部标签类别', value: 'all' },
                    ...availableTags.map((t) => ({ label: t, value: t })),
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="状态" name="status" style={{ marginBottom: 0 }}>
                <Select
                  options={[
                    { label: '全部状态', value: 'all' },
                    { label: '🟢 启用中', value: 0 },
                    { label: '🔴 已停用', value: 1 },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item label="创建时间" name="dateRange" style={{ marginBottom: 0 }}>
                <RangePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 8,
              marginTop: 16,
              borderTop: `1px solid ${colorBorderSecondary}`,
              paddingTop: 16,
            }}
          >
            <Button onClick={handleReset}>重置</Button>
            <Button type="primary" icon={<SearchOutlined />} onClick={handleSearch}>
              查询
            </Button>
          </div>
        </Form>
      </Card>

      {/* 数据表格与操作栏 */}
      <Card
        variant="borderless"
        style={{
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.04)',
          borderRadius: 8,
        }}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: 16,
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          {/* 左侧主要操作 */}
          <Space wrap size={8}>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setCurrentEditRecord(null);
                setModalVisible(true);
              }}
            >
              新增敏感词
            </Button>

            <Button
              icon={<ExperimentOutlined style={{ color: '#1677ff' }} />}
              onClick={() => setTesterOpen(true)}
            >
              在线文本校验测试台
            </Button>

            {selectedRowKeys.length > 0 && (
              <Popconfirm
                title={`确认批量删除选中的 ${selectedRowKeys.length} 个敏感词？`}
                description="删除后将不再拦截对应词汇，请谨慎操作。"
                onConfirm={handleBatchDelete}
                okText="批量删除"
                cancelText="取消"
                okButtonProps={{ danger: true }}
              >
                <Button danger icon={<DeleteOutlined />}>
                  批量删除 ({selectedRowKeys.length})
                </Button>
              </Popconfirm>
            )}
          </Space>

          {/* 右侧工具栏 */}
          <Space size={8}>
            <Tooltip title="导出当前敏感词清单为 CSV 表格">
              <Button icon={<DownloadOutlined />} loading={exportLoading} onClick={handleExport}>
                导出报表
              </Button>
            </Tooltip>

            <Tooltip title="刷新列表数据与风控指标">
              <Button
                icon={<ReloadOutlined />}
                onClick={() => {
                  fetchData(currentPage, pageSize);
                  fetchStats();
                  fetchTags();
                }}
              />
            </Tooltip>
          </Space>
        </div>

        {/* 表格主体 */}
        <Table<SensitiveWordItem>
          rowKey="id"
          columns={columns}
          dataSource={dataList}
          loading={loading}
          rowSelection={{
            selectedRowKeys,
            onChange: setSelectedRowKeys,
          }}
          pagination={{
            current: currentPage,
            pageSize,
            total,
            showTotal: (totalCount) => `共 ${totalCount} 条敏感词`,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (page, size) => fetchData(page, size),
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      {/* 新增/编辑弹窗 */}
      <SensitiveWordModal
        open={modalVisible}
        record={currentEditRecord}
        availableTags={availableTags}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          fetchData(currentPage, pageSize);
          fetchStats();
          fetchTags();
        }}
      />

      {/* 在线检测测试台抽屉 */}
      <SensitiveWordTesterDrawer
        open={testerOpen}
        availableTags={availableTags}
        onClose={() => setTesterOpen(false)}
      />
    </div>
  );
};

export default SensitiveWordsPage;

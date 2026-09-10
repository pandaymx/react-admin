import {
  AppstoreOutlined,
  DeleteOutlined,
  EditOutlined,
  ExclamationCircleOutlined,
  MobileOutlined,
  PlusOutlined,
  ReloadOutlined,
  SearchOutlined,
  TableOutlined,
  TagOutlined,
} from '@ant-design/icons';
import {
  Avatar,
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Input,
  Modal,
  message,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Table,
  Tag,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  createTag,
  createTagType,
  deleteTag,
  deleteTagType,
  getTagPage,
  getTagTypePage,
  updateTag,
  updateTagType,
} from '@/api/tag';
import { useThemeStore } from '@/store/theme';
import type {
  AdminTagCreateReqVO,
  AdminTagTypeCreateReqVO,
  AdminTagTypeUpdateReqVO,
  AdminTagUpdateReqVO,
  TagItem,
  TagTypeItem,
} from '@/types';
import { TagEditModal } from './components/TagEditModal';
import { TagInitialConfigDrawer } from './components/TagInitialConfigDrawer';
import { TagTypeModal } from './components/TagTypeModal';

const { Title, Text, Paragraph } = Typography;

export const TagsPage: React.FC = () => {
  const isDark = useThemeStore((state) => state.isDark);
  const {
    token: { colorBgContainer, colorBorderSecondary, borderRadiusLG, colorPrimary },
  } = theme.useToken();

  const [loading, setLoading] = useState<boolean>(false);
  const [tagTypes, setTagTypes] = useState<TagTypeItem[]>([]);
  const [selectedTypeId, setSelectedTypeId] = useState<string | number | null>(null);
  const [tags, setTags] = useState<TagItem[]>([]);
  const [allTags, setAllTags] = useState<TagItem[]>([]);
  const [tagCountsMap, setTagCountsMap] = useState<Record<string, number>>({});

  // 视图与检索
  const [viewMode, setViewMode] = useState<'card' | 'table'>('card');
  const [searchKeyword, setSearchKeyword] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'disabled'>('all');

  // 弹窗与抽屉控制
  const [tagTypeModalOpen, setTagTypeModalOpen] = useState<boolean>(false);
  const [editingTagType, setEditingTagType] = useState<TagTypeItem | null>(null);

  const [tagEditModalOpen, setTagEditModalOpen] = useState<boolean>(false);
  const [editingTag, setEditingTag] = useState<TagItem | null>(null);

  const [configDrawerOpen, setConfigDrawerOpen] = useState<boolean>(false);

  // 拉取标签类型列表与各分类计数索引
  const fetchTagTypes = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getTagTypePage();
      if (res.code === 0 && res.data) {
        const types = res.data.list;
        setTagTypes(types);
        setSelectedTypeId((prev) => (prev ? prev : types.length > 0 ? types[0].id : null));

        // 并发加载各分类的标签以统计实际标签数并建立全量标签索引
        if (types.length > 0) {
          const promises = types.map((t) =>
            getTagPage({ tagTypeId: t.id, pageNo: 1, pageSize: 100 }),
          );
          const results = await Promise.allSettled(promises);
          const combined: TagItem[] = [];
          const countMap: Record<string, number> = {};
          for (let i = 0; i < results.length; i++) {
            const r = results[i];
            const typeIdStr = String(types[i].id);
            if (r.status === 'fulfilled' && r.value.code === 0 && r.value.data?.list) {
              combined.push(...r.value.data.list);
              countMap[typeIdStr] = r.value.data.total ?? r.value.data.list.length;
            } else {
              countMap[typeIdStr] = types[i].tagCount || 0;
            }
          }
          setAllTags(combined);
          setTagCountsMap(countMap);
        }
      }
    } catch {
      message.error('加载标签分类失败');
    } finally {
      setLoading(false);
    }
  }, []);

  // 拉取当前选中分类下的标签
  const fetchCurrentTags = useCallback(async () => {
    if (!selectedTypeId) return;
    try {
      setLoading(true);
      const res = await getTagPage({
        tagTypeId: selectedTypeId,
        name: searchKeyword,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });
      if (res.code === 0 && res.data) {
        setTags(res.data.list);
        // 同步更新当前分类计数
        setTagCountsMap((prev) => ({
          ...prev,
          [String(selectedTypeId)]: res.data.total ?? res.data.list.length,
        }));
      }
    } catch {
      message.error('加载标签列表失败');
    } finally {
      setLoading(false);
    }
  }, [selectedTypeId, searchKeyword, statusFilter]);

  useEffect(() => {
    fetchTagTypes();
  }, [fetchTagTypes]);

  useEffect(() => {
    fetchCurrentTags();
  }, [fetchCurrentTags]);

  const currentType = tagTypes.find((t) => t.id === selectedTypeId) || null;

  // 保存分类
  const handleSaveTagType = async (values: AdminTagTypeCreateReqVO | AdminTagTypeUpdateReqVO) => {
    if ('id' in values) {
      await updateTagType(values);
      message.success('更新分类成功');
    } else {
      const res = await createTagType(values);
      if (res.data) {
        setSelectedTypeId(res.data);
      }
      message.success('创建新分类成功');
    }
    setTagTypeModalOpen(false);
    fetchTagTypes();
  };

  // 删除分类
  const handleDeleteTagType = async (typeItem: TagTypeItem) => {
    if (typeItem.tagCount && typeItem.tagCount > 0) {
      Modal.confirm({
        title: '分类下存在关联标签',
        icon: <ExclamationCircleOutlined style={{ color: '#faad14' }} />,
        content: `该分类「${typeItem.name}」下仍有 ${typeItem.tagCount} 个标签。删除分类将级联清理其子标签，确定继续删除吗？`,
        okText: '强制删除',
        okType: 'danger',
        cancelText: '取消',
        onOk: async () => {
          await deleteTagType(typeItem.id);
          message.success('已删除分类');
          setSelectedTypeId(null);
          fetchTagTypes();
        },
      });
      return;
    }

    await deleteTagType(typeItem.id);
    message.success('分类已删除');
    setSelectedTypeId(null);
    fetchTagTypes();
  };

  // 保存标签
  const handleSaveTag = async (values: AdminTagCreateReqVO | AdminTagUpdateReqVO) => {
    if ('id' in values) {
      await updateTag(values);
      message.success('更新标签成功');
    } else {
      await createTag(values);
      message.success('创建标签成功');
    }
    setTagEditModalOpen(false);
    fetchCurrentTags();
    fetchTagTypes();
  };

  // 快速切换标签状态
  const handleToggleTagStatus = async (item: TagItem, checked: boolean) => {
    const newStatus = checked ? 'active' : 'disabled';
    await updateTag({
      ...item,
      status: newStatus,
    });
    message.success(`标签「${item.name}」已切换为${checked ? '启用' : '停用'}`);
    fetchCurrentTags();
  };

  // 安全删除标签
  const handleDeleteTag = async (item: TagItem) => {
    if (item.userCount && item.userCount > 0) {
      Modal.confirm({
        title: '无法物理删除已有用户绑定的标签',
        icon: <ExclamationCircleOutlined style={{ color: '#f5222d' }} />,
        content: (
          <div>
            <p>
              标签「<strong>{item.name}</strong>」已被 <strong>{item.userCount}</strong>{' '}
              位用户绑定（存在于 <code>app_user_tag_rel</code> 表中）。
            </p>
            <p style={{ color: '#888' }}>
              根据后端安全约束，直接删除有关联记录的标签会抛出异常。推荐将其置为「停用」状态，前端将不再向新用户展示，同时保护已有用户画像数据完整。
            </p>
          </div>
        ),
        okText: '将其设为停用',
        cancelText: '取消',
        onOk: async () => {
          await updateTag({ ...item, status: 'disabled' });
          message.success('已将该标签置为停用状态');
          fetchCurrentTags();
        },
      });
      return;
    }

    await deleteTag(item.id);
    message.success('标签已删除');
    fetchCurrentTags();
    fetchTagTypes();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 顶部标题与工作台入口 */}
      <Card
        styles={{ body: { padding: '16px 24px' } }}
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div>
            <Space align="center" size={10}>
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: `${colorPrimary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <TagOutlined style={{ fontSize: 22, color: colorPrimary }} />
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  标签体系与画像标签中心
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  统一治理用户画像标签分类、标签资产、用户选择约束与新用户入驻首登场景推荐
                </Text>
              </div>
            </Space>
          </div>

          <Space wrap>
            <Button
              type="primary"
              ghost
              icon={<MobileOutlined />}
              onClick={() => setConfigDrawerOpen(true)}
            >
              🎯 初始推荐工作台 (App 选标预览)
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => {
                setEditingTagType(null);
                setTagTypeModalOpen(true);
              }}
            >
              新建标签分类
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                fetchTagTypes();
                fetchCurrentTags();
              }}
            >
              刷新
            </Button>
          </Space>
        </div>
      </Card>

      {/* 主体 Master-Detail 双栏区域 */}
      <Row gutter={[16, 16]}>
        {/* 左侧：标签分类面板 */}
        <Col xs={24} md={8} lg={7} xl={6}>
          <Card
            title={
              <div
                style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
              >
                <Text strong>标签分类类目 ({tagTypes.length})</Text>
                <Tooltip title="添加分类">
                  <Button
                    type="text"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => {
                      setEditingTagType(null);
                      setTagTypeModalOpen(true);
                    }}
                  />
                </Tooltip>
              </div>
            }
            bordered
            styles={{ body: { padding: '8px 12px' } }}
            style={{
              height: '100%',
              borderRadius: borderRadiusLG,
              background: colorBgContainer,
              border: `1px solid ${colorBorderSecondary}`,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {tagTypes.map((typeItem) => {
                const isSelected = typeItem.id === selectedTypeId;
                return (
                  <div
                    key={typeItem.id}
                    onClick={() => setSelectedTypeId(typeItem.id)}
                    style={{
                      padding: '12px 14px',
                      borderRadius: 8,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      background: isSelected ? `${colorPrimary}15` : isDark ? '#1e1e1e' : '#fafafa',
                      border: isSelected
                        ? `1px solid ${colorPrimary}`
                        : `1px solid ${colorBorderSecondary}`,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 6,
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Space>
                        <TagOutlined
                          style={{
                            color: isSelected ? colorPrimary : isDark ? '#aaa' : '#666',
                          }}
                        />
                        <Text strong style={{ color: isSelected ? colorPrimary : undefined }}>
                          {typeItem.name}
                        </Text>
                      </Space>
                      <Tag
                        color={typeItem.status === 'active' ? 'success' : 'default'}
                        style={{ margin: 0 }}
                      >
                        {typeItem.status === 'active' ? '启用中' : '已停用'}
                      </Tag>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        fontSize: 12,
                      }}
                    >
                      <Text type="secondary">
                        {typeItem.maxSelectQuantity === 0
                          ? '不限选数量'
                          : `最多可选 ${typeItem.maxSelectQuantity} 项`}
                      </Text>
                      <Space size={6}>
                        <Badge
                          count={`${tagCountsMap[String(typeItem.id)] ?? typeItem.tagCount ?? 0} 个标签`}
                          style={{
                            backgroundColor: isSelected ? colorPrimary : '#8c8c8c',
                            fontSize: 11,
                          }}
                        />
                      </Space>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        marginTop: 4,
                        paddingTop: 6,
                        borderTop: `1px dashed ${colorBorderSecondary}`,
                        fontSize: 11,
                      }}
                    >
                      <Text type="secondary">
                        用户覆盖: {typeItem.userCount?.toLocaleString() || 0} 人
                      </Text>
                      <Space size={2} onClick={(e) => e.stopPropagation()}>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setEditingTagType(typeItem);
                            setTagTypeModalOpen(true);
                          }}
                        />
                        <Popconfirm
                          title="确认删除此分类？"
                          onConfirm={() => handleDeleteTagType(typeItem)}
                          okText="确认"
                          cancelText="取消"
                        >
                          <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                        </Popconfirm>
                      </Space>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </Col>

        {/* 右侧：当前分类下的标签管理区 */}
        <Col xs={24} md={16} lg={17} xl={18}>
          <Card
            bordered
            styles={{ body: { padding: 20 } }}
            style={{
              borderRadius: borderRadiusLG,
              background: colorBgContainer,
              border: `1px solid ${colorBorderSecondary}`,
              minHeight: 640,
            }}
          >
            {/* 分类顶部信息 */}
            {currentType ? (
              <div
                style={{
                  padding: 16,
                  borderRadius: 8,
                  background: isDark ? '#1a1a1a' : '#f5f7fa',
                  marginBottom: 16,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  flexWrap: 'wrap',
                  gap: 12,
                }}
              >
                <div>
                  <Space align="baseline">
                    <Title level={4} style={{ margin: 0 }}>
                      {currentType.name}
                    </Title>
                    <Tag color={currentType.status === 'active' ? 'green' : 'red'}>
                      {currentType.status === 'active' ? '分类正常启用' : '分类已停用'}
                    </Tag>
                    <Badge
                      count={
                        currentType.maxSelectQuantity === 0
                          ? '可选：不限'
                          : `可选：最多 ${currentType.maxSelectQuantity} 项`
                      }
                      style={{ backgroundColor: colorPrimary }}
                    />
                  </Space>
                  <Paragraph type="secondary" style={{ margin: '4px 0 0', fontSize: 13 }}>
                    {currentType.description || '暂无分类说明描述'}
                  </Paragraph>
                </div>

                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingTag(null);
                    setTagEditModalOpen(true);
                  }}
                >
                  向「{currentType.name}」添加标签
                </Button>
              </div>
            ) : null}

            {/* 检索与视图切换工具栏 */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 12,
                marginBottom: 16,
              }}
            >
              <Space wrap>
                <Input
                  placeholder="搜索标签名称..."
                  prefix={<SearchOutlined style={{ color: '#aaa' }} />}
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  allowClear
                  style={{ width: 220 }}
                />
                <Select
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(val)}
                  style={{ width: 120 }}
                  options={[
                    { label: '全部状态', value: 'all' },
                    { label: '正常启用', value: 'active' },
                    { label: '已停用', value: 'disabled' },
                  ]}
                />
              </Space>

              <Radio.Group
                value={viewMode}
                onChange={(e) => setViewMode(e.target.value)}
                buttonStyle="solid"
                size="middle"
              >
                <Radio.Button value="card">
                  <AppstoreOutlined /> 网格视图
                </Radio.Button>
                <Radio.Button value="table">
                  <TableOutlined /> 表格视图
                </Radio.Button>
              </Radio.Group>
            </div>

            {/* 内容区：卡片网格视图 or 紧凑表格视图 */}
            {tags.length === 0 ? (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="当前分类下暂无符合条件的标签数据"
                style={{ marginTop: 80 }}
              >
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    setEditingTag(null);
                    setTagEditModalOpen(true);
                  }}
                >
                  立即新建标签
                </Button>
              </Empty>
            ) : viewMode === 'card' ? (
              <Row gutter={[12, 12]}>
                {tags.map((tagItem) => (
                  <Col xs={24} sm={12} md={12} lg={8} key={tagItem.id}>
                    <div
                      style={{
                        padding: '14px 16px',
                        borderRadius: 8,
                        border: `1px solid ${colorBorderSecondary}`,
                        background: isDark ? '#1a1a1a' : '#ffffff',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 10,
                        transition: 'box-shadow 0.2s, transform 0.2s',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Space size={10}>
                          {tagItem.iconUrl ? (
                            <Avatar src={tagItem.iconUrl} size={28} shape="square" />
                          ) : (
                            <div
                              style={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                background: tagItem.color || colorPrimary,
                              }}
                            />
                          )}
                          <Text strong style={{ fontSize: 14 }}>
                            {tagItem.name}
                          </Text>
                        </Space>
                        <Switch
                          checked={tagItem.status === 'active'}
                          size="small"
                          onChange={(checked) => handleToggleTagStatus(tagItem, checked)}
                        />
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 12,
                        }}
                      >
                        <Tag color={tagItem.color || 'blue'} style={{ margin: 0 }}>
                          #{tagItem.sort} 权重
                        </Tag>
                        <Text type="secondary">
                          用户画像: <strong>{tagItem.userCount?.toLocaleString() || 0}</strong> 人
                        </Text>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'flex-end',
                          gap: 6,
                          paddingTop: 8,
                          borderTop: `1px dashed ${colorBorderSecondary}`,
                        }}
                      >
                        <Button
                          type="link"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setEditingTag(tagItem);
                            setTagEditModalOpen(true);
                          }}
                        >
                          编辑
                        </Button>
                        <Button
                          type="link"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteTag(tagItem)}
                        >
                          删除
                        </Button>
                      </div>
                    </div>
                  </Col>
                ))}
              </Row>
            ) : (
              <Table<TagItem>
                rowKey="id"
                dataSource={tags}
                loading={loading}
                pagination={{ pageSize: 10, showSizeChanger: true }}
                columns={[
                  {
                    title: 'ID',
                    dataIndex: 'id',
                    width: 90,
                  },
                  {
                    title: '标签名称',
                    dataIndex: 'name',
                    render: (name, record) => (
                      <Space>
                        {record.iconUrl && <Avatar src={record.iconUrl} size={22} shape="square" />}
                        <Tag color={record.color || 'blue'}>{name}</Tag>
                      </Space>
                    ),
                  },
                  {
                    title: '所属分类',
                    dataIndex: 'tagTypeName',
                    render: (text) => text || currentType?.name,
                  },
                  {
                    title: '排序权重',
                    dataIndex: 'sort',
                    width: 90,
                    align: 'center',
                  },
                  {
                    title: '绑定用户画像数',
                    dataIndex: 'userCount',
                    render: (count) => <span>{count?.toLocaleString() || 0} 人</span>,
                  },
                  {
                    title: '启用状态',
                    dataIndex: 'status',
                    width: 100,
                    render: (status, record) => (
                      <Switch
                        checked={status === 'active'}
                        size="small"
                        onChange={(checked) => handleToggleTagStatus(record, checked)}
                      />
                    ),
                  },
                  {
                    title: '操作',
                    key: 'action',
                    width: 140,
                    align: 'center',
                    render: (_, record) => (
                      <Space size="small">
                        <Button
                          type="link"
                          size="small"
                          icon={<EditOutlined />}
                          onClick={() => {
                            setEditingTag(record);
                            setTagEditModalOpen(true);
                          }}
                        >
                          编辑
                        </Button>
                        <Button
                          type="link"
                          danger
                          size="small"
                          icon={<DeleteOutlined />}
                          onClick={() => handleDeleteTag(record)}
                        >
                          删除
                        </Button>
                      </Space>
                    ),
                  },
                ]}
              />
            )}
          </Card>
        </Col>
      </Row>

      {/* 标签分类弹窗 */}
      <TagTypeModal
        open={tagTypeModalOpen}
        editingItem={editingTagType}
        onClose={() => setTagTypeModalOpen(false)}
        onSubmit={handleSaveTagType}
      />

      {/* 标签项弹窗 */}
      <TagEditModal
        open={tagEditModalOpen}
        editingItem={editingTag}
        tagTypes={tagTypes}
        defaultTagTypeId={selectedTypeId || undefined}
        onClose={() => setTagEditModalOpen(false)}
        onSubmit={handleSaveTag}
      />

      {/* 场景化推荐配置抽屉 (移动端仿真预览) */}
      <TagInitialConfigDrawer
        open={configDrawerOpen}
        tagTypes={tagTypes}
        allTags={allTags}
        onClose={() => setConfigDrawerOpen(false)}
      />
    </div>
  );
};

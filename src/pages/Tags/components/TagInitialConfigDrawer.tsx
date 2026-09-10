import {
  CheckCircleFilled,
  DeleteOutlined,
  MobileOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  Drawer,
  Empty,
  Form,
  InputNumber,
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
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import {
  createInitialTagConfig,
  deleteInitialTagConfig,
  getInitialTagConfigPage,
  updateInitialTagConfig,
} from '@/api/tag';
import { useThemeStore } from '@/store/theme';
import type {
  AdminInitialTagConfigCreateReqVO,
  InitialTagConfigItem,
  TagItem,
  TagTypeItem,
} from '@/types';

const { Title, Text, Paragraph } = Typography;

interface TagInitialConfigDrawerProps {
  open: boolean;
  tagTypes: TagTypeItem[];
  allTags: TagItem[];
  onClose: () => void;
}

const SCENE_OPTIONS = [
  { label: '新用户首登画像引导 (REGISTER_FIRST_LOGIN)', value: 'REGISTER_FIRST_LOGIN' },
  { label: '活动发起与报名偏好 (ACTIVITY_PREFERENCE)', value: 'ACTIVITY_PREFERENCE' },
  { label: '个人主页资料完善 (ONBOARDING_PROFILE)', value: 'ONBOARDING_PROFILE' },
];

export const TagInitialConfigDrawer: React.FC<TagInitialConfigDrawerProps> = ({
  open,
  tagTypes,
  allTags,
  onClose,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const {
    token: { colorBorderSecondary, colorPrimary },
  } = theme.useToken();

  const [currentScene, setCurrentScene] = useState<string>('REGISTER_FIRST_LOGIN');
  const [configs, setConfigs] = useState<InitialTagConfigItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [addModalOpen, setAddModalOpen] = useState<boolean>(false);

  // 移动端模拟器交互状态
  const [mockSelectedTags, setMockSelectedTags] = useState<Array<string | number>>([
    1001, 1009, 1020,
  ]);

  const [form] = Form.useForm();

  const fetchConfigs = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getInitialTagConfigPage({ scene: currentScene });
      if (res.code === 0 && res.data) {
        setConfigs(res.data.list);
      }
    } catch {
      message.error('加载初始配置失败');
    } finally {
      setLoading(false);
    }
  }, [currentScene]);

  useEffect(() => {
    if (open) {
      fetchConfigs();
    }
  }, [open, fetchConfigs]);

  const handleToggleStatus = async (item: InitialTagConfigItem, checked: boolean) => {
    const newStatus = checked ? 'active' : 'disabled';
    await updateInitialTagConfig({
      id: item.id,
      scene: item.scene,
      tagTypeId: item.tagTypeId,
      tagId: item.tagId,
      status: newStatus,
      sort: item.sort,
    });
    message.success(`已${checked ? '启用' : '禁用'}该条初始推荐配置`);
    fetchConfigs();
  };

  const handleDelete = async (id: string | number) => {
    try {
      await deleteInitialTagConfig(id);
      message.success('已移除该场景推荐配置');
      fetchConfigs();
    } catch {
      message.error('删除配置失败');
    }
  };

  const handleCreateSubmit = async () => {
    try {
      const values = await form.validateFields();
      const payload: AdminInitialTagConfigCreateReqVO = {
        scene: currentScene,
        tagTypeId: values.tagTypeId,
        tagId: values.targetType === 'specific' ? values.tagId : null,
        status: 'active',
        sort: values.sort || 1,
      };
      await createInitialTagConfig(payload);
      message.success('新增初始推荐规则成功');
      setAddModalOpen(false);
      form.resetFields();
      fetchConfigs();
    } catch {
      // 校验失败
    }
  };

  // 计算移动端预览中所展示的分类与标签集合
  const activeConfigs = configs.filter((c) => c.status === 'active');
  const previewCategories = activeConfigs.map((cfg) => {
    const category = tagTypes.find((t) => String(t.id) === String(cfg.tagTypeId));
    const matchedTags = cfg.tagId
      ? allTags.filter((t) => String(t.id) === String(cfg.tagId) && t.status === 'active')
      : allTags.filter(
          (t) => String(t.tagTypeId) === String(cfg.tagTypeId) && t.status === 'active',
        );

    return {
      cfgId: cfg.id,
      categoryId: cfg.tagTypeId,
      categoryName: category?.name || cfg.tagTypeName || '推荐分类',
      maxQuantity: category?.maxSelectQuantity ?? 0,
      tags: matchedTags,
    };
  });

  const handleMockTagClick = (tagId: string | number, maxQuantity: number) => {
    const isSelected = mockSelectedTags.some((id) => String(id) === String(tagId));
    if (isSelected) {
      setMockSelectedTags(mockSelectedTags.filter((id) => String(id) !== String(tagId)));
    } else {
      if (maxQuantity > 0) {
        // 简单模拟选标上限
        const currentCategoryTagIds = allTags.filter((t) => String(t.id) === String(tagId));
        const currentType = currentCategoryTagIds[0]?.tagTypeId;
        const selectedInThisType = mockSelectedTags.filter((id) => {
          const t = allTags.find((item) => String(item.id) === String(id));
          return String(t?.tagTypeId) === String(currentType);
        });
        if (selectedInThisType.length >= maxQuantity) {
          message.warning(`该分类在 App 端上限最多选 ${maxQuantity} 项`);
          return;
        }
      }
      setMockSelectedTags([...mockSelectedTags, tagId]);
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <SettingOutlined style={{ color: colorPrimary }} />
          <span>🎯 场景化初始标签推荐工作台 (Onboarding Tag Studio)</span>
        </Space>
      }
      open={open}
      onClose={onClose}
      width={1060}
      destroyOnClose
      extra={
        <Button icon={<ReloadOutlined />} onClick={fetchConfigs}>
          刷新
        </Button>
      }
    >
      <Row gutter={[24, 24]}>
        {/* 左侧：配置管理 */}
        <Col xs={24} lg={14}>
          <Card
            title={
              <div
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
              >
                <Space>
                  <Text strong>推荐业务场景：</Text>
                  <Select
                    value={currentScene}
                    onChange={(val) => setCurrentScene(val)}
                    style={{ width: 280 }}
                    options={SCENE_OPTIONS}
                  />
                </Space>
                <Button
                  type="primary"
                  size="small"
                  icon={<PlusOutlined />}
                  onClick={() => {
                    form.resetFields();
                    form.setFieldsValue({
                      targetType: 'all',
                      sort: configs.length + 1,
                    });
                    setAddModalOpen(true);
                  }}
                >
                  添加推荐
                </Button>
              </div>
            }
            bordered
            styles={{ body: { padding: 16 } }}
          >
            <Paragraph type="secondary" style={{ marginBottom: 16, fontSize: 13 }}>
              💡 针对特定场景配置展示标签规则。若未指定具体标签（即全部），则该分类下所有处于{' '}
              <code>active</code> 状态的标签均会展示给用户。
            </Paragraph>

            <Table<InitialTagConfigItem>
              rowKey="id"
              dataSource={configs}
              loading={loading}
              pagination={false}
              size="middle"
              columns={[
                {
                  title: '排序',
                  dataIndex: 'sort',
                  width: 65,
                  align: 'center',
                },
                {
                  title: '推荐分类',
                  dataIndex: 'tagTypeName',
                  render: (text) => <Text strong>{text}</Text>,
                },
                {
                  title: '推荐内容',
                  dataIndex: 'tagName',
                  render: (name, record) =>
                    record.tagId ? (
                      <Tag color="blue">{name}</Tag>
                    ) : (
                      <Tag color="green">全分类有效标签</Tag>
                    ),
                },
                {
                  title: '状态',
                  dataIndex: 'status',
                  width: 80,
                  render: (status, record) => (
                    <Switch
                      checked={status === 'active'}
                      size="small"
                      onChange={(checked) => handleToggleStatus(record, checked)}
                    />
                  ),
                },
                {
                  title: '操作',
                  key: 'action',
                  width: 70,
                  align: 'center',
                  render: (_, record) => (
                    <Popconfirm
                      title="确认移除该推荐配置？"
                      onConfirm={() => handleDelete(record.id)}
                      okText="确认"
                      cancelText="取消"
                    >
                      <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                    </Popconfirm>
                  ),
                },
              ]}
            />
          </Card>
        </Col>

        {/* 右侧：高仿移动端 App 所见即所得预览器 */}
        <Col xs={24} lg={10}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <Space style={{ marginBottom: 12 }}>
              <MobileOutlined style={{ fontSize: 18, color: colorPrimary }} />
              <Text strong>移动端 App 真实选标渲染预览 (所见即所得)</Text>
            </Space>

            {/* 手机外壳 */}
            <div
              style={{
                width: 330,
                minHeight: 560,
                borderRadius: 36,
                background: isDark ? '#141414' : '#ffffff',
                border: `8px solid ${isDark ? '#303030' : '#262626'}`,
                boxShadow: isDark ? '0 20px 40px rgba(0,0,0,0.8)' : '0 20px 40px rgba(0,0,0,0.15)',
                display: 'flex',
                flexDirection: 'column',
                overflow: 'hidden',
                position: 'relative',
              }}
            >
              {/* 手机刘海 / 状态栏 */}
              <div
                style={{
                  height: 38,
                  background: isDark ? '#1f1f1f' : '#f5f5f5',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0 20px',
                  fontSize: 11,
                  color: isDark ? '#aaa' : '#666',
                  borderBottom: `1px solid ${colorBorderSecondary}`,
                }}
              >
                <span>09:41</span>
                <div
                  style={{
                    width: 70,
                    height: 14,
                    background: isDark ? '#303030' : '#141414',
                    borderRadius: 10,
                  }}
                />
                <span>5G 100%</span>
              </div>

              {/* 模拟 App 顶部导航 */}
              <div
                style={{
                  padding: '12px 16px 8px',
                  borderBottom: `1px solid ${colorBorderSecondary}`,
                  textAlign: 'center',
                }}
              >
                <Title level={5} style={{ margin: 0, fontSize: 15 }}>
                  {currentScene === 'REGISTER_FIRST_LOGIN'
                    ? '定制你的专属兴趣标签'
                    : currentScene === 'ACTIVITY_PREFERENCE'
                      ? '挑选你热爱的活动类型'
                      : '个性化画像选择'}
                </Title>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  选择你感兴趣的标签，为你精准匹配同城玩伴
                </Text>
              </div>

              {/* 模拟 App 标签流式容器 */}
              <div
                style={{
                  flex: 1,
                  padding: 14,
                  overflowY: 'auto',
                  maxHeight: 380,
                }}
              >
                {previewCategories.length === 0 ? (
                  <Empty
                    image={Empty.PRESENTED_IMAGE_SIMPLE}
                    description="暂无生效的场景推荐配置"
                    style={{ marginTop: 60 }}
                  />
                ) : (
                  previewCategories.map((cat) => (
                    <div key={cat.cfgId} style={{ marginBottom: 16 }}>
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 8,
                        }}
                      >
                        <Text strong style={{ fontSize: 13 }}>
                          {cat.categoryName}
                        </Text>
                        <Badge
                          count={cat.maxQuantity === 0 ? '不限' : `限选 ${cat.maxQuantity} 项`}
                          style={{
                            backgroundColor: cat.maxQuantity === 0 ? '#52c41a' : colorPrimary,
                            fontSize: 10,
                          }}
                        />
                      </div>

                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px 8px' }}>
                        {cat.tags.map((t) => {
                          const isSelected = mockSelectedTags.some(
                            (id) => String(id) === String(t.id),
                          );
                          return (
                            <button
                              type="button"
                              key={t.id}
                              onClick={() => handleMockTagClick(t.id, cat.maxQuantity)}
                              style={{
                                padding: '4px 10px',
                                borderRadius: 16,
                                fontSize: 12,
                                cursor: 'pointer',
                                transition: 'all 0.2s',
                                border: isSelected
                                  ? `1px solid ${t.color || colorPrimary}`
                                  : `1px solid ${colorBorderSecondary}`,
                                background: isSelected
                                  ? `${t.color || colorPrimary}18`
                                  : isDark
                                    ? '#1f1f1f'
                                    : '#f9f9f9',
                                color: isSelected
                                  ? t.color || colorPrimary
                                  : isDark
                                    ? '#d9d9d9'
                                    : '#595959',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                fontWeight: isSelected ? 600 : 400,
                                outline: 'none',
                              }}
                            >
                              <span>{t.name}</span>
                              {isSelected && (
                                <CheckCircleFilled
                                  style={{ fontSize: 11, color: t.color || colorPrimary }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* 模拟 App 底部确认按钮 */}
              <div
                style={{
                  padding: '10px 16px',
                  borderTop: `1px solid ${colorBorderSecondary}`,
                  background: isDark ? '#181818' : '#fafafa',
                }}
              >
                <Button type="primary" block shape="round" style={{ fontWeight: 600, height: 38 }}>
                  确认并进入首页 (已选 {mockSelectedTags.length} 个)
                </Button>
              </div>
            </div>
          </div>
        </Col>
      </Row>

      {/* 新增推荐配置弹窗 */}
      <Modal
        title="添加场景初始推荐标签"
        open={addModalOpen}
        onOk={handleCreateSubmit}
        onCancel={() => setAddModalOpen(false)}
        destroyOnClose
        width={480}
        okText="确认添加"
        cancelText="取消"
      >
        <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item label="当前配置场景">
            <Tag color="purple">{currentScene}</Tag>
          </Form.Item>

          <Form.Item
            name="tagTypeId"
            label="推荐目标分类"
            rules={[{ required: true, message: '请选择推荐分类' }]}
          >
            <Select
              placeholder="请选择标签分类"
              options={tagTypes.map((t) => ({ label: t.name, value: t.id }))}
            />
          </Form.Item>

          <Form.Item name="targetType" label="推荐范围">
            <Radio.Group buttonStyle="solid">
              <Radio.Button value="all">全分类有效标签</Radio.Button>
              <Radio.Button value="specific">指定单个标签</Radio.Button>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            noStyle
            shouldUpdate={(prev, curr) =>
              prev.targetType !== curr.targetType || prev.tagTypeId !== curr.tagTypeId
            }
          >
            {({ getFieldValue }) =>
              getFieldValue('targetType') === 'specific' ? (
                <Form.Item
                  name="tagId"
                  label="具体指定标签"
                  rules={[{ required: true, message: '请选择具体标签' }]}
                >
                  <Select
                    placeholder="选择具体标签"
                    options={allTags
                      .filter(
                        (t) =>
                          !getFieldValue('tagTypeId') || t.tagTypeId === getFieldValue('tagTypeId'),
                      )
                      .map((t) => ({ label: t.name, value: t.id }))}
                  />
                </Form.Item>
              ) : null
            }
          </Form.Item>

          <Form.Item name="sort" label="展示排序权重">
            <InputNumber min={1} max={999} style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </Drawer>
  );
};

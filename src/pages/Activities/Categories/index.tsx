import {
  AppstoreOutlined,
  ArrowLeftOutlined,
  CheckCircleOutlined,
  CompassOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  ReloadOutlined,
  SafetyCertificateOutlined,
  TagOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  Empty,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Popconfirm,
  Row,
  Select,
  Space,
  Statistic,
  Switch,
  Table,
  Tag,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  createActivityCategory,
  createActivitySubcategory,
  deleteActivityCategory,
  deleteActivitySubcategory,
  getActivityCategoryList,
  getActivitySubcategoryList,
  updateActivityCategory,
  updateActivitySubcategory,
} from '@/api/activity';
import type { ActivityCategoryItem, ActivitySubcategoryItem } from '@/types';

const { Title, Text } = Typography;

export const ActivityCategoriesPage: React.FC = () => {
  const navigate = useNavigate();
  const {
    token: { colorPrimary, colorBgContainer, colorBorderSecondary, borderRadiusLG },
  } = theme.useToken();

  const [loading, setLoading] = useState<boolean>(false);
  const [categories, setCategories] = useState<ActivityCategoryItem[]>([]);
  const [subcategories, setSubcategories] = useState<ActivitySubcategoryItem[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('');

  // 大类弹窗
  const [categoryModalVisible, setCategoryModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ActivityCategoryItem | null>(null);
  const [categoryForm] = Form.useForm();

  // 子类弹窗
  const [subcategoryModalVisible, setSubcategoryModalVisible] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<ActivitySubcategoryItem | null>(
    null,
  );
  const [subcategoryForm] = Form.useForm();

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [catRes, subRes] = await Promise.all([
        getActivityCategoryList(),
        getActivitySubcategoryList(),
      ]);

      const catList = catRes.data || [];
      const subList = subRes.data || [];
      setCategories(catList);
      setSubcategories(subList);

      if (catList.length > 0) {
        setSelectedCategoryId((prev) =>
          prev && catList.some((c) => c.id === prev) ? prev : catList[0].id,
        );
      }
    } catch (err) {
      console.error(err);
      message.error('拉取活动主题与分类数据失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // 打开创建/编辑大类弹窗
  const handleOpenCategoryModal = (cat?: ActivityCategoryItem) => {
    if (cat) {
      setEditingCategory(cat);
      categoryForm.setFieldsValue(cat);
    } else {
      setEditingCategory(null);
      categoryForm.resetFields();
      categoryForm.setFieldsValue({ status: 1, sort: (categories.length + 1) * 10 });
    }
    setCategoryModalVisible(true);
  };

  const handleSaveCategory = async () => {
    try {
      const values = await categoryForm.validateFields();
      if (editingCategory) {
        await updateActivityCategory({ ...editingCategory, ...values });
        message.success('主题大类更新成功');
      } else {
        await createActivityCategory(values);
        message.success('主题大类创建成功');
      }
      setCategoryModalVisible(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteActivityCategory(id);
      message.success('已删除主题大类');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // 快捷切换大类状态
  const handleToggleCategoryStatus = async (cat: ActivityCategoryItem, checked: boolean) => {
    try {
      await updateActivityCategory({ ...cat, status: checked ? 1 : 0 });
      message.success(`大类「${cat.name}」已${checked ? '启用' : '停用'}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // 打开创建/编辑子类弹窗
  const handleOpenSubcategoryModal = (sub?: ActivitySubcategoryItem) => {
    if (sub) {
      setEditingSubcategory(sub);
      subcategoryForm.setFieldsValue(sub);
    } else {
      setEditingSubcategory(null);
      subcategoryForm.resetFields();
      subcategoryForm.setFieldsValue({
        categoryId: selectedCategoryId,
        status: 1,
        pageCode: 'category_1',
        requireRealName: false,
        sort: (filteredSubcategories.length + 1) * 10,
      });
    }
    setSubcategoryModalVisible(true);
  };

  const handleSaveSubcategory = async () => {
    try {
      const values = await subcategoryForm.validateFields();
      if (editingSubcategory) {
        await updateActivitySubcategory({ ...editingSubcategory, ...values });
        message.success('细分子类更新成功');
      } else {
        await createActivitySubcategory({ ...values, categoryId: selectedCategoryId });
        message.success('细分子类创建成功');
      }
      setSubcategoryModalVisible(false);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    try {
      await deleteActivitySubcategory(id);
      message.success('已删除细分子类');
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  // 快捷切换子类状态
  const handleToggleSubcategoryStatus = async (sub: ActivitySubcategoryItem, checked: boolean) => {
    try {
      await updateActivitySubcategory({ ...sub, status: checked ? 1 : 0 });
      message.success(`子类「${sub.name}」已${checked ? '启用' : '停用'}`);
      loadData();
    } catch (err) {
      console.error(err);
    }
  };

  const currentCategory = categories.find((c) => c.id === selectedCategoryId);
  const filteredSubcategories = subcategories.filter((s) => s.categoryId === selectedCategoryId);

  const subcategoryColumns = [
    {
      title: '细分子类',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: ActivitySubcategoryItem) => (
        <Space direction="vertical" size={2}>
          <Space size={6}>
            <Tag color="purple" style={{ margin: 0, fontWeight: 500 }}>
              {name}
            </Tag>
            {record.code && (
              <Text type="secondary" style={{ fontSize: 12 }}>
                ({record.code})
              </Text>
            )}
          </Space>
          {record.requireRealName && (
            <Tag color="cyan" style={{ fontSize: 11, padding: '0 4px', margin: 0 }}>
              <SafetyCertificateOutlined /> 报名须实名
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: '所属主题大类',
      key: 'categoryName',
      render: () => (
        <Tag color="blue" icon={<CompassOutlined />}>
          {currentCategory?.name || '未知主题'}
        </Tag>
      ),
    },
    {
      title: '页面流程模板',
      dataIndex: 'pageCode',
      key: 'pageCode',
      render: (code: string) => {
        const pageCodeMap: Record<string, string> = {
          category_1: '标准向导流程 (category_1)',
          category_2: '自驾结伴流程 (category_2)',
          category_3: '亲子研学流程 (category_3)',
          category_4: '摄影打卡流程 (category_4)',
          category_5: '运动约战流程 (category_5)',
        };
        return (
          <Text code style={{ fontSize: 12 }}>
            {pageCodeMap[code] || code || '默认向导'}
          </Text>
        );
      },
    },
    {
      title: '排序权重',
      dataIndex: 'sort',
      key: 'sort',
      width: 90,
      align: 'center' as const,
      sorter: (a: ActivitySubcategoryItem, b: ActivitySubcategoryItem) => a.sort - b.sort,
      render: (sort: number) => <Tag style={{ margin: 0 }}>{sort}</Tag>,
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 90,
      render: (status: number, record: ActivitySubcategoryItem) => (
        <Switch
          checked={status === 1}
          checkedChildren="启用"
          unCheckedChildren="停用"
          onChange={(checked) => handleToggleSubcategoryStatus(record, checked)}
        />
      ),
    },
    {
      title: '操作',
      key: 'action',
      width: 130,
      align: 'right' as const,
      render: (_: any, record: ActivitySubcategoryItem) => (
        <Space size={8}>
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleOpenSubcategoryModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确定删除该细分子类？"
            description="删除后，新活动将无法选择此细分类目。"
            onConfirm={() => handleDeleteSubcategory(record.id)}
            okText="删除"
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
      {/* 顶部统计与导航卡片 */}
      <Card
        style={{
          borderRadius: borderRadiusLG,
          border: `1px solid ${colorBorderSecondary}`,
          boxShadow: '0 1px 2px rgba(0, 0, 0, 0.03)',
        }}
        bodyStyle={{ padding: '18px 24px' }}
      >
        <Row justify="space-between" align="middle" gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Space align="center" size={12}>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: `${colorPrimary}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CompassOutlined style={{ color: colorPrimary, fontSize: 24 }} />
              </div>
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  活动分类管理
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  统一管控系统 7 大活动主题类目与细分子类字典，动态联动发布向导与多维检索
                </Text>
              </div>
            </Space>
          </Col>

          <Col xs={24} md={12}>
            <Row justify="end" align="middle" gutter={16}>
              <Col>
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      主题大类数
                    </Text>
                  }
                  value={categories.length}
                  prefix={<AppstoreOutlined style={{ color: colorPrimary, fontSize: 14 }} />}
                  valueStyle={{ fontSize: 18, fontWeight: 600 }}
                />
              </Col>
              <Col>
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      细分子类数
                    </Text>
                  }
                  value={subcategories.length}
                  prefix={<TagOutlined style={{ color: '#722ed1', fontSize: 14 }} />}
                  valueStyle={{ fontSize: 18, fontWeight: 600 }}
                />
              </Col>
              <Col>
                <Statistic
                  title={
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      启用中类目
                    </Text>
                  }
                  value={subcategories.filter((s) => s.status === 1).length}
                  prefix={<CheckCircleOutlined style={{ color: '#52c41a', fontSize: 14 }} />}
                  valueStyle={{ fontSize: 18, fontWeight: 600 }}
                />
              </Col>
              <Col>
                <Space>
                  <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/activities')}>
                    返回活动管理
                  </Button>
                  <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
                    刷新
                  </Button>
                  <Button
                    type="primary"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenCategoryModal()}
                  >
                    新增主题大类
                  </Button>
                </Space>
              </Col>
            </Row>
          </Col>
        </Row>
      </Card>

      {/* 主体工作台：左侧大类 + 右侧细分子类 */}
      <Row gutter={16}>
        {/* 左侧大类列表 */}
        <Col xs={24} lg={8}>
          <Card
            title={
              <Space>
                <FolderOpenOutlined style={{ color: colorPrimary }} />
                <span>主题大类列表</span>
                <Badge
                  count={categories.length}
                  style={{ backgroundColor: `${colorPrimary}20`, color: colorPrimary }}
                />
              </Space>
            }
            extra={
              <Button
                type="link"
                size="small"
                icon={<PlusOutlined />}
                onClick={() => handleOpenCategoryModal()}
              >
                新建大类
              </Button>
            }
            style={{
              borderRadius: borderRadiusLG,
              border: `1px solid ${colorBorderSecondary}`,
              minHeight: 560,
            }}
            bodyStyle={{ padding: '12px' }}
          >
            {categories.length === 0 && !loading ? (
              <Empty description="暂无主题大类" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {categories.map((cat) => {
                  const isSelected = cat.id === selectedCategoryId;
                  const catSubCount = subcategories.filter((s) => s.categoryId === cat.id).length;

                  return (
                    <div
                      key={cat.id}
                      onClick={() => setSelectedCategoryId(cat.id)}
                      style={{
                        padding: '12px 14px',
                        borderRadius: 8,
                        border: `1px solid ${isSelected ? colorPrimary : colorBorderSecondary}`,
                        background: isSelected ? `${colorPrimary}08` : colorBgContainer,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                      }}
                    >
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginBottom: 6,
                        }}
                      >
                        <Space align="center" size={8}>
                          <span style={{ fontSize: 18 }}>{cat.icon || '🏕️'}</span>
                          <span
                            style={{
                              fontWeight: isSelected ? 600 : 500,
                              fontSize: 14,
                              color: isSelected ? colorPrimary : undefined,
                            }}
                          >
                            {cat.name}
                          </span>
                          <Tag
                            color={cat.status === 1 ? 'success' : 'default'}
                            style={{ margin: 0, fontSize: 11 }}
                          >
                            {cat.status === 1 ? '启用' : '停用'}
                          </Tag>
                        </Space>

                        <Badge
                          count={`${catSubCount} 个细分子类`}
                          style={{
                            backgroundColor: isSelected ? colorPrimary : '#f0f0f0',
                            color: isSelected ? '#fff' : '#666',
                            fontSize: 11,
                          }}
                        />
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          fontSize: 12,
                          color: '#8c8c8c',
                        }}
                      >
                        <span>排序权重: {cat.sort}</span>
                        <Space
                          size={4}
                          onClick={(e) => e.stopPropagation()} // 阻止卡片选中冒泡
                        >
                          <Switch
                            size="small"
                            checked={cat.status === 1}
                            onChange={(checked) => handleToggleCategoryStatus(cat, checked)}
                          />
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenCategoryModal(cat)}
                          />
                          <Popconfirm
                            title="确定删除该大类？"
                            description="删除大类后其下的细分子类将失去归属。"
                            onConfirm={() => handleDeleteCategory(cat.id)}
                            okText="删除"
                            cancelText="取消"
                            okButtonProps={{ danger: true }}
                          >
                            <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                          </Popconfirm>
                        </Space>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </Card>
        </Col>

        {/* 右侧细分子类表格 */}
        <Col xs={24} lg={16}>
          <Card
            title={
              <Space>
                <TagOutlined style={{ color: '#722ed1' }} />
                <span>【{currentCategory?.name || '全部'}】细分子类管理</span>
                <Badge
                  count={filteredSubcategories.length}
                  style={{ backgroundColor: '#722ed120', color: '#722ed1' }}
                />
              </Space>
            }
            extra={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => handleOpenSubcategoryModal()}
                disabled={!selectedCategoryId}
              >
                新增细分子类
              </Button>
            }
            style={{
              borderRadius: borderRadiusLG,
              border: `1px solid ${colorBorderSecondary}`,
              minHeight: 560,
            }}
          >
            <Table
              dataSource={filteredSubcategories}
              columns={subcategoryColumns}
              rowKey="id"
              loading={loading}
              pagination={false}
              locale={{
                emptyText: (
                  <Empty
                    description={
                      <span>
                        当前主题大类暂无细分子类，点击右上角
                        <Text strong>「新增细分子类」</Text>添加
                      </span>
                    }
                  />
                ),
              }}
            />
          </Card>
        </Col>
      </Row>

      {/* 创建/编辑主题大类弹窗 */}
      <Modal
        title={editingCategory ? '编辑主题大类' : '新增主题大类'}
        open={categoryModalVisible}
        onOk={handleSaveCategory}
        onCancel={() => setCategoryModalVisible(false)}
        destroyOnClose
        okText="保存"
        cancelText="取消"
      >
        <Form form={categoryForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="大类名称"
            rules={[{ required: true, message: '请输入大类名称' }]}
          >
            <Input placeholder="如：户外运动、摄影创作、自驾与旅行" maxLength={20} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="icon"
                label="展示图标 / Emoji"
                rules={[{ required: true, message: '请选择或输入图标' }]}
              >
                <Select
                  placeholder="选择图标"
                  options={[
                    { label: '🏕️ 露营与户外', value: '🏕️' },
                    { label: '🚗 自驾旅行', value: '🚗' },
                    { label: '👨‍👩‍👧 亲子家庭', value: '👨‍👩‍👧' },
                    { label: '📸 摄影创作', value: '📸' },
                    { label: '⚽ 球类运动', value: '⚽' },
                    { label: '🎨 文化艺术', value: '🎨' },
                    { label: '🍵 生活休闲', value: '🍵' },
                    { label: '🏔️ 登山攀登', value: '🏔️' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sort"
                label="排序权重"
                rules={[{ required: true, message: '请输入排序权重' }]}
              >
                <InputNumber min={1} max={999} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="status" label="启用状态" valuePropName="checked" initialValue={1}>
            <Switch
              checkedChildren="启用"
              unCheckedChildren="停用"
              defaultChecked
              onChange={(checked) => categoryForm.setFieldsValue({ status: checked ? 1 : 0 })}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 创建/编辑细分子类弹窗 */}
      <Modal
        title={editingSubcategory ? '编辑细分子类' : '新增细分子类'}
        open={subcategoryModalVisible}
        onOk={handleSaveSubcategory}
        onCancel={() => setSubcategoryModalVisible(false)}
        destroyOnClose
        okText="保存"
        cancelText="取消"
      >
        <Form form={subcategoryForm} layout="vertical" style={{ marginTop: 16 }}>
          <Form.Item
            name="name"
            label="子类名称"
            rules={[{ required: true, message: '请输入子类名称' }]}
          >
            <Input placeholder="如：城市徒步、飞盘争夺赛、人像外拍" maxLength={20} />
          </Form.Item>

          <Form.Item
            name="code"
            label="子类英文编码"
            rules={[{ required: true, message: '请输入子类编码' }]}
          >
            <Input placeholder="如：hiking、frisbee、portrait" maxLength={30} />
          </Form.Item>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="pageCode"
                label="页面流程模板"
                rules={[{ required: true, message: '请选择流程模板' }]}
              >
                <Select
                  options={[
                    { label: '标准活动流程 (category_1)', value: 'category_1' },
                    { label: '自驾结伴流程 (category_2)', value: 'category_2' },
                    { label: '亲子研学流程 (category_3)', value: 'category_3' },
                    { label: '摄影打卡流程 (category_4)', value: 'category_4' },
                    { label: '运动约战流程 (category_5)', value: 'category_5' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="sort"
                label="排序权重"
                rules={[{ required: true, message: '请输入排序权重' }]}
              >
                <InputNumber min={1} max={999} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="requireRealName" label="报名是否须实名认证" valuePropName="checked">
                <Switch checkedChildren="强制实名" unCheckedChildren="不强制" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="启用状态" valuePropName="checked">
                <Switch
                  checkedChildren="启用"
                  unCheckedChildren="停用"
                  defaultChecked
                  onChange={(checked) =>
                    subcategoryForm.setFieldsValue({ status: checked ? 1 : 0 })
                  }
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </div>
  );
};

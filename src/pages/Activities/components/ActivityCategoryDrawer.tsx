import {
  CompassOutlined,
  DeleteOutlined,
  EditOutlined,
  FolderOpenOutlined,
  PlusOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Col,
  Drawer,
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
  Switch,
  Table,
  Tag,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
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

interface ActivityCategoryDrawerProps {
  open: boolean;
  onClose: () => void;
  onCategoriesChange?: () => void;
}

export const ActivityCategoryDrawer: React.FC<ActivityCategoryDrawerProps> = ({
  open,
  onClose,
  onCategoriesChange,
}) => {
  const {
    token: { colorPrimary, colorBgContainer, colorBorderSecondary },
  } = theme.useToken();

  const [loading, setLoading] = useState(false);
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
      message.error('拉取活动主题与分类失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, loadData]);

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
        message.success('大类更新成功');
      } else {
        await createActivityCategory(values);
        message.success('大类创建成功');
      }
      setCategoryModalVisible(false);
      loadData();
      onCategoriesChange?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteActivityCategory(id);
      message.success('已删除大类');
      loadData();
      onCategoriesChange?.();
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
        message.success('子类更新成功');
      } else {
        await createActivitySubcategory({ ...values, categoryId: selectedCategoryId });
        message.success('子类创建成功');
      }
      setSubcategoryModalVisible(false);
      loadData();
      onCategoriesChange?.();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteSubcategory = async (id: string) => {
    try {
      await deleteActivitySubcategory(id);
      message.success('已删除子类');
      loadData();
      onCategoriesChange?.();
    } catch (err) {
      console.error(err);
    }
  };

  const currentCategory = categories.find((c) => c.id === selectedCategoryId);
  const filteredSubcategories = subcategories.filter((s) => s.categoryId === selectedCategoryId);

  return (
    <>
      <Drawer
        title={
          <Space align="center" size={10}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: `${colorPrimary}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <CompassOutlined style={{ color: colorPrimary, fontSize: 18 }} />
            </div>
            <div>
              <div style={{ fontWeight: 600, fontSize: 16 }}>活动主题与分类字典配置</div>
              <Text type="secondary" style={{ fontSize: 12 }}>
                管理后端 7 大活动主题类目、细分子类与应用页面流程
              </Text>
            </div>
          </Space>
        }
        open={open}
        onClose={onClose}
        width={960}
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={loadData} loading={loading}>
              刷新数据
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => handleOpenCategoryModal()}
            >
              新增主题大类
            </Button>
          </Space>
        }
      >
        <Row gutter={16} style={{ height: '100%' }}>
          {/* 左侧大类列表 */}
          <Col
            span={8}
            style={{ borderRight: `1px solid ${colorBorderSecondary}`, paddingRight: 16 }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 12,
              }}
            >
              <Text strong style={{ fontSize: 14 }}>
                主题大类 ({categories.length})
              </Text>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, overflowY: 'auto' }}>
              {categories.map((cat) => {
                const isSelected = cat.id === selectedCategoryId;
                const subCount = subcategories.filter((s) => s.categoryId === cat.id).length;

                return (
                  <div
                    key={cat.id}
                    onClick={() => setSelectedCategoryId(cat.id)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: 8,
                      border: `1px solid ${isSelected ? colorPrimary : colorBorderSecondary}`,
                      background: isSelected ? `${colorPrimary}0d` : colorBgContainer,
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Space size={8}>
                        <FolderOpenOutlined
                          style={{
                            color: isSelected ? colorPrimary : '#8c8c8c',
                            fontSize: 16,
                          }}
                        />
                        <Text
                          strong={isSelected}
                          style={{ color: isSelected ? colorPrimary : undefined }}
                        >
                          {cat.name}
                        </Text>
                      </Space>
                      <Badge
                        count={subCount}
                        style={{
                          backgroundColor: isSelected ? colorPrimary : '#d9d9d9',
                          color: isSelected ? '#fff' : '#595959',
                        }}
                      />
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginTop: 6,
                        fontSize: 12,
                      }}
                    >
                      <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>
                        {cat.code} · 排序:{cat.sort}
                      </Text>
                      <Space size={4}>
                        <Button
                          type="text"
                          size="small"
                          icon={<EditOutlined style={{ fontSize: 12 }} />}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleOpenCategoryModal(cat);
                          }}
                        />
                        <Popconfirm
                          title="确定删除此大类及关联配置？"
                          onConfirm={(e) => {
                            e?.stopPropagation();
                            handleDeleteCategory(cat.id);
                          }}
                        >
                          <Button
                            type="text"
                            danger
                            size="small"
                            icon={<DeleteOutlined style={{ fontSize: 12 }} />}
                            onClick={(e) => e.stopPropagation()}
                          />
                        </Popconfirm>
                      </Space>
                    </div>
                  </div>
                );
              })}
            </div>
          </Col>

          {/* 右侧细分子类列表 */}
          <Col span={16} style={{ paddingLeft: 12 }}>
            {currentCategory ? (
              <div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    marginBottom: 16,
                  }}
                >
                  <Space align="center" size={8}>
                    <Title level={5} style={{ margin: 0 }}>
                      {currentCategory.name}
                    </Title>
                    <Tag color="blue">{currentCategory.code}</Tag>
                    <Tag color={currentCategory.status === 1 ? 'success' : 'default'}>
                      {currentCategory.status === 1 ? '已启用' : '已禁用'}
                    </Tag>
                  </Space>

                  <Button
                    type="primary"
                    size="small"
                    icon={<PlusOutlined />}
                    onClick={() => handleOpenSubcategoryModal()}
                  >
                    新增子类
                  </Button>
                </div>

                <Table<ActivitySubcategoryItem>
                  rowKey="id"
                  size="small"
                  pagination={{ pageSize: 8 }}
                  dataSource={filteredSubcategories}
                  columns={[
                    {
                      title: '子类名称',
                      dataIndex: 'name',
                      key: 'name',
                      render: (text, record) => (
                        <Space direction="vertical" size={2}>
                          <Text strong>{text}</Text>
                          <Text type="secondary" style={{ fontSize: 11, fontFamily: 'monospace' }}>
                            {record.code}
                          </Text>
                        </Space>
                      ),
                    },
                    {
                      title: '逻辑页面',
                      dataIndex: 'pageCode',
                      key: 'pageCode',
                      width: 120,
                      render: (page) => (
                        <Tag
                          color={
                            page === 'category_2'
                              ? 'gold'
                              : page === 'category_3'
                                ? 'magenta'
                                : 'default'
                          }
                        >
                          {page || 'category_1'}
                        </Tag>
                      ),
                    },
                    {
                      title: '特性要求',
                      key: 'features',
                      width: 130,
                      render: (_, record) => (
                        <Space size={4} wrap>
                          {record.requireRealName && (
                            <Tag color="orange" style={{ margin: 0 }}>
                              需实名
                            </Tag>
                          )}
                          {record.featureEquipment && (
                            <Tag color="cyan" style={{ margin: 0 }}>
                              配装备
                            </Tag>
                          )}
                          {!record.requireRealName && !record.featureEquipment && (
                            <Text type="secondary" style={{ fontSize: 12 }}>
                              标准流程
                            </Text>
                          )}
                        </Space>
                      ),
                    },
                    {
                      title: '状态',
                      dataIndex: 'status',
                      key: 'status',
                      width: 80,
                      render: (val) => (
                        <Tag color={val === 1 ? 'success' : 'default'}>
                          {val === 1 ? '启用' : '禁用'}
                        </Tag>
                      ),
                    },
                    {
                      title: '操作',
                      key: 'action',
                      width: 100,
                      render: (_, record) => (
                        <Space size={2}>
                          <Button
                            type="text"
                            size="small"
                            icon={<EditOutlined />}
                            onClick={() => handleOpenSubcategoryModal(record)}
                          />
                          <Popconfirm
                            title="确定删除此子类？"
                            onConfirm={() => handleDeleteSubcategory(record.id)}
                          >
                            <Button type="text" danger size="small" icon={<DeleteOutlined />} />
                          </Popconfirm>
                        </Space>
                      ),
                    },
                  ]}
                />
              </div>
            ) : (
              <Empty description="请选择左侧的主题大类" style={{ marginTop: 80 }} />
            )}
          </Col>
        </Row>
      </Drawer>

      {/* 大类新建/编辑弹窗 */}
      <Modal
        title={editingCategory ? '编辑主题大类' : '新建主题大类'}
        open={categoryModalVisible}
        onOk={handleSaveCategory}
        onCancel={() => setCategoryModalVisible(false)}
        destroyOnClose
      >
        <Form form={categoryForm} layout="vertical">
          <Form.Item
            name="name"
            label="主题大类名称"
            rules={[{ required: true, message: '请输入大类名称' }]}
          >
            <Input placeholder="例如：户外运动、文化休闲" />
          </Form.Item>
          <Form.Item
            name="code"
            label="大类业务编码 (唯一标识)"
            rules={[{ required: true, message: '请输入业务编码' }]}
          >
            <Input placeholder="例如：outdoor, culture, ball" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="sort" label="排序权重">
                <InputNumber min={1} max={999} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="status" label="状态">
                <Select
                  options={[
                    { label: '启用', value: 1 },
                    { label: '禁用', value: 0 },
                  ]}
                />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>

      {/* 子类新建/编辑弹窗 */}
      <Modal
        title={editingSubcategory ? '编辑活动子类' : '新建活动子类'}
        open={subcategoryModalVisible}
        onOk={handleSaveSubcategory}
        onCancel={() => setSubcategoryModalVisible(false)}
        destroyOnClose
      >
        <Form form={subcategoryForm} layout="vertical">
          <Form.Item
            name="name"
            label="子类名称"
            rules={[{ required: true, message: '请输入子类名称' }]}
          >
            <Input placeholder="例如：高山徒步、露营、羽毛球" />
          </Form.Item>
          <Form.Item
            name="code"
            label="子类业务编码"
            rules={[{ required: true, message: '请输入子类编码' }]}
          >
            <Input placeholder="例如：hiking, camping, badminton" />
          </Form.Item>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="pageCode" label="App 流程逻辑页面">
                <Select
                  options={[
                    { label: '标准流程 (category_1)', value: 'category_1' },
                    { label: '线路路线流程 (category_2)', value: 'category_2' },
                    { label: '摄影模特流程 (category_3)', value: 'category_3' },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="sort" label="排序权重">
                <InputNumber min={1} max={999} style={{ width: '100%' }} />
              </Form.Item>
            </Col>
          </Row>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="status" label="启用状态">
                <Select
                  options={[
                    { label: '启用', value: 1 },
                    { label: '禁用', value: 0 },
                  ]}
                />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="requireRealName" label="实名认证要求" valuePropName="checked">
                <Switch checkedChildren="强制实名" unCheckedChildren="非实名" />
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Modal>
    </>
  );
};

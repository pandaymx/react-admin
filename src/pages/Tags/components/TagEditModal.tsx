import { Form, Input, InputNumber, Modal, Radio, Select, Space, Tag } from 'antd';
import type React from 'react';
import { useEffect } from 'react';
import type { AdminTagCreateReqVO, AdminTagUpdateReqVO, TagItem, TagTypeItem } from '@/types';

interface TagEditModalProps {
  open: boolean;
  editingItem: TagItem | null;
  tagTypes: TagTypeItem[];
  defaultTagTypeId?: string | number;
  onClose: () => void;
  onSubmit: (values: AdminTagCreateReqVO | AdminTagUpdateReqVO) => Promise<void>;
}

const PRESET_COLORS = [
  { label: '科技蓝', color: '#1890ff' },
  { label: '极光青', color: '#13c2c2' },
  { label: '极客绿', color: '#52c41a' },
  { label: '阳光橙', color: '#fa8c16' },
  { label: '热情红', color: '#f5222d' },
  { label: '优雅紫', color: '#722ed1' },
  { label: '浪漫粉', color: '#eb2f96' },
  { label: '高级灰', color: '#595959' },
];

export const TagEditModal: React.FC<TagEditModalProps> = ({
  open,
  editingItem,
  tagTypes,
  defaultTagTypeId,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (editingItem) {
        form.setFieldsValue({
          tagTypeId: editingItem.tagTypeId,
          name: editingItem.name,
          color: editingItem.color || '#1890ff',
          status: editingItem.status,
          sort: editingItem.sort,
          iconUrl: editingItem.iconUrl || '',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          tagTypeId: defaultTagTypeId || tagTypes[0]?.id,
          color: '#1890ff',
          status: 'active',
          sort: 1,
        });
      }
    }
  }, [open, editingItem, defaultTagTypeId, tagTypes, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await onSubmit({ ...values, id: editingItem.id });
      } else {
        await onSubmit(values);
      }
    } catch {
      // 校验失败
    }
  };

  return (
    <Modal
      title={editingItem ? '编辑标签' : '添加新标签'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      destroyOnClose
      width={520}
      okText="确认保存"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="tagTypeId"
          label="所属分类"
          rules={[{ required: true, message: '请选择所属分类' }]}
        >
          <Select
            placeholder="请选择标签所属分类"
            options={tagTypes.map((t) => ({
              label: `${t.name} (限选: ${t.maxSelectQuantity === 0 ? '不限' : `${t.maxSelectQuantity}项`})`,
              value: t.id,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="name"
          label="标签名称"
          rules={[
            { required: true, message: '请输入标签名称' },
            { max: 20, message: '标签名称不能超过 20 个字符' },
          ]}
        >
          <Input placeholder="例如：高山徒步、羽毛球双打、严谨计划 J人" />
        </Form.Item>

        <Form.Item name="color" label="专属主题色">
          <Select
            placeholder="请选择标签主题色"
            options={PRESET_COLORS.map((c) => ({
              label: (
                <Space>
                  <Tag color={c.color} style={{ margin: 0 }}>
                    {c.label}
                  </Tag>
                  <span style={{ color: '#888', fontSize: 12 }}>{c.color}</span>
                </Space>
              ),
              value: c.color,
            }))}
          />
        </Form.Item>

        <Form.Item name="iconUrl" label="图标链接 (选填)">
          <Input placeholder="可输入 CDN 图标地址，如 https://.../icon.png" />
        </Form.Item>

        <Form.Item name="status" label="启用状态" rules={[{ required: true }]}>
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="active">正常启用</Radio.Button>
            <Radio.Button value="disabled">暂时停用</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="sort"
          label="展示排序"
          extra="数字越小，在同分类中展示越靠前"
          rules={[{ required: true, message: '请输入排序' }]}
        >
          <InputNumber min={1} max={9999} style={{ width: '100%' }} />
        </Form.Item>
      </Form>
    </Modal>
  );
};

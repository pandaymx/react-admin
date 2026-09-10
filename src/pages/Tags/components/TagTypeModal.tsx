import {
  CameraOutlined,
  CompassOutlined,
  FolderOutlined,
  SafetyCertificateOutlined,
  SmileOutlined,
  TagOutlined,
  TrophyOutlined,
} from '@ant-design/icons';
import { Form, Input, InputNumber, Modal, Radio, Select, Space, Typography } from 'antd';
import type React from 'react';
import { useEffect } from 'react';
import type { AdminTagTypeCreateReqVO, AdminTagTypeUpdateReqVO, TagTypeItem } from '@/types';

const { Text } = Typography;

interface TagTypeModalProps {
  open: boolean;
  editingItem: TagTypeItem | null;
  onClose: () => void;
  onSubmit: (values: AdminTagTypeCreateReqVO | AdminTagTypeUpdateReqVO) => Promise<void>;
}

const PRESET_ICONS = [
  { label: '罗盘导航 (户外/探索)', value: 'CompassOutlined', icon: <CompassOutlined /> },
  { label: '奖杯竞技 (运动/比赛)', value: 'TrophyOutlined', icon: <TrophyOutlined /> },
  { label: '相机生活 (摄影/休闲)', value: 'CameraOutlined', icon: <CameraOutlined /> },
  { label: '微笑特征 (性格/社交)', value: 'SmileOutlined', icon: <SmileOutlined /> },
  {
    label: '安全认证 (技能/资质)',
    value: 'SafetyCertificateOutlined',
    icon: <SafetyCertificateOutlined />,
  },
  { label: '标签徽章 (通用)', value: 'TagOutlined', icon: <TagOutlined /> },
  { label: '文件夹 (归档/其它)', value: 'FolderOutlined', icon: <FolderOutlined /> },
];

export const TagTypeModal: React.FC<TagTypeModalProps> = ({
  open,
  editingItem,
  onClose,
  onSubmit,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      if (editingItem) {
        form.setFieldsValue({
          name: editingItem.name,
          status: editingItem.status,
          maxSelectQuantity: editingItem.maxSelectQuantity,
          sort: editingItem.sort,
          description: editingItem.description || '',
          icon: editingItem.icon || 'TagOutlined',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: 'active',
          maxSelectQuantity: 0,
          sort: 1,
          icon: 'TagOutlined',
        });
      }
    }
  }, [open, editingItem, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await onSubmit({ ...values, id: editingItem.id });
      } else {
        await onSubmit(values);
      }
    } catch {
      // 表单验证未通过
    }
  };

  return (
    <Modal
      title={editingItem ? '编辑标签类型分类' : '新建标签类型分类'}
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      destroyOnClose
      width={540}
      okText="确认保存"
      cancelText="取消"
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item
          name="name"
          label="分类名称"
          rules={[
            { required: true, message: '请输入分类名称' },
            { max: 30, message: '分类名称不能超过 30 个字符' },
          ]}
        >
          <Input placeholder="例如：户外运动、球类竞技、性格特征" />
        </Form.Item>

        <Form.Item name="icon" label="代表图标">
          <Select
            placeholder="请选择代表图标"
            options={PRESET_ICONS.map((i) => ({
              label: (
                <Space>
                  {i.icon}
                  <span>{i.label}</span>
                </Space>
              ),
              value: i.value,
            }))}
          />
        </Form.Item>

        <Form.Item
          name="maxSelectQuantity"
          label="单次最大可选数量限制"
          extra={
            <Text type="secondary">
              设置为 0 表示不限制，用户在 App 端可无上限自由多选此分类下的标签。
            </Text>
          }
        >
          <InputNumber min={0} max={50} style={{ width: '100%' }} placeholder="0 为不限制" />
        </Form.Item>

        <Form.Item name="status" label="启用状态" rules={[{ required: true }]}>
          <Radio.Group buttonStyle="solid">
            <Radio.Button value="active">正常启用</Radio.Button>
            <Radio.Button value="disabled">停用归档</Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          name="sort"
          label="排序权重"
          extra="数字越小，在 App 端展示时排序越靠前"
          rules={[{ required: true, message: '请输入排序权重' }]}
        >
          <InputNumber min={1} max={9999} style={{ width: '100%' }} />
        </Form.Item>

        <Form.Item name="description" label="分类说明与指引">
          <Input.TextArea
            rows={3}
            placeholder="填写该分类面向用户群体的业务定义、选标规范等"
            maxLength={120}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

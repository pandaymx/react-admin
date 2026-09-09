import { Form, Input, Modal, message, Radio, Select } from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import { createSensitiveWord, updateSensitiveWord } from '@/api/sensitiveWord';
import type { SensitiveWordItem, SensitiveWordSaveReqVO } from '@/types';

interface SensitiveWordModalProps {
  open: boolean;
  record?: SensitiveWordItem | null;
  availableTags: string[];
  onClose: () => void;
  onSuccess: () => void;
}

export const SensitiveWordModal: React.FC<SensitiveWordModalProps> = ({
  open,
  record,
  availableTags,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const isEdit = !!record;

  useEffect(() => {
    if (open) {
      if (record) {
        form.setFieldsValue({
          name: record.name,
          tags: record.tags || [],
          status: record.status,
          description: record.description || '',
        });
      } else {
        form.resetFields();
        form.setFieldsValue({
          status: 0,
          tags: ['广告'],
        });
      }
    }
  }, [open, record, form]);

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setSubmitting(true);

      const payload: SensitiveWordSaveReqVO = {
        id: record?.id,
        name: values.name.trim(),
        tags: values.tags || [],
        status: values.status,
        description: values.description?.trim() || '',
      };

      if (isEdit) {
        const res = await updateSensitiveWord(payload);
        if (res.code === 200 || res.code === 0) {
          message.success('敏感词修改成功');
          onSuccess();
          onClose();
        }
      } else {
        const res = await createSensitiveWord(payload);
        if (res.code === 200 || res.code === 0) {
          message.success('敏感词添加成功');
          onSuccess();
          onClose();
        }
      }
    } catch (err: any) {
      if (err?.errorFields) return;
      message.error(err?.message || (isEdit ? '修改失败' : '添加失败'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={isEdit ? '编辑敏感词' : '新增敏感词'}
      open={open}
      onOk={handleSubmit}
      onCancel={onClose}
      confirmLoading={submitting}
      destroyOnClose
      okText={isEdit ? '确认更新' : '立即创建'}
      cancelText="取消"
      width={520}
    >
      <Form form={form} layout="vertical" preserve={false} style={{ marginTop: 16 }}>
        <Form.Item
          label="敏感词汇"
          name="name"
          rules={[
            { required: true, message: '请输入敏感词名称' },
            { max: 50, message: '敏感词长度不可超过 50 个字符' },
          ]}
        >
          <Input placeholder="输入违规/违禁/引流/辱骂等关键词" allowClear autoFocus />
        </Form.Item>

        <Form.Item
          label="标签类别"
          name="tags"
          rules={[{ required: true, message: '请至少选择或输入一个标签类别' }]}
          extra="支持选择现有分类，也可直接输入文字按回车自定义新标签"
        >
          <Select
            mode="tags"
            style={{ width: '100%' }}
            placeholder="请选择或输入分类标签"
            options={availableTags.map((tag) => ({ label: tag, value: tag }))}
          />
        </Form.Item>

        <Form.Item label="生效状态" name="status" rules={[{ required: true }]}>
          <Radio.Group>
            <Radio value={0}>🟢 启用生效中</Radio>
            <Radio value={1}>🔴 暂停停用中</Radio>
          </Radio.Group>
        </Form.Item>

        <Form.Item label="备注说明" name="description">
          <Input.TextArea
            rows={3}
            placeholder="填写该敏感词的处置场景、风控规则或背景来源（选填）"
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

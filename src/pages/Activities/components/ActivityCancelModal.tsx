import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Form, Input, Modal } from 'antd';
import type React from 'react';
import { useEffect } from 'react';
import type { ActivityItem } from '@/types';

interface ActivityCancelModalProps {
  open: boolean;
  activity: ActivityItem | null;
  onClose: () => void;
  onConfirm: (id: string, reason: string) => Promise<void>;
}

export const ActivityCancelModal: React.FC<ActivityCancelModalProps> = ({
  open,
  activity,
  onClose,
  onConfirm,
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      form.resetFields();
    }
  }, [open, form]);

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (activity) {
        await onConfirm(activity.id, values.reason);
      }
    } catch {
      // 校验失败
    }
  };

  if (!activity) return null;

  return (
    <Modal
      title={
        <span style={{ color: '#fa8c16' }}>
          <ExclamationCircleOutlined style={{ marginRight: 8 }} />
          取消活动确认
        </span>
      }
      open={open}
      onOk={handleOk}
      onCancel={onClose}
      okText="确认取消该活动"
      okButtonProps={{ danger: true }}
      cancelText="暂不取消"
      destroyOnClose
    >
      <div style={{ margin: '16px 0' }}>
        <p>
          您正在取消活动：<strong>{activity.title}</strong>
        </p>
        <p style={{ color: '#888', fontSize: 13 }}>
          当前已有 <strong>{activity.currentEnrollCount}</strong>{' '}
          人报名。活动取消后将向已报名用户触发全额自动原路退款及系统退订站内信。
        </p>
      </div>

      <Form form={form} layout="vertical">
        <Form.Item
          name="reason"
          label="取消原因说明 (必填，将同步通知所有已报名用户)"
          rules={[
            { required: true, message: '请输入活动取消原因' },
            { min: 5, message: '原因说明至少需要 5 个字' },
          ]}
        >
          <Input.TextArea
            rows={4}
            placeholder="例如：因气象局发布突发暴雨恶劣天气橙色预警，为确保人员绝对安全，本次活动暂停举办并全额退款。"
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

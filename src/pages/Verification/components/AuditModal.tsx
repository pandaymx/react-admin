import { Form, Input, Modal, message, Radio } from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import { auditVerification } from '@/api/verification';
import type { AuditStatus } from '@/types';

interface AuditModalProps {
  open: boolean;
  type: 'personal' | 'enterprise';
  recordId: string | null;
  targetName: string;
  onSuccess: () => void;
  onCancel: () => void;
}

export const AuditModal: React.FC<AuditModalProps> = ({
  open,
  type,
  recordId,
  targetName,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [action, setAction] = useState<AuditStatus>('approved');

  useEffect(() => {
    if (open) {
      form.resetFields();
      setAction('approved');
      form.setFieldsValue({
        status: 'approved',
        remark: '认证材料真实有效，符合平台认证规范。',
      });
    }
  }, [open, form]);

  const handleStatusChange = (val: AuditStatus) => {
    setAction(val);
    if (val === 'approved') {
      form.setFieldsValue({ remark: '认证材料真实有效，符合平台认证规范。' });
    } else {
      form.setFieldsValue({ remark: '证件信息不清晰或与申请主体不符，请重新上传。' });
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!recordId) return;

      setSubmitting(true);
      const res = await auditVerification(recordId, type, values.status, values.remark);
      if (res.code === 200) {
        message.success(res.message);
        onSuccess();
      }
    } catch {
      // 验证未通过或请求错误
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={`审核【${targetName}】的${type === 'personal' ? '个人' : '企业'}认证申请`}
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      okText={action === 'approved' ? '审核通过' : '确认驳回'}
      okButtonProps={{ danger: action === 'rejected' }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item label="审核结果" name="status" rules={[{ required: true }]}>
          <Radio.Group onChange={(e) => handleStatusChange(e.target.value)}>
            <Radio.Button value="approved" style={{ color: '#52c41a' }}>
              审核通过
            </Radio.Button>
            <Radio.Button value="rejected" style={{ color: '#ff4d4f' }}>
              驳回申请
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        <Form.Item
          label="审核备注 / 处理原因"
          name="remark"
          rules={[{ required: action === 'rejected', message: '驳回时请必须填写驳回原因' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="请输入审核说明或驳回原因"
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default AuditModal;

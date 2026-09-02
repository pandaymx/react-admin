import { Form, Input, Modal, message, Radio, Select, Space } from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';

import { handleReport } from '@/api/report';
import type { PenaltyAction, ReportItem, ReportStatus } from '@/types';

interface HandleReportModalProps {
  open: boolean;
  report: ReportItem | null;
  onSuccess: () => void;
  onCancel: () => void;
}

export const HandleReportModal: React.FC<HandleReportModalProps> = ({
  open,
  report,
  onSuccess,
  onCancel,
}) => {
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [status, setStatus] = useState<ReportStatus>('processed');

  useEffect(() => {
    if (open && report) {
      form.resetFields();
      setStatus('processed');

      let defaultPenalty: PenaltyAction = 'warn_user';
      if (report.targetType === 'post') {
        defaultPenalty = 'ban_post';
      } else if (report.targetType === 'comment') {
        defaultPenalty = 'delete_comment';
      } else {
        defaultPenalty = 'mute_user';
      }

      form.setFieldsValue({
        status: 'processed',
        penaltyAction: defaultPenalty,
        handleRemark: '经平台安全风控核查，举报内容属实，已执行相应违规处罚。',
      });
    }
  }, [open, report, form]);

  const handleStatusChange = (val: ReportStatus) => {
    setStatus(val);
    if (val === 'processed') {
      form.setFieldsValue({
        handleRemark: '经平台安全风控核查，举报内容属实，已执行相应违规处罚。',
      });
    } else {
      form.setFieldsValue({
        penaltyAction: 'none',
        handleRemark: '经平台核验，未发现实质性违规证据或证据不足，举报予以驳回。',
      });
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      if (!report) return;

      setSubmitting(true);
      const res = await handleReport(
        report.id,
        values.status,
        values.penaltyAction || 'none',
        values.handleRemark,
      );
      if (res.code === 200) {
        message.success(res.message);
        onSuccess();
      }
    } catch {
      // 验证未通过或异常
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <span>违规举报审核处置</span>
          <span style={{ fontSize: 13, color: '#8c8c8c' }}>（单号: {report?.id}）</span>
        </Space>
      }
      open={open}
      onOk={handleOk}
      onCancel={onCancel}
      confirmLoading={submitting}
      okText={status === 'processed' ? '确认处置并处罚' : '确认驳回举报'}
      okButtonProps={{ danger: status === 'rejected' }}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Form.Item label="审核判定结论" name="status" rules={[{ required: true }]}>
          <Radio.Group onChange={(e) => handleStatusChange(e.target.value)}>
            <Radio.Button value="processed" style={{ color: '#52c41a' }}>
              违规属实（执行处罚）
            </Radio.Button>
            <Radio.Button value="rejected" style={{ color: '#ff4d4f' }}>
              驳回举报（证据不足/不实）
            </Radio.Button>
          </Radio.Group>
        </Form.Item>

        {status === 'processed' && (
          <Form.Item
            label="联动处罚方案"
            name="penaltyAction"
            rules={[{ required: true, message: '请选择处罚方案' }]}
          >
            <Select
              options={[
                ...(report?.targetType === 'post'
                  ? [{ label: '违规下架该作品帖子', value: 'ban_post' }]
                  : []),
                ...(report?.targetType === 'comment'
                  ? [{ label: '违规隐藏/删除该评论', value: 'delete_comment' }]
                  : []),
                { label: '禁言被举报用户（7天禁评发帖）', value: 'mute_user' },
                { label: '永久封禁被举报用户账号', value: 'ban_user' },
                { label: '下发违规整改警告站内信', value: 'warn_user' },
              ]}
            />
          </Form.Item>
        )}

        <Form.Item
          label="处置说明 / 审核原因备注"
          name="handleRemark"
          rules={[{ required: true, message: '请输入说明备注' }]}
        >
          <Input.TextArea
            rows={3}
            placeholder="输入向举报人及违规方说明的文案"
            maxLength={200}
            showCount
          />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default HandleReportModal;

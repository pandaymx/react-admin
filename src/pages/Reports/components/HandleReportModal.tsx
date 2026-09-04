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

  const [penaltyAction, setPenaltyAction] = useState<PenaltyAction>('warn_user');

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
        defaultPenalty = 'warn_user';
      }
      setPenaltyAction(defaultPenalty);

      form.setFieldsValue({
        status: 'processed',
        penaltyAction: defaultPenalty,
        durationDays: 7,
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
        {
          targetType: report.targetType,
          durationDays: Number(values.durationDays) || 7,
        },
      );
      if (res.code === 200 || res.code === 0) {
        message.success(res.message || '处置成功');
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
          <>
            <Form.Item
              label="联动处罚方案"
              name="penaltyAction"
              rules={[{ required: true, message: '请选择处罚方案' }]}
            >
              <Select
                onChange={(val) => setPenaltyAction(val)}
                options={[
                  ...(report?.targetType === 'post'
                    ? [{ label: '违规下架该作品帖子 (delete_target)', value: 'ban_post' }]
                    : []),
                  ...(report?.targetType === 'comment'
                    ? [{ label: '违规隐藏/删除该评论 (delete_target)', value: 'delete_comment' }]
                    : []),
                  { label: '下发违规整改警告站内信 (warn_user)', value: 'warn_user' },
                  { label: '限期封禁/禁言被举报用户 (temp_ban)', value: 'mute_user' },
                  { label: '永久封禁被举报用户账号 (perm_ban)', value: 'ban_user' },
                ]}
              />
            </Form.Item>

            {penaltyAction === 'mute_user' && (
              <Form.Item
                label="封禁/禁言时长"
                name="durationDays"
                rules={[{ required: true, message: '请选择封禁时长' }]}
              >
                <Select
                  options={[
                    { label: '1 天 (24 小时)', value: 1 },
                    { label: '3 天 (72 小时)', value: 3 },
                    { label: '7 天 (1 周)', value: 7 },
                    { label: '14 天 (2 周)', value: 14 },
                    { label: '30 天 (1 个月)', value: 30 },
                  ]}
                />
              </Form.Item>
            )}
          </>
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

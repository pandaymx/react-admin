import { CheckCircleOutlined, SafetyCertificateOutlined, StopOutlined } from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Card,
  Col,
  Form,
  Input,
  Modal,
  Radio,
  Row,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import { useThemeStore } from '@/store/theme';
import type { PostAuditActionParams, PostItem } from '@/types';

const { Text } = Typography;
const { TextArea } = Input;

interface PostAuditModalProps {
  open: boolean;
  post: PostItem | null;
  onCancel: () => void;
  onConfirm: (params: PostAuditActionParams) => Promise<void>;
}

export const PostAuditModal: React.FC<PostAuditModalProps> = ({
  open,
  post,
  onCancel,
  onConfirm,
}) => {
  const { token } = theme.useToken();
  const isDark = useThemeStore((state) => state.isDark);
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [auditAction, setAuditAction] = useState<'pass' | 'reject'>('pass');

  useEffect(() => {
    if (open && post) {
      const isCurrentlyRejected = post.status === 'rejected';
      const defaultAction = isCurrentlyRejected
        ? 'pass'
        : post.status === 'pending'
          ? 'pass'
          : 'reject';
      setAuditAction(defaultAction);
      form.setFieldsValue({
        action: defaultAction,
        violationLabel: 'ad',
        rejectReason: '发布包含未经审核的外部商业营销广告或恶意引流信息',
        notifyAuthor: true,
        remark: '',
      });
    }
  }, [open, post, form]);

  if (!post) return null;

  const handleFinish = async (values: any) => {
    setSubmitting(true);
    try {
      await onConfirm({
        postId: post.id,
        action: values.action,
        violationLabel: values.action === 'reject' ? values.violationLabel : undefined,
        rejectReason: values.action === 'reject' ? values.rejectReason : undefined,
        notifyAuthor: values.notifyAuthor,
        remark: values.remark,
      });
      onCancel();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <SafetyCertificateOutlined style={{ color: '#1677ff', fontSize: 18 }} />
          <span>作品合规审核与违规下架处置</span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText={auditAction === 'pass' ? '确认审核通过' : '确认违规下架'}
      okButtonProps={{ danger: auditAction === 'reject' }}
      width={620}
      destroyOnClose
    >
      <div style={{ paddingTop: 8 }}>
        {/* 目标作品简要信息卡片 */}
        <Card
          size="small"
          style={{
            background: isDark ? token.colorFillAlter : '#f9f9f9',
            border: `1px solid ${token.colorBorderSecondary}`,
            marginBottom: 16,
            borderRadius: 8,
          }}
        >
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            {post.coverUrl ? (
              <Avatar
                src={post.coverUrl}
                shape="square"
                size={54}
                style={{ borderRadius: 6, flexShrink: 0 }}
              />
            ) : (
              <Avatar
                shape="square"
                size={54}
                style={{
                  borderRadius: 6,
                  flexShrink: 0,
                  backgroundColor: isDark ? '#2b1d3a' : '#e6f4ff',
                  color: '#1677ff',
                }}
              >
                文
              </Avatar>
            )}
            <div style={{ overflow: 'hidden', flex: 1 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                }}
              >
                {post.title}
              </div>
              <div style={{ fontSize: 12, marginTop: 4, color: token.colorTextSecondary }}>
                发布作者: {post.author.nickname} (UID: {post.author.uid || post.author.userNo})
              </div>
              <div style={{ fontSize: 11, marginTop: 2 }}>
                <Space size={6}>
                  <Tag color="blue" style={{ margin: 0, borderRadius: 8 }}>
                    ID: {post.id}
                  </Tag>
                  <Tag
                    color={
                      post.status === 'published'
                        ? 'success'
                        : post.status === 'pending'
                          ? 'warning'
                          : 'error'
                    }
                    style={{ margin: 0, borderRadius: 8 }}
                  >
                    当前状态:{' '}
                    {post.status === 'published'
                      ? '正常已发布'
                      : post.status === 'pending'
                        ? '待人工审核'
                        : '违规已下架'}
                  </Tag>
                </Space>
              </div>
            </div>
          </div>
        </Card>

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {/* 处置决定 */}
          <Form.Item label="审核处置决定" name="action" style={{ marginBottom: 16 }}>
            <Radio.Group
              buttonStyle="solid"
              value={auditAction}
              onChange={(e) => setAuditAction(e.target.value)}
              style={{ width: '100%' }}
            >
              <Row gutter={12}>
                <Col span={12}>
                  <Radio.Button
                    value="pass"
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      height: 40,
                      lineHeight: '38px',
                      borderRadius: 6,
                      color: auditAction === 'pass' ? '#ffffff' : '#52c41a',
                    }}
                  >
                    <CheckCircleOutlined /> 审核通过 (放行并公开)
                  </Radio.Button>
                </Col>
                <Col span={12}>
                  <Radio.Button
                    value="reject"
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      height: 40,
                      lineHeight: '38px',
                      borderRadius: 6,
                      color: auditAction === 'reject' ? '#ffffff' : '#cf1322',
                    }}
                  >
                    <StopOutlined /> 违规驳回 (强制违规下架)
                  </Radio.Button>
                </Col>
              </Row>
            </Radio.Group>
          </Form.Item>

          {auditAction === 'pass' && (
            <Alert
              message="执行审核通过"
              description="确认后作品将正式转入【已发布】状态，并依据创作者原设定的可见范围面向广大用户公开展示。"
              type="success"
              showIcon
              style={{ marginBottom: 16 }}
            />
          )}

          {auditAction === 'reject' && (
            <div
              style={{
                background: isDark ? 'rgba(255, 77, 79, 0.1)' : '#fff1f0',
                border: isDark ? '1px solid rgba(255, 77, 79, 0.3)' : '1px solid #ffa39e',
                borderRadius: 8,
                padding: '14px 16px',
                marginBottom: 16,
              }}
            >
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontWeight: 600, color: isDark ? '#ff7875' : '#cf1322' }}>
                  🚫 违规驳回与下架配置：
                </span>
              </div>

              {/* 违规分类 */}
              <Form.Item
                label="违规类型分类"
                name="violationLabel"
                rules={[{ required: true, message: '请选择违规类型分类' }]}
                style={{ marginBottom: 12 }}
              >
                <Select
                  options={[
                    { label: '📢 批量垃圾营销广告、导流黑产 (ad)', value: 'ad' },
                    { label: '🔞 含有低俗色情、不雅暗示内容 (porn)', value: 'porn' },
                    { label: '🤬 人身攻击、辱骂侮辱与恶意引战 (abuse)', value: 'abuse' },
                    { label: '⚠️ 涉嫌网络诈骗、兼职诱导交易 (fraud)', value: 'fraud' },
                    { label: '©️ 严重侵犯他人著作权或肖像权 (copyright)', value: 'copyright' },
                    { label: '🛡️ 其他违反平台社区自律公约行为 (other)', value: 'other' },
                  ]}
                />
              </Form.Item>

              {/* 驳回具体原因 */}
              <Form.Item
                label="下架处置原因 (向作者展示)"
                name="rejectReason"
                rules={[{ required: true, message: '请填写驳回与下架原因说明' }]}
                style={{ marginBottom: 12 }}
              >
                <TextArea
                  rows={2}
                  placeholder="该原因将直接在作者端作品状态以及下发站内信中清晰展示..."
                />
              </Form.Item>

              {/* 快捷模板填充 */}
              <div style={{ marginBottom: 12, fontSize: 12 }}>
                <Text type="secondary">常用模板快速填充: </Text>
                <Space size={6} wrap style={{ marginTop: 4 }}>
                  <Tag
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      form.setFieldsValue({
                        violationLabel: 'ad',
                        rejectReason: '作品包含未经报备的商业营销推广导流信息，违反社区公约',
                      })
                    }
                  >
                    商业广告导流
                  </Tag>
                  <Tag
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      form.setFieldsValue({
                        violationLabel: 'porn',
                        rejectReason: '作品封面或内容涉嫌低俗着装及不雅动作暗示',
                      })
                    }
                  >
                    低俗擦边
                  </Tag>
                  <Tag
                    style={{ cursor: 'pointer' }}
                    onClick={() =>
                      form.setFieldsValue({
                        violationLabel: 'copyright',
                        rejectReason: '接版权权利人确凿侵权投诉，作品涉嫌搬运未经授权素材',
                      })
                    }
                  >
                    侵权搬运
                  </Tag>
                </Space>
              </div>
            </div>
          )}

          {/* 内部处置备注 */}
          <Form.Item label="后台管理处置备注 (内部留存)" name="remark" style={{ marginBottom: 12 }}>
            <Input placeholder="可记录证据链截图编号、处置人工号或上级指派工单号 (选填)" />
          </Form.Item>

          {/* 站内信通知 */}
          <Form.Item
            label="向创作者发送站内信通知"
            name="notifyAuthor"
            valuePropName="checked"
            style={{ marginBottom: 0 }}
          >
            <Switch defaultChecked checkedChildren="已开启" unCheckedChildren="已关闭" />
          </Form.Item>
        </Form>
      </div>
    </Modal>
  );
};

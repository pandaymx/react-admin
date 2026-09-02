import {
  CheckCircleFilled,
  ClockCircleOutlined,
  CloseCircleFilled,
  ExclamationCircleOutlined,
  FileImageOutlined,
  LockOutlined,
  SafetyCertificateOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Button,
  Card,
  Descriptions,
  Drawer,
  Form,
  Image,
  Input,
  Radio,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { AppealItem, AppealType } from '@/types';

const { Text, Paragraph, Title } = Typography;
const { TextArea } = Input;

export interface AppealDetailDrawerProps {
  open: boolean;
  appeal: AppealItem | null;
  onClose: () => void;
  onReviewSubmit: (values: {
    id: string;
    action: 'approve' | 'reject';
    reviewRemark: string;
    notifyUser: boolean;
  }) => Promise<void>;
}

export const AppealDetailDrawer: React.FC<AppealDetailDrawerProps> = ({
  open,
  appeal,
  onClose,
  onReviewSubmit,
}) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [reviewAction, setReviewAction] = useState<'approve' | 'reject'>('approve');

  useEffect(() => {
    if (open && appeal) {
      setReviewAction('approve');
      form.setFieldsValue({
        action: 'approve',
        reviewRemark: '经人工复核证据属实，原处罚予以撤销，并已即刻恢复相关功能权限。',
        notifyUser: true,
      });
    }
  }, [open, appeal, form]);

  if (!appeal) return null;

  const renderAppealTypeTag = (type: AppealType) => {
    switch (type) {
      case 'account_ban':
        return (
          <Tag icon={<LockOutlined />} color="red">
            🔒 账号封禁申诉
          </Tag>
        );
      case 'comment_mute':
        return (
          <Tag icon={<StopOutlined />} color="orange">
            🚫 评论禁言申诉
          </Tag>
        );
      case 'post_violation':
        return (
          <Tag icon={<FileImageOutlined />} color="purple">
            ⚠️ 作品下架申诉
          </Tag>
        );
      case 'activity_ban':
        return <Tag color="cyan">🎪 活动限制申诉</Tag>;
      case 'credit_deduct':
        return <Tag color="blue">📉 信用扣分申诉</Tag>;
    }
  };

  const renderStatusTag = () => {
    if (appeal.status === 'pending') {
      return (
        <Tag icon={<ClockCircleOutlined />} color="processing">
          ⏳ 待人工复核
        </Tag>
      );
    }
    if (appeal.status === 'approved') {
      return (
        <Tag icon={<CheckCircleFilled />} color="success">
          🟢 申诉已通过 (已解除惩处)
        </Tag>
      );
    }
    return (
      <Tag icon={<CloseCircleFilled />} color="error">
        🔴 申诉已驳回 (维持原判)
      </Tag>
    );
  };

  const handleTemplateSelect = (value: string) => {
    form.setFieldsValue({ reviewRemark: value });
  };

  const handleSubmit = async (values: any) => {
    setSubmitting(true);
    try {
      await onReviewSubmit({
        id: appeal.id,
        action: values.action,
        reviewRemark: values.reviewRemark,
        notifyUser: values.notifyUser,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const quickTemplates =
    reviewAction === 'approve'
      ? [
          {
            label: '证据属实，撤销处罚',
            value: '经人工复核提交的凭证属实，确认系算法误伤，现已撤销处罚并恢复全部权限。',
          },
          {
            label: '被盗号证明核实，提前解封',
            value: '异地盗号申诉证据核验通过，密保已重置，现提前解除封禁并恢复正常使用。',
          },
          {
            label: '合作授权确认，恢复作品展示',
            value: '与品牌方合作授权文件盖章核验无误，现已恢复作品公开展示。',
          },
        ]
      : [
          {
            label: '证据不足，维持原判',
            value: '经复核，提交的举证材料不足以证明未发生违规行为，原判定维持不变，申诉予以驳回。',
          },
          {
            label: '违规事实清楚，不予撤销',
            value:
              '核查确认违规行为事实清楚且严重违反社区公约，不支持提前解封，请在封禁期满后合规使用。',
          },
          {
            label: '涉嫌外部交易导流，严禁免罚',
            value: '账号存在明确的诱导私下转账证据，依据平台安全规则维持原处罚决定。',
          },
        ];

  return (
    <Drawer
      title={
        <Space size={12}>
          <Text strong style={{ fontSize: 16 }}>
            申诉工单详情
          </Text>
          <Text code>{appeal.id}</Text>
          {renderStatusTag()}
        </Space>
      }
      open={open}
      onClose={onClose}
      width={720}
      destroyOnClose
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* 申诉用户基础档案 */}
        <Card
          size="small"
          style={{
            background: token.colorFillAlter,
            border: `1px solid ${token.colorBorderSecondary}`,
            borderRadius: 8,
          }}
        >
          <Space size={16} align="center">
            <Avatar src={appeal.user.avatar} size={54} icon={<UserOutlined />} />
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Title level={5} style={{ margin: 0 }}>
                  {appeal.user.nickname}
                </Title>
                <Text type="secondary" style={{ fontSize: 13 }}>
                  @{appeal.user.username}
                </Text>
              </div>
              <div style={{ marginTop: 4, display: 'flex', gap: 16, fontSize: 12 }}>
                <Text type="secondary">UID: {appeal.user.uid}</Text>
                <Text type="secondary">
                  联系手机:{' '}
                  {appeal.user.phone
                    ? appeal.user.phone.replace(/^(\d{3})\d{4}(\d{4})$/, '$1****$2')
                    : '未绑定'}
                </Text>
              </div>
            </div>
          </Space>
        </Card>

        {/* 原始违规处罚信息 */}
        <Card
          title={
            <Space>
              <ExclamationCircleOutlined style={{ color: '#ff4d4f' }} />
              <span>原始违规处罚记录</span>
            </Space>
          }
          size="small"
          bordered
        >
          <Descriptions column={2} size="small">
            <Descriptions.Item label="申诉业务类型">
              {renderAppealTypeTag(appeal.appealType)}
            </Descriptions.Item>
            <Descriptions.Item label="处罚发生时间">{appeal.originalPunishTime}</Descriptions.Item>
            <Descriptions.Item label="原始处置原因" span={2}>
              <Text type="danger" strong>
                {appeal.originalPunishReason}
              </Text>
            </Descriptions.Item>
            {appeal.originalBanExpireTime && (
              <Descriptions.Item label="原定到期期限" span={2}>
                <Text code>
                  {appeal.originalBanExpireTime === 'permanent'
                    ? '永久封禁'
                    : appeal.originalBanExpireTime}
                </Text>
              </Descriptions.Item>
            )}
            {appeal.targetContent && (
              <Descriptions.Item label="涉事对象内容" span={2}>
                <Text type="secondary">{appeal.targetContent}</Text>
              </Descriptions.Item>
            )}
          </Descriptions>
        </Card>

        {/* 申诉人陈述与举证材料 */}
        <Card
          title={
            <Space>
              <SafetyCertificateOutlined style={{ color: '#1677ff' }} />
              <span>申诉人自述与举证材料</span>
            </Space>
          }
          size="small"
          bordered
        >
          <div style={{ marginBottom: 12 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              提交时间：{appeal.createdAt}
            </Text>
          </div>
          <div
            style={{
              padding: '12px 16px',
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              borderRadius: 6,
              borderLeft: '4px solid #1677ff',
              marginBottom: 16,
            }}
          >
            <Paragraph style={{ margin: 0, fontSize: 13, lineHeight: '1.6' }}>
              {appeal.appealReason}
            </Paragraph>
          </div>

          <div>
            <div style={{ marginBottom: 8, fontSize: 13, fontWeight: 500 }}>
              举证附件截图 ({appeal.appealEvidences.length} 张):
            </div>
            {appeal.appealEvidences.length > 0 ? (
              <Image.PreviewGroup>
                <Space wrap size={12}>
                  {appeal.appealEvidences.map((ev) => (
                    <div key={ev.id} style={{ textAlign: 'center' }}>
                      <Image
                        src={ev.url}
                        alt={ev.name}
                        width={130}
                        height={90}
                        style={{ objectFit: 'cover', borderRadius: 6, border: '1px solid #e8e8e8' }}
                      />
                      <div
                        style={{
                          fontSize: 11,
                          color: '#8c8c8c',
                          maxWidth: 130,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          marginTop: 4,
                        }}
                      >
                        {ev.name}
                      </div>
                    </div>
                  ))}
                </Space>
              </Image.PreviewGroup>
            ) : (
              <Text type="secondary">申诉人未上传附件材料</Text>
            )}
          </div>
        </Card>

        {/* 审核结果已出 (Approved / Rejected) */}
        {appeal.status !== 'pending' && (
          <Card
            title="复核处置结论"
            size="small"
            style={{
              borderColor: appeal.status === 'approved' ? '#52c41a' : '#ff4d4f',
              background: token.colorFillAlter,
            }}
          >
            <Descriptions column={2} size="small">
              <Descriptions.Item label="审核管理员">
                <Text strong>{appeal.reviewer || '安全合规管理员'}</Text>
              </Descriptions.Item>
              <Descriptions.Item label="审核判定时间">{appeal.reviewTime}</Descriptions.Item>
              <Descriptions.Item label="官方判定结论" span={2}>
                <Text>{appeal.reviewRemark}</Text>
              </Descriptions.Item>
              {appeal.restoreActions && appeal.restoreActions.length > 0 && (
                <Descriptions.Item label="系统联动动作" span={2}>
                  <Space wrap size={6}>
                    {appeal.restoreActions.map((act) => (
                      <Tag key={act} color="green">
                        {act}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              )}
            </Descriptions>
          </Card>
        )}

        {/* 待审核模式下的审核表单 */}
        {appeal.status === 'pending' && (
          <Card
            title={
              <Space>
                <SafetyCertificateOutlined style={{ color: '#52c41a' }} />
                <span>申诉审核与判定决策</span>
              </Space>
            }
            size="small"
            style={{
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
            }}
          >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
              <Form.Item
                label="审核裁定结论"
                name="action"
                rules={[{ required: true, message: '请选择审核结果' }]}
              >
                <Radio.Group
                  buttonStyle="solid"
                  onChange={(e) => {
                    const act = e.target.value;
                    setReviewAction(act);
                    const defaultMsg =
                      act === 'approve'
                        ? '经人工复核证据属实，原处罚予以撤销，并已即刻恢复相关功能权限。'
                        : '经复核，举证材料不足以推翻原判定，原处置决定维持不变。';
                    form.setFieldsValue({ action: act, reviewRemark: defaultMsg });
                  }}
                >
                  <Radio.Button value="approve" style={{ color: '#52c41a' }}>
                    <CheckCircleFilled style={{ marginRight: 4 }} />
                    通过申诉（自动撤销处罚）
                  </Radio.Button>
                  <Radio.Button value="reject" style={{ color: '#ff4d4f' }}>
                    <CloseCircleFilled style={{ marginRight: 4 }} />
                    驳回申诉（维持原判）
                  </Radio.Button>
                </Radio.Group>
              </Form.Item>

              <Form.Item label="快捷选用评语模板">
                <Select
                  placeholder="可选择常用官方评语快速填入"
                  options={quickTemplates}
                  onChange={handleTemplateSelect}
                  allowClear
                />
              </Form.Item>

              <Form.Item
                label="审核判定意见与说明"
                name="reviewRemark"
                rules={[{ required: true, message: '请输入审核意见' }]}
              >
                <TextArea rows={3} placeholder="请填写详细的复核意见，该内容将同步告知申诉人..." />
              </Form.Item>

              <Form.Item
                label="向用户发送申诉结果通知"
                name="notifyUser"
                valuePropName="checked"
                style={{ marginBottom: 16 }}
              >
                <Switch
                  defaultChecked
                  checkedChildren="已开启站内信告知"
                  unCheckedChildren="关闭"
                />
              </Form.Item>

              <Alert
                showIcon
                type={reviewAction === 'approve' ? 'success' : 'warning'}
                message={
                  reviewAction === 'approve'
                    ? '确认通过后，系统将自动解除该用户的相关封禁限制并下发成功告知。'
                    : '确认驳回后，原处罚期限与限制将继续生效并下发维持原判通知。'
                }
                style={{ marginBottom: 16 }}
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12 }}>
                <Button onClick={onClose}>取消</Button>
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={submitting}
                  danger={reviewAction === 'reject'}
                >
                  确认提交判定 ({reviewAction === 'approve' ? '通过' : '驳回'})
                </Button>
              </div>
            </Form>
          </Card>
        )}
      </div>
    </Drawer>
  );
};

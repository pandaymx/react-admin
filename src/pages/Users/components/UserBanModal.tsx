import {
  AlertOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  ExclamationCircleFilled,
  LockOutlined,
  StopOutlined,
  UserOutlined,
} from '@ant-design/icons';
import {
  Alert,
  Avatar,
  Card,
  DatePicker,
  Form,
  Input,
  Modal,
  Radio,
  Select,
  Space,
  Switch,
  Tag,
  Typography,
  theme,
} from 'antd';
import type dayjs from 'dayjs';
import type React from 'react';
import { useEffect, useState } from 'react';
import type { UserItem } from '@/types';
import { formatBanRemainingTime } from '@/utils/time';

const { Text } = Typography;
const { TextArea } = Input;

export type BanPunishType =
  | 'account'
  | 'comment'
  | 'post'
  | 'activity'
  | 'all'
  | 'warning'
  | 'credit_deduct';

export interface UserBanModalProps {
  open: boolean;
  users: UserItem[]; // 支持单个或多个用户批量处置
  defaultPunishType?: BanPunishType;
  onCancel: () => void;
  onOk: (values: {
    punishType: BanPunishType;
    duration: string;
    expireTime: string; // 'permanent' 或 'YYYY-MM-DD HH:mm:ss'
    reason: string;
    remark?: string;
    notifyUser: boolean;
  }) => Promise<void>;
}

export const UserBanModal: React.FC<UserBanModalProps> = ({
  open,
  users,
  defaultPunishType = 'account',
  onCancel,
  onOk,
}) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [punishType, setPunishType] = useState<BanPunishType>(defaultPunishType);
  const [duration, setDuration] = useState<string>('7d');
  const [customDate, setCustomDate] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    if (open) {
      setPunishType(defaultPunishType);
      setDuration('7d');
      setCustomDate(null);
      form.setFieldsValue({
        punishType: defaultPunishType,
        duration: '7d',
        reason: '发布低俗违规、不当言论',
        notifyUser: true,
      });
    }
  }, [open, defaultPunishType, form]);

  // 计算预计到期时间
  const calculateExpireTime = (): { expireTime: string; desc: string } => {
    if (punishType === 'warning') {
      return {
        expireTime: 'immediate',
        desc: '即刻下发官方违规警告通知，记录违规 1 次，不限制日常功能权限',
      };
    }
    if (punishType === 'credit_deduct') {
      return {
        expireTime: 'immediate',
        desc: '即刻扣除社区信用分 80 分并限制推荐权重，不限制日常功能权限',
      };
    }

    if (duration === 'permanent') {
      return { expireTime: 'permanent', desc: '永久限制该权限，不设自动解封' };
    }

    if (duration === 'custom') {
      if (!customDate) {
        return { expireTime: '', desc: '请选择自定义到期时间' };
      }
      const timeStr = customDate.format('YYYY-MM-DD HH:mm:ss');
      const rem = formatBanRemainingTime(timeStr);
      return { expireTime: timeStr, desc: `${timeStr} (${rem.text || '已到期'})` };
    }

    const now = new Date();
    const daysMap: Record<string, number> = {
      '1d': 1,
      '3d': 3,
      '7d': 7,
      '15d': 15,
      '30d': 30,
      '180d': 180,
    };
    const days = daysMap[duration] || 7;
    const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())} ${pad(future.getHours())}:${pad(future.getMinutes())}:${pad(future.getSeconds())}`;
    return { expireTime: timeStr, desc: `${timeStr} (封禁 ${days} 天)` };
  };

  const { expireTime, desc: previewDesc } = calculateExpireTime();

  const handleFinish = async (values: any) => {
    if (
      punishType !== 'warning' &&
      punishType !== 'credit_deduct' &&
      duration === 'custom' &&
      !customDate
    ) {
      form.setFields([{ name: 'customDate', errors: ['请选择自定义到期时间'] }]);
      return;
    }

    setSubmitting(true);
    try {
      await onOk({
        punishType: values.punishType,
        duration,
        expireTime,
        reason: values.reason,
        remark: values.remark,
        notifyUser: values.notifyUser,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isBatch = users.length > 1;

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleFilled style={{ color: '#ff4d4f', fontSize: 18 }} />
          <span>
            {isBatch ? `批量违规处置 (${users.length} 名用户)` : '用户违规处置与惩处设置'}
          </span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText="确认执行处置"
      okButtonProps={{ danger: true }}
      width={600}
      destroyOnClose
    >
      <div>
        {/* 目标用户展示卡片 */}
        {!isBatch && users[0] && (
          <Card
            size="small"
            style={{
              background: token.colorFillAlter,
              border: `1px solid ${token.colorBorderSecondary}`,
              marginBottom: 16,
              borderRadius: 8,
            }}
          >
            <Space size={12} align="center">
              <Avatar src={users[0].avatar} size={42} icon={<UserOutlined />} />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Text strong>{users[0].nickname}</Text>
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    @{users[0].username}
                  </Text>
                </div>
                <div style={{ fontSize: 12, marginTop: 2 }}>
                  <Text type="secondary">UID: {users[0].uid}</Text>
                </div>
              </div>
            </Space>
          </Card>
        )}

        {isBatch && (
          <Alert
            message={`当前已选中 ${users.length} 名用户进行批量处置`}
            description={
              <div style={{ maxHeight: 60, overflowY: 'auto', marginTop: 4 }}>
                <Space wrap size={4}>
                  {users.map((u) => (
                    <Tag key={u.id} color="blue">
                      {u.nickname}
                    </Tag>
                  ))}
                </Space>
              </div>
            }
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
        )}

        <Form form={form} layout="vertical" onFinish={handleFinish}>
          {/* 处罚类型 */}
          <Form.Item
            label="处罚措施与权限类型"
            name="punishType"
            rules={[{ required: true, message: '请选择处罚类型' }]}
          >
            <Radio.Group
              buttonStyle="solid"
              onChange={(e) => setPunishType(e.target.value)}
              style={{ width: '100%' }}
            >
              <Space wrap size={[8, 8]}>
                <Radio.Button value="account">
                  <LockOutlined style={{ marginRight: 4 }} />
                  账号全量封禁
                </Radio.Button>
                <Radio.Button value="comment">
                  <StopOutlined style={{ marginRight: 4 }} />
                  社区评论禁言
                </Radio.Button>
                <Radio.Button value="post">
                  <AlertOutlined style={{ marginRight: 4 }} />
                  作品动态禁发
                </Radio.Button>
                <Radio.Button value="activity">
                  <CalendarOutlined style={{ marginRight: 4 }} />
                  禁止发布活动
                </Radio.Button>
                <Radio.Button value="all">
                  <StopOutlined style={{ marginRight: 4 }} />
                  全域内容封控
                </Radio.Button>
                <Radio.Button value="warning">📢 违规官方警告</Radio.Button>
                <Radio.Button value="credit_deduct">📉 信用扣分降权</Radio.Button>
              </Space>
            </Radio.Group>
          </Form.Item>

          {/* 封禁时长 */}
          {punishType !== 'warning' && punishType !== 'credit_deduct' && (
            <Form.Item
              label="封禁期限设置"
              name="duration"
              rules={[{ required: true, message: '请选择封禁时长' }]}
            >
              <Radio.Group
                onChange={(e) => setDuration(e.target.value)}
                value={duration}
                style={{ width: '100%' }}
              >
                <Space wrap size={[8, 8]}>
                  <Radio.Button value="1d">1 天 (24h)</Radio.Button>
                  <Radio.Button value="3d">3 天</Radio.Button>
                  <Radio.Button value="7d">7 天 (1周)</Radio.Button>
                  <Radio.Button value="15d">15 天</Radio.Button>
                  <Radio.Button value="30d">30 天 (1月)</Radio.Button>
                  <Radio.Button value="180d">180 天 (半年)</Radio.Button>
                  <Radio.Button value="permanent" style={{ color: '#ff4d4f' }}>
                    永久封禁
                  </Radio.Button>
                  <Radio.Button value="custom">自定义时间</Radio.Button>
                </Space>
              </Radio.Group>
            </Form.Item>
          )}

          {/* 自定义时间选择器 */}
          {duration === 'custom' && (
            <Form.Item
              label="自定义解封到期时间"
              name="customDate"
              rules={[{ required: true, message: '请选择具体到期日期与时间' }]}
            >
              <DatePicker
                showTime
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: '100%' }}
                placeholder="请选择解封截止时间"
                onChange={(date) => setCustomDate(date)}
              />
            </Form.Item>
          )}

          {/* 预计解封时间动态预览 */}
          <Alert
            icon={<ClockCircleOutlined />}
            showIcon
            type={duration === 'permanent' ? 'error' : 'info'}
            message="预计解封生效预览"
            description={
              <div>
                <Text
                  strong
                  style={{ fontSize: 13, color: duration === 'permanent' ? '#cf1322' : '#0958d9' }}
                >
                  {previewDesc}
                </Text>
                <div style={{ fontSize: 11, color: '#8c8c8c', marginTop: 2 }}>
                  {punishType === 'account'
                    ? '封禁生效后，用户将无法登录系统、发表评论或发布作品。'
                    : punishType === 'comment'
                      ? '禁言生效后，用户仅无法在社区发布评论和互动，其他功能正常。'
                      : '禁发生效后，用户仅无法投稿发布新作品与动态，其他功能正常。'}
                </div>
              </div>
            }
            style={{ marginBottom: 16 }}
          />

          {/* 违规原因 */}
          <Form.Item
            label="违规原因分类"
            name="reason"
            rules={[{ required: true, message: '请选择违规原因' }]}
          >
            <Select
              options={[
                { label: '发布低俗违规、不当言论', value: '发布低俗违规、不当言论' },
                { label: '批量发布垃圾广告、导流营销', value: '批量发布垃圾广告、导流营销' },
                { label: '人身攻击、侮辱谩骂他人', value: '人身攻击、侮辱谩骂他人' },
                { label: '涉嫌网络诈骗、诱导私下交易', value: '涉嫌网络诈骗、诱导私下交易' },
                {
                  label: '严重抄袭、侵犯他人著作权与肖像权',
                  value: '严重抄袭、侵犯他人著作权与肖像权',
                },
                { label: '恶意刷赞、刷粉、破坏平台生态', value: '恶意刷赞、刷粉、破坏平台生态' },
                { label: '其他违规行为', value: '其他违规行为' },
              ]}
            />
          </Form.Item>

          {/* 补充说明 */}
          <Form.Item label="处置补充备注 (选填)" name="remark">
            <TextArea
              rows={2}
              placeholder="可填写具体违规作品链接、证据截图编号或管理员处理依据..."
            />
          </Form.Item>

          {/* 站内信通知 */}
          <Form.Item
            label="向用户发送处罚告知"
            name="notifyUser"
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

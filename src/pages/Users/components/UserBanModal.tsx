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
  Button,
  Card,
  Checkbox,
  Col,
  DatePicker,
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
    punishTypes: BanPunishType[];
    punishType?: BanPunishType; // 兼容旧单字段
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
  defaultPunishType = 'comment',
  onCancel,
  onOk,
}) => {
  const { token } = theme.useToken();
  const [form] = Form.useForm();
  const [submitting, setSubmitting] = useState(false);
  const [punishTypes, setPunishTypes] = useState<BanPunishType[]>([defaultPunishType]);
  const [duration, setDuration] = useState<string>('7d');
  const [customDate, setCustomDate] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    if (open) {
      const initialTypes: BanPunishType[] = [defaultPunishType];
      setPunishTypes(initialTypes);
      setDuration('7d');
      setCustomDate(null);
      form.setFieldsValue({
        punishTypes: initialTypes,
        duration: '7d',
        reason: '发布低俗违规、不当言论或虚假营销引流',
        notifyUser: true,
      });
    }
  }, [open, defaultPunishType, form]);

  // 计算预计到期时间与联合处罚描述
  const calculateExpireTime = (): { expireTime: string; desc: string } => {
    const isOnlyWarningOrCredit =
      punishTypes.length > 0 && punishTypes.every((t) => t === 'warning' || t === 'credit_deduct');

    if (isOnlyWarningOrCredit) {
      return {
        expireTime: 'immediate',
        desc: '即刻下发官方告警通知或扣除社区信用分，不限制功能时效',
      };
    }

    if (duration === 'permanent') {
      return { expireTime: 'permanent', desc: '永久限制已勾选的功能权限，不设自动解封' };
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
    return { expireTime: timeStr, desc: `${timeStr} (统一封禁 ${days} 天)` };
  };

  const { expireTime, desc: previewDesc } = calculateExpireTime();

  const handleFinish = async (values: any) => {
    const selectedTypes: BanPunishType[] = values.punishTypes || punishTypes;
    if (!selectedTypes || selectedTypes.length === 0) {
      form.setFields([{ name: 'punishTypes', errors: ['请至少勾选一项违规处罚措施'] }]);
      return;
    }

    const hasFunctionalBan = selectedTypes.some((t) => t !== 'warning' && t !== 'credit_deduct');

    if (hasFunctionalBan && duration === 'custom' && !customDate) {
      form.setFields([{ name: 'customDate', errors: ['请选择自定义到期时间'] }]);
      return;
    }

    setSubmitting(true);
    try {
      await onOk({
        punishTypes: selectedTypes,
        punishType: selectedTypes[0], // 兼容单选
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

  // 快捷设置预设组合
  const applyPreset = (types: BanPunishType[]) => {
    setPunishTypes(types);
    form.setFieldsValue({ punishTypes: types });
  };

  const hasFunctionalBan = punishTypes.some((t) => t !== 'warning' && t !== 'credit_deduct');

  return (
    <Modal
      title={
        <Space>
          <ExclamationCircleFilled style={{ color: '#ff4d4f', fontSize: 18 }} />
          <span>
            {isBatch ? `批量多维度违规处置 (${users.length} 名用户)` : '多维度违规处置与惩处设置'}
          </span>
        </Space>
      }
      open={open}
      onCancel={onCancel}
      onOk={() => form.submit()}
      confirmLoading={submitting}
      okText="确认同时执行处置"
      okButtonProps={{ danger: true }}
      width={640}
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
            message={`当前已选中 ${users.length} 名用户进行批量同时处置`}
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
          {/* 处罚类型：支持同时多选 */}
          <Form.Item
            label={
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  width: '100%',
                }}
              >
                <span style={{ fontWeight: 600 }}>处罚措施与受限权限（可同时多选）</span>
                <Space size={4}>
                  <Button
                    type="link"
                    size="small"
                    style={{ padding: '0 4px', fontSize: 12 }}
                    onClick={() => applyPreset(['comment', 'post', 'activity'])}
                  >
                    全域内容禁封
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    style={{ padding: '0 4px', fontSize: 12, color: '#ff4d4f' }}
                    onClick={() => applyPreset(['account', 'comment', 'post', 'activity'])}
                  >
                    顶格全量严惩
                  </Button>
                  <Button
                    type="link"
                    size="small"
                    style={{ padding: '0 4px', fontSize: 12, color: '#8c8c8c' }}
                    onClick={() => applyPreset([])}
                  >
                    清空
                  </Button>
                </Space>
              </div>
            }
            name="punishTypes"
            rules={[{ required: true, message: '请至少勾选一项处罚措施' }]}
          >
            <Checkbox.Group
              value={punishTypes}
              onChange={(vals) => setPunishTypes(vals as BanPunishType[])}
              style={{ width: '100%' }}
            >
              <Row gutter={[10, 10]}>
                <Col span={12}>
                  <div
                    style={{
                      border: punishTypes.includes('account')
                        ? '1px solid #ff4d4f'
                        : '1px solid #d9d9d9',
                      borderRadius: 6,
                      padding: '8px 10px',
                      background: punishTypes.includes('account') ? '#fff1f0' : '#ffffff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Checkbox value="account">
                      <Space size={6}>
                        <Tag color="#ff4d4f" icon={<LockOutlined />} style={{ margin: 0 }}>
                          全量封号
                        </Tag>
                        <span style={{ fontSize: 12, color: '#cf1322' }}>账号不可登录</span>
                      </Space>
                    </Checkbox>
                  </div>
                </Col>

                <Col span={12}>
                  <div
                    style={{
                      border: punishTypes.includes('comment')
                        ? '1px solid #fa8c16'
                        : '1px solid #d9d9d9',
                      borderRadius: 6,
                      padding: '8px 10px',
                      background: punishTypes.includes('comment') ? '#fff7e6' : '#ffffff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Checkbox value="comment">
                      <Space size={6}>
                        <Tag color="#fa8c16" icon={<StopOutlined />} style={{ margin: 0 }}>
                          禁止评论
                        </Tag>
                        <span style={{ fontSize: 12, color: '#d46b08' }}>禁言管控</span>
                      </Space>
                    </Checkbox>
                  </div>
                </Col>

                <Col span={12}>
                  <div
                    style={{
                      border: punishTypes.includes('post')
                        ? '1px solid #eb2f96'
                        : '1px solid #d9d9d9',
                      borderRadius: 6,
                      padding: '8px 10px',
                      background: punishTypes.includes('post') ? '#fff0f6' : '#ffffff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Checkbox value="post">
                      <Space size={6}>
                        <Tag color="#eb2f96" icon={<AlertOutlined />} style={{ margin: 0 }}>
                          禁发动态
                        </Tag>
                        <span style={{ fontSize: 12, color: '#c41d7f' }}>限制作品发帖</span>
                      </Space>
                    </Checkbox>
                  </div>
                </Col>

                <Col span={12}>
                  <div
                    style={{
                      border: punishTypes.includes('activity')
                        ? '1px solid #722ed1'
                        : '1px solid #d9d9d9',
                      borderRadius: 6,
                      padding: '8px 10px',
                      background: punishTypes.includes('activity') ? '#f9f0ff' : '#ffffff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Checkbox value="activity">
                      <Space size={6}>
                        <Tag color="#722ed1" icon={<CalendarOutlined />} style={{ margin: 0 }}>
                          禁发活动
                        </Tag>
                        <span style={{ fontSize: 12, color: '#531dab' }}>禁止发起活动</span>
                      </Space>
                    </Checkbox>
                  </div>
                </Col>

                <Col span={12}>
                  <div
                    style={{
                      border: punishTypes.includes('warning')
                        ? '1px solid #13c2c2'
                        : '1px solid #d9d9d9',
                      borderRadius: 6,
                      padding: '8px 10px',
                      background: punishTypes.includes('warning') ? '#e6fffb' : '#ffffff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Checkbox value="warning">
                      <Space size={6}>
                        <Tag color="cyan" style={{ margin: 0 }}>
                          📢 官方警告
                        </Tag>
                        <span style={{ fontSize: 12, color: '#8c8c8c' }}>下发站内警告</span>
                      </Space>
                    </Checkbox>
                  </div>
                </Col>

                <Col span={12}>
                  <div
                    style={{
                      border: punishTypes.includes('credit_deduct')
                        ? '1px solid #fa541c'
                        : '1px solid #d9d9d9',
                      borderRadius: 6,
                      padding: '8px 10px',
                      background: punishTypes.includes('credit_deduct') ? '#fff2e8' : '#ffffff',
                      transition: 'all 0.2s',
                    }}
                  >
                    <Checkbox value="credit_deduct">
                      <Space size={6}>
                        <Tag color="volcano" style={{ margin: 0 }}>
                          📉 信用扣分
                        </Tag>
                        <span style={{ fontSize: 12, color: '#8c8c8c' }}>扣减社区信用</span>
                      </Space>
                    </Checkbox>
                  </div>
                </Col>
              </Row>
            </Checkbox.Group>
          </Form.Item>

          {/* 统一封禁时长 */}
          {hasFunctionalBan && (
            <Form.Item
              label="统一封禁期限设置（将同时应用于上述所有选中的限制项目）"
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
          {hasFunctionalBan && duration === 'custom' && (
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
                  {punishTypes.includes('account')
                    ? '已选全量封号：用户将彻底无法登录系统，所有前台功能全量冻结。'
                    : `已选限制措施生效后，系统将在对应权限节点实施精准管控与拦截（共选中 ${punishTypes.length} 项）。`}
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

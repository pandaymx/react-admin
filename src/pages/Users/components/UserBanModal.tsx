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

export type BanPunishType = 'account' | 'comment' | 'post' | 'activity' | 'all';

export interface UserBanModalProps {
  open: boolean;
  users: UserItem[]; // 支持单个或多个用户批量处置
  defaultPunishType?: BanPunishType;
  onCancel: () => void;
  onOk: (values: {
    punishTypes: BanPunishType[];
    punishType?: BanPunishType;
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

  // 治理模式：'content' (精准功能限制) 或 'account' (全量封号)
  const [banMode, setBanMode] = useState<'content' | 'account'>(
    defaultPunishType === 'account' ? 'account' : 'content',
  );

  // 精准功能限制多选项 (禁言、禁帖、禁活动)
  const [contentPenalties, setContentPenalties] = useState<BanPunishType[]>([
    defaultPunishType === 'account' ? 'comment' : defaultPunishType,
  ]);

  // 封禁时长 (新增 1h, 3h, 6h, 12h 短时管控)
  const [duration, setDuration] = useState<string>('7d');
  const [customDate, setCustomDate] = useState<dayjs.Dayjs | null>(null);

  useEffect(() => {
    if (open) {
      const isAccount = defaultPunishType === 'account';
      setBanMode(isAccount ? 'account' : 'content');
      const initPenalties: BanPunishType[] = isAccount ? ['comment'] : [defaultPunishType];
      setContentPenalties(initPenalties);
      setDuration('7d');
      setCustomDate(null);
      form.setFieldsValue({
        banMode: isAccount ? 'account' : 'content',
        contentPenalties: initPenalties,
        duration: '7d',
        reason: '发布低俗违规、不当言论或恶意营销引流',
        notifyUser: true,
      });
    }
  }, [open, defaultPunishType, form]);

  // 计算预计到期时间
  const calculateExpireTime = (): { expireTime: string; desc: string } => {
    if (duration === 'permanent') {
      return { expireTime: 'permanent', desc: '永久限制已设定的管控权限，不设自动解封' };
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
    const hoursMap: Record<string, number> = {
      '1h': 1,
      '3h': 3,
      '6h': 6,
      '12h': 12,
      '1d': 24,
      '3d': 72,
      '7d': 168,
      '15d': 360,
      '30d': 720,
    };
    const hours = hoursMap[duration] || 168;
    const future = new Date(now.getTime() + hours * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())} ${pad(future.getHours())}:${pad(future.getMinutes())}:${pad(future.getSeconds())}`;
    const descText = hours < 24 ? `${hours} 小时` : `${Math.round(hours / 24)} 天`;
    return { expireTime: timeStr, desc: `${timeStr} (统一封禁 ${descText})` };
  };

  const { expireTime, desc: previewDesc } = calculateExpireTime();

  const handleFinish = async (values: any) => {
    let finalPunishTypes: BanPunishType[] = [];

    if (banMode === 'account') {
      // 业务规范：全量封号时，系统自动联动填入并执行全部三项限制 (账号+禁评+禁帖+禁活动)
      finalPunishTypes = ['account', 'comment', 'post', 'activity'];
    } else {
      finalPunishTypes = contentPenalties;
      if (!finalPunishTypes || finalPunishTypes.length === 0) {
        form.setFields([{ name: 'contentPenalties', errors: ['请至少勾选一项精准功能限制措施'] }]);
        return;
      }
    }

    if (duration === 'custom' && !customDate) {
      form.setFields([{ name: 'customDate', errors: ['请选择自定义到期时间'] }]);
      return;
    }

    setSubmitting(true);
    try {
      await onOk({
        punishTypes: finalPunishTypes,
        punishType: finalPunishTypes[0],
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
          {/* 处置模式选择 */}
          <Form.Item label="管控处置层级" name="banMode" style={{ marginBottom: 12 }}>
            <Radio.Group
              buttonStyle="solid"
              value={banMode}
              onChange={(e) => setBanMode(e.target.value)}
              style={{ width: '100%' }}
            >
              <Row gutter={12}>
                <Col span={12}>
                  <Radio.Button
                    value="content"
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      height: 38,
                      lineHeight: '36px',
                      borderRadius: 6,
                    }}
                  >
                    🎯 精准功能受限 (禁评/禁发/禁活动)
                  </Radio.Button>
                </Col>
                <Col span={12}>
                  <Radio.Button
                    value="account"
                    style={{
                      width: '100%',
                      textAlign: 'center',
                      height: 38,
                      lineHeight: '36px',
                      borderRadius: 6,
                      color: banMode === 'account' ? '#ffffff' : '#cf1322',
                    }}
                  >
                    🚫 全量封号 (彻底冻结并全功能封禁)
                  </Radio.Button>
                </Col>
              </Row>
            </Radio.Group>
          </Form.Item>

          {/* 全量封号模式提示说明 */}
          {banMode === 'account' && (
            <Alert
              message="全量顶格封号模式"
              description="用户将被彻底禁止登录系统与 App。系统将自动联动填入并冻结【禁止评论、禁发动态、禁止发布活动】全量内容权限，无需手动逐一勾选。"
              type="error"
              showIcon
              icon={<LockOutlined />}
              style={{ marginBottom: 16 }}
            />
          )}

          {/* 精准功能限制模式：仅在此模式下展示细分受限项 */}
          {banMode === 'content' && (
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
                  <span style={{ fontWeight: 600 }}>细分功能受限选项（可组合多选）</span>
                  <Space size={4}>
                    <Button
                      type="link"
                      size="small"
                      style={{ padding: '0 4px', fontSize: 12 }}
                      onClick={() => {
                        setContentPenalties(['comment', 'post', 'activity']);
                        form.setFieldsValue({ contentPenalties: ['comment', 'post', 'activity'] });
                      }}
                    >
                      全选所有功能
                    </Button>
                    <Button
                      type="link"
                      size="small"
                      style={{ padding: '0 4px', fontSize: 12, color: '#8c8c8c' }}
                      onClick={() => {
                        setContentPenalties([]);
                        form.setFieldsValue({ contentPenalties: [] });
                      }}
                    >
                      清空
                    </Button>
                  </Space>
                </div>
              }
              name="contentPenalties"
              rules={[{ required: true, message: '请至少勾选一项精准功能限制' }]}
            >
              <Checkbox.Group
                value={contentPenalties}
                onChange={(vals) => setContentPenalties(vals as BanPunishType[])}
                style={{ width: '100%' }}
              >
                <Row gutter={[10, 10]}>
                  <Col span={8}>
                    <div
                      style={{
                        border: contentPenalties.includes('comment')
                          ? '1px solid #fa8c16'
                          : '1px solid #d9d9d9',
                        borderRadius: 6,
                        padding: '8px 10px',
                        background: contentPenalties.includes('comment') ? '#fff7e6' : '#ffffff',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Checkbox value="comment">
                        <Space size={4}>
                          <Tag color="#fa8c16" icon={<StopOutlined />} style={{ margin: 0 }}>
                            禁止评论
                          </Tag>
                        </Space>
                      </Checkbox>
                    </div>
                  </Col>

                  <Col span={8}>
                    <div
                      style={{
                        border: contentPenalties.includes('post')
                          ? '1px solid #eb2f96'
                          : '1px solid #d9d9d9',
                        borderRadius: 6,
                        padding: '8px 10px',
                        background: contentPenalties.includes('post') ? '#fff0f6' : '#ffffff',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Checkbox value="post">
                        <Space size={4}>
                          <Tag color="#eb2f96" icon={<AlertOutlined />} style={{ margin: 0 }}>
                            禁发动态
                          </Tag>
                        </Space>
                      </Checkbox>
                    </div>
                  </Col>

                  <Col span={8}>
                    <div
                      style={{
                        border: contentPenalties.includes('activity')
                          ? '1px solid #722ed1'
                          : '1px solid #d9d9d9',
                        borderRadius: 6,
                        padding: '8px 10px',
                        background: contentPenalties.includes('activity') ? '#f9f0ff' : '#ffffff',
                        transition: 'all 0.2s',
                      }}
                    >
                      <Checkbox value="activity">
                        <Space size={4}>
                          <Tag color="#722ed1" icon={<CalendarOutlined />} style={{ margin: 0 }}>
                            禁发活动
                          </Tag>
                        </Space>
                      </Checkbox>
                    </div>
                  </Col>
                </Row>
              </Checkbox.Group>
            </Form.Item>
          )}

          {/* 封禁期限设置：包含 1小时, 3小时, 6小时, 12小时等短时管控 */}
          <Form.Item
            label="管控期限设置（将同时应用于上述所有受限制的功能）"
            name="duration"
            rules={[{ required: true, message: '请选择管控时长' }]}
          >
            <Radio.Group
              onChange={(e) => setDuration(e.target.value)}
              value={duration}
              style={{ width: '100%' }}
            >
              <Space wrap size={[8, 8]}>
                <Radio.Button value="1h" style={{ fontWeight: 500 }}>
                  ⚡ 1 小时
                </Radio.Button>
                <Radio.Button value="3h" style={{ fontWeight: 500 }}>
                  ⚡ 3 小时
                </Radio.Button>
                <Radio.Button value="6h">6 小时</Radio.Button>
                <Radio.Button value="12h">12 小时</Radio.Button>
                <Radio.Button value="1d">1 天 (24h)</Radio.Button>
                <Radio.Button value="3d">3 天</Radio.Button>
                <Radio.Button value="7d">7 天 (1周)</Radio.Button>
                <Radio.Button value="15d">15 天</Radio.Button>
                <Radio.Button value="30d">30 天 (1月)</Radio.Button>
                <Radio.Button value="permanent" style={{ color: '#ff4d4f' }}>
                  永久管控
                </Radio.Button>
                <Radio.Button value="custom">自定义时间</Radio.Button>
              </Space>
            </Radio.Group>
          </Form.Item>

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
                  {banMode === 'account'
                    ? '已选全量封号：用户将彻底无法登录系统，评论、发帖与活动发布权限全量冻结。'
                    : `已选限制措施生效后，系统将在对应权限节点实施精准管控与拦截（共选中 ${contentPenalties.length} 项）。`}
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

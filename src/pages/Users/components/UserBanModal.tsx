import {
  AlertOutlined,
  CalendarOutlined,
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

export interface SinglePenaltyConfig {
  punishType: 'account' | 'comment' | 'post' | 'activity';
  duration: string;
  expireTime: string; // 'permanent' 或 'YYYY-MM-DD HH:mm:ss'
}

export interface UserBanModalProps {
  open: boolean;
  users: UserItem[]; // 支持单个或多个用户批量处置
  defaultPunishType?: BanPunishType;
  onCancel: () => void;
  onOk: (values: {
    penalties: SinglePenaltyConfig[];
    punishTypes: BanPunishType[];
    punishType?: BanPunishType;
    duration?: string;
    expireTime?: string;
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

  // 各惩罚项独立时长配置 (支持分别选择不同时间)
  const [itemDurations, setItemDurations] = useState<Record<string, string>>({
    comment: '7d',
    post: '1d',
    activity: '30d',
    account: 'permanent',
  });

  const [itemCustomDates, setItemCustomDates] = useState<Record<string, dayjs.Dayjs | null>>({
    comment: null,
    post: null,
    activity: null,
    account: null,
  });

  useEffect(() => {
    if (open) {
      const isAccount = defaultPunishType === 'account';
      setBanMode(isAccount ? 'account' : 'content');
      const initPenalties: BanPunishType[] = isAccount ? ['comment'] : [defaultPunishType];
      setContentPenalties(initPenalties);
      form.setFieldsValue({
        banMode: isAccount ? 'account' : 'content',
        contentPenalties: initPenalties,
        reason: '发布低俗违规、不当言论或恶意营销引流',
        notifyUser: true,
      });
    }
  }, [open, defaultPunishType, form]);

  // 单项独立到期时间换算函数
  const calcSingleExpireTime = (
    dur: string,
    custDate: dayjs.Dayjs | null,
  ): { expireTime: string; desc: string } => {
    if (dur === 'permanent') {
      return { expireTime: 'permanent', desc: '永久管控' };
    }
    if (dur === 'custom') {
      if (!custDate) return { expireTime: '', desc: '请选择自定义时间' };
      const timeStr = custDate.format('YYYY-MM-DD HH:mm:ss');
      const rem = formatBanRemainingTime(timeStr);
      return { expireTime: timeStr, desc: `${timeStr} (${rem.text || '已到期'})` };
    }
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
    const hours = hoursMap[dur] || 24;
    const future = new Date(Date.now() + hours * 60 * 60 * 1000);
    const pad = (n: number) => String(n).padStart(2, '0');
    const timeStr = `${future.getFullYear()}-${pad(future.getMonth() + 1)}-${pad(future.getDate())} ${pad(future.getHours())}:${pad(future.getMinutes())}:${pad(future.getSeconds())}`;
    const desc = hours < 24 ? `${hours}小时` : `${Math.round(hours / 24)}天`;
    return { expireTime: timeStr, desc: `${desc} (至 ${timeStr})` };
  };

  const handleFinish = async (values: any) => {
    let penaltiesToApply: SinglePenaltyConfig[] = [];
    let finalPunishTypes: BanPunishType[] = [];

    if (banMode === 'account') {
      const accDuration = itemDurations.account || 'permanent';
      const accExp = calcSingleExpireTime(accDuration, itemCustomDates.account).expireTime;
      penaltiesToApply = [
        { punishType: 'account', duration: accDuration, expireTime: accExp },
        { punishType: 'comment', duration: accDuration, expireTime: accExp },
        { punishType: 'post', duration: accDuration, expireTime: accExp },
        { punishType: 'activity', duration: accDuration, expireTime: accExp },
      ];
      finalPunishTypes = ['account', 'comment', 'post', 'activity'];
    } else {
      finalPunishTypes = contentPenalties;
      if (!finalPunishTypes || finalPunishTypes.length === 0) {
        form.setFields([{ name: 'contentPenalties', errors: ['请至少勾选一项精准功能限制措施'] }]);
        return;
      }
      for (const t of finalPunishTypes) {
        const pType = t as 'comment' | 'post' | 'activity';
        const dur = itemDurations[pType] || '7d';
        const custDate = itemCustomDates[pType];
        if (dur === 'custom' && !custDate) {
          form.setFields([
            { name: 'contentPenalties', errors: [`请为【${t}】选择自定义解封时间`] },
          ]);
          return;
        }
        const exp = calcSingleExpireTime(dur, custDate).expireTime;
        penaltiesToApply.push({
          punishType: pType,
          duration: dur,
          expireTime: exp,
        });
      }
    }

    setSubmitting(true);
    try {
      await onOk({
        penalties: penaltiesToApply,
        punishTypes: finalPunishTypes,
        punishType: finalPunishTypes[0],
        duration: penaltiesToApply[0]?.duration || '7d',
        expireTime: penaltiesToApply[0]?.expireTime || 'permanent',
        reason: values.reason,
        remark: values.remark,
        notifyUser: values.notifyUser,
      });
    } finally {
      setSubmitting(false);
    }
  };

  const isBatch = users.length > 1;

  // 渲染单项独立时长选择器
  const renderDurationSelector = (typeKey: string) => {
    const curDuration = itemDurations[typeKey] || (typeKey === 'account' ? 'permanent' : '7d');
    return (
      <div
        style={{
          marginTop: 8,
          padding: '8px 10px',
          background: '#fafafa',
          borderRadius: 6,
          border: '1px dashed #d9d9d9',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: 6,
          }}
        >
          <span style={{ fontSize: 12, fontWeight: 600, color: '#595959' }}>⏱️ 独立管控期限：</span>
          <span style={{ fontSize: 11, color: '#ff4d4f', fontWeight: 500 }}>
            {calcSingleExpireTime(curDuration, itemCustomDates[typeKey]).desc}
          </span>
        </div>
        <Radio.Group
          size="small"
          value={curDuration}
          onChange={(e) => setItemDurations((prev) => ({ ...prev, [typeKey]: e.target.value }))}
        >
          <Space wrap size={[4, 4]}>
            <Radio.Button value="1h">⚡ 1小时</Radio.Button>
            <Radio.Button value="3h">⚡ 3小时</Radio.Button>
            <Radio.Button value="6h">6小时</Radio.Button>
            <Radio.Button value="12h">12小时</Radio.Button>
            <Radio.Button value="1d">1天</Radio.Button>
            <Radio.Button value="3d">3天</Radio.Button>
            <Radio.Button value="7d">7天</Radio.Button>
            <Radio.Button value="15d">15天</Radio.Button>
            <Radio.Button value="30d">30天</Radio.Button>
            <Radio.Button value="permanent" style={{ color: '#ff4d4f' }}>
              永久
            </Radio.Button>
            <Radio.Button value="custom">自定义</Radio.Button>
          </Space>
        </Radio.Group>
        {curDuration === 'custom' && (
          <div style={{ marginTop: 8 }}>
            <DatePicker
              size="small"
              showTime
              format="YYYY-MM-DD HH:mm:ss"
              style={{ width: 220 }}
              placeholder="选择自定义到期时间"
              onChange={(date) => setItemCustomDates((prev) => ({ ...prev, [typeKey]: date }))}
            />
          </div>
        )}
      </div>
    );
  };

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
      width={680}
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
                    🎯 精准功能受限 (各功能分别选不同时间)
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

          {/* 全量封号模式：展示全量封号及独立时长，不展示其余三项 */}
          {banMode === 'account' && (
            <div style={{ marginBottom: 16 }}>
              <Alert
                message="全量顶格封号模式"
                description="用户将被彻底禁止登录系统与 App。系统将自动联动填入并冻结【禁止评论、禁发动态、禁止发布活动】全量内容权限，无需手动重复勾选。"
                type="error"
                showIcon
                icon={<LockOutlined />}
                style={{ marginBottom: 12 }}
              />
              <div
                style={{
                  background: '#fff1f0',
                  border: '1px solid #ffa39e',
                  borderRadius: 6,
                  padding: '10px 12px',
                }}
              >
                <span style={{ fontWeight: 600, color: '#cf1322' }}>🚫 账号封禁时效：</span>
                {renderDurationSelector('account')}
              </div>
            </div>
          )}

          {/* 精准功能受限模式：展示 3 个功能项，每个功能独立选择期限 */}
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
                  <span style={{ fontWeight: 600 }}>
                    受限功能列表（可同时勾选，且各自独立选择不同时长）
                  </span>
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
                      全选功能
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
                <Space direction="vertical" size={10} style={{ width: '100%' }}>
                  {/* 1. 评论限制卡片 */}
                  <div
                    style={{
                      border: contentPenalties.includes('comment')
                        ? '1px solid #fa8c16'
                        : '1px solid #d9d9d9',
                      borderRadius: 6,
                      padding: '10px 12px',
                      background: contentPenalties.includes('comment') ? '#fffbf6' : '#ffffff',
                    }}
                  >
                    <Checkbox value="comment">
                      <Space size={6}>
                        <Tag color="#fa8c16" icon={<StopOutlined />} style={{ margin: 0 }}>
                          禁止评论
                        </Tag>
                        <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                          拦截作品/动态/讨论区的所有评论发言
                        </span>
                      </Space>
                    </Checkbox>
                    {contentPenalties.includes('comment') && renderDurationSelector('comment')}
                  </div>

                  {/* 2. 发帖限制卡片 */}
                  <div
                    style={{
                      border: contentPenalties.includes('post')
                        ? '1px solid #eb2f96'
                        : '1px solid #d9d9d9',
                      borderRadius: 6,
                      padding: '10px 12px',
                      background: contentPenalties.includes('post') ? '#fff7fa' : '#ffffff',
                    }}
                  >
                    <Checkbox value="post">
                      <Space size={6}>
                        <Tag color="#eb2f96" icon={<AlertOutlined />} style={{ margin: 0 }}>
                          禁发动态
                        </Tag>
                        <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                          限制发布动态作品、投稿及图文视频
                        </span>
                      </Space>
                    </Checkbox>
                    {contentPenalties.includes('post') && renderDurationSelector('post')}
                  </div>

                  {/* 3. 活动限制卡片 */}
                  <div
                    style={{
                      border: contentPenalties.includes('activity')
                        ? '1px solid #722ed1'
                        : '1px solid #d9d9d9',
                      borderRadius: 6,
                      padding: '10px 12px',
                      background: contentPenalties.includes('activity') ? '#faf7ff' : '#ffffff',
                    }}
                  >
                    <Checkbox value="activity">
                      <Space size={6}>
                        <Tag color="#722ed1" icon={<CalendarOutlined />} style={{ margin: 0 }}>
                          禁发活动
                        </Tag>
                        <span style={{ fontSize: 12, color: '#8c8c8c' }}>
                          限制发起或创建线上挑战赛及线下活动
                        </span>
                      </Space>
                    </Checkbox>
                    {contentPenalties.includes('activity') && renderDurationSelector('activity')}
                  </div>
                </Space>
              </Checkbox.Group>
            </Form.Item>
          )}

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

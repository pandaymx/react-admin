import { CompassOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  InputNumber,
  Modal,
  message,
  Radio,
  Row,
  Select,
  Space,
  Steps,
  Typography,
  theme,
} from 'antd';
import dayjs from 'dayjs';
import type React from 'react';
import { useEffect, useState } from 'react';
import { createActivity, updateActivity } from '@/api/activity';
import { useThemeStore } from '@/store/theme';
import type { ActivityDetailRespVO, ActivitySaveReqVO } from '@/types';

const { Title, Text, Paragraph } = Typography;

interface ActivityWizardModalProps {
  open: boolean;
  editingActivity: ActivityDetailRespVO | null;
  onClose: () => void;
  onSuccess: () => void;
}

const CATEGORY_OPTIONS = [
  {
    label: '户外探险',
    value: 'cat_outdoor',
    children: [
      { label: '高山徒步', value: 'sub_hiking' },
      { label: '重装露营', value: 'sub_camping' },
      { label: '单板/双板滑雪', value: 'sub_skiing' },
      { label: '攀岩与抱石', value: 'sub_climbing' },
      { label: '水上帆船', value: 'sub_sailing' },
    ],
  },
  {
    label: '球类竞技',
    value: 'cat_sports',
    children: [
      { label: '羽毛球双打', value: 'sub_badminton' },
      { label: '半场/全场篮球', value: 'sub_basketball' },
      { label: '网球对抗', value: 'sub_tennis' },
      { label: '七人制足球', value: 'sub_soccer' },
    ],
  },
  {
    label: '生活休闲与摄影',
    value: 'cat_leisure',
    children: [
      { label: '人像/风光摄影', value: 'sub_photography' },
      { label: '无人机航拍', value: 'sub_drone' },
      { label: '城市公路骑行', value: 'sub_cycling' },
      { label: '极限飞盘', value: 'sub_frisbee' },
      { label: '精品手冲咖啡', value: 'sub_coffee' },
    ],
  },
];

const PRESET_EQUIPMENTS = [
  '登山杖(双杖)',
  '40L徒步背包',
  '高帮防滑防水登山鞋',
  '专业羽毛球拍',
  '冲锋衣裤',
  '速干衣裤',
  '偏光太阳镜',
  '户外头灯(含备用电池)',
  '个人便携急救包',
  '大疆无人机',
  '露营折叠椅',
  '防蚊喷雾',
];

export const ActivityWizardModal: React.FC<ActivityWizardModalProps> = ({
  open,
  editingActivity,
  onClose,
  onSuccess,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const {
    token: { colorPrimary },
  } = theme.useToken();

  const [currentStep, setCurrentStep] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [coverIndex, setCoverIndex] = useState<number>(0);

  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      setCurrentStep(0);
      if (editingActivity) {
        setCoverIndex(editingActivity.images?.findIndex((img) => img.isCover === 1) || 0);
        form.setFieldsValue({
          title: editingActivity.title,
          subcategoryId: editingActivity.subcategoryId,
          city: editingActivity.city,
          publisherUserId: editingActivity.publisherUserId,
          timeRange: [dayjs(editingActivity.startTime), dayjs(editingActivity.endTime)],
          enrollDeadline: dayjs(editingActivity.enrollDeadline),
          minParticipants: editingActivity.minParticipants,
          maxParticipants: editingActivity.maxParticipants,
          ageRange: [editingActivity.ageMin, editingActivity.ageMax],
          refundRuleType: editingActivity.refundRuleType || '活动开始前24小时支持全额退订',
          feeMode: editingActivity.feeMode,
          feeAmount: editingActivity.feeAmount,
          introduction: editingActivity.introduction,
          enrollNotice: editingActivity.enrollNotice,
          caution: editingActivity.caution,
          tips: editingActivity.tips,
          meetingPoints: editingActivity.meetingPoints || [],
          itineraries: editingActivity.itineraries || [],
          feeItems: editingActivity.feeItems || [],
          equipmentIds: editingActivity.equipmentRefs || [],
          images: editingActivity.images || [],
          managers: editingActivity.managers || [],
        });
      } else {
        form.resetFields();
        setCoverIndex(0);
        form.setFieldsValue({
          subcategoryId: 'sub_hiking',
          city: '西安',
          publisherUserId: '100088',
          minParticipants: 6,
          maxParticipants: 18,
          ageRange: [18, 55],
          feeMode: 'AA',
          feeAmount: 180,
          refundRuleType: '活动开始前24小时支持全额退订',
          meetingPoints: [{ name: '地铁口集合点A', address: '主干道交汇口', timeText: '07:30' }],
          itineraries: [
            {
              dayNo: 1,
              timeText: '08:00 - 12:00',
              content: '集结破冰，前往目的地并做行前安全提醒',
            },
            { dayNo: 1, timeText: '13:00 - 17:00', content: '核心体验项目开展，摄影打卡' },
          ],
          feeItems: [
            { title: '正规营运大巴包车交通', content: '含路桥费与司机津贴', feeType: 'include' },
            { title: '专业特种户外高额意外险', content: '50万保额人身险', feeType: 'include' },
            { title: '行程内个人餐饮自理', content: '自费农家乐或路餐', feeType: 'exclude' },
          ],
          equipmentIds: ['登山杖(双杖)', '冲锋衣裤', '高帮防滑防水登山鞋'],
          images: [
            {
              url: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
              sort: 1,
            },
            {
              url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
              sort: 2,
            },
          ],
          managers: [{ userId: '100088', role: '领队', nickname: '官方领队' }],
        });
      }
    }
  }, [open, editingActivity, form]);

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        await form.validateFields([
          'title',
          'subcategoryId',
          'city',
          'timeRange',
          'enrollDeadline',
          'minParticipants',
          'maxParticipants',
          'feeMode',
        ]);
      }
      setCurrentStep((prev) => prev + 1);
    } catch {
      // 步骤验证未通过
    }
  };

  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      setLoading(true);

      const imagesWithCover = (values.images || []).map((img: any, idx: number) => ({
        ...img,
        isCover: idx === coverIndex ? 1 : 0,
        sort: idx + 1,
      }));

      // 如果没有任何图片被设为封面，默认第 1 张为封面
      if (imagesWithCover.length > 0 && !imagesWithCover.some((img: any) => img.isCover === 1)) {
        imagesWithCover[0].isCover = 1;
      }

      const payload: ActivitySaveReqVO = {
        id: editingActivity?.id,
        title: values.title,
        subcategoryId: values.subcategoryId,
        publisherUserId: values.publisherUserId,
        city: values.city,
        startTime: values.timeRange[0].format('YYYY-MM-DD HH:mm:ss'),
        endTime: values.timeRange[1].format('YYYY-MM-DD HH:mm:ss'),
        enrollDeadline: values.enrollDeadline.format('YYYY-MM-DD HH:mm:ss'),
        minParticipants: values.minParticipants,
        maxParticipants: values.maxParticipants,
        ageMin: values.ageRange ? values.ageRange[0] : 18,
        ageMax: values.ageRange ? values.ageRange[1] : 60,
        feeMode: values.feeMode,
        feeAmount: values.feeAmount || 0,
        refundRuleType: values.refundRuleType,
        introduction: values.introduction,
        enrollNotice: values.enrollNotice,
        caution: values.caution,
        tips: values.tips,
        meetingPoints: values.meetingPoints || [],
        itineraries: values.itineraries || [],
        feeItems: values.feeItems || [],
        equipmentIds: values.equipmentIds || [],
        images: imagesWithCover,
        managers: values.managers || [],
      };

      if (editingActivity) {
        await updateActivity(payload);
        message.success('活动信息已更新');
      } else {
        await createActivity(payload);
        message.success('活动草稿创建成功');
      }
      onSuccess();
      onClose();
    } catch {
      message.error('保存失败，请检查各步骤必填项');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <CompassOutlined style={{ color: colorPrimary }} />
          <span>
            {editingActivity
              ? `编辑活动草稿 — ${editingActivity.id}`
              : '创建新活动 (5步引导工作台)'}
          </span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      width={880}
      destroyOnClose
      footer={
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              💡 正在执行子表整包保存，请确保各步骤信息填写完整
            </Text>
          </div>
          <Space>
            {currentStep > 0 && <Button onClick={handlePrev}>上一步</Button>}
            {currentStep < 4 ? (
              <Button type="primary" onClick={handleNext}>
                下一步
              </Button>
            ) : (
              <Button type="primary" loading={loading} onClick={handleSubmit}>
                {editingActivity ? '确认保存更新' : '保存活动草稿'}
              </Button>
            )}
          </Space>
        </div>
      }
    >
      {/* 步骤条 */}
      <Steps
        current={currentStep}
        size="small"
        style={{ margin: '16px 0 24px' }}
        items={[
          { title: '核心归属' },
          { title: '地点行程' },
          { title: '费用装备' },
          { title: '物料领队' },
          { title: '须知预览' },
        ]}
      />

      <Form form={form} layout="vertical">
        {/* Step 0: 基本信息与归属 */}
        <div style={{ display: currentStep === 0 ? 'block' : 'none' }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item
                name="title"
                label="活动主标题"
                rules={[
                  { required: true, message: '请输入活动标题' },
                  { min: 5, max: 60, message: '标题长度在 5 到 60 个字之间' },
                ]}
              >
                <Input placeholder="例如：【秋季登高】鳌太穿越线轻装体验 3日精华徒步" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="subcategoryId"
                label="活动所属类目"
                rules={[{ required: true, message: '请选择所属类目' }]}
              >
                <Select placeholder="请选择类目">
                  {CATEGORY_OPTIONS.map((cat) => (
                    <Select.OptGroup label={cat.label} key={cat.value}>
                      {cat.children.map((sub) => (
                        <Select.Option value={sub.value} key={sub.value}>
                          {sub.label}
                        </Select.Option>
                      ))}
                    </Select.OptGroup>
                  ))}
                </Select>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="city"
                label="所在城市"
                rules={[{ required: true, message: '请输入城市' }]}
              >
                <Input placeholder="例如：西安、北京、杭州、成都" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="timeRange"
                label="活动起止时间"
                rules={[{ required: true, message: '请选择活动起止时间' }]}
              >
                <DatePicker.RangePicker
                  showTime
                  style={{ width: '100%' }}
                  format="YYYY-MM-DD HH:mm"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                name="enrollDeadline"
                label="报名截止时间"
                rules={[{ required: true, message: '请选择报名截止时间' }]}
              >
                <DatePicker showTime style={{ width: '100%' }} format="YYYY-MM-DD HH:mm" />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                name="minParticipants"
                label="成团最少人数"
                rules={[{ required: true, message: '请输入' }]}
              >
                <InputNumber min={1} max={500} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={6}>
              <Form.Item
                name="maxParticipants"
                label="成团上限人数"
                rules={[{ required: true, message: '请输入' }]}
              >
                <InputNumber min={1} max={500} style={{ width: '100%' }} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="publisherUserId" label="发布者会员ID (后台代发)">
                <Input placeholder="代为发布的会员 ID，如 100088" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="feeMode" label="收费模式" rules={[{ required: true }]}>
                <Radio.Group buttonStyle="solid">
                  <Radio.Button value="FREE">免费</Radio.Button>
                  <Radio.Button value="PAID">固定收费</Radio.Button>
                  <Radio.Button value="AA">线上AA</Radio.Button>
                  <Radio.Button value="AA_OFFLINE">线下AA</Radio.Button>
                </Radio.Group>
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item noStyle shouldUpdate={(prev, curr) => prev.feeMode !== curr.feeMode}>
                {({ getFieldValue }) =>
                  getFieldValue('feeMode') !== 'FREE' ? (
                    <Form.Item
                      name="feeAmount"
                      label="收费/人均预估金额 (¥)"
                      rules={[{ required: true, message: '请输入金额' }]}
                    >
                      <InputNumber min={1} max={99999} style={{ width: '100%' }} />
                    </Form.Item>
                  ) : null
                }
              </Form.Item>
            </Col>
          </Row>
        </div>

        {/* Step 1: 集合地点与行程规划 */}
        <div style={{ display: currentStep === 1 ? 'block' : 'none' }}>
          <Title level={5} style={{ marginTop: 0 }}>
            📍 集合地点打点 (meetingPoints)
          </Title>
          <Form.List name="meetingPoints">
            {(fields, { add, remove }) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {fields.map(({ key, name, ...restField }) => (
                  <Card size="small" key={key} bordered>
                    <Row gutter={12} align="middle">
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'name']}
                          label="地点名称"
                          rules={[{ required: true, message: '请输入地点名称' }]}
                          style={{ margin: 0 }}
                        >
                          <Input placeholder="如：地铁2号线南门站B口" />
                        </Form.Item>
                      </Col>
                      <Col span={9}>
                        <Form.Item
                          {...restField}
                          name={[name, 'address']}
                          label="详细街道地址"
                          style={{ margin: 0 }}
                        >
                          <Input placeholder="如：长安南路88号" />
                        </Form.Item>
                      </Col>
                      <Col span={5}>
                        <Form.Item
                          {...restField}
                          name={[name, 'timeText']}
                          label="集合时间"
                          rules={[{ required: true, message: '如 07:30' }]}
                          style={{ margin: 0 }}
                        >
                          <Input placeholder="07:30" />
                        </Form.Item>
                      </Col>
                      <Col span={2} style={{ textAlign: 'center' }}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加集合地点
                </Button>
              </div>
            )}
          </Form.List>

          <Divider />

          <Title level={5}>🗓️ 行程规划时间轴 (itineraries)</Title>
          <Form.List name="itineraries">
            {(fields, { add, remove }) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {fields.map(({ key, name, ...restField }) => (
                  <Card size="small" key={key} bordered>
                    <Row gutter={12} align="middle">
                      <Col span={4}>
                        <Form.Item
                          {...restField}
                          name={[name, 'dayNo']}
                          label="第几天"
                          style={{ margin: 0 }}
                        >
                          <InputNumber min={1} max={30} style={{ width: '100%' }} />
                        </Form.Item>
                      </Col>
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'timeText']}
                          label="时间段"
                          rules={[{ required: true, message: '如 08:00 - 12:00' }]}
                          style={{ margin: 0 }}
                        >
                          <Input placeholder="08:00 - 12:00" />
                        </Form.Item>
                      </Col>
                      <Col span={12}>
                        <Form.Item
                          {...restField}
                          name={[name, 'content']}
                          label="行程规划描述"
                          rules={[{ required: true, message: '请输入行程安排' }]}
                          style={{ margin: 0 }}
                        >
                          <Input placeholder="如：乘车前往塘口，轻装热身出发" />
                        </Form.Item>
                      </Col>
                      <Col span={2} style={{ textAlign: 'center' }}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加行程阶段
                </Button>
              </div>
            )}
          </Form.List>
        </div>

        {/* Step 2: 费用清单与装备 */}
        <div style={{ display: currentStep === 2 ? 'block' : 'none' }}>
          <Title level={5} style={{ marginTop: 0 }}>
            💰 费用包含与自理清单 (feeItems)
          </Title>
          <Form.List name="feeItems">
            {(fields, { add, remove }) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {fields.map(({ key, name, ...restField }) => (
                  <Card size="small" key={key} bordered>
                    <Row gutter={12} align="middle">
                      <Col span={5}>
                        <Form.Item
                          {...restField}
                          name={[name, 'feeType']}
                          label="性质"
                          style={{ margin: 0 }}
                        >
                          <Select
                            options={[
                              { label: '已包含', value: 'include' },
                              { label: '自费项', value: 'exclude' },
                            ]}
                          />
                        </Form.Item>
                      </Col>
                      <Col span={8}>
                        <Form.Item
                          {...restField}
                          name={[name, 'title']}
                          label="项目标题"
                          rules={[{ required: true, message: '如：专业大巴车费' }]}
                          style={{ margin: 0 }}
                        >
                          <Input placeholder="如：往返包车交通" />
                        </Form.Item>
                      </Col>
                      <Col span={9}>
                        <Form.Item
                          {...restField}
                          name={[name, 'content']}
                          label="说明备注"
                          style={{ margin: 0 }}
                        >
                          <Input placeholder="如：包含路桥费与司机食宿" />
                        </Form.Item>
                      </Col>
                      <Col span={2} style={{ textAlign: 'center' }}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加费用细项
                </Button>
              </div>
            )}
          </Form.List>

          <Divider />

          <Title level={5}>🎒 建议与必带装备推荐 (equipmentIds)</Title>
          <Form.Item name="equipmentIds" label="选择或输入装备清单">
            <Select
              mode="tags"
              style={{ width: '100%' }}
              placeholder="可直接选择或键入自定义装备名称回车"
              options={PRESET_EQUIPMENTS.map((eq) => ({ label: eq, value: eq }))}
            />
          </Form.Item>

          <Form.Item name="refundRuleType" label="退改无忧保障规则">
            <Select
              options={[
                {
                  label: '出发前48小时全额退订，24小时内扣除30%交通损耗',
                  value: '出发前48小时全额退订，24小时内扣除30%交通损耗',
                },
                {
                  label: '出发前24小时支持全额退款，逾期不退',
                  value: '出发前24小时支持全额退款，逾期不退',
                },
                { label: '特惠活动不可退改', value: '特惠活动不可退改' },
              ]}
            />
          </Form.Item>
        </div>

        {/* Step 3: 视觉物料与领队 */}
        <div style={{ display: currentStep === 3 ? 'block' : 'none' }}>
          <Title level={5} style={{ marginTop: 0 }}>
            🖼️ 活动图库与封面设置 (images，必须设定且仅1张为封面)
          </Title>
          <Form.List name="images">
            {(fields, { add, remove }) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                {fields.map(({ key, name, ...restField }, idx) => (
                  <Card size="small" key={key} bordered>
                    <Row gutter={12} align="middle">
                      <Col span={3} style={{ textAlign: 'center' }}>
                        <Radio checked={coverIndex === idx} onChange={() => setCoverIndex(idx)}>
                          设为封面
                        </Radio>
                      </Col>
                      <Col span={19}>
                        <Form.Item
                          {...restField}
                          name={[name, 'url']}
                          label={`图片 #${idx + 1} CDN 链接`}
                          rules={[{ required: true, message: '请输入图片 URL' }]}
                          style={{ margin: 0 }}
                        >
                          <Input placeholder="https://images.unsplash.com/..." />
                        </Form.Item>
                      </Col>
                      <Col span={2} style={{ textAlign: 'center' }}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加图片
                </Button>
              </div>
            )}
          </Form.List>

          <Divider />

          <Title level={5}>👤 随队领队与人员分配 (managers)</Title>
          <Form.List name="managers">
            {(fields, { add, remove }) => (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {fields.map(({ key, name, ...restField }) => (
                  <Card size="small" key={key} bordered>
                    <Row gutter={12} align="middle">
                      <Col span={6}>
                        <Form.Item
                          {...restField}
                          name={[name, 'userId']}
                          label="领队会员ID"
                          rules={[{ required: true, message: '输入会员ID' }]}
                          style={{ margin: 0 }}
                        >
                          <Input placeholder="如 100088" />
                        </Form.Item>
                      </Col>
                      <Col span={7}>
                        <Form.Item
                          {...restField}
                          name={[name, 'role']}
                          label="随队职责角色"
                          rules={[{ required: true, message: '如：总领队/急救员' }]}
                          style={{ margin: 0 }}
                        >
                          <Input placeholder="如：总领队 (中登证书)" />
                        </Form.Item>
                      </Col>
                      <Col span={9}>
                        <Form.Item
                          {...restField}
                          name={[name, 'nickname']}
                          label="对外称谓"
                          style={{ margin: 0 }}
                        >
                          <Input placeholder="如：大山领队" />
                        </Form.Item>
                      </Col>
                      <Col span={2} style={{ textAlign: 'center' }}>
                        <Button
                          type="text"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => remove(name)}
                        />
                      </Col>
                    </Row>
                  </Card>
                ))}
                <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                  添加领队人员
                </Button>
              </div>
            )}
          </Form.List>
        </div>

        {/* Step 4: 须知与全真卡片预览 */}
        <div style={{ display: currentStep === 4 ? 'block' : 'none' }}>
          <Row gutter={16}>
            <Col span={24}>
              <Form.Item name="introduction" label="活动详情介绍 (文本)">
                <Input.TextArea
                  rows={4}
                  placeholder="详细介绍本次活动的路线亮点、自然风景、难度系数与装备要求"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="enrollNotice" label="📌 报名须知说明">
                <Input.TextArea
                  rows={3}
                  placeholder="例如：需具备一定体能储备，心脏病高血压患者请勿报名"
                />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item name="caution" label="⚠️ 安全注意事项">
                <Input.TextArea rows={3} placeholder="例如：山野环境注意防火，严禁私自脱离大部队" />
              </Form.Item>
            </Col>

            <Col span={24}>
              <Form.Item name="tips" label="💡 贴心温馨提示">
                <Input placeholder="例如：山顶气温较低，建议携带防风保温外套与热饮水壶" />
              </Form.Item>
            </Col>
          </Row>

          <Card
            title="✨ 活动发布前确认概览"
            size="small"
            style={{
              background: isDark ? '#1a1a1a' : '#f5f7fa',
              borderRadius: 8,
              marginTop: 12,
            }}
          >
            <Paragraph style={{ margin: 0 }}>
              活动确认保存后将进入<strong>草稿状态 (DRAFT)</strong>。若需直接在 App
              上线，请在列表操作栏提交审核或直接发布。
            </Paragraph>
          </Card>
        </div>
      </Form>
    </Modal>
  );
};

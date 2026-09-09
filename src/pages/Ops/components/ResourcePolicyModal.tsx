import { SettingOutlined } from '@ant-design/icons';
import { Col, Form, InputNumber, Modal, message, Row, Select, Slider, Space } from 'antd';
import type React from 'react';
import { useEffect, useState } from 'react';
import { saveOpsResourcePolicy } from '@/api/ops';
import type { OpsResourcePolicy } from '@/types';

interface ResourcePolicyModalProps {
  open: boolean;
  policy: OpsResourcePolicy;
  onClose: () => void;
  onSuccess: (updated: OpsResourcePolicy) => void;
}

export const ResourcePolicyModal: React.FC<ResourcePolicyModalProps> = ({
  open,
  policy,
  onClose,
  onSuccess,
}) => {
  const [form] = Form.useForm();
  const [saving, setSaving] = useState<boolean>(false);

  useEffect(() => {
    if (open) {
      form.setFieldsValue({
        hostCpuWarningPercent: policy.hostCpuWarningPercent,
        hostCpuCriticalPercent: policy.hostCpuCriticalPercent,
        hostMemoryWarningPercent: policy.hostMemoryWarningPercent,
        hostMemoryCriticalPercent: policy.hostMemoryCriticalPercent,
        jvmHeapWarningPercent: policy.jvmHeapWarningPercent,
        jvmHeapCriticalPercent: policy.jvmHeapCriticalPercent,
        probeTimeoutMillis: policy.probeTimeoutMillis,
        autoRefreshInterval: policy.autoRefreshInterval,
      });
    }
  }, [open, policy, form]);

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      const res = await saveOpsResourcePolicy(values);
      if (res.code === 200) {
        message.success('运维监控资源策略已成功更新');
        onSuccess(values);
        onClose();
      }
    } catch {
      message.error('保存策略配置失败');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={
        <Space>
          <SettingOutlined style={{ color: '#1677ff' }} />
          <span>调整运维资源监控与告警策略阈值</span>
        </Space>
      }
      open={open}
      onOk={handleSave}
      onCancel={onClose}
      confirmLoading={saving}
      okText="保存并即时生效"
      cancelText="取消"
      width={680}
      destroyOnClose
    >
      <Form form={form} layout="vertical" style={{ marginTop: 16 }}>
        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="宿主机 CPU 预警阈值 (%)"
              name="hostCpuWarningPercent"
              rules={[{ required: true }]}
            >
              <Slider min={50} max={95} marks={{ 60: '60%', 80: '80%', 90: '90%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="宿主机 CPU 严重阈值 (%)"
              name="hostCpuCriticalPercent"
              rules={[{ required: true }]}
            >
              <Slider min={70} max={99} marks={{ 85: '85%', 90: '90%', 95: '95%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="宿主机 内存 预警阈值 (%)"
              name="hostMemoryWarningPercent"
              rules={[{ required: true }]}
            >
              <Slider min={50} max={95} marks={{ 60: '60%', 70: '70%', 85: '85%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="宿主机 内存 严重阈值 (%)"
              name="hostMemoryCriticalPercent"
              rules={[{ required: true }]}
            >
              <Slider min={70} max={99} marks={{ 85: '85%', 90: '90%', 95: '95%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="JVM 堆内存 预警阈值 (%)"
              name="jvmHeapWarningPercent"
              rules={[{ required: true }]}
            >
              <Slider min={60} max={90} marks={{ 70: '70%', 80: '80%', 85: '85%' }} />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="JVM 堆内存 严重阈值 (%)"
              name="jvmHeapCriticalPercent"
              rules={[{ required: true }]}
            >
              <Slider min={75} max={98} marks={{ 85: '85%', 90: '90%', 95: '95%' }} />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={16}>
          <Col span={12}>
            <Form.Item
              label="Actuator 健康探针超时限制 (毫秒)"
              name="probeTimeoutMillis"
              rules={[{ required: true }]}
              extra="探测目标微服务超过该时长将判定为 DEGRADED 延时异常"
            >
              <InputNumber style={{ width: '100%' }} min={500} max={10000} step={500} suffix="ms" />
            </Form.Item>
          </Col>
          <Col span={12}>
            <Form.Item
              label="监控大盘默认轮询频率"
              name="autoRefreshInterval"
              rules={[{ required: true }]}
              extra="前端页面后台自动轮询探针状态的周期"
            >
              <Select
                options={[
                  { label: '每 10 秒刷新一次', value: 10 },
                  { label: '每 30 秒刷新一次 (推荐)', value: 30 },
                  { label: '每 60 秒刷新一次', value: 60 },
                ]}
              />
            </Form.Item>
          </Col>
        </Row>
      </Form>
    </Modal>
  );
};

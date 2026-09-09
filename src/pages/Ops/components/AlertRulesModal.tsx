import { BellOutlined } from '@ant-design/icons';
import type { TableProps } from 'antd';
import { Badge, Modal, Space, Table, Tag } from 'antd';
import type React from 'react';
import type { OpsAlertRuleItem } from '@/types';

interface AlertRulesModalProps {
  open: boolean;
  rules: OpsAlertRuleItem[];
  onClose: () => void;
}

export const AlertRulesModal: React.FC<AlertRulesModalProps> = ({ open, rules, onClose }) => {
  const columns: TableProps<OpsAlertRuleItem>['columns'] = [
    {
      title: '规则编码',
      dataIndex: 'ruleCode',
      key: 'ruleCode',
      width: 180,
      render: (code: string) => <code>{code}</code>,
    },
    {
      title: '规则名称',
      dataIndex: 'ruleName',
      key: 'ruleName',
      width: 180,
      render: (name: string, record) => (
        <Space direction="vertical" size={2}>
          <span style={{ fontWeight: 600 }}>{name}</span>
          <span style={{ fontSize: 12, color: '#8c8c8c' }}>{record.description}</span>
        </Space>
      ),
    },
    {
      title: '严重级别',
      dataIndex: 'severity',
      key: 'severity',
      width: 110,
      render: (sev: string) => {
        if (sev === 'CRITICAL') return <Tag color="error">严重 (P0)</Tag>;
        if (sev === 'WARNING') return <Tag color="warning">预警 (P1)</Tag>;
        return <Tag color="blue">提示 (P2)</Tag>;
      },
    },
    {
      title: '监控指标与条件',
      key: 'condition',
      width: 220,
      render: (_, r) => (
        <span>
          <code>{r.metric}</code> {r.operator}{' '}
          <strong style={{ color: '#cf1322' }}>
            {r.threshold} {r.unit}
          </strong>
        </span>
      ),
    },
    {
      title: '持续时长',
      dataIndex: 'durationSeconds',
      key: 'durationSeconds',
      width: 100,
      render: (sec: number) => `≥ ${sec} 秒`,
    },
    {
      title: '生效状态',
      dataIndex: 'enabled',
      key: 'enabled',
      width: 100,
      render: (enabled: boolean) =>
        enabled ? (
          <Badge status="processing" text="监控中" />
        ) : (
          <Badge status="default" text="已停用" />
        ),
    },
  ];

  return (
    <Modal
      title={
        <Space>
          <BellOutlined style={{ color: '#faad14' }} />
          <span>系统运维告警规则目录</span>
        </Space>
      }
      open={open}
      onCancel={onClose}
      footer={null}
      width={900}
      destroyOnClose
    >
      <div style={{ marginTop: 12 }}>
        <Table<OpsAlertRuleItem>
          rowKey="id"
          columns={columns}
          dataSource={rules}
          pagination={false}
          size="middle"
          bordered
        />
      </div>
    </Modal>
  );
};

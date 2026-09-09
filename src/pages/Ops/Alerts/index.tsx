import {
  AlertOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  ReloadOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import {
  Badge,
  Button,
  Card,
  Col,
  message,
  Popconfirm,
  Radio,
  Row,
  Select,
  Space,
  Statistic,
  Table,
  Tag,
  Typography,
  theme,
} from 'antd';
import type { ColumnsType } from 'antd/es/table';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { acknowledgeAlert, getOpsAlertRules, getOpsAlerts, getOpsResourcePolicy } from '@/api/ops';
import type { OpsAlertEventItem, OpsAlertRuleItem, OpsResourcePolicy } from '@/types';
import { AlertRulesModal } from '../components/AlertRulesModal';
import { ResourcePolicyModal } from '../components/ResourcePolicyModal';

const { Title, Text } = Typography;

export const OpsAlertsPage: React.FC = () => {
  const {
    token: {
      colorBgContainer,
      colorBorderSecondary,
      borderRadiusLG,
      colorPrimary,
      colorSuccess,
      colorWarning,
      colorError,
    },
  } = theme.useToken();

  const [loading, setLoading] = useState(false);
  const [alerts, setAlerts] = useState<OpsAlertEventItem[]>([]);
  const [rules, setRules] = useState<OpsAlertRuleItem[]>([]);
  const [policy, setPolicy] = useState<OpsResourcePolicy | null>(null);
  const [stateFilter, setStateFilter] = useState<'all' | 'firing' | 'acknowledged'>('firing');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [rulesModalOpen, setRulesModalOpen] = useState(false);
  const [policyModalOpen, setPolicyModalOpen] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState('');

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      const [alertsRes, rulesRes, policyRes] = await Promise.all([
        getOpsAlerts(),
        getOpsAlertRules(),
        getOpsResourcePolicy(),
      ]);

      if (alertsRes.code === 200 && alertsRes.data) setAlerts(alertsRes.data);
      if (rulesRes.code === 200 && rulesRes.data) setRules(rulesRes.data);
      if (policyRes.code === 200 && policyRes.data) setPolicy(policyRes.data);

      setLastRefreshed(new Date().toLocaleTimeString());
    } catch {
      message.error('加载告警事件与策略失败');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
    const timer = setInterval(() => {
      loadData();
    }, 30000);
    return () => clearInterval(timer);
  }, [loadData]);

  const handleAcknowledge = async (item: OpsAlertEventItem) => {
    try {
      const res = await acknowledgeAlert(item.id);
      if (res.code === 200) {
        message.success(`告警 [${item.ruleName}] 已确认处置`);
        loadData();
      }
    } catch {
      message.error('确认告警失败');
    }
  };

  const handleBatchAcknowledge = async () => {
    const unacked = alerts.filter((a) => !a.acknowledged);
    for (const item of unacked) {
      await acknowledgeAlert(item.id);
    }
    message.success(`已批量确认 ${unacked.length} 条告警事件`);
    loadData();
  };

  const filteredAlerts = alerts.filter((item) => {
    if (stateFilter === 'firing' && item.acknowledged) return false;
    if (stateFilter === 'acknowledged' && !item.acknowledged) return false;
    if (severityFilter !== 'all' && item.severity !== severityFilter) return false;
    return true;
  });

  const columns: ColumnsType<OpsAlertEventItem> = [
    {
      title: '严重级别',
      dataIndex: 'severity',
      key: 'severity',
      width: 110,
      render: (sev: string) => {
        if (sev === 'CRITICAL') return <Tag color="error">CRITICAL 致命</Tag>;
        if (sev === 'WARNING') return <Tag color="warning">WARNING 警告</Tag>;
        return <Tag color="blue">INFO 提示</Tag>;
      },
    },
    {
      title: '告警规则 / 触发原因',
      key: 'rule',
      render: (_, r) => (
        <div>
          <Text strong>{r.ruleName}</Text>
          <div>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {r.message}
            </Text>
          </div>
        </div>
      ),
    },
    {
      title: '目标节点/服务',
      dataIndex: 'target',
      key: 'target',
      render: (text) => <code>{text}</code>,
    },
    {
      title: '当前值 / 判定阈值',
      key: 'metric',
      render: (_, r) => (
        <Space>
          <Text strong style={{ color: colorError }}>
            {r.currentValue} {r.unit}
          </Text>
          <Text type="secondary">
            (阈值: {r.threshold} {r.unit})
          </Text>
        </Space>
      ),
    },
    {
      title: '首次触发时间',
      dataIndex: 'triggeredAt',
      key: 'triggeredAt',
      render: (val) => (
        <Space>
          <ClockCircleOutlined style={{ color: '#8c8c8c' }} />
          <Text type="secondary">{val}</Text>
        </Space>
      ),
    },
    {
      title: '处置状态',
      key: 'status',
      width: 120,
      render: (_, r) =>
        r.acknowledged ? (
          <Badge status="success" text="已确认处置" />
        ) : (
          <Badge status="processing" text="活动触发中" />
        ),
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_, r) =>
        !r.acknowledged ? (
          <Popconfirm
            title="确认处置此条告警？"
            description="确认后该事件将被标记为已知晓并通知运维团队进行跟踪排查。"
            onConfirm={() => handleAcknowledge(r)}
            okText="确认处置"
            cancelText="取消"
          >
            <Button size="small" type="primary" ghost>
              确认处置
            </Button>
          </Popconfirm>
        ) : (
          <Button size="small" disabled>
            已处置
          </Button>
        ),
    },
  ];

  const firingCount = alerts.filter((a) => !a.acknowledged).length;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {/* 顶部控制栏 */}
      <Card
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
        styles={{ body: { padding: '16px 24px' } }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Space size="middle">
              <AlertOutlined style={{ fontSize: 24, color: colorWarning }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  系统实时告警与监控规则中心
                </Title>
                <Text type="secondary">
                  集中展示集群各微服务、服务器节点与中间件故障报警，并提供阈值策略配置
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Button icon={<FileTextOutlined />} onClick={() => setRulesModalOpen(true)}>
                告警规则目录 ({rules.length})
              </Button>
              <Button icon={<SettingOutlined />} onClick={() => setPolicyModalOpen(true)}>
                监控阈值策略
              </Button>
              <Button icon={<ReloadOutlined spin={loading} />} onClick={loadData} loading={loading}>
                刷新
              </Button>
              {lastRefreshed && (
                <Text type="secondary" style={{ fontSize: 12 }}>
                  更新: {lastRefreshed}
                </Text>
              )}
            </Space>
          </Col>
        </Row>
      </Card>

      {/* 指标看板 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: borderRadiusLG,
              background: colorBgContainer,
              border: `1px solid ${colorBorderSecondary}`,
            }}
          >
            <Statistic
              title="当前触发中 (Firing)"
              value={firingCount}
              valueStyle={{
                color: firingCount > 0 ? colorError : colorSuccess,
                fontWeight: 'bold',
              }}
              prefix={<AlertOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: borderRadiusLG,
              background: colorBgContainer,
              border: `1px solid ${colorBorderSecondary}`,
            }}
          >
            <Statistic
              title="已确认处置"
              value={alerts.filter((a) => a.acknowledged).length}
              valueStyle={{ color: colorSuccess, fontWeight: 'bold' }}
              prefix={<CheckCircleOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={8}>
          <Card
            style={{
              borderRadius: borderRadiusLG,
              background: colorBgContainer,
              border: `1px solid ${colorBorderSecondary}`,
            }}
          >
            <Statistic
              title="生效中监控规则"
              value={rules.filter((r) => r.enabled).length}
              suffix={`/ ${rules.length}`}
              valueStyle={{ color: colorPrimary, fontWeight: 'bold' }}
              prefix={<BellOutlined />}
            />
          </Card>
        </Col>
      </Row>

      {/* 告警事件列表 */}
      <Card
        title={
          <Space>
            <AlertOutlined style={{ color: colorWarning }} />
            <span>告警事件列表</span>
            <Tag color={firingCount > 0 ? 'red' : 'green'}>{filteredAlerts.length} 条记录</Tag>
          </Space>
        }
        extra={
          <Space>
            <Radio.Group
              value={stateFilter}
              onChange={(e) => setStateFilter(e.target.value)}
              size="small"
            >
              <Radio.Button value="firing">活动触发中 ({firingCount})</Radio.Button>
              <Radio.Button value="all">全部历史 ({alerts.length})</Radio.Button>
              <Radio.Button value="acknowledged">
                已确认 ({alerts.length - firingCount})
              </Radio.Button>
            </Radio.Group>
            <Select
              value={severityFilter}
              onChange={setSeverityFilter}
              size="small"
              style={{ width: 120 }}
              options={[
                { label: '全部等级', value: 'all' },
                { label: '致命 (CRITICAL)', value: 'CRITICAL' },
                { label: '警告 (WARNING)', value: 'WARNING' },
                { label: '提示 (INFO)', value: 'INFO' },
              ]}
            />
            {firingCount > 0 && (
              <Popconfirm
                title="一键确认所有未处置告警？"
                onConfirm={handleBatchAcknowledge}
                okText="批量确认"
                cancelText="取消"
              >
                <Button size="small" type="primary">
                  批量确认处置 ({firingCount})
                </Button>
              </Popconfirm>
            )}
          </Space>
        }
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <Table<OpsAlertEventItem>
          rowKey="id"
          columns={columns}
          dataSource={filteredAlerts}
          pagination={{ pageSize: 8 }}
          loading={loading}
        />
      </Card>

      {/* 规则目录弹窗 */}
      <AlertRulesModal
        open={rulesModalOpen}
        rules={rules}
        onClose={() => setRulesModalOpen(false)}
      />

      {/* 资源阈值策略弹窗 */}
      {policy && (
        <ResourcePolicyModal
          open={policyModalOpen}
          policy={policy}
          onClose={() => setPolicyModalOpen(false)}
          onSuccess={(newPolicy) => setPolicy(newPolicy)}
        />
      )}
    </div>
  );
};

export default OpsAlertsPage;

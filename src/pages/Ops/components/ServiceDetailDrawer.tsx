import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  CloudServerOutlined,
  ExclamationCircleOutlined,
  QuestionCircleOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Button, Card, Descriptions, Divider, Drawer, Progress, Space, Tag, theme } from 'antd';
import type React from 'react';
import { useState } from 'react';
import { triggerServiceProbe } from '@/api/ops';
import { useThemeStore } from '@/store/theme';
import type { OpsServiceItem } from '@/types';

interface ServiceDetailDrawerProps {
  open: boolean;
  service: OpsServiceItem | null;
  onClose: () => void;
  onProbeSuccess: (updated: OpsServiceItem) => void;
}

export const ServiceDetailDrawer: React.FC<ServiceDetailDrawerProps> = ({
  open,
  service,
  onClose,
  onProbeSuccess,
}) => {
  const isDark = useThemeStore((state) => state.isDark);
  const { token } = theme.useToken();
  const [probing, setProbing] = useState<boolean>(false);

  if (!service) return null;

  const handleProbe = async () => {
    setProbing(true);
    try {
      const res = await triggerServiceProbe(service.id);
      if (res.code === 200 && res.data) {
        onProbeSuccess(res.data);
      }
    } finally {
      setProbing(false);
    }
  };

  const getStatusTag = (status: string) => {
    switch (status) {
      case 'UP':
        return (
          <Tag color="success" icon={<CheckCircleOutlined />}>
            正常在线 (UP)
          </Tag>
        );
      case 'DOWN':
        return (
          <Tag color="error" icon={<CloseCircleOutlined />}>
            服务离线 (DOWN)
          </Tag>
        );
      case 'DEGRADED':
        return (
          <Tag color="warning" icon={<ExclamationCircleOutlined />}>
            亚健康降级 (DEGRADED)
          </Tag>
        );
      default:
        return (
          <Tag color="default" icon={<QuestionCircleOutlined />}>
            未知状态 (UNKNOWN)
          </Tag>
        );
    }
  };

  return (
    <Drawer
      title={
        <Space>
          <CloudServerOutlined style={{ color: token.colorPrimary }} />
          <span>微服务资产详情与探针快照</span>
        </Space>
      }
      placement="right"
      size="large"
      open={open}
      onClose={onClose}
      destroyOnClose
      extra={
        <Button type="primary" icon={<ReloadOutlined />} loading={probing} onClick={handleProbe}>
          立即探活探测
        </Button>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* 基本信息 */}
        <Descriptions
          bordered
          size="small"
          column={{ xs: 1, sm: 2 }}
          styles={{
            label: {
              background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#fafafa',
              width: 140,
            },
          }}
        >
          <Descriptions.Item label="服务名称 (Service)">
            <span style={{ fontWeight: 600 }}>{service.name}</span>
          </Descriptions.Item>
          <Descriptions.Item label="业务中文定义">{service.chineseName}</Descriptions.Item>
          <Descriptions.Item label="当前探针状态">{getStatusTag(service.status)}</Descriptions.Item>
          <Descriptions.Item label="部署版本">
            <Tag color="blue">{service.version}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="运行节点与端口">
            <code>
              {service.host}:{service.port}
            </code>
          </Descriptions.Item>
          <Descriptions.Item label="在线集群实例">
            {service.instanceCount} 个活跃节点
          </Descriptions.Item>
          <Descriptions.Item label="探针响应耗时">
            <span
              style={{
                fontWeight: 600,
                color:
                  service.responseTime > 100
                    ? '#ff4d4f'
                    : service.responseTime > 50
                      ? '#faad14'
                      : '#52c41a',
              }}
            >
              {service.responseTime} ms
            </span>
          </Descriptions.Item>
          <Descriptions.Item label="连续运行时长">{service.uptime}</Descriptions.Item>
          <Descriptions.Item label="探活端点" span={2}>
            <code>{service.probeEndpoint}</code>
          </Descriptions.Item>
          <Descriptions.Item label="最近心跳同步时间" span={2}>
            {service.lastProbeTime}
          </Descriptions.Item>
        </Descriptions>

        <Divider style={{ margin: '8px 0' }}>运行时资源负荷</Divider>

        {/* 资源条目 */}
        <Card
          size="small"
          title="实例 CPU 与堆内存利用率"
          style={{
            background: token.colorBgContainer,
            borderColor: token.colorBorderSecondary,
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <span>JVM 堆内存利用率</span>
                <span style={{ fontWeight: 600 }}>{service.jvmHeapUsage}%</span>
              </div>
              <Progress
                percent={service.jvmHeapUsage}
                status={service.jvmHeapUsage > 80 ? 'exception' : 'normal'}
                strokeColor={
                  service.jvmHeapUsage > 80
                    ? '#ff4d4f'
                    : service.jvmHeapUsage > 60
                      ? '#faad14'
                      : '#52c41a'
                }
              />
            </div>

            <div>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  marginBottom: 4,
                }}
              >
                <span>CPU 核心计算负载</span>
                <span style={{ fontWeight: 600 }}>{service.cpuUsage}%</span>
              </div>
              <Progress
                percent={service.cpuUsage}
                strokeColor={service.cpuUsage > 80 ? '#ff4d4f' : '#1677ff'}
              />
            </div>
          </div>
        </Card>

        {/* Actuator 深度健康探针组件详情 */}
        {service.details && (
          <Card
            size="small"
            title="Actuator 组件健康分项快照"
            style={{
              background: token.colorBgContainer,
              borderColor: token.colorBorderSecondary,
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {service.details.db && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f5f5f5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>HikariCP 数据库连接池</div>
                    <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
                      活跃连接数: {service.details.db.activeConnections} / 最大容量:{' '}
                      {service.details.db.maxConnections}
                    </div>
                  </div>
                  <Tag color={service.details.db.status === 'UP' ? 'success' : 'warning'}>
                    {service.details.db.status}
                  </Tag>
                </div>
              )}

              {service.details.diskSpace && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f5f5f5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>宿主机磁盘空间 (Disk)</div>
                    <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
                      总量: {service.details.diskSpace.total} / 剩余可用:{' '}
                      {service.details.diskSpace.free}
                    </div>
                  </div>
                  <Tag color="success">{service.details.diskSpace.status}</Tag>
                </div>
              )}

              {service.details.redis && (
                <div
                  style={{
                    padding: '8px 12px',
                    borderRadius: 6,
                    background: isDark ? 'rgba(255, 255, 255, 0.04)' : '#f5f5f5',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 600 }}>Redis 连接探测</div>
                    <div style={{ fontSize: 12, color: token.colorTextSecondary }}>
                      版本: {service.details.redis.version}
                    </div>
                  </div>
                  <Tag color="success">{service.details.redis.status}</Tag>
                </div>
              )}
            </div>
          </Card>
        )}
      </div>
    </Drawer>
  );
};

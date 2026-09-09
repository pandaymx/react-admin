import {
  ApartmentOutlined,
  ClockCircleOutlined,
  DashboardOutlined,
  PieChartOutlined,
  ReloadOutlined,
  ThunderboltOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Col,
  Descriptions,
  Divider,
  message,
  Progress,
  Row,
  Select,
  Space,
  Statistic,
  Tag,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { getJvmDetail, getOpsServices } from '@/api/ops';
import type { JvmDetailInfo, OpsServiceItem } from '@/types';

const { Title, Text } = Typography;

export const OpsJvmPage: React.FC = () => {
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
  const [env, setEnv] = useState<'prod' | 'staging' | 'test' | 'dev'>('prod');
  const [services, setServices] = useState<OpsServiceItem[]>([]);
  const [selectedServiceCode, setSelectedServiceCode] = useState<string>('user-server');
  const [jvmData, setJvmData] = useState<JvmDetailInfo | null>(null);
  const [lastRefreshed, setLastRefreshed] = useState<string>('');

  const loadServices = useCallback(async () => {
    try {
      const res = await getOpsServices(env);
      if (res.code === 200 && res.data) {
        setServices(res.data);
      }
    } catch {
      // ignore
    }
  }, [env]);

  const loadJvmData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await getJvmDetail(selectedServiceCode, env);
      if (res.code === 200 && res.data) {
        setJvmData(res.data);
        setLastRefreshed(new Date().toLocaleTimeString());
      }
    } catch {
      message.error('获取 JVM 监控数据失败');
    } finally {
      setLoading(false);
    }
  }, [selectedServiceCode, env]);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  useEffect(() => {
    loadJvmData();
    const timer = setInterval(() => {
      loadJvmData();
    }, 30000);
    return () => clearInterval(timer);
  }, [loadJvmData]);

  if (!jvmData) {
    return (
      <Card
        style={{ borderRadius: borderRadiusLG, background: colorBgContainer }}
        loading={loading}
      >
        <div style={{ height: 400 }} />
      </Card>
    );
  }

  const edenPercent = Number(((jvmData.edenUsedMb / jvmData.edenMaxMb) * 100).toFixed(1));
  const oldGenPercent = Number(((jvmData.oldGenUsedMb / jvmData.oldGenMaxMb) * 100).toFixed(1));
  const metaspacePercent = Number(
    ((jvmData.metaspaceUsedMb / jvmData.metaspaceMaxMb) * 100).toFixed(1),
  );

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
              <DashboardOutlined style={{ fontSize: 24, color: '#722ed1' }} />
              <div>
                <Title level={4} style={{ margin: 0 }}>
                  JVM 性能与垃圾回收 (GC) 监控
                </Title>
                <Text type="secondary">
                  监控各微服务实例 JVM 堆分代 (Eden/Survivor/老年代)、元空间、GC 停顿频次与线程大盘
                </Text>
              </div>
            </Space>
          </Col>
          <Col>
            <Space>
              <Text type="secondary">监测微服务：</Text>
              <Select
                value={selectedServiceCode}
                onChange={setSelectedServiceCode}
                style={{ width: 190 }}
                options={
                  services.length > 0
                    ? services.map((s) => ({
                        label: `${s.chineseName} (${s.name})`,
                        value: s.name,
                      }))
                    : [
                        { label: '用户中心服务 (user-server)', value: 'user-server' },
                        { label: 'API 网关服务 (gateway-server)', value: 'gateway-server' },
                        { label: '内容动态服务 (feeds-server)', value: 'feeds-server' },
                      ]
                }
              />
              <Select
                value={env}
                onChange={setEnv}
                style={{ width: 130 }}
                options={[
                  { label: '生产 (Prod)', value: 'prod' },
                  { label: '预发布 (Staging)', value: 'staging' },
                  { label: '测试 (Test)', value: 'test' },
                  { label: '开发 (Dev)', value: 'dev' },
                ]}
              />
              <Button
                icon={<ReloadOutlined spin={loading} />}
                onClick={loadJvmData}
                loading={loading}
              >
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

      {/* JVM 基础档案 */}
      <Card
        title={
          <Space>
            <ThunderboltOutlined style={{ color: '#722ed1' }} />
            <span>目标服务 Java 虚拟机档案</span>
            <Tag color="purple">{jvmData.chineseName}</Tag>
          </Space>
        }
        style={{
          borderRadius: borderRadiusLG,
          background: colorBgContainer,
          border: `1px solid ${colorBorderSecondary}`,
        }}
      >
        <Descriptions bordered size="small" column={{ xxl: 4, xl: 4, lg: 2, md: 2, sm: 1, xs: 1 }}>
          <Descriptions.Item label="JVM 虚拟机">{jvmData.jvmName}</Descriptions.Item>
          <Descriptions.Item label="JDK 版本">
            <code>{jvmData.jvmVersion}</code>
          </Descriptions.Item>
          <Descriptions.Item label="启动时间">{jvmData.startTime}</Descriptions.Item>
          <Descriptions.Item label="连续运行时长">
            <Tag color="green">{jvmData.uptime}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="JAVA_HOME 路径" span={2}>
            <code>{jvmData.javaHome}</code>
          </Descriptions.Item>
          <Descriptions.Item label="初始堆大小">
            {jvmData.initHeapMb} MB ({(jvmData.initHeapMb / 1024).toFixed(1)} GB)
          </Descriptions.Item>
          <Descriptions.Item label="最大堆上限">
            {jvmData.maxHeapMb} MB ({(jvmData.maxHeapMb / 1024).toFixed(1)} GB)
          </Descriptions.Item>
        </Descriptions>
      </Card>

      {/* 堆内存分代模型 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card
            title={
              <Space>
                <PieChartOutlined style={{ color: colorPrimary }} />
                <span>JVM 堆总内存分配 (Heap Memory)</span>
              </Space>
            }
            style={{
              height: '100%',
              borderRadius: borderRadiusLG,
              background: colorBgContainer,
              border: `1px solid ${colorBorderSecondary}`,
            }}
          >
            <Row gutter={16} align="middle">
              <Col span={10} style={{ textAlign: 'center' }}>
                <Progress
                  type="dashboard"
                  percent={jvmData.heapUsagePercent}
                  size={140}
                  strokeColor={jvmData.heapUsagePercent > 80 ? colorWarning : colorPrimary}
                  format={(p) => (
                    <div>
                      <div style={{ fontSize: 24, fontWeight: 'bold' }}>{p}%</div>
                      <div style={{ fontSize: 12, color: '#8c8c8c' }}>堆内存使用率</div>
                    </div>
                  )}
                />
              </Col>
              <Col span={14}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">已使用 (Used)：</Text>
                    <Text strong style={{ color: colorPrimary }}>
                      {jvmData.usedHeapMb} MB ({(jvmData.usedHeapMb / 1024).toFixed(2)} GB)
                    </Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">已申请提交 (Committed)：</Text>
                    <Text>{jvmData.committedHeapMb} MB</Text>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Text type="secondary">最大允许 (Max)：</Text>
                    <Text>{jvmData.maxHeapMb} MB</Text>
                  </div>
                </div>
              </Col>
            </Row>

            <Divider style={{ margin: '16px 0' }} />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text strong>新生代 Eden 区 ({edenPercent}%)：</Text>
                  <Text type="secondary">
                    {jvmData.edenUsedMb} MB / {jvmData.edenMaxMb} MB
                  </Text>
                </div>
                <Progress percent={edenPercent} strokeColor="#13c2c2" size="small" />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text strong>老年代 Old Gen ({oldGenPercent}%)：</Text>
                  <Text type="secondary">
                    {jvmData.oldGenUsedMb} MB / {jvmData.oldGenMaxMb} MB
                  </Text>
                </div>
                <Progress
                  percent={oldGenPercent}
                  strokeColor={oldGenPercent > 80 ? colorError : '#fa8c16'}
                  size="small"
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <Text strong>非堆元空间 Metaspace ({metaspacePercent}%)：</Text>
                  <Text type="secondary">
                    {jvmData.metaspaceUsedMb} MB / {jvmData.metaspaceMaxMb} MB
                  </Text>
                </div>
                <Progress percent={metaspacePercent} strokeColor="#722ed1" size="small" />
              </div>
            </div>
          </Card>
        </Col>

        {/* 垃圾回收与线程模型 */}
        <Col xs={24} lg={12}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {/* GC 统计 */}
            <Card
              title={
                <Space>
                  <ClockCircleOutlined style={{ color: colorPrimary }} />
                  <span>垃圾回收统计 (Garbage Collection)</span>
                </Space>
              }
              style={{
                borderRadius: borderRadiusLG,
                background: colorBgContainer,
                border: `1px solid ${colorBorderSecondary}`,
              }}
            >
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Young GC 次数 / 累计耗时"
                    value={jvmData.youngGcCount}
                    suffix={`次 / ${(jvmData.youngGcTimeMs / 1000).toFixed(2)}s`}
                    valueStyle={{ color: colorPrimary, fontSize: 18 }}
                  />
                  <div style={{ marginTop: 6 }}>
                    <Text type="secondary" style={{ fontSize: 12 }}>
                      平均单次耗时: {(jvmData.youngGcTimeMs / jvmData.youngGcCount).toFixed(2)} ms
                    </Text>
                  </div>
                </Col>
                <Col span={12}>
                  <Statistic
                    title="Full GC 次数 / STW 耗时"
                    value={jvmData.fullGcCount}
                    suffix={`次 / ${(jvmData.fullGcTimeMs / 1000).toFixed(2)}s`}
                    valueStyle={{
                      color: jvmData.fullGcCount > 10 ? colorError : colorSuccess,
                      fontSize: 18,
                    }}
                  />
                  <div style={{ marginTop: 6 }}>
                    <Tag color={jvmData.fullGcCount === 0 ? 'green' : 'orange'}>
                      {jvmData.fullGcCount === 0 ? '极佳: 零 Full GC' : '低频正常'}
                    </Tag>
                  </div>
                </Col>
              </Row>
            </Card>

            {/* 线程大盘 */}
            <Card
              title={
                <Space>
                  <ApartmentOutlined style={{ color: colorPrimary }} />
                  <span>JVM 线程模型大盘</span>
                </Space>
              }
              style={{
                borderRadius: borderRadiusLG,
                background: colorBgContainer,
                border: `1px solid ${colorBorderSecondary}`,
              }}
            >
              <Row gutter={16}>
                <Col span={6}>
                  <Statistic
                    title="活动线程"
                    value={jvmData.threadCount}
                    valueStyle={{ color: colorPrimary, fontWeight: 'bold' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic title="历史峰值" value={jvmData.peakThreadCount} />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="守护线程"
                    value={jvmData.daemonThreadCount}
                    valueStyle={{ color: '#8c8c8c' }}
                  />
                </Col>
                <Col span={6}>
                  <Statistic
                    title="死锁线程"
                    value={jvmData.deadlockedThreadCount}
                    valueStyle={{
                      color: jvmData.deadlockedThreadCount > 0 ? colorError : colorSuccess,
                      fontWeight: 'bold',
                    }}
                  />
                </Col>
              </Row>
            </Card>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default OpsJvmPage;

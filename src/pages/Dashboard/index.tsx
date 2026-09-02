import {
  ArrowUpOutlined,
  ShoppingCartOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { Card, Col, Row, Statistic, Table, Tag } from 'antd';
import type React from 'react';

const dataSource = [
  {
    key: '1',
    name: '系统初始化完成',
    operator: '管理员',
    status: 'SUCCESS',
    time: '2026-09-02 10:00:00',
  },
  {
    key: '2',
    name: '安装 Bun 核心包',
    operator: 'System',
    status: 'SUCCESS',
    time: '2026-09-02 10:30:00',
  },
  {
    key: '3',
    name: '配置 Biome & Git Hooks',
    operator: '管理员',
    status: 'SUCCESS',
    time: '2026-09-02 10:45:00',
  },
];

const columns = [
  { title: '事件名称', dataIndex: 'name', key: 'name' },
  { title: '操作人', dataIndex: 'operator', key: 'operator' },
  {
    title: '状态',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag color={status === 'SUCCESS' ? 'success' : 'error'}>{status}</Tag>
    ),
  },
  { title: '记录时间', dataIndex: 'time', key: 'time' },
];

export const DashboardPage: React.FC = () => {
  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={1289}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#3f8600' }}
              suffix={<ArrowUpOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃访客"
              value={9320}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="订单总量" value={568} prefix={<ShoppingCartOutlined />} />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic title="系统运行状态" value="健康" valueStyle={{ color: '#52c41a' }} />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 24 }}>
        <Card title="最新系统日志">
          <Table dataSource={dataSource} columns={columns} pagination={false} />
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;

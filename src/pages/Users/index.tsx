import { PlusOutlined, ReloadOutlined } from '@ant-design/icons';
import { Button, Card, Space, Table, Tag } from 'antd';
import type React from 'react';
import { useState } from 'react';

interface UserRecord {
  key: string;
  id: string;
  username: string;
  email: string;
  role: string;
  status: 'active' | 'disabled';
  createdAt: string;
}

const initialData: UserRecord[] = [
  {
    key: '1',
    id: '1001',
    username: 'admin',
    email: 'admin@example.com',
    role: '超级管理员',
    status: 'active',
    createdAt: '2026-01-01',
  },
  {
    key: '2',
    id: '1002',
    username: 'developer',
    email: 'dev@example.com',
    role: '开发人员',
    status: 'active',
    createdAt: '2026-02-15',
  },
  {
    key: '3',
    id: '1003',
    username: 'tester',
    email: 'test@example.com',
    role: '测试人员',
    status: 'disabled',
    createdAt: '2026-03-20',
  },
];

export const UsersPage: React.FC = () => {
  const [data, setData] = useState<UserRecord[]>(initialData);
  const [loading, setLoading] = useState(false);

  const handleRefresh = () => {
    setLoading(true);
    setTimeout(() => {
      setData([...initialData]);
      setLoading(false);
    }, 400);
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: '用户名', dataIndex: 'username', key: 'username' },
    { title: '邮箱', dataIndex: 'email', key: 'email' },
    { title: '角色', dataIndex: 'role', key: 'role' },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: 'active' | 'disabled') => (
        <Tag color={status === 'active' ? 'green' : 'red'}>
          {status === 'active' ? '正常' : '已禁用'}
        </Tag>
      ),
    },
    { title: '创建时间', dataIndex: 'createdAt', key: 'createdAt' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button type="link" size="small" style={{ padding: 0 }}>
            编辑
          </Button>
          <Button type="link" size="small" danger style={{ padding: 0 }}>
            删除
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <Card
      title="用户管理"
      extra={
        <Space>
          <Button icon={<ReloadOutlined />} onClick={handleRefresh} loading={loading}>
            刷新
          </Button>
          <Button type="primary" icon={<PlusOutlined />}>
            新建用户
          </Button>
        </Space>
      }
    >
      <Table dataSource={data} columns={columns} loading={loading} />
    </Card>
  );
};

export default UsersPage;

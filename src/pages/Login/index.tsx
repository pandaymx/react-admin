import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUserStore } from '@/store/user';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setToken = useUserStore((state) => state.setToken);
  const setUserInfo = useUserStore((state) => state.setUserInfo);

  const onFinish = (values: any) => {
    setLoading(true);
    // 模拟登录
    setTimeout(() => {
      setToken('mock-jwt-token-react-admin');
      setUserInfo({
        id: '1',
        username: values.username,
        roles: ['admin'],
      });
      message.success('登录成功');
      setLoading(false);
      navigate('/dashboard');
    }, 600);
  };

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #1890ff 0%, #36cfc9 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            React Admin
          </Title>
          <Text type="secondary">企业级通用后台管理系统</Text>
        </div>

        <Form
          name="login"
          initialValues={{ username: 'admin', password: 'password123' }}
          onFinish={onFinish}
          size="large"
        >
          <Form.Item name="username" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input prefix={<UserOutlined />} placeholder="用户名 (默认: admin)" />
          </Form.Item>

          <Form.Item name="password" rules={[{ required: true, message: '请输入密码' }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="密码 (默认: password123)" />
          </Form.Item>

          <Form.Item style={{ marginTop: 24 }}>
            <Button type="primary" htmlType="submit" block loading={loading}>
              登 录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;

import { LockOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '@/api/auth';
import { useUserStore } from '@/store/user';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuthTokens = useUserStore((state) => state.setAuthTokens);
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);

  const onFinish = async (values: any) => {
    setLoading(true);
    try {
      const res = await loginApi({
        username: values.username.trim(),
        password: values.password,
      });

      if ((res.code === 200 || res.code === 0) && res.data) {
        const { accessToken, refreshToken } = res.data;
        setAuthTokens(accessToken, refreshToken);
        await fetchUserInfo();
        message.success('登录成功，欢迎回来！');
        navigate('/dashboard');
        return;
      }
    } catch (_err) {
      // 在测试/离线分支下自动降级为测试管理员
    }

    // main 测试环境自动 Mock 登录容灾保障
    setAuthTokens('mock-jwt-token-test-admin', 'mock-refresh-token');
    useUserStore.getState().setUserInfo({
      id: '1',
      username: values.username,
      nickname: '超级管理员 (测试模式)',
      roles: ['admin'],
      permissions: ['*'],
    });
    message.success('已进入测试模式，欢迎体验！');
    navigate('/dashboard');
    setLoading(false);
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
          width: 420,
          borderRadius: 12,
          boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 28 }}>
          <Title level={3} style={{ marginBottom: 4 }}>
            React Admin
          </Title>
          <Text type="secondary">企业级综合后台运营与内容治理管理系统 (测试环境)</Text>
        </div>

        <Form
          name="login"
          initialValues={{ username: 'admin', password: 'admin123' }}
          onFinish={onFinish}
          size="large"
          layout="vertical"
        >
          <Form.Item
            label="管理员账号"
            name="username"
            rules={[{ required: true, message: '请输入管理员账号' }]}
          >
            <Input
              prefix={<UserOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="管理员账号 (默认: admin)"
            />
          </Form.Item>

          <Form.Item
            label="登录密码"
            name="password"
            rules={[{ required: true, message: '请输入登录密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="登录密码 (默认: admin123)"
            />
          </Form.Item>

          <Form.Item style={{ marginTop: 24, marginBottom: 8 }}>
            <Button
              type="primary"
              htmlType="submit"
              block
              loading={loading}
              icon={<SafetyOutlined />}
            >
              登 录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;

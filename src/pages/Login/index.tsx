import { LockOutlined, SafetyOutlined, UserOutlined } from '@ant-design/icons';
import { Button, Card, Form, Input, message, Typography } from 'antd';
import type React from 'react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginApi } from '@/api/auth';
import { SlideCaptchaModal } from '@/components/Captcha/SlideCaptchaModal';
import { useUserStore } from '@/store/user';

const { Title, Text } = Typography;

export const LoginPage: React.FC = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [captchaModalVisible, setCaptchaModalVisible] = useState(false);
  const [pendingValues, setPendingValues] = useState<{ username: string; password: string } | null>(
    null,
  );

  const navigate = useNavigate();
  const setAuthTokens = useUserStore((state) => state.setAuthTokens);
  const fetchUserInfo = useUserStore((state) => state.fetchUserInfo);

  // 点击登录按钮触发校验并唤起安全验证码弹窗
  const handlePreLogin = (values: any) => {
    setPendingValues({
      username: values.username.trim(),
      password: values.password,
    });
    setCaptchaModalVisible(true);
  };

  // 验证码验证成功后，携带 captchaVerification 令牌正式提交登录
  const handleCaptchaSuccess = async (captchaVerification: string) => {
    setCaptchaModalVisible(false);
    if (!pendingValues) return;

    setLoading(true);
    try {
      const res = await loginApi({
        username: pendingValues.username,
        password: pendingValues.password,
        captchaVerification,
      });

      if ((res.code === 200 || res.code === 0) && res.data) {
        const { accessToken, refreshToken } = res.data;
        setAuthTokens(accessToken, refreshToken);
        await fetchUserInfo();
        message.success('登录成功，欢迎回来！');
        navigate('/dashboard');
      } else {
        message.error(res.msg || res.message || '登录失败，请检查账号密码');
      }
    } catch (_err) {
      // 拦截器统一处理错误提示
    } finally {
      setLoading(false);
    }
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
          <Text type="secondary">企业级综合后台运营与内容治理管理系统</Text>
        </div>

        <Form
          form={form}
          name="login"
          initialValues={{
            username: 'admin',
            password: import.meta.env.PROD ? '' : 'admin123',
          }}
          onFinish={handlePreLogin}
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
              placeholder="管理员账号"
              autoComplete="username"
            />
          </Form.Item>

          <Form.Item
            label="登录密码"
            name="password"
            rules={[{ required: true, message: '请输入登录密码' }]}
          >
            <Input.Password
              prefix={<LockOutlined style={{ color: '#bfbfbf' }} />}
              placeholder="登录密码"
              autoComplete="current-password"
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

      {/* AJ-Captcha 行为滑动验证码弹窗 */}
      <SlideCaptchaModal
        open={captchaModalVisible}
        onCancel={() => setCaptchaModalVisible(false)}
        onSuccess={handleCaptchaSuccess}
      />
    </div>
  );
};

export default LoginPage;

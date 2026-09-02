import {
  AuditOutlined,
  CheckOutlined,
  CommentOutlined,
  DashboardOutlined,
  DesktopOutlined,
  ExclamationCircleOutlined,
  FileTextOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoonOutlined,
  SafetyCertificateOutlined,
  SunOutlined,
  TeamOutlined,
  UserOutlined,
} from '@ant-design/icons';
import type { MenuProps } from 'antd';
import {
  Avatar,
  Breadcrumb,
  Button,
  Dropdown,
  Layout,
  Menu,
  Space,
  Tooltip,
  Typography,
  theme,
} from 'antd';
import type React from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useThemeStore } from '@/store/theme';
import { useUserStore } from '@/store/user';

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '仪表盘',
  },
  {
    key: 'user-management',
    icon: <TeamOutlined />,
    label: '用户管理',
    children: [
      {
        key: '/users',
        icon: <UserOutlined />,
        label: '用户列表',
      },
      {
        key: '/posts',
        icon: <FileTextOutlined />,
        label: '帖子管理',
      },
      {
        key: '/comments',
        icon: <CommentOutlined />,
        label: '评论管理',
      },
    ],
  },
  {
    key: '/verifications',
    icon: <SafetyCertificateOutlined />,
    label: '认证管理',
  },
  {
    key: '/reports',
    icon: <ExclamationCircleOutlined />,
    label: '举报管理',
  },
  {
    key: '/appeals',
    icon: <AuditOutlined />,
    label: '申诉管理',
  },
];

export const BasicLayout: React.FC = () => {
  const { collapsed, toggleCollapse, logout, userInfo } = useUserStore();
  const { preference, isDark, setPreference } = useThemeStore();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, colorBorderSecondary, borderRadiusLG },
  } = theme.useToken();

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  const handleUserMenuClick: MenuProps['onClick'] = ({ key }) => {
    if (key === 'logout') {
      logout();
      navigate('/login');
    }
  };

  const themeMenuItems: MenuProps['items'] = [
    {
      key: 'light',
      icon: <SunOutlined style={{ color: '#faad14' }} />,
      label: (
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <span>浅色模式</span>
          {preference === 'light' && <CheckOutlined style={{ color: '#1677ff' }} />}
        </Space>
      ),
      onClick: () => setPreference('light'),
    },
    {
      key: 'dark',
      icon: <MoonOutlined style={{ color: '#1677ff' }} />,
      label: (
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <span>暗黑模式</span>
          {preference === 'dark' && <CheckOutlined style={{ color: '#1677ff' }} />}
        </Space>
      ),
      onClick: () => setPreference('dark'),
    },
    {
      key: 'system',
      icon: <DesktopOutlined style={{ color: '#52c41a' }} />,
      label: (
        <Space style={{ width: '100%', justifyContent: 'space-between' }}>
          <span>跟随系统自动</span>
          {preference === 'system' && <CheckOutlined style={{ color: '#1677ff' }} />}
        </Space>
      ),
      onClick: () => setPreference('system'),
    },
  ];

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'user-info',
      label: `用户: ${userInfo?.username || '管理员'}`,
      disabled: true,
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      danger: true,
    },
  ];

  const getBreadcrumbTitle = () => {
    switch (location.pathname) {
      case '/users':
        return ['用户管理', '用户列表'];
      case '/posts':
        return ['用户管理', '帖子管理'];
      case '/comments':
        return ['用户管理', '评论管理'];
      case '/verifications':
        return ['认证管理'];
      case '/reports':
        return ['举报管理'];
      case '/appeals':
        return ['申诉管理'];
      default:
        return ['仪表盘'];
    }
  };

  const breadcrumbItems = [{ title: '首页' }, ...getBreadcrumbTitle().map((title) => ({ title }))];

  const getThemeButtonIcon = () => {
    if (preference === 'system') {
      return isDark ? (
        <DesktopOutlined style={{ color: '#52c41a', fontSize: 17 }} />
      ) : (
        <DesktopOutlined style={{ color: '#52c41a', fontSize: 17 }} />
      );
    }
    return isDark ? (
      <MoonOutlined style={{ color: '#1677ff', fontSize: 18 }} />
    ) : (
      <SunOutlined style={{ color: '#faad14', fontSize: 18 }} />
    );
  };

  const getThemeTooltip = () => {
    if (preference === 'system') {
      return `当前跟随系统（当前生效: ${isDark ? '暗黑' : '浅色'}）`;
    }
    return preference === 'dark' ? '当前暗黑模式' : '当前浅色模式';
  };

  return (
    <Layout style={{ height: '100vh', overflow: 'hidden' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme={isDark ? 'dark' : 'light'}
        style={{
          height: '100vh',
          position: 'sticky',
          top: 0,
          left: 0,
          zIndex: 100,
          borderRight: `1px solid ${colorBorderSecondary}`,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            borderBottom: `1px solid ${colorBorderSecondary}`,
            flexShrink: 0,
          }}
        >
          <Title
            level={4}
            style={{ margin: 0, color: '#1677ff', whiteSpace: 'nowrap', overflow: 'hidden' }}
          >
            {collapsed ? 'RA' : 'React Admin'}
          </Title>
        </div>
        <div style={{ flex: 1, overflowY: 'auto' }}>
          <Menu
            mode="inline"
            theme={isDark ? 'dark' : 'light'}
            selectedKeys={[location.pathname]}
            defaultOpenKeys={['user-management']}
            items={menuItems}
            onClick={handleMenuClick}
            style={{ borderRight: 0 }}
          />
        </div>
      </Sider>
      <Layout
        style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
      >
        <Header
          style={{
            height: 64,
            flexShrink: 0,
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${colorBorderSecondary}`,
            zIndex: 10,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapse}
            style={{ fontSize: 16, width: 48, height: 48 }}
          />

          <Space size="middle">
            <Dropdown menu={{ items: themeMenuItems }} placement="bottomRight" trigger={['click']}>
              <Tooltip title={getThemeTooltip()}>
                <Button
                  type="text"
                  shape="circle"
                  icon={getThemeButtonIcon()}
                  style={{ width: 40, height: 40 }}
                />
              </Tooltip>
            </Dropdown>

            <Dropdown
              menu={{ items: userMenuItems, onClick: handleUserMenuClick }}
              placement="bottomRight"
            >
              <Space style={{ cursor: 'pointer' }}>
                <Avatar style={{ backgroundColor: '#1677ff' }} icon={<UserOutlined />} />
                <span>{userInfo?.username || '管理员'}</span>
              </Space>
            </Dropdown>
          </Space>
        </Header>
        <Content
          style={{
            flex: 1,
            overflowY: 'auto',
            padding: '24px',
          }}
        >
          <div style={{ marginBottom: 16 }}>
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <div
            style={{
              padding: 24,
              minHeight: 'calc(100% - 40px)',
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};

export default BasicLayout;

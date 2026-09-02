import {
  CommentOutlined,
  DashboardOutlined,
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
];

export const BasicLayout: React.FC = () => {
  const { collapsed, toggleCollapse, logout, userInfo } = useUserStore();
  const { mode, toggleTheme } = useThemeStore();
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
      default:
        return ['仪表盘'];
    }
  };

  const breadcrumbItems = [{ title: '首页' }, ...getBreadcrumbTitle().map((title) => ({ title }))];

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme={mode === 'dark' ? 'dark' : 'light'}
        style={{ borderRight: `1px solid ${colorBorderSecondary}` }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '0 16px',
            borderBottom: `1px solid ${colorBorderSecondary}`,
          }}
        >
          <Title
            level={4}
            style={{ margin: 0, color: '#1677ff', whiteSpace: 'nowrap', overflow: 'hidden' }}
          >
            {collapsed ? 'RA' : 'React Admin'}
          </Title>
        </div>
        <Menu
          mode="inline"
          theme={mode === 'dark' ? 'dark' : 'light'}
          selectedKeys={[location.pathname]}
          defaultOpenKeys={['user-management']}
          items={menuItems}
          onClick={handleMenuClick}
          style={{ borderRight: 0 }}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: '0 24px',
            background: colorBgContainer,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: `1px solid ${colorBorderSecondary}`,
          }}
        >
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={toggleCollapse}
            style={{ fontSize: 16, width: 48, height: 48 }}
          />

          <Space size="middle">
            <Tooltip title={mode === 'dark' ? '切换为亮色模式' : '切换为暗黑模式'}>
              <Button
                type="text"
                shape="circle"
                icon={
                  mode === 'dark' ? (
                    <SunOutlined style={{ color: '#faad14', fontSize: 18 }} />
                  ) : (
                    <MoonOutlined style={{ fontSize: 18 }} />
                  )
                }
                onClick={toggleTheme}
                style={{ width: 40, height: 40 }}
              />
            </Tooltip>

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
        <Content style={{ margin: '24px 24px', minHeight: 280 }}>
          <div style={{ marginBottom: 16 }}>
            <Breadcrumb items={breadcrumbItems} />
          </div>
          <div
            style={{
              padding: 24,
              minHeight: 'calc(100vh - 180px)',
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

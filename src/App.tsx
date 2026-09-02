import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type React from 'react';
import { RouterProvider } from 'react-router-dom';
import router from '@/router';
import { useThemeStore } from '@/store/theme';

export const App: React.FC = () => {
  const isDark = useThemeStore((state) => state.isDark);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
        token: {
          colorPrimary: '#1677ff',
          borderRadius: 6,
        },
      }}
    >
      <RouterProvider router={router} />
    </ConfigProvider>
  );
};

export default App;

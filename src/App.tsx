import { ConfigProvider, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import type React from 'react';
import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import router from '@/router';
import { useThemeStore } from '@/store/theme';

export const App: React.FC = () => {
  const mode = useThemeStore((state) => state.mode);

  useEffect(() => {
    if (mode === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [mode]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: mode === 'dark' ? theme.darkAlgorithm : theme.defaultAlgorithm,
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

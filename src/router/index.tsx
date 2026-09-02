import type React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import BasicLayout from '@/layouts/BasicLayout';
import CommentsPage from '@/pages/Comments';
import DashboardPage from '@/pages/Dashboard';
import LoginPage from '@/pages/Login';
import NotFoundPage from '@/pages/NotFound';
import PostsPage from '@/pages/Posts';
import UsersPage from '@/pages/Users';
import VerificationPage from '@/pages/Verification';
import { useUserStore } from '@/store/user';

// 路由鉴权守卫
const AuthGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const token = useUserStore((state) => state.token);
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <BasicLayout />
      </AuthGuard>
    ),
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard" replace />,
      },
      {
        path: 'dashboard',
        element: <DashboardPage />,
      },
      {
        path: 'users',
        element: <UsersPage />,
      },
      {
        path: 'posts',
        element: <PostsPage />,
      },
      {
        path: 'comments',
        element: <CommentsPage />,
      },
      {
        path: 'verifications',
        element: <VerificationPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;

import type React from 'react';
import { createHashRouter, Navigate } from 'react-router-dom';
import BasicLayout from '@/layouts/BasicLayout';
import AppealsPage from '@/pages/Appeals';
import CommentsPage from '@/pages/Comments';
import DashboardPage from '@/pages/Dashboard';
import LoginPage from '@/pages/Login';
import NotFoundPage from '@/pages/NotFound';
import PostsPage from '@/pages/Posts';
import ReportsPage from '@/pages/Reports';
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

export const router = createHashRouter([
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
      {
        path: 'reports',
        element: <ReportsPage />,
      },
      {
        path: 'appeals',
        element: <AppealsPage />,
      },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);

export default router;

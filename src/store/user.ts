import { create } from 'zustand';
import { logoutApi } from '@/api/auth';
import type { UserInfo } from '@/types';

interface UserState {
  token: string | null;
  accessToken: string | null;
  refreshToken: string | null;
  userInfo: UserInfo | null;
  collapsed: boolean;
  setAuthTokens: (accessToken: string | null, refreshToken?: string | null) => void;
  setToken: (token: string | null) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
  fetchUserInfo: () => Promise<void>;
  toggleCollapse: () => void;
  logout: () => Promise<void>;
}

const getStoredUserInfo = (): UserInfo | null => {
  try {
    const raw = localStorage.getItem('userInfo');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useUserStore = create<UserState>((set, get) => ({
  token: localStorage.getItem('accessToken') || localStorage.getItem('token'),
  accessToken: localStorage.getItem('accessToken') || localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  userInfo: getStoredUserInfo(),
  collapsed: false,

  setAuthTokens: (accessToken, refreshToken) => {
    if (accessToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('token', accessToken);
    } else {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('token');
    }

    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    } else if (refreshToken === null) {
      localStorage.removeItem('refreshToken');
    }

    set({
      token: accessToken,
      accessToken,
      refreshToken: refreshToken ?? get().refreshToken,
    });
  },

  setToken: (token) => {
    get().setAuthTokens(token, null);
  },

  setUserInfo: (userInfo) => {
    if (userInfo) {
      localStorage.setItem('userInfo', JSON.stringify(userInfo));
    } else {
      localStorage.removeItem('userInfo');
    }
    set({ userInfo });
  },

  fetchUserInfo: async () => {
    // 后端已移除 get-permission-info 接口，此处保持签名兼容不再发起网络请求
  },

  toggleCollapse: () => set((state) => ({ collapsed: !state.collapsed })),

  logout: async () => {
    try {
      await logoutApi();
    } catch {
      // ignore
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('token');
      localStorage.removeItem('userInfo');
      set({
        token: null,
        accessToken: null,
        refreshToken: null,
        userInfo: null,
      });
    }
  },
}));

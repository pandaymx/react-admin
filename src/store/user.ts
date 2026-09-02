import { create } from 'zustand';
import { getPermissionInfoApi, logoutApi } from '@/api/auth';
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

export const useUserStore = create<UserState>((set, get) => ({
  token: localStorage.getItem('accessToken') || localStorage.getItem('token'),
  accessToken: localStorage.getItem('accessToken') || localStorage.getItem('token'),
  refreshToken: localStorage.getItem('refreshToken'),
  userInfo: null,
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

  setUserInfo: (userInfo) => set({ userInfo }),

  fetchUserInfo: async () => {
    try {
      const res = await getPermissionInfoApi();
      if ((res.code === 200 || res.code === 0) && res.data) {
        const u = res.data.user;
        const info: UserInfo = {
          id: String(u.id),
          username: u.nickname || '管理员',
          nickname: u.nickname,
          avatar: u.avatar,
          roles: res.data.roles || ['admin'],
          permissions: res.data.permissions || [],
        };
        set({ userInfo: info });
      }
    } catch {
      // ignore
    }
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
      set({
        token: null,
        accessToken: null,
        refreshToken: null,
        userInfo: null,
      });
    }
  },
}));

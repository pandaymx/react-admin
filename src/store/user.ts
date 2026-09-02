import { create } from 'zustand';
import type { UserInfo } from '@/types';

interface UserState {
  token: string | null;
  userInfo: UserInfo | null;
  collapsed: boolean;
  setToken: (token: string | null) => void;
  setUserInfo: (userInfo: UserInfo | null) => void;
  toggleCollapse: () => void;
  logout: () => void;
}

export const useUserStore = create<UserState>((set) => ({
  token: localStorage.getItem('token'),
  userInfo: null,
  collapsed: false,
  setToken: (token) => {
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
    set({ token });
  },
  setUserInfo: (userInfo) => set({ userInfo }),
  toggleCollapse: () => set((state) => ({ collapsed: !state.collapsed })),
  logout: () => {
    localStorage.removeItem('token');
    set({ token: null, userInfo: null });
  },
}));

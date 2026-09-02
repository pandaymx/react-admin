import { create } from 'zustand';

export type ThemePreference = 'light' | 'dark' | 'system';

interface ThemeState {
  preference: ThemePreference; // 用户选择的模式：明亮、暗黑或跟随系统
  isDark: boolean; // 实际当前渲染是否为暗色
  setPreference: (preference: ThemePreference) => void;
  toggleTheme: () => void;
}

const getSystemIsDark = (): boolean => {
  if (typeof window === 'undefined') return false;
  return Boolean(window.matchMedia?.('(prefers-color-scheme: dark)').matches);
};

const getInitialPreference = (): ThemePreference => {
  if (typeof window === 'undefined') return 'system';
  const saved = localStorage.getItem('theme_preference') as ThemePreference | null;
  if (saved === 'dark' || saved === 'light' || saved === 'system') {
    return saved;
  }
  return 'system';
};

const updateDocumentTheme = (isDark: boolean) => {
  if (typeof document === 'undefined') return;
  if (isDark) {
    document.documentElement.classList.add('dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  } else {
    document.documentElement.classList.remove('dark');
    document.documentElement.setAttribute('data-theme', 'light');
  }
};

const initialPref = getInitialPreference();
const initialIsDark = initialPref === 'system' ? getSystemIsDark() : initialPref === 'dark';
updateDocumentTheme(initialIsDark);

export const useThemeStore = create<ThemeState>((set, get) => {
  // 监听系统主题偏好变化
  if (typeof window !== 'undefined' && window.matchMedia) {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      const state = get();
      if (state.preference === 'system') {
        const sysDark = e.matches;
        updateDocumentTheme(sysDark);
        set({ isDark: sysDark });
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleSystemThemeChange);
    } else {
      mediaQuery.addListener(handleSystemThemeChange);
    }
  }

  return {
    preference: initialPref,
    isDark: initialIsDark,
    setPreference: (preference) => {
      localStorage.setItem('theme_preference', preference);
      const isDark = preference === 'system' ? getSystemIsDark() : preference === 'dark';
      updateDocumentTheme(isDark);
      set({ preference, isDark });
    },
    toggleTheme: () => {
      const current = get().preference;
      // 循环切换：跟随系统 -> 浅色 -> 暗色 -> 跟随系统
      let nextPref: ThemePreference = 'light';
      if (current === 'system') {
        nextPref = 'light';
      } else if (current === 'light') {
        nextPref = 'dark';
      } else {
        nextPref = 'system';
      }
      get().setPreference(nextPref);
    },
  };
});

export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message?: string;
  msg?: string;
}

export interface UserInfo {
  id: string;
  username: string;
  nickname?: string;
  avatar?: string;
  roles: string[];
  permissions?: string[];
}

export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  path?: string;
}

export * from './appeal';
export * from './auth';
export * from './comment';
export * from './dashboard';
export * from './post';
export * from './report';
export * from './user';
export * from './verification';

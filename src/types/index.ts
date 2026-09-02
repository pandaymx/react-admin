export interface ApiResponse<T = any> {
  code: number;
  data: T;
  message: string;
}

export interface UserInfo {
  id: string;
  username: string;
  avatar?: string;
  roles: string[];
}

export interface MenuItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  children?: MenuItem[];
  path?: string;
}

export * from './appeal';
export * from './comment';
export * from './post';
export * from './report';
export * from './user';
export * from './verification';

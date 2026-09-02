/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 网关主机域名或地址 (如 https://qxj.jiancan.fun 或 http://127.0.0.1:48080) */
  readonly VITE_API_HOST?: string;
  /** 接口前缀路径 (默认 /admin-api) */
  readonly VITE_API_BASE_URL?: string;
  /** 预设测试 Token (可选) */
  readonly VITE_API_TOKEN?: string;
  readonly [key: string]: any;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

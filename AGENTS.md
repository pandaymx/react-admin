# Agent Guidelines - React Admin

本文件为 AI Agent 在本工作区开展代码编写、功能演进与项目维护时的指导规范。

## 1. 核心协作原则

- **文档同步更新**：每次新增功能、调整交互或修改架构后，必须同步更新 [README.md](./README.md)，必要时更新本文件。
- **语言与规范**：所有文档、交互提示、代码注释、Git 提交信息统一使用**中文**（技术术语保留英文原文）。
- **提交前必须验证**：每次改动提交前必须通过 `bun run lint:fix && bun run build`，严禁将编译报错或 lint 错误推入远程。

---

## 2. 环境与包管理规范

- **包管理器**：统一使用 `bun`，禁止使用 npm / yarn / pnpm 生成多余的 lock 文件。
- **安装依赖**：
  - 生产依赖：`bun add <package>`
  - 开发依赖：`bun add -d <package>`
- **代码规范工具**：统一采用 **Biome** 负责 Linting 与 Formatting（禁止引入 Prettier / ESLint）。
  - 运行检查：`bun run lint`
  - 自动修复：`bun run lint:fix`
  - 格式化：`bun run format`

---

## 3. 代码与架构规范

- **TypeScript**：保持全量强类型约束，禁止滥用 `any`。
- **路径别名**：必须使用 `@/` 指向 `src/` 目录。
- **组件结构**：遵循函数组件 + React Hooks 范式。
- **UI 库**：基于 Ant Design (antd) 6.x / React 19，统一在 `src/App.tsx` 的 `ConfigProvider` 配置主题与语言。
- **状态管理**：统一使用 `zustand`（位于 `src/store/`）。
- **网络请求**：统一使用封装后的 Axios 实例（位于 `src/api/request.ts`）。
- **页面与路由**：
  - 页面统一存放于 `src/pages/<PageName>/index.tsx`
  - 布局统一存放于 `src/layouts/`
  - 路由配置在 `src/router/index.tsx`（采用 HashRouter 适配 GitHub Pages 静态托管）

---

## 4. Git 工作流规范

### 4.1 分支策略

| 分支 | 用途 | 说明 |
|------|------|------|
| `main` | 主干分支 | 始终保持可构建、可部署状态；所有功能合并到此分支 |
| `production` | 生产发布分支 | 仅由 `main` merge 过来，代表当前线上版本 |
| `feat/<name>` | 功能开发分支 | 从 `main` 切出，开发完成后 merge 回 `main` |
| `fix/<name>` | 缺陷修复分支 | 从 `main` 切出，修复完成后 merge 回 `main` |
| `chore/<name>` | 工程维护分支 | 依赖升级、构建配置、工具链调整等 |

> **禁止**直接向 `main` / `production` 强推（force push）。

### 4.2 Commit Message 规范

本项目配置了 **Husky + Commitlint + Lint-staged** 自动拦截不合规提交：

- `pre-commit`：自动运行 `lint-staged`，对暂存区文件执行 Biome 检查与格式化。
- `commit-msg`：自动运行 `commitlint`，校验 Commit Message 格式。

#### 格式模板

```
<type>(<scope>): <subject>

[可选 body：说明改动原因、设计决策]

[可选 footer：关联 Issue / Breaking Change]
```

#### 允许的 type 列表

| type | 适用场景 |
|------|----------|
| `feat` | 新功能、新页面、新接口对接 |
| `fix` | 缺陷修复、行为纠正 |
| `docs` | 文档变更（README、AGENTS.md 等） |
| `style` | 仅样式调整，不影响逻辑（CSS / antd token） |
| `refactor` | 代码重构，功能不变 |
| `perf` | 性能优化 |
| `test` | 测试相关 |
| `build` | 构建系统、依赖变更 |
| `ci` | CI/CD 配置变更 |
| `chore` | 工具链、配置文件等杂项维护 |
| `revert` | 回滚某次提交 |

#### scope 推荐值

`users` / `reports` / `appeals` / `comments` / `verification` / `auth` / `router` / `store` / `api` / `layout` / `build`

#### 合规示例

```
feat(users): 实现账号封禁与违规受限分开展示
fix(comment): 修复点击展示后被后端软删除状态覆盖的问题
refactor(api): 抽取 getUserSortWeight 排序权重算法
docs: 更新 AGENTS.md Git 工作流规范
chore(build): 升级 vite 至 8.x 并调整构建选项
```

#### 不合规示例（会被 commitlint 拦截）

```
# ❌ 缺少 type
用户管理优化

# ❌ type 不在允许列表中
update: 更新用户列表

# ❌ subject 为空
feat:
```

### 4.3 提交前检查清单

在执行 `git commit` 之前，Agent 应确认以下所有条件均满足：

1. `bun run lint:fix` 执行后无报错
2. `bun run build` 编译成功（exit code 0）
3. Commit Message 符合 4.2 规范
4. 新增功能已在 README.md 中有对应说明（如适用）

### 4.4 merge 策略

- 合并功能分支到 `main` 时，推荐使用 **Squash merge** 或 **Merge commit**，保持历史可读。
- 禁止对已推送的公共提交执行 `git rebase -i` 改写历史。
- 合并 `main` 到 `production` 时使用普通 merge，不要 squash（保留完整历史）。

### 4.5 远程仓库

- **Remote**：`origin` → `git@github.com:pandaymx/react-admin.git`
- 推送时指定分支：`git push origin <branch>`，避免意外推送其他分支。
- 不要推送 `dist/`、`.env.local` 等构建产物或本地配置（已在 `.gitignore` 中声明）。

---

## 5. 禁止行为汇总

| 行为 | 原因 |
|------|------|
| `git push --force` 到 `main` / `production` | 破坏团队共享历史 |
| 提交包含 TypeScript 编译错误的代码 | 阻断 CI 构建 |
| 跳过 `bun run lint:fix` 直接提交 | 引入代码风格不一致 |
| 在 `main` 上直接开发大型功能 | 污染主干，影响他人 |
| 混用 npm / yarn 安装依赖 | 产生冲突的 lock 文件 |
| 引入 Prettier / ESLint | 与 Biome 配置冲突 |

---

## 6. 前后端协调规范

本节规范前端与后端 API 对接时的命名约定、类型定义、请求封装、错误处理、环境配置等，以本项目实际代码为准。

### 6.1 接口 URL 规范

- **统一前缀**：所有后端接口路径以 `/admin-api` 开头，由 `src/api/request.ts` 的 `API_BASE_URL` 自动拼接，**调用方无需再写完整 Host**。
- **本地代理**：开发时 `VITE_API_HOST` 留空，Vite 代理将 `/admin-api/**` 转发至 `VITE_PROXY_TARGET`，彻底免除 CORS 跨域问题。
- **URL 路径命名**：与后端 Controller 路径保持一致，使用小写 kebab-case，不在前端自行缩写。

```ts
// ✅ 正确：与后端路径 /admin-api/user/page 完全对齐
request({ method: 'GET', url: '/user/page', params })

// ❌ 错误：自行拼接 Host，破坏代理规则
axios.get('http://192.168.1.2:48080/admin-api/user/page', ...)
```

### 6.2 类型定义规范

#### 文件组织

| 目录 | 用途 |
|------|------|
| `src/types/<module>.ts` | 后端 VO / ReqVO 映射类型 + 前端视图层类型 |
| `src/types/index.ts` | 统一导出，页面与 API 层均从 `@/types` 导入 |
| `src/api/<module>.ts` | 若后端响应模型较复杂，可在此处额外定义 `AdminXxxRespVO` 接口 |

#### 命名约定

| 场景 | 命名规则 | 示例 |
|------|----------|------|
| 后端请求参数 | `XxxPageReqVO` / `XxxQueryParams` | `AdminUserPageReqVO` |
| 后端响应模型 | `AdminXxxRespVO` | `AdminCertManualReviewRespVO` |
| 前端视图模型 | `XxxItem` | `UserItem`、`CommentItem` |
| 分页结果 | `PageResult<T>` | `PageResult<UserItem>` |
| 统计汇总 | `XxxSummaryStats` / `XxxStatisticsRespVO` | `UserStatisticsRespVO` |

#### 分页结果封装

后端分页接口统一返回 `{ list: T[], total: number }`，前端通过以下泛型包装：

```ts
// src/types/user.ts
export interface PageResult<T> {
  list: T[];
  total: number;
}

// 调用示例
const res = await request<PageResult<AdminUserRespVO>>({
  method: 'GET',
  url: '/user/page',
  params: { pageNo: 1, pageSize: 20 },
});
```

#### 字段兼容策略

后端字段可能同时存在新旧两个名称（如 `avatar` / `avatarUrl`、`phone` / `phoneNumber`），前端在 VO 中两者均声明为可选，映射时取非空一方：

```ts
// ✅ 优先取后端新字段，兼容旧字段
const avatar = raw.avatarUrl || raw.avatar || '';
```

### 6.3 HTTP 请求封装规范

所有请求必须经由 `src/api/request.ts` 导出的 `request` 函数，禁止直接使用原生 `axios`：

```ts
import { request } from '@/api/request';

// GET 分页查询
export const getUserPage = (params: AdminUserPageReqVO) =>
  request<PageResult<AdminUserRespVO>>({ method: 'GET', url: '/user/page', params });

// POST 操作
export const banUser = (userId: number, data: BanReqVO) =>
  request({ method: 'POST', url: `/user/${userId}/ban`, data });

// PUT 更新
export const updateCertStatus = (id: string, data: CertReviewReqVO) =>
  request({ method: 'PUT', url: `/cert/review/${id}`, data });
```

#### 分页参数命名

| 前端字段 | 后端字段 | 说明 |
|----------|----------|------|
| `pageNo` | `pageNo` | 页码，从 1 开始 |
| `pageSize` | `pageSize` | 每页条数，默认 20 |

> 禁止使用 `page` / `limit` / `offset` 等非对称字段名。

### 6.4 响应拦截与错误处理

`request.ts` 已内置完整的响应拦截策略，对接时遵循以下规则：

#### 业务码约定

| code | 含义 | 拦截器行为 |
|------|------|----------|
| `200` / `0` | 成功 | 直接透传 `data` |
| `401` | 登录失效 | 自动静默续期（refreshToken），失败后跳转登录页 |
| 其他 | 业务错误 | 自动弹出 `message.error(res.msg)` |
| HTTP 403 | 无权限 | 弹出「没有权限访问该资源」 |
| HTTP 5xx | 服务器错误 | 弹出「服务器内部错误」 |

#### 静默错误（跳过全局弹窗）

当接口失败时希望自己处理错误（不弹全局 toast），在请求头加 `x-skip-error-message: true`：

```ts
// 适用场景：批量探测、并发静默查询等
request({
  method: 'GET',
  url: '/cert/review/page',
  params,
  headers: { 'x-skip-error-message': 'true' },
});
```

#### 并发容灾模式

多个并发请求中某一个失败时不应阻断其他请求，使用 `Promise.allSettled` + 过滤：

```ts
const [usersRes, restrictionsRes] = await Promise.allSettled([
  getUserPage(params),
  getContentRestrictions(ids),
]);
const users = usersRes.status === 'fulfilled' ? usersRes.value.data?.list ?? [] : [];
```

### 6.5 环境变量配置

| 变量 | 说明 | 本地开发建议值 |
|------|------|---------------|
| `VITE_API_HOST` | 后端 Host（留空启用 Vite 代理） | 留空 |
| `VITE_API_BASE_URL` | 接口基础路径 | `/admin-api` |
| `VITE_PROXY_TARGET` | Vite 代理转发目标 | `https://qxj.jiancan.fun` 或本地 `http://127.0.0.1:48080` |

- 本地开发：复制 `.env.example` → `.env.development`，`VITE_API_HOST` 留空，Vite 自动代理。
- 生产构建：在 `.env.production` 中配置真实公网地址，**不要提交 `.env.production` 到 git**。

### 6.6 Mock 数据策略

项目中各 API 模块（`user.ts`、`verification.ts` 等）内置 `mockXxx` 数据集，用于：

- 后端接口未就绪时的前端开发联调
- 网络不可达时的兜底容灾展示

**使用原则**：

1. Mock 数据仅在**接口真实调用失败（catch 分支）**时作为兜底返回，正常情况下优先对接真实接口。
2. Mock 数据的字段结构必须与后端 `AdminXxxRespVO` 完全对应，不得使用简化字段。
3. 新增后端接口对接时，若需要 Mock，应在同模块 API 文件内声明 `const mockXxxList: XxxItem[] = [...]`，保持命名规律。
4. 联调完成、接口稳定后，应及时移除 Mock 兜底逻辑，避免线上静默返回假数据。

### 6.7 前后端字段映射规范

后端 VO 字段名可能与前端视图字段名不一致，映射工作在 `src/api/<module>.ts` 内完成，**页面组件不直接处理后端原始字段**：

```ts
// ✅ 映射在 API 层（src/api/user.ts）
function mapBackendUser(raw: AdminUserRespVO): UserItem {
  return {
    id: String(raw.id),
    userId: raw.userNo ?? raw.id,
    nickname: raw.nickname || raw.username || '—',
    avatar: raw.avatarUrl || raw.avatar || '',
    status: mapRawStatus(raw.status),       // 数字 → 枚举字符串
    rawStatus: raw.status as 1 | 2 | 3,
    // ...
  };
}

// ❌ 禁止在页面组件内直接访问 raw.status === 2
```

#### 状态枚举对照

| 后端 `status` | 前端 `UserStatus` | 含义 |
|--------------|-------------------|------|
| `1` | `normal` | 正常 |
| `2` | `banned` | 封禁 |
| `3` | `cancelled` | 注销 |

#### 时间字段格式化

所有时间字段由 `src/utils/time.ts` 中的 `formatDateTime` 统一处理，**禁止在页面内手写 `new Date()` 格式化逻辑**：

```ts
import { formatDateTime } from '@/utils/time';
const displayTime = formatDateTime(raw.createdAt); // → "2026-09-05 14:30:00"
```

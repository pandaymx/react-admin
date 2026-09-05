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

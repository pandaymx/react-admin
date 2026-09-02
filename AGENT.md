# Agent Guidelines - React Admin

本文件为 AI Agent 在本工作区开展代码编写与项目维护时的指导规范。

## 1. 环境与包管理规范
- **包管理器**: 统一使用 `bun`，禁止使用 npm/yarn/pnpm 生成多余的 lock 文件。
- **安装依赖**:
  - 生产依赖: `bun add <package>`
  - 开发依赖: `bun add -d <package>`
- **代码规范工具**: 本项目统一采用 **Biome** 负责 Linting 与 Formatting（禁止引入 Prettier/ESLint 产生冲突）。

## 2. 代码与架构规范
- **TypeScript**: 保持全量强类型约束，禁止滥用 `any`。
- **路径别名**: 必须使用 `@/` 指向 `src/` 目录。
- **组件结构**: 遵循函数组件 + React Hooks 范式。
- **UI 库**: 基于 Ant Design (antd) 6.x / React 19，统一在 `src/App.tsx` 的 `ConfigProvider` 配置主题与语言。
- **状态管理**: 统一使用 `zustand`（位于 `src/store/`）。
- **网络请求**: 统一使用封装后的 Axios 实例（位于 `src/api/request.ts`）。
- **页面与路由**:
  - 页面统一存放于 `src/pages/<PageName>/index.tsx`。
  - 布局统一存放于 `src/layouts/`。
  - 路由配置在 `src/router/index.tsx`。

## 3. Git 提交规范
本项目配置了 Husky + Commitlint + Lint-staged：
- 每次提交前通过 Biome 自动检查和格式化暂存区代码。
- Commit Message 必须遵循 Conventional Commits 规范，支持中文描述。
- 格式示例:
  - `feat: 添加仪表盘统计图表`
  - `fix: 修复侧边栏折叠时菜单高亮丢失问题`
  - `chore: 更新项目依赖与构建脚本`

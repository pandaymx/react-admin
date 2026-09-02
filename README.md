# React Admin 后台管理系统

基于 **Bun + React 19 + TypeScript + Vite** 构建的现代化后台管理系统初始化脚手架。

## 🛠️ 技术栈

- **包管理器 / 运行时**: [Bun](https://bun.sh/)
- **核心框架**: React 19 + TypeScript
- **UI 组件库**: [Ant Design (antd)](https://ant.design/) + [@ant-design/icons](https://ant.design/components/icon-cn)
- **路由管理**: [React Router](https://reactrouter.com/) (v7)
- **状态管理**: [Zustand](https://zustand-demo.pmnd.rs/)
- **网络请求**: [Axios](https://axios-http.com/)
- **构建工具**: [Vite](https://vite.dev/)
- **代码规范与格式化**: [Biome](https://biomejs.dev/)
- **Git 提交规范与钩子**: Husky + Commitlint + Lint-staged

## 📁 项目目录结构

```text
react-admin/
├── .husky/              # Git 钩子 (pre-commit, commit-msg)
├── .lintstagedrc.json   # Lint-staged 配置
├── AGENT.md             # AI Agent 协作规范与工程指南
├── CLAUDE.md            # Claude Code 配置
├── biome.json           # Biome 代码检查与格式化配置
├── commitlint.config.cjs# Commitlint 提交信息规范配置
├── index.html           # HTML 入口
├── package.json         # 项目依赖与脚本
├── src/
│   ├── api/             # Axios 实例封装与请求拦截
│   ├── layouts/         # 基础后台布局 (Header, Sider, Content, Breadcrumb)
│   ├── pages/           # 页面组件 (Dashboard, Users, Login, NotFound)
│   ├── router/          # 路由表配置与鉴权路由守卫
│   ├── store/           # Zustand 全局状态管理 (用户登录态、侧边栏)
│   ├── types/           # TypeScript 类型定义
│   ├── App.tsx          # 根组件 (Antd ConfigProvider 国际化与主题)
│   ├── index.css        # 全局样式
│   └── main.tsx         # 应用挂载入口
├── tsconfig.app.json    # TypeScript 前端配置 (含 @ 别名映射)
└── vite.config.ts       # Vite 配置文件
```

## 📦 常用脚本指令

```bash
# 安装依赖
bun install

# 启动开发服务器 (默认端口 3000)
bun run dev

# 构建生产包 (TypeScript 检查 + Vite 打包)
bun run build

# 代码检查
bun run lint

# 代码自动修复与格式化
bun run lint:fix
bun run format
```

## 📝 Git 提交规范

项目配置了 Husky 与 Commitlint 钩子，遵循 Conventional Commits 规范，支持中文描述：

格式：`<type>: <描述>`

支持的 `type`:
- `feat`: 新增功能
- `fix`: 修复 bug
- `docs`: 文档变更
- `style`: 代码格式变化
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建系统或外部依赖变动
- `ci`: CI 配置变动
- `chore`: 构建过程或辅助工具变动
- `revert`: 回退提交

示例：
```bash
git commit -m "feat: 添加用户管理模块"
git commit -m "chore: 更新项目依赖"
```

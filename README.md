# React Admin 后台管理系统

基于 **Bun + React 19 + TypeScript + Vite** 构建的现代化后台管理系统初始化脚手架。

## 🛠️ 技术栈

- **包管理器 / 运行时**: [Bun](https://bun.sh/)
- **核心框架**: React 19 + TypeScript
- **构建工具**: [Vite](https://vite.dev/)
- **代码规范与格式化**: [Biome](https://biomejs.dev/)
- **Git 提交规范与钩子**: Husky + Commitlint + Lint-staged

## 📦 常用脚本指令

```bash
# 安装依赖
bun install

# 启动开发服务器
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

项目配置了 Husky 与 Commitlint 钩子，要求遵循 Conventional Commits 规范，支持中文描述：

格式：`<type>: <描述>`

支持的 `type`:
- `feat`: 新增功能
- `fix`: 修复 bug
- `docs`: 文档变更
- `style`: 代码格式变化（不影响逻辑）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `build`: 构建系统或外部依赖变动
- `ci`: CI 配置或脚本变动
- `chore`: 构建过程或辅助工具变动
- `revert`: 回退提交

示例：
```bash
git commit -m "feat: 新增用户管理模块"
git commit -m "chore: 配置 Biome 与 Git Hooks"
```

# React Admin 企业级综合后台管理系统

<p align="center">
  <img src="https://img.shields.io/badge/React-19.0-61dafb?style=flat-square&logo=react" alt="React 19" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Ant_Design-6.3-1677ff?style=flat-square&logo=antdesign" alt="Ant Design" />
  <img src="https://img.shields.io/badge/Vite-8.2-646cff?style=flat-square&logo=vite" alt="Vite" />
  <img src="https://img.shields.io/badge/Bun-1.3-fbf0df?style=flat-square&logo=bun" alt="Bun" />
  <img src="https://img.shields.io/badge/Code_Style-Biome-60a5fa?style=flat-square&logo=biome" alt="Biome" />
  <img src="https://img.shields.io/badge/CI%2FCD-GitHub_Pages-22c55e?style=flat-square&logo=githubactions" alt="GitHub Pages" />
</p>

基于 **React 19 + TypeScript + Ant Design + Vite + Bun** 构建的高性能、现代化的企业级中后台运营与社区内容治理管理系统。

🔗 **在线体验 Demo**: [https://pandaymx.github.io/react-admin/](https://pandaymx.github.io/react-admin/)

---

## 🌟 系统核心特性与功能大盘

### 1. 🎨 全局主题引擎与自适应布局
- **三态主题切换**：支持 **浅色模式 (Light)**、**暗夜模式 (Dark)** 以及 **跟随系统自动 (System)**，全站组件无缝响应系统深浅色切换；
- **现代化后台布局**：左侧侧边栏（`Sider` 菜单树）和顶栏（`Header`）固定常驻视口（`100vh`），右侧主体内容独立平滑滚动；
- **高质感即输即查搜索栏**：垂直标签体系（`layout="vertical"`）搭配自适应宽松栅格；支持**输入即刻检索（300ms 智能防抖自动触发）**与下拉选择即时联动响应，免去繁琐的频繁点击。

### 2. 👤 用户基础档案与合规管控 (`/users`)
- **信息展示与合规安全**：
  - **UGC 平台安全合规规范**：用户账号由客户端注册生成，个人基本资料（昵称、头像、简介）由用户本人在客户端自主维护，管理后台**严格禁止直接新建或篡改用户个人资料**，专注档案核验、安全风控与治理；
  - 用户名与 UID 独立展示，支持一键便捷复制纯净账号 ID；
  - 手机号默认隐私安全脱敏掩码（如 `138****5678`），详情抽屉中支持小眼睛（👁️ / 🕶️）一键明密文切换；
  - CSV 报表导出全量支持脱敏导出与筛选导出。
- **全生命周期账号状态**：
  - 支持 **正常 (normal)**、**已封禁 (banned)**、**已禁言 (muted)**、**注销中 (cancelling)** 及 **已注销 (cancelled)**；
  - 支持账号注销冷静期管理与【撤销注销申请（一键恢复正常）】。
- **全流程认证状态体系**：
  - 支持 **未认证 (unverified)**、**认证审核中 (pending)**、**个人实名认证 (personal)**、**企业蓝V (enterprise)**、**达人黄V (creator)**。
- **多维违规惩处与时间周期封禁系统 (`UserBanModal`)**：
  - **5 大阶梯惩处类型**：
    1. 🔒 **账号全量封禁**（禁止登录、禁言、禁发作品全链路拦截）
    2. 🚫 **社区评论禁言**（仅限制发表评论、弹幕与互动）
    3. ⚠️ **作品投稿禁发**（仅限制投稿发布新短视频与动态）
    4. 📢 **官方违规严重警告**（下发强警示站内信，记录违规 1 次）
    5. 📉 **社区信用扣分降权**（扣除社区信用分 80 分并压低推荐曝光）
  - **灵活的时间周期**：支持 `1天`、`3天`、`7天`、`15天`、`30天`、`180天`、`永久封禁` 与 `自定义到期时间`；
  - **动态解封倒计时**：表格与详情实时显示精确到秒的【封禁剩余时间】倒计时（如 `剩 6 天 23 小时`）；
  - **批量违规处置**：支持多选用户一键批量执行违规封禁与禁言处置。
- **在线状态与活动参与**：
  - 在线状态独立成列（当前在线 🟢、最近在线 🔵、长期离线 ⚪）；
  - 活动参与明细拆分为线上活动场次（挑战赛/打榜）与线下活动场次（创作者沙龙/峰会）。

### 3. 📊 大数据 AI 用户全景画像 (`UserPersonaDrawer`)
- 职责与基础档案清晰拆分，专注创作者商业价值与受众洞察：
  - **创作者成长等级与信用分**：呈现创作者成长等级（Lv.1 ~ Lv.10）与社区信用分评级（350 ~ 950 分 S+ 级）；
  - **AI 智能标签云**：多维标签分类（价值定位、行为特征、风控合规）；
  - **六维雷达能力模型**：内容质量、互动度、变现力、活跃频次、信用度、传播力综合大盘评分；
  - **粉丝受众人口属性分析**：男女受众构成比例、年龄层占比分布、粉丝核心地域 TOP 5 排名、黄金活跃峰值时段；
  - **商业变现与商单评估**：完播率预估、互动转化率、商业化价值指数及单条商单合作参考报价（如 `¥18,000 - ¥28,000`）。

### 4. 🛡️ 认证管理中心 (`/verifications`)
- **三维认证分类审核**：个人实名认证、企业蓝V机构认证、创作者达人认证；
- **资质材料核验**：身份证件正反面核查、企业营业执照/公函在线预览核验；
- **审核流转**：一键审核通过、违规驳回并填写原因留痕通知。

### 5. 🚨 违规举报与内容安全治理 (`/reports`)
- **全场景举报治理**：作品违规举报、评论违规举报、用户违规举报全分类；
- **证据核查画廊**：多图凭证缩略图与大图画廊预览；
- **处置闭环**：审核判定、违规下架/封禁联动、下发治理告知书与处理报表导出。

### 6. ⚖️ 违规申诉与复核治理中心 (`/appeals`)
- **多维申诉业务覆盖**：支持 **账号封禁申诉**、**评论禁言申诉**、**作品违规下架申诉**、**活动限制申诉** 及 **信用扣分申诉** 全业务场景；
- **全链路核查抽屉 (`AppealDetailDrawer`)**：
  - 申诉人基础档案与脱敏联系方式查看；
  - 原始违规处罚原因、原定封禁到期时间与涉事作品对照；
  - 申诉人陈述理由与多图举证材料画廊在线预览；
- **智能复核与自动解封联动**：
  - **申诉通过**：一键裁定通过并自动触发系统联动（自动解除账号封禁/恢复评论/恢复作品/补回信用分），支持自定义官方通知模板；
  - **维持原判**：驳回申诉并填写官方复核依据；
  - **批量复核处置**：支持多选待办工单批量通过撤销处罚或批量驳回；
- **实时监控大盘与报表**：
  - 顶部指标大盘实时监控（工单总数、待人工复核、申诉成功、维持原判、平均复核时效）；
  - 支持即输即查智能防抖筛选与全量/选中 CSV 报表导出。

### 7. 📝 作品与评论精细化治理 (`/posts`, `/comments`)
- **作品管理**：短视频与图文动态管理、作品违规下架、置顶推荐、评论权限灵活管控（全员开放/仅粉丝可评/关闭评论）；
- **评论治理**：评论审核与敏感词拦截、违规言论一键清理。

---

## 🛠️ 技术栈与工具链

| 层次 | 技术选型 | 说明 |
| :--- | :--- | :--- |
| **运行时 / 包管理** | [Bun](https://bun.sh/) | 超高速 JavaScript/TypeScript 运行时与依赖管理 |
| **前端框架** | React 19 + TypeScript | 最新 React 19 架构与强类型系统 |
| **UI 组件库** | [Ant Design (antd 6.x)](https://ant.design/) | 现代化企业级 UI 设计语言与全套组件库 |
| **路由管理** | [React Router](https://reactrouter.com/) (v7) | HashRouter 架构，完美兼容静态托管 |
| **状态管理** | [Zustand](https://zustand-demo.pmnd.rs/) | 轻量、灵活、高效的全局响应式状态库 |
| **代码规范** | [Biome](https://biomejs.dev/) | 统一极速代码检查 (Linter) 与格式化 (Formatter) |
| **Git 钩子** | Husky + Commitlint + Lint-staged | 规范化 Commit 提交与提交前自动校验 |
| **持续集成部署** | GitHub Actions + GitHub Pages | 自动化代码检测、打包与静态页面部署 |

---

## 📁 项目目录结构

```text
react-admin/
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 自动构建部署至 GitHub Pages
├── .husky/                     # Git 提交钩子 (pre-commit, commit-msg)
├── .lintstagedrc.json          # Lint-staged 暂存区检查配置
├── AGENT.md                    # AI Agent 协作规范与工程指南
├── biome.json                  # Biome 代码规范与格式化规则
├── commitlint.config.cjs       # Commitlint 提交信息规范
├── index.html                  # HTML 入口模板
├── package.json                # 项目元数据与依赖定义
├── src/
│   ├── api/                    # API 接口层 (用户、认证、举报、帖子、评论)
│   ├── layouts/                # 基础后台布局 (BasicLayout: 固定侧边栏与Header)
│   ├── pages/                  # 业务页面
│   │   ├── Appeals/            # 违规申诉与复核治理模块
│   │   │   └── components/
│   │   │       └── AppealDetailDrawer.tsx # 申诉工单核查与裁定抽屉
│   │   ├── Comments/           # 评论管理模块
│   │   ├── Dashboard/          # 仪表盘大盘与数据统计
│   │   ├── Login/              # 用户登录页
│   │   ├── NotFound/           # 404 缺省页
│   │   ├── Posts/              # 作品帖子管理模块
│   │   ├── Reports/            # 违规举报与安全治理模块
│   │   ├── Users/              # 用户基础档案、多维处罚与 AI 画像
│   │   │   └── components/
│   │   │       ├── UserBanModal.tsx       # 违规处罚与时间期限设置弹窗
│   │   │       └── UserPersonaDrawer.tsx   # 大数据 AI 全景画像抽屉
│   │   └── Verification/       # 个人/企业/达人认证管理模块
│   ├── router/                 # 路由注册与权限守卫
│   ├── store/                  # Zustand 全局状态 (主题模式、用户登录态)
│   ├── types/                  # 全局 TypeScript 接口定义
│   ├── utils/                  # 实用工具 (时间计算、CSV导出、数据脱敏)
│   ├── App.tsx                 # 根组件 (Antd 主题注入与国际化)
│   ├── index.css               # 全局样式
│   └── main.tsx                # 应用挂载入口
├── tsconfig.app.json           # 前端 TypeScript 编译配置
└── vite.config.ts              # Vite 构建配置 (含 @ 别名与 Base 路径)
```

---

## 📦 本地快速开发与构建

### 1. 安装依赖
```bash
bun install
```

### 2. 启动开发服务器
```bash
bun run dev
```
默认本地访问地址：`http://localhost:3000`

### 3. 代码检查与格式化
```bash
# 检查代码规范
bun run lint

# 自动修复格式与代码规范
bun run lint:fix
bun run format
```

### 4. 生产打包构建
```bash
bun run build
```
打包输出目录为 `dist/`，可通过 `bun run preview` 本地预览生产产物。

---

## 📝 协作与 Git 提交规范

本项目配置了严格的 Husky 与 Commitlint 钩子，遵循 Conventional Commits 规范（**提交信息统一使用中文**）：

格式：`<type>: <描述>`

常用 `type` 说明：
- `feat`: 新增功能特性（如：`feat: 实现违规按时间周期封禁与批量处罚功能`）
- `fix`: 修复问题或交互 Bug（如：`fix: 修复页面向下滚动时左侧菜单栏跟随滚动的问题`）
- `docs`: 文档变动（如：`docs: 更新 README.md 系统功能介绍与架构文档`）
- `style`: 代码格式或界面样式调整（如：`style: 重构优化用户搜索与多维筛选栏布局`）
- `refactor`: 代码重构（不影响功能的代码结构优化）
- `perf`: 性能优化
- `chore`: 构建配置或辅助工具依赖更新

> 📌 **注意**：每次新增功能、调整交互或修改架构后，请务必同步更新 [README.md](file:///home/panda/code/react-admin/README.md)！

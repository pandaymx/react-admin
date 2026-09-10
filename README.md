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

### 2. 🔐 管理员认证与令牌自动续期 (`/login`)
- **标准后台鉴权**（接口契约详见 [docs/login-api.md](file:///home/panda/code/react-admin/docs/login-api.md) 与 [docs/login-api-quickref.md](file:///home/panda/code/react-admin/docs/login-api-quickref.md)）：
  - **管理员账号密码登录**：`POST /admin-api/system/auth/login`（提交 `username` / `password`，获取 `accessToken`、`refreshToken`）；
  - **请求拦截器 Bearer 鉴权**：所有 `/admin-api` 请求统一携带 `Authorization: Bearer {accessToken}`；
  - **401 静默自动续期**：遇到 401 状态自动通过 `POST /admin-api/system/auth/refresh-token` 换取新令牌并重试请求；
  - **管理员权限与信息获取**：`GET /admin-api/system/auth/get-permission-info`；
  - **安全登出**：`POST /admin-api/system/auth/logout` 并清空本地存储。

### 3. ⚡ 运营与内容安全控制大盘 (`/dashboard`)
- **全域业务 5 大核心 KPI 指标卡**：
  - 全站注册用户与日增活跃（带日环比增长与创作者达人池监控，点击直达 `/users`）；
  - 作品发布与互动总量（短视频/图文发布与点赞走势，点击直达 `/posts`）；
  - 待处置违规举报（高危紧急待办徽标提示与今日办结量，点击直达 `/reports`）；
  - 待复核处罚申诉（待人工裁定工单与撤销率监控，点击直达 `/appeals`）；
  - 达人与企业认证审核（待审主体材料统计，点击直达 `/verifications`）。
- **待办流转与快速核查工作台**：集中聚合全站高危举报、处罚申诉、企业/达人认证待审工单，支持按业务分类筛选并一键直达处理。
- **全网风险类型与创作者生态画像**：色情低俗、营销欺诈、侮辱谩骂、版权侵权违规类型占比分析与 Lv.1 ~ Lv.7 创作者梯队结构分布。
- **近 7 日内容发布与安全拦截走势**：作品发布量、互动量与风控拦截量的每日态势对比。
- **全站实时安全风控处置流水**：全景记录管理员与 AI 探针的实时封禁、下架、解封、申诉通过动态流水。

### 4. 👤 用户管理中心 (`/users`, `/posts`, `/comments`, `UserPersonaDrawer`)
- **用户基础档案与合规管控 (`/users`)**：
  - 直调后台标准接口（`GET /admin-api/user/users/page`、`GET /admin-api/user/users/get`、`PUT /admin-api/user/users/update-status` 等）；
  - 用户业务标签体系与快捷配置，多色彩 Tag 与行内编辑；
  - 权威实名认证状态聚合算法（全部/审核中/未实名/个人认证/企业认证），脱敏身份证号一键复制；
  - 处罚历史全量追溯（生效中/已解除/已到期）与快捷解封；
- **作品与评论精细化治理 (`/posts`, `/comments`)**：
  - 短视频与图文动态管理、作品下架、置顶、评论权限灵活管控；
  - 作者 UID 统一对齐为业务短展示号（`userNo`）；
  - 内容安全机审、人工复审全量流水时间轴；
- **大数据 AI 用户全景画像 (`UserPersonaDrawer`)**：
  - 创作者成长等级（Lv.1 ~ Lv.10）、信用分（350 ~ 950）；
  - AI 标签云、六维雷达能力模型、受众人口属性分析与商单评估。

### 5. 🛡️ 安全管理中心（举报 / 申诉 / 认证 / 敏感词）
系统统一收拢社区风控与内容合规核心能力，在侧边栏构建多维一体的「安全管理」大类：
- **🚨 违规举报治理 (`/reports`)**：
  - 全场景举报治理：作品违规举报、评论违规举报、用户违规举报全分类；
  - 证据核查画廊：多图凭证缩略图与大图画廊预览；
  - 处置闭环：审核判定、违规下架/封禁联动、下发治理告知书与处理报表导出。
- **⚖️ 违规申诉与复核治理 (`/appeals`)**：
  - 多维申诉业务覆盖：支持 **账号封禁申诉**、**评论禁言申诉**、**作品违规下架申诉**、**活动限制申诉** 及 **信用扣分申诉** 全业务场景；
  - 全链路核查抽屉 (`AppealDetailDrawer`)：申诉人基础档案、脱敏联系方式、原始违规处罚原因、原定封禁到期时间与涉事作品对照、多图举证材料画廊在线预览；
  - 智能复核与自动解封联动：一键裁定通过并自动触发系统联动（自动解除账号封禁/恢复评论/恢复作品/补回信用分），支持维持原判与批量复核处置；
  - 实时监控大盘与报表：工单总数、待人工复核、申诉成功、维持原判、平均复核时效及 CSV 报表导出。
- **🪪 认证管理中心 (`/verifications`)**：
  - 三维认证分类审核：个人实名认证、企业蓝V机构认证、创作者达人认证；
  - 资质材料核验：身份证件正反面核查、企业营业执照/公函在线预览核验；
  - 审核流转：一键审核通过、违规驳回并填写原因留痕通知。
- **📝 敏感词与文本风控治理 (`/sensitive-words`)**：
  - 敏感词生命周期管控：支持新增、编辑、批量删除、分类打标（如政治、暴恐、色情、广告、引流、辱骂、违禁品等）与一键快捷开关启停；
  - 风控运营指标看板：直观监控词库总量、当前生效中词汇、停用中词汇及覆盖标签种类；
  - 即输即查防抖检索：300ms 智能防抖关键词搜索、标签分类筛选与状态过滤；
  - 在线文本风控检测测试台 (`SensitiveWordTesterDrawer`)：内置实用的在线文本校验测试台，支持输入待审核评论或作品文案，一键探测命中敏感词列表、展示原文敏感词彩色高亮标注并生成脱敏替换预览（支持一键复制脱敏文本）；
  - 报表导出：支持将敏感词治理清单一键导出为 CSV 报表。

### 6. 🏕️ 活动管理体系（活动管理 / 活动分类管理）
- **二级子菜单架构设计**：系统将活动板块升级为「活动管理」父级导航，包含两大职责分明的业务模块：
  - **🏕️ 活动管理 (`/activities`)**：
    - 活动监控大盘与状态管道流 (Pipeline Tabs)：汇总活动总数、报名中/已发布、进行中、待审核、累计成团人次及流水；
    - 5 步向导式发布/编辑工作台 (`ActivityWizardModal`)：向导防止漏填与误清空（核心归属、地点行程规划时间轴、费用装备清单、画廊领队分配）；
    - 活动全景详情抽屉 (`ActivityDetailDrawer`) 与 活动取消退款兜底 (`ActivityCancelModal`)；
  - **📂 活动分类管理 (`/activities/categories`)**：
    - **独立 Master-Detail 页面**：直连后端 `GET /activity2/config/category/list` 与 `GET /activity2/config/subcategory/list`；
    - **左侧主题大类工作台**：管控 7 大核心主题（自驾、亲子、户外、摄影、球类等），支持图标配置、权重排序与即时启停；
    - **右侧细分子类矩阵**：支持细分类别的新增、编辑、所属大类更换、页面流程模板选择（`category_1`~`category_5`）与报名实名制强制认证开关。

### 7. 🏷️ 标签体系与用户画像中心 (`/tags`)
- **Master-Detail 双栏分栏架构**：左侧管控分类类目（限选上限与覆盖数统计），右侧卡片网格与高密度表格双视图；
- **用户安全删除保护机制**：已绑定用户的标签智能拦截物理删除并引导停用；
- **场景化初始推荐工作台 (`TagInitialConfigDrawer`)**：内置移动端 App 真实流式气泡选标渲染预览器。

### 8. 🖥️ 系统运维多子模块监控体系 (`/ops`)
- **二级子菜单导航架构**：系统运维全面升级为二级导航模块化体系：
  - **🖥️ 全景大盘 (`/ops/overview`)**：集群综合健康评分 (0-100)、微服务与中间件状态拓扑、活动告警统计走势；
  - **🖧 服务器监控 (`/ops/server`)**：OS/内核/CPU 负载/物理内存与 Swap/磁盘空间与网卡流量；
  - **⚡ Redis 监控与配置中心 (`/ops/redis`)**：版本/端口/内存碎片率/命中率/QPS/键分布/核心参数热修改；
  - **🧩 微服务探针 (`/ops/services`)**：微服务列表、端口、实时延时、即时心跳探活与资产抽屉；
  - **☕ JVM 与 GC 监控 (`/ops/jvm`)**：堆分代大盘 (Eden/Old/Metaspace)、Young/Full GC 频次耗时、线程模型；
  - **🚨 告警中心与策略 (`/ops/alerts`)**：实时告警处置、告警规则目录弹窗与资源告警阈值配置；
  - **📋 日志管理与下载中心 (`/ops/logs`)**：全链路日志汇聚、多维过滤批量打包与极客暗黑终端在线查看器。

### 9. 🎛️ 通用自定义列展示与必选列锁定保护系统 (`ColumnSetting`)
- **自由定制列可见性**：表格右上角配置【列设置】Popover 浮窗，支持管理员勾选/取消勾选任意可选列；
- **核心基准列锁定（必选列保护）**：
  - 各大业务模块的关键基准列（如【用户信息】、【作品信息】、【被举报主体】、【申诉单号】及【操作列】）自动打上 `必选` 徽标并禁用取消勾选，保证核心操作与主体信息永远不丢失；
- **本地持久化与一键重置**：
  - 自动将管理员的个性化列偏好记忆到 `localStorage`，页面刷新或重登自动恢复；
  - 提供【全选所有列】与【一键重置为默认列配置】。

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
| **持续集成部署** | GitHub Actions + Gitea Actions | GitHub Pages 公网演示 + 公司内部 Gitea CI 质量门禁与内网交付 |

---

## 📁 项目目录结构

```text
react-admin/
├── .gitea/
│   └── workflows/
│       └── ci.yml              # Gitea Actions 公司内部质量门禁与内网打包部署
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions 自动构建部署至 GitHub Pages
├── .husky/                     # Git 提交钩子 (pre-commit, commit-msg)
├── .lintstagedrc.json          # Lint-staged 暂存区检查配置
├── AGENT.md                    # AI Agent 协作规范与工程指南
├── biome.json                  # Biome 代码规范与格式化规则
├── commitlint.config.cjs       # Commitlint 提交信息规范
├── docs/                       # 架构设计、接口契约与规划文档中心
│   ├── feedback-and-audit-specification.md # 用户反馈中心与操作审计日志系统设计与对接规范
│   ├── ops/                    # 运维模块与后端契约全景文档 (现有接口、缺失接口与PG监控)
│   ├── user-module-evolution-comparison.md # 用户模块演进与全方位对比分析报告
│   └── user-api.md             # 用户中心真实接口对接与联调手册
├── index.html                  # HTML 入口模板
├── package.json                # 项目元数据与依赖定义
├── src/
│   ├── api/                    # API 接口层 (用户、认证、举报、申诉、帖子、评论、运维)
│   ├── layouts/                # 基础后台布局 (BasicLayout: 固定侧边栏与Header)
│   ├── pages/                  # 业务页面
│   │   ├── Activities/         # 活动全生命周期运营中心
│   │   │   └── components/
│   │   │       ├── ActivityCancelModal.tsx    # 活动取消原因确认弹窗
│   │   │       ├── ActivityCategoryDrawer.tsx  # 活动主题与分类字典管理抽屉
│   │   │       ├── ActivityDetailDrawer.tsx   # 活动全景详情抽屉 (行程/地点/报名名单)
│   │   │       └── ActivityWizardModal.tsx    # 5步向导式活动发布/编辑工作台
│   │   ├── Appeals/            # 违规申诉与复核治理模块
│   │   │   └── components/
│   │   │       └── AppealDetailDrawer.tsx # 申诉工单核查与裁定抽屉
│   │   ├── Comments/           # 评论管理模块
│   │   ├── Dashboard/          # 仪表盘大盘与数据统计
│   │   ├── Login/              # 用户登录页
│   │   ├── NotFound/           # 404 缺省页
│   │   ├── Ops/                # 系统运维多子模块架构
│   │   │   ├── Overview/       # 运维全景大盘 (KPI、拓扑、快捷直达)
│   │   │   ├── Server/         # 服务器与硬件监控 (CPU核心与LoadAvg、内存/Swap、多磁盘、网络)
│   │   │   ├── Redis/          # Redis 监控与配置管理 (状态指标、碎片率、键空间、核心参数表)
│   │   │   ├── Services/       # 微服务健康与即时探活
│   │   │   ├── Jvm/            # JVM 性能与 GC 垃圾回收监控
│   │   │   ├── Alerts/         # 实时告警中心与阈值策略
│   │   │   ├── Logs/           # 日志管理与日志文件下载中心
│   │   │   └── components/     # 跨页面公用组件
│   │   │       ├── AlertRulesModal.tsx      # 告警规则目录弹窗
│   │   │       ├── LogViewerDrawer.tsx      # 在线终端日志查看器与下载抽屉
│   │   │       ├── ResourcePolicyModal.tsx  # 资源阈值策略弹窗
│   │   │       └── ServiceDetailDrawer.tsx  # 微服务探针快照与资产详情抽屉
│   │   ├── Posts/              # 作品帖子管理模块
│   │   ├── Reports/            # 违规举报与安全治理模块
│   │   ├── SensitiveWords/     # 敏感词风控治理与在线校验测试台
│   │   ├── Tags/               # 标签与画像治理中心 (Master-Detail 双栏架构)
│   │   │   └── components/
│   │   │       ├── TagEditModal.tsx               # 标签新增与编辑弹窗
│   │   │       ├── TagInitialConfigDrawer.tsx     # 场景初始推荐工作台与 App 仿真预览器
│   │   │       └── TagTypeModal.tsx               # 标签分类新增与编辑弹窗
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

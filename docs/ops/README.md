# 系统运维模块与后端对接全景概览 (Ops API Integration)

本文档归纳了 **React Admin / QXJ Admin Web** 前端「系统运维」板块下 7 大子模块与后端的对接状态、接口映射与演进路线。

---

## 1. 模块联调状态矩阵

| 序号 | 页面模块 | 路由路径 | 当前状态 | 对接后端接口 | 说明 |
| :--- | :--- | :--- | :--- | :--- | :--- |
| 1 | **Redis 监控** | `/ops/redis` | 🟢 **已连通真实接口** | `GET /admin-api/infra/redis/get-monitor-info` | 动态解析 Redis 7.2 运行时指标、内存分布、QPS 及核心命令耗时统计 |
| 2 | **日志管理** | `/ops/logs` | 🟢 **已连通真实接口** | `GET /admin-api/infra/api-error-log/page` | 已直连后端真实异常错误日志流水 (含全量堆栈)；宿主机磁盘文件支持双模平滑兜底 |
| 3 | **全景大盘** | `/ops/overview` | 🟢 **前端已全面直连** | `GET /admin-api/ops/overview` | 后端已落地 `OpsFrontendController.getOverview`，前端已直连并具备容灾降级 |
| 4 | **服务器监控** | `/ops/server` | 🟢 **前端已全面直连** | `GET /admin-api/ops/server/detail` | 后端已落地硬件与系统监控详情采集，前端已直连并具备容灾降级 |
| 5 | **微服务探针** | `/ops/services` | 🟢 **前端已全面直连** | `GET /admin-api/ops/services`<br>`POST /admin-api/ops/services/probe` | 后端已落地资产列表与即时探活，前端已直连并具备容灾降级 |
| 6 | **JVM 监控** | `/ops/jvm` | 🟢 **前端已全面直连** | `GET /admin-api/ops/jvm/detail` | 后端已落地深度分代监控采集，前端已直连并具备容灾降级 |
| 7 | **告警中心** | `/ops/alerts` | 🟢 **前端已全面直连** | `GET /admin-api/ops/alert/events`<br>`PUT /admin-api/ops/alert/events/{id}/acknowledge`<br>`GET /admin-api/ops/alert/rules`<br>`GET/PUT /admin-api/ops/alert/policy` | 后端已落地告警事件、确认、规则目录与策略热更新，前端已全量直连 |

---

## 2. 文档索引导航

为了方便前后端团队高效协作与推进，运维对接文档分为以下两部分：

1. **[已可用接口与对接说明 (existing-apis.md)](./existing-apis.md)**：
   - 记录当前后端已就绪并连通的接口定义、响应示例与前端字段映射逻辑（如 Redis 监控、异常错误日志）。
2. **[待补齐后端接口契约规范 (missing-apis.md)](./missing-apis.md)**：
   - 记录目前缺失的运维接口清单；
   - 提供后端标准 Controller 路径、请求参数、返回 JSON 结构体建议（遵循 RuoYi / Yudao 与标准企业微服务规范）。

---

## 3. 前端对接原则（平滑容灾机制）

本项目严格遵循 `AGENTS.md` 前后端协调规范中的**渐进式对接与容灾兜底策略**：
1. **真实接口优先**：各 API 函数优先发起真实的 HTTP 请求；
2. **自动容灾降级**：若后端接口未部署、返回 404/503 或网络不可达，前端在 `catch` 分支无缝回退至内置高拟真数据，页面不报错、不白屏；
3. **静默探测**：探针请求头携带 `x-skip-error-message: true`，避免因后台服务未启动而弹出打扰管理员的全局报错。

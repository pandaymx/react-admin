# 后台管理系统 · 前端接口参考（登录 + 用户管理）

> 本文基于源码静态核对（`yudao-module-system/.../auth/AuthController.java`、`yudao-module-user/.../controller/admin/user/AdminUserController.java` 及配套 VO），尚未进行真实账号或线上登录验证。
> 适用对象：**后台管理系统前端**（独立仓库 `yudao-ui-admin-vue3`）。
> 口径说明：本系统前端**只调用管理员登录入口**，登录后访问 `/admin-api` 下的管理接口；短信登录、社交登录、注册等后端虽存在，但**前端不调用**（见第 5 节）。

---

## 1. 基础约定

**网关地址（前端统一访问入口）**

| 环境 | 地址 | 说明 |
|---|---|---|
| 本地开发 | `http://127.0.0.1:48080` | 网关端口 48080 |
| 生产环境 | `https://qxj.jiancan.fun` | Nginx 反代，真实后端路径仍为 `/admin-api` |

> 前端代码里把 `/admin-api` 指向上述网关地址即可（通常 `vite.config` 里 proxy 到网关，baseURL 写相对前缀 `/admin-api`）。**前端只认网关，不直连各微服务端口。**

**通用约定**
- 登录类入口为公开（`@PermitAll`），无需先登录。
- 登录成功后拿到 `accessToken` + `refreshToken`，后续所有请求在请求头携带：
  ```
  Authorization: Bearer {accessToken}
  ```
- 令牌含过期时间 `expiresTime`；`accessToken` 过期时用 `refreshToken` 静默续期（见 2.2）。

**两套认证体系（隔离关系）**

| 体系 | 用户来源 | 前缀 | 说明 |
|---|---|---|---|
| 管理后台 | `system_users`（管理员） | `/admin-api` | 本前端使用 |
| App 用户 | `app_users`（普通用户） | `/app-api` | 本前端**不调用** |

后台登录固定 `UserTypeEnum.ADMIN`，App 用户 Token 无法访问 `/admin-api`（网关 + 安全框架强制隔离）。

---

## 2. 登录（仅管理员账号密码登录）

这是本前端**唯一**调用的登录接口。

```
POST /admin-api/system/auth/login
```

**请求体**（`AuthLoginReqVO`，必填项）

| 字段 | 类型 | 必填 | 说明 |
|---|---|---|---|
| `username` | String | 是 | 后台管理员账号，4–16 位字母数字 |
| `password` | String | 是 | 密码，4–16 位 |
| `captchaVerification` | String | 视开关* | 验证码令牌，完成 AJ-Captcha 后由前端组件返回 |

> **验证码说明（重要）**
> - 后端使用内置 **AJ-Captcha（滑动/点选行为验证码）**，默认开启（`yudao.captcha.enable:true`）。
> - `captchaVerification` 不是手填的字符，而是：登录页先调 `POST /admin-api/system/captcha/get` 获取验证码 → 用户完成滑动/点选 → 组件回调返回该令牌 → 再随登录请求一起提交。
> - 若后端配置 `yudao.captcha.enable=false`，则登录**不要求** `captchaVerification`，前端可不接验证码组件。
> - * 当 `yudao.captcha.enable=true`（默认）时必填；为 `false` 时不传。

**返回**（`AuthLoginRespVO`）

| 字段 | 类型 | 说明 |
|---|---|---|
| `userId` | Long | 后台用户编号 |
| `accessToken` | String | 访问令牌（后续请求携带） |
| `refreshToken` | String | 刷新令牌（用于续期） |
| `expiresTime` | LocalDateTime | 访问令牌过期时间 |

**示例**
```json
// 请求
{ "username": "admin", "password": "admin123", "captchaVerification": "xxx" }

// 响应
{
  "userId": 1,
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "def50200...",
  "expiresTime": "2026-09-02T18:40:32"
}
```

### 2.2 续期 / 登出 / 权限信息

| 接口 | 方法 & 路径 | 说明 | 入参 |
|---|---|---|---|
| 刷新令牌 | `POST /admin-api/system/auth/refresh-token` | 用 `refreshToken` 换新的双 Token | `refreshToken`（query 参数） |
| 登出 | `POST /admin-api/system/auth/logout` | 注销当前令牌 | 请求头 `Authorization` |
| 权限信息 | `GET /admin-api/system/auth/get-permission-info` | 返回当前用户的角色、菜单（驱动动态路由 / 按钮权限） | 需登录 |

---

## 3. 登录后访问管理接口

拿到 `accessToken` 后，所有管理接口请求头统一带：
```
Authorization: Bearer {accessToken}
```

本前端当前需要的管理接口（user 模块，前缀 `/admin-api`）：

| 接口 | 方法 & 路径 | 权限 | 用途 |
|---|---|---|---|
| 用户分页列表 | `GET /admin-api/user/users/page` | `user:user:query` | 后台用户列表 |
| 用户详情 | `GET /admin-api/user/users/get?id=` | `user:user:query` | 单用户详情 |
| 更新用户状态 | `PUT /admin-api/user/users/update-status` | `user:user:update` | 启用 / 禁用 / 注销 |
| 用户统计概览 | `GET /admin-api/user/statistics/summary` | `user:statistics:query` | 顶部全局统计卡 |

### 列表 / 详情可返回字段（对照管理页需求）

| 需求字段 | 返回字段 | 取值 / 枚举 | 来源接口 |
|---|---|---|---|
| 认证状态（个人/企业） | `qualification` | `1`=个人，`2`=企业 | page / get |
| 是否实名 | `certified` | `true` / `false` | page / get |
| 账号状态 | `status` | `1`=正常，`2`=禁用，`3`=注销 | page / get |
| 昵称 / 头像 / 手机 / 展示号 | `nickname` / `avatarUrl` / `phoneNumber` / `userId` | 字符串 | page / get |
| 粉丝 / 关注 / 好友数 | `fanCount` / `followCount` / `friendCount` | 整数 | page / get |
| 初始化状态 | `initStatus` | `0`=系统保底，`1`=已初始化 | page / get |
| 创建时间 | `createTime` | 时间 | page / get |
| 全局统计卡 | `totalCount` / `normalCount` / `disabledCount` / `cancelledCount` / `todayNewCount` / `weekNewCount` / `monthNewCount` | 整数 | summary |

> 以下需求字段**本期后端暂无**，前端先留空或隐藏：在线状态 `online`、最后活跃时间 `lastActive`、评论数、发帖/作品数（admin 未聚合）、活动参与数（线上·线下）、获赞数。

---

## 4. 分页列表筛选条件

`GET /admin-api/user/users/page` 支持的查询参数（`AdminUserPageReqVO`）：

| 参数 | 说明 |
|---|---|
| `userId` | 展示号 |
| `phoneNumber` | 手机号 |
| `nickname` | 昵称 |
| `status` | 账号状态（1 正常 / 2 禁用 / 3 注销） |
| `qualification` | 认证类型（1 个人 / 2 企业） |
| `createTime` | 创建时间范围 |
| `pageNo` / `pageSize` | 分页 |

---

## 5. 后端存在但本前端不调用的入口

以下接口后端已实现且为公开入口，但**本管理系统前端不调用、UI 不展示**（避免暴露非管理员登录通道）：

| 接口 | 路径 | 说明 |
|---|---|---|
| 注册 | `POST /admin-api/system/auth/register` | 注册后台用户（公开） |
| 短信登录 | `POST /admin-api/system/auth/sms-login` | 短信验证码登录（公开） |
| 发送验证码 | `POST /admin-api/system/auth/send-sms-code` | 发送登录短信（公开） |
| 重置密码 | `POST /admin-api/system/auth/reset-password` | 重置密码（公开） |
| 社交授权跳转 | `GET /admin-api/system/auth/social-auth-redirect` | 获取社交授权 URL（公开） |
| 社交快捷登录 | `POST /admin-api/system/auth/social-login` | 用授权码登录（公开） |

> ⚠️ 这些入口目前后端**未强制关闭**。仅前端隐藏按钮不足以阻止直接调用。若要求"只能管理员账号密码登录、彻底堵死其他入口"，需后端额外改动（见第 6 节）。

---

## 6. 关于「只允许 admin 登录」的说明

本前端口径已明确：**只调用管理员账号密码登录入口**，登录后只访问 `/admin-api`，不接入任何短信/社交/注册通道。

但「只允许 admin 登录」在后端有更严格的两种含义，目前状态不同：

| 口径 | 含义 | 当前状态 |
|---|---|---|
| ① 只允许后台管理员**类型** | 仅 `UserTypeEnum.ADMIN` 可进后台，App 用户 Token 进不来 | ✅ 已天然隔离 |
| ② 只允许**唯一账号 admin**（或仅管理员角色） | 任意启用的后台账号都不能登录，只有指定账号/角色可以 | ❌ 未实现（现状：任意*启用*的后台账号均可账号密码登录） |

**若后续要进一步收紧（可选，非本期）**
- 推荐按**角色**限制（如 `super_admin` / 专用 `user_manager`），而非硬编码用户名 `admin`。
- 需后端强制校验 + 关闭第 5 节中的其他公开入口，仅保留账号密码登录；前端仅负责隐藏对应按钮。
- 本期文档按"前端只用管理员登录入口"落地即可，后端强约束作为后续独立任务。

---

## 7. 前端对接要点（清单）

1. **登录页**：调 `POST /admin-api/system/auth/login`，提交 `username` / `password` + 图形验证码字段。
2. **Token 存储**：登录成功存 `accessToken`（localStorage / Pinia），请求拦截器统一加 `Authorization: Bearer {accessToken}`。
3. **续期**：`accessToken` 过期用 `refreshToken` 调 `POST /admin-api/system/auth/refresh-token` 静默换新。
4. **权限信息**：登录后调 `GET /admin-api/system/auth/get-permission-info` 获取角色与菜单，驱动动态路由与按钮权限。
5. **登出**：调 `POST /admin-api/system/auth/logout` 并清空本地 Token。
6. **用户管理页**：联调 `page` / `get` / `update-status` / `statistics/summary`，按第 3 节字段渲染。
7. **不接入**：短信登录、社交登录、注册、重置密码等入口（第 5 节）。

---

*参考源码：`AuthController.java`、`AdminAuthServiceImpl.java`、`AdminUserController.java`、`UserStatisticsController.java`；前端：`yudao-ui-admin-vue3/src/views/Login/components/LoginForm.vue`。*

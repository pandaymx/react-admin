# 用户模块后台接口规范文档 (User Module API)

本文档整理自后端团队提供的网关接口规范，供前端 `/users` 用户治理及相关模块对接使用。

---

## 一、接口列表概览

| 接口名称 | 请求方法 & 路径 | 权限标识 | 关键入参 | 返回数据 |
| :--- | :--- | :--- | :--- | :--- |
| **用户分页列表** | `GET /admin-api/user/users/page` | `user:user:query` | `AdminUserPageReqVO` | `PageResult<AdminUserRespVO>` |
| **用户详情** | `GET /admin-api/user/users/get` | `user:user:query` | `id` (Query) | `AdminUserRespVO` |
| **更新用户状态** | `PUT /admin-api/user/users/update-status` | `user:user:update` | `id`, `status` | `Boolean` |
| **用户统计概览** | `GET /admin-api/user/statistics/summary` | `user:statistics:query` | 无 | `UserStatisticsRespVO` |

---

## 二、数据结构定义与字段枚举

### 1. 分页查询入参 (`AdminUserPageReqVO`)
- `userId`: 展示号 / UID（模糊检索或精确匹配）
- `phoneNumber`: 手机号（支持模糊搜索）
- `nickname`: 用户昵称
- `status`: 账号状态（`1`=正常，`2`=禁用/封禁，`3`=注销）
- `qualification`: 认证类型（`1`=个人认证，`2`=企业认证）
- `certified`: 是否实名（`true` / `false`，可选）
- `createTime`: 注册时间范围数组（`[startTime, endTime]`，ISO 格式或字符串）
- `pageNo`: 当前页码（从 1 开始）
- `pageSize`: 每页条数

---

### 2. 用户响应实体 (`AdminUserRespVO`)

```json
{
  "id": "123456789",
  "userId": 100001,
  "phoneNumber": "13800138000",
  "status": 1,
  "nickname": "极客先锋·Tech",
  "avatarUrl": "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
  "qualification": 2,
  "certified": true,
  "initStatus": 1,
  "createTime": "2026-09-02T10:45:00",
  "fanCount": 980000,
  "followCount": 128,
  "friendCount": 64,
  "personalAuths": [
    {
      "realName": "张*三",
      "idCard": "110101********1234",
      "authTime": "2024-03-15 14:20:00"
    }
  ]
}
```

#### 字段枚举映射对照表：
- **认证类型 (`qualification`)**：
  - `1`：个人认证 (`Personal`)
  - `2`：企业认证 (`Enterprise`)
  - `0 / undefined / null`：未认证 (`Unverified`)
- **是否实名 (`certified`)**：
  - `true`：已实名身份认证
  - `false`：未实名
- **账号状态 (`status`)**：
  - `1`：正常 (`Normal`)
  - `2`：禁用 / 封禁 (`Banned / Disabled`)
  - `3`：注销 (`Cancelled`)
- **初始化状态 (`initStatus`)**：
  - `0`：系统保底未初始化
  - `1`：已初始化正常使用

---

### 3. 用户全局统计概览 (`UserStatisticsRespVO`)

```json
{
  "totalCount": 158200,
  "normalCount": 154800,
  "disabledCount": 2400,
  "cancelledCount": 1000,
  "todayNewCount": 380,
  "weekNewCount": 2450,
  "monthNewCount": 10200
}
```

---

## 三、本次暂不支持（无后端字段）说明

以下业务字段在本次后端版本中**暂未聚合或未提供**，前端页面相应隐藏或置空处理：
- ❌ **在线状态 (`online`)**：后台未维护实时在线 WebSocket 探针；
- ❌ **最后活跃时间 (`lastActive`)**：未提供；
- ❌ **评论数**：评论归属 `interaction` 模块，未在此接口聚合；
- ❌ **发帖/作品数**：仅 App 端有，后台用户接口未聚合；
- ❌ **活动参与数**：归属 `activity2` 模块；
- ❌ **获赞数**：后台用户接口未聚合。

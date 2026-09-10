# 已就绪运维接口规范与对接说明 (Existing Ops APIs)

本文档列出后端当前已经就绪且成功连通的运维相关标准接口，包含真实响应结构与前端映射规则。

---

## 1. Redis 运行时与性能监控

- **接口路径**：`GET /admin-api/infra/redis/get-monitor-info`
- **请求方式**：`GET`
- **鉴权头**：`Authorization: Bearer {token}`
- **接口功能**：拉取 Redis 实例运行信息、内存状态、瞬时吞吐、键空间及核心命令调用统计。

### 1.1 后端返回数据结构示例 (真实返回)

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "dbSize": 184,
    "info": {
      "redis_version": "7.2.16",
      "redis_mode": "standalone",
      "tcp_port": "6379",
      "uptime_in_days": "3",
      "connected_clients": "200",
      "blocked_clients": "0",
      "used_memory_human": "2.35M",
      "used_memory_rss_human": "10.18M",
      "used_memory_peak_human": "9.54M",
      "maxmemory_human": "0B",
      "maxmemory_policy": "noeviction",
      "mem_fragmentation_ratio": "4.33",
      "keyspace_hits": "125552",
      "keyspace_misses": "92369",
      "instantaneous_ops_per_sec": "10",
      "expired_keys": "165",
      "evicted_keys": "0",
      "aof_enabled": "0",
      "rdb_last_bgsave_status": "ok",
      "rdb_last_save_time": "1788777858",
      "db0": "keys=184,expires=13,avg_ttl=30554571"
    },
    "commandStats": [
      { "command": "get", "calls": 52221, "usec": 277439 },
      { "command": "set", "calls": 51342, "usec": 563422 },
      { "command": "del", "calls": 91986, "usec": 757772 },
      { "command": "eval", "calls": 103631, "usec": 12538191 },
      { "command": "ping", "calls": 1061977, "usec": 1860470 }
    ]
  }
}
```

### 1.2 前端字段映射规则 (`src/api/ops.ts`)

| 前端展示字段 | 后端原始字段 | 转换 / 计算逻辑 | 说明 |
| :--- | :--- | :--- | :--- |
| `version` | `info.redis_version` | 直接读取，如 `7.2.16` | Redis 核心引擎版本 |
| `redisMode` | `info.redis_mode` | 如 `standalone` / `cluster` | 部署模式 |
| `connectedClients` | `info.connected_clients` | `parseInt(...)` | 当前活动客户端连接 |
| `usedMemoryHuman` | `info.used_memory_human` | 如 `2.35 MB` | 当前分配内存占用 |
| `memFragmentationRatio` | `info.mem_fragmentation_ratio` | `parseFloat(...)` | 内存碎片率 |
| `hitRate` | 计算所得 | `hits / (hits + misses) * 100` | 缓存命中率百分比 |
| `instantaneousOpsPerSec` | `info.instantaneous_ops_per_sec` | `parseInt(...)` | 瞬时每秒操作数 (QPS) |
| `totalKeys` | `dbSize` | `Number(data.dbSize)` | 全局有效 Key 键总量 |
| `commandStats` | `data.commandStats` | 计算各命令耗时占比 `percentage` 与单次平均耗时 `usecPerCall` | 前端图表渲染命令热度 |

---

## 2. API 异常错误日志流水

- **接口路径**：`GET /admin-api/infra/api-error-log/page`
- **请求方式**：`GET`
- **鉴权头**：`Authorization: Bearer {token}`
- **接口功能**：分页查询系统各微服务（`user-server`、`feeds-server` 等）捕获并持久化入库的异常报错流水。

### 2.1 请求参数 (AdminApiErrorLogPageReqVO)

| 参数名 | 类型 | 必填 | 默认值 | 说明 |
| :--- | :--- | :--- | :--- | :--- |
| `pageNo` | `number` | 否 | `1` | 页码，从 1 开始 |
| `pageSize` | `number` | 否 | `20` | 每页条数 |
| `userId` | `number` | 否 | - | 操作用户 ID |
| `userType` | `number` | 否 | - | 用户类型 (1 会员 / 2 管理员) |
| `applicationName` | `string` | 否 | - | 微服务应用名 (如 `feeds-server`) |
| `requestUrl` | `string` | 否 | - | 触发异常的 API 路由 (模糊匹配) |
| `processStatus` | `number` | 否 | - | 处置状态 (0 未处理 / 1 已处理 / 2 已忽略) |
| `exceptionTime` | `string[]` | 否 | - | 异常发生时间范围 `[beginTime, endTime]` |

### 2.2 后端返回数据结构示例 (真实返回)

```json
{
  "code": 0,
  "msg": "",
  "data": {
    "total": 182,
    "list": [
      {
        "id": 4641,
        "traceId": "",
        "userId": 1,
        "userType": 2,
        "applicationName": "user-server",
        "requestMethod": "GET",
        "requestUrl": "/admin-api/user/users/page",
        "requestParams": "{\"pageNo\":1,\"pageSize\":10}",
        "userIp": "192.168.3.16",
        "userAgent": "Mozilla/5.0 ...",
        "exceptionTime": 1789037967630,
        "exceptionName": "org.springframework.jdbc.BadSqlGrammarException",
        "exceptionMessage": "BadSqlGrammarException: ...",
        "exceptionRootCauseMessage": "PSQLException: ERROR: operator does not exist: bigint = character varying",
        "exceptionStackTrace": "org.springframework.jdbc.BadSqlGrammarException: ...\n\tat ...",
        "exceptionClassName": "org.springframework.jdbc.support.SQLStateSQLExceptionTranslator",
        "exceptionFileName": "SQLStateSQLExceptionTranslator.java",
        "exceptionMethodName": "doTranslate",
        "exceptionLineNumber": 112,
        "processStatus": 0,
        "processTime": null,
        "processUserId": 0,
        "createTime": 1789037967630
      }
    ]
  }
}
```

### 2.3 异常状态更新接口

- **接口路径**：`PUT /admin-api/infra/api-error-log/update-status`
- **请求体**：
  ```json
  {
    "id": 4641,
    "processStatus": 1 // 1: 已处理, 2: 已忽略
  }
  ```

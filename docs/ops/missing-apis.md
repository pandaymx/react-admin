# 缺失运维后端接口契约规范与需求清单 (Missing Ops APIs)

本文档整理了前端系统运维板块各子页面目前**缺失或调用异常**的后端接口，详细给出推荐的接口路径、请求方法、参数契约与响应 JSON 结构体，供后端研发人员直接对照开发或集成对应 Starter 模块。

---

## 一、服务器硬件与系统监控 (`/ops/server`)

### 1.1 现状排查
- **调用路径**：`GET /admin-api/infra/server/get`
- **当前表现**：后端返回 `404 请求地址不存在:admin-api/infra/server/get`
- **根因分析**：后端工程中尚未引入 `yudao-spring-boot-starter-biz-infra` 下的服务器监控 Controller 或未集成 `oshi-core` 系统信息采集库。

### 1.2 推荐接口设计与契约

- **接口路径**：`GET /admin-api/infra/server/get`（或 `GET /admin-api/ops/server/detail`）
- **请求方式**：`GET`
- **请求参数**：
  - `hostId`（可选，集群环境下指定主机 ID，单机默认当前服务器）
- **推荐响应结构体 (JSON)**：
  ```json
  {
    "code": 0,
    "msg": "",
    "data": {
      "sys": {
        "computerName": "prod-k8s-node-01",
        "computerIp": "172.17.75.184",
        "publicIp": "192.168.3.100",
        "osName": "Alibaba Cloud Linux 3.2104 LTS",
        "osArch": "x86_64",
        "kernelVersion": "5.10.134-16.1.al8.x86_64",
        "uptime": "48天 16小时 32分",
        "runtimeEnv": "生产环境 (Production)"
      },
      "cpu": {
        "cpuNum": 16,
        "cpuModel": "Intel(R) Xeon(R) Platinum 8369B CPU @ 2.70GHz",
        "userPercent": 28.4,
        "sysPercent": 9.8,
        "idlePercent": 61.8,
        "waitPercent": 0.0,
        "totalPercent": 38.2,
        "loadAvg1m": 2.14,
        "loadAvg5m": 1.88,
        "loadAvg15m": 1.62
      },
      "mem": {
        "totalGb": 64.0,
        "usedGb": 39.8,
        "freeGb": 14.2,
        "bufferCachedGb": 10.0,
        "usagePercent": 62.19,
        "swapTotalGb": 8.0,
        "swapUsedGb": 0.42,
        "swapFreeGb": 7.58,
        "swapUsagePercent": 5.25
      },
      "disks": [
        {
          "dirName": "/",
          "sysTypeName": "ext4",
          "typeName": "系统根分区",
          "totalGb": 100.0,
          "usedGb": 42.6,
          "freeGb": 57.4,
          "usagePercent": 42.6,
          "status": "normal"
        },
        {
          "dirName": "/data",
          "sysTypeName": "xfs",
          "typeName": "数据挂载分区",
          "totalGb": 500.0,
          "usedGb": 284.0,
          "freeGb": 216.0,
          "usagePercent": 56.8,
          "status": "normal"
        }
      ],
      "network": [
        {
          "interfaceName": "eth0",
          "ip": "172.17.75.184",
          "rxSpeedKb": 1420.5,
          "txSpeedKb": 2890.2,
          "rxTotalMb": 124800,
          "txTotalMb": 358400,
          "tcpEstablished": 486,
          "tcpTimeWait": 92,
          "tcpCloseWait": 6
        }
      ]
    }
  }
  ```

---

## 二、全景监控大盘与微服务探针 (`/ops/overview`, `/ops/services`)

### 2.1 现状排查
- **调用路径**：`GET /admin-api/ops/overview` 或 `GET /admin-api/ops/services`
- **当前表现**：网关返回 `503 Unable to find instance for ops-server`
- **根因分析**：网关中已配置目标服务为 `ops-server`，但注册中心尚未有该实例上线。

### 2.2 解决方案建议
- **方案 1（快速打通）**：将相关接口收归在现存的 `system-server` 或 `gateway-server` 中，通过直接读取 Nacos Discovery Client 获取各服务实例状态；
- **方案 2（独立微服务）**：部署并上线 `ops-server` 微服务，承担全链路探针与监控职责。

### 2.3 接口设计契约

#### 接口 1：全景概览与健康评分
- **接口路径**：`GET /admin-api/ops/overview`
- **返回结构**：
  ```json
  {
    "code": 0,
    "msg": "",
    "data": {
      "healthScore": 95,
      "totalServices": 8,
      "upServices": 8,
      "downServices": 0,
      "degradedServices": 0,
      "activeAlerts": 1,
      "hostCount": 3,
      "cpuAvgUsage": 28,
      "memoryAvgUsage": 54,
      "jvmHeapAvgUsage": 46
    }
  }
  ```

#### 接口 2：微服务实例资产与探针状态
- **接口路径**：`GET /admin-api/ops/services`
- **返回结构**：
  ```json
  {
    "code": 0,
    "msg": "",
    "data": [
      {
        "id": "svc-1",
        "name": "gateway-server",
        "chineseName": "API 网关服务",
        "version": "1.0.0-RELEASE",
        "status": "UP",
        "host": "172.17.75.184",
        "port": 48080,
        "responseTime": 12,
        "uptime": "28天 14小时",
        "lastProbeTime": "2026-09-10 18:50:00",
        "instanceCount": 2,
        "jvmHeapUsage": 45,
        "cpuUsage": 14,
        "probeEndpoint": "/actuator/health"
      }
    ]
  }
  ```

#### 接口 3：即时发起单服务探活
- **接口路径**：`POST /admin-api/ops/services/probe?serviceId={serviceId}`
- **接口功能**：即时向该微服务的健康探针（如 `http://host:port/actuator/health`）发起一次检测并更新延迟。

---

## 三、JVM 深度分代监控 (`/ops/jvm`)

### 3.1 现状与需求
管理员需要在后台排查内存泄漏、GC 停顿频次与死锁线程。
虽然单体 Spring Boot 开放了 `/actuator/metrics`，但在微服务分布式场景下，需要统一由监控接口聚合返回目标服务的 JVM 快照。

### 3.2 推荐接口契约
- **接口路径**：`GET /admin-api/ops/jvm/detail`
- **请求参数**：
  - `serviceCode`: 微服务标识（如 `user-server`、`feeds-server`）
- **返回结构 (JSON)**：
  ```json
  {
    "code": 0,
    "msg": "",
    "data": {
      "serviceCode": "user-server",
      "chineseName": "用户中心服务",
      "jvmName": "OpenJDK 64-Bit Server VM",
      "jvmVersion": "17.0.12+7-LTS",
      "startTime": "2026-08-20 10:15:00",
      "uptime": "21天 8小时 45分",
      "initHeapMb": 2048,
      "maxHeapMb": 8192,
      "usedHeapMb": 4620,
      "committedHeapMb": 6144,
      "heapUsagePercent": 56.4,
      "edenUsedMb": 1280,
      "edenMaxMb": 2048,
      "oldGenUsedMb": 3040,
      "oldGenMaxMb": 5120,
      "metaspaceUsedMb": 184,
      "metaspaceMaxMb": 512,
      "youngGcCount": 1482,
      "youngGcTimeMs": 18420,
      "fullGcCount": 3,
      "fullGcTimeMs": 420,
      "threadCount": 142,
      "peakThreadCount": 280,
      "daemonThreadCount": 96,
      "deadlockedThreadCount": 0
    }
  }
  ```

---

## 四、运维告警中心 (`/ops/alerts`)

### 4.1 接口清单规划

| 接口功能 | 推荐路径 | 请求方式 | 说明 |
| :--- | :--- | :--- | :--- |
| **实时告警事件列表** | `GET /admin-api/ops/alert/events` | GET | 支持按严重等级 (`CRITICAL`/`WARNING`)、触发状态 (`FIRING`/`RESOLVED`) 检索 |
| **告警确认 / 处置** | `PUT /admin-api/ops/alert/events/{id}/acknowledge` | PUT | 标记管理员已跟进处理 |
| **告警规则目录** | `GET /admin-api/ops/alert/rules` | GET | 规则定义（指标、阈值、持续周期、等级） |
| **资源阈值策略** | `GET /admin-api/ops/alert/policy` | GET | 资源告警全局阈值 (CPU/内存/磁盘/探针超时) |
| **更新资源阈值策略** | `PUT /admin-api/ops/alert/policy` | PUT | 保存最新阈值配置并即时热生效 |

---

## 五、API 访问日志恢复 (`/ops/logs`)

### 5.1 现状排查
- **调用路径**：`GET /admin-api/infra/api-access-log/page?pageNo=1&pageSize=10`
- **当前表现**：后端返回 `500 系统异常`
- **排查建议**：
  - 检查数据库中 `infra_api_access_log` 表是否存在或字段缺失；
  - 检查后端 `ApiAccessLogController` 中实体类映射是否与 PostgreSQL 数据表字段类型一致。
  - 修复后前端可直接无缝呈现全站 API 访问统计与耗时分析。

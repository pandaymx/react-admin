# 后台管理系统 · 登录与用户管理 接口速查（含调用片段）

> 配套文档：`docs/LOGIN_API.md`（字段/口径说明）。本文只给**可直接复制的调用示例**。
> 环境地址：本地 `http://127.0.0.1:48080`，生产 `https://qxj.jiancan.fun`。所有路径前缀均为 `/admin-api`。

---

## 0. 约定

```js
// 前端配置
const API_BASE = 'http://127.0.0.1:48080/admin-api'; // 本地；生产换成 https://qxj.jiancan.fun/admin-api
```

鉴权头（登录后所有请求携带）：
```
Authorization: Bearer {accessToken}
```

---

## 1. 登录（管理员账号密码）

> 默认 `yudao.captcha.enable:true`，登录**必须**带 `captchaVerification`。流程：先获取验证码 → 用户完成行为验证 → 组件返回 `captchaVerification` → 再登录。若后端改成 `false`，可跳过 1.0 且登录不传该字段。

### 1.0 获取验证码（AJ-Captcha 行为验证码）
```bash
curl -X POST 'http://127.0.0.1:48080/admin-api/system/captcha/get' \
  -H 'Content-Type: application/json' \
  -d '{ "captchaType": "blockPuzzle" }'
# 返回 repData 含 originalImageBase64 / jigsawImageBase64 / token / secretKey 等，
# 前端用 AJ-Captcha 组件渲染，用户滑动完成后组件回调得到 captchaVerification
```
```js
// 用 yudao 内置的 Captcha 组件（admin-vue3 已带），完成后拿到 captchaVerification
const captchaVerification = await getCaptchaVerification(); // 组件回调值
```

### 1.1 账号密码登录
```bash
curl -X POST 'http://127.0.0.1:48080/admin-api/system/auth/login' \
  -H 'Content-Type: application/json' \
  -d '{
    "username": "admin",
    "password": "admin123",
    "captchaVerification": "<AJ-Captcha 完成后的令牌>"
  }'
```

### Axios
```js
const res = await axios.post(`${API_BASE}/system/auth/login`, {
  username: 'admin',
  password: 'admin123',
  captchaVerification, // 来自 1.0 的 AJ-Captcha 组件回调
});
const { accessToken, refreshToken, expiresTime, userId } = res.data;
// 存本地
localStorage.setItem('accessToken', accessToken);
localStorage.setItem('refreshToken', refreshToken);
```

**返回**
```json
{
  "userId": 1,
  "accessToken": "eyJhbGciOiJIUzI1NiJ9...",
  "refreshToken": "def50200...",
  "expiresTime": "2026-09-02T18:40:32"
}
```

---

## 2. 请求拦截器（统一带 Token + 自动续期）

```js
// axios 实例
const api = axios.create({ baseURL: API_BASE });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// 响应拦截：401 时尝试用 refreshToken 续期（简化版）
api.interceptors.response.use(
  (r) => r,
  async (err) => {
    if (err.response?.status === 401 && !err.config._retry) {
      err.config._retry = true;
      const refreshToken = localStorage.getItem('refreshToken');
      const { data } = await axios.post(
        `${API_BASE}/system/auth/refresh-token?refreshToken=${refreshToken}`
      );
      localStorage.setItem('accessToken', data.accessToken);
      localStorage.setItem('refreshToken', data.refreshToken);
      err.config.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(err.config);
    }
    return Promise.reject(err);
  }
);
```

---

## 3. 权限信息（登录后获取角色/菜单）

```js
const { data } = await api.get('/system/auth/get-permission-info');
// data 含角色、菜单，用于动态路由与按钮权限
```

---

## 4. 用户管理接口

### 4.1 用户分页列表
```bash
curl -X GET 'http://127.0.0.1:48080/admin-api/user/users/page?pageNo=1&pageSize=10&status=1&qualification=2' \
  -H 'Authorization: Bearer {accessToken}'
```
```js
const { data } = await api.get('/user/users/page', {
  params: { pageNo: 1, pageSize: 10, status: 1, qualification: 2 },
});
// data.list -> AdminUserRespVO[]
```

### 4.2 用户详情
```bash
curl -X GET 'http://127.0.0.1:48080/admin-api/user/users/get?id=123456789' \
  -H 'Authorization: Bearer {accessToken}'
```
```js
const { data } = await api.get('/user/users/get', { params: { id: 123456789 } });
```

### 4.3 更新用户状态（启用/禁用/注销）
```bash
curl -X PUT 'http://127.0.0.1:48080/admin-api/user/users/update-status' \
  -H 'Authorization: Bearer {accessToken}' \
  -H 'Content-Type: application/json' \
  -d '{ "id": 123456789, "status": 2 }'
```
```js
await api.put('/user/users/update-status', { id: 123456789, status: 2 });
// status: 1-正常, 2-禁用, 3-注销
```

### 4.4 用户统计概览（顶部统计卡）
```bash
curl -X GET 'http://127.0.0.1:48080/admin-api/user/statistics/summary' \
  -H 'Authorization: Bearer {accessToken}'
```
```js
const { data } = await api.get('/user/statistics/summary');
// data: totalCount / normalCount / disabledCount / cancelledCount
//       todayNewCount / weekNewCount / monthNewCount
```

---

## 5. 登出
```js
await api.post('/system/auth/logout');
localStorage.removeItem('accessToken');
localStorage.removeItem('refreshToken');
```

---

## 6. 字段速查（列表/详情返回）

| 需求 | 字段 | 枚举 |
|---|---|---|
| 认证状态 | `qualification` | 1-个人 / 2-企业 |
| 是否实名 | `certified` | true / false |
| 账号状态 | `status` | 1-正常 / 2-禁用 / 3-注销 |
| 昵称 / 头像 / 手机 | `nickname` / `avatarUrl` / `phoneNumber` | — |
| 展示号 | `userId` | — |
| 粉丝 / 关注 / 好友 | `fanCount` / `followCount` / `friendCount` | 整数 |
| 创建时间 | `createTime` | 时间 |

> 在线状态 `online`、最后活跃 `lastActive`、评论数、发帖数、活动参与数、获赞数 —— 本期后端暂无，前端先留空/隐藏。

---

## 7. 不调用的入口（前端勿接）

注册 `register`、短信登录 `sms-login`、发送验证码 `send-sms-code`、重置密码 `reset-password`、社交 `social-*` —— 后端存在但本前端不接入。

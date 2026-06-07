# 桃灵图库 Cookie 鉴权与服务器替换部署文档

适用域名：`https://hetao123.xin`

前端目录：`/var/www/taoling-gallery/dist`

后端目录：`/root/taoling-gallery-server`

后端端口：`3000`

## 1. 本次后端认证改动

后端已从“前端保存 token 并放到 Authorization 请求头”改为主流的 HttpOnly Cookie 鉴权：

- 登录 `/api/auth/login`：后端签发 JWT，并通过 `Set-Cookie` 写入 `taoling_auth`。
- 注册 `/api/auth/register`：注册成功后也会写入同一个登录 Cookie。
- 退出 `/api/auth/logout`：后端清除 `taoling_auth`。
- 受保护接口：后端优先从 Cookie 读取 JWT。
- 兼容期：后端暂时仍兼容 `Authorization: Bearer <token>`，方便前端分阶段修改。

Cookie 配置来自 `.env`：

```env
AUTH_COOKIE_NAME=taoling_auth
AUTH_COOKIE_SAMESITE=lax
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_DOMAIN=
AUTH_COOKIE_MAX_AGE=7d
```

生产环境必须使用 HTTPS，所以 `AUTH_COOKIE_SECURE=true`。当前前后端都在 `hetao123.xin` 同域下，`SameSite=lax` 合适，`AUTH_COOKIE_DOMAIN` 留空即可。

## 2. 前端需要修改什么

前端在 `C:\Users\86191\Desktop\taoling-gallery`，我已查看到目前仍在使用 localStorage token。因为前端目录不在本后端工作区内，本次没有直接写入前端文件。你需要按下面改。

### 2.1 `src/utils/request.ts`

删除 `getToken`、`Authorization` 请求头逻辑，Axios 开启 Cookie 凭证：

```ts
import axios, { type AxiosError, type AxiosRequestConfig } from 'axios'
import { ElMessage } from 'element-plus'

import router from '@/router'
import type { ApiResponse } from '@/types/common'
import { clearAuthState } from '@/utils/storage'

const request = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 15000,
  withCredentials: true,
})
```

401 时从 `clearToken()` 改为：

```ts
clearAuthState()
```

### 2.2 `src/utils/storage.ts`

不再保存 token，只保留清理 Pinia 持久化状态：

```ts
const USER_STORE_KEY = 'taoling-user'

export function clearAuthState() {
  localStorage.removeItem(USER_STORE_KEY)
}
```

### 2.3 `src/stores/user.ts`

删除 `token` 这个 ref，`isLoggedIn` 改成看 `user`：

```ts
const user = ref<AuthUser | null>(null)
const isLoggedIn = computed(() => Boolean(user.value))
```

登录和注册成功后不再读取 `result.token`，只保存：

```ts
user.value = result.user
stats.value = result.stats || null
```

`getMe()` 不要先判断本地 token，直接请求 `/auth/me`，让浏览器自动带 Cookie。

`logout()` 需要先请求后端清除 HttpOnly Cookie，再清理本地状态。先在 `src/apis/auth.ts` 增加 `logoutApi`：

```ts
export function logoutApi() {
  return requestData<Record<string, never>>({
    url: '/auth/logout',
    method: 'POST',
  })
}
```

然后在 `src/stores/user.ts` 引入：

```ts
import { getMeApi, loginApi, logoutApi, registerApi } from '@/apis/auth'
```

`logout()` 改为异步：

```ts
async function logout() {
  await logoutApi().catch(() => null)
  user.value = null
  stats.value = null
  clearAuthState()
}
```

调用处也要加 `await`：

- `src/components/layout/AppHeader.vue` 的 `confirmLogout()`：`await userStore.logout()`
- `src/views/UserProfile.vue` 的 `logout()`：`await userStore.logout()`

Pinia 持久化字段从：

```ts
pick: ['token', 'user', 'stats']
```

改成：

```ts
pick: ['user', 'stats']
```

### 2.4 `src/router/guard.ts`

路由守卫不能再依赖 `getToken()`。进入需要登录的页面前，先尝试 `/auth/me` 恢复登录态：

```ts
router.beforeEach(async (to) => {
  const userStore = useUserStore()

  if (!userStore.user) {
    await userStore.getMe().catch(() => null)
  }

  if (to.path === '/auth' && userStore.user) {
    return userStore.isAdmin ? '/admin/dashboard' : '/gallery'
  }

  if (to.meta.requiresAuth && !userStore.user) {
    return { path: '/auth', query: { redirect: to.fullPath } }
  }

  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    return '/permission'
  }

  return true
})
```

### 2.5 `src/apis/assistant.ts`

流式 `fetch` 删除 token 请求头，增加：

```ts
credentials: 'include',
```

### 2.6 `src/utils/download.ts`

下载 `fetch` 已经有 `credentials: 'include'`，删除 `getToken` 和 `Authorization` 相关代码即可。

### 2.7 `src/types/auth.ts`

`AuthResult` 删除 `token`：

```ts
export interface AuthResult {
  user: AuthUser
  stats?: UserStats
}
```

### 2.8 前端环境变量

生产环境建议：

```env
VITE_APP_TITLE=桃灵图库
VITE_API_BASE_URL=/api
VITE_UPLOAD_BASE_URL=/uploads
VITE_ENABLE_MOCK=false
VITE_ENABLE_DEVTOOLS=false
VITE_ROUTER_MODE=history
```

你现在的 `VITE_API_BASE_URL=https://hetao123.xin/api` 也能用，但同域部署用 `/api` 更稳，之后换域名或反代时不用重新打包。

### 2.9 `src/views/Auth.vue`

后端注册成功后现在也会写入 Cookie，因此前端注册成功后建议直接进入首页，不要再提示“请登录”：

```ts
ElMessage.success('注册成功，桃灵已经为你打开首页')
await goAfterAuth()
```

也就是把当前注册分支里的：

```ts
ElMessage.success('注册成功，请登录后开始使用桃灵图库')
switchMode('login')
registerForm.password = ''
registerForm.confirmPassword = ''
```

替换为上面的成功提示和跳转。若你仍想保持“注册后必须手动登录”的产品逻辑，则告诉我，我可以把后端注册接口改回只注册、不写 Cookie。

## 3. 本地打包

### 3.1 前端打包

在前端目录：

```powershell
cd C:\Users\86191\Desktop\taoling-gallery
npm run build
```

生成目录：

```text
C:\Users\86191\Desktop\taoling-gallery\dist
```

用 Xftp8 上传时，把 `dist` 目录里的所有内容上传到服务器：

```text
/var/www/taoling-gallery/dist
```

注意：是上传 `dist` 内部文件到这个目录，不要变成 `/var/www/taoling-gallery/dist/dist`。

### 3.2 后端上传

用 Xftp8 上传后端项目到：

```text
/root/taoling-gallery-server
```

建议上传这些：

- `src`
- `docs`
- `package.json`
- `package-lock.json`
- `.env.example`

不要上传 Windows 的 `node_modules`，Linux 上要重新安装依赖，否则 `sharp` 这类原生依赖容易不可用。

## 4. 数据库表上传

当前后端只 `sequelize.authenticate()`，没有自动建表，所以服务器 MySQL 必须先有库和表。

### 4.1 在本地导出

如果本地 MySQL 有完整表和数据：

```powershell
mysqldump -u root -p --default-character-set=utf8mb4 taoling_gallery > taoling_gallery.sql
```

如果只想导出表结构：

```powershell
mysqldump -u root -p --default-character-set=utf8mb4 --no-data taoling_gallery > taoling_gallery_schema.sql
```

用 Xftp8 上传 SQL 文件到服务器，例如：

```text
/root/taoling-gallery-server/taoling_gallery.sql
```

### 4.2 在服务器导入

SSH 登录服务器后：

```bash
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS taoling_gallery DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
mysql -u root -p taoling_gallery < /root/taoling-gallery-server/taoling_gallery.sql
```

导入后检查表：

```bash
mysql -u root -p -e "USE taoling_gallery; SHOW TABLES;"
```

项目涉及的核心表名包括：

```text
users
user_stats
categories
tags
images
image_tags
favorites
download_records
image_view_records
ai_conversations
ai_messages
ai_memories
admin_logs
user_messages
```

## 5. 服务器后端配置

进入后端目录：

```bash
cd /root/taoling-gallery-server
cp .env.example .env
```

编辑 `.env`：

```env
NODE_ENV=production
PORT=3000
APP_URL=https://hetao123.xin
CORS_ORIGINS=https://hetao123.xin,https://www.hetao123.xin

DB_HOST=127.0.0.1
DB_PORT=3306
DB_NAME=taoling_gallery
DB_USER=你的数据库用户
DB_PASSWORD=你的数据库密码

JWT_SECRET=换成一段足够长的随机字符串
JWT_EXPIRES_IN=7d

AUTH_COOKIE_NAME=taoling_auth
AUTH_COOKIE_SAMESITE=lax
AUTH_COOKIE_SECURE=true
AUTH_COOKIE_DOMAIN=
AUTH_COOKIE_MAX_AGE=7d
```

安装后端依赖：

```bash
npm ci --omit=dev
```

如果服务器原来已经用 PM2 管理 Node 服务，先看现有服务名：

```bash
pm2 list
```

启动或替换为当前项目：

```bash
pm2 start src/server.js --name taoling-gallery-server
pm2 save
```

如果已有同名服务，使用：

```bash
pm2 restart taoling-gallery-server --update-env
pm2 save
```

如果你原来用 systemd，不要新装 PM2，直接改原来的 service。示例：

```ini
[Unit]
Description=Taoling Gallery Server
After=network.target

[Service]
Type=simple
WorkingDirectory=/root/taoling-gallery-server
ExecStart=/usr/bin/node /root/taoling-gallery-server/src/server.js
Restart=always
RestartSec=5
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
```

然后：

```bash
systemctl daemon-reload
systemctl restart taoling-gallery-server
systemctl status taoling-gallery-server
```

## 6. Nginx 替换配置

你截图里的旧配置前端 root 是：

```nginx
root /var/www/my_blog/dist;
```

需要替换成：

```nginx
root /var/www/taoling-gallery/dist;
```

同时把 `/api/` 反代到后端 `3000`。推荐完整 server 配置如下，证书路径沿用你现有的：

```nginx
proxy_connect_timeout 60s;
proxy_send_timeout 120s;
proxy_read_timeout 120s;

server {
    listen 80;
    server_name hetao123.xin www.hetao123.xin;
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl;
    server_name hetao123.xin www.hetao123.xin;

    ssl_certificate /etc/nginx/ssl/hetao123.xin.pem;
    ssl_certificate_key /etc/nginx/ssl/hetao123.xin.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES128-GCM-SHA256:HIGH:!aNULL:!MD5;

    root /var/www/taoling-gallery/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000/api/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Cookie $http_cookie;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:3000/uploads/;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_set_header Cookie $http_cookie;
    }
}
```

如果你的配置文件就在 `/etc/nginx/nginx.conf`，就在原位置替换对应 `server` 块即可；如果原来是 `/etc/nginx/conf.d/*.conf`，建议把这段放到：

```text
/etc/nginx/conf.d/hetao123.xin.conf
```

测试并重载：

```bash
nginx -t
systemctl reload nginx
```

## 7. 上线验证

### 7.1 后端健康检查

```bash
curl -i http://127.0.0.1:3000/health
curl -i https://hetao123.xin/api/auth/me
```

未登录访问 `/api/auth/me` 返回 401 是正常的。

### 7.2 验证 Cookie 登录

```bash
curl -i -c cookie.txt -H "Content-Type: application/json" \
  -d '{"account":"你的账号","password":"你的密码"}' \
  https://hetao123.xin/api/auth/login
```

响应头里应该有：

```text
Set-Cookie: taoling_auth=...; HttpOnly; Secure; SameSite=Lax
```

再带 Cookie 请求：

```bash
curl -i -b cookie.txt https://hetao123.xin/api/auth/me
```

应该返回当前用户信息。

### 7.3 浏览器验证

打开：

```text
https://hetao123.xin
```

登录后在浏览器开发者工具检查：

- Application / Cookies 中有 `taoling_auth`
- `HttpOnly` 为 true
- `Secure` 为 true
- `SameSite` 为 `Lax`
- JS 里不能通过 `document.cookie` 读到 `taoling_auth`
- 刷新页面后仍能通过 `/api/auth/me` 恢复登录态

## 8. 常见问题

### 登录成功但刷新后掉线

优先检查：

- 前端请求是否设置 `withCredentials: true`
- `fetch` 是否设置 `credentials: 'include'`
- `.env` 中 `AUTH_COOKIE_SECURE=true`
- 是否通过 `https://hetao123.xin` 访问，而不是 IP 或 HTTP
- Nginx `/api/` 是否反代到了 `http://127.0.0.1:3000/api/`

### 接口出现 CORS 错误

生产同域一般不会出现 CORS。若前端仍请求完整域名，确认后端 `.env`：

```env
CORS_ORIGINS=https://hetao123.xin,https://www.hetao123.xin
```

本地开发则加：

```env
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
AUTH_COOKIE_SECURE=false
```

### 上传图片无法访问

确认后端上传文件实际位于：

```text
/root/taoling-gallery-server/src/uploads
```

并且 Nginx 有 `/uploads/` 反代。当前后端静态路径是 `/uploads`。

## 9. 后续自动集成部署

第一阶段你可以继续用 Xftp8 手动上传。稳定后建议自动化成“本地打包，服务器拉取或 rsync 替换”的流程。

### 9.1 简单脚本思路

前端：

```bash
npm ci
npm run build
rsync -avz --delete dist/ root@服务器IP:/var/www/taoling-gallery/dist/
```

后端：

```bash
rsync -avz --delete \
  --exclude node_modules \
  --exclude .env \
  ./ root@服务器IP:/root/taoling-gallery-server/

ssh root@服务器IP "cd /root/taoling-gallery-server && npm ci --omit=dev && pm2 restart taoling-gallery-server --update-env"
```

数据库：

```bash
mysqldump -u root -p taoling_gallery > taoling_gallery.sql
scp taoling_gallery.sql root@服务器IP:/root/taoling-gallery-server/
ssh root@服务器IP "mysql -u root -p taoling_gallery < /root/taoling-gallery-server/taoling_gallery.sql"
```

数据库自动导入要谨慎：正式站有用户数据后，不建议每次部署都覆盖数据库，只在迁移表结构时执行 SQL。

### 9.2 GitHub Actions 思路

后续可以把前端和后端放到 GitHub，配置服务器 SSH Key：

- push 到 `main`
- GitHub Actions 执行前端 `npm ci && npm run build`
- 上传前端 `dist` 到 `/var/www/taoling-gallery/dist`
- 上传后端代码到 `/root/taoling-gallery-server`
- SSH 到服务器执行 `npm ci --omit=dev`
- 重启 PM2 或 systemd
- 执行 `curl https://hetao123.xin/api/health` 或 `curl https://hetao123.xin/`

自动化部署不要把 `.env`、数据库密码、JWT_SECRET 提交到仓库。服务器上的 `.env` 保留在服务器本地。

## 10. 最小替换清单

你这次上线实际要替换或配置这些：

- 前端：按第 2 节改 Cookie 凭证逻辑，重新 `npm run build`
- 前端服务器目录：替换 `/var/www/taoling-gallery/dist`
- 后端：上传到 `/root/taoling-gallery-server`
- 后端 `.env`：设置生产数据库、`JWT_SECRET`、Cookie、CORS
- 数据库：导入 `taoling_gallery.sql`
- Nginx：把前端 root 改成 `/var/www/taoling-gallery/dist`，新增或替换 `/api/`、`/uploads/` 反代
- 服务进程：重启 PM2 或 systemd 中的后端服务
- 验证：检查 `Set-Cookie`、登录态刷新、图片上传/访问、管理员后台

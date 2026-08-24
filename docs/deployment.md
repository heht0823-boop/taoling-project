# 阿里云手工部署、验收与回滚

本文档记录目标部署流程和可执行命令。仓库当前没有可公开验证的线上地址，因此“服务器验收记录”保持待办；不得用本地结果冒充生产验收。

## 1. Target topology

```text
Internet
  → Nginx :80/:443
      → frontend dist
      → /api, /health, /uploads → Node :3000
  → systemd: taoling-gallery.service
  → MySQL / RDS
```

推荐目录：

```text
/opt/taoling-gallery/releases/<release-id>/
/opt/taoling-gallery/current -> releases/<release-id>
/etc/taoling-gallery/server.env
/var/lib/taoling-gallery/uploads/
```

## 2. One-time server preparation

```bash
sudo useradd --system --home /opt/taoling-gallery --shell /usr/sbin/nologin taoling
sudo mkdir -p /opt/taoling-gallery/releases /var/lib/taoling-gallery/uploads /etc/taoling-gallery
sudo chown -R taoling:taoling /opt/taoling-gallery /var/lib/taoling-gallery
sudo install -m 600 /dev/null /etc/taoling-gallery/server.env
```

把生产变量写入 `/etc/taoling-gallery/server.env`。至少填写数据库、`JWT_SECRET`、管理员初始密码、Cookie、CORS、`APP_URL`；密钥不进入 Git、压缩包或终端截图。

如果某个数据库密码、管理员密码或 JWT 密钥曾出现在公开 Git 历史中，必须先在对应系统轮换。仅从最新文件删除字符串不能让旧凭据失效；重写历史也不能替代轮换。

## 3. Build artifacts locally or in CI

```bash
cd taoling-gallery
npm ci
npm run build

cd ../taoling-gallery-server
npm ci --omit=dev
npm run check
```

发布包只包含：

- `taoling-gallery/dist/`
- `taoling-gallery-server/src/`
- `taoling-gallery-server/package.json`
- `taoling-gallery-server/package-lock.json`

不包含 `.env`、`node_modules`、`uploads`、日志或数据库导出。

## 4. Install a release

下面以 `RELEASE_ID` 表示本次提交 SHA 或时间戳：

```bash
sudo mkdir -p /opt/taoling-gallery/releases/RELEASE_ID
sudo tar -xzf taoling-gallery-release.tar.gz -C /opt/taoling-gallery/releases/RELEASE_ID
sudo ln -s /var/lib/taoling-gallery/uploads \
  /opt/taoling-gallery/releases/RELEASE_ID/taoling-gallery-server/uploads
sudo chown -R taoling:taoling /opt/taoling-gallery/releases/RELEASE_ID
sudo ln -sfn /opt/taoling-gallery/releases/RELEASE_ID /opt/taoling-gallery/current
```

这一步不会删除 `/var/lib/taoling-gallery/uploads`。如果目标 release 已存在，停止并使用新的 release ID，不在原目录覆盖解压。

## 5. Install service and Nginx

```bash
sudo install -m 644 ops/systemd/taoling-gallery.service /etc/systemd/system/taoling-gallery.service
sudo install -m 644 ops/nginx/taoling-gallery.conf /etc/nginx/conf.d/taoling-gallery.conf
sudo install -m 755 ops/scripts/healthcheck.sh /usr/local/bin/taoling-gallery-healthcheck

sudo systemctl daemon-reload
sudo systemctl enable --now taoling-gallery
sudo nginx -t
sudo systemctl reload nginx
```

首次上线前使用 Certbot 或阿里云证书补齐 HTTPS；完成证书配置前不要把 Live Demo 标为可用。

## 6. Acceptance checklist

```bash
sudo systemctl --no-pager --full status taoling-gallery
curl -fsS http://127.0.0.1:3000/health
curl -fsS https://YOUR_DOMAIN/health
curl -I https://YOUR_DOMAIN/
curl -I https://YOUR_DOMAIN/uploads/KNOWN_FILE
sudo nginx -t
journalctl -u taoling-gallery -n 100 --no-pager
```

浏览器验收：

1. 游客打开首页、图库、详情。
2. 登录后刷新页面仍保持会话；Cookie 为 HttpOnly，生产环境为 Secure。
3. 收藏、下载、个人中心和留言路径可用。
4. 助手出现 `start → tools/delta → done`，Nginx 不缓冲 SSE。
5. 管理员能看到统计并上传图片。
6. 发布新 release 后，旧上传图片 URL 仍返回 200。

截图只能保留命令、服务名、HTTP 状态和时间；遮盖公网 IP、域名中不便公开的部分、用户名、Cookie、数据库地址和任何密钥。

## 7. Rollback

```bash
sudo ln -sfn /opt/taoling-gallery/releases/PREVIOUS_RELEASE /opt/taoling-gallery/current
sudo systemctl restart taoling-gallery
/usr/local/bin/taoling-gallery-healthcheck
```

回滚不处理 `/var/lib/taoling-gallery/uploads`。数据库变更必须采用向后兼容的 expand/contract 策略；若迁移不可逆，发布前单独准备数据库回滚方案。

## 8. Server acceptance record

| Item | Status | Evidence |
| --- | --- | --- |
| systemd active | Pending | 待真实服务器截图 |
| local health endpoint | Verified locally | `GET /health` 返回 `status=ok` |
| public HTTPS | Pending | 当前预留域名不可访问 |
| Nginx config test | Pending | 待服务器执行 `nginx -t` |
| upload persistence across release | Design verified | 见 incident 001；待新 runbook 再验收 |
| SSE through Nginx | Pending | 本地已验证，待公网链路验证 |

验收完成后更新此表、README Live Demo 和 `docs/images/07-deploy.png`；在此之前不宣称生产部署已完成。

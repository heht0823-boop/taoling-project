# Incident: deployment overwrote uploaded files

## Situation

早期后端把运行时上传文件放在 `src/uploads`。自动部署为了替换后端代码会执行 `rm -rf src`，因此代码发布与用户数据删除落在同一个目录边界内。

## Task

发布任何新版本都不能删除已经上传的图片；同时不能把生产图片提交到 Git 或打进 release 包。

## Action

- 对照部署脚本、静态文件路由和 Multer 路径，确认 `rm -rf src` 是直接触发条件。
- 将 `uploads` 从 `src/uploads` 迁移到后端项目根目录，移出源码替换范围。
- 同步修改上传中间件、图片 URL 和图片变体服务的路径。
- `.gitignore` 递归忽略运行时图片，只保留 `.gitkeep`。
- 部署包只包含 `src` 与依赖清单，发布脚本显式保留 `uploads`。
- 新 systemd runbook 进一步把真实目录放在 `/var/lib/taoling-gallery/uploads`，release 内只保留软链接。

## Result

后续替换 `src` 不再覆盖运行时图片，项目形成了“release code / environment config / runtime data”三类资产的明确所有权。关键修复可回溯到提交 [`af5d037`](https://github.com/heht0823-boop/taoling-project/commit/af5d037)。

本复盘不声称已经完成新的 systemd 公网部署；跨 release 持久化仍需按 [部署验收清单](../deployment.md#6-acceptance-checklist) 在真实服务器再次验证。

## What I learned

运行时数据不应跟版本发布目录耦合。目录边界本身就是部署契约：可以被整体删除的 release 目录只能包含可重建内容。生产环境进一步可以把图片迁移到 OSS/S3，但对象存储同样需要独立的生命周期、权限和备份策略。

## Prevention

- release 包清单采用允许列表，不包含 `.env`、`uploads` 或日志。
- 健康检查之外增加“已知上传文件仍可访问”的发布后验收。
- 回滚只切换 `current` 链接，不回滚或删除运行时数据。
- 删除、迁移 uploads 的脚本必须单独审批，不能藏在普通代码发布中。

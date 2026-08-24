# 桃灵图库作品简介与仓库元数据

本文案用于 GitHub About、置顶项目、简历和作品集。数字仅描述已验证功能，不包含用户量、性能或并发推测。

## GitHub About

**Description（建议）：**

> Vue 3 + TypeScript 前后端分离 AI 图库：检索筛选、收藏下载、管理后台、天气缓存与可调用真实图库数据的 SSE 桃灵助手。

**Website：** 线上 HTTPS 验收完成后再填写；当前留空。

**Topics：**

```text
vue3 typescript vite pinia express mysql sequelize image-gallery sse ai-assistant nginx systemd aliyun
```

## One-line portfolio summary

桃灵图库是一个面向个人 AI 图片资产管理与发现的全栈项目，覆盖用户端、管理端、图片处理、外部天气缓存和真实数据库驱动的流式智能助手。

## 80–120 word summary

桃灵图库采用 Vue 3、TypeScript、Pinia 和 Express/MySQL 构建前后端分离的个人 AI 图片平台。游客可以检索、筛选和查看图片，登录用户可以收藏、下载、维护个人资料并使用桃灵助手，管理员负责图片、分类标签、用户、留言和统计。项目重点不是页面数量，而是工程闭环：上传文件与发布目录解耦，列表使用图片变体与缓存，天气 API 使用数据库 TTL 和旧缓存兜底，助手通过 SSE 返回流式结果，并由后端工具查询真实图库，避免模型伪造图片。

## Resume bullets

- 设计并实现 Vue 3 + TypeScript + Pinia 前端和 Express + Sequelize + MySQL 后端，覆盖图库检索、详情、收藏下载、个人中心和管理后台。
- 将运行时 uploads 移出源码发布替换范围，修复发布覆盖用户文件问题，并沉淀 release/config/runtime data 分离约束和回滚 runbook。
- 为天气接口加入 MySQL TTL 缓存、主动刷新、旧缓存和本地兜底状态，减少重复外部请求并提高故障可解释性。
- 实现 SSE 桃灵助手，通过后端图库工具返回真实数据库图片 ID；模型服务不可用时以确定性规则完成热门、最新和搜索意图。
- 将分页列表的选中对象从当前页 options 解耦，修复跨页筛选和回显状态丢失问题。

## Interview walkthrough (2–3 minutes)

1. 首页：说明项目定位和三种角色边界。
2. 图库：演示搜索、比例/分类筛选、分页和缩略图兜底。
3. 详情：演示收藏、下载和相关推荐闭环。
4. 助手：输入“给我看热门图片”，指出 `start/tools/delta/done` 和真实图片 ID。
5. 天气：展示缓存状态、刷新和 stale/fallback 设计。
6. 管理端：展示统计、上传、分类标签、用户和操作日志。
7. 工程证据：打开 incidents、API contract 和 deployment runbook，而不是只展示页面。

## Search keywords

中文：`Vue3 全栈项目`、`TypeScript 图库`、`SSE 流式助手`、`图片处理`、`天气缓存`、`Nginx systemd 部署`、`阿里云项目`。

English: `Vue 3 TypeScript gallery`, `SSE AI assistant`, `Express MySQL`, `image pipeline`, `weather cache`, `Nginx systemd deployment`.

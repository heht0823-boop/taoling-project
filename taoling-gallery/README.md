# 桃灵图库前端

Vue 3 + TypeScript + Vite 单页应用。页面数据遵守 `apis → Pinia stores → views`，包含首页、图库、详情、桃灵助手、天气、用户中心和管理后台。

项目总览、截图、架构与工程复盘请从 [根 README](../README.md) 开始。

## Requirements

- Node.js `20.19+` 或 `22.12+`
- 已启动的后端：`http://localhost:3000`

## Environment

```bash
cp .env.example .env.development
```

开发联调时把 `VITE_API_BASE_URL` 设置为 `http://localhost:3000/api`；生产环境使用同源 `/api`。

## Commands

```bash
npm ci
npm run dev
npm run type-check
npm run build
```

默认入口：`http://localhost:5173/home`。

## Important boundaries

- 页面不直接调用 Axios 或导入 API 模块。
- 图片列表使用缩略图，详情页使用原图或详情预览。
- 游客、普通用户和管理员的路由权限由统一守卫处理。
- 不包含投稿、关注、点赞、评论、粉丝等社区业务。

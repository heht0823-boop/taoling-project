# 桃灵图库稳定 API 契约

本文档定义当前 Node.js 基线与未来 FastAPI 后端之间的兼容边界。完整字段示例仍以 [Node API 文档](../taoling-gallery-server/docs/API.md) 为准；这里记录不能在重构中随意改变的协议。

## 1. Base conventions

- Base path: `/api`
- JSON response: `Content-Type: application/json; charset=utf-8`
- Time values: ISO 8601 字符串；展示时由前端本地化。
- IDs: JSON number；URL path 中使用十进制文本。
- Authentication: HttpOnly Cookie，默认名 `taoling_auth`。
- Browser requests: `credentials: include`。

### Success envelope

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

`code` 与 HTTP 状态语义保持一致。创建成功可返回 HTTP/业务码 `201`。

### Error envelope

```json
{
  "code": 400,
  "message": "面向调用方的错误说明",
  "data": {}
}
```

后端不得返回 HTML 错误页。`401` 表示未登录或会话过期，`403` 表示已登录但权限不足，`404` 表示资源不存在，`409` 表示唯一性或状态冲突，`422` 用于 FastAPI 时也必须转换为上述 envelope。

### Pagination

```json
{
  "list": [],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 0,
    "totalPages": 0
  }
}
```

请求参数为 `page`、`pageSize`；后端必须返回规范化后的实际值。筛选变化由前端把 `page` 重置为 1，但选中对象不依赖当前页 options。

## 2. Stable endpoint surface

| Domain | Method | Path | Auth |
| --- | --- | --- | --- |
| Health | GET | `/health` | Public |
| Auth | POST | `/api/auth/register` | Public |
| Auth | POST | `/api/auth/login` | Public |
| Auth | POST | `/api/auth/logout` | Cookie |
| Auth | GET | `/api/auth/me` | Cookie |
| Gallery | GET | `/api/images` | Optional cookie |
| Gallery | GET | `/api/images/:id` | Optional cookie |
| Gallery | GET | `/api/images/:id/thumbnail` | Public |
| Gallery | POST | `/api/images/:id/view` | Optional cookie |
| Gallery | GET | `/api/images/:id/related` | Optional cookie |
| Taxonomy | GET | `/api/categories` | Public |
| Taxonomy | GET | `/api/tags` | Public |
| Favorite | POST | `/api/images/:id/favorite` | User |
| Favorite | DELETE | `/api/images/:id/favorite` | User |
| Favorite | GET | `/api/user/favorites` | User |
| Download | POST | `/api/images/:id/download` | User |
| Download | GET/DELETE | `/api/user/downloads` | User |
| Profile | GET | `/api/user/profile/summary` | User |
| Profile | PUT/PATCH | `/api/user/profile` | User |
| Messages | GET/POST | `/api/user/messages` | User |
| Assistant | POST | `/api/ai/chat` | User |
| Assistant | GET/POST | `/api/ai/conversations` | User |
| Assistant | GET | `/api/ai/conversations/:id/messages` | User |
| Assistant | DELETE | `/api/ai/conversations/:id` | User |
| Weather | GET | `/api/weather/live` | Public |
| Weather | GET | `/api/weather/live/batch` | Public |
| Weather | GET | `/api/weather/forecast` | Public |
| Weather | GET | `/api/weather/24h` | Public |
| Admin | GET | `/api/admin/dashboard/stats` | Admin |
| Admin | GET | `/api/admin/logs` | Admin |
| Admin images | POST/GET | `/api/admin/images` | Admin |
| Admin images | GET/PUT/PATCH/DELETE | `/api/admin/images/:id` | Admin |
| Admin taxonomy | CRUD | `/api/admin/categories/*`, `/api/admin/tags/*` | Admin |
| Admin users | GET/PATCH | `/api/admin/users/*` | Admin |
| Admin messages | GET/POST/DELETE | `/api/admin/messages/*` | Admin |

兼容别名 `/api/user/ai/*` 在 Node 基线中保留，但新前端统一使用 `/api/ai/*`；FastAPI 迁移期间至少保留一个版本周期。

## 3. Image contract

公开图片最小字段：

```json
{
  "id": 1,
  "title": "string",
  "description": "string or null",
  "image_url": "https://host/uploads/file.webp",
  "thumbnail_url": "https://host/uploads/variants/file-420w.webp",
  "aspect_ratio": "1:1",
  "category": { "id": 1, "name": "string" },
  "tags": [{ "id": 1, "name": "string", "color": "#RRGGBB" }],
  "view_count": 0,
  "download_count": 0,
  "favorite_count": 0,
  "is_favorited": false,
  "created_at": "ISO-8601"
}
```

- 列表使用 `thumbnail_url`，详情和下载使用 `image_url`。
- `category` 可为 `null`，`tags` 必须为数组。
- URL 必须能通过同源 `/uploads` 或绝对 HTTPS URL 访问。
- 上传表单字段和尺寸限制在迁移前由契约测试固定；运行时文件不能写入 release 目录。

## 4. Weather cache contract

天气接口支持 `refresh=true|1` 绕过有效缓存。响应的业务数据可附带：

- `source`: `amap` 或 `fallback`
- `cacheStatus`: `cache`、`refreshed`、`stale`、`fallback`
- `cachedAt`, `cacheExpiresAt`
- `fallbackReason`

外部服务失败但存在旧缓存时，接口应返回可用数据和 `stale` 状态，而不是直接 500。

## 5. SSE assistant contract

流式请求：`POST /api/ai/chat?stream=true`

Request body:

```json
{
  "conversation_id": 123,
  "message": "给我看热门图片"
}
```

`conversation_id` 在新会话时可省略。响应头必须包含 `text/event-stream`、`Cache-Control: no-cache, no-transform` 和 `X-Accel-Buffering: no`。

事件顺序：

1. `start`: 会话 ID、标题、是否新会话。
2. `tools`（可选）: 后端真实工具结果。
3. `delta`（一个或多个）: 追加文本片段。
4. `done`: 完整结果。
5. `error`: 仅失败路径，包含标准错误 envelope 字段。

`done.data` 对应的结果必须包含：

```json
{
  "conversation_id": 123,
  "title": "string",
  "reply": "string",
  "recommended_tags": [],
  "recommended_images": [],
  "tool_results": []
}
```

`recommended_images` 中的记录必须来自数据库查询。模型返回的自由文本不能被转换成不存在的图片 ID。

## 6. FastAPI rewrite gates

FastAPI 后端替换 Node 基线前，必须满足：

- 对上述端点运行同一组黑盒回归测试。
- Cookie 名称、属性、登出清理行为和 CORS 一致。
- JSON 字段使用当前 snake_case，不把 Pydantic 验证错误原样暴露给前端。
- 分页、空数组、null 和错误状态一致。
- SSE 事件名、顺序、终止行为以及 Nginx 禁止缓冲配置一致。
- MySQL 表和运行时 uploads 可原地复用或提供可回滚迁移。
- 在创建 `v1.0-node` 标签后再开始替换；标签只用于回溯。

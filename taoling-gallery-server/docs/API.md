# 桃灵图库后端接口文档

## 1. 通用规范

- 基础地址：`/api`
- Token 请求头：`Authorization: Bearer <jwt_token>`
- 游客接口：不传 token 时以游客身份访问；传 token 时会解析收藏状态（部分接口使用 `optionalAuth` 中间件）。
- 用户接口：需要普通用户或管理员 token。
- 管理员接口：需要 `role = admin` 的 token。

### 统一响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {}
}
```

### 分页响应格式

```json
{
  "code": 200,
  "message": "success",
  "data": {
    "list": [],
    "pagination": {
      "page": 1,
      "pageSize": 12,
      "total": 100
    }
  }
}
```

### 常见错误码

| 状态码 | 含义                          |
| ------ | ----------------------------- |
| 400    | 参数错误                      |
| 401    | 未登录或登录失效              |
| 403    | 权限不足                      |
| 404    | 数据不存在                    |
| 409    | 数据冲突（唯一字段重复等）    |
| 500    | 服务器内部错误                |
| 502    | AI 服务调用失败               |
| 503    | 服务未就绪（如 sharp 未安装） |
| 504    | AI 服务响应超时               |

---

## 2. Auth 认证

### POST `/api/auth/register`

- Token：不需要
- Body JSON：
  - `username` 必填，用户名，唯一。
  - `password` 必填，密码，至少 6 位。
  - `email` 可选，邮箱，唯一。
- 响应 `data`：

```json
{
  "id": 1,
  "username": "hetao",
  "email": "test@example.com",
  "role": "user"
}
```

### POST `/api/auth/login`

- Token：不需要
- Body JSON：
  - `account` 必填，用户名或邮箱。
  - `password` 必填，密码。
- 响应 `data`：

```json
{
  "token": "jwt_token_here",
  "user": {
    "id": 1,
    "username": "hetao",
    "email": "test@example.com",
    "role": "admin",
    "status": "normal",
    "avatar_url": "https://example.com/avatar.png",
    "avatar_thumbnail_url": "https://example.com/avatar.png?x-oss-process=image/resize,w_80,h_80,m_lfit/format,webp",
    "avatar_srcset": "https://example.com/avatar.png?x-oss-process=image/resize,w_80,h_80,m_lfit/format,webp 1x, https://example.com/avatar.png?x-oss-process=image/resize,w_160,h_160,m_lfit/format,webp 2x",
    "last_login_at": "2026-06-04T12:00:00.000Z",
    "created_at": "2026-06-01T02:00:00.000Z"
  },
  "stats": {
    "favorite_count": 12,
    "download_count": 8,
    "view_count": 36,
    "ai_conversation_count": 5,
    "ai_message_count": 42
  }
}
```

### POST `/api/auth/logout`

- Token：需要
- Body：无
- 响应 `data`：`{}`

### GET `/api/auth/me`

- Token：需要
- 响应 `data`：结构同登录接口，包含 `user` 和 `stats`。

---

## 3. 前台图库

### GET `/api/images`

- Token：可选（传 token 时返回 `is_favorited` 收藏状态）
- Query：
  - `page` 可选，页码，默认 `1`。
  - `pageSize` 可选，每页数量，默认 `12`，最大 `100`。
  - `keyword` 可选，模糊匹配图片标题、描述、标签名。
  - `categoryId` / `category_id` 可选，分类 ID。
  - `tagIds` / `tag_ids` / `tag_id` 可选，标签 ID，多个用英文逗号分隔。
  - `aspect_ratio` 可选，图片比例，例如 `1:1`。
  - `sort` 可选，`latest` | `hot` | `downloads` | `favorites` | `weight`。
- 规则：仅返回 `status = public` 且 `deleted_at IS NULL` 的图片。
- 响应 `list[]` 字段：

```json
{
  "id": 1,
  "title": "霓虹幻影少女",
  "description": "AI 生成的赛博风少女图片",
  "image_url": "https://example.com/image.jpg",
  "thumbnail_url": "https://example.com/api/images/1/thumbnail?w=420&format=webp&q=78",
  "aspect_ratio": "1:1",
  "category": { "id": 1, "name": "人物肖像" },
  "tags": [{ "id": 1, "name": "赛博朋克", "color": "#ff8bb3" }],
  "view_count": 1200,
  "download_count": 342,
  "favorite_count": 856,
  "is_favorited": false,
  "created_at": "2026-06-01T02:00:00.000Z"
}
```

### GET `/api/images/:id`

- Token：可选
- Params：`id` 必填，图片 ID。
- 规则：仅返回公开（`status = public`）且未删除的图片。
- 响应 `data`：同图片列表单项完整字段。
- 说明：详情页使用 `image_url` 原图；列表、推荐卡片、收藏卡片使用 `thumbnail_url`。

### GET `/api/images/:id/thumbnail`

- Token：可选
- Params：`id` 必填，图片 ID。
- Query：
  - `w` / `width` 可选，默认 `420`，范围 `32~2000`。
  - `format` 可选，默认 `webp`，支持 `webp` | `avif` | `jpg` | `png`。
  - `q` / `quality` 可选，默认 `78`，范围 `35~95`。
- 规则：
  - 本地上传图片：安装 `sharp` 后动态生成并缓存缩略图文件，返回 `Content-Type: image/webp` 等。
  - 远程对象存储图片：配置 `IMAGE_OPTIMIZER_QUERY_TEMPLATE` 后 302 重定向到对象存储压缩变体。
  - 未安装 `sharp` 且未配置对象存储图片处理时返回 `503`。
- 用途：前端列表、瀑布流、AI 推荐图卡片优先使用本接口或 `thumbnail_url`，不要直接使用 `image_url` 原图。
- 响应头：`Cache-Control: public, max-age=2592000, immutable`（30天缓存）。

### POST `/api/images/:id/view`

- Token：可选
- Params：`id` 必填，图片 ID。
- Body JSON：
  - `visitor_id` 可选，游客 UUID，用于非登录用户的浏览去重。
- 响应 `data`：

```json
{
  "image_id": 1,
  "view_count": 1201
}
```

### GET `/api/images/:id/related`

- Token：可选
- Params：`id` 必填，当前图片 ID。
- Query：`limit` 可选，默认 `6`，最大 `20`。
- 规则：根据当前图片的标签和分类匹配相似图片。
- 响应 `data`：图片数组，字段同图片列表单项。

### GET `/api/categories`

- Token：可选
- 响应 `data[]`：

```json
{
  "id": 1,
  "name": "自然风景",
  "sort_order": 100
}
```

### GET `/api/tags`

- Token：可选
- Query：
  - `keyword` 可选，标签名模糊搜索。
  - `limit` 可选，默认 `50`，最大 `100`。
- 响应 `data[]`：

```json
{
  "id": 1,
  "name": "赛博朋克",
  "color": "#ff8bb3",
  "usage_count": 8200
}
```

### GET `/api/messages`

- Token：可选（传 token 时用户信息更准确，不传也能访问）
- Query：
  - `page` 可选，页码，默认 `1`。
  - `pageSize` 可选，每页数量，默认 `12`。
  - `parent_id` 可选，传父留言 ID 时只查看该留言下审核通过的回复；不传时返回顶级留言板。
- 规则：只返回 `check_status = success` 且未删除的留言；`pending` 和 `block` 不会出现。
- 响应 `list[]`：

```json
{
  "id": 1,
  "user_id": 1,
  "user": {
    "id": 1,
    "username": "hetao",
    "avatar_url": "https://example.com/avatar.png"
  },
  "parent_id": null,
  "content": "很喜欢这张图",
  "created_at": "2026-06-06T02:00:00.000Z",
  "updated_at": "2026-06-06T02:00:00.000Z",
  "replies": []
}
```

---

## 4. 收藏

### POST `/api/images/:id/favorite`

- Token：需要
- Params：`id` 必填，图片 ID。
- 响应 `data`：

```json
{
  "image_id": 1,
  "is_favorited": true,
  "favorite_count": 321
}
```

### DELETE `/api/images/:id/favorite`

- Token：需要
- Params：`id` 必填，图片 ID。
- 响应 `data`：同添加收藏接口，`is_favorited` 为 `false`。
- 说明：如果未收藏过该图片，接口不会报错，直接返回当前状态。

### GET `/api/user/favorites`

- Token：需要
- Query：`page`、`pageSize`
- 响应 `list[]`：

```json
{
  "favorite_id": 1,
  "created_at": "2026-06-04T02:00:00.000Z",
  "image": {
    "id": 1,
    "title": "精灵低语",
    "thumbnail_url": "https://example.com/thumb.jpg",
    "image_url": "https://example.com/image.jpg",
    "view_count": 3400,
    "download_count": 1200,
    "favorite_count": 856
  }
}
```

### POST `/api/user/favorites`

- Token：需要
- Body JSON：`image_id` 必填，图片 ID。
- 功能同 `POST /api/images/:id/favorite`，兼容路径。

### DELETE `/api/user/favorites/:imageId`

- Token：需要
- Params：`imageId` 必填，图片 ID。
- 功能同 `DELETE /api/images/:id/favorite`，兼容路径。

---

## 5. 下载

### POST `/api/images/:id/download`

- Token：需要
- Params：`id` 必填，图片 ID。
- 响应 `data`：

```json
{
  "image_id": 1,
  "download_url": "https://example.com/image.jpg",
  "download_count": 893
}
```

### GET `/api/user/downloads`

- Token：需要
- Query：`page`、`pageSize`
- 响应 `list[]`：

```json
{
  "id": 1,
  "image_id": 10,
  "image_title": "水晶岛屿概念图",
  "image_url": "https://example.com/image.jpg",
  "created_at": "2026-06-04T02:00:00.000Z"
}
```

### DELETE `/api/user/downloads/:recordId`

- Token：需要
- Params：`recordId` 必填，下载记录 ID。
- 响应 `data`：`{}`

### DELETE `/api/user/downloads`

- Token：需要
- 说明：清空当前用户所有下载记录。
- 响应 `data`：`{}`

### POST `/api/user/downloads`

- Token：需要
- Body JSON：`image_id` 必填，图片 ID。
- 功能同 `POST /api/images/:id/download`，兼容路径。

---

## 6. 用户中心

### GET `/api/user/profile`

- Token：需要
- 响应 `data`：结构同 `/api/auth/me`，包含 `user` 和 `stats`。

### GET `/api/user/profile/summary`

- Token：需要
- 响应 `data`：同 `/api/user/profile`。

### PUT `/api/user/profile` / PATCH `/api/user/profile`

- Token：需要
- Body JSON（所有字段均可选，至少提交一个）：
  - `username` 可选，新的用户名。
  - `email` 可选，新的邮箱。
  - `avatar_url` 可选，头像地址。
- 响应 `data`：更新后的 `user` 和 `stats`。

### PATCH `/api/user/password`

- Token：需要
- Body JSON：
  - `old_password` 必填，旧密码。
  - `new_password` 必填，新密码，至少 6 位。
- 响应 `data`：`{}`

### POST `/api/user/profile/avatar` / PATCH `/api/user/profile/avatar`

- Token：需要
- Content-Type：`multipart/form-data`（上传文件）或 `application/json`（传入外链地址）
- Form（上传文件时）：
  - `file` 必填，头像图片，支持 jpg / png / webp。
- Body JSON（传入外链时）：
  - `avatar_url` 必填，头像图片公网地址。
- 说明：头像最终存储到本地 `/uploads` 目录；本地上传直接保存，远程链接会下载后保存。
- 响应 `data`：

```json
{
  "user": {
    "id": 1,
    "username": "hetao",
    "avatar_url": "http://localhost:3000/uploads/avatar.jpg",
    "avatar_thumbnail_url": null,
    "avatar_srcset": null
  },
  "stats": {
    "favorite_count": 0,
    "download_count": 0,
    "view_count": 0,
    "ai_conversation_count": 0,
    "ai_message_count": 0
  },
  "avatar_upload": {
    "avatar_url": "http://localhost:3000/uploads/avatar.jpg",
    "avatar_thumbnail_url": null,
    "avatar_srcset": null,
    "processor_enabled": false
  }
}
```

头像性能说明：

- `avatar_url` 保留原图，适合个人资料详情或下载。
- 头像组件应优先使用 `avatar_thumbnail_url`，并把 `avatar_srcset` 放到 `<img srcset>`，避免小头像下载大图。
- `processor_enabled` 为 `false` 表示当前环境未安装 `sharp`；安装 `npm install sharp` 后会自动生成本地 80/160 头像缩略图变体。
- 如果图片存储在 CDN/OSS，需在 `.env` 配置图片处理模板：

```env
IMAGE_OPTIMIZER_QUERY_TEMPLATE=x-oss-process=image/resize,w_{width},h_{height},m_lfit/format,{format}
IMAGE_OPTIMIZER_FORMAT=webp
IMAGE_OPTIMIZER_QUALITY=78
```

### GET `/api/user/messages`

- Token：需要
- Query：`page`、`pageSize`
- 规则：返回当前用户审核通过的留言（`check_status = success`）。
- 响应：当前用户留言分页列表。

### POST `/api/user/messages`

- Token：需要
- Body JSON：
  - `content` 必填，留言内容，最多 2000 字。
  - `parent_id` 可选，父留言 ID。
- 规则：留言先保存为 `pending` 状态，随后异步调用阿里云文本内容安全审核；审核通过后更新为 `success`，违规更新为 `block`。用户端只收到提交确认，不返回审核详情。
- 响应 `data`：

```json
{
  "submitted": true
}
```

---

## 7. AI 助手

AI 助手已接入阿里云百炼 DashScope OpenAI 兼容接口。运行前需要在 `.env` 配置：

- `DASHSCOPE_API_KEY` 必填，百炼 API Key。
- `DASHSCOPE_BASE_URL` 可选，默认 `https://dashscope.aliyuncs.com/compatible-mode/v1`。
- `DASHSCOPE_MODEL` 可选，默认 `qwen-plus`。
- `AI_TIMEOUT_MS` 可选，默认 `30000`。

> **注意**：AI 聊天仅支持纯文本消息，不支持图片上传、图片识别或图片审核。如需引用图库图片，请在文本中直接描述，助手会从图库中检索匹配。

### POST `/api/ai/chat`

- Token：需要
- Query：`stream` 可选，默认 `true` 使用 SSE 流式输出；传 `false` 时返回普通 JSON。
- Body JSON：
  - `conversation_id` 可选，会话 ID，不传则自动创建新会话。
  - `message` 必填，用户文本消息。

**流式请求示例：**

```json
{
  "conversation_id": 1,
  "message": "帮我找治愈风水彩小猫图片"
}
```

流式响应说明：

- Content-Type：`text/event-stream; charset=utf-8`
- 事件类型：
  - `start` → `{ conversation_id, title, is_new, default_stream }`
  - `delta` → `{ "delta": "增量文本" }`，前端按顺序拼接为完整回复。
  - `tools` → `{ "results": [...] }`，模型识别到图库工具意图时的后端执行结果。
  - `done` → 完整结果，字段同非流式响应。
  - `error` → `{ "code": 500, "message": "错误提示", "data": {} }`

**非流式请求示例：**

```json
{
  "message": "帮我找治愈风水彩小猫图片",
  "stream": false
}
```

非流式响应 `data`：

```json
{
  "conversation_id": 1,
  "title": "治愈风小猫插画",
  "reply": "我根据你的描述找到了一些相关灵感图片，你可以从这些作品继续筛选。",
  "recommended_tags": ["治愈系", "水彩风"],
  "recommended_images": [
    {
      "id": 1,
      "title": "春天小猫水彩插画",
      "thumbnail_url": "https://example.com/thumb.jpg",
      "image_url": "https://example.com/image.jpg",
      "detail_url": "/images/1",
      "is_favorited": false
    }
  ],
  "tool_results": []
}
```

说明：

- 桃灵助手不提供图片生成、绘图或修图能力。用户提出图片生成需求时，助手会引导改为图库搜索或留言给管理员。
- AI 可识别"热门图片""最新发布""按分类/标签搜索""加入收藏"等意图，调用后端工具执行。
- 只要 AI 推荐了图片，回复末尾会补充"需要把这些图片加入收藏吗？"。
- 新会话标题由大模型基于首条消息和首次回复自动生成；失败时使用默认标题"新的对话"。
- 对话记忆分为会话短期记忆和用户长期偏好记忆，后端会定期基于历史消息摘要压缩后携带给大模型。

### GET `/api/ai/conversations`

- Token：需要
- 响应 `data[]`：

```json
{
  "id": 1,
  "title": "治愈风小猫插画",
  "created_at": "2026-06-06T02:00:00.000Z",
  "updated_at": "2026-06-06T02:05:00.000Z"
}
```

### POST `/api/ai/conversations`

- Token：需要
- Body JSON：`title` 可选，会话标题，默认"新的对话"。
- 响应 `data`：`id`、`title`、`created_at`、`updated_at`。

### GET `/api/ai/conversations/:conversationId/messages`

- Token：需要
- Params：`conversationId` 必填，会话 ID。
- 响应 `data[]`：

```json
{
  "id": 1,
  "role": "assistant",
  "content": "我根据你的描述找到了一些灵感图片...",
  "recommended_tags": ["治愈系"],
  "recommended_image_ids": [1, 2],
  "recommended_images": [
    {
      "id": 1,
      "title": "春天小猫水彩插画",
      "thumbnail_url": "https://example.com/thumb.jpg",
      "detail_url": "/images/1",
      "is_favorited": false
    }
  ],
  "created_at": "2026-06-06T02:05:00.000Z"
}
```

### DELETE `/api/ai/conversations/:conversationId`

- Token：需要
- Params：`conversationId` 必填，会话 ID。
- 说明：软删除，同时删除该会话下所有消息。
- 响应 `data`：`{}`

### DELETE `/api/ai/conversations`

- Token：需要
- 说明：清空当前用户所有 AI 会话及消息。
- 响应 `data`：`{}`

> 以上 AI 接口均同时支持 `/api/ai/*` 和 `/api/user/ai/*` 两套路径。

---

## 8. 管理员首页

### GET `/api/admin/dashboard/stats`

- Token：管理员
- 响应 `data`：

```json
{
  "image_count": 24592,
  "user_count": 8103,
  "total_view_count": 360000,
  "total_download_count": 142800,
  "total_favorite_count": 56012,
  "ai_conversation_count": 520
}
```

### GET `/api/admin/logs`

- Token：管理员
- Query：
  - `page` 可选。
  - `pageSize` 可选。
  - `action_type` 可选，按操作类型筛选。
  - `target_type` 可选，按目标类型筛选。
- 响应 `list[]`：`id`、`actor_id`、`actor_name`、`actor_role`、`action_type`、`target_type`、`target_id`、`title`、`content`、`ip_address`、`created_at`。

---

## 9. 管理员图片

### POST `/api/admin/files/images`

- Token：管理员
- Content-Type：`multipart/form-data`
- Form：`file` 必填，jpg / png / webp 图片，最大由 `UPLOAD_MAX_SIZE_MB` 控制。
- 响应 `data`：

```json
{
  "image_url": "http://localhost:3000/uploads/xxx.jpg",
  "thumbnail_url": "http://localhost:3000/uploads/variants/xxx-420w-q78.webp",
  "thumbnail_srcset": "http://localhost:3000/uploads/variants/xxx-420w-q78.webp 420w, http://localhost:3000/uploads/variants/xxx-520w-q78.webp 520w",
  "processor_enabled": true
}
```

- 规则：`image_url` 始终指向原图；`thumbnail_url` 是列表缩略图。若 `processor_enabled = false`，说明当前环境未安装 `sharp`，需前端自行处理缩略图。

### POST `/api/admin/images`

- Token：管理员
- Body JSON：
  - `title` 必填，图片标题。
  - `image_url` 必填，原图地址。
  - `description` 可选，图片描述。
  - `thumbnail_url` 可选，缩略图地址。
  - `category_id` / `categoryId` 可选，分类 ID。
  - `aspect_ratio` 可选，比例。
  - `status` 可选，`public` | `private` | `draft`，默认 `draft`。
  - `display_weight` 可选，展示权重，默认 `0`。
  - `tag_ids` / `tagIds` 可选，标签 ID 数组。
- 响应 `data`：图片完整字段，包含 `category`、`tags`、`tag_ids`。

### GET `/api/admin/images`

- Token：管理员
- Query：
  - `page`、`pageSize` 可选。
  - `keyword` 可选，搜索标题、描述、标签名。
  - `category_id` 可选。
  - `status` 可选，`public` | `private` | `draft` | `deleted`。
  - `tag_id` 可选。
  - `sort` 可选，`latest` | `views` | `downloads` | `favorites` | `weight`。
- 响应 `list[]`：图片列表字段，额外包含 `status`、`display_weight`、`deleted_at`。

### GET `/api/admin/images/:id`

- Token：管理员
- Params：`id` 必填。
- 响应 `data`：图片完整字段，包含 `tag_ids`。

### PUT `/api/admin/images/:id` / PATCH `/api/admin/images/:id`

- Token：管理员
- Params：`id` 必填。
- Body JSON：同创建图片，所有字段均可选。
- 响应 `data`：更新后的图片完整字段。

### PATCH `/api/admin/images/:id/status`

- Token：管理员
- Body JSON：`status` 必填，`public` | `private` | `draft` | `deleted`。
- 响应 `data`：更新后的图片完整字段。

### DELETE `/api/admin/images/:id`

- Token：管理员
- 说明：软删除，写入 `status = deleted` 和 `deleted_at`。
- 响应 `data`：`{}`

### PATCH `/api/admin/images/:id/restore`

- Token：管理员
- Body JSON：`status` 可选，恢复后的状态，`draft` | `private` | `public`，默认 `draft`。
- 响应 `data`：恢复后的图片完整字段。

---

## 10. 管理员分类

### GET `/api/admin/categories`

- Token：管理员
- Query：`keyword`、`status`、`page`、`pageSize` 均可选。
- 响应 `list[]`：`id`、`name`、`sort_order`、`status`、`image_count`、`created_at`、`updated_at`、`deleted_at`。

### POST `/api/admin/categories`

- Token：管理员
- Body JSON：`name` 必填，`sort_order` 可选（默认 0），`status` 可选（默认 `normal`）。
- 响应 `data`：分类完整字段。

### PUT `/api/admin/categories/:id` / PATCH `/api/admin/categories/:id`

- Token：管理员
- Body JSON：`name`、`sort_order`、`status` 均可选。
- 响应 `data`：更新后的分类完整字段。

### DELETE `/api/admin/categories/:id`

- Token：管理员
- 规则：如果该分类下仍有图片，不允许删除。
- 响应 `data`：`{}`

---

## 11. 管理员标签

### GET `/api/admin/tags`

- Token：管理员
- Query：`keyword`、`status`、`page`、`pageSize` 均可选。
- 响应 `list[]`：`id`、`name`、`color`、`usage_count`、`status`、`created_at`、`updated_at`、`deleted_at`。

### POST `/api/admin/tags`

- Token：管理员
- Body JSON：`name` 必填，`color` 可选（前景色），`status` 可选（默认 `normal`）。
- 响应 `data`：标签完整字段。

### PUT `/api/admin/tags/:id` / PATCH `/api/admin/tags/:id`

- Token：管理员
- Body JSON：`name`、`color`、`status` 均可选。
- 响应 `data`：更新后的标签完整字段。

### DELETE `/api/admin/tags/:id`

- Token：管理员
- 规则：如果该标签仍被图片关联使用，不允许删除。
- 响应 `data`：`{}`

---

## 12. 管理员用户

### GET `/api/admin/users`

- Token：管理员
- Query：
  - `page`、`pageSize` 可选。
  - `keyword` 可选，按用户名或邮箱模糊搜索。
  - `role` 可选，按角色筛选。
  - `status` 可选，`normal` | `disabled`。
- 响应 `list[]`：用户信息 + `stats` 统计字段。

### GET `/api/admin/users/:id`

- Token：管理员
- Params：`id` 必填。
- 响应 `data`：用户完整信息 + `stats`。

### PATCH `/api/admin/users/:id/status`

- Token：管理员
- Body JSON：`status` 必填，`normal` | `disabled`。
- 规则：管理员不能修改自己的状态。
- 响应 `data`：更新后的用户信息。

### DELETE `/api/admin/users/:id`

- Token：管理员
- 规则：管理员不能删除自己的账号。
- 说明：软删除，写入 `deleted_at` 和 `status = disabled`。
- 响应 `data`：`{}`

---

## 13. 管理员留言

### GET `/api/admin/messages`

- Token：管理员
- Query：
  - `page`、`pageSize` 可选。
  - `check_status` 可选，`pending` | `success` | `block`。
  - `parent_id` 可选，按父留言筛选。
  - `keyword` 可选，按内容模糊搜索。
- 响应 `list[]`：完整留言信息，包含关联用户信息和审核详情。

### GET `/api/admin/messages/:id`

- Token：管理员
- Params：`id` 必填。
- 响应 `data`：留言详情 + `replies` 回复列表。

### POST `/api/admin/messages/:id/replies`

- Token：管理员
- Params：`id` 必填，被回复的留言 ID。
- Body JSON：`content` 必填，回复内容，最多 2000 字。
- 规则：管理员回复直接标记为 `check_status = success`，无需审核。
- 响应 `data`：回复的留言对象。

### DELETE `/api/admin/messages/:id`

- Token：管理员
- 说明：逻辑屏蔽，将 `check_status` 更新为 `block`。
- 响应 `data`：更新后的留言信息。

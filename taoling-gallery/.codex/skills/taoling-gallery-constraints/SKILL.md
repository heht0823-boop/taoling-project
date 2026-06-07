---
name: taoling-gallery-constraints
description: Use this skill before any frontend development, refactor, page/component generation, routing, store, API, style, image gallery, Taoling Assistant, or admin-console work in the taoling-gallery project. It enforces the Taoling Gallery brand, business boundaries, Vue3 TypeScript architecture, SCSS theme, and validation requirements.
---

# Taoling Gallery Constraints

## Required First Step

Before making any code changes in this project, read the relevant sections of `references/project-constraints.md`.

Use this skill for every development task in `taoling-gallery`, including UI work, routing, stores, API modules, styles, assets, admin pages, user pages, and Taoling Assistant behavior. If the user request, an existing design, generated code, or implementation idea conflicts with the reference constraints, follow the reference constraints.

## Highest Priority Rules

- Keep all branding unified as `桃灵图库 / Taoling Gallery`.
- Preserve the light peach-pink-purple dreamy gallery theme: soft, healing, rounded, clean, lightly glassy, and not dark or cyberpunk.
- Do not introduce community features: user submissions, follows, followers, likes, comments, author pages, tips, private messages, PRO users, creator plans, user levels, or portfolios.
- Keep the real business loop: admin publishes and manages AI images; visitors browse and search; logged-in users favorite, download, view records, and use 桃灵助手; admins manage images, categories, tags, users, stats, and logs.
- Follow the strict data flow: `apis -> store -> pages`. Pages must not import API modules or call Axios directly.
- The backend service for development runs at `http://localhost:3000`; development API base must stay aligned with it, normally `VITE_API_BASE_URL=http://localhost:3000/api`.
- When a page feature uses backend data, verify the real endpoint in the browser/dev environment by calling it directly through the frontend request chain, and check whether the returned code, data shape, and field names match the page needs. Do not modify, restart, or debug the backend service for frontend page work unless the user explicitly asks.
- Use Vue3, TypeScript, Vite, Vue Router, Pinia, SCSS, Element Plus on demand, and Axios.
- Use `<script setup lang="ts">` and Composition API for Vue components.
- 桃灵角色 IP 必须固定使用项目内的透明本体资产与 `TaolingMascot` 动画组件；后续页面不得按设计稿里的白底圆牌、白色外框、文字徽章裁图使用，也不得用 CSS/插画重画成另一只角色。只允许在固定本体外叠加动作层、表情层、道具层和柔和关键帧。

## Development Workflow

1. Read the task and identify which constraint sections apply in `references/project-constraints.md`.
2. Before developing a page or feature that needs backend data, read the relevant part of `API.md` first. Identify the exact interfaces needed by the current page, confirm the backend document provides them, and only then register the matching `apis -> store -> pages` path.
3. Confirm `VITE_API_BASE_URL` points to the running backend base (`http://localhost:3000/api` in development) before interface-dependent page work.
4. During browser verification, call the real backend endpoints through the app/request wrapper and confirm response status, `code/message/data`, pagination, and field names. Treat backend behavior as fixed unless the user asks for backend work.
5. Do not connect every backend interface at once. Add API modules, store actions, types, composables, and page wiring only when the current task needs them.
6. Build project foundation early when it is not page-specific: environment files, router shell, Pinia setup, Axios request wrapper, base types, global SCSS theme, Element Plus setup, and shared infrastructure.
7. Inspect the existing implementation before editing.
8. Reuse existing components, styles, stores, composables, and types when possible.
9. Keep API wrappers in `src/apis`, state and async actions in `src/stores`, reusable logic in `src/composables`, shared UI in `src/components`, and pages in `src/views`.
10. Include loading, empty, error, permission, and login states for user-facing operations.
11. Respect image-site performance requirements: thumbnail lists, lazy loading, skeletons, failed-image fallbacks, pagination or scroll loading, and debounced search.
12. Validate with the project checks that are appropriate for the scope. For code changes, prefer `npm run type-check` and `npm run build` before delivery.

## Visual Direction

- Use soft backgrounds: cream white, pale peach, pale pink, light blue-purple gradients, and low-opacity glows.
- Use the peach-purple primary gradient for important actions.
- Use rounded soft cards with light shadows and generous spacing.
- Keep the admin console visually consistent with the user-facing Taoling theme; do not turn it into a traditional dark backend.
- Use 桃灵 as the AI image inspiration assistant and empty/permission/loading guide. Do not use Mira or old theme names.
- 桃灵出现时优先复用 `src/components/business/TaolingMascot.vue`，根据场景选择 `idle`、`welcome`、`search`、`happy`、`thinking`、`guide`、`loading`、`success`、`empty`、`permission`、`sleepy` 等状态，让页面有轻微、可爱、治愈的动态反馈。

## Reference

- Full project constraints: `references/project-constraints.md`
- Original user source in the repository root must be preserved: `codex约束提示词.txt`

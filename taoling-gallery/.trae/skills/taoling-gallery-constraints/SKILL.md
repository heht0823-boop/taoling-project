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
- Use Vue3, TypeScript, Vite, Vue Router, Pinia, SCSS, Element Plus on demand, and Axios.
- Use `<script setup lang="ts">` and Composition API for Vue components.

## Development Workflow

1. Read the task and identify which constraint sections apply in `references/project-constraints.md`.
2. Before developing a page or feature that needs backend data, read the relevant part of `API.md` first. Identify the exact interfaces needed by the current page, confirm the backend document provides them, and only then register the matching `apis -> store -> pages` path.
3. Do not connect every backend interface at once. Add API modules, store actions, types, composables, and page wiring only when the current development task needs them.
4. Build project foundation early when it is not page-specific: environment files, router shell, Pinia setup, Axios request wrapper, base types, global SCSS theme, Element Plus setup, and shared infrastructure.
5. Inspect the existing implementation before editing.
6. Reuse existing components, styles, stores, composables, and types when possible.
7. Keep API wrappers in `src/apis`, state and async actions in `src/stores`, reusable logic in `src/composables`, shared UI in `src/components`, and pages in `src/views`.
8. Include loading, empty, error, permission, and login states for user-facing operations.
9. Respect image-site performance requirements: thumbnail lists, lazy loading, skeletons, failed-image fallbacks, pagination or scroll loading, and debounced search.
10. Validate with the project checks that are appropriate for the scope. For code changes, prefer `npm run type-check` and `npm run build` before delivery.

## Visual Direction

- Use soft backgrounds: cream white, pale peach, pale pink, light blue-purple gradients, and low-opacity glows.
- Use the peach-purple primary gradient for important actions.
- Use rounded soft cards with light shadows and generous spacing.
- Keep the admin console visually consistent with the user-facing Taoling theme; do not turn it into a traditional dark backend.
- Use 桃灵 as the AI image inspiration assistant and empty/permission/loading guide. Do not use Mira or old theme names.

## Reference

- Full project constraints: `references/project-constraints.md`
- Original user source in the repository root must be preserved: `codex约束提示词.txt`
# Taoling Gallery Codex Instructions

Before any Codex development, modification, refactor, page/component generation, routing, store, API, style, asset, Taoling Assistant, or admin-console work in this repository, use the project skill:

`taoling-gallery-constraints`

The skill lives at `.codex/skills/taoling-gallery-constraints/SKILL.md`. Its full reference document is `.codex/skills/taoling-gallery-constraints/references/project-constraints.md`.

## Highest Priority

- The product brand is `桃灵图库 / Taoling Gallery`.
- The visual system must stay light, soft, peach-pink-purple, dreamy, rounded, healing, and gallery-focused.
- Do not introduce dark cyberpunk, deep-space, neon, `Neon Muse`, `Mira`, traditional backend styling, or community-platform behavior.
- The only supported business loop is: admin publishes and manages AI images; visitors browse, search, filter, and view details; logged-in users favorite, download, view download records, and use 桃灵助手; admins manage images, categories, tags, users, stats, and logs.
- Forbidden features include user submissions, follows, followers, likes, comments, author pages, tips, private messages, PRO users, creator plans, user levels, and portfolios.
- Frontend data flow must remain `apis -> store -> pages`; pages must not call Axios directly or import API modules directly.
- Before developing any page or feature that needs backend data, read the relevant section of `API.md`, confirm the required endpoint exists, and then register only the current task's needed `apis -> store -> pages` chain.
- Do not register all backend interfaces at once. Keep API modules, store actions, composables, page wiring, and utility functions demand-driven to avoid stacked, unused, or confusing code.
- Build non-page-specific foundation up front, including environment files, router shell, Pinia setup, Axios request wrapper, base types, global SCSS theme, Element Plus setup, and shared infrastructure.
- Use Vue3, TypeScript, Vite, Vue Router, Pinia, SCSS, Element Plus on demand, and Axios.
- Vue components must use `<script setup lang="ts">` and Composition API.

When a task conflicts with the full constraint reference, follow the constraint reference.

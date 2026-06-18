# Fryfrog Hub

Vue 3 媒体中心前端（音乐、漫画、电子书、视频）。

## 命令

```bash
npm run dev          # Vite 开发服务器运行在 :3540，代理 /api → :20058
npm run build        # vue-tsc -b && vite build
```

没有 lint、测试或格式化脚本。类型检查通过 `npm run build`（运行 `vue-tsc -b`）。

## 架构

- **后端**：自定义 API (`/api`)
- **API 客户端**：`src/api/backend.ts` — 管理配置/认证状态
- **状态管理**：`src/stores/connection.ts`（认证）、`src/stores/player.ts`（音频播放）、`src/stores/library.ts`、`src/stores/theme.ts`
- **路径别名**：`@/` → `src/`（在 `vite.config.ts` 和 `tsconfig.json` 中配置）

## 技术栈

- **核心**：Vue 3.5.13 + TypeScript 5.7.2
- **构建**：Vite 6.1.0 + vue-tsc 2.2.0
- **状态管理**：Pinia 2.3.0
- **路由**：Vue Router 4.5.0
- **HTTP 客户端**：axios 1.7.9
- **开发工具**：http-proxy-middleware 4.1.0

## 规范

- Vue 3 Composition API，使用 `<script setup lang="ts">`
- 用户界面文本使用中文（错误消息、UI 标签）
- CSS 变量定义在 `src/styles/main.css`（仅浅色主题，无深色模式）
- 严格 TypeScript：启用 `noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch`
- 无 ESLint/Prettier — 遵循现有代码风格

## 页面结构

- **首页**：`/` — HomeView.vue
- **音乐**：`/music` — MusicView.vue
- **收藏**：`/favorites` — FavoritesView.vue
- **漫画**：`/comics` — ComicsView.vue
  - 系列详情：`/comics/series/:name` — ComicSeriesDetailView.vue
  - 漫画详情：`/comics/:id` — ComicDetailView.vue
- **电子书**：`/ebooks` — NovelsView.vue
  - 系列详情：`/ebooks/series/:name` — EbookSeriesDetailView.vue
- **视频**：`/videos` — MoviesView.vue
  - 视频详情：`/videos/:id` — VideoDetailView.vue
- **设置**：`/settings` — SettingsView.vue
- **图标库**：`/icons` — IconLibrary.vue

## 注意事项

- 开发服务器绑定 `0.0.0.0:3540` — 可通过局域网访问
- 后端认证硬编码为 `666/666` — 不是真实的认证系统
- `player.ts` 通过联合类型 `AnyTrack` 管理后端 `MusicTrack`

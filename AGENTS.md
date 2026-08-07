# Fryfrog Hub

Vue 3 媒体中心前端（视频）。

## 命令

```bash
npm run dev          # Vite 开发服务器运行在 :3540，代理 /api → :20058
npm run build        # vue-tsc -b && vite build（类型检查 + 构建）
```

没有 lint、测试或格式化脚本。类型检查通过 `npm run build`（运行 `vue-tsc -b`）。

## 架构

- **后端**：自定义 API (`/api`)，代理到 `http://localhost:20058`
- **API 客户端**：`src/api/backend.ts` — 单文件管理所有 API 调用、认证 token（localStorage）
- **状态管理**：`src/stores/connection.ts`（认证/连接）、`src/stores/theme.ts`
- **类型定义**：`src/types/backend.ts` — 所有后端类型集中定义
- **Composables**：`src/composables/useToast.ts`
- **路径别名**：`@/` → `src/`（在 `vite.config.ts` 和 `tsconfig.json` 中配置）

## 技术栈

- Vue 3.5 + TypeScript 5.7 + Vite 6 + Pinia 2 + Vue Router 4 + axios
- Vite 插件：`vite-plugin-wasm` + `vite-plugin-top-level-await`（WASM 支持，`optimizeDeps.include` 含 `throughput`）

## 规范

- Vue 3 Composition API，使用 `<script setup lang="ts">`
- 用户界面文本使用中文（错误消息、UI 标签）
- CSS 变量定义在 `src/styles/main.css`，支持 `prefers-color-scheme` 自动切换 + `data-theme` 属性手动切换
- 严格 TypeScript：启用 `noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch`
- 无 ESLint/Prettier — 遵循现有代码风格

## 页面结构

路由定义在 `src/router/index.ts`，所有路由均为懒加载：

| 路径 | 视图 |
|------|------|
| `/` | HomeView.vue |
| `/favorites` | FavoritesView.vue |
| `/videos` | MoviesView.vue |
| `/videos/:id` | VideoDetailView.vue |
| `/settings` | SettingsView.vue |
| `/media-libraries` | MediaLibraryView.vue |
| `/icons` | IconLibrary.vue |
| `/colors` | ColorPalette.vue |
| `/logs` | LogsView.vue |

`VideoPlayer.vue` 是嵌入在详情页中的子组件，不是独立路由。

## 部署

- Docker 构建：两阶段（node:20-alpine 构建 → nginx:alpine 运行），nginx 监听 3540 端口
- Docker Compose 使用 host 网络模式，nginx 直接代理 `/api` → `127.0.0.1:20058`
- CI（`.github/workflows/docker.yml`）：push 到 master 时构建并推送镜像到 GHCR + Docker Hub

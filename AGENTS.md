# Fryfrog Hub

Vue 3 媒体中心前端（音乐、漫画、电子书、视频）。

## 命令

```bash
npm run dev          # Vite 开发服务器运行在 :3540，代理 /api → :20058
npm run build        # vue-tsc -b && vite build
```

没有 lint、测试或格式化脚本。类型检查通过 `npm run build`（运行 `vue-tsc -b`）。

## 架构

- **三个后端**：自定义 API (`/api`)、Navidrome (`/navidrome-proxy`)、Komga (`/komga-proxy`)
- **API 客户端**：`src/api/backend.ts`、`src/api/navidrome.ts`、`src/api/komga.ts` — 各自管理自己的配置/认证状态
- **状态管理**：`src/stores/connection.ts`（认证）、`src/stores/player.ts`（音频播放）、`src/stores/library.ts`、`src/stores/theme.ts`
- **路径别名**：`@/` → `src/`（在 `vite.config.ts` 和 `tsconfig.json` 中配置）

## 规范

- Vue 3 Composition API，使用 `<script setup lang="ts">`
- 用户界面文本使用中文（错误消息、UI 标签）
- CSS 变量定义在 `src/styles/main.css`（仅浅色主题，无深色模式）
- 严格 TypeScript：启用 `noUnusedLocals`、`noUnusedParameters`、`noFallthroughCasesInSwitch`
- 无 ESLint/Prettier — 遵循现有代码风格

## 注意事项

- 开发服务器绑定 `0.0.0.0:3540` — 可通过局域网访问
- Navidrome/Komga 代理使用 `http-proxy-middleware`，具有自定义错误处理和 `x-target-url` 头转发
- 后端认证硬编码为 `666/666` — 不是真实的认证系统
- `player.ts` 通过联合类型 `AnyTrack` 同时管理 Navidrome `Track` 和后端 `MusicTrack`

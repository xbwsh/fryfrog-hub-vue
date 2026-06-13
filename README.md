# Fryfrog Hub

统一媒体中心 - 支持音乐、漫画、小说、影视的管理与播放。

[English](#english) | [中文](#中文)

---

## 中文

### 简介

Fryfrog Hub 是一个基于 Vue 3 的统一媒体中心前端应用，支持多种媒体类型的管理和播放。通过对接自定义后端 API，提供完整的媒体浏览、播放、收藏等功能。

### 功能特性

- **音乐播放** - 支持在线播放、进度控制、音量调节、播放模式切换
- **歌词显示** - 点击封面打开歌词面板，支持歌词高亮滚动
- **收藏功能** - 一键收藏喜欢的音乐
- **四模块首页** - 音乐、漫画、小说、影视分类展示
- **响应式设计** - 适配桌面端和移动端
- **简洁登录** - 账号密码认证

### 技术栈

- Vue 3 + Composition API + TypeScript
- Vite 6 构建工具
- Pinia 状态管理
- Vue Router 路由
- Axios HTTP 客户端

### 开发

```bash
# 安装依赖
npm install

# 启动开发服务器
npm run dev

# 构建生产版本
npm run build
```

### 配置

默认账号密码：`666` / `666`

后端 API 地址默认为 `http://localhost:20058`

### 项目结构

```
src/
├── api/          # API 接口
├── components/   # 组件
├── router/       # 路由配置
├── stores/       # Pinia 状态管理
├── styles/       # 样式
├── types/        # TypeScript 类型
├── views/        # 页面视图
└── utils/        # 工具函数
```

---

## English

### Introduction

Fryfrog Hub is a unified media center frontend application built with Vue 3, supporting management and playback of various media types. Through integration with a custom backend API, it provides complete media browsing, playback, and collection features.

### Features

- **Music Playback** - Online playback, progress control, volume adjustment, playback mode switching
- **Lyrics Display** - Click cover to open lyrics panel with highlighted scrolling
- **Favorites** - One-click collection of favorite music
- **Four-module Homepage** - Music, Comics, Novels, Movies categorized display
- **Responsive Design** - Desktop and mobile compatible
- **Simple Login** - Username and password authentication

### Tech Stack

- Vue 3 + Composition API + TypeScript
- Vite 6 Build Tool
- Pinia State Management
- Vue Router
- Axios HTTP Client

### Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build
```

### Configuration

Default credentials: `666` / `666`

Backend API address defaults to `http://localhost:20058`

### Project Structure

```
src/
├── api/          # API interfaces
├── components/   # Components
├── router/       # Router configuration
├── stores/       # Pinia state management
├── styles/       # Styles
├── types/        # TypeScript types
├── views/        # Page views
└── utils/        # Utility functions
```

## License

MIT

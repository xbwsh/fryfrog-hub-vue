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
- **收藏功能** - 一键收藏喜欢的音乐、漫画、小说、影视
- **漫画阅读** - 支持封面浏览、翻页阅读、页面缩略图导航、系列分组
- **电子书阅读** - 支持章节导航、连续滚动阅读模式、系列分组
- **影视管理** - TMDB 元数据刮削、剧集/系列管理、NFO 生成
- **视频播放** - 支持播放进度保存与续播，进度达到 90% 自动标记为已看完
- **观看进度** - 自动保存播放位置，支持续播和从头播放，列表页显示进度条
- **四模块首页** - 音乐、漫画、小说、影视分类展示
- **图标库** - 内置图标系统，支持浏览和复制
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

### Docker 部署

使用 host 网络模式，前端直接访问后端 `127.0.0.1:20058`。

**1. 创建 nginx 配置文件并启动**

镜像内置的 nginx.conf 使用 `host.docker.internal`，host 模式下不生效，需要覆盖。运行以下命令一键创建配置并启动：

```bash
mkdir -p fryfrog-hub-frontend && cd fryfrog-hub-frontend

# 创建 nginx 配置
cat > nginx-docker.conf << 'EOF'
server {
    listen 3540;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:20058;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# 启动容器
docker run -d \
  --name fryfrog-frontend \
  --network host \
  -v $(pwd)/nginx-docker.conf:/etc/nginx/conf.d/default.conf \
  --restart unless-stopped \
  ghcr.io/xbwsh/fryfrog-hub:latest
```

访问 `http://localhost:3540`

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
├── utils/        # 工具函数
└── icons.ts      # 图标定义
```

---

## English

### Introduction

Fryfrog Hub is a unified media center frontend application built with Vue 3, supporting management and playback of various media types. Through integration with a custom backend API, it provides complete media browsing, playback, and collection features.

### Features

- **Music Playback** - Online playback, progress control, volume adjustment, playback mode switching
- **Lyrics Display** - Click cover to open lyrics panel with highlighted scrolling
- **Favorites** - One-click collection of music, comics, ebooks, and videos
- **Comic Reader** - Cover browsing, page-by-page reading, thumbnail navigation, series grouping
- **Ebook Reader** - Chapter navigation, continuous scroll reading mode, series grouping
- **Video Management** - TMDB metadata scraping, series/episode management, NFO generation
- **Video Playback** - Watch progress saved with resume support, auto-marked as watched at 90%
- **Watch Progress** - Auto-saves playback position, supports resume and restart, progress bar on list pages
- **Four-module Homepage** - Music, Comics, Novels, Movies categorized display
- **Icon Library** - Built-in icon system with browse and copy support
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

### Docker Deployment

Uses host network mode. Frontend accesses backend at `127.0.0.1:20058` directly.

**1. Create nginx config and start**

The built-in nginx.conf uses `host.docker.internal`, which doesn't work in host mode. Run this to create the config and start:

```bash
mkdir -p fryfrog-hub-frontend && cd fryfrog-hub-frontend

# Create nginx config
cat > nginx-docker.conf << 'EOF'
server {
    listen 3540;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api {
        proxy_pass http://127.0.0.1:20058;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_buffering off;
    }

    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
EOF

# Start container
docker run -d \
  --name fryfrog-frontend \
  --network host \
  -v $(pwd)/nginx-docker.conf:/etc/nginx/conf.d/default.conf \
  --restart unless-stopped \
  ghcr.io/xbwsh/fryfrog-hub:latest
```

Access at `http://localhost:3540`

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
├── utils/        # Utility functions
└── icons.ts      # Icon definitions
```

## License

MIT

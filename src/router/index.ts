import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/DashboardView.vue'),
      meta: { title: '仪表盘' },
    },
    {
      path: '/videos',
      name: 'videos',
      component: () => import('@/views/MoviesView.vue'),
      meta: { title: '视频管理' },
    },
    {
      path: '/videos/:id',
      name: 'video-detail',
      component: () => import('@/views/VideoDetailView.vue'),
      meta: { title: '视频详情' },
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
      meta: { title: '系统设置' },
    },
    {
      path: '/media-libraries',
      name: 'media-libraries',
      component: () => import('@/views/MediaLibraryView.vue'),
      meta: { title: '媒体库' },
    },
    {
      path: '/icons',
      name: 'icons',
      component: () => import('@/components/IconLibrary.vue'),
      meta: { title: '图标库' },
    },
    {
      path: '/colors',
      name: 'colors',
      component: () => import('@/components/ColorPalette.vue'),
      meta: { title: '色彩' },
    },
    {
      path: '/logs',
      name: 'logs',
      component: () => import('@/views/LogsView.vue'),
      meta: { title: '日志管理' },
    },
  ],
})

export default router

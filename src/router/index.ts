import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/FavoritesView.vue'),
    },
    {
      path: '/videos',
      name: 'videos',
      component: () => import('@/views/MoviesView.vue'),
    },
    {
      path: '/videos/:id',
      name: 'video-detail',
      component: () => import('@/views/VideoDetailView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
    {
      path: '/media-libraries',
      name: 'media-libraries',
      component: () => import('@/views/MediaLibraryView.vue'),
    },
    {
      path: '/icons',
      name: 'icons',
      component: () => import('@/components/IconLibrary.vue'),
    },
    {
      path: '/colors',
      name: 'colors',
      component: () => import('@/components/ColorPalette.vue'),
    },
    {
      path: '/logs',
      name: 'logs',
      component: () => import('@/views/LogsView.vue'),
    },
  ],
})

export default router

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
      path: '/music',
      name: 'music',
      component: () => import('@/views/MusicView.vue'),
    },
    {
      path: '/favorites',
      name: 'favorites',
      component: () => import('@/views/FavoritesView.vue'),
    },
    {
      path: '/comics',
      name: 'comics',
      component: () => import('@/views/ComicsView.vue'),
    },
    {
      path: '/comics/:id',
      name: 'comic-detail',
      component: () => import('@/views/ComicDetailView.vue'),
    },
    {
      path: '/ebooks',
      name: 'ebooks',
      component: () => import('@/views/NovelsView.vue'),
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
  ],
})

export default router

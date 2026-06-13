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
      path: '/novels',
      name: 'novels',
      component: () => import('@/views/NovelsView.vue'),
    },
    {
      path: '/movies',
      name: 'movies',
      component: () => import('@/views/MoviesView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
  ],
})

export default router

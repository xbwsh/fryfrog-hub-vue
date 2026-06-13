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
      path: '/navidrome',
      name: 'navidrome',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/navidrome/albums',
      name: 'navidrome-albums',
      component: () => import('@/views/AlbumsView.vue'),
    },
    {
      path: '/navidrome/album/:id',
      name: 'navidrome-album-detail',
      component: () => import('@/views/AlbumDetailView.vue'),
      props: true,
    },
    {
      path: '/navidrome/artists',
      name: 'navidrome-artists',
      component: () => import('@/views/ArtistsView.vue'),
    },
    {
      path: '/navidrome/starred',
      name: 'navidrome-starred',
      component: () => import('@/views/StarredView.vue'),
    },
    {
      path: '/navidrome/playlists',
      name: 'navidrome-playlists',
      component: () => import('@/views/PlaylistsView.vue'),
    },
    {
      path: '/komga',
      name: 'komga',
      component: () => import('@/views/KomgaView.vue'),
    },
    {
      path: '/komga/reader',
      name: 'komga-reader',
      component: () => import('@/views/KomgaReader.vue'),
    },
    {
      path: '/albums',
      name: 'albums',
      component: () => import('@/views/AlbumsView.vue'),
    },
    {
      path: '/album/:id',
      name: 'album-detail',
      component: () => import('@/views/AlbumDetailView.vue'),
      props: true,
    },
    {
      path: '/artists',
      name: 'artists',
      component: () => import('@/views/ArtistsView.vue'),
    },
    {
      path: '/starred',
      name: 'starred',
      component: () => import('@/views/StarredView.vue'),
    },
    {
      path: '/playlists',
      name: 'playlists',
      component: () => import('@/views/PlaylistsView.vue'),
    },
    {
      path: '/settings',
      name: 'settings',
      component: () => import('@/views/SettingsView.vue'),
    },
  ],
})

export default router

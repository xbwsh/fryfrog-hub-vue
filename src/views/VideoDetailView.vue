<template>
  <div class="video-detail-view">
    <div v-if="loading" class="loading-state">
      <div class="loading-spinner"></div>
      <p>加载中...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <p>{{ error }}</p>
      <button @click="loadVideo">重试</button>
    </div>

    <div v-else-if="series" class="detail-content">
      <div class="hero-section">
        <div class="backdrop">
          <img v-if="currentDisplayInfo.backdropUrl" :src="currentDisplayInfo.backdropUrl" :alt="currentDisplayInfo.title" draggable="false" @error="onImageError" />
          <div class="backdrop-overlay"></div>
        </div>

        <button class="back-btn" @click="router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        <div class="hero-body">
          <div class="poster-col">
            <img
              v-if="currentDisplayInfo.posterUrl"
              :src="currentDisplayInfo.posterUrl"
              :alt="currentDisplayInfo.title"
              class="poster-img"
              draggable="false"
              @error="onImageError"
            />
            <div v-else class="poster-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                <line x1="7" y1="2" x2="7" y2="22"/>
                <line x1="17" y1="2" x2="17" y2="22"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <line x1="2" y1="7" x2="7" y2="7"/>
                <line x1="2" y1="17" x2="7" y2="17"/>
                <line x1="17" y1="7" x2="22" y2="7"/>
                <line x1="17" y1="17" x2="22" y2="17"/>
              </svg>
            </div>
          </div>

          <div class="info-col">
            <h1 class="video-title">{{ currentDisplayInfo.title }}</h1>
            <p class="video-original-title" v-if="currentDisplayInfo.originalTitle && currentDisplayInfo.originalTitle !== currentDisplayInfo.title">{{ currentDisplayInfo.originalTitle }}</p>

            <div class="meta-line">
              <span v-if="currentDisplayInfo.year">{{ currentDisplayInfo.year }}</span>
              <span class="meta-sep" v-if="currentDisplayInfo.year && series.episodes">·</span>
              <span v-if="series.episodes">{{ series.episodes.length }} 集</span>
              <span class="meta-sep" v-if="video?.episodeNumber">·</span>
              <span v-if="video?.episodeNumber">第 {{ video.episodeNumber }} 集</span>
              <span class="meta-sep" v-if="currentDisplayInfo.genre">·</span>
              <span v-if="currentDisplayInfo.genre">{{ currentDisplayInfo.genre }}</span>
            </div>

            <div class="action-row">
              <button class="play-btn" @click="playEpisode(video || series.episodes[0])">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                {{ hasSeriesProgress ? '继续播放' : '播放' }}
              </button>
              <button
                v-if="hasSeriesProgress"
                class="play-btn secondary"
                @click="playEpisode(series.episodes[0])"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                从头播放
              </button>
              <Tooltip content="刮削元数据" placement="bottom">
                <button class="icon-btn scrape-btn" @click="showTmdbSearch = true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </button>
              </Tooltip>
              <Tooltip content="刷新元数据" placement="bottom">
                <button class="icon-btn" v-if="series.tmdbId" @click="handleRefreshTmdb" :disabled="refreshing">
                  <svg v-if="!refreshing" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  <div v-else class="scrape-spinner-small"></div>
                </button>
              </Tooltip>
              <Tooltip content="解绑 TMDB" placement="bottom">
                <button class="icon-btn" v-if="series.tmdbId" @click="handleUnbindTmdb">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </Tooltip>
              <Tooltip content="复制播放链接" placement="bottom">
                <button class="icon-btn" @click="copyStreamUrl">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </Tooltip>
            </div>

            <div class="rating-row" v-if="series.rating! > 0">
              <span class="rating-score">{{ series.rating!.toFixed(1) }}</span>
              <span class="rating-stars" v-html="starRatingSvg(series.rating!)"></span>
              <span class="rating-vote" v-if="video?.voteCount">{{ video.voteCount }} 票</span>
            </div>

            <div class="hero-overview" v-if="currentDisplayInfo.overview">
              <p>{{ currentDisplayInfo.overview }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-body">

        <div class="section" v-if="actors.length > 0">
          <div class="actor-card">
            <h3>演职人员</h3>
            <div class="actor-list">
            <div class="actor-item" v-for="actor in actors" :key="actor.id">
              <img v-if="actor.imagePath || actor.imageUrl" :src="getVideoActorImageUrl(actor.id)" :alt="actor.name" class="actor-avatar" draggable="false" @error="onActorImageError" />
              <div v-else class="actor-avatar-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="actor-info">
                <span class="actor-name">{{ actor.name }}</span>
                <span class="actor-character" v-if="actor.character">{{ actor.character }}</span>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div class="section">
          <div class="episode-card">
            <div class="section-header">
              <h3>剧集</h3>
              <div class="view-mode-toggle">
                <button :class="{ active: episodeViewMode === 'poster' }" @click="episodeViewMode = 'poster'" title="海报预览">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="13" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="18" x2="12" y2="21"/></svg>
                </button>
                <button :class="{ active: episodeViewMode === 'compact' }" @click="episodeViewMode = 'compact'" title="紧凑视图">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
                </button>
              </div>
            </div>

            <!-- 海报预览视图 -->
            <div v-if="episodeViewMode === 'poster'" class="episode-poster-grid">
            <div
              v-for="episode in series.episodes"
              :key="episode.id"
              class="episode-poster-card"
              :class="{ active: episode.id === video?.id }"
              @click="selectEpisode(episode)"
            >
              <div class="poster-thumb">
                <img
                  v-if="episode.backdropUrl"
                  :src="episode.backdropUrl"
                  :alt="'第 ' + episode.episodeNumber + ' 集'"
                  draggable="false"
                />
                <img
                  v-else
                  :src="getVideoFanartUrl(episode.id)"
                  :alt="'第 ' + episode.episodeNumber + ' 集'"
                  draggable="false"
                  @error="onImageError"
                />
                <div class="poster-overlay">
                  <div class="poster-play-btn">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                      <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                  </div>
                </div>
                <div v-if="episode.watchProgressPercent! > 0" class="poster-progress">
                  <div class="progress-bar">
                    <div class="progress-fill" :style="{ width: Math.min(episode.watchProgressPercent!, 100) + '%' }"></div>
                  </div>
                </div>
                <div v-if="episode.watched" class="poster-watched-badge">已看完</div>
              </div>
              <div class="poster-info">
                <div class="poster-ep-num">第 {{ episode.episodeNumber }} 集</div>
                <div class="poster-title">{{ episode.title }}</div>
              </div>
            </div>
          </div>

          <!-- 紧凑视图 -->
          <div v-else class="episode-compact-list">
            <div
              v-for="episode in series.episodes"
              :key="episode.id"
              class="compact-item"
              :class="{ active: episode.id === video?.id, watched: episode.watched }"
              @click="selectEpisode(episode)"
            >
              {{ episode.episodeNumber }}
            </div>
          </div>
          </div>
        </div>

        <div class="section">
          <div class="media-card">
            <div class="media-card-header">
              <div class="media-card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                <span class="media-card-filename">第 {{ video?.episodeNumber }} 集 · {{ video?.fileName }}</span>
                <span class="media-card-badge" v-if="video?.fileSize">{{ formatFileSize(video.fileSize) }}</span>
              </div>
            </div>
            <div class="media-info-grid">
              <div class="media-info-item" v-if="video?.resolution">
                <span class="media-info-label">分辨率</span>
                <span class="media-info-value">{{ video.resolution }}</span>
              </div>
              <div class="media-info-item" v-if="video?.videoCodec">
                <span class="media-info-label">视频编码</span>
                <span class="media-info-value">{{ video.videoCodec }}</span>
              </div>
              <div class="media-info-item" v-if="video?.audioCodec">
                <span class="media-info-label">音频编码</span>
                <span class="media-info-value">{{ video.audioCodec }}</span>
              </div>
              <div class="media-info-item" v-if="video?.bitrateKbps">
                <span class="media-info-label">码率</span>
                <span class="media-info-value">{{ video.bitrateKbps }} kbps</span>
              </div>
              <div class="media-info-item" v-if="video?.frameRate">
                <span class="media-info-label">帧率</span>
                <span class="media-info-value">{{ video.frameRate }} fps</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="video" class="detail-content">
      <div class="hero-section">
        <div class="backdrop">
          <img v-if="video.backdropUrl || video.id" :src="video.backdropUrl || getVideoFanartUrl(video.id)" :alt="video.title" draggable="false" @error="onImageError" />
          <div class="backdrop-overlay"></div>
        </div>

        <button class="back-btn" @click="router.back()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <line x1="19" y1="12" x2="5" y2="12"/>
            <polyline points="12 19 5 12 12 5"/>
          </svg>
        </button>

        <div class="hero-body">
          <div class="poster-col">
            <img
              v-if="video.posterUrl || video.id"
              :src="video.posterUrl || getVideoPosterUrl(video.id)"
              :alt="video.title"
              class="poster-img"
              draggable="false"
              @error="onImageError"
            />
            <div v-else class="poster-placeholder">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="2" y="2" width="20" height="20" rx="2.18" ry="2.18"/>
                <line x1="7" y1="2" x2="7" y2="22"/>
                <line x1="17" y1="2" x2="17" y2="22"/>
                <line x1="2" y1="12" x2="22" y2="12"/>
                <line x1="2" y1="7" x2="7" y2="7"/>
                <line x1="2" y1="17" x2="7" y2="17"/>
                <line x1="17" y1="7" x2="22" y2="7"/>
                <line x1="17" y1="17" x2="22" y2="17"/>
              </svg>
            </div>
          </div>

          <div class="info-col">
            <h1 class="video-title">{{ video.title }}</h1>
            <p class="video-original-title" v-if="video.originalTitle && video.originalTitle !== video.title">{{ video.originalTitle }}</p>

            <div class="meta-line">
              <span v-if="video.year">{{ video.year }}</span>
              <span class="meta-sep" v-if="video.year && video.durationMinutes">·</span>
              <span v-if="video.durationMinutes">{{ formatDuration(video.durationMinutes) }}</span>
              <span class="meta-sep" v-if="video.genre">·</span>
              <span v-if="video.genre">{{ video.genre }}</span>
            </div>

            <div v-if="video.watchProgressPercent! > 0" class="video-progress">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: Math.min(video.watchProgressPercent!, 100) + '%' }"></div>
              </div>
              <span v-if="video.watched" class="progress-text watched">已看完</span>
              <span v-else class="progress-text">{{ Math.round(video.watchProgressPercent!) }}%</span>
            </div>

            <div class="action-row">
              <button class="play-btn" @click="showPlayer = true">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                {{ video.watchPosition! > 0 && !video.watched ? '继续播放' : '播放' }}
              </button>
              <button
                v-if="video.watchPosition! > 0 && !video.watched"
                class="play-btn secondary"
                @click="resetAndPlay"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <polygon points="5 3 19 12 5 21 5 3"/>
                </svg>
                从头播放
              </button>
              <Tooltip content="刮削元数据" placement="bottom">
                <button class="icon-btn scrape-btn" @click="showTmdbSearch = true">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
                  </svg>
                </button>
              </Tooltip>
              <Tooltip content="刷新元数据" placement="bottom">
                <button class="icon-btn" v-if="video.tmdbId" @click="handleRefreshTmdb" :disabled="refreshing">
                  <svg v-if="!refreshing" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                  </svg>
                  <div v-else class="scrape-spinner-small"></div>
                </button>
              </Tooltip>
              <Tooltip content="解绑 TMDB" placement="bottom">
                <button class="icon-btn" v-if="video.tmdbId" @click="handleUnbindTmdb">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
                  </svg>
                </button>
              </Tooltip>
              <Tooltip :content="video.favorite ? '取消收藏' : '收藏'" placement="bottom">
                <button
                  class="icon-btn"
                  :class="{ active: video.favorite }"
                  @click="handleToggleFavorite"
                >
                <svg width="18" height="18" viewBox="0 0 24 24" :fill="video.favorite ? 'currentColor' : 'none'" stroke="currentColor" stroke-width="2">
                  <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                </svg>
              </button>
              </Tooltip>
              <Tooltip content="复制播放链接" placement="bottom">
                <button class="icon-btn" @click="copyStreamUrl">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </Tooltip>
            </div>

            <div class="rating-row" v-if="video.rating! > 0">
              <span class="rating-score">{{ video.rating!.toFixed(1) }}</span>
              <span class="rating-stars" v-html="starRatingSvg(video.rating!)"></span>
              <span class="rating-vote">{{ video.voteCount }} 票</span>
            </div>

            <div class="hero-overview" v-if="video.overview">
              <p>{{ video.overview }}</p>
            </div>
          </div>
        </div>
      </div>

      <div class="detail-body">

        <div class="section" v-if="actors.length > 0">
          <div class="actor-card">
            <h3>演职人员</h3>
            <div class="actor-list">
            <div class="actor-item" v-for="actor in actors" :key="actor.id">
              <img v-if="actor.imagePath || actor.imageUrl" :src="getVideoActorImageUrl(actor.id)" :alt="actor.name" class="actor-avatar" draggable="false" @error="onActorImageError" />
              <div v-else class="actor-avatar-placeholder">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <div class="actor-info">
                <span class="actor-name">{{ actor.name }}</span>
                <span class="actor-character" v-if="actor.character">{{ actor.character }}</span>
              </div>
            </div>
          </div>
          </div>
        </div>

        <div class="section">
          <div class="media-card">
            <div class="media-card-header">
              <div class="media-card-title">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                  <polyline points="14 2 14 8 20 8"/>
                </svg>
                <span class="media-card-filename">{{ video.fileName }}</span>
                <span class="media-card-badge" v-if="video.fileSize">{{ formatFileSize(video.fileSize) }}</span>
              </div>
            </div>
            <div class="media-info-grid">
              <div class="media-info-item" v-if="video.resolution">
                <span class="media-info-label">分辨率</span>
                <span class="media-info-value">{{ video.resolution }}</span>
              </div>
              <div class="media-info-item" v-if="video.videoCodec">
                <span class="media-info-label">视频编码</span>
                <span class="media-info-value">{{ video.videoCodec }}</span>
              </div>
              <div class="media-info-item" v-if="video.audioCodec">
                <span class="media-info-label">音频编码</span>
                <span class="media-info-value">{{ video.audioCodec }}</span>
              </div>
              <div class="media-info-item" v-if="video.bitrateKbps">
                <span class="media-info-label">码率</span>
                <span class="media-info-value">{{ video.bitrateKbps }} kbps</span>
              </div>
              <div class="media-info-item" v-if="video.frameRate">
                <span class="media-info-label">帧率</span>
                <span class="media-info-value">{{ video.frameRate }} fps</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <VideoPlayer
      v-if="showPlayer && currentPlayVideo"
      :video-id="currentPlayVideo.id"
      :video-title="currentPlayVideo.title"
      :episodes="series?.episodes || []"
      :current-episode-id="currentPlayVideo.id"
      :subtitle-files="subtitleFiles"
      @close="showPlayer = false"
      @episode-change="handleEpisodeChange"
      @extract-subtitles="handleExtractSubtitles"
    />

    <Teleport to="body">
      <div v-if="showTmdbSearch" class="modal-overlay" @click.self="showTmdbSearch = false">
        <div class="tmdb-modal">
          <div class="modal-header">
            <h2>搜索 TMDB 元数据</h2>
            <button class="modal-close" @click="showTmdbSearch = false">&times;</button>
          </div>
          <div class="modal-body">
            <div class="search-row">
              <input
                v-model="tmdbSearchQuery"
                class="tmdb-input"
                :placeholder="`搜索 ${video?.title || ''}...`"
                @keydown.enter="handleTmdbSearch"
              />
              <button class="search-btn" :disabled="tmdbSearching || !tmdbSearchQuery.trim()" @click="handleTmdbSearch">
                {{ tmdbSearching ? '搜索中...' : '搜索' }}
              </button>
            </div>

            <div v-if="tmdbSearchError" class="tmdb-error">{{ tmdbSearchError }}</div>

            <div v-if="tmdbResults.length > 0" class="tmdb-results">
              <div
                v-for="item in tmdbResults"
                :key="item.id"
                class="tmdb-card"
                :class="{ binding: bindingId === item.id }"
              >
                <img v-if="item.poster_path" :src="`https://image.tmdb.org/t/p/w200${item.poster_path}`" class="tmdb-poster" draggable="false" />
                <div v-else class="tmdb-poster-placeholder"></div>
                <div class="tmdb-info">
                  <div class="tmdb-title">{{ item.title || item.name }}</div>
                  <div class="tmdb-meta">
                    <span v-if="item.release_date || item.first_air_date">{{ (item.release_date || item.first_air_date)?.substring(0, 4) }}</span>
                    <span v-if="item.vote_average">评分 {{ item.vote_average.toFixed(1) }}</span>
                    <span class="tmdb-type">{{ item.media_type === 'tv' ? '电视剧' : '电影' }}</span>
                  </div>
                  <div class="tmdb-overview" v-if="item.overview">{{ item.overview.substring(0, 100) }}...</div>
                </div>
                <button
                  class="bind-btn"
                  :disabled="bindingId !== null"
                  @click="handleBindTmdb(item)"
                >
                  {{ bindingId === item.id ? '绑定中...' : '绑定' }}
                </button>
              </div>
            </div>

            <div v-else-if="tmdbSearched && !tmdbSearching" class="tmdb-empty">
              未找到相关结果
            </div>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import type { VideoDTO, SeriesDTO, VideoActor } from '@/types/backend'
import { getVideoById, getSeriesById, toggleVideoFavorite, getVideoPosterUrl, getVideoFanartUrl, getSeriesPosterUrl, getSeriesFanartUrl, deleteVideoProgress, getVideoActors, getVideoActorImageUrl, searchTmdb, bindTmdb, refreshTmdb, unbindTmdb, getSubtitleFiles, extractSubtitles } from '@/api/backend'
import { useConnectionStore } from '@/stores/connection'
import { useToast } from '@/composables/useToast'
import Tooltip from '@/components/Tooltip.vue'
import VideoPlayer from '@/views/VideoPlayer.vue'

const connectionStore = useConnectionStore()
const toast = useToast()

const router = useRouter()
const route = useRoute()

const video = ref<VideoDTO | null>(null)
const series = ref<SeriesDTO | null>(null)
const loading = ref(false)
const error = ref('')
const showPlayer = ref(false)
type EpisodeViewMode = 'poster' | 'compact'
const episodeViewMode = ref<EpisodeViewMode>('poster')
const actors = ref<VideoActor[]>([])
const subtitleFiles = ref<string[]>([])

// TMDB search
const showTmdbSearch = ref(false)
const tmdbSearchQuery = ref('')
const tmdbResults = ref<any[]>([])
const tmdbSearching = ref(false)
const tmdbSearched = ref(false)
const tmdbSearchError = ref('')
const bindingId = ref<number | null>(null)
const refreshing = ref(false)

async function loadVideo() {
  const id = Number(route.params.id)
  if (!id) return

  loading.value = true
  error.value = ''
  series.value = null
  video.value = null
  actors.value = []
  subtitleFiles.value = []

  try {
    const data = await getVideoById(id)
    if (data) {
      video.value = data
      if (data.isSeries && data.seriesId) {
        const seriesData = await getSeriesById(data.seriesId)
        if (seriesData) {
          series.value = seriesData
        }
      }
      try {
        actors.value = await getVideoActors(id)
      } catch {
        actors.value = []
      }
      try {
        subtitleFiles.value = await getSubtitleFiles(id)
      } catch {
        subtitleFiles.value = []
      }
    } else {
      error.value = '视频不存在'
    }
  } catch (e) {
    error.value = '加载视频详情失败'
    console.error('Failed to load video:', e)
  } finally {
    loading.value = false
  }
}

function selectEpisode(episode: VideoDTO) {
  video.value = episode
}

function handleEpisodeChange(episode: VideoDTO) {
  video.value = episode
  showPlayer.value = true
  loadSubtitleFiles()
}

async function loadSubtitleFiles() {
  const id = video.value?.id || series.value?.episodes[0]?.id
  if (!id) return
  try {
    subtitleFiles.value = await getSubtitleFiles(id)
  } catch {
    subtitleFiles.value = []
  }
}

async function handleExtractSubtitles() {
  const id = video.value?.id || series.value?.episodes[0]?.id
  if (!id) return
  try {
    await extractSubtitles(id)
    await loadSubtitleFiles()
  } catch (e) {
    console.error('Failed to extract subtitles:', e)
  }
}

function playEpisode(episode: VideoDTO) {
  video.value = episode
  showPlayer.value = true
}

async function resetAndPlay() {
  if (!video.value) return
  try {
    await deleteVideoProgress(video.value.id)
    video.value = { ...video.value, watchPosition: 0, watchProgressPercent: 0, watched: false }
    showPlayer.value = true
  } catch (e) {
    console.error('Failed to reset progress:', e)
  }
}

async function handleToggleFavorite() {
  if (!video.value) return
  try {
    const updated = await toggleVideoFavorite(video.value.id, !video.value.favorite)
    if (updated) {
      video.value = updated
    }
  } catch (e) {
    console.error('Failed to toggle favorite:', e)
  }
}

async function handleTmdbSearch() {
  if (!tmdbSearchQuery.value.trim()) return
  tmdbSearching.value = true
  tmdbSearchError.value = ''
  tmdbSearched.value = false
  try {
    tmdbResults.value = await searchTmdb(tmdbSearchQuery.value.trim())
    tmdbSearched.value = true
  } catch (e) {
    tmdbSearchError.value = '搜索失败'
    console.error('TMDB search failed:', e)
  } finally {
    tmdbSearching.value = false
  }
}

async function handleBindTmdb(item: any) {
  const targetId = video.value?.id || series.value?.episodes[0]?.id
  if (!targetId || bindingId.value !== null) return
  bindingId.value = item.id
  tmdbSearchError.value = ''
  try {
    const updated = await bindTmdb(targetId, item.id, item.media_type)
    if (updated) {
      showTmdbSearch.value = false
      await loadVideo()
    }
  } catch (e) {
    tmdbSearchError.value = '绑定失败'
    console.error('Bind TMDB failed:', e)
  } finally {
    bindingId.value = null
  }
}

async function handleRefreshTmdb() {
  const targetId = video.value?.id || series.value?.episodes[0]?.id
  if (!targetId || refreshing.value) return
  refreshing.value = true
  try {
    const updated = await refreshTmdb(targetId)
    if (updated) {
      await loadVideo()
    }
  } catch (e) {
    console.error('Refresh TMDB failed:', e)
  } finally {
    refreshing.value = false
  }
}

async function handleUnbindTmdb() {
  const targetId = video.value?.id || series.value?.episodes[0]?.id
  if (!targetId) return
  if (!confirm('确定要解绑 TMDB 元数据吗？')) return
  try {
    const updated = await unbindTmdb(targetId)
    if (updated) {
      await loadVideo()
    }
  } catch (e) {
    console.error('Unbind TMDB failed:', e)
  }
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h} 小时 ${m} 分钟` : `${m} 分钟`
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  if (bytes < 1024 * 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  return (bytes / (1024 * 1024 * 1024)).toFixed(2) + ' GB'
}

function starRatingSvg(rating: number): string {
  const clamped = Math.max(0, Math.min(10, rating))
  const fullStars = Math.floor(clamped / 2)
  const hasHalf = (clamped / 2) - fullStars >= 0.5
  const emptyStars = 5 - fullStars - (hasHalf ? 1 : 0)
  const starPoints = '12,2 14.94,8.91 21.51,8.91 16.09,13.18 18.12,19.79 12,15.09 5.88,19.79 7.91,13.18 2.49,8.91 9.06,8.91'
  let svg = `<svg viewBox="0 0 120 24" xmlns="http://www.w3.org/2000/svg">`
  for (let i = 0; i < fullStars; i++) {
    const cx = 12 + i * 24
    const pts = starPoints.split(' ').map(p => { const [x, y] = p.split(','); return `${cx + (+x - 12)},${y}` }).join(' ')
    svg += `<polygon points="${pts}" fill="currentColor" stroke="currentColor" stroke-width="0.8"/>`
  }
  if (hasHalf) {
    const cx = 12 + fullStars * 24
    const pts = starPoints.split(' ').map(p => { const [x, y] = p.split(','); return `${cx + (+x - 12)},${y}` }).join(' ')
    const clipId = 'halfClip' + fullStars
    svg += `<defs><clipPath id="${clipId}"><rect x="${cx - 12}" y="0" width="12" height="24"/></clipPath></defs>`
    svg += `<polygon points="${pts}" fill="currentColor" stroke="currentColor" stroke-width="0.8" clip-path="url(#${clipId})"/>`
    svg += `<polygon points="${pts}" fill="none" stroke="currentColor" stroke-width="0.8"/>`
  }
  for (let i = 0; i < emptyStars; i++) {
    const cx = 12 + (fullStars + (hasHalf ? 1 : 0) + i) * 24
    const pts = starPoints.split(' ').map(p => { const [x, y] = p.split(','); return `${cx + (+x - 12)},${y}` }).join(' ')
    svg += `<polygon points="${pts}" fill="none" stroke="currentColor" stroke-width="0.8"/>`
  }
  svg += `</svg>`
  return svg
}

function onImageError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}

function onActorImageError(e: Event) {
  (e.target as HTMLImageElement).style.display = 'none'
}

function copyStreamUrl() {
  const id = video.value?.id || series.value?.episodes[0]?.id
  if (!id) return
  const baseUrl = connectionStore.backendUrl || ''
  const url = `${baseUrl}/api/v1/video/${id}/stream`
  navigator.clipboard.writeText(url).then(() => {
    toast.success('播放链接已复制到剪贴板')
  }).catch(() => {
    toast.error('复制失败')
  })
}

const currentPlayVideo = computed(() => {
  if (series.value && series.value.episodes) {
    const found = series.value.episodes.find(ep => ep.id === video.value?.id)
    return found || series.value.episodes[0]
  }
  return video.value
})

const currentDisplayInfo = computed(() => {
  if (series.value) {
    return {
      title: series.value.title,
      originalTitle: series.value.originalTitle,
      posterUrl: video.value?.posterUrl || series.value.posterUrl || getSeriesPosterUrl(series.value.id),
      backdropUrl: (video.value?.backdropUrl || (video.value?.id ? getVideoFanartUrl(video.value.id) : '')) || series.value.backdropUrl || getSeriesFanartUrl(series.value.id),
      overview: series.value.overview,
      year: series.value.year,
      genre: video.value?.genre || null
    }
  }
  if (video.value) {
    return {
      title: video.value.title,
      originalTitle: video.value.originalTitle,
      posterUrl: video.value.posterUrl || getVideoPosterUrl(video.value.id),
      backdropUrl: video.value.backdropUrl || getVideoFanartUrl(video.value.id),
      overview: video.value.overview,
      year: video.value.year,
      genre: video.value.genre
    }
  }
  return {
    title: '',
    originalTitle: '',
    posterUrl: '',
    backdropUrl: '',
    overview: '',
    year: 0,
    genre: null
  }
})

const hasSeriesProgress = computed(() => {
  if (!series.value?.episodes) return false
  return series.value.episodes.some(ep => ep.watchPosition! > 0 && !ep.watched)
})

watch(() => route.params.id, (newId) => {
  if (newId) {
    loadVideo()
  }
})

onMounted(loadVideo)
</script>

<style scoped>
.video-detail-view {
  height: 100%;
  overflow-y: auto;
}

.loading-state,
.error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  gap: 16px;
  color: var(--text-secondary);
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.error-state button {
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.error-state button:hover {
  background: var(--accent-hover);
}

.hero-section {
  position: relative;
  padding-bottom: 80px;
}

.backdrop {
  position: absolute;
  inset: 0;
  overflow: hidden;
  min-height: 50vh;
}

.backdrop img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.backdrop-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.1) 0%,
    rgba(0, 0, 0, 0.3) 40%,
    rgba(0, 0, 0, 0.7) 75%,
    var(--bg-primary) 100%
  );
}

.back-btn {
  position: absolute;
  top: 20px;
  left: 20px;
  z-index: 5;
  width: 44px;
  height: 44px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(4px);
  transition: var(--transition);
}

.back-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.hero-body {
  position: relative;
  z-index: 2;
  display: flex;
  flex-wrap: wrap;
  gap: 48px;
  padding: 80px 64px 56px;
  color: #fff;
}

.poster-col {
  flex-shrink: 0;
}

.poster-img {
  width: 280px;
  border-radius: var(--radius-lg);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);
  display: block;
}

.poster-placeholder {
  width: 280px;
  aspect-ratio: 2 / 3;
  border-radius: var(--radius-lg);
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
}

.info-col {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.video-title {
  font-family: var(--font-display);
  font-size: 42px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 4px;
  line-height: 1.2;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
}

.video-original-title {
  font-size: 17px;
  color: rgba(255, 255, 255, 0.75);
  margin-bottom: 14px;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.meta-line {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 14px;
  flex-wrap: wrap;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
}

.meta-sep {
  color: var(--text-muted);
}

.tag-row {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 20px;
}

.tag {
  font-size: 13px;
  padding: 4px 14px;
  border-radius: 4px;
  background: rgba(255, 255, 255, 0.15);
  color: rgba(255, 255, 255, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.video-progress {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 16px;
}

.action-row {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 12px;
}

.play-btn {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 14px 36px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 17px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
}

.play-btn:hover {
  background: var(--accent-hover);
}

.play-btn.secondary {
  background: rgba(255, 255, 255, 0.15);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.play-btn.secondary:hover {
  background: rgba(255, 255, 255, 0.25);
  color: #fff;
}

.icon-btn {
  width: 44px;
  height: 44px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.15);
  border: none;
  cursor: pointer;
  transition: var(--transition);
}

.icon-btn:hover {
  color: #fff;
  background: rgba(255, 255, 255, 0.25);
}

.icon-btn.active {
  color: var(--accent);
  background: var(--accent-glow);
}

.rating-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.rating-stars {
  display: inline-flex;
  align-items: center;
}

.rating-stars :deep(svg) {
  width: 80px;
  height: 16px;
  color: #ffd700;
}

.rating-score {
  font-size: 22px;
  font-weight: 700;
  color: #ffd700;
}

.rating-vote {
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
}

.hero-overview {
  max-width: 33.33%;
  margin-top: 16px;
}

.hero-overview p {
  font-size: 16px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.75);
  white-space: pre-wrap;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.3);
}

.detail-body {
  padding: 0 64px 56px;
  position: relative;
  z-index: 3;
  margin-top: -60px;
}

.section {
  margin-bottom: 40px;
}

.actor-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.actor-card h3 {
  margin-bottom: 20px;
}

.actor-list {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
}

.actor-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  width: 100px;
}

.actor-name {
  font-size: 13px;
  font-weight: 500;
  color: var(--text-primary);
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}

.actor-avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  border: 2px solid var(--bg-secondary);
}

.actor-avatar-placeholder {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-muted);
  overflow: hidden;
}

.actor-info {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  text-align: center;
  width: 100%;
}

.actor-character {
  font-size: 11px;
  color: var(--text-muted);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
  text-align: center;
}

.scrape-spinner-small {
  width: 16px;
  height: 16px;
  border: 2px solid var(--border);
  border-top-color: var(--accent);
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.modal-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
}

.tmdb-modal {
  background: var(--bg-primary);
  border-radius: var(--radius-lg);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 24px;
  border-bottom: 1px solid var(--border);
}

.modal-header h2 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0;
}

.modal-close {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background: var(--bg-secondary);
  color: var(--text-muted);
  font-size: 20px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.modal-close:hover {
  background: var(--bg-hover);
  color: var(--text-primary);
}

.modal-body {
  padding: 24px;
  overflow-y: auto;
}

.search-row {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.tmdb-input {
  flex: 1;
  padding: 10px 16px;
  background: var(--bg-secondary);
  border: 1px solid var(--border);
  border-radius: var(--radius-md);
  font-size: 14px;
  color: var(--text-primary);
  outline: none;
  transition: var(--transition);
}

.tmdb-input:focus {
  border-color: var(--accent);
}

.search-btn {
  padding: 10px 20px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap;
}

.search-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.search-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tmdb-error {
  padding: 12px;
  background: rgba(231, 76, 60, 0.1);
  color: #e74c3c;
  border-radius: var(--radius-md);
  margin-bottom: 16px;
  font-size: 14px;
}

.tmdb-results {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.tmdb-card {
  display: flex;
  gap: 16px;
  padding: 16px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border);
  transition: var(--transition);
}

.tmdb-card.binding {
  opacity: 0.6;
  pointer-events: none;
}

.tmdb-poster {
  width: 80px;
  height: 120px;
  object-fit: cover;
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.tmdb-poster-placeholder {
  width: 80px;
  height: 120px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-sm);
  flex-shrink: 0;
}

.tmdb-info {
  flex: 1;
  min-width: 0;
}

.tmdb-title {
  font-size: 16px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 4px;
}

.tmdb-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--text-secondary);
  margin-bottom: 8px;
}

.tmdb-type {
  padding: 2px 8px;
  background: var(--bg-tertiary);
  border-radius: 4px;
  font-size: 12px;
}

.tmdb-overview {
  font-size: 13px;
  color: var(--text-muted);
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.bind-btn {
  padding: 8px 16px;
  background: var(--accent);
  color: white;
  border: none;
  border-radius: var(--radius-md);
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  align-self: center;
  white-space: nowrap;
}

.bind-btn:hover:not(:disabled) {
  background: var(--accent-hover);
}

.bind-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.tmdb-empty {
  text-align: center;
  padding: 40px;
  color: var(--text-muted);
  font-size: 14px;
}

.episode-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 24px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.section-header h3 {
  font-size: 18px;
  font-weight: 600;
  color: var(--text-primary);
  margin-bottom: 0;
}

.view-mode-toggle {
  display: flex;
  gap: 4px;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 2px;
}

.view-mode-toggle button {
  width: 32px;
  height: 28px;
  border: none;
  border-radius: var(--radius-sm);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition);
}

.view-mode-toggle button svg {
  width: 16px;
  height: 16px;
}

.view-mode-toggle button:hover {
  color: var(--text-primary);
}

.view-mode-toggle button.active {
  background: var(--accent);
  color: white;
}

.episode-poster-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 16px;
}

.episode-poster-card {
  cursor: pointer;
  transition: var(--transition);
}

.episode-poster-card:hover {
  transform: translateY(-4px);
}

.episode-poster-card.active .poster-thumb {
  outline: 2px solid var(--accent);
}

.poster-thumb {
  position: relative;
  aspect-ratio: 16 / 9;
  border-radius: var(--radius-md);
  overflow: hidden;
  background: var(--bg-tertiary);
  margin-bottom: 8px;
}

.poster-thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.poster-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s;
}

.episode-poster-card:hover .poster-overlay {
  opacity: 1;
}

.poster-play-btn {
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.9);
  color: var(--text-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.poster-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 3px;
  background: rgba(0, 0, 0, 0.3);
}

.poster-progress .progress-bar {
  background: rgba(255, 255, 255, 0.3);
}

.poster-progress .progress-fill {
  background: var(--accent);
}

.poster-watched-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 2px 8px;
  background: rgba(46, 204, 113, 0.9);
  color: white;
  font-size: 11px;
  font-weight: 500;
  border-radius: 4px;
}

.poster-info {
  padding: 0 2px;
}

.poster-ep-num {
  font-size: 12px;
  color: var(--accent);
  font-weight: 500;
  margin-bottom: 2px;
}

.poster-title {
  font-size: 13px;
  color: var(--text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.episode-compact-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(48px, 1fr));
  gap: 8px;
}

.compact-item {
  aspect-ratio: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: var(--radius-sm);
  background: var(--bg-secondary);
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
  cursor: pointer;
  transition: var(--transition);
}

.compact-item:hover {
  background: var(--bg-hover);
}

.compact-item.active {
  background: var(--accent);
  color: white;
}

.compact-item.watched {
  opacity: 0.5;
}

.file-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.file-card-header {
  padding: 18px 24px 0;
  font-size: 17px;
  font-weight: 600;
  color: var(--text-primary);
}

.file-card-body {
  padding: 12px 24px 8px;
}

.file-card .file-row {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 14px 0;
  border-bottom: 1px solid var(--border);
}

.file-card .file-row:last-child {
  border-bottom: none;
}

.file-icon {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--text-muted);
}

.file-label {
  font-size: 14px;
  color: var(--text-muted);
  width: 64px;
  flex-shrink: 0;
}

.media-info-text .file-label {
  width: auto;
  flex-shrink: 0;
}

.file-value {
  font-size: 14px;
  color: var(--text-primary);
  word-break: break-all;
  flex: 1;
}

.media-info-text .file-value {
  flex: none;
}

.file-value.mono {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 13px;
  letter-spacing: -0.01em;
}

.media-card {
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  overflow: hidden;
  max-width: 700px;
}

.media-card-header {
  padding: 18px 24px;
  border-bottom: 1px solid var(--border);
}

.media-card-title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 500;
  color: var(--text-primary);
}

.media-card-title svg {
  color: var(--text-muted);
  flex-shrink: 0;
}

.media-card-filename {
  font-family: 'SF Mono', 'Menlo', monospace;
  font-size: 14px;
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
}

.media-card-badge {
  font-size: 12px;
  font-weight: 500;
  color: var(--text-muted);
  background: var(--bg-tertiary);
  padding: 2px 10px;
  border-radius: 20px;
  white-space: nowrap;
  flex-shrink: 0;
}

.media-info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  padding: 16px 24px;
}

.media-info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 12px 16px;
  background: var(--bg-tertiary);
  border-radius: var(--radius-md);
}

.media-info-label {
  font-size: 12px;
  color: var(--text-muted);
  letter-spacing: 0.5px;
}

.media-info-value {
  font-size: 16px;
  font-weight: 500;
  color: var(--text-primary);
  font-family: 'SF Mono', 'Menlo', monospace;
}

.info-card-half {
  flex: 1;
  min-width: 0;
  background: var(--bg-secondary);
  border-radius: var(--radius-lg);
  padding: 4px 0;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
}

.media-info-item {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-bottom: 1px solid var(--border);
}

.media-info-item:last-child {
  border-bottom: none;
}

.media-info-item .file-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
}

.media-info-text {
  display: flex;
  align-items: center;
  gap: 6px;
}

.media-info-text .file-label {
  font-size: 12px;
  color: var(--text-muted);
  width: auto;
}

.media-info-text .file-value {
  font-size: 14px;
  font-weight: 500;
  color: var(--text-primary);
  flex: none;
}

.media-info-text .file-value.mono {
  font-family: 'SF Mono', 'Menlo', monospace;
  letter-spacing: -0.02em;
}

@media screen and (max-width: 767px) {
  .hero-body {
    flex-direction: column;
    align-items: center;
    padding: 40px 16px 24px;
    gap: 20px;
  }

  .poster-img {
    width: 150px;
  }

  .poster-placeholder {
    width: 150px;
  }

  .info-col {
    align-items: center;
    text-align: center;
  }

  .video-title {
    font-size: 24px;
  }

  .meta-line,
  .tag-row,
  .action-row,
  .rating-row {
    justify-content: center;
  }

  .detail-body {
    padding: 0 16px 32px;
  }

  .actor-list {
    justify-content: center;
  }

  .media-info-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .media-card-filename {
    font-size: 13px;
  }
}
</style>

'use client';

import type { Movie, MovieInteraction, MovieProgress, SavedMovie } from '@/types';
import { readStorageValue, writeStorageValue } from './client';

export const WATCH_PROGRESS_KEY = 'movie-app:watch-progress:v1';
export const MY_LIST_KEY = 'movie-app:my-list:v1';
export const LIKES_KEY = 'movie-app:likes:v1';
export const RECENT_SEARCHES_KEY = 'movie-app:recent-searches:v1';
export const PLAYER_PREFS_KEY = 'movie-app:player-prefs:v1';

const MAX_PROGRESS_ITEMS = 36;
const MAX_RECENT_SEARCHES = 8;

export interface PlayerPreferences {
  autoNext: boolean;
  lightsOff: boolean;
}

const DEFAULT_PLAYER_PREFS: PlayerPreferences = {
  autoNext: true,
  lightsOff: false,
};

/**
 * Đọc toàn bộ danh sách tiến độ xem phim, sắp xếp mới xem nhất lên đầu
 */
export function getWatchProgress(): MovieProgress[] {
  return readStorageValue<MovieProgress[]>(WATCH_PROGRESS_KEY, []).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );
}

/**
 * Lấy tiến độ mới nhất của một bộ phim theo slug (ưu tiên tập gần nhất người dùng xem)
 */
export function getLatestMovieProgress(slug: string): MovieProgress | null {
  return getWatchProgress().find((item) => item.slug === slug) ?? null;
}

/**
 * Lấy thời điểm đã lưu của đúng một tập phim (tự đọc cả key cũ watch-progress-* để không mất dữ liệu cũ)
 */
export function getEpisodeProgress(slug: string, episodeIndex: number): MovieProgress | null {
  const existing = getWatchProgress().find(
    (item) => item.slug === slug && item.episodeIndex === episodeIndex,
  );
  if (existing) return existing;

  // Hỗ trợ tương thích ngược với key localStorage phiên bản trước
  if (typeof window !== 'undefined') {
    const legacyKey = `watch-progress-${slug}-${episodeIndex}`;
    const legacyRaw = window.localStorage.getItem(legacyKey);
    const legacyTime = legacyRaw ? Number(legacyRaw) : NaN;
    if (!Number.isNaN(legacyTime) && legacyTime > 5) {
      return {
        slug,
        name: '',
        episodeIndex,
        currentTime: legacyTime,
        updatedAt: Date.now(),
      };
    }
  }

  return null;
}

/**
 * Trả về tập hợp các chỉ số tập đã từng xem xong hoặc đang xem của một bộ phim
 */
export function getWatchedEpisodeMap(slug: string): Record<number, MovieProgress> {
  const map: Record<number, MovieProgress> = {};
  for (const item of getWatchProgress()) {
    if (item.slug === slug) {
      map[item.episodeIndex] = item;
    }
  }
  return map;
}

/**
 * Lưu tiến độ xem của một tập phim vào một nguồn duy nhất và xóa key cũ nếu tồn tại
 */
export function saveWatchProgress(progress: MovieProgress): void {
  const isCompleted =
    Boolean(progress.completed) ||
    Boolean(
      progress.duration &&
      progress.duration > 0 &&
      progress.currentTime / progress.duration >= 0.92,
    );

  const normalized: MovieProgress = {
    ...progress,
    completed: isCompleted,
    updatedAt: progress.updatedAt || Date.now(),
  };

  const next = [
    normalized,
    ...getWatchProgress().filter(
      (item) => !(item.slug === progress.slug && item.episodeIndex === progress.episodeIndex),
    ),
  ].slice(0, MAX_PROGRESS_ITEMS);

  writeStorageValue(WATCH_PROGRESS_KEY, next);

  // Dọn key cũ để không lưu trùng lặp hai nơi
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(`watch-progress-${progress.slug}-${progress.episodeIndex}`);
    } catch {
      // Bỏ qua nếu trình duyệt chặn storage
    }
  }
}

/**
 * Xóa toàn bộ lịch sử xem của một bộ phim khỏi mục Tiếp tục xem
 */
export function removeWatchProgress(slug: string): void {
  writeStorageValue(
    WATCH_PROGRESS_KEY,
    getWatchProgress().filter((item) => item.slug !== slug),
  );
}

/**
 * Xóa tiến độ của riêng một tập phim khi người dùng chọn Xem lại từ đầu
 */
export function clearEpisodeProgress(slug: string, episodeIndex: number): void {
  writeStorageValue(
    WATCH_PROGRESS_KEY,
    getWatchProgress().filter(
      (item) => !(item.slug === slug && item.episodeIndex === episodeIndex),
    ),
  );
  if (typeof window !== 'undefined') {
    try {
      window.localStorage.removeItem(`watch-progress-${slug}-${episodeIndex}`);
    } catch {
      // Bỏ qua lỗi storage
    }
  }
}

/**
 * Đọc tùy chọn trình phát (tự chuyển tập, tắt đèn)
 */
export function getPlayerPreferences(): PlayerPreferences {
  return {
    ...DEFAULT_PLAYER_PREFS,
    ...readStorageValue<Partial<PlayerPreferences>>(PLAYER_PREFS_KEY, {}),
  };
}

/**
 * Cập nhật một phần tùy chọn trình phát
 */
export function savePlayerPreferences(partial: Partial<PlayerPreferences>): PlayerPreferences {
  const next = { ...getPlayerPreferences(), ...partial };
  writeStorageValue(PLAYER_PREFS_KEY, next);
  return next;
}

/**
 * Lấy danh sách phim người dùng đã lưu
 */
export function getMyList(): SavedMovie[] {
  return readStorageValue<SavedMovie[]>(MY_LIST_KEY, []).sort((a, b) => b.addedAt - a.addedAt);
}

/**
 * Kiểm tra một phim đã có trong Danh sách của tôi hay chưa
 */
export function isMovieSaved(slug: string): boolean {
  return getMyList().some((movie) => movie.slug === slug);
}

/**
 * Thêm hoặc bỏ một phim khỏi Danh sách của tôi
 */
export function toggleSavedMovie(movie: Movie): boolean {
  const currentList = getMyList();
  const exists = currentList.some((item) => item.slug === movie.slug);

  if (exists) {
    writeStorageValue(
      MY_LIST_KEY,
      currentList.filter((item) => item.slug !== movie.slug),
    );
    return false;
  }

  const savedMovie: SavedMovie = {
    _id: movie._id,
    name: movie.name,
    slug: movie.slug,
    origin_name: movie.origin_name,
    thumb_url: movie.thumb_url,
    poster_url: movie.poster_url,
    year: movie.year,
    quality: movie.quality,
    lang: movie.lang,
    episode_current: movie.episode_current,
    imdbScore: movie.imdb?.vote_average || movie.tmdb?.vote_average,
    addedAt: Date.now(),
  };

  writeStorageValue(MY_LIST_KEY, [savedMovie, ...currentList]);
  return true;
}

/**
 * Lấy danh sách trạng thái yêu thích
 */
export function getLikes(): MovieInteraction[] {
  return readStorageValue<MovieInteraction[]>(LIKES_KEY, []);
}

/**
 * Kiểm tra người dùng đã thích bộ phim hay chưa
 */
export function isMovieLiked(slug: string): boolean {
  return getLikes().some((item) => item.slug === slug && item.liked);
}

/**
 * Bật hoặc tắt trạng thái yêu thích của một phim
 */
export function toggleMovieLike(slug: string): boolean {
  const interactions = getLikes();
  const current = interactions.find((item) => item.slug === slug);
  const nextLiked = !current?.liked;
  const next = [
    { slug, liked: nextLiked, updatedAt: Date.now() },
    ...interactions.filter((item) => item.slug !== slug),
  ];

  writeStorageValue(LIKES_KEY, next);
  return nextLiked;
}

/**
 * Lấy danh sách từ khóa tìm kiếm gần đây
 */
export function getRecentSearches(): string[] {
  return readStorageValue<string[]>(RECENT_SEARCHES_KEY, []);
}

/**
 * Lưu một từ khóa vào lịch sử tìm kiếm gần đây
 */
export function saveRecentSearch(keyword: string): void {
  const cleanKeyword = keyword.trim();
  if (!cleanKeyword) return;

  const next = [
    cleanKeyword,
    ...getRecentSearches().filter((item) => item.toLowerCase() !== cleanKeyword.toLowerCase()),
  ].slice(0, MAX_RECENT_SEARCHES);

  writeStorageValue(RECENT_SEARCHES_KEY, next);
}

/**
 * Xóa toàn bộ lịch sử tìm kiếm gần đây
 */
export function clearRecentSearches(): void {
  writeStorageValue(RECENT_SEARCHES_KEY, []);
}

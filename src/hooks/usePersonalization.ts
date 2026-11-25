'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { Movie, MovieInteraction, MovieProgress, SavedMovie } from '@/types';
import { STORAGE_EVENT } from '@/lib/storage/client';
import {
  DEFAULT_PLAYER_PREFS,
  LIKES_KEY,
  MY_LIST_KEY,
  PLAYER_PREFS_KEY,
  RECENT_SEARCHES_KEY,
  WATCH_PROGRESS_KEY,
  clearAllWatchProgress,
  clearRecentSearches,
  getLikes,
  getMyList,
  getPlayerPreferences,
  getRecentSearches,
  getWatchProgress,
  isMovieLiked,
  isMovieSaved,
  removeSavedMovie,
  removeWatchProgress,
  savePlayerPreferences,
  saveRecentSearch,
  toggleMovieLike,
  toggleSavedMovie,
  type PlayerPreferences,
} from '@/lib/storage/movie-personalization';

interface PersonalizationState {
  myList: SavedMovie[];
  watchProgress: MovieProgress[];
  likes: MovieInteraction[];
  recentSearches: string[];
  playerPrefs: PlayerPreferences;
}

const EMPTY_STATE: PersonalizationState = {
  myList: [],
  watchProgress: [],
  likes: [],
  recentSearches: [],
  playerPrefs: DEFAULT_PLAYER_PREFS,
};

const STORAGE_KEYS = [
  MY_LIST_KEY,
  WATCH_PROGRESS_KEY,
  LIKES_KEY,
  RECENT_SEARCHES_KEY,
  PLAYER_PREFS_KEY,
] as const;

let cachedVersion: string | null = null;
let cachedSnapshot: PersonalizationState = EMPTY_STATE;

/**
 * Đọc snapshot cá nhân hóa từ localStorage và cache theo chuỗi version để tránh re-render thừa
 */
function getSnapshot(): PersonalizationState {
  if (typeof window === 'undefined') {
    return EMPTY_STATE;
  }

  const version = getStorageVersion();
  if (version === cachedVersion) {
    return cachedSnapshot;
  }

  cachedVersion = version;
  cachedSnapshot = {
    myList: getMyList(),
    watchProgress: getWatchProgress(),
    likes: getLikes(),
    recentSearches: getRecentSearches(),
    playerPrefs: getPlayerPreferences(),
  };

  return cachedSnapshot;
}

/**
 * Đăng ký lắng nghe thay đổi localStorage giữa các tab và sự kiện nội bộ
 */
function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') {
    return () => undefined;
  }

  window.addEventListener('storage', onStoreChange);
  window.addEventListener(STORAGE_EVENT, onStoreChange);

  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
  };
}

/**
 * Tạo chuỗi phiên bản đại diện cho toàn bộ dữ liệu cá nhân hóa trong localStorage
 */
function getStorageVersion(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }

  return STORAGE_KEYS.map((key) => window.localStorage.getItem(key) ?? '').join('|');
}

/**
 * Hook quản lý danh sách cá nhân, lịch sử xem, lượt thích, tìm kiếm gần đây và tùy chọn trình phát
 */
export function usePersonalization(): PersonalizationState & {
  toggleSaved: (movie: Movie) => boolean;
  removeSaved: (slug: string) => void;
  toggleLike: (movieOrSlug: Movie | string) => boolean;
  removeProgress: (slug: string) => void;
  clearAllProgress: () => void;
  rememberSearch: (keyword: string) => void;
  clearSearches: () => void;
  updatePlayerPrefs: (partial: Partial<PlayerPreferences>) => PlayerPreferences;
  isSaved: (slug: string) => boolean;
  isLiked: (slug: string) => boolean;
} {
  const state = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_STATE);

  const toggleSaved = useCallback((movie: Movie) => toggleSavedMovie(movie), []);
  const removeSaved = useCallback((slug: string) => {
    removeSavedMovie(slug);
  }, []);
  const toggleLike = useCallback((movieOrSlug: Movie | string) => toggleMovieLike(movieOrSlug), []);
  const removeProgress = useCallback((slug: string) => {
    removeWatchProgress(slug);
  }, []);
  const clearAllProgress = useCallback(() => {
    clearAllWatchProgress();
  }, []);
  const rememberSearch = useCallback((keyword: string) => {
    saveRecentSearch(keyword);
  }, []);
  const clearSearches = useCallback(() => {
    clearRecentSearches();
  }, []);
  const updatePlayerPrefs = useCallback(
    (partial: Partial<PlayerPreferences>) => savePlayerPreferences(partial),
    [],
  );

  return {
    ...state,
    toggleSaved,
    removeSaved,
    toggleLike,
    removeProgress,
    clearAllProgress,
    rememberSearch,
    clearSearches,
    updatePlayerPrefs,
    isSaved: isMovieSaved,
    isLiked: isMovieLiked,
  };
}

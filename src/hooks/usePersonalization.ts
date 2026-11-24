'use client';

import { useCallback, useSyncExternalStore } from 'react';
import type { Movie, MovieInteraction, MovieProgress, SavedMovie } from '@/types';
import { STORAGE_EVENT } from '@/lib/storage/client';
import {
  LIKES_KEY,
  MY_LIST_KEY,
  RECENT_SEARCHES_KEY,
  WATCH_PROGRESS_KEY,
  getLikes,
  getMyList,
  getRecentSearches,
  getWatchProgress,
  isMovieLiked,
  isMovieSaved,
  removeWatchProgress,
  saveRecentSearch,
  toggleMovieLike,
  toggleSavedMovie,
} from '@/lib/storage/movie-personalization';

interface PersonalizationState {
  myList: SavedMovie[];
  watchProgress: MovieProgress[];
  likes: MovieInteraction[];
  recentSearches: string[];
}

const EMPTY_STATE: PersonalizationState = {
  myList: [],
  watchProgress: [],
  likes: [],
  recentSearches: [],
};

const STORAGE_KEYS = [MY_LIST_KEY, WATCH_PROGRESS_KEY, LIKES_KEY, RECENT_SEARCHES_KEY] as const;

function getSnapshot(): PersonalizationState {
  if (typeof window === 'undefined') {
    return EMPTY_STATE;
  }

  return {
    myList: getMyList(),
    watchProgress: getWatchProgress(),
    likes: getLikes(),
    recentSearches: getRecentSearches(),
  };
}

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

function getStorageVersion(): string {
  if (typeof window === 'undefined') {
    return 'server';
  }

  return STORAGE_KEYS.map((key) => window.localStorage.getItem(key) ?? '').join('|');
}

export function usePersonalization(): PersonalizationState & {
  toggleSaved: (movie: Movie) => boolean;
  toggleLike: (slug: string) => boolean;
  removeProgress: (slug: string) => void;
  rememberSearch: (keyword: string) => void;
  isSaved: (slug: string) => boolean;
  isLiked: (slug: string) => boolean;
} {
  const storageVersion = useSyncExternalStore(
    subscribe,
    getStorageVersion,
    () => 'server',
  );
  const state = storageVersion === 'server' ? EMPTY_STATE : getSnapshot();

  const toggleSaved = useCallback((movie: Movie) => toggleSavedMovie(movie), []);

  const toggleLike = useCallback((slug: string) => toggleMovieLike(slug), []);

  const removeProgress = useCallback((slug: string) => {
    removeWatchProgress(slug);
  }, []);

  const rememberSearch = useCallback((keyword: string) => {
    saveRecentSearch(keyword);
  }, []);

  return {
    ...state,
    toggleSaved,
    toggleLike,
    removeProgress,
    rememberSearch,
    isSaved: isMovieSaved,
    isLiked: isMovieLiked,
  };
}

'use client';

import type { Movie, MovieInteraction, MovieProgress, SavedMovie } from '@/types';
import { readStorageValue, writeStorageValue } from './client';

export const WATCH_PROGRESS_KEY = 'movie-app:watch-progress:v1';
export const MY_LIST_KEY = 'movie-app:my-list:v1';
export const LIKES_KEY = 'movie-app:likes:v1';
export const RECENT_SEARCHES_KEY = 'movie-app:recent-searches:v1';

const MAX_PROGRESS_ITEMS = 24;
const MAX_RECENT_SEARCHES = 8;

export function getWatchProgress(): MovieProgress[] {
  return readStorageValue<MovieProgress[]>(WATCH_PROGRESS_KEY, []).sort(
    (a, b) => b.updatedAt - a.updatedAt,
  );
}

export function saveWatchProgress(progress: MovieProgress): void {
  const next = [
    progress,
    ...getWatchProgress().filter(
      (item) => !(item.slug === progress.slug && item.episodeIndex === progress.episodeIndex),
    ),
  ].slice(0, MAX_PROGRESS_ITEMS);

  writeStorageValue(WATCH_PROGRESS_KEY, next);
}

export function removeWatchProgress(slug: string): void {
  writeStorageValue(
    WATCH_PROGRESS_KEY,
    getWatchProgress().filter((item) => item.slug !== slug),
  );
}

export function clearEpisodeProgress(slug: string, episodeIndex: number): void {
  writeStorageValue(
    WATCH_PROGRESS_KEY,
    getWatchProgress().filter(
      (item) => !(item.slug === slug && item.episodeIndex === episodeIndex),
    ),
  );
}

export function getMyList(): SavedMovie[] {
  return readStorageValue<SavedMovie[]>(MY_LIST_KEY, []).sort((a, b) => b.addedAt - a.addedAt);
}

export function isMovieSaved(slug: string): boolean {
  return getMyList().some((movie) => movie.slug === slug);
}

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
    addedAt: Date.now(),
  };

  writeStorageValue(MY_LIST_KEY, [savedMovie, ...currentList]);
  return true;
}

export function getLikes(): MovieInteraction[] {
  return readStorageValue<MovieInteraction[]>(LIKES_KEY, []);
}

export function isMovieLiked(slug: string): boolean {
  return getLikes().some((item) => item.slug === slug && item.liked);
}

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

export function getRecentSearches(): string[] {
  return readStorageValue<string[]>(RECENT_SEARCHES_KEY, []);
}

export function saveRecentSearch(keyword: string): void {
  const cleanKeyword = keyword.trim();
  if (!cleanKeyword) return;

  const next = [
    cleanKeyword,
    ...getRecentSearches().filter((item) => item.toLowerCase() !== cleanKeyword.toLowerCase()),
  ].slice(0, MAX_RECENT_SEARCHES);

  writeStorageValue(RECENT_SEARCHES_KEY, next);
}

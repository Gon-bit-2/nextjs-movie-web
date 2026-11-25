'use client';

import type {
  MovieInteraction,
  MovieProgress,
  PreferredServerLang,
  SavedMovie,
} from '@/types';
import { writeStorageValue } from './client';
import {
  DEFAULT_PLAYER_PREFS,
  LIKES_KEY,
  MAX_PROGRESS_ITEMS,
  MY_LIST_KEY,
  PLAYER_PREFS_KEY,
  RECENT_SEARCHES_KEY,
  WATCH_PROGRESS_KEY,
  getLikes,
  getMyList,
  getPlayerPreferences,
  getRecentSearches,
  getWatchProgress,
  type PlayerPreferences,
} from './movie-personalization';

export const BACKUP_APP_ID = 'phimhay';
export const BACKUP_VERSION = 1;

export interface PhimHayBackup {
  app: typeof BACKUP_APP_ID;
  version: typeof BACKUP_VERSION;
  exportedAt: string;
  watchProgress: MovieProgress[];
  myList: SavedMovie[];
  likes: MovieInteraction[];
  playerPrefs: PlayerPreferences;
  recentSearches: string[];
}

export interface BackupImportResult {
  watchCount: number;
  savedCount: number;
  likedCount: number;
}

const VALID_PREFERRED_LANGS = new Set<PreferredServerLang>([
  'vietsub',
  'thuyet-minh',
  'long-tieng',
]);

/**
 * Kiểm tra một mục dữ liệu có phải đối tượng bản ghi hợp lệ hay không
 */
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Đóng gói toàn bộ dữ liệu cá nhân hóa từ localStorage thành đối tượng sao lưu chuẩn PHIMHAY
 */
export function exportBackup(): PhimHayBackup {
  return {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt: new Date().toISOString(),
    watchProgress: getWatchProgress(),
    myList: getMyList(),
    likes: getLikes(),
    playerPrefs: getPlayerPreferences(),
    recentSearches: getRecentSearches(),
  };
}

/**
 * Giải mã và kiểm tra tính hợp lệ của chuỗi JSON sao lưu, loại bỏ các phần tử sai cấu trúc
 */
export function parseBackup(rawJson: string): PhimHayBackup {
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    throw new Error('Tệp không phải định dạng JSON hợp lệ.');
  }

  if (!isRecord(parsed)) {
    throw new Error('Cấu trúc tệp sao lưu không hợp lệ.');
  }

  if (parsed.app !== BACKUP_APP_ID) {
    throw new Error('Tệp sao lưu không phải của PHIMHAY.');
  }

  if (parsed.version !== BACKUP_VERSION) {
    throw new Error(`Phiên bản tệp sao lưu không được hỗ trợ (${String(parsed.version)}).`);
  }

  const watchProgress: MovieProgress[] = Array.isArray(parsed.watchProgress)
    ? parsed.watchProgress.filter(
        (item): item is MovieProgress =>
          isRecord(item) &&
          typeof item.slug === 'string' &&
          item.slug.length > 0 &&
          typeof item.episodeIndex === 'number' &&
          typeof item.currentTime === 'number' &&
          typeof item.updatedAt === 'number',
      )
    : [];

  const myList: SavedMovie[] = Array.isArray(parsed.myList)
    ? parsed.myList.filter(
        (item): item is SavedMovie =>
          isRecord(item) &&
          typeof item.slug === 'string' &&
          item.slug.length > 0 &&
          typeof item.name === 'string' &&
          typeof item.addedAt === 'number',
      )
    : [];

  const likes: MovieInteraction[] = Array.isArray(parsed.likes)
    ? parsed.likes.filter(
        (item): item is MovieInteraction =>
          isRecord(item) &&
          typeof item.slug === 'string' &&
          item.slug.length > 0 &&
          typeof item.liked === 'boolean' &&
          typeof item.updatedAt === 'number',
      )
    : [];

  const rawPrefs = isRecord(parsed.playerPrefs) ? parsed.playerPrefs : {};
  const preferredLangRaw = rawPrefs.preferredLang;
  const playerPrefs: PlayerPreferences = {
    autoNext:
      typeof rawPrefs.autoNext === 'boolean' ? rawPrefs.autoNext : DEFAULT_PLAYER_PREFS.autoNext,
    lightsOff:
      typeof rawPrefs.lightsOff === 'boolean'
        ? rawPrefs.lightsOff
        : DEFAULT_PLAYER_PREFS.lightsOff,
    preferredLang:
      typeof preferredLangRaw === 'string' &&
      VALID_PREFERRED_LANGS.has(preferredLangRaw as PreferredServerLang)
        ? (preferredLangRaw as PreferredServerLang)
        : null,
  };

  const recentSearches: string[] = Array.isArray(parsed.recentSearches)
    ? parsed.recentSearches.filter(
        (term): term is string => typeof term === 'string' && term.trim().length > 0,
      )
    : [];

  return {
    app: BACKUP_APP_ID,
    version: BACKUP_VERSION,
    exportedAt:
      typeof parsed.exportedAt === 'string' ? parsed.exportedAt : new Date().toISOString(),
    watchProgress,
    myList,
    likes,
    playerPrefs,
    recentSearches,
  };
}

/**
 * Nhập dữ liệu sao lưu vào localStorage theo chế độ gộp (giữ bản mới hơn theo thời gian) hoặc thay thế
 */
export function applyBackup(
  backup: PhimHayBackup,
  mode: 'merge' | 'replace' = 'merge',
): BackupImportResult {
  if (mode === 'replace') {
    const progress = [...backup.watchProgress]
      .sort((a, b) => b.updatedAt - a.updatedAt)
      .slice(0, MAX_PROGRESS_ITEMS);
    const list = [...backup.myList].sort((a, b) => b.addedAt - a.addedAt);
    const likes = [...backup.likes].sort((a, b) => b.updatedAt - a.updatedAt);

    writeStorageValue(WATCH_PROGRESS_KEY, progress);
    writeStorageValue(MY_LIST_KEY, list);
    writeStorageValue(LIKES_KEY, likes);
    writeStorageValue(PLAYER_PREFS_KEY, backup.playerPrefs);
    writeStorageValue(RECENT_SEARCHES_KEY, backup.recentSearches.slice(0, 8));

    return {
      watchCount: progress.length,
      savedCount: list.length,
      likedCount: likes.filter((l) => l.liked).length,
    };
  }

  // Chế độ gộp: ưu tiên bản ghi có updatedAt / addedAt mới hơn
  const progressMap = new Map<string, MovieProgress>();
  for (const item of [...getWatchProgress(), ...backup.watchProgress]) {
    const key = `${item.slug}::${item.episodeIndex}`;
    const existing = progressMap.get(key);
    if (!existing || item.updatedAt > existing.updatedAt) {
      progressMap.set(key, item);
    }
  }
  const mergedProgress = Array.from(progressMap.values())
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, MAX_PROGRESS_ITEMS);

  const listMap = new Map<string, SavedMovie>();
  for (const item of [...getMyList(), ...backup.myList]) {
    const existing = listMap.get(item.slug);
    if (!existing || item.addedAt > existing.addedAt) {
      listMap.set(item.slug, item);
    }
  }
  const mergedList = Array.from(listMap.values()).sort((a, b) => b.addedAt - a.addedAt);

  const likesMap = new Map<string, MovieInteraction>();
  for (const item of [...getLikes(), ...backup.likes]) {
    const existing = likesMap.get(item.slug);
    if (!existing || item.updatedAt > existing.updatedAt) {
      likesMap.set(item.slug, item);
    }
  }
  const mergedLikes = Array.from(likesMap.values()).sort((a, b) => b.updatedAt - a.updatedAt);

  const mergedSearches: string[] = [];
  const seenTerms = new Set<string>();
  for (const term of [...getRecentSearches(), ...backup.recentSearches]) {
    const lower = term.toLowerCase();
    if (!seenTerms.has(lower)) {
      seenTerms.add(lower);
      mergedSearches.push(term);
    }
  }

  const currentPrefs = getPlayerPreferences();
  const mergedPrefs: PlayerPreferences = {
    ...currentPrefs,
    preferredLang: currentPrefs.preferredLang ?? backup.playerPrefs.preferredLang,
  };

  writeStorageValue(WATCH_PROGRESS_KEY, mergedProgress);
  writeStorageValue(MY_LIST_KEY, mergedList);
  writeStorageValue(LIKES_KEY, mergedLikes);
  writeStorageValue(PLAYER_PREFS_KEY, mergedPrefs);
  writeStorageValue(RECENT_SEARCHES_KEY, mergedSearches.slice(0, 8));

  return {
    watchCount: mergedProgress.length,
    savedCount: mergedList.length,
    likedCount: mergedLikes.filter((l) => l.liked).length,
  };
}

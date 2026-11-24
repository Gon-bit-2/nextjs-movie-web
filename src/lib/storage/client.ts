'use client';

export const STORAGE_EVENT = 'movie-app-storage-change';

export function readStorageValue<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;

  try {
    const rawValue = window.localStorage.getItem(key);
    return rawValue ? (JSON.parse(rawValue) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function writeStorageValue<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;

  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
}

export function removeStorageValue(key: string): void {
  if (typeof window === 'undefined') return;

  window.localStorage.removeItem(key);
  window.dispatchEvent(new CustomEvent(STORAGE_EVENT, { detail: { key } }));
}

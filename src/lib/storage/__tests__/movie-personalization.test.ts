// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import {
  MAX_PROGRESS_ITEMS,
  clearAllWatchProgress,
  getEpisodeProgress,
  getLikes,
  getMyList,
  getWatchProgress,
  saveWatchProgress,
  toggleMovieLike,
  toggleSavedMovie,
} from '@/lib/storage/movie-personalization';
import type { Movie } from '@/types';

const SAMPLE_MOVIE: Movie = {
  _id: 'm2',
  name: 'Hỏa Thần',
  slug: 'hoa-than',
  origin_name: 'Firefighters',
  thumb_url: 'https://phimimg.com/hoa-than-thumb.webp',
  poster_url: 'https://phimimg.com/hoa-than-poster.webp',
  year: 2024,
  quality: 'FHD',
};

describe('movie-personalization.ts — quản lý tiến độ và thư viện cá nhân', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('tự đánh dấu completed=true khi xem đạt từ 92% thời lượng trở lên', () => {
    saveWatchProgress({
      slug: 'hoa-than',
      name: 'Hỏa Thần',
      episodeIndex: 0,
      currentTime: 930,
      duration: 1000,
      updatedAt: 1000,
    });

    expect(getWatchProgress()[0].completed).toBe(true);
  });

  it('đọc tương thích ngược key cũ watch-progress-* và xóa key cũ sau khi lưu mới', () => {
    window.localStorage.setItem('watch-progress-hoa-than-3', '420');
    const legacy = getEpisodeProgress('hoa-than', 3);
    expect(legacy?.currentTime).toBe(420);

    saveWatchProgress({
      slug: 'hoa-than',
      name: 'Hỏa Thần',
      episodeIndex: 3,
      currentTime: 450,
      duration: 3000,
      updatedAt: 2000,
    });
    expect(window.localStorage.getItem('watch-progress-hoa-than-3')).toBeNull();
  });

  it('giới hạn danh sách tiến độ tối đa MAX_PROGRESS_ITEMS (36 mục)', () => {
    for (let i = 0; i < MAX_PROGRESS_ITEMS + 10; i++) {
      saveWatchProgress({
        slug: `movie-${i}`,
        name: `Phim ${i}`,
        episodeIndex: 0,
        currentTime: 100,
        duration: 1000,
        updatedAt: 1000 + i,
      });
    }

    const list = getWatchProgress();
    expect(list).toHaveLength(MAX_PROGRESS_ITEMS);
    expect(list[0].slug).toBe(`movie-${MAX_PROGRESS_ITEMS + 9}`);
  });

  it('lưu kèm metadata khi thích phim bằng đối tượng Movie', () => {
    const liked = toggleMovieLike(SAMPLE_MOVIE);
    expect(liked).toBe(true);
    const savedLike = getLikes()[0];
    expect(savedLike.name).toBe('Hỏa Thần');
    expect(savedLike.poster_url).toBe('https://phimimg.com/hoa-than-poster.webp');
    expect(savedLike.year).toBe(2024);
  });

  it('clearAllWatchProgress chỉ xóa lịch sử xem, giữ nguyên Danh sách lưu và Yêu thích', () => {
    saveWatchProgress({
      slug: 'hoa-than',
      name: 'Hỏa Thần',
      episodeIndex: 0,
      currentTime: 200,
      duration: 1000,
      updatedAt: 1000,
    });
    toggleSavedMovie(SAMPLE_MOVIE);
    toggleMovieLike(SAMPLE_MOVIE);

    clearAllWatchProgress();
    expect(getWatchProgress()).toHaveLength(0);
    expect(getMyList()).toHaveLength(1);
    expect(getLikes()).toHaveLength(1);
  });
});

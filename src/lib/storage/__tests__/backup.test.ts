// @vitest-environment jsdom
import { beforeEach, describe, expect, it } from 'vitest';
import { applyBackup, exportBackup, parseBackup } from '@/lib/storage/backup';
import {
  getLikes,
  getMyList,
  getPlayerPreferences,
  getWatchProgress,
  savePlayerPreferences,
  saveWatchProgress,
  toggleMovieLike,
  toggleSavedMovie,
} from '@/lib/storage/movie-personalization';
import type { Movie } from '@/types';

const SAMPLE_MOVIE: Movie = {
  _id: 'm1',
  name: 'Mật Án Vigil',
  slug: 'mat-an-vigil',
  origin_name: 'Vigil',
  thumb_url: 'https://phimimg.com/thumb.webp',
  poster_url: 'https://phimimg.com/poster.webp',
  year: 2023,
};

describe('backup.ts — xuất, kiểm tra và khôi phục dữ liệu sao lưu JSON', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('xuất và nhập lại giữ nguyên toàn bộ dữ liệu cá nhân hóa', () => {
    saveWatchProgress({
      slug: 'mat-an-vigil',
      name: 'Mật Án Vigil',
      episodeIndex: 2,
      currentTime: 600,
      duration: 3600,
      updatedAt: 1000,
    });
    toggleSavedMovie(SAMPLE_MOVIE);
    toggleMovieLike(SAMPLE_MOVIE);
    savePlayerPreferences({ preferredLang: 'thuyet-minh', autoNext: false });

    const exported = exportBackup();
    const raw = JSON.stringify(exported);

    window.localStorage.clear();
    const parsed = parseBackup(raw);
    const result = applyBackup(parsed, 'replace');

    expect(result).toEqual({ watchCount: 1, savedCount: 1, likedCount: 1 });
    expect(getWatchProgress()[0].currentTime).toBe(600);
    expect(getMyList()[0].slug).toBe('mat-an-vigil');
    expect(getLikes()[0].name).toBe('Mật Án Vigil');
    expect(getPlayerPreferences().preferredLang).toBe('thuyet-minh');
    expect(getPlayerPreferences().autoNext).toBe(false);
  });

  it('từ chối tệp JSON hỏng, sai ứng dụng hoặc sai phiên bản', () => {
    expect(() => parseBackup('not json')).toThrow('JSON');
    expect(() => parseBackup(JSON.stringify({ app: 'other', version: 1 }))).toThrow('PHIMHAY');
    expect(() => parseBackup(JSON.stringify({ app: 'phimhay', version: 99 }))).toThrow('Phiên bản');
  });

  it('lọc bỏ các mục sai cấu trúc trong file sao lưu mà không làm hỏng bản ghi hợp lệ', () => {
    const raw = JSON.stringify({
      app: 'phimhay',
      version: 1,
      watchProgress: [
        { slug: 'ok-slug', name: 'OK', episodeIndex: 0, currentTime: 120, updatedAt: 2000 },
        { slug: '', episodeIndex: 'bad' },
      ],
      myList: [{ slug: 'saved-1', name: 'Phim 1', _id: '1', addedAt: 1500 }, { bad: true }],
      likes: [{ slug: 'liked-1', liked: true, updatedAt: 1500 }, null],
    });

    const parsed = parseBackup(raw);
    expect(parsed.watchProgress).toHaveLength(1);
    expect(parsed.myList).toHaveLength(1);
    expect(parsed.likes).toHaveLength(1);
  });

  it('chế độ gộp giữ lại bản ghi có updatedAt mới hơn cho cùng tập phim', () => {
    saveWatchProgress({
      slug: 'mat-an-vigil',
      name: 'Mật Án Vigil',
      episodeIndex: 0,
      currentTime: 300,
      duration: 3000,
      updatedAt: 5000,
    });

    const incoming = parseBackup(
      JSON.stringify({
        app: 'phimhay',
        version: 1,
        watchProgress: [
          // Cũ hơn bản hiện có -> phải giữ bản 300s (updatedAt=5000)
          {
            slug: 'mat-an-vigil',
            name: 'Mật Án Vigil',
            episodeIndex: 0,
            currentTime: 100,
            duration: 3000,
            updatedAt: 2000,
          },
          // Tập mới chưa có -> phải thêm vào
          {
            slug: 'mat-an-vigil',
            name: 'Mật Án Vigil',
            episodeIndex: 1,
            currentTime: 800,
            duration: 3000,
            updatedAt: 6000,
          },
        ],
        myList: [],
        likes: [],
      }),
    );

    applyBackup(incoming, 'merge');
    const progress = getWatchProgress();
    expect(progress).toHaveLength(2);
    expect(progress.find((p) => p.episodeIndex === 0)?.currentTime).toBe(300);
    expect(progress.find((p) => p.episodeIndex === 1)?.currentTime).toBe(800);
  });
});

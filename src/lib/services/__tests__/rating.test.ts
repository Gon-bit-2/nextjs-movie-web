import { describe, expect, it } from 'vitest';
import { getMovieScore, getShortLangLabel, getTmdbImageUrl } from '@/lib/services/normalize';

describe('rating & labels — điểm đánh giá và nhãn hiển thị', () => {
  it('ưu tiên điểm IMDb hơn TMDB khi cả hai đều lớn hơn 0', () => {
    const score = getMovieScore({
      imdb: { id: 'tt1', vote_average: 7.64, vote_count: 1000 },
      tmdb: { id: '99', type: 'tv', vote_average: 8.3, vote_count: 500 },
    });
    expect(score).toBe(7.6);
  });

  it('dự phòng sang điểm TMDB khi IMDb bằng 0 hoặc không có', () => {
    expect(
      getMovieScore({
        imdb: { id: 'tt1', vote_average: 0, vote_count: 0 },
        tmdb: { id: '99', type: 'movie', vote_average: 8.26, vote_count: 200 },
      }),
    ).toBe(8.3);
  });

  it('trả về null khi không có điểm hợp lệ', () => {
    expect(getMovieScore({})).toBeNull();
    expect(
      getMovieScore({
        imdb: { id: '', vote_average: 0, vote_count: 0 },
        tmdb: { id: '', type: 'movie', vote_average: 0, vote_count: 0 },
      }),
    ).toBeNull();
  });

  it('rút gọn đúng nhãn ngôn ngữ phổ biến của KKPhim', () => {
    expect(getShortLangLabel('Vietsub + Lồng Tiếng')).toBe('VS + LT');
    expect(getShortLangLabel('Vietsub + Thuyết Minh')).toBe('VS + TM');
    expect(getShortLangLabel('Thuyết Minh')).toBe('Thuyết minh');
    expect(getShortLangLabel('Lồng Tiếng')).toBe('Lồng tiếng');
    expect(getShortLangLabel('Vietsub')).toBe('Vietsub');
    expect(getShortLangLabel(undefined)).toBe('');
  });

  it('ghép URL ảnh TMDB chuẩn khi có hoặc không có dấu gạch chéo', () => {
    expect(getTmdbImageUrl('/abc.jpg', 'https://image.tmdb.org/t/p/w185/')).toBe(
      'https://image.tmdb.org/t/p/w185/abc.jpg',
    );
    expect(getTmdbImageUrl('abc.jpg', 'https://image.tmdb.org/t/p/w185')).toBe(
      'https://image.tmdb.org/t/p/w185/abc.jpg',
    );
    expect(getTmdbImageUrl(null, 'https://image.tmdb.org/t/p/w185')).toBe('');
  });
});

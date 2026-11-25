import { describe, expect, it } from 'vitest';
import {
  IMAGE_DOMAIN,
  getImageUrl,
  isApiSuccess,
  normalizeDetailResponse,
  normalizeListResponse,
} from '@/lib/services/normalize';
import type { Movie, MovieDetail } from '@/types';

const BASE_MOVIE: Movie = {
  _id: 'm1',
  name: 'Ngôi Trường Xác Sống',
  slug: 'ngoi-truong-xac-song',
  origin_name: 'All of Us Are Dead',
  thumb_url: 'uploads/movies/thumb.webp',
  poster_url: '/uploads/movies/poster.webp',
  year: 2022,
};

describe('normalize.ts — chuẩn hóa phản hồi API KKPhim', () => {
  it('nhận diện thành công cho cả boolean true và chuỗi "success"', () => {
    expect(isApiSuccess(true)).toBe(true);
    expect(isApiSuccess('success')).toBe(true);
    expect(isApiSuccess(false)).toBe(false);
    expect(isApiSuccess('error')).toBe(false);
    expect(isApiSuccess(undefined)).toBe(false);
  });

  it('chuẩn hóa đường dẫn ảnh tương đối, có dấu gạch đầu và URL tuyệt đối', () => {
    expect(getImageUrl('uploads/a.webp')).toBe(`${IMAGE_DOMAIN}/uploads/a.webp`);
    expect(getImageUrl('/uploads/a.webp')).toBe(`${IMAGE_DOMAIN}/uploads/a.webp`);
    expect(getImageUrl('https://cdn.example.com/a.webp')).toBe('https://cdn.example.com/a.webp');
    expect(getImageUrl('')).toBe('');
    expect(getImageUrl(undefined)).toBe('');
  });

  it('chuẩn hóa danh sách API v1 (status="success", pagination ở data.params.pagination và CDN riêng)', () => {
    const result = normalizeListResponse({
      status: 'success',
      data: {
        titlePage: 'Phim Bộ',
        APP_DOMAIN_CDN_IMAGE: 'https://cdn.phim.test/',
        items: [BASE_MOVIE],
        params: {
          pagination: {
            totalItems: 100,
            totalItemsPerPage: 24,
            currentPage: 1,
            totalPages: 5,
          },
          itemsUpdateInDay: 12,
        },
      },
    });

    expect(result).not.toBeNull();
    expect(result?.status).toBe(true);
    expect(result?.titlePage).toBe('Phim Bộ');
    expect(result?.itemsUpdateInDay).toBe(12);
    expect(result?.pagination?.totalPages).toBe(5);
    expect(result?.items[0].thumb_url).toBe('https://cdn.phim.test/uploads/movies/thumb.webp');
    expect(result?.items[0].poster_url).toBe('https://cdn.phim.test/uploads/movies/poster.webp');
  });

  it('chuẩn hóa danh sách bản cổ điển (pagination ở gốc)', () => {
    const result = normalizeListResponse({
      status: true,
      items: [BASE_MOVIE],
      pagination: {
        totalItems: 24,
        totalItemsPerPage: 24,
        currentPage: 1,
        totalPages: 1,
      },
    });

    expect(result?.status).toBe(true);
    expect(result?.pagination?.totalItems).toBe(24);
    expect(result?.items[0].thumb_url).toBe(`${IMAGE_DOMAIN}/uploads/movies/thumb.webp`);
  });

  it('trả về null khi dữ liệu đầu vào là null', () => {
    expect(normalizeListResponse(null)).toBeNull();
    expect(normalizeDetailResponse(null)).toBeNull();
  });

  it('chuẩn hóa chi tiết phim định dạng v1 (data.item chứa episodes và các mảng null thành rỗng)', () => {
    const rawItem = {
      ...BASE_MOVIE,
      content: 'Mô tả phim',
      type: 'series',
      status: 'completed',
      trailer_url: '',
      time: '60 phút/tập',
      episode_current: 'Hoàn tất',
      episode_total: 12,
      quality: 'FHD',
      lang: 'Vietsub',
      notify: '',
      showtimes: '',
      actor: null as unknown as string[],
      director: null as unknown as string[],
      category: null as unknown as MovieDetail['category'],
      country: null as unknown as MovieDetail['country'],
      episodes: [
        {
          server_name: 'Vietsub',
          is_ai: false,
          server_data: [
            {
              name: 'Tập 01',
              slug: 'tap-01',
              filename: 'ep1',
              link_embed: 'https://player.phimapi.com/player/?url=1',
              link_m3u8: 'https://s4.phim1280.tv/ep1.m3u8',
            },
          ],
        },
      ],
    };

    const result = normalizeDetailResponse({
      status: 'success',
      data: {
        item: rawItem,
        seoOnPage: { titleHead: 'SEO Title' },
      },
    });

    expect(result?.status).toBe(true);
    expect(result?.episodes).toHaveLength(1);
    expect(result?.movie.actor).toEqual([]);
    expect(result?.movie.director).toEqual([]);
    expect(result?.movie.category).toEqual([]);
    expect(result?.movie.country).toEqual([]);
    expect(result?.seoOnPage?.titleHead).toBe('SEO Title');
  });

  it('chuẩn hóa chi tiết phim định dạng cũ (movie tách riêng episodes)', () => {
    const legacyMovie = {
      ...BASE_MOVIE,
      content: 'Legacy',
      type: 'single',
      status: 'completed',
      trailer_url: '',
      time: '120 phút',
      episode_current: 'Full',
      episode_total: '1',
      quality: 'HD',
      lang: 'Vietsub',
      notify: '',
      showtimes: '',
      actor: ['Diễn viên A'],
      director: ['Đạo diễn B'],
      category: [],
      country: [],
    };

    const result = normalizeDetailResponse({
      status: true,
      msg: 'ok',
      movie: legacyMovie,
      episode: [{ server_name: 'Vietsub', server_data: [] }],
    });

    expect(result?.status).toBe(true);
    expect(result?.movie.name).toBe('Ngôi Trường Xác Sống');
    expect(result?.episodes).toHaveLength(1);
  });
});

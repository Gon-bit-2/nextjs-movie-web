import { describe, expect, it } from 'vitest';
import {
  buildApiFilterParams,
  buildFilteredHref,
  parseListFilters,
  parseYearFilter,
} from '@/lib/services/filters';

describe('filters.ts — kiểm tra và tạo tham số lọc API v1', () => {
  it('chấp nhận năm đơn và khoảng năm hợp lệ, loại bỏ khoảng ngược hoặc sai định dạng', () => {
    expect(parseYearFilter('2024')).toBe('2024');
    expect(parseYearFilter('2010,2019')).toBe('2010,2019');
    expect(parseYearFilter('2024,2014')).toBeUndefined();
    expect(parseYearFilter('1800')).toBeUndefined();
    expect(parseYearFilter('2024;drop')).toBeUndefined();
    expect(parseYearFilter('')).toBeUndefined();
  });

  it('lọc sạch page âm, giới hạn limit <= 64 và loại bỏ sort_field không hợp lệ', () => {
    const parsed = parseListFilters({
      page: '-3',
      limit: '200',
      category: 'hanh-dong',
      country: ['han-quoc', 'nhat-ban'],
      year: '2020,2025',
      sort_field: 'invalid_field',
      sort_type: 'asc',
      sort_lang: 'thuyet-minh',
    });

    expect(parsed.page).toBeUndefined();
    expect(parsed.limit).toBe(64);
    expect(parsed.category).toBe('hanh-dong');
    expect(parsed.country).toBe('han-quoc');
    expect(parsed.year).toBe('2020,2025');
    expect(parsed.sort_field).toBeUndefined();
    expect(parsed.sort_type).toBe('asc');
    expect(parsed.sort_lang).toBe('thuyet-minh');
  });

  it('tạo query params cho API đúng và chặn limit vượt 64', () => {
    const params = buildApiFilterParams({
      page: 2,
      limit: 120,
      country: 'han-quoc',
      year: '2020,2025',
      sort_field: 'year',
      sort_type: 'desc',
    });

    expect(params.get('page')).toBe('2');
    expect(params.get('limit')).toBe('64');
    expect(params.get('country')).toBe('han-quoc');
    expect(params.get('year')).toBe('2020,2025');
    expect(params.get('sort_field')).toBe('year');
  });

  it('buildFilteredHref giữ nguyên từ khóa tìm kiếm và bỏ qua page/limit', () => {
    const href = buildFilteredHref(
      '/tim-kiem',
      { page: 3, limit: 24, country: 'han-quoc', year: '2024' },
      { keyword: 'vigil' },
    );

    expect(href).toContain('/tim-kiem?');
    expect(href).toContain('country=han-quoc');
    expect(href).toContain('year=2024');
    expect(href).toContain('keyword=vigil');
    expect(href).not.toContain('page=');
    expect(href).not.toContain('limit=');
  });

  it('buildFilteredHref trả về đường dẫn gốc khi không có bộ lọc nào', () => {
    expect(buildFilteredHref('/danh-sach/phim-bo', {})).toBe('/danh-sach/phim-bo');
  });
});

import type { ListFilters } from '@/types';

const VALID_SORT_FIELDS = new Set<NonNullable<ListFilters['sort_field']>>([
  'modified.time',
  '_id',
  'year',
]);

const VALID_SORT_TYPES = new Set<NonNullable<ListFilters['sort_type']>>(['asc', 'desc']);

const VALID_SORT_LANGS = new Set<NonNullable<ListFilters['sort_lang']>>([
  'vietsub',
  'thuyet-minh',
  'long-tieng',
]);

/**
 * Lấy giá trị chuỗi đơn đầu tiên từ tham số searchParams của Next.js
 */
function pickSingle(value: string | string[] | undefined): string | undefined {
  if (Array.isArray(value)) return value[0]?.trim() || undefined;
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

/**
 * Chuyển đổi searchParams trên URL thành đối tượng ListFilters hợp lệ cho API v1
 */
export function parseListFilters(
  searchParams: Record<string, string | string[] | undefined>,
): ListFilters {
  const pageRaw = pickSingle(searchParams.page);
  const limitRaw = pickSingle(searchParams.limit);
  const sortFieldRaw = pickSingle(searchParams.sort_field);
  const sortTypeRaw = pickSingle(searchParams.sort_type);
  const sortLangRaw = pickSingle(searchParams.sort_lang);

  const page = pageRaw ? Math.max(1, parseInt(pageRaw, 10) || 1) : undefined;
  const limit = limitRaw ? Math.min(64, Math.max(1, parseInt(limitRaw, 10) || 24)) : undefined;

  return {
    page,
    limit,
    category: pickSingle(searchParams.category),
    country: pickSingle(searchParams.country),
    year: pickSingle(searchParams.year),
    sort_field:
      sortFieldRaw && VALID_SORT_FIELDS.has(sortFieldRaw as NonNullable<ListFilters['sort_field']>)
        ? (sortFieldRaw as ListFilters['sort_field'])
        : undefined,
    sort_type:
      sortTypeRaw && VALID_SORT_TYPES.has(sortTypeRaw as NonNullable<ListFilters['sort_type']>)
        ? (sortTypeRaw as ListFilters['sort_type'])
        : undefined,
    sort_lang:
      sortLangRaw && VALID_SORT_LANGS.has(sortLangRaw as NonNullable<ListFilters['sort_lang']>)
        ? (sortLangRaw as ListFilters['sort_lang'])
        : undefined,
  };
}

/**
 * Tạo chuỗi query string từ ListFilters để gọi API KKPhim v1
 */
export function buildApiFilterParams(filters: ListFilters = {}): URLSearchParams {
  const params = new URLSearchParams();

  if (filters.page && filters.page > 0) params.set('page', String(filters.page));
  if (filters.limit && filters.limit > 0) params.set('limit', String(Math.min(64, filters.limit)));
  if (filters.category) params.set('category', filters.category);
  if (filters.country) params.set('country', filters.country);
  if (filters.year) params.set('year', filters.year);
  if (filters.sort_field) params.set('sort_field', filters.sort_field);
  if (filters.sort_type) params.set('sort_type', filters.sort_type);
  if (filters.sort_lang) params.set('sort_lang', filters.sort_lang);

  return params;
}

/**
 * Tạo đường dẫn URL nội bộ kèm bộ lọc và từ khóa tìm kiếm (nếu có)
 */
export function buildFilteredHref(
  basePath: string,
  filters: ListFilters,
  extra?: Record<string, string | undefined>,
): string {
  const params = buildApiFilterParams({ ...filters, page: undefined, limit: undefined });

  if (extra) {
    Object.entries(extra).forEach(([key, value]) => {
      if (value && value.trim()) {
        params.set(key, value.trim());
      }
    });
  }

  const query = params.toString();
  return query ? `${basePath}?${query}` : basePath;
}

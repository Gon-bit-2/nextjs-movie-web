import type { ApiDetailResponse, ApiListResponse, Episode, Movie } from '@/types';

const API_DOMAIN = 'https://phimapi.com';
export const IMAGE_DOMAIN = 'https://phimimg.com';
const LIST_REVALIDATE_SECONDS = 3600;
const DETAIL_REVALIDATE_SECONDS = 86400;
const SEARCH_REVALIDATE_SECONDS = 300;

type RawListResponse = ApiListResponse & {
  data?: ApiListResponse & {
    items?: Movie[];
    params?: {
      pagination?: ApiListResponse['pagination'];
    };
  };
};

type RawDetailResponse = ApiDetailResponse & {
  episode?: Episode[];
};

export function getImageUrl(path: string | undefined): string {
  if (!path) return '';
  // Nếu đã là link đầy đủ thì trả về nguyên bản
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${IMAGE_DOMAIN}/${cleanPath}`;
}

function normalizePagination(data: RawListResponse): ApiListResponse['pagination'] {
  return data.pagination ?? data.data?.pagination ?? data.data?.params?.pagination;
}

function normalizeListResponse(data: RawListResponse | null): ApiListResponse | null {
  if (!data) return null;

  const source = data.data ?? data;
  const items = Array.isArray(source.items) ? source.items : [];

  return {
    status: Boolean(data.status ?? source.status ?? items.length),
    items,
    pagination: normalizePagination(data),
    pathImage: source.pathImage ?? data.pathImage ?? IMAGE_DOMAIN,
  };
}

function normalizeDetailResponse(data: RawDetailResponse | null): ApiDetailResponse | null {
  if (!data?.movie) return null;

  const episodes = Array.isArray(data.episodes) ? data.episodes : data.episode || [];

  return {
    status: Boolean(data.status),
    msg: data.msg ?? '',
    movie: data.movie,
    episodes,
    servers: episodes,
  };
}

async function fetchJson<T>(url: string, revalidate: number, tags: string[]): Promise<T | null> {
  const res = await fetch(url, {
    next: { revalidate, tags },
  });

  if (!res.ok) return null;
  return (await res.json()) as T;
}

/**
 * Lấy danh sách phim mới cập nhật (dành cho Home Banner/Row)
 */
export async function getNewMovies(page: number = 1): Promise<ApiListResponse | null> {
  try {
    const data = await fetchJson<RawListResponse>(
      `${API_DOMAIN}/danh-sach/phim-moi-cap-nhat?page=${page}`,
      LIST_REVALIDATE_SECONDS,
      ['movies', 'movies:new'],
    );
    return normalizeListResponse(data);
  } catch (error) {
    console.error('Lỗi khi fetch phim mới cập nhật:', error);
    return null;
  }
}

/**
 * Lấy danh sách phim theo danh mục (phim-bo, phim-le, hoat-hinh, etc.)
 */
export async function getMoviesByCategory(
  categorySlug: string,
  page: number = 1,
): Promise<ApiListResponse | null> {
  try {
    const endpoint =
      categorySlug === 'phim-moi'
        ? `${API_DOMAIN}/danh-sach/phim-moi-cap-nhat?page=${page}`
        : `${API_DOMAIN}/v1/api/danh-sach/${categorySlug}?page=${page}`;
    const data = await fetchJson<RawListResponse>(endpoint, LIST_REVALIDATE_SECONDS, [
      'movies',
      `category:${categorySlug}`,
    ]);

    return normalizeListResponse(data);
  } catch (error) {
    console.error(`Lỗi khi fetch danh mục ${categorySlug}:`, error);
    return null;
  }
}

/**
 * Lấy danh sách phim theo thể loại (hanh-dong, tinh-cam, etc.)
 */
export async function getMoviesByGenre(
  genreSlug: string,
  page: number = 1,
): Promise<ApiListResponse | null> {
  try {
    const data = await fetchJson<RawListResponse>(
      `${API_DOMAIN}/v1/api/the-loai/${genreSlug}?page=${page}`,
      LIST_REVALIDATE_SECONDS,
      ['movies', `genre:${genreSlug}`],
    );

    return normalizeListResponse(data);
  } catch (error) {
    console.error(`Lỗi khi fetch thể loại ${genreSlug}:`, error);
    return null;
  }
}

/**
 * Lấy chi tiết phim
 */
export async function getMovieDetail(slug: string): Promise<ApiDetailResponse | null> {
  try {
    const data = await fetchJson<RawDetailResponse>(
      `${API_DOMAIN}/phim/${slug}`,
      DETAIL_REVALIDATE_SECONDS,
      ['movies', `movie:${slug}`],
    );

    return normalizeDetailResponse(data);
  } catch (error) {
    console.error(`Lỗi khi fetch phim ${slug}:`, error);
    return null;
  }
}

/**
 * Tìm kiếm phim theo keyword
 */
export async function searchMovies(
  keyword: string,
  limit: number = 24,
  page: number = 1,
): Promise<ApiListResponse | null> {
  if (!keyword) return null;
  try {
    const data = await fetchJson<RawListResponse>(
      `${API_DOMAIN}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=${limit}&page=${page}`,
      SEARCH_REVALIDATE_SECONDS,
      ['movies', 'search'],
    );

    return normalizeListResponse(data);
  } catch (error) {
    console.error(`Lỗi khi tìm kiếm ${keyword}:`, error);
    return null;
  }
}

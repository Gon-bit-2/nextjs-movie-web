'use server';

import {
  getMoviesByCategory,
  getMoviesByCountry,
  getMoviesByGenre,
  getMoviesByYear,
  searchMovies,
} from '@/lib/services/movie';
import type { ListFilters, Movie } from '@/types';

export type LoadMoreType = 'category' | 'genre' | 'country' | 'year' | 'search';

/**
 * Server Action tải thêm trang phim cho danh sách vô hạn, giữ nguyên bộ lọc đang chọn
 */
export async function loadMoreMovies(
  type: LoadMoreType,
  slugOrKeyword: string,
  page: number,
  filters: ListFilters = {},
): Promise<{ items: Movie[]; hasMore: boolean }> {
  try {
    let data = null;

    if (type === 'category') {
      data = await getMoviesByCategory(slugOrKeyword, page, filters);
    } else if (type === 'genre') {
      data = await getMoviesByGenre(slugOrKeyword, page, filters);
    } else if (type === 'country') {
      data = await getMoviesByCountry(slugOrKeyword, page, filters);
    } else if (type === 'year') {
      data = await getMoviesByYear(slugOrKeyword, page, filters);
    } else if (type === 'search') {
      data = await searchMovies(slugOrKeyword, filters.limit ?? 24, page, filters);
    }

    const items = data?.items || [];
    const pagination = data?.pagination;
    const hasMore = pagination
      ? pagination.currentPage < pagination.totalPages
      : items.length > 0;

    return { items, hasMore };
  } catch (error) {
    console.error('Lỗi khi tải thêm danh sách phim:', error);
    return { items: [], hasMore: false };
  }
}

/**
 * Server Action gợi ý tìm kiếm nhanh tức thì cho thanh Command Palette
 */
export async function searchMoviesAction(keyword: string, limit: number = 8): Promise<Movie[]> {
  try {
    const data = await searchMovies(keyword, limit, 1);
    return data?.items || [];
  } catch (error) {
    console.error('Lỗi khi tìm kiếm gợi ý phim:', error);
    return [];
  }
}

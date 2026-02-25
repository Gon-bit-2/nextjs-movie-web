'use server';

import { getMoviesByCategory, searchMovies } from '@/lib/services/movie';

export async function loadMoreMovies(
  type: 'category' | 'search',
  slugOrKeyword: string,
  page: number,
) {
  try {
    if (type === 'category') {
      const data = await getMoviesByCategory(slugOrKeyword, page);
      return data?.items || [];
    } else if (type === 'search') {
      const data = await searchMovies(slugOrKeyword, 24, page);
      return data?.items || [];
    }
  } catch (error) {
    console.error('Lỗi khi fetch load more data:', error);
  }
  return [];
}

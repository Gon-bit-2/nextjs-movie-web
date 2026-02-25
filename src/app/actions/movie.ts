'use server';

import { getMoviesByCategory, searchMovies, getMoviesByGenre } from '@/lib/services/movie';

export async function loadMoreMovies(
  type: 'category' | 'search' | 'genre',
  slugOrKeyword: string,
  page: number,
) {
  try {
    if (type === 'category') {
      const data = await getMoviesByCategory(slugOrKeyword, page);
      return data?.items || [];
    } else if (type === 'genre') {
      const data = await getMoviesByGenre(slugOrKeyword, page);
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

export async function searchMoviesAction(keyword: string, limit: number = 5) {
  try {
    const data = await searchMovies(keyword, limit, 1);
    return data?.items || [];
  } catch (error) {
    console.error('Lỗi khi fetch search auto-suggest:', error);
    return [];
  }
}

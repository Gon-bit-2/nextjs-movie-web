import type { Movie } from '@/types';

export type MovieSortKey = 'latest' | 'year-desc' | 'year-asc' | 'name-asc';

export function sortMovies(movies: Movie[], sort: MovieSortKey): Movie[] {
  const sortedMovies = [...movies];

  switch (sort) {
    case 'year-desc':
      return sortedMovies.sort((a, b) => (b.year || 0) - (a.year || 0));
    case 'year-asc':
      return sortedMovies.sort((a, b) => (a.year || 0) - (b.year || 0));
    case 'name-asc':
      return sortedMovies.sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    case 'latest':
    default:
      return sortedMovies;
  }
}

export function getMovieSortKey(value: string | string[] | undefined): MovieSortKey {
  if (value === 'year-desc' || value === 'year-asc' || value === 'name-asc') return value;
  return 'latest';
}

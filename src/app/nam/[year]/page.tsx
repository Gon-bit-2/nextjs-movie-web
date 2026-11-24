import type { Metadata } from 'next';
import {
  getCountries,
  getGenres,
  getMoviesByYear,
  getYears,
} from '@/lib/services/movie';
import { parseListFilters } from '@/lib/services/filters';
import MovieListingView from '@/components/movies/MovieListingView';

export const revalidate = 1800;

interface YearPageProps {
  params: Promise<{ year: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Tạo tiêu đề SEO cho trang danh sách phim theo năm phát hành
 */
export async function generateMetadata({ params }: YearPageProps): Promise<Metadata> {
  const { year } = await params;
  return { title: `Phim năm ${year}` };
}

/**
 * Trang danh sách phim theo năm phát hành (/nam/[year]) mới từ API v1
 */
export default async function YearPage({ params, searchParams }: YearPageProps) {
  const { year } = await params;
  const rawSearchParams = await searchParams;
  const filters = parseListFilters(rawSearchParams);

  const [data, genres, countries, years] = await Promise.all([
    getMoviesByYear(year, 1, filters),
    getGenres(),
    getCountries(),
    getYears(),
  ]);

  return (
    <MovieListingView
      title={`Phim phát hành năm ${year}`}
      basePath={`/nam/${year}`}
      loadMoreType="year"
      slugOrKeyword={year}
      data={data}
      filters={filters}
      genres={genres}
      countries={countries}
      years={years}
      hideYear
    />
  );
}

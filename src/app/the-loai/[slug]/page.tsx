import type { Metadata } from 'next';
import {
  getCountries,
  getGenres,
  getMoviesByGenre,
  getYears,
} from '@/lib/services/movie';
import { parseListFilters } from '@/lib/services/filters';
import { getGenreLabel } from '@/config/navigation';
import MovieListingView from '@/components/movies/MovieListingView';

export const revalidate = 1800;

interface GenrePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Tạo tiêu đề SEO cho trang thể loại phim
 */
export async function generateMetadata({ params }: GenrePageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: `Thể loại: ${getGenreLabel(slug)}` };
}

/**
 * Trang danh sách phim theo thể loại (/the-loai/[slug]) kèm bộ lọc Quốc gia, Năm, Ngôn ngữ, Sắp xếp
 */
export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  const { slug } = await params;
  const rawSearchParams = await searchParams;
  const filters = parseListFilters(rawSearchParams);

  const [data, genres, countries, years] = await Promise.all([
    getMoviesByGenre(slug, 1, filters),
    getGenres(),
    getCountries(),
    getYears(),
  ]);

  const title = genres.find((g) => g.slug === slug)?.name ?? getGenreLabel(slug);

  return (
    <MovieListingView
      title={`Thể loại: ${title}`}
      basePath={`/the-loai/${slug}`}
      loadMoreType="genre"
      slugOrKeyword={slug}
      data={data}
      filters={filters}
      genres={genres}
      countries={countries}
      years={years}
      hideGenre
    />
  );
}

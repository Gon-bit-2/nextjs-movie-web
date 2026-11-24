import type { Metadata } from 'next';
import {
  getCountries,
  getGenres,
  getMoviesByCategory,
  getYears,
} from '@/lib/services/movie';
import { parseListFilters } from '@/lib/services/filters';
import { getCategoryLabel } from '@/config/navigation';
import MovieListingView from '@/components/movies/MovieListingView';

export const revalidate = 1800;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Tạo tiêu đề SEO cho trang danh mục phim
 */
export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  return { title: getCategoryLabel(slug) };
}

/**
 * Trang danh sách theo danh mục (/danh-sach/[slug]) hỗ trợ đầy đủ bộ lọc phía server v1
 */
export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const rawSearchParams = await searchParams;
  const filters = parseListFilters(rawSearchParams);

  const [data, genres, countries, years] = await Promise.all([
    getMoviesByCategory(slug, 1, filters),
    getGenres(),
    getCountries(),
    getYears(),
  ]);

  return (
    <MovieListingView
      title={getCategoryLabel(slug)}
      basePath={`/danh-sach/${slug}`}
      loadMoreType="category"
      slugOrKeyword={slug}
      data={data}
      filters={filters}
      genres={genres}
      countries={countries}
      years={years}
    />
  );
}

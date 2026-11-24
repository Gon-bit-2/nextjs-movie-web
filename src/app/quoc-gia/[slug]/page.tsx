import type { Metadata } from 'next';
import {
  getCountries,
  getGenres,
  getMoviesByCountry,
  getYears,
} from '@/lib/services/movie';
import { parseListFilters } from '@/lib/services/filters';
import MovieListingView from '@/components/movies/MovieListingView';

export const revalidate = 1800;

interface CountryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Tạo tiêu đề SEO cho trang danh sách phim theo quốc gia
 */
export async function generateMetadata({ params }: CountryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const countries = await getCountries();
  const label = countries.find((c) => c.slug === slug)?.name ?? slug.replace(/-/g, ' ');
  return { title: `Phim ${label}` };
}

/**
 * Trang danh sách phim theo quốc gia (/quoc-gia/[slug]) mới từ API v1
 */
export default async function CountryPage({ params, searchParams }: CountryPageProps) {
  const { slug } = await params;
  const rawSearchParams = await searchParams;
  const filters = parseListFilters(rawSearchParams);

  const [data, genres, countries, years] = await Promise.all([
    getMoviesByCountry(slug, 1, filters),
    getGenres(),
    getCountries(),
    getYears(),
  ]);

  const label = countries.find((c) => c.slug === slug)?.name ?? slug.replace(/-/g, ' ');

  return (
    <MovieListingView
      title={`Phim ${label}`}
      basePath={`/quoc-gia/${slug}`}
      loadMoreType="country"
      slugOrKeyword={slug}
      data={data}
      filters={filters}
      genres={genres}
      countries={countries}
      years={years}
      hideCountry
    />
  );
}

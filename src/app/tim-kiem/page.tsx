import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import {
  getCountries,
  getGenres,
  getYears,
  searchMovies,
} from '@/lib/services/movie';
import { parseListFilters } from '@/lib/services/filters';
import Breadcrumb from '@/components/common/Breadcrumb';
import MovieCard from '@/components/common/MovieCard';
import LoadMore from '@/components/common/LoadMore';
import FilterBar from '@/components/movies/FilterBar';

export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Tạo tiêu đề động cho trang tìm kiếm
 */
export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { keyword } = await searchParams;
  const query = typeof keyword === 'string' ? keyword.trim() : '';
  return { title: query ? `Tìm kiếm: ${query}` : 'Tìm kiếm phim' };
}

/**
 * Trang tìm kiếm phim (/tim-kiem) kết hợp bộ lọc đa tiêu chí phía server v1
 */
export default async function SearchPage({ searchParams }: SearchPageProps) {
  const rawParams = await searchParams;
  const query = typeof rawParams.keyword === 'string' ? rawParams.keyword.trim() : '';
  const filters = parseListFilters(rawParams);

  const [data, genres, countries, years] = await Promise.all([
    query ? searchMovies(query, 24, 1, filters) : Promise.resolve(null),
    getGenres(),
    getCountries(),
    getYears(),
  ]);

  const movies = data?.items || [];
  const totalItems = data?.pagination?.totalItems;
  const initialHasMore = data?.pagination
    ? data.pagination.currentPage < data.pagination.totalPages
    : movies.length >= 24;

  return (
    <div className="mx-auto min-h-[80vh] max-w-[1600px] px-4 pt-20 pb-16 md:px-8 md:pt-24 xl:px-12">
      <Breadcrumb currentLabel="Tìm kiếm" />

      <h1 className="font-display mb-5 text-3xl font-bold tracking-wide text-white uppercase md:text-4xl">
        {query ? `Kết quả cho "${query}"` : 'Tìm kiếm phim'}
      </h1>

      {/* Ô tìm kiếm chính */}
      <form action="/tim-kiem" method="GET" className="relative mb-6 max-w-2xl">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-[#9A9AA8]" />
        <input
          type="text"
          name="keyword"
          defaultValue={query}
          placeholder="Nhập tên phim tiếng Việt, tên gốc hoặc từ khóa..."
          className="w-full rounded-xl border border-white/15 bg-[#14141A] py-3.5 pr-24 pl-12 text-sm text-white placeholder-[#9A9AA8] transition focus:border-[#E50914] focus:outline-none sm:text-base"
          required
        />
        <button
          type="submit"
          className="absolute top-1.5 right-1.5 bottom-1.5 rounded-lg bg-[#E50914] px-5 text-xs font-bold tracking-wide text-white uppercase transition hover:bg-[#f40612]"
        >
          Tìm kiếm
        </button>
      </form>

      {query ? (
        <>
          <FilterBar
            basePath="/tim-kiem"
            filters={filters}
            genres={genres}
            countries={countries}
            years={years}
            extraParams={{ keyword: query }}
          />

          {typeof totalItems === 'number' && totalItems > 0 && (
            <p className="mb-4 text-xs text-[#9A9AA8]">
              Tìm thấy {totalItems.toLocaleString('vi-VN')} kết quả phù hợp
            </p>
          )}

          {movies.length === 0 ? (
            <div className="rounded-xl border border-white/10 bg-[#14141A] px-6 py-20 text-center">
              <p className="text-lg font-semibold text-white">
                Không tìm thấy phim phù hợp với &ldquo;{query}&rdquo;
              </p>
              <p className="mt-1.5 text-sm text-[#9A9AA8]">
                Thử tìm bằng tên tiếng Anh hoặc bỏ bớt tiêu chí lọc.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} variant="poster" />
              ))}
              <LoadMore
                type="search"
                slugOrKeyword={query}
                filters={filters}
                initialHasMore={initialHasMore}
              />
            </div>
          )}
        </>
      ) : (
        <div className="rounded-xl border border-white/10 bg-[#14141A] p-6 md:p-8">
          <p className="mb-4 text-sm text-[#9A9AA8]">
            Gợi ý khám phá nhanh theo thể loại phổ biến:
          </p>
          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 16).map((genre) => (
              <Link
                key={genre.slug}
                href={`/the-loai/${genre.slug}`}
                className="rounded-full border border-white/10 bg-[#1E1E26] px-3.5 py-1.5 text-xs font-medium text-[#F2F2F5] transition hover:border-[#E50914]/60 hover:bg-[#E50914]/15"
              >
                {genre.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

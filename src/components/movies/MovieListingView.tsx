import Link from 'next/link';
import { Film } from 'lucide-react';
import type { ApiListResponse, ListFilters, Taxonomy } from '@/types';
import type { LoadMoreType } from '@/app/actions/movie';
import Breadcrumb from '@/components/common/Breadcrumb';
import MovieCard from '@/components/common/MovieCard';
import LoadMore from '@/components/common/LoadMore';
import FilterBar from '@/components/movies/FilterBar';

interface MovieListingViewProps {
  title: string;
  basePath: string;
  loadMoreType: LoadMoreType;
  slugOrKeyword: string;
  data: ApiListResponse | null;
  filters: ListFilters;
  genres: Taxonomy[];
  countries: Taxonomy[];
  years: number[];
  hideGenre?: boolean;
  hideCountry?: boolean;
  hideYear?: boolean;
}

/**
 * Khung giao diện danh sách phim dùng chung cho Danh mục, Thể loại, Quốc gia và Năm phát hành
 */
export default function MovieListingView({
  title,
  basePath,
  loadMoreType,
  slugOrKeyword,
  data,
  filters,
  genres,
  countries,
  years,
  hideGenre,
  hideCountry,
  hideYear,
}: MovieListingViewProps) {
  const movies = data?.items || [];
  const totalItems = data?.pagination?.totalItems;
  const initialHasMore = data?.pagination
    ? data.pagination.currentPage < data.pagination.totalPages
    : movies.length >= 12;

  return (
    <div className="mx-auto min-h-[80vh] max-w-[1600px] px-4 pt-20 pb-16 md:px-8 md:pt-24 xl:px-12">
      <Breadcrumb items={data?.breadCrumb} currentLabel={title} />

      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold tracking-wide text-white uppercase md:text-4xl">
            {data?.titlePage || title}
          </h1>
          {typeof totalItems === 'number' && totalItems > 0 && (
            <p className="mt-1 text-xs text-[#9A9AA8]">
              {totalItems.toLocaleString('vi-VN')} bộ phim
            </p>
          )}
        </div>
      </div>

      <FilterBar
        basePath={basePath}
        filters={filters}
        genres={genres}
        countries={countries}
        years={years}
        hideGenre={hideGenre}
        hideCountry={hideCountry}
        hideYear={hideYear}
      />

      {movies.length === 0 ? (
        <div className="rounded-xl border border-white/10 bg-[#14141A] px-6 py-20 text-center">
          <Film className="mx-auto mb-3 h-10 w-10 text-[#9A9AA8]" />
          <h2 className="text-lg font-semibold text-white">Không tìm thấy phim phù hợp</h2>
          <p className="mt-1 text-sm text-[#9A9AA8]">
            Hãy thử bỏ bớt tiêu chí lọc hoặc khám phá danh mục phim mới cập nhật.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2.5">
            <Link
              href={basePath}
              className="rounded-lg bg-[#E50914] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#f40612]"
            >
              Đặt lại bộ lọc
            </Link>
            <Link
              href="/danh-sach/phim-moi"
              className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
            >
              Xem phim mới
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} variant="poster" />
          ))}
          <LoadMore
            type={loadMoreType}
            slugOrKeyword={slugOrKeyword}
            filters={filters}
            initialHasMore={initialHasMore}
          />
        </div>
      )}
    </div>
  );
}

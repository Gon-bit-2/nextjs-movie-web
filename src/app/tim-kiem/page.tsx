import MovieCard from '@/components/common/MovieCard';
import { searchMovies } from '@/lib/services/movie';
import { Movie } from '@/types';
import LoadMore from '@/components/common/LoadMore';
import DiscoverySidebar from '@/components/movies/DiscoverySidebar';
import SortLinks from '@/components/movies/SortLinks';
import { getMovieSortKey, sortMovies } from '@/lib/movies/sort';

// Dynamic rendering for search pages
export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { keyword, sort } = await searchParams;
  const query = typeof keyword === 'string' ? keyword : '';
  const activeSort = getMovieSortKey(sort);

  let movies: Movie[] = [];
  let isSearched = false;

  if (query) {
    const data = await searchMovies(query, 24);
    movies = sortMovies(data?.items || [], activeSort);
    isSearched = true;
  }

  return (
    <div className="flex min-h-[80vh] flex-col gap-8 px-4 pt-24 md:flex-row md:px-12">
      <DiscoverySidebar />

      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-8 max-w-2xl">
          <form action="/tim-kiem" method="GET" className="group relative">
            <input
              type="text"
              name="keyword"
              defaultValue={query}
              placeholder="Nhập tên phim, đạo diễn, diễn viên..."
              className="w-full rounded-full border border-gray-700 bg-gray-900 py-3 pr-14 pl-6 text-white shadow-inner transition-all hover:bg-gray-800 focus:border-gray-500 focus:bg-black focus:outline-none"
              required
            />
            <button
              type="submit"
              className="bg-netflix hover:bg-netflix-hover absolute top-1.5 right-1.5 bottom-1.5 rounded-full px-5 font-bold text-white transition-colors"
            >
              Tìm
            </button>
          </form>
        </div>

        <div className="min-h-[50vh]">
          {query ? (
            <>
              <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h2 className="text-xl text-gray-400">
                  Kết quả tìm kiếm cho: <strong className="text-white">&quot;{query}&quot;</strong>
                </h2>
                <SortLinks basePath="/tim-kiem" activeSort={activeSort} keyword={query} />
              </div>

              {!isSearched || movies.length === 0 ? (
                <div className="rounded-lg border border-gray-800 bg-black/50 py-20 text-center">
                  <p className="text-lg text-gray-500">
                    Rất tiếc, không tìm thấy phim nào phù hợp.
                  </p>
                  <p className="mt-2 text-gray-600">Vui lòng thử lại với từ khóa khác.</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-6 xl:grid-cols-5">
                  {movies.map((movie) => (
                    <MovieCard key={movie._id} movie={movie} />
                  ))}
                  <LoadMore type="search" slugOrKeyword={query} />
                </div>
              )}
            </>
          ) : (
            <div className="rounded-lg border border-gray-800 bg-black/50 py-20 text-center">
              <p className="text-lg text-gray-500">Khám phá hàng ngàn bộ phim trên hệ thống.</p>
              <p className="mt-2 text-gray-600">
                Sử dụng thanh tìm kiếm hoặc duyệt qua các danh mục.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

import MovieCard from '@/components/common/MovieCard';
import { searchMovies } from '@/lib/services/movie';
import { Movie } from '@/types';
import LoadMore from '@/components/common/LoadMore';

// Dynamic rendering for search pages
export const dynamic = 'force-dynamic';

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { keyword } = await searchParams;
  const query = typeof keyword === 'string' ? keyword : '';

  let movies: Movie[] = [];
  let isSearched = false;

  if (query) {
    const data = await searchMovies(query, 24);
    movies = data?.items || [];
    isSearched = true;
  }

  return (
    <div className="min-h-[80vh] px-4 pt-24 md:px-12">
      <div className="mx-auto mb-12 max-w-3xl">
        <h1 className="mb-6 text-center text-3xl font-bold text-white">Tìm Kiếm Phim</h1>
        <form action="/tim-kiem" method="GET" className="group relative">
          <input
            type="text"
            name="keyword"
            defaultValue={query}
            placeholder="Nhập tên phim, đạo diễn, diễn viên..."
            className="w-full rounded-full border border-gray-700 bg-gray-900 py-4 pr-16 pl-6 text-white shadow-inner transition-all focus:border-gray-500 focus:bg-black focus:outline-none"
            required
          />
          <button
            type="submit"
            className="bg-netflix hover:bg-netflix-hover absolute top-2 right-2 bottom-2 rounded-full px-6 font-bold text-white transition-colors"
          >
            Tìm
          </button>
        </form>
      </div>

      {isSearched && (
        <div>
          <h2 className="mb-6 text-xl text-gray-400">
            Kết quả tìm kiếm cho: <strong className="text-white">&quot;{query}&quot;</strong>
          </h2>

          {movies.length === 0 ? (
            <div className="py-20 text-center">
              <p className="text-lg text-gray-500">Rất tiếc, không tìm thấy phim nào phù hợp.</p>
              <p className="mt-2 text-gray-600">Vui lòng thử lại với từ khóa khác.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 lg:gap-6 xl:grid-cols-6">
              {movies.map((movie) => (
                <MovieCard key={movie._id} movie={movie} />
              ))}
              <LoadMore type="search" slugOrKeyword={query} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}

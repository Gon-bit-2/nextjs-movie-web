import MovieCard from '@/components/common/MovieCard';
import { searchMovies } from '@/lib/services/movie';
import { Movie } from '@/types';
import LoadMore from '@/components/common/LoadMore';
import Link from 'next/link';

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
    <div className="flex min-h-[80vh] flex-col gap-8 px-4 pt-24 md:flex-row md:px-12">
      {/* Left Sidebar */}
      <aside className="w-full shrink-0 border-r border-gray-800 pr-4 md:w-64">
        <h2 className="mb-4 text-xl font-bold text-white">Khám Phá</h2>

        <div className="mb-6 border-b border-gray-800 pb-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-400 uppercase">Danh Mục</h3>
          <ul className="space-y-2">
            <li>
              <Link
                href="/danh-sach/phim-bo"
                className="hover:text-netflix block text-gray-300 transition-colors"
              >
                Phim Bộ
              </Link>
            </li>
            <li>
              <Link
                href="/danh-sach/phim-le"
                className="hover:text-netflix block text-gray-300 transition-colors"
              >
                Phim Lẻ
              </Link>
            </li>
            <li>
              <Link
                href="/danh-sach/hoat-hinh"
                className="hover:text-netflix block text-gray-300 transition-colors"
              >
                Hoạt Hình
              </Link>
            </li>
            <li>
              <Link
                href="/danh-sach/tv-shows"
                className="hover:text-netflix block text-gray-300 transition-colors"
              >
                TV Shows
              </Link>
            </li>
          </ul>
        </div>

        <div className="pb-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-400 uppercase">Thể Loại</h3>
          <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 md:grid-cols-1">
            <Link
              href="/the-loai/hanh-dong"
              className="hover:text-netflix block text-gray-300 transition-colors"
            >
              Hành Động
            </Link>
            <Link
              href="/the-loai/tinh-cam"
              className="hover:text-netflix block text-gray-300 transition-colors"
            >
              Tình Cảm
            </Link>
            <Link
              href="/the-loai/hai-huoc"
              className="hover:text-netflix block text-gray-300 transition-colors"
            >
              Hài Hước
            </Link>
            <Link
              href="/the-loai/co-trang"
              className="hover:text-netflix block text-gray-300 transition-colors"
            >
              Cổ Trang
            </Link>
            <Link
              href="/the-loai/tam-ly"
              className="hover:text-netflix block text-gray-300 transition-colors"
            >
              Tâm Lý
            </Link>
            <Link
              href="/the-loai/the-thao"
              className="hover:text-netflix block text-gray-300 transition-colors"
            >
              Thể Thao
            </Link>
            <Link
              href="/the-loai/tu-tai"
              className="hover:text-netflix block text-gray-300 transition-colors"
            >
              Kinh Dị
            </Link>
            <Link
              href="/the-loai/khoa-hoc-vien-tuong"
              className="hover:text-netflix block text-gray-300 transition-colors"
            >
              Viễn Tưởng
            </Link>
          </div>
        </div>
      </aside>

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
              <h2 className="mb-6 text-xl text-gray-400">
                Kết quả tìm kiếm cho: <strong className="text-white">&quot;{query}&quot;</strong>
              </h2>

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

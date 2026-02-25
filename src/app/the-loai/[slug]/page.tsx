import MovieCard from '@/components/common/MovieCard';
import { getMoviesByGenre } from '@/lib/services/movie';
import LoadMore from '@/components/common/LoadMore';
import Link from 'next/link';
import { Search } from 'lucide-react';

// Revalidate mỗi giờ đối với danh sách tĩnh
export const revalidate = 3600;

interface GenrePageProps {
  params: Promise<{ slug: string }>;
}

export default async function GenrePage({ params }: GenrePageProps) {
  const { slug } = await params;

  // Transform slug for display. Ex: hanh-dong -> Hành Động
  const title = slug
    .split('-')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');

  const data = await getMoviesByGenre(slug, 1);
  const movies = data?.items || [];

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
              className={`block transition-colors ${slug === 'hanh-dong' ? 'font-bold text-white' : 'hover:text-netflix text-gray-300'}`}
            >
              Hành Động
            </Link>
            <Link
              href="/the-loai/tinh-cam"
              className={`block transition-colors ${slug === 'tinh-cam' ? 'font-bold text-white' : 'hover:text-netflix text-gray-300'}`}
            >
              Tình Cảm
            </Link>
            <Link
              href="/the-loai/hai-huoc"
              className={`block transition-colors ${slug === 'hai-huoc' ? 'font-bold text-white' : 'hover:text-netflix text-gray-300'}`}
            >
              Hài Hước
            </Link>
            <Link
              href="/the-loai/co-trang"
              className={`block transition-colors ${slug === 'co-trang' ? 'font-bold text-white' : 'hover:text-netflix text-gray-300'}`}
            >
              Cổ Trang
            </Link>
            <Link
              href="/the-loai/tam-ly"
              className={`block transition-colors ${slug === 'tam-ly' ? 'font-bold text-white' : 'hover:text-netflix text-gray-300'}`}
            >
              Tâm Lý
            </Link>
            <Link
              href="/the-loai/the-thao"
              className={`block transition-colors ${slug === 'the-thao' ? 'font-bold text-white' : 'hover:text-netflix text-gray-300'}`}
            >
              Thể Thao
            </Link>
            <Link
              href="/the-loai/kinh-di"
              className={`block transition-colors ${slug === 'kinh-di' ? 'font-bold text-white' : 'hover:text-netflix text-gray-300'}`}
            >
              Kinh Dị
            </Link>
            <Link
              href="/the-loai/khoa-hoc-vien-tuong"
              className={`block transition-colors ${slug === 'khoa-hoc-vien-tuong' ? 'font-bold text-white' : 'hover:text-netflix text-gray-300'}`}
            >
              Viễn Tưởng
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="border-netflix border-l-4 pl-3 text-2xl font-bold text-white md:text-3xl">
            Thể loại: {title}
          </h1>
          <Link
            href="/tim-kiem"
            className="group flex flex-row items-center gap-2 text-gray-400 transition-colors hover:text-white"
          >
            <Search className="h-5 w-5 group-hover:text-white" />
            <span className="hidden sm:inline">Tìm kiếm khác</span>
          </Link>
        </div>

        {movies.length === 0 ? (
          <div className="rounded-lg border border-gray-800 bg-black/50 py-20 text-center">
            <p className="text-lg text-gray-500">
              Đang cập nhật hoặc không tìm thấy phim thể loại này.
            </p>
            <p className="mt-2 text-gray-600">Vui lòng thử lại sau.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:gap-6 xl:grid-cols-5">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
            <LoadMore type="genre" slugOrKeyword={slug} />
          </div>
        )}
      </div>
    </div>
  );
}

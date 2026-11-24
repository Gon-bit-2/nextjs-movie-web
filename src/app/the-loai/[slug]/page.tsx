import MovieCard from '@/components/common/MovieCard';
import { getMoviesByGenre } from '@/lib/services/movie';
import LoadMore from '@/components/common/LoadMore';
import Link from 'next/link';
import { Search } from 'lucide-react';
import DiscoverySidebar from '@/components/movies/DiscoverySidebar';
import SortLinks from '@/components/movies/SortLinks';
import { getGenreLabel } from '@/config/navigation';
import { getMovieSortKey, sortMovies } from '@/lib/movies/sort';

// Revalidate mỗi giờ đối với danh sách tĩnh
export const revalidate = 3600;

interface GenrePageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function GenrePage({ params, searchParams }: GenrePageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;
  const title = getGenreLabel(slug);
  const activeSort = getMovieSortKey(sort);

  const data = await getMoviesByGenre(slug, 1);
  const movies = sortMovies(data?.items || [], activeSort);

  return (
    <div className="flex min-h-[80vh] flex-col gap-8 px-4 pt-24 md:flex-row md:px-12">
      <DiscoverySidebar activeGenre={slug} />

      {/* Main Content */}
      <div className="flex-1">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="border-netflix border-l-4 pl-3 text-2xl font-bold text-white md:text-3xl">
            Thể loại: {title}
          </h1>
          <div className="flex flex-wrap items-center gap-2">
            <SortLinks basePath={`/the-loai/${slug}`} activeSort={activeSort} />
            <Link
              href="/tim-kiem"
              className="group flex flex-row items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-xs font-semibold text-gray-300 transition-colors hover:bg-white/20 hover:text-white"
            >
              <Search className="h-4 w-4 group-hover:text-white" />
              <span>Tìm kiếm</span>
            </Link>
          </div>
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

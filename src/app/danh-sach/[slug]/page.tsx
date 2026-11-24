import MovieCard from '@/components/common/MovieCard';
import { getMoviesByCategory } from '@/lib/services/movie';
import LoadMore from '@/components/common/LoadMore';
import DiscoverySidebar from '@/components/movies/DiscoverySidebar';
import SortLinks from '@/components/movies/SortLinks';
import { getCategoryLabel } from '@/config/navigation';
import { getMovieSortKey, sortMovies } from '@/lib/movies/sort';

// Revalidate mỗi giờ đối với danh sách tĩnh
export const revalidate = 3600;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export default async function CategoryPage({ params, searchParams }: CategoryPageProps) {
  const { slug } = await params;
  const { sort } = await searchParams;
  const title = getCategoryLabel(slug);
  const activeSort = getMovieSortKey(sort);

  const data = await getMoviesByCategory(slug, 1);
  const movies = sortMovies(data?.items || [], activeSort);

  return (
    <div className="flex min-h-[80vh] flex-col gap-8 px-4 pt-24 md:flex-row md:px-12">
      <DiscoverySidebar activeCategory={slug} />

      <div className="flex-1">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-white md:text-3xl">{title}</h1>
          <SortLinks basePath={`/danh-sach/${slug}`} activeSort={activeSort} />
        </div>

        {movies.length === 0 ? (
          <p className="text-gray-400">Đang cập nhật hoặc không tìm thấy danh mục này.</p>
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 lg:gap-6 xl:grid-cols-6">
            {movies.map((movie) => (
              <MovieCard key={movie._id} movie={movie} />
            ))}
            <LoadMore type="category" slugOrKeyword={slug} />
          </div>
        )}
      </div>
    </div>
  );
}

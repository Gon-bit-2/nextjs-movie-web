import MovieCard from '@/components/common/MovieCard';
import { getMoviesByCategory } from '@/lib/services/movie';
import LoadMore from '@/components/common/LoadMore';

// Revalidate mỗi giờ đối với danh sách tĩnh
export const revalidate = 3600;

interface CategoryPageProps {
  params: Promise<{ slug: string }>;
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const title = slug.replace(/-/g, ' ');

  const data = await getMoviesByCategory(slug, 1);
  const movies = data?.items || [];

  return (
    <div className="min-h-[80vh] px-4 pt-24 md:px-12">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white capitalize md:text-3xl">Phim {title}</h1>
      </div>

      {movies.length === 0 ? (
        <p className="text-gray-400">Đang cập nhật hoặc không tìm thấy thể loại này.</p>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 lg:gap-6 xl:grid-cols-6">
          {movies.map((movie) => (
            <MovieCard key={movie._id} movie={movie} />
          ))}
          <LoadMore type="category" slugOrKeyword={slug} />
        </div>
      )}
    </div>
  );
}

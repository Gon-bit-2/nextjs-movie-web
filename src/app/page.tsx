import HeroBanner from '@/components/movies/HeroBanner';
import MovieRow from '@/components/movies/MovieRow';
import PersonalizedRows from '@/components/movies/PersonalizedRows';
import GenreRail from '@/components/movies/GenreRail';
import { getNewMovies, getMoviesByCategory } from '@/lib/services/movie';

// Revalidate mỗi 1 giờ
export const revalidate = 3600;

export default async function Home() {
  // Thực hiện các API Fetch song song để tăng tốc - Best Practice (CRITICAL)
  const [newMoviesRes, moviesBoRes, moviesLeRes, hoatHinhRes] = await Promise.all([
    getNewMovies(1),
    getMoviesByCategory('phim-bo', 1),
    getMoviesByCategory('phim-le', 1),
    getMoviesByCategory('hoat-hinh', 1),
  ]);

  const newMovies = newMoviesRes?.items || [];
  const banerMovie = newMovies.length > 0 ? newMovies[0] : null;
  const popularMovies = newMovies.slice(1, 20);
  const topMovies = newMovies.slice(0, 10);

  const moviesBo = moviesBoRes?.items || [];
  const moviesLe = moviesLeRes?.items || [];
  const hoatHinh = hoatHinhRes?.items || [];

  return (
    <div className="pb-10">
      {banerMovie && <HeroBanner movie={banerMovie} />}

      <div className="relative z-20 flex flex-col gap-4 md:-mt-24 md:gap-8 lg:-mt-32">
        <PersonalizedRows />
        <MovieRow title="Top phim đang nổi" movies={topMovies} href="/danh-sach/phim-moi" />
        <MovieRow title="Mới cập nhật" movies={popularMovies} href="/danh-sach/phim-moi" />
        <MovieRow title="Phim bộ" movies={moviesBo} href="/danh-sach/phim-bo" />
        <MovieRow title="Phim lẻ" movies={moviesLe} href="/danh-sach/phim-le" />
        <MovieRow title="Hoạt hình" movies={hoatHinh} href="/danh-sach/hoat-hinh" />
        <GenreRail />
      </div>
    </div>
  );
}

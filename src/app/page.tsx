import HeroBanner from '@/components/movies/HeroBanner';
import MovieRow from '@/components/movies/MovieRow';
import TopTenRow from '@/components/movies/TopTenRow';
import { ContinueWatchingRow, MyListSection } from '@/components/movies/PersonalizedRows';
import GenreRail from '@/components/movies/GenreRail';
import {
  getCountries,
  getGenres,
  getHomeMovies,
  getMoviesByCategory,
} from '@/lib/services/movie';
import { FALLBACK_GENRES, FEATURED_COUNTRIES } from '@/config/navigation';

// Tái tạo dữ liệu trang chủ mỗi 30 phút
export const revalidate = 1800;

/**
 * Trang chủ PHIMHAY: tải song song API v1 (/v1/api/home và các danh mục chính) để hiển thị nhanh và phong phú
 */
export default async function HomePage() {
  const [
    homeRes,
    moviesBoRes,
    moviesLeRes,
    chieuRapRes,
    hoatHinhRes,
    tvShowsRes,
    genresRaw,
    countriesRaw,
  ] = await Promise.all([
    getHomeMovies(),
    getMoviesByCategory('phim-bo', 1, { limit: 14 }),
    getMoviesByCategory('phim-le', 1, { limit: 14 }),
    getMoviesByCategory('phim-chieu-rap', 1, { limit: 14 }),
    getMoviesByCategory('hoat-hinh', 1, { limit: 14 }),
    getMoviesByCategory('tv-shows', 1, { limit: 14 }),
    getGenres(),
    getCountries(),
  ]);

  const homeItems = homeRes?.items || [];
  const heroMovies = homeItems.slice(0, 5);
  const updatedToday = homeItems.slice(0, 16);
  const topTenMovies = (chieuRapRes?.items?.length ? chieuRapRes.items : homeItems).slice(0, 10);

  const genres =
    genresRaw.length > 0
      ? genresRaw
      : FALLBACK_GENRES.map((g) => ({ name: g.label, slug: g.slug }));
  const countries =
    countriesRaw.length > 0
      ? countriesRaw
      : FEATURED_COUNTRIES.map((c) => ({ name: c.label, slug: c.slug }));

  return (
    <div className="bg-[#0A0A0D] pb-12">
      <HeroBanner movies={heroMovies} />

      <div className="relative z-20 -mt-6 flex flex-col gap-10 md:-mt-10 md:gap-12">
        <ContinueWatchingRow />

        <MovieRow
          title="Mới cập nhật hôm nay"
          subtitle="Tuyển chọn các tập và phim mới lên sóng"
          movies={updatedToday}
          href="/danh-sach/phim-moi"
        />

        <TopTenRow movies={topTenMovies} />

        <MovieRow
          title="Phim bộ nổi bật"
          movies={moviesBoRes?.items || []}
          href="/danh-sach/phim-bo"
        />

        <MovieRow
          title="Phim lẻ chọn lọc"
          movies={moviesLeRes?.items || []}
          href="/danh-sach/phim-le"
        />

        <MovieRow
          title="Phim chiếu rạp"
          movies={chieuRapRes?.items || []}
          href="/danh-sach/phim-chieu-rap"
        />

        <MovieRow
          title="Hoạt hình & Anime"
          movies={hoatHinhRes?.items || []}
          href="/danh-sach/hoat-hinh"
        />

        <MovieRow
          title="TV Shows"
          movies={tvShowsRes?.items || []}
          href="/danh-sach/tv-shows"
        />

        <GenreRail genres={genres} countries={countries} />

        <MyListSection />
      </div>
    </div>
  );
}

import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Clock, Globe, Star } from 'lucide-react';
import {
  getImageUrl,
  getMovieDetail,
  getMovieImages,
  getMovieKeywords,
  getMoviePeoples,
  getMoviesByGenre,
  getTmdbImageUrl,
} from '@/lib/services/movie';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import Breadcrumb from '@/components/common/Breadcrumb';
import MovieCard from '@/components/common/MovieCard';
import MovieActionButtons from '@/components/movies/MovieActionButtons';
import SmartWatchButton from '@/components/movies/SmartWatchButton';
import MovieDetailTabs from '@/components/movies/MovieDetailTabs';
import MovieJsonLd from '@/components/seo/MovieJsonLd';

interface MovieDetailProps {
  params: Promise<{ slug: string }>;
}

/**
 * Tạo metadata SEO từ khối seoOnPage của API v1 (tiêu đề, mô tả, ảnh đại diện OpenGraph)
 */
export async function generateMetadata({ params }: MovieDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getMovieDetail(slug);
  if (!data?.movie) return { title: 'Không tìm thấy phim' };

  const title = data.seoOnPage?.titleHead || data.movie.name;
  const description =
    data.seoOnPage?.descriptionHead ||
    data.movie.content?.replace(/<[^>]+>/g, '').slice(0, 160);
  const ogImage = data.movie.thumb_url || data.movie.poster_url;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      images: ogImage ? [getImageUrl(ogImage)] : undefined,
    },
  };
}

/**
 * Trang chi tiết phim (/phim/[slug]) sử dụng toàn bộ dữ liệu API v1 (TMDB/IMDb, peoples, images, keywords)
 */
export default async function MovieDetailPage({ params }: MovieDetailProps) {
  const { slug } = await params;

  // Gọi song song chi tiết phim cùng 3 endpoint phụ trợ để giảm thời gian chờ
  const [data, peoplesRes, imagesRes, keywords] = await Promise.all([
    getMovieDetail(slug),
    getMoviePeoples(slug),
    getMovieImages(slug),
    getMovieKeywords(slug),
  ]);

  if (!data || !data.movie) {
    return notFound();
  }

  const { movie } = data;
  const servers = data.episodes || [];
  const firstEpisodeName = servers[0]?.server_data?.[0]?.name;

  // Chọn ảnh backdrop HD từ TMDB nếu có, dự phòng về thumb_url
  const tmdbBackdrop = imagesRes.images.find((img) => img.type === 'backdrop');
  const heroBackdropUrl = tmdbBackdrop
    ? getTmdbImageUrl(tmdbBackdrop.file_path, imagesRes.backdropBaseUrl)
    : getImageUrl(movie.thumb_url || movie.poster_url);

  const firstGenreSlug = movie.category?.[0]?.slug;
  const relatedRes = firstGenreSlug
    ? await getMoviesByGenre(firstGenreSlug, 1, { limit: 12 })
    : null;
  const relatedMovies = (relatedRes?.items || [])
    .filter((item) => item.slug !== movie.slug)
    .slice(0, 6);

  const cleanSummary = movie.content ? movie.content.replace(/<[^>]+>/g, '').trim() : '';

  return (
    <div className="relative min-h-screen bg-[#0A0A0D] pb-16">
      <MovieJsonLd movie={movie} peoples={peoplesRes.peoples} />
      {/* Ảnh nền Backdrop HD + hạt phim + chuyển sắc mượt vào nền tối */}
      <div className="relative h-[42vh] min-h-[300px] w-full overflow-hidden md:h-[58vh]">
        <ImageWithFallback
          src={heroBackdropUrl}
          alt={movie.name}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center opacity-55"
        />
        <div className="cinema-grain pointer-events-none absolute inset-0" />
        <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0D] via-[#0A0A0D]/70 to-[#0A0A0D]/30" />
        <div className="absolute inset-0 bg-linear-to-r from-[#0A0A0D]/90 via-transparent to-[#0A0A0D]/40" />
      </div>

      {/* Nội dung chính chồng lên phần dưới của Backdrop */}
      <div className="relative z-10 mx-auto -mt-32 max-w-[1400px] px-4 md:-mt-48 md:px-8 xl:px-12">
        <Breadcrumb items={data.breadCrumb} currentLabel={movie.name} />

        <div className="flex flex-col gap-7 md:flex-row md:items-end md:gap-10">
          {/* Poster dọc 2:3 */}
          <div className="mx-auto w-44 shrink-0 sm:w-52 md:mx-0 md:w-64">
            <div className="relative aspect-[2/3] overflow-hidden rounded-[10px] border border-white/15 bg-[#14141A] shadow-[0_20px_50px_rgba(0,0,0,0.8)]">
              <ImageWithFallback
                src={getImageUrl(movie.poster_url || movie.thumb_url)}
                alt={movie.name}
                fill
                priority
                sizes="(max-width: 768px) 208px, 256px"
                className="object-cover"
              />
            </div>
          </div>

          {/* Khối tiêu đề, điểm số và hành động */}
          <div className="min-w-0 flex-1">
            <h1 className="font-display text-3xl leading-tight font-bold tracking-wide text-white uppercase sm:text-4xl md:text-5xl lg:text-6xl">
              {movie.name}
            </h1>
            <p className="mt-2 text-sm font-medium text-[#9A9AA8] sm:text-base">
              {movie.origin_name}
              {movie.year > 0 ? ` · ${movie.year}` : ''}
            </p>

            {/* Hàng nhãn điểm IMDb / TMDB, chất lượng, ngôn ngữ */}
            <div className="mt-4 flex flex-wrap items-center gap-2 text-xs font-semibold">
              {movie.imdb && movie.imdb.vote_average > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-[#F5C518]/35 bg-[#0A0A0D]/90 px-3 py-1 text-[#F5C518]">
                  <Star className="h-3.5 w-3.5 fill-[#F5C518]" />
                  IMDb {movie.imdb.vote_average.toFixed(1)}
                  {movie.imdb.vote_count > 0 && (
                    <span className="font-normal text-[#9A9AA8]">
                      ({movie.imdb.vote_count >= 1000
                        ? `${(movie.imdb.vote_count / 1000).toFixed(1)}K`
                        : movie.imdb.vote_count})
                    </span>
                  )}
                </span>
              )}

              {movie.tmdb && movie.tmdb.vote_average > 0 && (
                <span className="inline-flex items-center gap-1 rounded-full border border-white/15 bg-[#14141A] px-3 py-1 text-[#F2F2F5]">
                  <Star className="h-3.5 w-3.5 text-[#F5C518]" />
                  TMDB {movie.tmdb.vote_average.toFixed(1)}
                </span>
              )}

              {movie.quality && (
                <span className="rounded border border-white/15 bg-white/10 px-2.5 py-1 text-white">
                  {movie.quality}
                </span>
              )}

              {movie.lang && (
                <span className="rounded border border-white/10 bg-[#14141A] px-2.5 py-1 text-[#F2F2F5]">
                  {movie.lang}
                </span>
              )}

              {movie.episode_current && (
                <span className="rounded border border-[#E50914]/35 bg-[#E50914]/15 px-2.5 py-1 text-[#ffb4aa]">
                  {movie.episode_current}
                </span>
              )}

              {movie.time && (
                <span className="inline-flex items-center gap-1 text-[#9A9AA8]">
                  <Clock className="h-3.5 w-3.5" />
                  {movie.time}
                </span>
              )}
            </div>

            {/* Nhãn thể loại & quốc gia có thể bấm lọc ngay */}
            <div className="mt-4 flex flex-wrap items-center gap-2">
              {movie.country?.map((country) => (
                <Link
                  key={country.slug}
                  href={`/quoc-gia/${country.slug}`}
                  className="inline-flex items-center gap-1 rounded-full border border-white/12 bg-[#14141A] px-3 py-1 text-xs font-medium text-[#F2F2F5] transition hover:border-[#E50914]/50 hover:text-white"
                >
                  <Globe className="h-3 w-3 text-[#9A9AA8]" />
                  {country.name}
                </Link>
              ))}
              {movie.category?.map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/the-loai/${cat.slug}`}
                  className="rounded-full border border-white/10 bg-[#14141A] px-3 py-1 text-xs font-medium text-[#9A9AA8] transition hover:border-white/25 hover:text-white"
                >
                  {cat.name}
                </Link>
              ))}
            </div>

            {cleanSummary && (
              <p className="mt-5 line-clamp-3 max-w-3xl text-sm leading-relaxed text-[#F2F2F5]/85 md:text-base">
                {cleanSummary}
              </p>
            )}

            {/* Hàng nút hành động chính */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <SmartWatchButton slug={movie.slug} firstEpisodeName={firstEpisodeName} />
              <MovieActionButtons movie={movie} showLabels showShare />
            </div>
          </div>
        </div>

        {/* Khu vực nội dung dạng Tabs */}
        <MovieDetailTabs
          movie={movie}
          servers={servers}
          peoples={peoplesRes.peoples}
          profileBaseUrl={peoplesRes.profileBaseUrl}
          images={imagesRes.images}
          backdropBaseUrl={imagesRes.backdropBaseUrl}
          keywords={keywords}
        />

        {/* Phim cùng thể loại */}
        {relatedMovies.length > 0 && (
          <section className="mt-14">
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-xl font-bold tracking-wide text-white uppercase md:text-2xl">
                Phim cùng thể loại
              </h2>
              {firstGenreSlug && (
                <Link
                  href={`/the-loai/${firstGenreSlug}`}
                  className="text-xs font-semibold text-[#9A9AA8] transition hover:text-[#E50914]"
                >
                  Xem thêm →
                </Link>
              )}
            </div>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {relatedMovies.map((item) => (
                <MovieCard key={item._id} movie={item} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

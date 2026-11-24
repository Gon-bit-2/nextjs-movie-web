'use client';

import Link from 'next/link';
import { Play, X } from 'lucide-react';
import MovieCard from '@/components/common/MovieCard';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import HorizontalRail from '@/components/common/HorizontalRail';
import { getImageUrl } from '@/lib/services/movie';
import { usePersonalization } from '@/hooks/usePersonalization';
import type { Movie, MovieProgress, SavedMovie } from '@/types';

/**
 * Chuyển đổi mục phim đã lưu sang cấu trúc Movie để tái sử dụng MovieCard
 */
function savedToMovie(movie: SavedMovie): Movie {
  return {
    _id: movie._id,
    name: movie.name,
    slug: movie.slug,
    origin_name: movie.origin_name ?? '',
    thumb_url: movie.thumb_url ?? '',
    poster_url: movie.poster_url ?? '',
    year: movie.year ?? 0,
    quality: movie.quality,
    lang: movie.lang,
    episode_current: movie.episode_current,
    imdb: movie.imdbScore
      ? { id: '', vote_average: movie.imdbScore, vote_count: 0 }
      : undefined,
  };
}

/**
 * Tính phần trăm tiến độ đã xem của một tập phim
 */
function getProgressPercent(progress: MovieProgress): number {
  if (!progress.duration || progress.duration <= 0) return 0;
  return Math.min(100, Math.max(0, (progress.currentTime / progress.duration) * 100));
}

/**
 * Tạo chuỗi mô tả thời lượng còn lại cho thẻ Tiếp tục xem
 */
function getRemainingLabel(progress: MovieProgress): string {
  if (progress.completed) return 'Đã xem xong';
  if (!progress.duration || progress.duration <= progress.currentTime) return '';
  const minsLeft = Math.max(1, Math.round((progress.duration - progress.currentTime) / 60));
  return `còn ${minsLeft} phút`;
}

/**
 * Khối Tiếp tục xem hiển thị ngay dưới Hero khi người dùng có lịch sử phát gần đây
 */
export function ContinueWatchingRow() {
  const { watchProgress, removeProgress } = usePersonalization();
  if (watchProgress.length === 0) return null;

  // Mỗi phim chỉ hiện tập gần nhất người dùng xem
  const uniqueByMovie: MovieProgress[] = [];
  const seen = new Set<string>();
  for (const item of watchProgress) {
    if (!seen.has(item.slug)) {
      seen.add(item.slug);
      uniqueByMovie.push(item);
    }
  }

  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 md:px-8 xl:px-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold tracking-wide text-[#F2F2F5] uppercase md:text-2xl">
          Tiếp tục xem
        </h2>
      </div>

      <HorizontalRail ariaLabel="Tiếp tục xem" gapClassName="gap-4">
        {uniqueByMovie.slice(0, 8).map((progress) => {
          const remaining = getRemainingLabel(progress);
          const watchHref = `/xem-phim/${progress.slug}?tap=${progress.episodeIndex + 1}${
            progress.serverIndex !== undefined ? `&server=${progress.serverIndex + 1}` : ''
          }`;

          return (
            <article
              key={`${progress.slug}-${progress.episodeIndex}`}
              className="group relative w-[270px] shrink-0 snap-start overflow-hidden rounded-[10px] border border-white/10 bg-[#14141A] transition hover:border-white/25 sm:w-[300px]"
            >
              <Link href={watchHref} className="block">
                <div className="relative aspect-video bg-[#0A0A0D]">
                  <ImageWithFallback
                    src={getImageUrl(progress.thumb_url || progress.poster_url)}
                    alt={progress.name}
                    fill
                    sizes="300px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0D]/90 via-black/15 to-transparent" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E50914]/90 text-white shadow-lg transition group-hover:scale-110">
                      <Play className="ml-0.5 h-5 w-5 fill-white" />
                    </span>
                  </div>
                </div>
                <div className="h-1 bg-white/15">
                  <div
                    className="h-full bg-[#E50914]"
                    style={{ width: `${getProgressPercent(progress)}%` }}
                  />
                </div>
                <div className="p-3">
                  <h3 className="line-clamp-1 text-sm font-semibold text-white">{progress.name}</h3>
                  <p className="mt-1 line-clamp-1 text-xs text-[#9A9AA8]">
                    {progress.episodeName || `Tập ${progress.episodeIndex + 1}`}
                    {remaining ? ` · ${remaining}` : ''}
                  </p>
                </div>
              </Link>

              <button
                type="button"
                onClick={() => removeProgress(progress.slug)}
                aria-label={`Xóa ${progress.name} khỏi Tiếp tục xem`}
                title="Xóa khỏi Tiếp tục xem"
                className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-white opacity-90 transition hover:bg-[#E50914] md:opacity-0 md:group-hover:opacity-100"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </article>
          );
        })}
      </HorizontalRail>
    </section>
  );
}

/**
 * Khối Danh sách của tôi đặt cuối trang chủ (có neo #cua-toi để nhảy thẳng từ Header/Mobile Nav)
 */
export function MyListSection() {
  const { myList } = usePersonalization();
  if (myList.length === 0) return null;

  return (
    <section id="cua-toi" className="mx-auto w-full max-w-[1600px] scroll-mt-24 px-4 md:px-8 xl:px-12">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-display text-xl font-bold tracking-wide text-[#F2F2F5] uppercase md:text-2xl">
          Danh sách của tôi
        </h2>
        <span className="text-xs text-[#9A9AA8]">{myList.length} phim đã lưu</span>
      </div>
      <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {myList.slice(0, 12).map((movie) => (
          <MovieCard key={movie.slug} movie={savedToMovie(movie)} variant="poster" />
        ))}
      </div>
    </section>
  );
}

/**
 * Thành phần tổng hợp giữ tương thích mặc định
 */
export default function PersonalizedRows() {
  return (
    <div className="flex flex-col gap-10">
      <ContinueWatchingRow />
      <MyListSection />
    </div>
  );
}

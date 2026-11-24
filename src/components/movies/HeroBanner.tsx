'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Info, Play, Star } from 'lucide-react';
import type { Movie } from '@/types';
import { getImageUrl, getMovieScore } from '@/lib/services/movie';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import MovieActionButtons from './MovieActionButtons';

interface HeroBannerProps {
  movies: Movie[];
}

const AUTO_SLIDE_MS = 8000;

/**
 * Khối Hero toàn màn hình dạng Carousel 5 phim nổi bật với hiệu ứng Rạp chiếu đêm và dữ liệu thật từ API v1
 */
export default function HeroBanner({ movies }: HeroBannerProps) {
  const slides = movies.slice(0, 5);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const goNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const goPrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Tự động chuyển slide mỗi 8 giây và tạm dừng khi người dùng di chuột vào
  useEffect(() => {
    if (slides.length <= 1 || isPaused) return;
    const timer = window.setInterval(goNext, AUTO_SLIDE_MS);
    return () => window.clearInterval(timer);
  }, [goNext, isPaused, slides.length]);

  if (slides.length === 0) return null;

  const movie = slides[activeIndex];
  const backdropUrl = getImageUrl(movie.thumb_url || movie.poster_url);
  const score = getMovieScore(movie);

  return (
    <section
      aria-label="Phim nổi bật hôm nay"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative h-[68vh] max-h-[820px] min-h-[500px] w-full overflow-hidden bg-[#0A0A0D] select-none md:h-[80vh]"
    >
      {/* Ảnh nền phim full-bleed */}
      <div className="absolute inset-0">
        <ImageWithFallback
          key={movie._id}
          src={backdropUrl}
          alt={movie.name}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center transition-opacity duration-700"
        />
        <div className="cinema-grain pointer-events-none absolute inset-0" />
        {/* Lớp chuyển sắc tối từ đáy, cạnh trái và đỉnh */}
        <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0D] via-[#0A0A0D]/35 to-[#0A0A0D]/40" />
        <div className="absolute inset-0 bg-linear-to-r from-[#0A0A0D]/95 via-[#0A0A0D]/55 to-transparent" />
      </div>

      {/* Vệt sáng máy chiếu đỏ điện ảnh phía sau nội dung */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute bottom-12 left-0 h-72 w-72 rounded-full bg-[#E50914]/15 blur-[120px] md:h-96 md:w-96"
      />

      {/* Nội dung thông tin phim */}
      <div className="relative z-10 mx-auto flex h-full max-w-[1600px] flex-col justify-end px-4 pb-16 md:px-8 md:pb-24 xl:px-12">
        <div className="max-w-2xl">
          {/* Hàng badge thật từ API v1 */}
          <div className="mb-3 flex flex-wrap items-center gap-2 text-xs font-semibold">
            {movie.quality && (
              <span className="rounded bg-[#E50914] px-2 py-0.5 text-[11px] font-bold tracking-wider text-white uppercase">
                {movie.quality}
              </span>
            )}
            {movie.lang && (
              <span className="rounded border border-white/20 bg-black/50 px-2.5 py-0.5 text-[#F2F2F5] backdrop-blur-md">
                {movie.lang}
              </span>
            )}
            {score && (
              <span className="inline-flex items-center gap-1 rounded-full border border-[#F5C518]/35 bg-[#0A0A0D]/80 px-2.5 py-0.5 text-[#F5C518]">
                <Star className="h-3 w-3 fill-[#F5C518]" />
                IMDb {score}
              </span>
            )}
            {movie.year > 0 && <span className="text-[#F2F2F5]/80">{movie.year}</span>}
            {movie.episode_current && (
              <span className="text-[#9A9AA8]">· {movie.episode_current}</span>
            )}
          </div>

          <h1 className="font-display text-4xl leading-[1.06] font-bold tracking-wide text-white uppercase drop-shadow-lg sm:text-5xl md:text-6xl lg:text-7xl">
            {movie.name}
          </h1>

          <p className="mt-2 text-sm font-medium text-[#9A9AA8] sm:text-base md:text-lg">
            {movie.origin_name}
            {movie.time ? ` · ${movie.time}` : ''}
          </p>

          {movie.category && movie.category.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1.5">
              {movie.category.slice(0, 4).map((cat) => (
                <Link
                  key={cat.slug}
                  href={`/the-loai/${cat.slug}`}
                  className="rounded-full border border-white/12 bg-white/8 px-3 py-1 text-xs text-[#F2F2F5] backdrop-blur-sm transition hover:border-white/30 hover:bg-white/15"
                >
                  {cat.name}
                </Link>
              ))}
            </div>
          )}

          {/* Nhóm nút CTA chính */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href={`/xem-phim/${movie.slug}`}
              className="font-display inline-flex items-center gap-2 rounded-lg bg-[#E50914] px-6 py-3 text-base font-semibold tracking-wider text-white uppercase shadow-[0_8px_28px_rgba(229,9,20,0.45)] transition hover:bg-[#f40612] hover:shadow-[0_10px_36px_rgba(229,9,20,0.65)] md:px-7"
            >
              <Play className="h-5 w-5 fill-white" />
              <span>Xem ngay</span>
            </Link>

            <Link
              href={`/phim/${movie.slug}`}
              className="inline-flex items-center gap-2 rounded-lg border border-white/20 bg-white/10 px-5 py-3 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/35 hover:bg-white/20"
            >
              <Info className="h-4 w-4" />
              <span>Chi tiết</span>
            </Link>

            <MovieActionButtons movie={movie} />
          </div>
        </div>

        {/* Điều hướng Carousel ở góc dưới phải */}
        {slides.length > 1 && (
          <div className="mt-6 flex items-center justify-between gap-4 md:absolute md:right-8 md:bottom-16 md:mt-0 xl:right-12">
            <div className="flex items-center gap-2" role="tablist" aria-label="Chọn phim nổi bật">
              {slides.map((slide, idx) => (
                <button
                  key={slide._id}
                  type="button"
                  role="tab"
                  aria-selected={idx === activeIndex}
                  aria-label={`Xem slide ${slide.name}`}
                  onClick={() => setActiveIndex(idx)}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    idx === activeIndex
                      ? 'w-8 bg-[#E50914]'
                      : 'w-2.5 bg-white/30 hover:bg-white/60'
                  }`}
                />
              ))}
            </div>

            <div className="hidden items-center gap-2 sm:flex">
              <button
                type="button"
                onClick={goPrev}
                aria-label="Phim trước"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition hover:border-white/35 hover:bg-white/15"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={goNext}
                aria-label="Phim tiếp theo"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 bg-black/50 text-white backdrop-blur-md transition hover:border-white/35 hover:bg-white/15"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}

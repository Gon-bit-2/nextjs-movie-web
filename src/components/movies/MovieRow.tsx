'use client';

import { useRef } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Movie } from '@/types';
import MovieCard from '@/components/common/MovieCard';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  href?: string;
}

/**
 * Hàng phim cuộn ngang có snap mượt và nút điều hướng trái/phải trên desktop
 */
export default function MovieRow({ title, subtitle, movies, href }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);

  /**
   * Cuộn hàng phim sang trái hoặc phải theo chiều rộng vùng nhìn
   */
  const scrollByDirection = (direction: 'left' | 'right') => {
    const container = rowRef.current;
    if (!container) return;
    const distance = Math.max(280, Math.round(container.clientWidth * 0.8));
    container.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  };

  if (!movies || movies.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 md:px-8 xl:px-12">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="font-display text-xl font-bold tracking-wide text-[#F2F2F5] uppercase md:text-2xl">
            {title}
          </h2>
          {subtitle && <p className="mt-0.5 text-xs text-[#9A9AA8]">{subtitle}</p>}
        </div>

        <div className="flex items-center gap-2">
          {href && (
            <Link
              href={href}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#9A9AA8] transition hover:text-[#E50914] sm:text-sm"
            >
              <span>Xem tất cả</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          )}
          <div className="hidden items-center gap-1.5 md:flex">
            <button
              type="button"
              onClick={() => scrollByDirection('left')}
              aria-label={`Cuộn trái ${title}`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#14141A] text-[#9A9AA8] transition hover:border-white/25 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByDirection('right')}
              aria-label={`Cuộn phải ${title}`}
              className="flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-[#14141A] text-[#9A9AA8] transition hover:border-white/25 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <div
        ref={rowRef}
        className="no-scrollbar flex snap-x snap-mandatory gap-3.5 overflow-x-auto pb-2 md:gap-4"
      >
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="w-[152px] shrink-0 snap-start sm:w-[172px] md:w-[196px] lg:w-[214px]"
          >
            <MovieCard movie={movie} variant="poster" />
          </div>
        ))}
      </div>
    </section>
  );
}

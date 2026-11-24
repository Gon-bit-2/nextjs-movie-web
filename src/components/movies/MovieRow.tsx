import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import type { Movie } from '@/types';
import MovieCard from '@/components/common/MovieCard';
import HorizontalRail from '@/components/common/HorizontalRail';

interface MovieRowProps {
  title: string;
  subtitle?: string;
  movies: Movie[];
  href?: string;
}

/**
 * Hàng phim cuộn ngang hỗ trợ kéo chuột mượt và nút điều hướng trái/phải nổi ở hai mép
 */
export default function MovieRow({ title, subtitle, movies, href }: MovieRowProps) {
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

        {href && (
          <Link
            href={href}
            className="inline-flex items-center gap-1 text-xs font-semibold text-[#9A9AA8] transition hover:text-[#E50914] sm:text-sm"
          >
            <span>Xem tất cả</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>

      <HorizontalRail ariaLabel={title} gapClassName="gap-3.5 md:gap-4">
        {movies.map((movie) => (
          <div
            key={movie._id}
            className="w-[152px] shrink-0 snap-start sm:w-[172px] md:w-[196px] lg:w-[214px]"
          >
            <MovieCard movie={movie} variant="poster" />
          </div>
        ))}
      </HorizontalRail>
    </section>
  );
}

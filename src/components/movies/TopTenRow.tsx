import Link from 'next/link';
import { Star } from 'lucide-react';
import type { Movie } from '@/types';
import { getImageUrl, getMovieScore } from '@/lib/services/movie';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import HorizontalRail from '@/components/common/HorizontalRail';

interface TopTenRowProps {
  movies: Movie[];
}

/**
 * Hàng điểm nhấn Top 10 Hôm Nay hỗ trợ kéo chuột trái/phải và nút điều hướng hai mép
 */
export default function TopTenRow({ movies }: TopTenRowProps) {
  const topMovies = movies.slice(0, 10);
  if (topMovies.length === 0) return null;

  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 md:px-8 xl:px-12">
      <div className="mb-4 flex items-end justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#E50914] uppercase">
            Xu hướng
          </p>
          <h2 className="font-display text-2xl font-bold tracking-wide text-white uppercase md:text-3xl">
            Top 10 hôm nay
          </h2>
        </div>
      </div>

      <HorizontalRail ariaLabel="Top 10 hôm nay" gapClassName="gap-4 md:gap-6">
        {topMovies.map((movie, idx) => {
          const rank = idx + 1;
          const score = getMovieScore(movie);

          return (
            <Link
              key={movie._id}
              href={`/phim/${movie.slug}`}
              draggable={false}
              className="group relative flex w-[210px] shrink-0 snap-start items-end sm:w-[235px] md:w-[255px]"
            >
              {/* Chữ số thứ tự cỡ lớn viền rỗng */}
              <span
                aria-hidden="true"
                className="rank-stroke -mr-5 mb-2 shrink-0 text-[96px] leading-[0.82] font-bold tracking-tighter select-none sm:text-[114px] md:text-[128px]"
              >
                {rank}
              </span>

              {/* Poster phim */}
              <div className="relative z-10 flex-1">
                <div
                  className={`relative aspect-[2/3] w-full overflow-hidden rounded-[10px] border bg-[#14141A] transition duration-300 group-hover:-translate-y-1.5 ${
                    rank === 1
                      ? 'border-[#E50914]/50 shadow-[0_10px_30px_rgba(229,9,20,0.22)]'
                      : 'border-white/10 group-hover:border-white/25'
                  }`}
                >
                  <ImageWithFallback
                    src={getImageUrl(movie.poster_url || movie.thumb_url)}
                    alt={movie.name}
                    fill
                    draggable={false}
                    sizes="(max-width: 640px) 150px, 190px"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/2 bg-linear-to-t from-[#0A0A0D]/95 via-[#0A0A0D]/30 to-transparent" />
                  <div className="pointer-events-none absolute right-2 bottom-2 left-2">
                    <p className="line-clamp-1 text-xs font-bold text-white">{movie.name}</p>
                    <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-[#9A9AA8]">
                      {movie.year > 0 && <span>{movie.year}</span>}
                      {score && (
                        <span className="inline-flex items-center gap-0.5 font-semibold text-[#F5C518]">
                          <Star className="h-2.5 w-2.5 fill-[#F5C518]" />
                          {score}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </HorizontalRail>
    </section>
  );
}

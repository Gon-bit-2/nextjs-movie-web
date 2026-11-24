import Link from 'next/link';
import { Play, Star } from 'lucide-react';
import type { Movie } from '@/types';
import { getImageUrl, getMovieScore, getShortLangLabel } from '@/lib/services/movie';
import ImageWithFallback from '@/components/common/ImageWithFallback';

interface MovieCardProps {
  movie: Movie;
  /** Biến thể hiển thị: poster dọc 2:3 (mặc định) hoặc backdrop ngang 16:9 */
  variant?: 'poster' | 'landscape';
  /** Tương thích với prop cũ */
  type?: 'poster' | 'backdrop';
  priority?: boolean;
}

/**
 * Thẻ phim dùng toàn site hiển thị dữ liệu thật từ API v1 (chất lượng, ngôn ngữ, số tập, điểm IMDb/TMDB)
 */
export default function MovieCard({
  movie,
  variant,
  type,
  priority = false,
}: MovieCardProps) {
  const resolvedVariant =
    variant ?? (type === 'backdrop' ? 'landscape' : 'poster');
  const isPoster = resolvedVariant === 'poster';

  const imageUrl = isPoster
    ? getImageUrl(movie.poster_url || movie.thumb_url)
    : getImageUrl(movie.thumb_url || movie.poster_url);
  const score = getMovieScore(movie);
  const langLabel = getShortLangLabel(movie.lang);

  return (
    <article className="group flex flex-col">
      <Link
        href={`/phim/${movie.slug}`}
        className={`relative block w-full overflow-hidden rounded-[10px] border border-white/10 bg-[#14141A] transition duration-300 group-hover:-translate-y-1 group-hover:border-white/25 group-hover:shadow-[0_14px_34px_rgba(0,0,0,0.65)] ${
          isPoster ? 'aspect-[2/3]' : 'aspect-video'
        }`}
      >
        <ImageWithFallback
          src={imageUrl}
          alt={movie.name}
          fill
          priority={priority}
          sizes={
            isPoster
              ? '(max-width: 640px) 46vw, (max-width: 1024px) 28vw, 18vw'
              : '(max-width: 640px) 85vw, (max-width: 1024px) 44vw, 24vw'
          }
          className="object-cover transition duration-500 group-hover:scale-[1.04]"
        />

        {/* Lớp phủ mờ đáy ảnh để chữ tập luôn dễ đọc */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-2/5 bg-linear-to-t from-[#0A0A0D]/95 via-[#0A0A0D]/40 to-transparent" />

        {/* Nhãn chất lượng & ngôn ngữ ở góc trên */}
        <div className="pointer-events-none absolute top-2 right-2 left-2 flex items-start justify-between gap-1">
          {movie.quality && (
            <span className="rounded bg-[#0A0A0D]/80 px-1.5 py-0.5 text-[10px] font-bold tracking-wide text-white backdrop-blur-md">
              {movie.quality}
            </span>
          )}
          {langLabel && (
            <span className="ml-auto rounded border border-white/15 bg-[#0A0A0D]/75 px-1.5 py-0.5 text-[10px] font-semibold text-[#F2F2F5] backdrop-blur-md">
              {langLabel}
            </span>
          )}
        </div>

        {/* Nút Play xuất hiện khi hover trên desktop */}
        <div className="pointer-events-none absolute inset-0 hidden items-center justify-center opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:flex">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#E50914] text-white shadow-[0_6px_24px_rgba(229,9,20,0.6)]">
            <Play className="ml-0.5 h-5 w-5 fill-white" />
          </span>
        </div>

        {/* Nhãn tập hiện tại ở đáy ảnh */}
        {movie.episode_current && (
          <div className="pointer-events-none absolute right-2 bottom-2 left-2 flex items-center justify-between gap-2">
            <span className="truncate rounded bg-black/75 px-2 py-0.5 text-[11px] font-semibold text-[#F2F2F5] backdrop-blur-sm">
              {movie.episode_current}
            </span>
          </div>
        )}
      </Link>

      {/* Tên phim & siêu dữ liệu thật bên dưới ảnh */}
      <div className="mt-2.5 px-0.5">
        <Link href={`/phim/${movie.slug}`} className="block">
          <h3 className="line-clamp-1 text-sm font-semibold text-[#F2F2F5] transition group-hover:text-[#E50914]">
            {movie.name}
          </h3>
        </Link>
        <div className="mt-1 flex items-center gap-1.5 text-xs text-[#9A9AA8]">
          {movie.year > 0 && <span>{movie.year}</span>}
          {score && (
            <>
              {movie.year > 0 && <span aria-hidden="true">·</span>}
              <span className="inline-flex items-center gap-0.5 font-semibold text-[#F5C518]">
                <Star className="h-3 w-3 fill-[#F5C518]" />
                {score}
              </span>
            </>
          )}
          {!score && movie.origin_name && (
            <>
              {movie.year > 0 && <span aria-hidden="true">·</span>}
              <span className="truncate">{movie.origin_name}</span>
            </>
          )}
        </div>
      </div>
    </article>
  );
}

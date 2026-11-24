import Link from 'next/link';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import { Play, ChevronDown } from 'lucide-react';
import { Movie } from '@/types';
import { getImageUrl } from '@/lib/services/movie';
import MovieActionButtons from '@/components/movies/MovieActionButtons';

interface MovieCardProps {
  movie: Movie;
  type?: 'poster' | 'backdrop';
  priority?: boolean;
}

export default function MovieCard({ movie, type = 'backdrop', priority = false }: MovieCardProps) {
  const imageUrl = type === 'poster' ? getImageUrl(movie.poster_url) : getImageUrl(movie.thumb_url);

  return (
    <div
      className={`group relative z-0 w-full ${type === 'backdrop' ? 'aspect-video' : 'aspect-2/3'} rounded-lg bg-zinc-900 transition-all duration-300 focus-within:z-50 hover:z-50 hover:shadow-[0_10px_28px_rgba(0,0,0,0.55)] md:hover:-translate-y-2 md:hover:scale-[1.04]`}
    >
      <Link
        href={`/phim/${movie.slug}`}
        className="relative z-20 block h-full w-full overflow-hidden rounded-md"
      >
        <ImageWithFallback
          src={imageUrl}
          alt={movie.name}
          fill
          sizes="(max-width: 768px) 50vw, (max-width: 1200px) 25vw, 20vw"
          priority={priority}
          className="rounded-md object-cover"
        />
      </Link>

      {/* Cửa sổ bật lên khi Hover (mô phỏng Modal thu nhỏ của Netflix) */}
      <div className="invisible absolute top-full left-0 z-10 hidden w-full rounded-b-lg bg-[#181818] p-4 opacity-0 shadow-[0_10px_20px_rgba(0,0,0,0.8)] transition-all duration-300 group-hover:visible group-hover:opacity-100 md:block">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Link
              href={`/xem-phim/${movie.slug}`}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white transition-colors hover:bg-gray-300 md:h-10 md:w-10"
            >
              <Play className="ml-1 h-4 w-4 fill-black text-black md:h-5 md:w-5" />
            </Link>
            <MovieActionButtons movie={movie} />
          </div>
          <Link
            href={`/phim/${movie.slug}`}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-400 text-gray-400 transition-colors hover:border-white hover:text-white md:h-10 md:w-10"
          >
            <ChevronDown className="h-4 w-4 md:h-5 md:w-5" />
          </Link>
        </div>

        <div className="mb-2 flex items-center gap-2 text-[10px] font-semibold md:text-sm">
          <span className="text-green-500">Độ phù hợp 98%</span>
          <span className="border border-gray-500 px-1 text-gray-300">HD</span>
          <span className="text-gray-300">{movie.year}</span>
        </div>

        <h3 className="mb-1 line-clamp-1 text-xs font-bold text-white md:text-base">
          {movie.name}
        </h3>
        <ul className="flex flex-wrap items-center gap-1.5 text-[10px] text-gray-400 md:text-xs">
          <li className="flex items-center gap-1.5">
            Phim hành động <span className="h-1 w-1 rounded-full bg-gray-600"></span>
          </li>
          <li className="flex items-center gap-1.5">
            Hấp dẫn <span className="h-1 w-1 rounded-full bg-gray-600"></span>
          </li>
          <li>Hồi hộp</li>
        </ul>
      </div>
    </div>
  );
}

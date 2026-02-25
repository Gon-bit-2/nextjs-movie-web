import Link from 'next/link';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import { Play, Info } from 'lucide-react';
import { Movie } from '@/types';
import { getImageUrl } from '@/lib/services/movie';

interface HeroBannerProps {
  movie: Movie;
}

export default function HeroBanner({ movie }: HeroBannerProps) {
  const imageUrl = getImageUrl(movie.thumb_url);

  return (
    <div className="relative h-[56.25vw] max-h-[100vh] min-h-[70vh] w-full bg-[#141414] select-none">
      <div className="absolute inset-0">
        <ImageWithFallback
          src={imageUrl}
          alt={movie.name}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* Lớp gradient Vignette từ dưới lên và ngang sang cực đậm */}
        <div className="absolute inset-0 bottom-[-1px] bg-linear-to-t from-[#141414] via-[#141414]/20 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-[#141414]/90 via-[#141414]/40 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-b from-black/60 via-transparent to-transparent opacity-50" />
      </div>

      <div className="absolute bottom-[25%] left-4 z-10 flex max-w-2xl flex-col gap-4 md:left-[4%]">
        <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-lg md:text-6xl lg:text-7xl">
          {movie.name}
        </h1>
        <p className="my-2 text-sm font-medium text-gray-200 drop-shadow-md md:text-lg lg:text-xl">
          {movie.origin_name} ({movie.year})
        </p>
        <p className="line-clamp-3 max-w-xl text-sm text-white drop-shadow-md md:text-lg">
          Thưởng thức bộ phim {movie.origin_name} ({movie.year}) chất lượng cao. Đón xem ngay những
          thước phim đầy cảm xúc, không thể rời mắt.
        </p>

        <div className="mt-4 flex items-center gap-3">
          <Link
            href={`/xem-phim/${movie.slug}`}
            className="flex items-center gap-2 rounded bg-white px-6 py-2 text-[1.1rem] font-semibold text-black transition-colors hover:bg-white/70 md:px-8 md:py-3"
          >
            <Play className="h-6 w-6 fill-black md:h-8 md:w-8" />
            <span>Phát</span>
          </Link>
          <Link
            href={`/phim/${movie.slug}`}
            className="flex items-center gap-2 rounded bg-[rgba(109,109,110,0.7)] px-6 py-2 text-[1.1rem] font-semibold text-white transition-colors hover:bg-[rgba(109,109,110,0.4)] md:px-8 md:py-3"
          >
            <Info className="h-6 w-6 md:h-8 md:w-8" />
            <span>Thông tin khác</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

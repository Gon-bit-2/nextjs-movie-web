import { getMovieDetail, getImageUrl } from '@/lib/services/movie';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import Link from 'next/link';
import { Play } from 'lucide-react';
import type { Metadata } from 'next';

interface MovieDetailProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: MovieDetailProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getMovieDetail(slug);
  if (!data?.movie) return { title: 'Không tìm thấy phim' };

  return {
    title: `${data.movie.name} - Netflix Clone`,
    description: data.movie.content.replace(/<[^>]+>/g, '').substring(0, 150),
  };
}

export default async function MovieDetailPage({ params }: MovieDetailProps) {
  const { slug } = await params;
  const data = await getMovieDetail(slug);

  if (!data || !data.movie) {
    return (
      <div className="min-h-[60vh] pt-32 text-center text-white">
        <h1 className="text-2xl">Không tìm thấy thông tin phim</h1>
        <Link href="/" className="text-netflix mt-4 inline-block hover:underline">
          Về trang chủ
        </Link>
      </div>
    );
  }

  const { movie } = data;
  const imageUrl = getImageUrl(movie.thumb_url || movie.poster_url);
  const cleanContent = movie.content ? movie.content.replace(/<[^>]+>/g, '') : 'Không có tóm tắt';

  return (
    <div className="relative min-h-screen">
      {/* Background Cover */}
      <div className="absolute top-0 left-0 -z-10 h-[60vh] w-full md:h-[80vh]">
        <ImageWithFallback
          src={imageUrl}
          alt={movie.name}
          fill
          priority
          className="object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/80 to-transparent" />
      </div>

      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 pt-24 md:flex-row md:gap-12 md:px-12 md:pt-40">
        {/* Poster dọc */}
        <div className="hidden w-1/3 max-w-[300px] shrink-0 md:block">
          <div className="relative aspect-[2/3] overflow-hidden rounded border border-gray-800 shadow-2xl">
            <ImageWithFallback
              src={getImageUrl(movie.poster_url)}
              alt={movie.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Thông tin metadata */}
        <div className="flex-1 md:mt-10">
          <h1 className="mb-2 text-4xl font-bold text-white md:text-6xl">{movie.name}</h1>
          <h2 className="mb-6 text-xl text-gray-400">
            {movie.origin_name} ({movie.year})
          </h2>

          <div className="mb-8 flex flex-wrap items-center gap-4 text-sm font-semibold">
            <span className="text-green-500">Độ phân giải: {movie.quality}</span>
            <span className="rounded bg-gray-800 px-2 py-1 text-white">{movie.time || 'N/A'}</span>
            <span className="rounded border border-gray-600 px-2 py-1 text-gray-300">
              {movie.episode_current}
            </span>
          </div>

          <p className="mb-8 line-clamp-4 max-w-3xl leading-relaxed text-gray-200 md:text-lg">
            {cleanContent}
          </p>

          <Link
            href={`/xem-phim/${movie.slug}`}
            className="inline-flex items-center justify-center gap-2 rounded bg-white px-8 py-3 font-bold text-black transition-opacity hover:bg-white/80"
          >
            <Play className="h-6 w-6 fill-black" />
            <span>Xem Phim</span>
          </Link>

          {/* Casting info */}
          <div className="mt-12 grid gap-2 text-sm text-gray-400">
            <p>
              <strong className="text-gray-300">Diễn viên:</strong>{' '}
              {movie.actor?.join(', ') || 'Đang cập nhật'}
            </p>
            <p>
              <strong className="text-gray-300">Đạo diễn:</strong>{' '}
              {movie.director?.join(', ') || 'Đang cập nhật'}
            </p>
            <p>
              <strong className="text-gray-300">Thể loại:</strong>{' '}
              {movie.category?.map((c) => c.name).join(', ') || 'Đang cập nhật'}
            </p>
            <p>
              <strong className="text-gray-300">Quốc gia:</strong>{' '}
              {movie.country?.map((c) => c.name).join(', ') || 'Đang cập nhật'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

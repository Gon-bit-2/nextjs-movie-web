import { getMovieDetail } from '@/lib/services/movie';
import VideoPlayer from '@/components/movies/VideoPlayer';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';

interface WatchPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export async function generateMetadata({
  params,
  searchParams,
}: WatchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { tap } = await searchParams;
  const data = await getMovieDetail(slug);
  const currentEp = tap ? ` - Tập ${tap}` : '';
  return { title: `Đang phát: ${data?.movie?.name || ''}${currentEp} - Netflix Clone` };
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { slug } = await params;
  const { tap } = await searchParams;

  const data = await getMovieDetail(slug);
  if (!data || !data.movie) return notFound();

  const serverList = data.episodes[0]?.server_data || [];
  const currentEpIndex = tap ? parseInt(tap as string) - 1 : 0;
  const safeEpIndex =
    currentEpIndex >= 0 && currentEpIndex < serverList.length ? currentEpIndex : 0;

  return (
    <div className="min-h-screen bg-[#141414]">
      {/* Nút thoát toàn màn hình nổi lên trên Video */}
      <div className="pointer-events-none absolute top-0 left-0 z-50 flex w-full items-start justify-between p-6">
        <Link
          href={`/phim/${slug}`}
          className="pointer-events-auto flex items-center gap-3 text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)] transition-colors hover:text-gray-300"
        >
          <ArrowLeft className="h-8 w-8 md:h-10 md:w-10" />
          <span className="hidden text-xl font-bold tracking-wide sm:block md:text-3xl">
            Quay lại
          </span>
        </Link>
      </div>

      <VideoPlayer serverData={serverList} currentEpisodeIndex={safeEpIndex} />

      <div className="mx-auto max-w-[1600px] px-4 py-12 md:px-[4%]">
        <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">{data.movie.name}</h1>
        <p className="mb-8 text-lg text-gray-400">Đang phát: {serverList[safeEpIndex]?.name}</p>

        {serverList.length > 1 && (
          <div className="mt-8">
            <h2 className="mb-6 text-xl font-bold text-[#e5e5e5] md:text-2xl">Tập Phim</h2>
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
              {serverList.map((ep, idx) => {
                const isActive = idx === safeEpIndex;
                return (
                  <Link
                    key={ep.slug}
                    href={`/xem-phim/${slug}?tap=${idx + 1}`}
                    scroll={false}
                    className={`flex items-center justify-center rounded-md py-3 font-medium transition-all duration-300 md:py-4 ${
                      isActive
                        ? 'scale-105 bg-white text-black shadow-lg'
                        : 'bg-[#333333] text-gray-300 hover:bg-[#4a4a4a] hover:text-white'
                    }`}
                  >
                    {ep.name}
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        <div className="mt-12 max-w-4xl">
          <h3 className="mb-4 text-xl font-bold text-[#e5e5e5] md:text-2xl">
            Về {data.movie.name}
          </h3>
          <p className="leading-relaxed whitespace-pre-wrap text-gray-300 md:text-lg">
            {data.movie.content.replace(/<[^>]+>/g, '')}
          </p>
        </div>
      </div>
    </div>
  );
}

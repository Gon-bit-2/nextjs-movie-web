import { getMovieDetail } from '@/lib/services/movie';
import VideoPlayer from '@/components/movies/VideoPlayer';
import EpisodeList from '@/components/movies/EpisodeList';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ChevronLeft, ChevronRight } from 'lucide-react';
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
  return { title: `Đang phát: ${data?.movie?.name || ''}${currentEp} - PhimHay` };
}

export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { slug } = await params;
  const { tap, server } = await searchParams;

  const data = await getMovieDetail(slug);
  if (!data || !data.movie) return notFound();

  const serverIndex = server ? Math.max(0, parseInt(server as string) - 1) : 0;
  const safeServerIndex =
    serverIndex >= 0 && serverIndex < data.episodes.length ? serverIndex : 0;
  const selectedServer = data.episodes[safeServerIndex];
  const serverList = selectedServer?.server_data || [];
  const currentEpIndex = tap ? parseInt(tap as string) - 1 : 0;
  const safeEpIndex =
    currentEpIndex >= 0 && currentEpIndex < serverList.length ? currentEpIndex : 0;
  const prevEpisodeHref =
    safeEpIndex > 0 ? `/xem-phim/${slug}?tap=${safeEpIndex}&server=${safeServerIndex + 1}` : null;
  const nextEpisodeHref =
    safeEpIndex < serverList.length - 1
      ? `/xem-phim/${slug}?tap=${safeEpIndex + 2}&server=${safeServerIndex + 1}`
      : null;

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

      <VideoPlayer
        serverData={serverList}
        currentEpisodeIndex={safeEpIndex}
        movieSlug={data.movie.slug}
        movieName={data.movie.name}
        thumbUrl={data.movie.thumb_url}
        posterUrl={data.movie.poster_url}
      />

      <div className="mx-auto max-w-[1600px] px-4 py-12 md:px-[4%]">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold text-white md:text-4xl">{data.movie.name}</h1>
            <p className="text-lg text-gray-400">
              Đang phát: {serverList[safeEpIndex]?.name || 'Không rõ tập'} ·{' '}
              {selectedServer?.server_name || 'Server mặc định'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {prevEpisodeHref && (
              <Link
                href={prevEpisodeHref}
                className="inline-flex items-center gap-2 rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/20"
              >
                <ChevronLeft className="h-4 w-4" />
                Tập trước
              </Link>
            )}
            {nextEpisodeHref && (
              <Link
                href={nextEpisodeHref}
                className="inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-white/80"
              >
                Tập sau
                <ChevronRight className="h-4 w-4" />
              </Link>
            )}
          </div>
        </div>

        {data.episodes.length > 1 && (
          <div className="mb-8">
            <h2 className="mb-3 text-lg font-bold text-white">Chọn server</h2>
            <div className="flex flex-wrap gap-2">
              {data.episodes.map((episodeServer, index) => (
                <Link
                  key={`${episodeServer.server_name}-${index}`}
                  href={`/xem-phim/${slug}?tap=${safeEpIndex + 1}&server=${index + 1}`}
                  className={`rounded-md px-4 py-2 text-sm font-semibold transition-colors ${
                    index === safeServerIndex
                      ? 'bg-red-600 text-white'
                      : 'bg-white/10 text-gray-200 hover:bg-white/20'
                  }`}
                >
                  {episodeServer.server_name || `Server ${index + 1}`}
                </Link>
              ))}
            </div>
          </div>
        )}

        {serverList.length > 1 && (
          <div className="mt-8">
            <EpisodeList
              serverList={serverList}
              slug={slug}
              safeEpIndex={safeEpIndex}
              serverIndex={safeServerIndex + 1}
            />
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

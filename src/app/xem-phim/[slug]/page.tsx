import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { getMovieDetail, getMoviesByGenre } from '@/lib/services/movie';
import WatchExperience from '@/components/player/WatchExperience';

interface WatchPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

/**
 * Tạo metadata SEO động cho trang xem phim bao gồm tên phim và số tập hiện tại
 */
export async function generateMetadata({
  params,
  searchParams,
}: WatchPageProps): Promise<Metadata> {
  const { slug } = await params;
  const { tap } = await searchParams;
  const data = await getMovieDetail(slug);
  if (!data?.movie) return { title: 'Không tìm thấy phim' };

  const currentEp = typeof tap === 'string' && tap ? ` - Tập ${tap}` : '';
  return {
    title: `Đang xem: ${data.movie.name}${currentEp}`,
    description:
      data.seoOnPage?.descriptionHead ||
      data.movie.content?.replace(/<[^>]+>/g, '').slice(0, 155),
  };
}

/**
 * Trang xem phim (/xem-phim/[slug]): đọc tham số ?tap, ?server và ?t (mốc thời gian chia sẻ)
 */
export default async function WatchPage({ params, searchParams }: WatchPageProps) {
  const { slug } = await params;
  const { tap, server, t } = await searchParams;

  const data = await getMovieDetail(slug);
  if (!data || !data.movie) return notFound();

  const servers = data.episodes || [];
  const serverParam = Array.isArray(server) ? server[0] : server;
  const tapParam = Array.isArray(tap) ? tap[0] : tap;
  const timeParam = Array.isArray(t) ? t[0] : t;

  const hasExplicitServerParam = Boolean(serverParam && serverParam.trim());
  const parsedServerIndex = serverParam ? Math.max(0, parseInt(serverParam, 10) - 1) : 0;
  const safeServerIndex =
    parsedServerIndex >= 0 && parsedServerIndex < servers.length ? parsedServerIndex : 0;

  const serverEpisodes = servers[safeServerIndex]?.server_data || [];
  const parsedEpIndex = tapParam ? Math.max(0, parseInt(tapParam, 10) - 1) : 0;
  const safeEpIndex =
    parsedEpIndex >= 0 && parsedEpIndex < serverEpisodes.length ? parsedEpIndex : 0;

  const parsedStartTime = timeParam ? parseInt(timeParam, 10) : NaN;
  const initialStartTime =
    Number.isFinite(parsedStartTime) && parsedStartTime > 0 ? parsedStartTime : undefined;

  // Lấy phim cùng thể loại đầu tiên để đề xuất bên dưới khung phát
  const firstGenreSlug = data.movie.category?.[0]?.slug;
  const relatedRes = firstGenreSlug
    ? await getMoviesByGenre(firstGenreSlug, 1, { limit: 8 })
    : null;
  const relatedMovies = (relatedRes?.items || [])
    .filter((item) => item.slug !== data.movie.slug)
    .slice(0, 6);

  return (
    <WatchExperience
      movie={data.movie}
      servers={servers}
      initialServerIndex={safeServerIndex}
      hasExplicitServerParam={hasExplicitServerParam}
      initialEpisodeIndex={safeEpIndex}
      initialStartTime={initialStartTime}
      relatedMovies={relatedMovies}
    />
  );
}

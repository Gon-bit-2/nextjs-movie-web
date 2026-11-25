'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowLeft,
  Check,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Keyboard,
  Lightbulb,
  Maximize2,
  Minimize2,
  RotateCcw,
  Share2,
  Star,
  X,
} from 'lucide-react';
import type { Episode, Movie, MovieDetail } from '@/types';
import { getMovieScore } from '@/lib/services/movie';
import {
  findPreferredServerIndex,
  normalizeServerLang,
} from '@/lib/player/server-preference';
import { usePersonalization } from '@/hooks/usePersonalization';
import MovieCard from '@/components/common/MovieCard';
import VideoPlayer from './VideoPlayer';
import EpisodePanel from './EpisodePanel';
import { formatDurationTime } from './useVidstackHls';

interface WatchExperienceProps {
  movie: MovieDetail;
  servers: Episode[];
  initialServerIndex: number;
  hasExplicitServerParam: boolean;
  initialEpisodeIndex: number;
  initialStartTime?: number;
  relatedMovies: Movie[];
}

const KEYBOARD_SHORTCUTS = [
  { key: 'Space / K', desc: 'Phát hoặc tạm dừng' },
  { key: '← / →', desc: 'Tua lùi / tới 5 giây' },
  { key: 'J / L', desc: 'Tua lùi / tới 10 giây' },
  { key: '↑ / ↓', desc: 'Tăng / giảm âm lượng' },
  { key: 'M', desc: 'Tắt / bật tiếng' },
  { key: 'F', desc: 'Toàn màn hình' },
  { key: 'N / P', desc: 'Tập sau / Tập trước' },
  { key: 'T', desc: 'Bật / tắt Chế độ rạp' },
  { key: '?', desc: 'Hiện / ẩn bảng phím tắt' },
];

/**
 * Không gian xem phim toàn diện trên client: ưu tiên ngôn ngữ server, đổi tập không reload, chia sẻ mốc thời gian
 */
export default function WatchExperience({
  movie,
  servers,
  initialServerIndex,
  hasExplicitServerParam,
  initialEpisodeIndex,
  initialStartTime,
  relatedMovies,
}: WatchExperienceProps) {
  const { playerPrefs, updatePlayerPrefs } = usePersonalization();
  const currentTimeRef = useRef(0);

  // State dẫn xuất cho server: ưu tiên chọn tay -> tham số URL -> ngôn ngữ ưa thích -> mặc định
  const [manualServerIndex, setManualServerIndex] = useState<number | null>(null);
  const [episodeIndex, setEpisodeIndex] = useState(initialEpisodeIndex);
  const [isTheaterMode, setIsTheaterMode] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [useEmbedMode, setUseEmbedMode] = useState(false);
  const [restartSignal, setRestartSignal] = useState(0);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [expandSynopsis, setExpandSynopsis] = useState(false);
  const [shareToast, setShareToast] = useState<string | null>(null);

  const preferredServerIdx = !hasExplicitServerParam
    ? findPreferredServerIndex(servers, playerPrefs.preferredLang)
    : null;
  const resolvedServerIndex = manualServerIndex ?? preferredServerIdx ?? initialServerIndex;
  const safeServerIndex =
    resolvedServerIndex >= 0 && resolvedServerIndex < servers.length ? resolvedServerIndex : 0;

  const currentServer = servers[safeServerIndex];
  const episodes = currentServer?.server_data || [];
  const safeEpisodeIndex =
    episodeIndex >= 0 && episodeIndex < episodes.length ? episodeIndex : 0;
  const currentEpisode = episodes[safeEpisodeIndex];

  const hasPrev = safeEpisodeIndex > 0;
  const hasNext = safeEpisodeIndex < episodes.length - 1;
  const score = getMovieScore(movie);
  const cleanSynopsis = movie.content ? movie.content.replace(/<[^>]+>/g, '').trim() : '';

  /**
   * Đồng bộ URL ?tap=&server= bằng History API để giữ khả năng chia sẻ link mà không tải lại trang
   */
  const syncUrl = useCallback(
    (nextEp: number, nextServer: number) => {
      if (typeof window === 'undefined') return;
      const url = `/xem-phim/${movie.slug}?tap=${nextEp + 1}&server=${nextServer + 1}`;
      window.history.replaceState(null, '', url);
    },
    [movie.slug],
  );

  /**
   * Chuyển sang tập phim mới ngay trong trình phát đang mở
   */
  const handleSelectEpisode = useCallback(
    (nextEp: number) => {
      if (nextEp < 0 || nextEp >= episodes.length) return;
      setEpisodeIndex(nextEp);
      setUseEmbedMode(false);
      syncUrl(nextEp, safeServerIndex);
      if (typeof window !== 'undefined' && window.innerWidth < 1280) {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    },
    [episodes.length, safeServerIndex, syncUrl],
  );

  /**
   * Đổi server phát, ghi nhớ ngôn ngữ ưa thích và giữ đúng số tập tương ứng
   */
  const handleSelectServer = useCallback(
    (nextServer: number) => {
      if (nextServer < 0 || nextServer >= servers.length) return;
      const nextList = servers[nextServer]?.server_data || [];
      const clampedEp = Math.min(safeEpisodeIndex, Math.max(0, nextList.length - 1));
      setManualServerIndex(nextServer);
      setEpisodeIndex(clampedEp);
      setUseEmbedMode(false);
      syncUrl(clampedEp, nextServer);

      const detectedLang = normalizeServerLang(servers[nextServer]?.server_name);
      if (detectedLang) {
        updatePlayerPrefs({ preferredLang: detectedLang });
      }
    },
    [safeEpisodeIndex, servers, syncUrl, updatePlayerPrefs],
  );

  /**
   * Chuyển vòng sang server dự phòng kế tiếp khi luồng hiện tại lỗi
   */
  const handleSuggestNextServer = useCallback(() => {
    if (servers.length <= 1) return;
    const nextServer = (safeServerIndex + 1) % servers.length;
    handleSelectServer(nextServer);
  }, [handleSelectServer, safeServerIndex, servers.length]);

  /**
   * Sao chép liên kết xem phim kèm chính xác mốc thời gian hiện tại (?t=...)
   */
  const handleShareTimestamp = async () => {
    if (typeof window === 'undefined') return;
    const sec = Math.floor(currentTimeRef.current);
    const params = new URLSearchParams({
      tap: String(safeEpisodeIndex + 1),
      server: String(safeServerIndex + 1),
    });
    if (sec > 5) {
      params.set('t', String(sec));
    }
    const shareUrl = `${window.location.origin}/xem-phim/${movie.slug}?${params.toString()}`;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setShareToast(sec > 5 ? `Đã chép tại ${formatDurationTime(sec)}` : 'Đã chép link xem');
      window.setTimeout(() => setShareToast(null), 2400);
    } catch {
      // Dự phòng nếu trình duyệt không hỗ trợ clipboard
      window.prompt('Sao chép liên kết xem phim:', shareUrl);
    }
  };

  // Đăng ký phím tắt điều hướng tập, chế độ rạp và trợ giúp phím tắt
  useEffect(() => {
    const controller = new AbortController();

    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === 'n' || event.key === 'N') {
        if (hasNext) {
          event.preventDefault();
          handleSelectEpisode(safeEpisodeIndex + 1);
        }
      } else if (event.key === 'p' || event.key === 'P') {
        if (hasPrev) {
          event.preventDefault();
          handleSelectEpisode(safeEpisodeIndex - 1);
        }
      } else if (event.key === 't' || event.key === 'T') {
        event.preventDefault();
        setIsTheaterMode((prev) => !prev);
      } else if (event.key === '?') {
        event.preventDefault();
        setShowShortcuts((prev) => !prev);
      } else if (event.key === 'Escape' && showShortcuts) {
        setShowShortcuts(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown, { signal: controller.signal });
    return () => controller.abort();
  }, [handleSelectEpisode, hasNext, hasPrev, safeEpisodeIndex, showShortcuts]);

  const isDimmed = playerPrefs.lightsOff && isPlaying;

  return (
    <div className="relative min-h-screen bg-[#0A0A0D] text-[#F2F2F5]">
      {/* Lớp phủ làm tối toàn trang khi bật Tắt đèn và video đang chạy */}
      <div
        aria-hidden="true"
        onClick={() => updatePlayerPrefs({ lightsOff: false })}
        className={`fixed inset-0 z-30 bg-black/85 transition-opacity duration-500 ${
          isDimmed ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* Thanh tiêu đề rạp chiếu mỏng 48px thay cho Header cố định */}
      <header className="sticky top-0 z-40 flex h-12 items-center justify-between gap-3 border-b border-white/10 bg-[#0A0A0D]/95 px-4 backdrop-blur-md md:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            href={`/phim/${movie.slug}`}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-semibold text-[#9A9AA8] transition hover:bg-white/10 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Chi tiết</span>
          </Link>
          <span className="h-4 w-px bg-white/10" aria-hidden="true" />
          <div className="flex min-w-0 items-center gap-2 text-xs sm:text-sm">
            <span className="truncate font-semibold text-white">{movie.name}</span>
            {currentEpisode && (
              <span className="shrink-0 rounded bg-[#E50914]/20 px-2 py-0.5 text-[11px] font-semibold text-[#ffb4aa]">
                {currentEpisode.name}
              </span>
            )}
            {currentServer?.server_name && (
              <span className="hidden shrink-0 text-xs text-[#9A9AA8] md:inline">
                · {currentServer.server_name}
              </span>
            )}
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5 sm:gap-2">
          <button
            type="button"
            onClick={() => updatePlayerPrefs({ lightsOff: !playerPrefs.lightsOff })}
            className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition ${
              playerPrefs.lightsOff
                ? 'border-[#F5C518]/50 bg-[#F5C518]/15 text-[#F5C518]'
                : 'border-white/10 bg-white/5 text-[#9A9AA8] hover:text-white'
            }`}
            title="Làm tối khu vực xung quanh khi đang phát"
          >
            <Lightbulb className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">
              {playerPrefs.lightsOff ? 'Bật đèn' : 'Tắt đèn'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsTheaterMode((prev) => !prev)}
            className={`hidden items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium transition xl:inline-flex ${
              isTheaterMode
                ? 'border-[#E50914]/50 bg-[#E50914]/15 text-white'
                : 'border-white/10 bg-white/5 text-[#9A9AA8] hover:text-white'
            }`}
            title="Chuyển chế độ rạp (T)"
          >
            {isTheaterMode ? (
              <Minimize2 className="h-3.5 w-3.5" />
            ) : (
              <Maximize2 className="h-3.5 w-3.5" />
            )}
            <span>Chế độ rạp</span>
          </button>

          <button
            type="button"
            onClick={() => setShowShortcuts(true)}
            aria-label="Xem phím tắt"
            title="Phím tắt (?)"
            className="hidden rounded-full border border-white/10 bg-white/5 p-1.5 text-[#9A9AA8] transition hover:text-white md:inline-flex"
          >
            <Keyboard className="h-3.5 w-3.5" />
          </button>

          <Link
            href="/"
            className="font-display ml-1 text-base font-bold tracking-wider text-[#E50914]"
          >
            PHIMHAY
          </Link>
        </div>
      </header>

      {/* Khu vực sân khấu phát video + thanh tập */}
      <div className="mx-auto max-w-[1600px] px-0 pt-0 pb-12 sm:px-4 sm:pt-4 md:px-6">
        <div
          className={`grid gap-5 ${
            isTheaterMode || episodes.length <= 1
              ? 'grid-cols-1'
              : 'grid-cols-1 xl:grid-cols-[minmax(0,1fr)_360px]'
          }`}
        >
          {/* Cột trình phát (dính đầu trang trên mobile khi cuộn chọn tập) */}
          <div className="min-w-0">
            <div className="sticky top-12 z-40 bg-black sm:static sm:bg-transparent">
              <VideoPlayer
                episodes={episodes}
                currentEpisodeIndex={safeEpisodeIndex}
                currentServerIndex={safeServerIndex}
                hasMultipleServers={servers.length > 1}
                movieSlug={movie.slug}
                movieName={movie.name}
                originName={movie.origin_name}
                thumbUrl={movie.thumb_url}
                posterUrl={movie.poster_url}
                autoNext={playerPrefs.autoNext}
                useEmbedMode={useEmbedMode}
                restartSignal={restartSignal}
                initialStartTime={initialStartTime}
                currentTimeRef={currentTimeRef}
                onToggleEmbedMode={setUseEmbedMode}
                onSelectEpisode={handleSelectEpisode}
                onSuggestNextServer={handleSuggestNextServer}
                onPlayingChange={setIsPlaying}
              />
            </div>

            {/* Thanh công cụ điều khiển ngay dưới player */}
            <div className="mx-3 mt-3 flex flex-wrap items-center justify-between gap-2.5 rounded-[10px] border border-white/10 bg-[#14141A] p-3 sm:mx-0">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  disabled={!hasPrev}
                  onClick={() => handleSelectEpisode(safeEpisodeIndex - 1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-[#1E1E26] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#2a2a36] disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Tập trước
                </button>
                <button
                  type="button"
                  disabled={!hasNext}
                  onClick={() => handleSelectEpisode(safeEpisodeIndex + 1)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-[#E50914] px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-[#f40612] disabled:cursor-not-allowed disabled:bg-white/10 disabled:text-[#9A9AA8]"
                >
                  Tập sau
                  <ChevronRight className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setRestartSignal((s) => s + 1)}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-[#F2F2F5] transition hover:bg-white/15"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Xem lại từ đầu
                </button>
                <button
                  type="button"
                  onClick={handleShareTimestamp}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-medium text-[#F2F2F5] transition hover:bg-white/15"
                >
                  {shareToast ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Share2 className="h-3.5 w-3.5" />
                  )}
                  <span>{shareToast ?? 'Chia sẻ mốc xem'}</span>
                </button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {episodes.length > 1 && (
                  <button
                    type="button"
                    onClick={() => updatePlayerPrefs({ autoNext: !playerPrefs.autoNext })}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                      playerPrefs.autoNext
                        ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                        : 'border-white/10 bg-white/5 text-[#9A9AA8] hover:text-white'
                    }`}
                  >
                    <span
                      className={`h-2 w-2 rounded-full ${
                        playerPrefs.autoNext ? 'bg-emerald-400' : 'bg-white/30'
                      }`}
                    />
                    Tự chuyển tập: {playerPrefs.autoNext ? 'Bật' : 'Tắt'}
                  </button>
                )}

                <button
                  type="button"
                  onClick={() => setUseEmbedMode((prev) => !prev)}
                  className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-medium transition ${
                    useEmbedMode
                      ? 'border-[#F5C518]/40 bg-[#F5C518]/10 text-[#F5C518]'
                      : 'border-white/10 bg-white/5 text-[#9A9AA8] hover:text-white'
                  }`}
                >
                  <AlertTriangle className="h-3.5 w-3.5" />
                  {useEmbedMode ? 'Quay lại Vidstack' : 'Trình phát dự phòng'}
                </button>
              </div>
            </div>
          </div>

          {/* Cột danh sách tập & server */}
          {(episodes.length > 1 || servers.length > 1) && (
            <aside className="px-3 sm:px-0">
              <EpisodePanel
                servers={servers}
                movieSlug={movie.slug}
                activeServerIndex={safeServerIndex}
                activeEpisodeIndex={safeEpisodeIndex}
                layout={isTheaterMode ? 'grid' : 'sidebar'}
                onSelectEpisode={handleSelectEpisode}
                onSelectServer={handleSelectServer}
              />
            </aside>
          )}
        </div>

        {/* Tóm tắt nhanh thông tin bộ phim */}
        <section className="mx-3 mt-8 rounded-[10px] border border-white/10 bg-[#14141A] p-4 sm:mx-0 md:p-6">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h1 className="font-display text-2xl font-bold tracking-wide text-white uppercase md:text-3xl">
                {movie.name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-[#9A9AA8]">
                {score && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-[#F5C518]/30 bg-[#0A0A0D] px-2.5 py-0.5 font-semibold text-[#F5C518]">
                    <Star className="h-3 w-3 fill-[#F5C518]" />
                    {score}
                  </span>
                )}
                {movie.quality && (
                  <span className="rounded border border-white/10 bg-white/5 px-2 py-0.5 font-medium text-white">
                    {movie.quality}
                  </span>
                )}
                {movie.year > 0 && <span>{movie.year}</span>}
                {movie.episode_current && <span>· {movie.episode_current}</span>}
                {movie.country?.[0] && (
                  <Link
                    href={`/quoc-gia/${movie.country[0].slug}`}
                    className="transition hover:text-white"
                  >
                    · {movie.country[0].name}
                  </Link>
                )}
              </div>
            </div>

            <Link
              href={`/phim/${movie.slug}`}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white transition hover:bg-white/15"
            >
              Xem chi tiết phim
              <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>

          {cleanSynopsis && (
            <div className="mt-4">
              <p
                className={`text-sm leading-relaxed text-[#9A9AA8] ${
                  expandSynopsis ? '' : 'line-clamp-2'
                }`}
              >
                {cleanSynopsis}
              </p>
              {cleanSynopsis.length > 160 && (
                <button
                  type="button"
                  onClick={() => setExpandSynopsis((prev) => !prev)}
                  className="mt-1.5 text-xs font-semibold text-white transition hover:text-[#E50914]"
                >
                  {expandSynopsis ? 'Thu gọn' : 'Xem thêm'}
                </button>
              )}
            </div>
          )}
        </section>

        {/* Phim đề xuất tương tự */}
        {relatedMovies.length > 0 && (
          <section className="mt-10 px-3 sm:px-0">
            <h2 className="font-display mb-4 text-xl font-bold tracking-wide text-white uppercase md:text-2xl">
              Có thể bạn thích
            </h2>
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
              {relatedMovies.slice(0, 6).map((item) => (
                <MovieCard key={item._id} movie={item} />
              ))}
            </div>
          </section>
        )}
      </div>

      {/* Hộp thoại danh sách phím tắt */}
      {showShortcuts && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Phím tắt trình phát"
          onClick={() => setShowShortcuts(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-xl border border-white/15 bg-[#14141A] p-5 shadow-2xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-display text-lg font-bold tracking-wide text-white uppercase">
                Phím tắt trình phát
              </h3>
              <button
                type="button"
                onClick={() => setShowShortcuts(false)}
                aria-label="Đóng bảng phím tắt"
                className="rounded-lg p-1 text-[#9A9AA8] hover:bg-white/10 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="divide-y divide-white/10 text-sm">
              {KEYBOARD_SHORTCUTS.map((item) => (
                <li key={item.key} className="flex items-center justify-between py-2.5">
                  <span className="text-[#9A9AA8]">{item.desc}</span>
                  <kbd className="rounded border border-white/15 bg-[#0A0A0D] px-2 py-0.5 font-mono text-xs text-white">
                    {item.key}
                  </kbd>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}

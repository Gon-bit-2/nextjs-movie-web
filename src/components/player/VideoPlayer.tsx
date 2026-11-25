'use client';

import '@vidstack/react/player/styles/default/theme.css';
import '@vidstack/react/player/styles/default/layouts/video.css';

import { useCallback, useEffect, useRef, useState, type MutableRefObject } from 'react';
import { preconnect } from 'react-dom';
import {
  MediaPlayer,
  MediaProvider,
  Poster,
  isHLSProvider,
  type MediaErrorDetail,
  type MediaPlayerInstance,
  type MediaProviderAdapter,
  type MediaTimeUpdateEventDetail,
} from '@vidstack/react';
import {
  DefaultVideoLayout,
  defaultLayoutIcons,
} from '@vidstack/react/player/layouts/default';
import { AlertCircle, MonitorPlay, RefreshCw, Server } from 'lucide-react';
import type { EpisodeItem } from '@/types';
import {
  HLS_VOD_CONFIG,
  VIDSTACK_VI_TRANSLATIONS,
  getStreamOrigin,
  warmNextEpisodeManifest,
} from './useVidstackHls';
import { useWatchProgress } from './useWatchProgress';
import EmbedFallback from './EmbedFallback';
import ResumePrompt from './ResumePrompt';
import NextEpisodeOverlay from './NextEpisodeOverlay';
import SkipIntroButton from './SkipIntroButton';

const SKIP_INTRO_SECONDS = 85;
const SKIP_INTRO_WINDOW_MIN = 5;
const SKIP_INTRO_WINDOW_MAX = 180;
const MIN_DURATION_FOR_INTRO_SKIP = 600;

interface VideoPlayerProps {
  episodes: EpisodeItem[];
  currentEpisodeIndex: number;
  currentServerIndex: number;
  hasMultipleServers: boolean;
  movieSlug: string;
  movieName: string;
  originName?: string;
  thumbUrl?: string;
  posterUrl?: string;
  autoNext: boolean;
  useEmbedMode: boolean;
  restartSignal: number;
  /** Mốc thời gian khởi phát truyền qua URL (?t=...) */
  initialStartTime?: number;
  /** Ref nhận thời điểm phát hiện tại để chia sẻ link mà không gây re-render */
  currentTimeRef?: MutableRefObject<number>;
  onToggleEmbedMode: (useEmbed: boolean) => void;
  onSelectEpisode: (episodeIndex: number) => void;
  onSuggestNextServer: () => void;
  onPlayingChange?: (playing: boolean) => void;
}

/**
 * Trình phát phim chính sử dụng Vidstack + hls.js (VOD), nhớ tốc độ/âm lượng, bỏ qua intro và dự phòng Embed
 */
export default function VideoPlayer({
  episodes,
  currentEpisodeIndex,
  currentServerIndex,
  hasMultipleServers,
  movieSlug,
  movieName,
  originName,
  thumbUrl,
  posterUrl,
  autoNext,
  useEmbedMode,
  restartSignal,
  initialStartTime,
  currentTimeRef,
  onToggleEmbedMode,
  onSelectEpisode,
  onSuggestNextServer,
  onPlayingChange,
}: VideoPlayerProps) {
  const playerRef = useRef<MediaPlayerInstance | null>(null);
  const warmedEpisodeRef = useRef<number | null>(null);
  const retryCountRef = useRef(0);
  const appliedUrlStartRef = useRef(false);

  const [fatalError, setFatalError] = useState<string | null>(null);
  const [resumeSeconds, setResumeSeconds] = useState<number>(0);
  const [showNextOverlay, setShowNextOverlay] = useState<boolean>(false);
  const [nextDismissed, setNextDismissed] = useState<boolean>(false);
  const [showSkipIntro, setShowSkipIntro] = useState<boolean>(false);
  const [skipIntroUsed, setSkipIntroUsed] = useState<boolean>(false);
  const [retryNonce, setRetryNonce] = useState<number>(0);

  const episode = episodes[currentEpisodeIndex];
  const nextEpisode = episodes[currentEpisodeIndex + 1];
  const streamOrigin = getStreamOrigin(episode?.link_m3u8);

  // Mở sẵn kết nối TLS tới máy chủ luồng video và máy chủ dự phòng
  if (streamOrigin) {
    preconnect(streamOrigin);
  }
  preconnect('https://player.phimapi.com');

  const { reportTime, flushProgress, readSavedTime, resetCurrentProgress } = useWatchProgress({
    movieSlug,
    movieName,
    originName,
    thumbUrl,
    posterUrl,
    episodeName: episode?.name || `Tập ${currentEpisodeIndex + 1}`,
    episodeIndex: currentEpisodeIndex,
    serverIndex: currentServerIndex,
  });

  // Đặt lại trạng thái lỗi, gợi ý tiếp tục, bỏ qua intro khi đổi tập hoặc đổi server
  useEffect(() => {
    retryCountRef.current = 0;
    warmedEpisodeRef.current = null;
    if (currentTimeRef) currentTimeRef.current = 0;

    setFatalError(null);
    setShowNextOverlay(false);
    setNextDismissed(false);
    setShowSkipIntro(false);
    setSkipIntroUsed(false);

    // Nếu đang mở bằng link chia sẻ có ?t= thì không hiện hộp hỏi tiếp tục cũ
    if (initialStartTime && initialStartTime > 0 && !appliedUrlStartRef.current) {
      setResumeSeconds(0);
      return;
    }

    const saved = readSavedTime();
    setResumeSeconds(saved);
  }, [currentEpisodeIndex, currentServerIndex, currentTimeRef, initialStartTime, readSavedTime]);

  // Xử lý yêu cầu Xem lại từ đầu từ thanh tiện ích bên ngoài
  useEffect(() => {
    if (restartSignal === 0) return;
    resetCurrentProgress();
    setResumeSeconds(0);
    setShowNextOverlay(false);
    setSkipIntroUsed(false);
    if (playerRef.current) {
      playerRef.current.currentTime = 0;
      void playerRef.current.play().catch(() => {});
    }
  }, [restartSignal, resetCurrentProgress]);

  /**
   * Cấu hình HLSProvider của Vidstack với thư viện hls.js cục bộ và thông số VOD ổn định
   */
  const handleProviderChange = useCallback((provider: MediaProviderAdapter | null) => {
    if (isHLSProvider(provider)) {
      provider.library = () => import('hls.js');
      provider.config = HLS_VOD_CONFIG;
    }
  }, []);

  /**
   * Đồng bộ tiến độ phát, hiển thị nút Bỏ qua 85s, làm nóng tập kế tiếp và lớp phủ tự chuyển tập
   */
  const handleTimeUpdate = useCallback(
    (detail: MediaTimeUpdateEventDetail) => {
      const player = playerRef.current;
      const duration = player?.duration ?? 0;
      const currentTime = detail.currentTime;

      if (currentTimeRef) {
        currentTimeRef.current = currentTime;
      }

      reportTime(currentTime, duration);

      // Hiện nút Bỏ qua intro trong cửa sổ 5s..180s đối với phim dài > 10 phút
      const shouldShowSkip =
        !skipIntroUsed &&
        duration > MIN_DURATION_FOR_INTRO_SKIP &&
        currentTime >= SKIP_INTRO_WINDOW_MIN &&
        currentTime <= SKIP_INTRO_WINDOW_MAX;
      setShowSkipIntro((prev) => (prev === shouldShowSkip ? prev : shouldShowSkip));

      if (duration > 60 && nextEpisode) {
        const progressRatio = currentTime / duration;
        if (progressRatio >= 0.85 && warmedEpisodeRef.current !== currentEpisodeIndex + 1) {
          warmedEpisodeRef.current = currentEpisodeIndex + 1;
          void warmNextEpisodeManifest(nextEpisode.link_m3u8);
        }

        const remaining = duration - currentTime;
        if (autoNext && !nextDismissed && remaining <= 10 && remaining > 0.5) {
          setShowNextOverlay(true);
        }
      }
    },
    [
      autoNext,
      currentEpisodeIndex,
      currentTimeRef,
      nextDismissed,
      nextEpisode,
      reportTime,
      skipIntroUsed,
    ],
  );

  /**
   * Xử lý khi trình phát sẵn sàng: xóa lỗi cũ và tua 1 lần đến mốc ?t= nếu có
   */
  const handleCanPlay = useCallback(() => {
    setFatalError(null);
    retryCountRef.current = 0;

    if (
      initialStartTime &&
      initialStartTime > 0 &&
      !appliedUrlStartRef.current &&
      playerRef.current
    ) {
      appliedUrlStartRef.current = true;
      const duration = playerRef.current.duration;
      const clamped =
        duration && Number.isFinite(duration)
          ? Math.min(initialStartTime, Math.max(0, duration - 5))
          : initialStartTime;
      playerRef.current.currentTime = clamped;
    }
  }, [initialStartTime]);

  /**
   * Xử lý lỗi phát luồng: tự thử lại tối đa 2 lần, sau đó hiển thị bảng lựa chọn dự phòng
   */
  const handleError = useCallback((detail: MediaErrorDetail) => {
    if (retryCountRef.current < 2) {
      retryCountRef.current += 1;
      setRetryNonce((n) => n + 1);
      return;
    }

    setFatalError(
      detail?.message ||
        'Không thể tải luồng video trực tiếp lúc này. Bạn có thể chuyển sang trình phát dự phòng hoặc đổi server.',
    );
  }, []);

  /**
   * Tự kích hoạt lớp phủ tập tiếp theo khi kết thúc tập hiện tại
   */
  const handleEnded = useCallback(() => {
    flushProgress(true);
    onPlayingChange?.(false);
    if (autoNext && nextEpisode) {
      setShowNextOverlay(true);
    }
  }, [autoNext, flushProgress, nextEpisode, onPlayingChange]);

  /**
   * Tua nhanh thêm 85 giây để bỏ qua phần mở đầu
   */
  const handleSkipIntro = useCallback(() => {
    const player = playerRef.current;
    if (!player) return;
    const duration = player.duration || 0;
    const target =
      duration > 0
        ? Math.min(duration - 5, player.currentTime + SKIP_INTRO_SECONDS)
        : player.currentTime + SKIP_INTRO_SECONDS;
    player.currentTime = target;
    setSkipIntroUsed(true);
    setShowSkipIntro(false);
  }, []);

  /**
   * Tua nhanh đến mốc thời gian đã lưu khi người dùng đồng ý tiếp tục xem
   */
  const handleResume = useCallback(() => {
    const target = resumeSeconds;
    setResumeSeconds(0);
    if (playerRef.current && target > 0) {
      playerRef.current.currentTime = target;
      void playerRef.current.play().catch(() => {});
    }
  }, [resumeSeconds]);

  /**
   * Xóa tiến độ cũ và bắt đầu phát tập hiện tại từ giây 0
   */
  const handleRestartFromPrompt = useCallback(() => {
    resetCurrentProgress();
    setResumeSeconds(0);
    if (playerRef.current) {
      playerRef.current.currentTime = 0;
      void playerRef.current.play().catch(() => {});
    }
  }, [resetCurrentProgress]);

  /**
   * Thử khởi chạy lại nguồn HLS hiện tại
   */
  const handleManualRetry = useCallback(() => {
    retryCountRef.current = 0;
    setFatalError(null);
    onToggleEmbedMode(false);
    setRetryNonce((n) => n + 1);
  }, [onToggleEmbedMode]);

  /**
   * Chuyển sang tập kế tiếp ngay lập tức
   */
  const handlePlayNext = useCallback(() => {
    setShowNextOverlay(false);
    if (nextEpisode) {
      flushProgress(true);
      onSelectEpisode(currentEpisodeIndex + 1);
    }
  }, [currentEpisodeIndex, flushProgress, nextEpisode, onSelectEpisode]);

  if (!episode) {
    return (
      <div className="flex aspect-video w-full items-center justify-center rounded-[10px] border border-white/10 bg-[#0A0A0D] text-sm text-[#9A9AA8]">
        Chưa có nguồn phát cho bộ phim này.
      </div>
    );
  }

  // Nếu không có link_m3u8 hoặc người dùng chọn trình phát dự phòng thì hiển thị EmbedFallback
  if (useEmbedMode || !episode.link_m3u8) {
    return (
      <EmbedFallback
        embedUrl={episode.link_embed}
        m3u8Url={episode.link_m3u8}
        title={`${movieName} - ${episode.name}`}
        hasMultipleServers={hasMultipleServers}
        onRetryNative={handleManualRetry}
        onSuggestServer={onSuggestNextServer}
      />
    );
  }

  const streamSrc =
    retryNonce > 0
      ? `${episode.link_m3u8}${episode.link_m3u8.includes('?') ? '&' : '?'}r=${retryNonce}`
      : episode.link_m3u8;

  return (
    <div className="relative overflow-hidden rounded-[10px] bg-black shadow-[0_20px_60px_rgba(0,0,0,0.75)]">
      <MediaPlayer
        ref={playerRef}
        className="phimhay-player"
        title={`${movieName} — ${episode.name}`}
        src={{ src: streamSrc, type: 'application/x-mpegurl' }}
        storage="phimhay-player"
        viewType="video"
        streamType="on-demand"
        load="eager"
        playsInline
        crossOrigin="anonymous"
        autoPlay
        onProviderChange={handleProviderChange}
        onCanPlay={handleCanPlay}
        onTimeUpdate={handleTimeUpdate}
        onPlay={() => onPlayingChange?.(true)}
        onPause={() => {
          flushProgress(true);
          onPlayingChange?.(false);
        }}
        onEnded={handleEnded}
        onError={handleError}
      >
        <MediaProvider>
          {(thumbUrl || posterUrl) && (
            <Poster
              className="vds-poster object-cover"
              src={thumbUrl || posterUrl}
              alt={movieName}
            />
          )}
        </MediaProvider>

        <DefaultVideoLayout
          icons={defaultLayoutIcons}
          translations={VIDSTACK_VI_TRANSLATIONS}
          seekStep={10}
        />
      </MediaPlayer>

      {/* Thông báo hỏi tiếp tục xem */}
      {resumeSeconds > 10 && !fatalError && (
        <ResumePrompt
          savedSeconds={resumeSeconds}
          onResume={handleResume}
          onRestart={handleRestartFromPrompt}
          onDismiss={() => setResumeSeconds(0)}
        />
      )}

      {/* Nút Bỏ qua intro +85s */}
      {showSkipIntro && !showNextOverlay && !fatalError && (
        <SkipIntroButton onSkip={handleSkipIntro} />
      )}

      {/* Lớp phủ tự chuyển tập tiếp theo */}
      {showNextOverlay && nextEpisode && !fatalError && (
        <NextEpisodeOverlay
          nextEpisodeName={`${movieName} · ${nextEpisode.name}`}
          onPlayNext={handlePlayNext}
          onCancel={() => {
            setShowNextOverlay(false);
            setNextDismissed(true);
          }}
        />
      )}

      {/* Lớp phủ xử lý lỗi với 3 lựa chọn khôi phục */}
      {fatalError && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center bg-[#0A0A0D]/95 p-6 text-center backdrop-blur-sm">
          <AlertCircle className="mb-3 h-11 w-11 text-[#E50914]" />
          <h3 className="font-display text-xl font-bold tracking-wide text-white uppercase">
            Nguồn phát gặp sự cố
          </h3>
          <p className="mt-1.5 max-w-md text-xs leading-relaxed text-[#9A9AA8] sm:text-sm">
            {fatalError}
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={handleManualRetry}
              className="inline-flex items-center gap-2 rounded-lg bg-[#E50914] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#f40612] sm:text-sm"
            >
              <RefreshCw className="h-4 w-4" />
              Thử tải lại
            </button>
            <button
              type="button"
              onClick={() => {
                setFatalError(null);
                onToggleEmbedMode(true);
              }}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-xs font-semibold text-white transition hover:bg-white/20 sm:text-sm"
            >
              <MonitorPlay className="h-4 w-4" />
              Trình phát dự phòng
            </button>
            {hasMultipleServers && (
              <button
                type="button"
                onClick={() => {
                  setFatalError(null);
                  onSuggestNextServer();
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#1E1E26] px-4 py-2 text-xs font-semibold text-white transition hover:bg-[#2a2a36] sm:text-sm"
              >
                <Server className="h-4 w-4" />
                Đổi server khác
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

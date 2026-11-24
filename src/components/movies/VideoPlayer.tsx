'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import 'plyr/dist/plyr.css';
import { Loader2, AlertCircle, RotateCcw } from 'lucide-react';
import { clearEpisodeProgress, saveWatchProgress } from '@/lib/storage/movie-personalization';

interface VideoPlayerProps {
  serverData: {
    link_m3u8: string;
    link_embed: string;
    name: string;
  }[];
  currentEpisodeIndex: number;
  movieSlug: string;
  movieName: string;
  thumbUrl?: string;
  posterUrl?: string;
}

interface HlsLevel {
  height: number;
}

interface HlsErrorData {
  fatal: boolean;
  type: string;
}

interface HlsInstance {
  levels: HlsLevel[];
  currentLevel: number;
  loadSource: (source: string) => void;
  attachMedia: (media: HTMLMediaElement) => void;
  on: (event: string, handler: (event: string, data: unknown) => void) => void;
  startLoad: () => void;
  recoverMediaError: () => void;
  destroy: () => void;
}

interface HlsStatic {
  isSupported: () => boolean;
  Events: { MANIFEST_PARSED: string; ERROR: string };
  ErrorTypes: { NETWORK_ERROR: string; MEDIA_ERROR: string };
  new (config: { enableWorker: boolean; lowLatencyMode: boolean; backBufferLength: number }): HlsInstance;
}

interface PlayerInstance {
  currentTime: number;
  duration: number;
  play: () => Promise<void>;
  destroy: () => void;
  once: (event: string, handler: () => void) => void;
  on: (event: string, handler: () => void) => void;
}

type PlyrOptions = Record<string, unknown>;
type PlyrStatic = new (target: HTMLVideoElement, options: PlyrOptions) => PlayerInstance;

export default function VideoPlayer({
  serverData,
  currentEpisodeIndex,
  movieSlug,
  movieName,
  thumbUrl,
  posterUrl,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<HlsInstance | null>(null);
  const playerRef = useRef<PlayerInstance | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initPlayer = useCallback(async () => {
    if (!serverData || serverData.length === 0) return;

    const episode = serverData[currentEpisodeIndex];
    const video = videoRef.current;
    if (!video) return;

    setTimeout(() => {
      setIsLoading(true);
      setError(null);
    }, 0);

    // Dọn dẹp HLS và Plyr cũ trước khi khởi tạo mới
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
    if (playerRef.current) {
      playerRef.current.destroy();
      playerRef.current = null;
    }

    // Khi khởi tạo lại Plyr, DOM node `<video>` có thể bị thay đổi / bọc bên trong thẻ <div> Plyr,
    // vì vậy phải tạo lại thẻ `<video>` nguyên bản nếu bị mất do Plyr cũ destroy.
    if (!videoRef.current) return;

    const videoSrc = episode.link_m3u8;

    const savedProgress = localStorage.getItem(
      `watch-progress-${movieSlug}-${currentEpisodeIndex}`,
    );
    const timeToStart = savedProgress && !isNaN(Number(savedProgress)) ? Number(savedProgress) : 0;

    const defaultOptions: PlyrOptions = {
      controls: [
        'play-large',
        'play',
        'progress',
        'current-time',
        'mute',
        'volume',
        'settings',
        'pip',
        'airplay',
        'fullscreen',
      ],
      settings: ['quality', 'speed'],
      i18n: {
        quality: 'Chất lượng',
        speed: 'Tốc độ',
        qualityLabel: {
          0: 'Tự động',
        },
      },
      keyboard: { focused: true, global: true },
      seekTime: 10,
    };

    const [{ default: HlsDefault }, { default: PlyrDefault }] = await Promise.all([
      import('hls.js'),
      import('plyr'),
    ]);
    const Hls = HlsDefault as HlsStatic;
    const Plyr = PlyrDefault as PlyrStatic;

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.loadSource(videoSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event, data) => {
        setIsLoading(false);

        // Lọc ra các chất lượng video có sẵn từ HLS playlist
        const manifest = data as { levels: HlsLevel[] };
        const availableQualities = manifest.levels
          .map((level) => level.height)
          .filter((height) => height && height > 0);

        let plyrOptions = { ...defaultOptions };

        if (availableQualities.length > 0) {
          // Bọc lại các tùy chọn chất lượng cho Plyr, thêm '0' (Tự động)
          availableQualities.unshift(0);

          plyrOptions = {
            ...defaultOptions,
            quality: {
              default:
                availableQualities.length > 1 ? availableQualities[1] : availableQualities[0],
              options: availableQualities,
              forced: true,
              onChange: (quality: number) => {
                if (quality === 0) {
                  hls.currentLevel = -1; // -1 cho Auto
                } else {
                  hls.levels.forEach((level, levelIndex) => {
                    if (level.height === quality) {
                      hls.currentLevel = levelIndex;
                    }
                  });
                }
              },
            },
          };
        } else {
          // Fallback giả lập các mức chọn chất lượng nếu m3u8 API chỉ trả file trực tiếp không có Master Playlist
          const fakeQualities = [0, 1080, 720, 480];
          plyrOptions = {
            ...defaultOptions,
            quality: {
              default: 0,
              options: fakeQualities,
              forced: true,
              onChange: () => {
                // Ignore actual logic, just visual. The source doesn't support switching.
              },
            },
          };
        }

        // Khởi tạo Plyr
        const player = new Plyr(videoRef.current as HTMLVideoElement, plyrOptions);
        playerRef.current = player;

        if (timeToStart > 0) {
          player.once('canplay', () => {
            if (playerRef.current !== player) {
              return;
            }

            player.currentTime = timeToStart;
          });
        }

        player.play().catch(() => {
          console.warn('Auto-play bị chặn bởi trình duyệt, người dùng cần thao tác tay.');
        });

        // Theo dõi tiến trình với Plyr thay vì video node native để ổn định hơn
        player.on('timeupdate', () => {
          if (playerRef.current !== player || player.currentTime <= 5) {
            return;
          }

          localStorage.setItem(
            `watch-progress-${movieSlug}-${currentEpisodeIndex}`,
            player.currentTime.toString(),
          );
          saveWatchProgress({
            slug: movieSlug,
            name: movieName,
            thumb_url: thumbUrl,
            poster_url: posterUrl,
            episodeName: episode.name,
            episodeIndex: currentEpisodeIndex,
            currentTime: player.currentTime,
            duration: player.duration,
            updatedAt: Date.now(),
          });
        });
        player.on('waiting', () => setIsLoading(true));
        player.on('playing', () => setIsLoading(false));
      });

      hls.on(Hls.Events.ERROR, (_event, data) => {
        const errorData = data as HlsErrorData;
        if (errorData.fatal) {
          switch (errorData.type) {
            case Hls.ErrorTypes.NETWORK_ERROR:
              setError('Lỗi kết nối mạng, đang thử lại...');
              hls.startLoad();
              break;
            case Hls.ErrorTypes.MEDIA_ERROR:
              setError('Lỗi định dạng phim, đang khôi phục...');
              hls.recoverMediaError();
              break;
            default:
              setIsLoading(false);
              setError('Không thể phát video lúc này. Vui lòng thử lại sau.');
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Dành cho Safari, iOS hỗ trợ HLS native
      video.src = videoSrc;
      playerRef.current = new Plyr(video, defaultOptions);

      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (timeToStart > 0) {
          video.currentTime = timeToStart;
        }
        video.play().catch(() => {});
      });

      video.addEventListener('error', () => {
        setIsLoading(false);
        setError('Đã xảy ra lỗi khi tải luồng video native.');
      });

      video.addEventListener('timeupdate', () => {
        if (video.currentTime > 5) {
          localStorage.setItem(
            `watch-progress-${movieSlug}-${currentEpisodeIndex}`,
            video.currentTime.toString(),
          );
          saveWatchProgress({
            slug: movieSlug,
            name: movieName,
            thumb_url: thumbUrl,
            poster_url: posterUrl,
            episodeName: episode.name,
            episodeIndex: currentEpisodeIndex,
            currentTime: video.currentTime,
            duration: video.duration,
            updatedAt: Date.now(),
          });
        }
      });
    }
  }, [serverData, currentEpisodeIndex, movieSlug, movieName, thumbUrl, posterUrl]);

  useEffect(() => {
    initPlayer();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (playerRef.current) {
        playerRef.current.destroy();
        playerRef.current = null;
      }
    };
  }, [initPlayer]);

  const handleRestart = () => {
    clearEpisodeProgress(movieSlug, currentEpisodeIndex);
    localStorage.removeItem(`watch-progress-${movieSlug}-${currentEpisodeIndex}`);
    if (playerRef.current) {
      playerRef.current.currentTime = 0;
      void playerRef.current.play();
    } else if (videoRef.current) {
      videoRef.current.currentTime = 0;
      void videoRef.current.play();
    }
  };

  if (!serverData || serverData.length === 0) {
    return (
      <div className="flex h-[30vh] w-full items-center justify-center bg-black text-gray-500 md:h-screen">
        Không có dữ liệu video để phát.
      </div>
    );
  }

  const episode = serverData[currentEpisodeIndex];

  return (
    <div
      ref={containerRef}
      className="group relative mx-auto flex w-full flex-col bg-black shadow-2xl"
    >
      {/* Loading Overlay */}
      {isLoading && !error && (
        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col items-center justify-center bg-black/50">
          <Loader2 className="h-10 w-10 animate-spin text-white" />
          <p className="mt-3 text-sm font-medium text-white shadow-black drop-shadow-md">
            Đang tải phim...
          </p>
        </div>
      )}

      {/* Error Overlay */}
      {error && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/95 p-4 text-center">
          <AlertCircle className="mb-4 h-12 w-12 text-red-500" />
          <p className="mb-2 text-lg font-bold text-white">Lỗi phát video</p>
          <p className="text-sm text-gray-400">{error}</p>
          <button
            onClick={initPlayer}
            className="mt-6 rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-700"
          >
            Thử tải lại
          </button>
        </div>
      )}

      <button
        type="button"
        onClick={handleRestart}
        className="absolute top-3 right-3 z-20 flex items-center gap-2 rounded-full bg-black/65 px-3 py-2 text-xs font-semibold text-white opacity-80 backdrop-blur transition-opacity hover:opacity-100"
      >
        <RotateCcw className="h-4 w-4" />
        Bắt đầu lại
      </button>

      <div className="relative aspect-video w-full bg-black">
        <video
          ref={videoRef}
          playsInline
          crossOrigin="anonymous"
          className="h-full w-full outline-hidden"
          title={`Đang phát - ${episode.name}`}
        />
      </div>
    </div>
  );
}

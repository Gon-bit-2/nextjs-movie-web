'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore missing types
import Plyr from 'plyr';
import 'plyr/dist/plyr.css';
import { Loader2, AlertCircle } from 'lucide-react';

interface VideoPlayerProps {
  serverData: {
    link_m3u8: string;
    link_embed: string;
    name: string;
  }[];
  currentEpisodeIndex: number;
}

export default function VideoPlayer({ serverData, currentEpisodeIndex }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const playerRef = useRef<any>(null); // eslint-disable-line @typescript-eslint/no-explicit-any

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const initPlayer = useCallback(() => {
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

    const savedProgress = localStorage.getItem(`watch-progress-${videoSrc}`);
    const timeToStart = savedProgress && !isNaN(Number(savedProgress)) ? Number(savedProgress) : 0;

    const defaultOptions = {
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

    if (Hls.isSupported()) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
      });
      hlsRef.current = hls;

      hls.loadSource(videoSrc);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
        setIsLoading(false);

        // Lọc ra các chất lượng video có sẵn từ HLS playlist
        const availableQualities = data.levels.map((l) => l.height).filter((h) => h && h > 0);

        let plyrOptions = { ...defaultOptions };

        if (availableQualities.length > 0) {
          // Bọc lại các tùy chọn chất lượng cho Plyr, thêm '0' (Tự động)
          availableQualities.unshift(0);

          plyrOptions = {
            ...defaultOptions,
            // @ts-expect-error dynamic quality override
            quality: {
              default:
                availableQualities.length > 1 ? availableQualities[1] : availableQualities[0],
              options: availableQualities,
              forced: true,
              onChange: (e: number) => {
                if (e === 0) {
                  hls.currentLevel = -1; // -1 cho Auto
                } else {
                  hls.levels.forEach((level, levelIndex) => {
                    if (level.height === e) {
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
            // @ts-expect-error override
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
        playerRef.current = new Plyr(videoRef.current as HTMLVideoElement, plyrOptions);

        if (timeToStart > 0) {
          playerRef.current.once('canplay', () => {
            playerRef.current.currentTime = timeToStart;
          });
        }

        playerRef.current.play().catch(() => {
          console.warn('Auto-play bị chặn bởi trình duyệt, người dùng cần thao tác tay.');
        });

        // Theo dõi tiến trình với Plyr thay vì video node native để ổn định hơn
        playerRef.current.on('timeupdate', () => {
          if (playerRef.current && playerRef.current.currentTime > 5) {
            localStorage.setItem(
              `watch-progress-${videoSrc}`,
              playerRef.current.currentTime.toString(),
            );
          }
        });
        playerRef.current.on('waiting', () => setIsLoading(true));
        playerRef.current.on('playing', () => setIsLoading(false));
      });

      hls.on(Hls.Events.ERROR, (event, data) => {
        if (data.fatal) {
          switch (data.type) {
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
          localStorage.setItem(`watch-progress-${videoSrc}`, video.currentTime.toString());
        }
      });
    }
  }, [serverData, currentEpisodeIndex]);

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

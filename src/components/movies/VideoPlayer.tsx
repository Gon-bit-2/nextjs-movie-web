'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Hls from 'hls.js';
import { Loader2, AlertCircle, Settings } from 'lucide-react';

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

  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const [levels, setLevels] = useState<{ height: number; [key: string]: unknown }[]>([]);
  const [selectedQuality, setSelectedQuality] = useState<number>(-1);

  const initPlayer = useCallback(() => {
    if (!serverData || serverData.length === 0) return;

    const episode = serverData[currentEpisodeIndex];
    const video = videoRef.current;
    if (!video) return;

    // Sử dụng setTimeout để tránh dính warning setState synchronous trong effect
    setTimeout(() => {
      setIsLoading(true);
      setError(null);
    }, 0);

    // Dọn dẹp HLS cũ trước khi khởi tạo mới
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }

    const videoSrc = episode.link_m3u8;

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

        // Cập nhật danh sách chất lượng video
        setLevels(data.levels);
        setSelectedQuality(hls.currentLevel);

        // Tự động khôi phục vị trí lưu nếu có
        const savedTime = localStorage.getItem(`watch-progress-${videoSrc}`);
        if (savedTime && !isNaN(Number(savedTime))) {
          video.currentTime = Number(savedTime);
        }

        // Cố gắng phát video
        video.play().catch(() => {
          console.warn('Auto-play bị chặn bởi trình duyệt, người dùng cần thao tác tay.');
        });
      });

      hls.on(Hls.Events.LEVEL_SWITCHED, (event, data) => {
        setSelectedQuality(data.level);
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
              setError(
                'Không thể phát video lúc này. Vui lòng thử lại sau hoặc chuyển server khác.',
              );
              hls.destroy();
              break;
          }
        }
      });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      // Dành cho Safari, iOS hỗ trợ HLS native
      video.src = videoSrc;
      video.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        const savedTime = localStorage.getItem(`watch-progress-${videoSrc}`);
        if (savedTime && !isNaN(Number(savedTime))) {
          video.currentTime = Number(savedTime);
        }
        video.play().catch(() => {});
      });

      video.addEventListener('error', () => {
        setIsLoading(false);
        setError('Đã xảy ra lỗi khi tải luồng video native.');
      });
    }
  }, [serverData, currentEpisodeIndex]);

  const handleQualityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const level = parseInt(e.target.value, 10);
    setSelectedQuality(level);
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
    }
  };

  // Khởi tạo player HLS
  useEffect(() => {
    initPlayer();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [initPlayer]);

  // Xử lý lưu tiến trình xem phim
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !serverData || serverData.length === 0) return;

    const episode = serverData[currentEpisodeIndex];
    const videoSrc = episode.link_m3u8;

    const handleTimeUpdate = () => {
      // Cứ mỗi khi thời gian vượt qua 5s thì mới tính là có xem
      if (video.currentTime > 5) {
        localStorage.setItem(`watch-progress-${videoSrc}`, video.currentTime.toString());
      }
    };

    const handleWaiting = () => setIsLoading(true);
    const handlePlaying = () => setIsLoading(false);

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('waiting', handleWaiting);
    video.addEventListener('playing', handlePlaying);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('waiting', handleWaiting);
      video.removeEventListener('playing', handlePlaying);
    };
  }, [serverData, currentEpisodeIndex]);

  // Phím tắt (Keyboard shortcuts)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bỏ qua nếu người dùng đang gõ ở ô input
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      )
        return;

      const video = videoRef.current;
      if (!video) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          if (video.paused) video.play();
          else video.pause();
          break;
        case 'f':
          e.preventDefault();
          if (document.fullscreenElement) {
            document.exitFullscreen();
          } else {
            containerRef.current?.requestFullscreen();
          }
          break;
        case 'arrowright':
          e.preventDefault();
          video.currentTime += 10;
          break;
        case 'arrowleft':
          e.preventDefault();
          video.currentTime -= 10;
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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
      className="group relative flex h-[35vh] w-full flex-col items-center justify-center overflow-hidden bg-black shadow-2xl md:h-[60vh] lg:h-[80vh]"
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

      {/* Quality Selector */}
      {levels.length > 1 && (
        <div className="absolute top-4 right-4 z-20 flex items-center space-x-2 rounded-md bg-black/60 px-3 py-1.5 backdrop-blur-md">
          <Settings className="h-4 w-4 text-white" />
          <div className="relative flex items-center">
            <select
              className="cursor-pointer appearance-none bg-transparent pr-4 text-sm font-medium text-white shadow-xs outline-none focus:outline-none"
              value={selectedQuality}
              onChange={handleQualityChange}
              aria-label="Chọn chất lượng video"
            >
              <option value={-1} className="bg-black text-white">
                Tự động
              </option>
              {levels.map((level, index) => (
                <option key={index} value={index} className="bg-black text-white">
                  {level.height}p
                </option>
              ))}
            </select>
            <div className="pointer-events-none absolute right-0 flex items-center text-white">
              <svg className="h-3 w-3 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
        </div>
      )}

      {/* Main Video Element */}
      <video
        ref={videoRef}
        controls
        playsInline
        className="h-full w-full bg-black outline-hidden"
        title={`Đang phát - ${episode.name}`}
      />
    </div>
  );
}

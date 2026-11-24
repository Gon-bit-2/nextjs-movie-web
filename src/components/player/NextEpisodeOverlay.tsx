'use client';

import { useEffect, useState } from 'react';
import { FastForward, X } from 'lucide-react';

interface NextEpisodeOverlayProps {
  nextEpisodeName: string;
  initialSeconds?: number;
  onPlayNext: () => void;
  onCancel: () => void;
}

/**
 * Lớp phủ đếm ngược tự động chuyển sang tập tiếp theo ở cuối mỗi tập phim
 */
export default function NextEpisodeOverlay({
  nextEpisodeName,
  initialSeconds = 8,
  onPlayNext,
  onCancel,
}: NextEpisodeOverlayProps) {
  const [secondsLeft, setSecondsLeft] = useState(initialSeconds);

  useEffect(() => {
    const timer = window.setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          window.clearInterval(timer);
          onPlayNext();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [onPlayNext]);

  return (
    <div className="absolute right-4 bottom-16 z-30 w-[280px] max-w-[calc(100%-2rem)] rounded-xl border border-white/15 bg-[#0A0A0D]/90 p-4 text-[#F2F2F5] shadow-2xl backdrop-blur-lg">
      <div className="mb-1 flex items-center justify-between">
        <span className="text-[11px] font-semibold tracking-wider text-[#9A9AA8] uppercase">
          Tập tiếp theo sau {secondsLeft}s
        </span>
        <button
          type="button"
          onClick={onCancel}
          aria-label="Hủy tự chuyển tập"
          className="rounded p-1 text-[#9A9AA8] transition hover:bg-white/10 hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <p className="mb-3 truncate text-sm font-bold text-white">{nextEpisodeName}</p>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onPlayNext}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-[#E50914] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#f40612]"
        >
          <FastForward className="h-3.5 w-3.5" />
          Xem ngay
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/15 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/20"
        >
          Hủy
        </button>
      </div>
    </div>
  );
}

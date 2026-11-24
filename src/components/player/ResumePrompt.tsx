'use client';

import { useEffect, useState } from 'react';
import { Play, RotateCcw, X } from 'lucide-react';
import { formatDurationTime } from './useVidstackHls';

interface ResumePromptProps {
  savedSeconds: number;
  onResume: () => void;
  onRestart: () => void;
  onDismiss: () => void;
}

/**
 * Thông báo nổi trên trình phát hỏi người dùng tiếp tục từ mốc cũ hay xem lại từ đầu
 */
export default function ResumePrompt({
  savedSeconds,
  onResume,
  onRestart,
  onDismiss,
}: ResumePromptProps) {
  const [countdown, setCountdown] = useState(5);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          window.clearInterval(interval);
          onResume();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [onResume]);

  return (
    <div
      role="status"
      className="animate-in fade-in slide-in-from-top-2 absolute top-3 right-3 z-30 flex max-w-[calc(100%-1.5rem)] flex-wrap items-center gap-2 rounded-lg border border-white/15 bg-[#0A0A0D]/85 px-3 py-2 text-xs text-[#F2F2F5] shadow-2xl backdrop-blur-md"
    >
      <span className="text-[#9A9AA8]">
        Đã xem đến <strong className="text-white">{formatDurationTime(savedSeconds)}</strong>
      </span>
      <button
        type="button"
        onClick={onResume}
        className="inline-flex items-center gap-1 rounded bg-[#E50914] px-2.5 py-1 font-semibold text-white transition hover:bg-[#f40612]"
      >
        <Play className="h-3 w-3 fill-white" />
        Tiếp tục ({countdown}s)
      </button>
      <button
        type="button"
        onClick={onRestart}
        className="inline-flex items-center gap-1 rounded bg-white/10 px-2.5 py-1 font-medium text-white transition hover:bg-white/20"
      >
        <RotateCcw className="h-3 w-3" />
        Từ đầu
      </button>
      <button
        type="button"
        onClick={onDismiss}
        aria-label="Đóng thông báo tiếp tục xem"
        className="rounded p-1 text-[#9A9AA8] transition hover:bg-white/10 hover:text-white"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

'use client';

import { FastForward } from 'lucide-react';

interface SkipIntroButtonProps {
  onSkip: () => void;
}

/**
 * Nút nổi Bỏ qua phần giới thiệu (+85 giây) hiển thị trong 3 phút đầu đối với phim dài trên 10 phút
 */
export default function SkipIntroButton({ onSkip }: SkipIntroButtonProps) {
  return (
    <button
      type="button"
      onClick={onSkip}
      className="animate-in fade-in slide-in-from-bottom-2 absolute right-4 bottom-16 z-30 inline-flex items-center gap-2 rounded-lg border border-white/25 bg-[#0A0A0D]/85 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md transition hover:border-[#E50914] hover:bg-[#E50914] sm:text-sm"
    >
      <span>Bỏ qua intro</span>
      <span className="rounded bg-white/15 px-1.5 py-0.5 text-[11px]">+85s</span>
      <FastForward className="h-3.5 w-3.5" />
    </button>
  );
}

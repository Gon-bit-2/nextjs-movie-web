'use client';

import Link from 'next/link';
import { Play } from 'lucide-react';
import { usePersonalization } from '@/hooks/usePersonalization';
import { formatDurationTime } from '@/components/player/useVidstackHls';

interface SmartWatchButtonProps {
  slug: string;
  firstEpisodeName?: string;
}

/**
 * Nút Xem phim thông minh: tự động hiển thị "Tiếp tục Tập X (mm:ss)" nếu người dùng đã xem dở phim này
 */
export default function SmartWatchButton({ slug, firstEpisodeName }: SmartWatchButtonProps) {
  const { watchProgress } = usePersonalization();
  const saved = watchProgress.find((item) => item.slug === slug);

  const href = saved
    ? `/xem-phim/${slug}?tap=${saved.episodeIndex + 1}${
        saved.serverIndex !== undefined ? `&server=${saved.serverIndex + 1}` : ''
      }`
    : `/xem-phim/${slug}`;

  const label = saved
    ? `Tiếp tục ${saved.episodeName || `Tập ${saved.episodeIndex + 1}`}${
        saved.currentTime > 10 && !saved.completed
          ? ` (${formatDurationTime(saved.currentTime)})`
          : ''
      }`
    : firstEpisodeName
      ? `Xem ngay · ${firstEpisodeName}`
      : 'Xem phim ngay';

  return (
    <Link
      href={href}
      className="font-display inline-flex items-center justify-center gap-2.5 rounded-lg bg-[#E50914] px-6 py-3 text-base font-semibold tracking-wider text-white uppercase shadow-[0_8px_28px_rgba(229,9,20,0.45)] transition hover:bg-[#f40612] hover:shadow-[0_10px_34px_rgba(229,9,20,0.6)]"
    >
      <Play className="h-5 w-5 fill-white" />
      <span>{label}</span>
    </Link>
  );
}

'use client';

import { useState } from 'react';
import { Play } from 'lucide-react';

interface LiteYouTubeProps {
  youtubeUrl?: string;
  title: string;
}

/**
 * Tách mã video YouTube từ nhiều định dạng URL (watch, youtu.be, shorts, embed)
 */
export function extractYoutubeId(url: string | undefined): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    if (parsed.hostname.includes('youtu.be')) {
      return parsed.pathname.split('/').filter(Boolean)[0] || null;
    }
    if (parsed.pathname.startsWith('/shorts/') || parsed.pathname.startsWith('/embed/')) {
      return parsed.pathname.split('/').filter(Boolean)[1] || null;
    }
    return parsed.searchParams.get('v');
  } catch {
    return null;
  }
}

/**
 * Trình phát Trailer YouTube siêu nhẹ (Lite Embed): chỉ tải iframe khi người dùng chủ động nhấn xem
 */
export default function LiteYouTube({ youtubeUrl, title }: LiteYouTubeProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const videoId = extractYoutubeId(youtubeUrl);

  if (!videoId) return null;

  const thumbnailUrl = `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`;

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-[10px] border border-white/10 bg-black">
      {isLoaded ? (
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={`Trailer ${title}`}
          className="h-full w-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      ) : (
        <button
          type="button"
          onClick={() => setIsLoaded(true)}
          aria-label={`Phát trailer ${title}`}
          className="group relative flex h-full w-full items-center justify-center overflow-hidden bg-black text-left"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={thumbnailUrl}
            alt={`Trailer ${title}`}
            loading="lazy"
            className="h-full w-full object-cover opacity-80 transition duration-500 group-hover:scale-105 group-hover:opacity-95"
          />
          <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/20 to-transparent" />
          <div className="relative z-10 flex flex-col items-center gap-3">
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-[#E50914] text-white shadow-[0_8px_32px_rgba(229,9,20,0.6)] transition group-hover:scale-110">
              <Play className="ml-1 h-7 w-7 fill-white" />
            </span>
            <span className="rounded-full border border-white/15 bg-black/70 px-4 py-1.5 text-xs font-semibold text-white backdrop-blur-md">
              Xem Trailer chính thức
            </span>
          </div>
        </button>
      )}
    </div>
  );
}

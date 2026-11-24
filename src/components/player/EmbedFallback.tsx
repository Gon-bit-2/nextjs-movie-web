'use client';

import { RefreshCw, Server } from 'lucide-react';
import { PLAYER_EMBED_BASE } from '@/lib/services/movie';

interface EmbedFallbackProps {
  embedUrl?: string;
  m3u8Url?: string;
  title: string;
  hasMultipleServers: boolean;
  onRetryNative: () => void;
  onSuggestServer: () => void;
}

/**
 * Trình phát nhúng dự phòng (player.phimapi.com) dùng khi luồng HLS trực tiếp bị lỗi mạng hoặc CORS
 */
export default function EmbedFallback({
  embedUrl,
  m3u8Url,
  title,
  hasMultipleServers,
  onRetryNative,
  onSuggestServer,
}: EmbedFallbackProps) {
  const resolvedSrc =
    embedUrl || (m3u8Url ? `${PLAYER_EMBED_BASE}${encodeURIComponent(m3u8Url)}` : '');

  if (!resolvedSrc) {
    return (
      <div className="flex aspect-video w-full flex-col items-center justify-center rounded-[10px] border border-white/10 bg-[#0A0A0D] p-6 text-center">
        <p className="text-base font-semibold text-white">Không tìm thấy nguồn phát dự phòng.</p>
        <div className="mt-4 flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={onRetryNative}
            className="inline-flex items-center gap-2 rounded-lg bg-[#E50914] px-4 py-2 text-sm font-semibold text-white transition hover:bg-[#f40612]"
          >
            <RefreshCw className="h-4 w-4" />
            Thử lại trình phát chính
          </button>
          {hasMultipleServers && (
            <button
              type="button"
              onClick={onSuggestServer}
              className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-white/10 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/20"
            >
              <Server className="h-4 w-4" />
              Chuyển server khác
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[10px] border border-white/10 bg-black">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 bg-[#14141A] px-3 py-2 text-xs text-[#9A9AA8]">
        <span>Đang dùng trình phát dự phòng (Embed)</span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onRetryNative}
            className="inline-flex items-center gap-1.5 rounded bg-white/10 px-2.5 py-1 font-medium text-white transition hover:bg-white/20"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Quay lại Vidstack
          </button>
          {hasMultipleServers && (
            <button
              type="button"
              onClick={onSuggestServer}
              className="inline-flex items-center gap-1.5 rounded bg-[#E50914]/20 px-2.5 py-1 font-medium text-[#ffb4aa] transition hover:bg-[#E50914]/35"
            >
              <Server className="h-3.5 w-3.5" />
              Đổi server
            </button>
          )}
        </div>
      </div>
      <div className="relative aspect-video w-full bg-black">
        <iframe
          src={resolvedSrc}
          title={title}
          className="h-full w-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          referrerPolicy="no-referrer"
        />
      </div>
    </div>
  );
}

'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Check, Play, Search, Sparkles } from 'lucide-react';
import type { Episode, MovieProgress } from '@/types';
import { usePersonalization } from '@/hooks/usePersonalization';

interface EpisodePanelProps {
  servers: Episode[];
  movieSlug: string;
  activeServerIndex: number;
  activeEpisodeIndex: number;
  /** Chế độ 'sidebar' dùng trên trang xem phim, 'grid' dùng trên trang chi tiết */
  layout?: 'sidebar' | 'grid';
  /** Khi truyền callback, chuyển tập/server trực tiếp trên client không tải lại trang */
  onSelectEpisode?: (episodeIndex: number) => void;
  onSelectServer?: (serverIndex: number) => void;
}

const EPISODES_PER_CHUNK = 50;

/**
 * Bảng chọn server và danh sách tập phim có phân đoạn, lọc nhanh và đánh dấu tập đã xem
 */
export default function EpisodePanel({
  servers,
  movieSlug,
  activeServerIndex,
  activeEpisodeIndex,
  layout = 'sidebar',
  onSelectEpisode,
  onSelectServer,
}: EpisodePanelProps) {
  const safeServerIndex =
    activeServerIndex >= 0 && activeServerIndex < servers.length ? activeServerIndex : 0;
  const currentServer = servers[safeServerIndex];
  const episodes = useMemo(() => currentServer?.server_data || [], [currentServer]);

  const totalChunks = Math.ceil(episodes.length / EPISODES_PER_CHUNK);
  const chunkSyncKey = `${safeServerIndex}:${activeEpisodeIndex}`;
  const defaultChunk = Math.floor(Math.max(0, activeEpisodeIndex) / EPISODES_PER_CHUNK);
  const [manualChunk, setManualChunk] = useState<{ key: string; chunk: number } | null>(null);
  const activeChunk = manualChunk?.key === chunkSyncKey ? manualChunk.chunk : defaultChunk;

  const [filterText, setFilterText] = useState('');
  const { watchProgress } = usePersonalization();
  const activeItemRef = useRef<HTMLButtonElement | HTMLAnchorElement | null>(null);

  // Tính bản đồ tập đã xem từ store cá nhân hóa (tự đồng bộ khi tiến độ cập nhật)
  const watchedMap = useMemo(() => {
    const map: Record<number, MovieProgress> = {};
    for (const item of watchProgress) {
      if (item.slug === movieSlug) {
        map[item.episodeIndex] = item;
      }
    }
    return map;
  }, [movieSlug, watchProgress]);

  // Tự cuộn tập đang phát vào tầm nhìn trong thanh bên
  useEffect(() => {
    if (layout === 'sidebar' && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeEpisodeIndex, layout]);

  const displayedEpisodes = useMemo(() => {
    const cleanQuery = filterText.trim().toLowerCase();
    if (cleanQuery) {
      return episodes
        .map((ep, index) => ({ ep, index }))
        .filter(
          ({ ep, index }) =>
            ep.name.toLowerCase().includes(cleanQuery) || String(index + 1).includes(cleanQuery),
        );
    }

    const start = activeChunk * EPISODES_PER_CHUNK;
    return episodes
      .slice(start, start + EPISODES_PER_CHUNK)
      .map((ep, offset) => ({ ep, index: start + offset }));
  }, [activeChunk, episodes, filterText]);

  if (servers.length === 0 || episodes.length === 0) {
    return null;
  }

  const gridClass =
    layout === 'sidebar'
      ? 'grid grid-cols-4 gap-2 sm:grid-cols-6 xl:grid-cols-4'
      : 'grid grid-cols-3 gap-2 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-9 xl:grid-cols-10';

  return (
    <div
      className={`flex flex-col rounded-[10px] border border-white/10 bg-[#14141A] ${
        layout === 'sidebar' ? 'h-full xl:max-h-[calc(100vh-140px)]' : 'p-4 md:p-6'
      }`}
    >
      {/* Tiêu đề & số tập */}
      <div
        className={`flex items-center justify-between gap-2 ${
          layout === 'sidebar' ? 'border-b border-white/10 px-4 py-3.5' : 'mb-4'
        }`}
      >
        <h2 className="font-display text-lg font-bold tracking-wide text-[#F2F2F5] uppercase">
          Danh sách tập
        </h2>
        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-xs font-medium text-[#9A9AA8]">
          {episodes.length} tập
        </span>
      </div>

      <div className={layout === 'sidebar' ? 'flex flex-1 flex-col overflow-hidden p-4' : ''}>
        {/* Chọn server phát (Vietsub / Thuyết minh / Lồng tiếng / AI) */}
        {servers.length > 1 && (
          <div className="mb-3 flex flex-wrap gap-1.5">
            {servers.map((server, idx) => {
              const isSelected = idx === safeServerIndex;
              const label = server.server_name || `Server ${idx + 1}`;

              if (onSelectServer) {
                return (
                  <button
                    key={`${label}-${idx}`}
                    type="button"
                    onClick={() => onSelectServer(idx)}
                    className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                      isSelected
                        ? 'bg-[#E50914] text-white shadow-[0_4px_14px_rgba(229,9,20,0.35)]'
                        : 'border border-white/10 bg-[#1E1E26] text-[#9A9AA8] hover:border-white/20 hover:text-white'
                    }`}
                  >
                    <span>{label}</span>
                    {server.is_ai && (
                      <span className="inline-flex items-center gap-0.5 rounded bg-black/30 px-1 py-0.5 text-[10px] text-[#F5C518]">
                        <Sparkles className="h-2.5 w-2.5" />
                        AI
                      </span>
                    )}
                  </button>
                );
              }

              return (
                <Link
                  key={`${label}-${idx}`}
                  href={`/xem-phim/${movieSlug}?tap=1&server=${idx + 1}`}
                  className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                    isSelected
                      ? 'bg-[#E50914] text-white'
                      : 'border border-white/10 bg-[#1E1E26] text-[#9A9AA8] hover:border-white/20 hover:text-white'
                  }`}
                >
                  <span>{label}</span>
                  {server.is_ai && (
                    <span className="inline-flex items-center gap-0.5 rounded bg-black/30 px-1 py-0.5 text-[10px] text-[#F5C518]">
                      <Sparkles className="h-2.5 w-2.5" />
                      AI
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        )}

        {/* Thanh phân đoạn & tìm nhanh tập khi phim dài tập */}
        {(totalChunks > 1 || episodes.length > 24) && (
          <div className="mb-3 flex flex-wrap items-center gap-2">
            {totalChunks > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {Array.from({ length: totalChunks }).map((_, idx) => {
                  const startEp = idx * EPISODES_PER_CHUNK + 1;
                  const endEp = Math.min((idx + 1) * EPISODES_PER_CHUNK, episodes.length);
                  const isActive = idx === activeChunk && !filterText.trim();

                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setFilterText('');
                        setManualChunk({ key: chunkSyncKey, chunk: idx });
                      }}
                      className={`rounded-md px-2.5 py-1 text-xs font-medium transition ${
                        isActive
                          ? 'bg-white text-[#0A0A0D]'
                          : 'border border-white/10 bg-[#1E1E26] text-[#9A9AA8] hover:text-white'
                      }`}
                    >
                      {startEp}–{endEp}
                    </button>
                  );
                })}
              </div>
            )}

            {episodes.length > 24 && (
              <div className="relative ml-auto min-w-[130px] flex-1 sm:max-w-[180px]">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-[#9A9AA8]" />
                <input
                  type="text"
                  value={filterText}
                  onChange={(e) => setFilterText(e.target.value)}
                  placeholder="Tìm tập..."
                  aria-label="Tìm nhanh số tập"
                  className="w-full rounded-md border border-white/10 bg-[#0A0A0D] py-1.5 pr-2.5 pl-8 text-xs text-white placeholder-[#9A9AA8] transition focus:border-[#E50914] focus:outline-none"
                />
              </div>
            )}
          </div>
        )}

        {/* Lưới danh sách tập */}
        <div
          className={
            layout === 'sidebar'
              ? 'flex-1 overflow-y-auto pr-1'
              : ''
          }
        >
          {displayedEpisodes.length === 0 ? (
            <p className="py-6 text-center text-xs text-[#9A9AA8]">
              Không tìm thấy tập phù hợp với &ldquo;{filterText}&rdquo;.
            </p>
          ) : (
            <div className={gridClass}>
              {displayedEpisodes.map(({ ep, index }) => {
                const isActive = index === activeEpisodeIndex && layout === 'sidebar';
                const progress = watchedMap[index];
                const isWatched = Boolean(progress?.completed);
                const progressPct =
                  progress && progress.duration && progress.duration > 0
                    ? Math.min(100, Math.round((progress.currentTime / progress.duration) * 100))
                    : 0;

                const tileClass = `group relative flex items-center justify-center gap-1 overflow-hidden rounded-lg px-2 py-2.5 text-xs font-semibold transition ${
                  isActive
                    ? 'bg-[#E50914] text-white shadow-[0_4px_16px_rgba(229,9,20,0.4)]'
                    : isWatched
                      ? 'border border-white/5 bg-[#191922] text-[#9A9AA8] hover:border-white/20 hover:bg-[#1E1E26] hover:text-white'
                      : 'border border-white/10 bg-[#1E1E26] text-[#F2F2F5] hover:border-white/25 hover:bg-[#272733]'
                }`;

                const innerContent = (
                  <>
                    {isActive && <Play className="h-3 w-3 shrink-0 fill-white" />}
                    {!isActive && isWatched && (
                      <Check className="h-3 w-3 shrink-0 text-emerald-400" />
                    )}
                    <span className="truncate">{ep.name}</span>
                    {progressPct > 3 && !isWatched && (
                      <span
                        className="absolute right-0 bottom-0 left-0 h-0.5 bg-white/15"
                        aria-hidden="true"
                      >
                        <span
                          className="block h-full bg-[#E50914]"
                          style={{ width: `${progressPct}%` }}
                        />
                      </span>
                    )}
                  </>
                );

                if (onSelectEpisode) {
                  return (
                    <button
                      key={`${ep.slug}-${index}`}
                      ref={isActive ? (el) => { activeItemRef.current = el; } : undefined}
                      type="button"
                      onClick={() => onSelectEpisode(index)}
                      aria-current={isActive ? 'true' : undefined}
                      className={tileClass}
                    >
                      {innerContent}
                    </button>
                  );
                }

                return (
                  <Link
                    key={`${ep.slug}-${index}`}
                    href={`/xem-phim/${movieSlug}?tap=${index + 1}&server=${safeServerIndex + 1}`}
                    className={tileClass}
                  >
                    {innerContent}
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

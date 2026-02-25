'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface Episode {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

interface EpisodeListProps {
  serverList: Episode[];
  slug: string;
  safeEpIndex: number;
}

export default function EpisodeList({ serverList, slug, safeEpIndex }: EpisodeListProps) {
  const EPISODES_PER_CHUNK = 50;

  // Tính toán số phần
  const totalChunks = Math.ceil(serverList.length / EPISODES_PER_CHUNK);
  const currentChunkIndex = Math.floor(safeEpIndex / EPISODES_PER_CHUNK);

  const [activeChunk, setActiveChunk] = useState(currentChunkIndex);

  // Cập nhật tab active nếu safeEpIndex thay đổi từ bên ngoài (ví dụ user dùng nút prev/next chưa có)
  useEffect(() => {
    setActiveChunk(Math.floor(safeEpIndex / EPISODES_PER_CHUNK));
  }, [safeEpIndex]);

  const handleEpisodeClick = () => {
    // Tự động cuộn lên đầu màn hình
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (serverList.length <= 1) return null;

  // Cắt danh sách tập theo phần đang chọn
  const chunkedEpisodes = serverList.slice(
    activeChunk * EPISODES_PER_CHUNK,
    (activeChunk + 1) * EPISODES_PER_CHUNK,
  );

  return (
    <div>
      <h2 className="mb-6 text-xl font-bold text-[#e5e5e5] md:text-2xl">Danh sách tập</h2>

      {/* Tab chọn phần (chỉ render nếu có > 1 phần) */}
      {totalChunks > 1 && (
        <div className="mb-6 flex flex-wrap gap-2">
          {Array.from({ length: totalChunks }).map((_, index) => {
            const startEp = index * EPISODES_PER_CHUNK + 1;
            const endEp = Math.min((index + 1) * EPISODES_PER_CHUNK, serverList.length);
            const isActive = index === activeChunk;

            return (
              <button
                key={index}
                onClick={() => setActiveChunk(index)}
                className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-red-600 text-white shadow-md'
                    : 'bg-[#333] text-gray-300 hover:bg-[#4dd] hover:text-white'
                }`}
              >
                Tập {startEp} - {endEp}
              </button>
            );
          })}
        </div>
      )}

      {/* Danh sách tập trong phần */}
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10">
        {chunkedEpisodes.map((ep, idx) => {
          // Tính toán lại index thật sự trong mảng gốc
          const actualIndex = activeChunk * EPISODES_PER_CHUNK + idx;
          const isActive = actualIndex === safeEpIndex;

          return (
            <Link
              key={ep.slug}
              href={`/xem-phim/${slug}?tap=${actualIndex + 1}`}
              onClick={handleEpisodeClick}
              scroll={false}
              className={`flex items-center justify-center rounded-md py-3 font-medium transition-all duration-300 md:py-4 ${
                isActive
                  ? 'scale-105 bg-white text-black shadow-lg'
                  : 'bg-[#333333] text-gray-300 hover:bg-[#4a4a4a] hover:text-white'
              }`}
            >
              {ep.name}
            </Link>
          );
        })}
      </div>
    </div>
  );
}

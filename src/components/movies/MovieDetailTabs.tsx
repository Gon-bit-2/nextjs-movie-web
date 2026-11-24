'use client';

import { useState } from 'react';
import Link from 'next/link';
import type {
  Episode,
  MovieDetail,
  MovieImageAsset,
  MovieKeyword,
  Person,
} from '@/types';
import EpisodePanel from '@/components/player/EpisodePanel';
import CastList from './CastList';
import LiteYouTube, { extractYoutubeId } from './LiteYouTube';
import ImageGallery from './ImageGallery';

interface MovieDetailTabsProps {
  movie: MovieDetail;
  servers: Episode[];
  peoples: Person[];
  profileBaseUrl: string;
  images: MovieImageAsset[];
  backdropBaseUrl: string;
  keywords: MovieKeyword[];
}

type TabKey = 'episodes' | 'info' | 'cast' | 'trailer' | 'gallery';

/**
 * Khu vực nội dung dạng thẻ (Tabs) trên trang chi tiết phim giúp bố cục gọn gàng và dễ tra cứu
 */
export default function MovieDetailTabs({
  movie,
  servers,
  peoples,
  profileBaseUrl,
  images,
  backdropBaseUrl,
  keywords,
}: MovieDetailTabsProps) {
  const hasEpisodes = servers.some((s) => s.server_data.length > 0);
  const hasTrailer = Boolean(extractYoutubeId(movie.trailer_url));
  const hasGallery = images.some((i) => i.type === 'backdrop');

  const tabs: { key: TabKey; label: string }[] = [
    ...(hasEpisodes ? [{ key: 'episodes' as const, label: 'Tập phim' }] : []),
    { key: 'info', label: 'Thông tin' },
    { key: 'cast', label: 'Diễn viên' },
    ...(hasTrailer ? [{ key: 'trailer' as const, label: 'Trailer' }] : []),
    ...(hasGallery ? [{ key: 'gallery' as const, label: 'Hình ảnh' }] : []),
  ];

  const [activeTab, setActiveTab] = useState<TabKey>(tabs[0]?.key ?? 'info');
  const [selectedServerIndex, setSelectedServerIndex] = useState(0);

  const cleanContent = movie.content
    ? movie.content.replace(/<[^>]+>/g, '').trim()
    : 'Nội dung phim đang được cập nhật.';

  return (
    <div className="mt-10">
      {/* Thanh chuyển tab */}
      <div
        role="tablist"
        aria-label="Chi tiết bộ phim"
        className="no-scrollbar mb-6 flex gap-6 overflow-x-auto border-b border-white/10"
      >
        {tabs.map((tab) => {
          const isActive = tab.key === activeTab;
          return (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={isActive}
              onClick={() => setActiveTab(tab.key)}
              className={`font-display relative shrink-0 pb-3 text-base font-semibold tracking-wider uppercase transition ${
                isActive ? 'text-white' : 'text-[#9A9AA8] hover:text-white'
              }`}
            >
              {tab.label}
              {isActive && (
                <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-[#E50914]" />
              )}
            </button>
          );
        })}
      </div>

      {/* Nội dung từng tab */}
      {activeTab === 'episodes' && hasEpisodes && (
        <EpisodePanel
          servers={servers}
          movieSlug={movie.slug}
          activeServerIndex={selectedServerIndex}
          activeEpisodeIndex={-1}
          layout="grid"
          onSelectServer={setSelectedServerIndex}
        />
      )}

      {activeTab === 'info' && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div className="rounded-[10px] border border-white/10 bg-[#14141A] p-5 md:p-6">
            <h2 className="font-display mb-3 text-lg font-bold tracking-wide text-white uppercase">
              Nội dung phim
            </h2>
            <p className="leading-relaxed whitespace-pre-line text-[#F2F2F5]/90">
              {cleanContent}
            </p>

            {keywords.length > 0 && (
              <div className="mt-6">
                <h3 className="mb-2.5 text-xs font-semibold tracking-wider text-[#9A9AA8] uppercase">
                  Từ khóa liên quan
                </h3>
                <div className="flex flex-wrap gap-2">
                  {keywords.slice(0, 12).map((kw, idx) => {
                    const text = kw.name_vn || kw.name;
                    return (
                      <Link
                        key={`${text}-${idx}`}
                        href={`/tim-kiem?keyword=${encodeURIComponent(text)}`}
                        className="rounded-full border border-white/10 bg-[#1E1E26] px-3 py-1 text-xs text-[#9A9AA8] transition hover:border-white/25 hover:text-white"
                      >
                        #{text}
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          <div className="rounded-[10px] border border-white/10 bg-[#14141A] p-5 md:p-6">
            <h2 className="font-display mb-4 text-lg font-bold tracking-wide text-white uppercase">
              Thông số phát hành
            </h2>
            <dl className="space-y-3 text-sm">
              <div className="flex justify-between gap-4 border-b border-white/5 pb-2.5">
                <dt className="text-[#9A9AA8]">Đạo diễn</dt>
                <dd className="text-right font-medium text-white">
                  {movie.director?.filter(Boolean).join(', ') || 'Đang cập nhật'}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/5 pb-2.5">
                <dt className="text-[#9A9AA8]">Thời lượng</dt>
                <dd className="text-right font-medium text-white">{movie.time || 'Đang cập nhật'}</dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/5 pb-2.5">
                <dt className="text-[#9A9AA8]">Trạng thái</dt>
                <dd className="text-right font-medium text-white">
                  {movie.episode_current || 'Đang cập nhật'}
                </dd>
              </div>
              <div className="flex justify-between gap-4 border-b border-white/5 pb-2.5">
                <dt className="text-[#9A9AA8]">Ngôn ngữ</dt>
                <dd className="text-right font-medium text-white">{movie.lang || 'Vietsub'}</dd>
              </div>
              {typeof movie.view === 'number' && movie.view > 0 && (
                <div className="flex justify-between gap-4">
                  <dt className="text-[#9A9AA8]">Lượt xem</dt>
                  <dd className="text-right font-medium text-white">
                    {movie.view.toLocaleString('vi-VN')}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      )}

      {activeTab === 'cast' && (
        <div className="rounded-[10px] border border-white/10 bg-[#14141A] p-5 md:p-6">
          <h2 className="font-display mb-4 text-lg font-bold tracking-wide text-white uppercase">
            Diễn viên &amp; Nhân sự
          </h2>
          <CastList
            peoples={peoples}
            profileBaseUrl={profileBaseUrl}
            fallbackActors={movie.actor}
          />
        </div>
      )}

      {activeTab === 'trailer' && hasTrailer && (
        <div className="max-w-4xl">
          <LiteYouTube youtubeUrl={movie.trailer_url} title={movie.name} />
        </div>
      )}

      {activeTab === 'gallery' && hasGallery && (
        <ImageGallery
          images={images}
          backdropBaseUrl={backdropBaseUrl}
          movieName={movie.name}
        />
      )}
    </div>
  );
}

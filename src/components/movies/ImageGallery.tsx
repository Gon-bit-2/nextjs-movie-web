'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import type { MovieImageAsset } from '@/types';
import { getTmdbImageUrl } from '@/lib/services/movie';
import ImageWithFallback from '@/components/common/ImageWithFallback';

interface ImageGalleryProps {
  images: MovieImageAsset[];
  backdropBaseUrl: string;
  movieName: string;
}

/**
 * Thư viện ảnh cảnh phim độ phân giải cao từ API /images có hộp xem phóng to
 */
export default function ImageGallery({
  images,
  backdropBaseUrl,
  movieName,
}: ImageGalleryProps) {
  const [previewSrc, setPreviewSrc] = useState<string | null>(null);
  const backdrops = images.filter((img) => img.type === 'backdrop').slice(0, 12);

  if (backdrops.length === 0) {
    return <p className="text-sm text-[#9A9AA8]">Chưa có thư viện hình ảnh bổ sung cho phim này.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {backdrops.map((img, idx) => {
          const url = getTmdbImageUrl(img.file_path, backdropBaseUrl);
          return (
            <button
              key={`${img.file_path}-${idx}`}
              type="button"
              onClick={() => setPreviewSrc(url)}
              className="group relative aspect-video overflow-hidden rounded-[10px] border border-white/10 bg-[#14141A]"
            >
              <ImageWithFallback
                src={url}
                alt={`${movieName} - Cảnh phim ${idx + 1}`}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover transition duration-500 group-hover:scale-105"
              />
            </button>
          );
        })}
      </div>

      {previewSrc && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xem ảnh phóng to"
          onClick={() => setPreviewSrc(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4 backdrop-blur-sm"
        >
          <button
            type="button"
            onClick={() => setPreviewSrc(null)}
            aria-label="Đóng ảnh"
            className="absolute top-4 right-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </button>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewSrc}
            alt={movieName}
            onClick={(e) => e.stopPropagation()}
            className="max-h-[88vh] max-w-[94vw] rounded-lg border border-white/15 object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  );
}

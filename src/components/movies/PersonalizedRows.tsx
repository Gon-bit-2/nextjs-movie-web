'use client';

import Link from 'next/link';
import { Play, X } from 'lucide-react';
import MovieCard from '@/components/common/MovieCard';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import { getImageUrl } from '@/lib/services/movie';
import { usePersonalization } from '@/hooks/usePersonalization';
import type { Movie, MovieProgress, SavedMovie } from '@/types';

function savedToMovie(movie: SavedMovie): Movie {
  return {
    _id: movie._id,
    name: movie.name,
    slug: movie.slug,
    origin_name: movie.origin_name ?? '',
    thumb_url: movie.thumb_url ?? '',
    poster_url: movie.poster_url ?? '',
    year: movie.year ?? new Date().getFullYear(),
    quality: movie.quality,
  };
}

function getProgressPercent(progress: MovieProgress): number {
  if (!progress.duration || progress.duration <= 0) return 0;
  return Math.min(100, Math.max(0, (progress.currentTime / progress.duration) * 100));
}

export default function PersonalizedRows() {
  const { myList, watchProgress, removeProgress } = usePersonalization();

  if (myList.length === 0 && watchProgress.length === 0) return null;

  return (
    <div className="flex flex-col gap-8">
      {watchProgress.length > 0 && (
        <section className="px-4 md:px-[4%]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white md:text-2xl">Tiếp tục xem</h2>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5">
            {watchProgress.slice(0, 5).map((progress) => (
              <article
                key={`${progress.slug}-${progress.episodeIndex}`}
                className="group relative overflow-hidden rounded-lg border border-white/10 bg-zinc-950"
              >
                <Link
                  href={`/xem-phim/${progress.slug}?tap=${progress.episodeIndex + 1}`}
                  className="block"
                >
                  <div className="relative aspect-video bg-zinc-900">
                    <ImageWithFallback
                      src={getImageUrl(progress.thumb_url || progress.poster_url)}
                      alt={progress.name}
                      fill
                      sizes="(max-width: 768px) 100vw, 25vw"
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/10 to-transparent" />
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity group-hover:opacity-100">
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white text-black shadow-lg">
                        <Play className="ml-1 h-6 w-6 fill-black" />
                      </span>
                    </div>
                  </div>
                  <div className="h-1 bg-white/15">
                    <div
                      className="bg-red-600 h-full"
                      style={{ width: `${getProgressPercent(progress)}%` }}
                    />
                  </div>
                  <div className="p-3">
                    <h3 className="line-clamp-1 text-sm font-semibold text-white">
                      {progress.name}
                    </h3>
                    <p className="mt-1 line-clamp-1 text-xs text-gray-400">
                      {progress.episodeName || `Tập ${progress.episodeIndex + 1}`}
                    </p>
                  </div>
                </Link>
                <button
                  type="button"
                  onClick={() => removeProgress(progress.slug)}
                  aria-label="Xóa khỏi tiếp tục xem"
                  title="Xóa khỏi tiếp tục xem"
                  className="absolute top-2 right-2 flex h-8 w-8 items-center justify-center rounded-full bg-black/70 text-white opacity-0 transition-opacity group-hover:opacity-100"
                >
                  <X className="h-4 w-4" />
                </button>
              </article>
            ))}
          </div>
        </section>
      )}

      {myList.length > 0 && (
        <section className="px-4 md:px-[4%]">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-bold text-white md:text-2xl">Danh sách của tôi</h2>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {myList.slice(0, 12).map((movie) => (
              <MovieCard key={movie.slug} movie={savedToMovie(movie)} type="poster" />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

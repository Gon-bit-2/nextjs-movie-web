'use client';

import { Check, Plus, ThumbsUp } from 'lucide-react';
import type { Movie } from '@/types';
import { usePersonalization } from '@/hooks/usePersonalization';

interface MovieActionButtonsProps {
  movie: Movie;
  compact?: boolean;
}

export default function MovieActionButtons({ movie, compact = false }: MovieActionButtonsProps) {
  const { isSaved, isLiked, toggleSaved, toggleLike } = usePersonalization();
  const saved = isSaved(movie.slug);
  const liked = isLiked(movie.slug);
  const buttonSize = compact ? 'h-8 w-8' : 'h-10 w-10';
  const iconSize = compact ? 'h-4 w-4' : 'h-5 w-5';

  return (
    <>
      <button
        type="button"
        onClick={() => toggleSaved(movie)}
        aria-label={saved ? 'Xóa khỏi danh sách của tôi' : 'Thêm vào danh sách của tôi'}
        title={saved ? 'Xóa khỏi danh sách' : 'Thêm vào danh sách'}
        className={`${buttonSize} flex items-center justify-center rounded-full border-2 transition-colors ${
          saved
            ? 'border-white bg-white text-black'
            : 'border-gray-400 text-gray-300 hover:border-white hover:text-white'
        }`}
      >
        {saved ? <Check className={iconSize} /> : <Plus className={iconSize} />}
      </button>
      <button
        type="button"
        onClick={() => toggleLike(movie.slug)}
        aria-label={liked ? 'Bỏ thích phim' : 'Thích phim'}
        title={liked ? 'Đã thích' : 'Thích'}
        className={`${buttonSize} flex items-center justify-center rounded-full border-2 transition-colors ${
          liked
            ? 'border-red-500 bg-red-600 text-white'
            : 'border-gray-400 text-gray-300 hover:border-white hover:text-white'
        }`}
      >
        <ThumbsUp className={iconSize} />
      </button>
    </>
  );
}

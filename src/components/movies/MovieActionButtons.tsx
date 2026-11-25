'use client';

import { useState } from 'react';
import { Check, Heart, Plus, Share2 } from 'lucide-react';
import type { Movie } from '@/types';
import { usePersonalization } from '@/hooks/usePersonalization';

interface MovieActionButtonsProps {
  movie: Movie;
  showLabels?: boolean;
  showShare?: boolean;
}

/**
 * Nhóm nút tương tác cho phim: Lưu vào Danh sách của tôi, Yêu thích và Chia sẻ đường dẫn
 */
export default function MovieActionButtons({
  movie,
  showLabels = false,
  showShare = false,
}: MovieActionButtonsProps) {
  const { isSaved, isLiked, toggleSaved, toggleLike } = usePersonalization();
  const [copied, setCopied] = useState(false);

  const saved = isSaved(movie.slug);
  const liked = isLiked(movie.slug);

  /**
   * Chia sẻ hoặc sao chép đường dẫn bộ phim vào clipboard
   */
  const handleShare = async () => {
    const shareUrl = `${window.location.origin}/phim/${movie.slug}`;
    try {
      if (navigator.share) {
        await navigator.share({ title: movie.name, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // Bỏ qua khi người dùng hủy hộp thoại chia sẻ
    }
  };

  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <button
        type="button"
        onClick={() => toggleSaved(movie)}
        aria-label={saved ? 'Xóa khỏi danh sách của tôi' : 'Thêm vào danh sách của tôi'}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition ${
          showLabels ? 'px-4 py-2.5' : 'h-11 w-11'
        } ${
          saved
            ? 'border-white bg-white text-[#0A0A0D]'
            : 'border-white/15 bg-white/10 text-white backdrop-blur-md hover:border-white/30 hover:bg-white/20'
        }`}
      >
        {saved ? <Check className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
        {showLabels && <span>{saved ? 'Đã lưu' : 'Danh sách'}</span>}
      </button>

      <button
        type="button"
        onClick={() => toggleLike(movie)}
        aria-label={liked ? 'Bỏ yêu thích phim' : 'Yêu thích phim'}
        className={`inline-flex items-center justify-center gap-2 rounded-lg border text-sm font-semibold transition ${
          showLabels ? 'px-4 py-2.5' : 'h-11 w-11'
        } ${
          liked
            ? 'border-[#E50914] bg-[#E50914]/20 text-[#ffb4aa]'
            : 'border-white/15 bg-white/10 text-white backdrop-blur-md hover:border-white/30 hover:bg-white/20'
        }`}
      >
        <Heart className={`h-4 w-4 ${liked ? 'fill-[#E50914] text-[#E50914]' : ''}`} />
        {showLabels && <span>{liked ? 'Đã thích' : 'Yêu thích'}</span>}
      </button>

      {showShare && (
        <button
          type="button"
          onClick={handleShare}
          aria-label="Chia sẻ phim"
          className={`inline-flex items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/10 text-sm font-semibold text-white backdrop-blur-md transition hover:border-white/30 hover:bg-white/20 ${
            showLabels ? 'px-4 py-2.5' : 'h-11 w-11'
          }`}
        >
          {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Share2 className="h-4 w-4" />}
          {showLabels && <span>{copied ? 'Đã chép link' : 'Chia sẻ'}</span>}
        </button>
      )}
    </div>
  );
}

'use client';

import { useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  Bookmark,
  CheckCircle2,
  Download,
  Film,
  Heart,
  History,
  Play,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import type { Movie, MovieInteraction, MovieProgress, SavedMovie } from '@/types';
import { getImageUrl } from '@/lib/services/movie';
import { usePersonalization } from '@/hooks/usePersonalization';
import { applyBackup, exportBackup, parseBackup } from '@/lib/storage/backup';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import MovieCard from '@/components/common/MovieCard';

type LibraryTab = 'dang-xem' | 'da-luu' | 'da-thich';

/**
 * Chuyển mục đã lưu sang kiểu Movie để tái sử dụng MovieCard
 */
function savedToMovie(movie: SavedMovie): Movie {
  return {
    _id: movie._id,
    name: movie.name,
    slug: movie.slug,
    origin_name: movie.origin_name ?? '',
    thumb_url: movie.thumb_url ?? '',
    poster_url: movie.poster_url ?? '',
    year: movie.year ?? 0,
    quality: movie.quality,
    lang: movie.lang,
    episode_current: movie.episode_current,
    imdb: movie.imdbScore
      ? { id: '', vote_average: movie.imdbScore, vote_count: 0 }
      : undefined,
  };
}

/**
 * Chuyển mục đã thích có đủ metadata sang kiểu Movie để hiển thị dạng thẻ poster
 */
function likedToMovie(item: MovieInteraction): Movie | null {
  if (!item.name) return null;
  return {
    _id: item._id ?? item.slug,
    name: item.name,
    slug: item.slug,
    origin_name: item.origin_name ?? '',
    thumb_url: item.thumb_url ?? '',
    poster_url: item.poster_url ?? '',
    year: item.year ?? 0,
    quality: item.quality,
    lang: item.lang,
    episode_current: item.episode_current,
    imdb: item.imdbScore ? { id: '', vote_average: item.imdbScore, vote_count: 0 } : undefined,
  };
}

/**
 * Tính phần trăm tiến độ đã xem của một tập phim
 */
function getProgressPercent(progress: MovieProgress): number {
  if (!progress.duration || progress.duration <= 0) return 0;
  return Math.min(100, Math.max(0, (progress.currentTime / progress.duration) * 100));
}

/**
 * Tạo nhãn thời lượng còn lại cho thẻ đang xem
 */
function getRemainingLabel(progress: MovieProgress): string {
  if (progress.completed) return 'Đã xem xong';
  if (!progress.duration || progress.duration <= progress.currentTime) return '';
  const minsLeft = Math.max(1, Math.round((progress.duration - progress.currentTime) / 60));
  return `còn ${minsLeft} phút`;
}

/**
 * Giao diện Thư viện cá nhân (/cua-toi): 3 tab Đang xem / Đã lưu / Đã thích kèm xuất & nhập sao lưu JSON
 */
export default function LibraryView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const {
    watchProgress,
    myList,
    likes,
    removeProgress,
    clearAllProgress,
    removeSaved,
    toggleLike,
  } = usePersonalization();

  const [confirmClearOpen, setConfirmClearOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(
    null,
  );

  const rawTab = searchParams.get('tab');
  const activeTab: LibraryTab =
    rawTab === 'da-luu' || rawTab === 'da-thich' ? rawTab : 'dang-xem';

  // Gom lịch sử theo từng phim, giữ tập gần nhất
  const uniqueWatching: MovieProgress[] = [];
  const seenSlugs = new Set<string>();
  for (const item of watchProgress) {
    if (!seenSlugs.has(item.slug)) {
      seenSlugs.add(item.slug);
      uniqueWatching.push(item);
    }
  }

  const likedItems = likes.filter((item) => item.liked);

  /**
   * Đổi tab và đồng bộ lên URL ?tab= để giữ trạng thái khi tải lại trang
   */
  const switchTab = (nextTab: LibraryTab) => {
    router.replace(`/cua-toi?tab=${nextTab}`, { scroll: false });
  };

  /**
   * Xuất toàn bộ dữ liệu cá nhân ra tệp JSON tải về máy
   */
  const handleExport = () => {
    const data = exportBackup();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const dateStamp = new Date().toISOString().slice(0, 10);

    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `phimhay-backup-${dateStamp}.json`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);

    setFeedback({
      type: 'success',
      message: 'Đã xuất tệp sao lưu thành công.',
    });
  };

  /**
   * Đọc tệp JSON người dùng chọn, kiểm tra hợp lệ và gộp vào dữ liệu hiện có
   */
  const handleImportFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const text = await file.text();
      const backup = parseBackup(text);
      const summary = applyBackup(backup, 'merge');
      setFeedback({
        type: 'success',
        message: `Đã khôi phục: ${summary.watchCount} đang xem · ${summary.savedCount} đã lưu · ${summary.likedCount} đã thích.`,
      });
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Không thể đọc tệp sao lưu.',
      });
    }
  };

  const tabs: { key: LibraryTab; label: string; count: number; icon: typeof History }[] = [
    { key: 'dang-xem', label: 'Đang xem', count: uniqueWatching.length, icon: History },
    { key: 'da-luu', label: 'Đã lưu', count: myList.length, icon: Bookmark },
    { key: 'da-thich', label: 'Đã thích', count: likedItems.length, icon: Heart },
  ];

  return (
    <div className="mx-auto min-h-[80vh] max-w-[1600px] px-4 pt-20 pb-16 md:px-8 md:pt-24 xl:px-12">
      {/* Đầu trang + nút Xuất/Nhập sao lưu */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[11px] font-semibold tracking-[0.2em] text-[#E50914] uppercase">
            Cá nhân hóa
          </p>
          <h1 className="font-display text-3xl font-bold tracking-wide text-white uppercase md:text-4xl">
            Thư viện của tôi
          </h1>
          <p className="mt-1 text-xs text-[#9A9AA8]">
            {uniqueWatching.length} đang xem · {myList.length} đã lưu · {likedItems.length} đã thích
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#14141A] px-3.5 py-2 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-[#1E1E26]"
          >
            <Download className="h-3.5 w-3.5" />
            Xuất dữ liệu
          </button>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-[#14141A] px-3.5 py-2 text-xs font-semibold text-white transition hover:border-white/30 hover:bg-[#1E1E26]"
          >
            <Upload className="h-3.5 w-3.5" />
            Nhập sao lưu
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="application/json,.json"
            onChange={handleImportFile}
            className="hidden"
          />
        </div>
      </div>

      {/* Thông báo kết quả xuất/nhập */}
      {feedback && (
        <div
          role="status"
          className={`mb-6 flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-xs sm:text-sm ${
            feedback.type === 'success'
              ? 'border-emerald-500/35 bg-emerald-500/10 text-emerald-200'
              : 'border-[#E50914]/40 bg-[#E50914]/15 text-[#ffb4aa]'
          }`}
        >
          <span className="inline-flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0" />
            {feedback.message}
          </span>
          <button
            type="button"
            onClick={() => setFeedback(null)}
            aria-label="Đóng thông báo"
            className="rounded p-1 hover:bg-white/10"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Thanh chuyển tab */}
      <div
        role="tablist"
        aria-label="Phân mục thư viện cá nhân"
        className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-white/10"
      >
        <div className="flex gap-5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = tab.key === activeTab;
            return (
              <button
                key={tab.key}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => switchTab(tab.key)}
                className={`relative inline-flex items-center gap-2 pb-3 text-sm font-semibold transition ${
                  isActive ? 'text-white' : 'text-[#9A9AA8] hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
                <span className="rounded-full bg-white/10 px-2 py-0.5 text-[11px]">
                  {tab.count}
                </span>
                {isActive && (
                  <span className="absolute right-0 bottom-0 left-0 h-0.5 rounded-full bg-[#E50914]" />
                )}
              </button>
            );
          })}
        </div>

        {activeTab === 'dang-xem' && uniqueWatching.length > 0 && (
          <button
            type="button"
            onClick={() => setConfirmClearOpen(true)}
            className="mb-2 inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-medium text-[#9A9AA8] transition hover:border-[#E50914]/50 hover:text-[#ffb4aa]"
          >
            <Trash2 className="h-3.5 w-3.5" />
            Xóa toàn bộ lịch sử
          </button>
        )}
      </div>

      {/* Tab Đang xem */}
      {activeTab === 'dang-xem' &&
        (uniqueWatching.length === 0 ? (
          <EmptyState
            title="Bạn chưa xem bộ phim nào gần đây"
            description="Tiến độ xem phim của bạn sẽ tự động lưu lại tại đây để tiếp tục bất cứ lúc nào."
          />
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {uniqueWatching.map((progress) => {
              const remaining = getRemainingLabel(progress);
              const watchHref = `/xem-phim/${progress.slug}?tap=${progress.episodeIndex + 1}${
                progress.serverIndex !== undefined ? `&server=${progress.serverIndex + 1}` : ''
              }`;

              return (
                <article
                  key={`${progress.slug}-${progress.episodeIndex}`}
                  className="group relative overflow-hidden rounded-[10px] border border-white/10 bg-[#14141A] transition hover:border-white/25"
                >
                  <Link href={watchHref} className="block">
                    <div className="relative aspect-video bg-[#0A0A0D]">
                      <ImageWithFallback
                        src={getImageUrl(progress.thumb_url || progress.poster_url)}
                        alt={progress.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition duration-500 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-linear-to-t from-[#0A0A0D]/90 via-black/15 to-transparent" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#E50914]/90 text-white shadow-lg transition group-hover:scale-110">
                          <Play className="ml-0.5 h-5 w-5 fill-white" />
                        </span>
                      </div>
                    </div>
                    <div className="h-1 bg-white/15">
                      <div
                        className="h-full bg-[#E50914]"
                        style={{ width: `${getProgressPercent(progress)}%` }}
                      />
                    </div>
                    <div className="p-3.5">
                      <h2 className="line-clamp-1 text-sm font-semibold text-white">
                        {progress.name || progress.slug}
                      </h2>
                      <p className="mt-1 line-clamp-1 text-xs text-[#9A9AA8]">
                        {progress.episodeName || `Tập ${progress.episodeIndex + 1}`}
                        {remaining ? ` · ${remaining}` : ''}
                      </p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={() => removeProgress(progress.slug)}
                    aria-label={`Xóa ${progress.name} khỏi lịch sử`}
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-white transition hover:bg-[#E50914]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </article>
              );
            })}
          </div>
        ))}

      {/* Tab Đã lưu */}
      {activeTab === 'da-luu' &&
        (myList.length === 0 ? (
          <EmptyState
            title="Danh sách lưu của bạn đang trống"
            description="Nhấn nút + Danh sách trên phim bạn thích để lưu lại xem sau."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {myList.map((movie) => (
              <div key={movie.slug} className="group/item relative">
                <MovieCard movie={savedToMovie(movie)} variant="poster" />
                <button
                  type="button"
                  onClick={() => removeSaved(movie.slug)}
                  aria-label={`Bỏ lưu ${movie.name}`}
                  title="Bỏ khỏi danh sách"
                  className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-white opacity-90 transition hover:bg-[#E50914] md:opacity-0 md:group-hover/item:opacity-100"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        ))}

      {/* Tab Đã thích */}
      {activeTab === 'da-thich' &&
        (likedItems.length === 0 ? (
          <EmptyState
            title="Chưa có phim yêu thích"
            description="Thả tim những bộ phim ấn tượng để dễ tìm lại về sau."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {likedItems.map((item) => {
              const movie = likedToMovie(item);
              if (movie) {
                return (
                  <div key={item.slug} className="group/item relative">
                    <MovieCard movie={movie} variant="poster" />
                    <button
                      type="button"
                      onClick={() => toggleLike(item.slug)}
                      aria-label={`Bỏ thích ${movie.name}`}
                      title="Bỏ thích"
                      className="absolute top-2 right-2 z-20 flex h-7 w-7 items-center justify-center rounded-full bg-black/80 text-white opacity-90 transition hover:bg-[#E50914] md:opacity-0 md:group-hover/item:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                );
              }

              // Thẻ dự phòng cho dữ liệu thích cũ chỉ lưu slug
              return (
                <div
                  key={item.slug}
                  className="relative flex aspect-[2/3] flex-col items-center justify-center rounded-[10px] border border-white/10 bg-[#14141A] p-4 text-center"
                >
                  <Heart className="mb-2 h-6 w-6 fill-[#E50914] text-[#E50914]" />
                  <Link
                    href={`/phim/${item.slug}`}
                    className="line-clamp-2 text-sm font-semibold text-white hover:text-[#E50914]"
                  >
                    {item.slug.replace(/-/g, ' ')}
                  </Link>
                  <button
                    type="button"
                    onClick={() => toggleLike(item.slug)}
                    aria-label="Bỏ thích phim này"
                    className="absolute top-2 right-2 flex h-7 w-7 items-center justify-center rounded-full bg-black/75 text-white hover:bg-[#E50914]"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              );
            })}
          </div>
        ))}

      {/* Hộp thoại xác nhận xóa toàn bộ lịch sử */}
      {confirmClearOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Xác nhận xóa toàn bộ lịch sử xem"
          onClick={() => setConfirmClearOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm rounded-2xl border border-white/15 bg-[#14141A] p-6 shadow-2xl"
          >
            <h3 className="font-display text-xl font-bold tracking-wide text-white uppercase">
              Xóa toàn bộ lịch sử?
            </h3>
            <p className="mt-2 text-sm text-[#9A9AA8]">
              Mọi tiến độ xem đang lưu trên trình duyệt này sẽ bị xóa. Danh sách đã lưu và yêu thích
              vẫn được giữ nguyên.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmClearOpen(false)}
                className="rounded-lg border border-white/15 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/15"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => {
                  clearAllProgress();
                  setConfirmClearOpen(false);
                }}
                className="rounded-lg bg-[#E50914] px-4 py-2 text-xs font-semibold text-white hover:bg-[#f40612]"
              >
                Xóa lịch sử
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * Khối trạng thái trống dùng chung cho các tab trong trang Thư viện của tôi
 */
function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-[#14141A] px-6 py-16 text-center">
      <Film className="mx-auto mb-3 h-10 w-10 text-[#9A9AA8]" />
      <h2 className="text-base font-semibold text-white">{title}</h2>
      <p className="mx-auto mt-1.5 max-w-md text-sm text-[#9A9AA8]">{description}</p>
      <Link
        href="/danh-sach/phim-moi"
        className="mt-5 inline-flex rounded-lg bg-[#E50914] px-5 py-2.5 text-xs font-semibold text-white transition hover:bg-[#f40612]"
      >
        Khám phá phim mới →
      </Link>
    </div>
  );
}

'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Clock, Loader2, Search, Star, Trash2, X } from 'lucide-react';
import { searchMoviesAction } from '@/app/actions/movie';
import { getImageUrl, getMovieScore } from '@/lib/services/movie';
import { usePersonalization } from '@/hooks/usePersonalization';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import type { Movie } from '@/types';

/**
 * Hộp thoại tìm kiếm nhanh kiểu Command Palette (mở bằng Ctrl+K, Cmd+K hoặc phím /)
 */
export default function HeaderSearch() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const requestIdRef = useRef(0);
  const { recentSearches, rememberSearch, clearSearches } = usePersonalization();

  // Đăng ký phím tắt Ctrl+K / Cmd+K / phím / và Esc
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable);

      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (!isTyping && event.key === '/') {
        event.preventDefault();
        setIsOpen(true);
      } else if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Tự động focus vào ô nhập khi mở modal tìm kiếm
  useEffect(() => {
    if (isOpen) {
      window.setTimeout(() => inputRef.current?.focus(), 40);
    }
  }, [isOpen]);

  // Tìm kiếm gợi ý có debounce 300ms
  useEffect(() => {
    const clean = keyword.trim();
    if (clean.length < 2) {
      return;
    }

    const timer = window.setTimeout(async () => {
      const reqId = requestIdRef.current + 1;
      requestIdRef.current = reqId;
      setIsLoading(true);

      const items = await searchMoviesAction(clean, 8);
      if (reqId !== requestIdRef.current) return;

      setResults(items);
      setIsLoading(false);
    }, 300);

    return () => window.clearTimeout(timer);
  }, [keyword]);

  const cleanKeyword = keyword.trim();
  const visibleResults = cleanKeyword.length >= 2 ? results : [];
  const showLoading = cleanKeyword.length >= 2 && isLoading;

  /**
   * Điều hướng tới trang kết quả tìm kiếm đầy đủ và lưu lịch sử
   */
  const executeSearch = (value: string) => {
    const clean = value.trim();
    if (!clean) return;
    rememberSearch(clean);
    setIsOpen(false);
    router.push(`/tim-kiem?keyword=${encodeURIComponent(clean)}`);
  };

  /**
   * Đóng hộp thoại tìm kiếm và xóa từ khóa tạm
   */
  const closePalette = () => {
    setIsOpen(false);
    setKeyword('');
    setResults([]);
  };

  return (
    <>
      {/* Nút kích hoạt Command Palette trên Header */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label="Mở tìm kiếm phim"
        className="flex items-center gap-2 rounded-full border border-white/12 bg-[#14141A]/85 px-3 py-1.5 text-xs text-[#9A9AA8] transition hover:border-white/25 hover:bg-[#1E1E26] hover:text-white md:w-56 md:justify-between lg:w-64"
      >
        <span className="flex items-center gap-2">
          <Search className="h-4 w-4 text-white/80" />
          <span className="hidden md:inline">Tìm phim, diễn viên...</span>
        </span>
        <kbd className="hidden rounded border border-white/10 bg-[#0A0A0D] px-1.5 py-0.5 font-mono text-[10px] text-[#9A9AA8] md:inline">
          Ctrl K
        </kbd>
      </button>

      {/* Modal Command Palette */}
      {isOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Tìm kiếm nhanh phim"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-[70] flex items-start justify-center bg-black/75 px-4 pt-16 backdrop-blur-sm sm:pt-24"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/15 bg-[#14141A] shadow-[0_24px_80px_rgba(0,0,0,0.85)]"
          >
            {/* Ô nhập tìm kiếm */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                executeSearch(keyword);
              }}
              className="flex items-center gap-3 border-b border-white/10 px-4 py-3.5"
            >
              <Search className="h-5 w-5 shrink-0 text-[#E50914]" />
              <input
                ref={inputRef}
                type="text"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                placeholder="Nhập tên phim tiếng Việt hoặc tên gốc..."
                className="w-full bg-transparent text-sm text-white placeholder-[#9A9AA8] focus:outline-none sm:text-base"
              />
              {keyword && (
                <button
                  type="button"
                  onClick={() => setKeyword('')}
                  aria-label="Xóa từ khóa"
                  className="rounded-md p-1 text-[#9A9AA8] hover:bg-white/10 hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="rounded border border-white/10 bg-[#0A0A0D] px-2 py-1 text-[11px] font-medium text-[#9A9AA8] hover:text-white"
              >
                ESC
              </button>
            </form>

            {/* Khu vực kết quả / lịch sử */}
            <div className="max-h-[62vh] overflow-y-auto p-3">
              {keyword.trim().length < 2 ? (
                recentSearches.length > 0 ? (
                  <div>
                    <div className="mb-2 flex items-center justify-between px-2">
                      <span className="text-[11px] font-semibold tracking-wider text-[#9A9AA8] uppercase">
                        Tìm kiếm gần đây
                      </span>
                      <button
                        type="button"
                        onClick={clearSearches}
                        className="inline-flex items-center gap-1 text-[11px] text-[#9A9AA8] transition hover:text-[#E50914]"
                      >
                        <Trash2 className="h-3 w-3" />
                        Xóa
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 px-2 pb-2">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          type="button"
                          onClick={() => executeSearch(term)}
                          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#1E1E26] px-3 py-1.5 text-xs text-[#F2F2F5] transition hover:border-white/25"
                        >
                          <Clock className="h-3 w-3 text-[#9A9AA8]" />
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <p className="py-10 text-center text-sm text-[#9A9AA8]">
                    Nhập ít nhất 2 ký tự để tìm kiếm phim ngay lập tức.
                  </p>
                )
              ) : showLoading ? (
                <div className="flex items-center justify-center gap-2 py-10 text-sm text-[#9A9AA8]">
                  <Loader2 className="h-5 w-5 animate-spin text-[#E50914]" />
                  <span>Đang tìm phim...</span>
                </div>
              ) : visibleResults.length > 0 ? (
                <div className="space-y-1">
                  {visibleResults.map((movie) => {
                    const score = getMovieScore(movie);
                    return (
                      <Link
                        key={movie._id}
                        href={`/phim/${movie.slug}`}
                        onClick={closePalette}
                        className="flex items-center gap-3 rounded-xl p-2 transition hover:bg-[#1E1E26]"
                      >
                        <div className="relative h-16 w-11 shrink-0 overflow-hidden rounded-md bg-[#0A0A0D]">
                          <ImageWithFallback
                            src={getImageUrl(movie.poster_url || movie.thumb_url)}
                            alt={movie.name}
                            fill
                            sizes="44px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h4 className="truncate text-sm font-semibold text-white">
                            {movie.name}
                          </h4>
                          <p className="truncate text-xs text-[#9A9AA8]">{movie.origin_name}</p>
                          <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] text-[#9A9AA8]">
                            {movie.year > 0 && <span>{movie.year}</span>}
                            {movie.quality && (
                              <span className="rounded bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold text-white">
                                {movie.quality}
                              </span>
                            )}
                            {score && (
                              <span className="inline-flex items-center gap-0.5 font-semibold text-[#F5C518]">
                                <Star className="h-3 w-3 fill-[#F5C518]" />
                                {score}
                              </span>
                            )}
                          </div>
                        </div>
                      </Link>
                    );
                  })}

                  <button
                    type="button"
                    onClick={() => executeSearch(keyword)}
                    className="mt-2 w-full rounded-xl border border-white/10 bg-[#0A0A0D] py-2.5 text-center text-xs font-semibold text-white transition hover:border-[#E50914]/50 hover:text-[#E50914]"
                  >
                    Xem toàn bộ kết quả cho &ldquo;{keyword.trim()}&rdquo;
                  </button>
                </div>
              ) : (
                <p className="py-10 text-center text-sm text-[#9A9AA8]">
                  Không tìm thấy phim phù hợp với &ldquo;{keyword.trim()}&rdquo;.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

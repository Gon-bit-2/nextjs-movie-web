'use client';

import { useState, useEffect, useRef } from 'react';
import { Search, X, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { searchMoviesAction } from '@/app/actions/movie';
import { Movie } from '@/types';
import { getImageUrl } from '@/lib/services/movie';
import Image from 'next/image';
import { usePersonalization } from '@/hooks/usePersonalization';

export default function HeaderSearch() {
  const [isOpen, setIsOpen] = useState(false);
  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState<Movie[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const requestIdRef = useRef(0);
  const { recentSearches, rememberSearch } = usePersonalization();

  // Handle outside click to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Debounced search
  useEffect(() => {
    const cleanKeyword = keyword.trim();
    const handler = setTimeout(async () => {
      if (cleanKeyword.length >= 2) {
        const requestId = requestIdRef.current + 1;
        requestIdRef.current = requestId;
        setIsLoading(true);
        const data = await searchMoviesAction(cleanKeyword, 5);
        if (requestId !== requestIdRef.current) return;
        setResults(data);
        setIsLoading(false);
      } else {
        setResults([]);
        setIsLoading(false);
      }
    }, 500);

    return () => clearTimeout(handler);
  }, [keyword]);

  const executeSearch = (value: string) => {
    const cleanKeyword = value.trim();
    if (cleanKeyword) {
      rememberSearch(cleanKeyword);
      router.push(`/tim-kiem?keyword=${encodeURIComponent(cleanKeyword)}`);
      setIsOpen(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(keyword);
  };

  const clearSearch = () => {
    setKeyword('');
    setResults([]);
  };

  const closeAndClear = () => {
    setIsOpen(false);
    setKeyword('');
    setResults([]);
  };

  return (
    <div ref={searchContainerRef} className="relative flex items-center">
      {/* Search Input Container */}
      <div
        className={`flex items-center transition-all duration-300 ${
          isOpen
            ? 'w-64 border border-gray-600 bg-black/80 px-2 sm:w-80'
            : 'w-8 border border-transparent bg-transparent px-0'
        }`}
      >
        <Search
          className={`h-5 w-5 cursor-pointer text-white transition hover:text-gray-300 ${
            !isOpen && 'ml-2' // Adjust icon position when closed
          }`}
          onClick={() => setIsOpen(true)}
        />

        <form
          onSubmit={handleSubmit}
          className={`flex w-full items-center overflow-hidden transition-all duration-300 ${
            isOpen ? 'ml-2 opacity-100' : 'w-0 opacity-0'
          }`}
        >
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="Tên phim, diễn viên..."
            className="w-full bg-transparent py-2 text-sm text-white placeholder-gray-400 focus:outline-none"
            autoFocus={isOpen}
          />
          {keyword && (
            <button
              type="button"
              onClick={clearSearch}
              className="mr-1 flex items-center justify-center rounded-full p-1 hover:bg-gray-800"
            >
              <X className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </form>
      </div>

      {/* Auto-suggest Dropdown */}
      {isOpen && (keyword.trim().length > 0 || recentSearches.length > 0) && (
        <div className="bg-background absolute top-12 right-0 w-full min-w-[300px] overflow-hidden rounded-md border border-gray-700 shadow-2xl sm:min-w-[400px]">
          {keyword.trim().length === 0 && recentSearches.length > 0 ? (
            <div className="flex flex-col">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                Tìm kiếm gần đây
              </div>
              {recentSearches.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => executeSearch(item)}
                  className="flex items-center gap-3 border-b border-gray-800 p-3 text-left text-sm text-gray-200 transition-colors hover:bg-gray-800"
                >
                  <Search className="h-4 w-4 text-gray-500" />
                  {item}
                </button>
              ))}
            </div>
          ) : isLoading ? (
            <div className="flex items-center justify-center p-6 text-gray-400">
              <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              <span className="text-sm">Đang tìm kiếm...</span>
            </div>
          ) : results.length > 0 ? (
            <div className="flex flex-col">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase">
                Gợi ý phim
              </div>
              <div className="max-h-[60vh] overflow-y-auto">
                {results.map((movie) => (
                  <Link
                    key={movie._id}
                    href={`/xem-phim/${movie.slug}`}
                    onClick={closeAndClear}
                    className="flex items-center gap-3 border-b border-gray-800 p-3 transition-colors hover:bg-gray-800"
                  >
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded shadow">
                      <Image
                        src={getImageUrl(movie.thumb_url)}
                        alt={movie.name}
                        fill
                        className="object-cover"
                        sizes="(max-width: 48px) 100vw, 48px"
                      />
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <h4 className="truncate text-sm font-semibold text-white">{movie.name}</h4>
                      <p className="truncate text-xs text-gray-400">{movie.origin_name}</p>
                      <p className="text-netflix mt-1 text-xs">{movie.year}</p>
                    </div>
                  </Link>
                ))}
              </div>
              <button
                type="button"
                onClick={() => executeSearch(keyword)}
                className="hover:text-netflix w-full bg-gray-900 p-3 text-center text-sm font-medium text-white transition-colors hover:bg-gray-800"
              >
                Xem tất cả kết quả cho &quot;{keyword}&quot;
              </button>
            </div>
          ) : (
            <div className="p-6 text-center text-sm text-gray-400">
              Không tìm thấy kết quả nào cho &quot;{keyword}&quot;
            </div>
          )}
        </div>
      )}
    </div>
  );
}

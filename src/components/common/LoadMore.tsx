'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useOnInView } from 'react-intersection-observer';
import { Loader2 } from 'lucide-react';
import { loadMoreMovies, type LoadMoreType } from '@/app/actions/movie';
import MovieCard from '@/components/common/MovieCard';
import type { ListFilters, Movie } from '@/types';

interface LoadMoreProps {
  type: LoadMoreType;
  slugOrKeyword: string;
  filters?: ListFilters;
  initialHasMore?: boolean;
}

/**
 * Thành phần cuộn vô hạn tải thêm trang phim kế tiếp, giữ nguyên toàn bộ bộ lọc phía server
 */
export default function LoadMore({
  type,
  slugOrKeyword,
  filters,
  initialHasMore = true,
}: LoadMoreProps) {
  const filterKey = JSON.stringify(filters ?? {});
  const [movies, setMovies] = useState<Movie[]>([]);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const pageRef = useRef(2);
  const hasMoreRef = useRef(initialHasMore);
  const isLoadingRef = useRef(false);

  // Đặt lại danh sách và chỉ số trang khi đổi đường dẫn hoặc bộ lọc
  useEffect(() => {
    setMovies([]);
    setHasMore(initialHasMore);
    pageRef.current = 2;
    hasMoreRef.current = initialHasMore;
    isLoadingRef.current = false;
  }, [type, slugOrKeyword, filterKey, initialHasMore]);

  const loadNextPage = useCallback(async () => {
    if (!hasMoreRef.current || isLoadingRef.current) return;
    isLoadingRef.current = true;

    try {
      const parsedFilters = JSON.parse(filterKey) as ListFilters;
      const result = await loadMoreMovies(type, slugOrKeyword, pageRef.current, parsedFilters);

      if (result.items.length > 0) {
        setMovies((prev) => [...prev, ...result.items]);
        pageRef.current += 1;
      }

      if (!result.hasMore || result.items.length === 0) {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } finally {
      isLoadingRef.current = false;
    }
  }, [filterKey, slugOrKeyword, type]);

  const sentinelRef = useOnInView(
    (inView) => {
      if (inView) {
        void loadNextPage();
      }
    },
    { threshold: 0, skip: !hasMore },
  );

  if (!hasMore && movies.length === 0) return null;

  return (
    <>
      {movies.length > 0 && (
        <div className="col-span-full mt-4 grid w-full grid-cols-2 gap-3.5 sm:grid-cols-3 md:grid-cols-4 md:gap-4 lg:grid-cols-5 xl:grid-cols-6">
          {movies.map((movie, index) => (
            <MovieCard key={`${movie._id}-${index}`} movie={movie} variant="poster" />
          ))}
        </div>
      )}

      {hasMore && (
        <div ref={sentinelRef} className="col-span-full flex justify-center py-10">
          <Loader2 className="h-7 w-7 animate-spin text-[#E50914]" />
        </div>
      )}
    </>
  );
}

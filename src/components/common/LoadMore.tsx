'use client';

import { useCallback, useRef, useState } from 'react';
import { useOnInView } from 'react-intersection-observer';
import { loadMoreMovies } from '@/app/actions/movie';
import MovieCard from '@/components/common/MovieCard';
import { Movie } from '@/types';
import { Loader2 } from 'lucide-react';

interface LoadMoreProps {
  type: 'category' | 'search' | 'genre';
  slugOrKeyword: string;
}

export default function LoadMore({ type, slugOrKeyword }: LoadMoreProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(2);
  const hasMoreRef = useRef(true);
  const isLoadingRef = useRef(false);

  const loadNextPage = useCallback(async () => {
    if (!hasMoreRef.current || isLoadingRef.current) {
      return;
    }

    isLoadingRef.current = true;

    try {
      const res = await loadMoreMovies(type, slugOrKeyword, pageRef.current);

      if (res && res.length > 0) {
        setMovies((prev) => [...prev, ...res]);
        pageRef.current += 1;
      } else {
        hasMoreRef.current = false;
        setHasMore(false);
      }
    } finally {
      isLoadingRef.current = false;
    }
  }, [slugOrKeyword, type]);

  const ref = useOnInView(
    (inView) => {
      if (!inView) {
        return;
      }

      void loadNextPage();
    },
    { threshold: 0, skip: !hasMore },
  );

  if (!hasMore && movies.length === 0) return null;

  return (
    <>
      <div className="col-span-full mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:mt-6 md:grid-cols-4 md:gap-4 lg:grid-cols-5 lg:gap-6 xl:grid-cols-6">
        {movies.map((movie, index) => (
          <MovieCard key={`${movie._id}-${index}`} movie={movie} />
        ))}
      </div>
      {hasMore && (
        <div ref={ref} className="col-span-full mt-8 flex justify-center py-8">
          <Loader2 className="text-netflix h-8 w-8 animate-spin" />
        </div>
      )}
    </>
  );
}

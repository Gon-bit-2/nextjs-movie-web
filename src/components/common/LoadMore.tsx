'use client';

import { useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';
import { loadMoreMovies } from '@/app/actions/movie';
import MovieCard from '@/components/common/MovieCard';
import { Movie } from '@/types';
import { Loader2 } from 'lucide-react';

interface LoadMoreProps {
  type: 'category' | 'search';
  slugOrKeyword: string;
}

export default function LoadMore({ type, slugOrKeyword }: LoadMoreProps) {
  const { ref, inView } = useInView({ threshold: 0 });
  const [movies, setMovies] = useState<Movie[]>([]);
  const [page, setPage] = useState(2);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    if (inView && hasMore) {
      loadMoreMovies(type, slugOrKeyword, page).then((res) => {
        if (res && res.length > 0) {
          setMovies((prev) => [...prev, ...res]);
          setPage((prev) => prev + 1);
        } else {
          setHasMore(false);
        }
      });
    }
  }, [inView, type, slugOrKeyword, page, hasMore]);

  if (!hasMore && movies.length === 0) return null;

  return (
    <>
      <div className="col-span-full mt-4 grid w-full grid-cols-2 gap-3 sm:grid-cols-3 md:mt-6 md:grid-cols-4 md:gap-4 lg:grid-cols-5 lg:gap-6 xl:grid-cols-6">
        {movies.map((movie, index) => (
          <MovieCard key={`${movie._id}-${page}-${index}`} movie={movie} />
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

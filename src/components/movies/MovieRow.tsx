'use client';

import { useRef, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Movie } from '@/types';
import MovieCard from '@/components/common/MovieCard';
import Link from 'next/link';

interface MovieRowProps {
  title: string;
  movies: Movie[];
  href?: string;
}

export default function MovieRow({ title, movies, href }: MovieRowProps) {
  const rowRef = useRef<HTMLDivElement>(null);
  const [isMoved, setIsMoved] = useState(false);

  const handleClick = (direction: 'left' | 'right') => {
    setIsMoved(true);
    if (rowRef.current) {
      const { scrollLeft, clientWidth } = rowRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      rowRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="group/row space-y-0.5 pt-4 md:space-y-2">
      <h2 className="relative z-10 flex w-fit items-center px-4 md:px-[4%]">
        {href ? (
          <Link
            href={href}
            className="flex w-fit cursor-pointer items-center gap-2 text-sm font-bold text-[#e5e5e5] transition duration-200 hover:text-white md:text-xl lg:text-2xl"
          >
            {title}
            <span className="mt-1 flex items-center text-[12px] font-semibold text-[#54b9c5] opacity-0 transition-opacity group-hover/row:opacity-100 md:text-[14px]">
              Khám phá tất cả <ChevronRight className="ml-1 h-4 w-4" />
            </span>
          </Link>
        ) : (
          <span className="flex w-fit items-center gap-2 text-sm font-bold text-[#e5e5e5] md:text-xl lg:text-2xl">
            {title}
          </span>
        )}
      </h2>

      <div className="group/slider relative">
        <button
          className={`absolute top-0 bottom-0 left-0 z-40 m-auto flex h-full w-[4%] cursor-pointer items-center justify-center bg-black/50 opacity-0 transition group-hover/slider:opacity-100 hover:bg-black/80 ${
            !isMoved && 'hidden'
          }`}
          onClick={() => handleClick('left')}
        >
          <ChevronLeft className="h-8 w-8 scale-125 text-white transition-transform hover:scale-150" />
        </button>

        {/* Padding lớn (py-12) giúp chừa khoảng không cho Card khi Hover Scale */}
        <div
          ref={rowRef}
          className="scrollbar-hide -my-4 flex items-center gap-2 overflow-x-auto px-4 py-4 md:-my-16 md:px-[4%] md:py-16"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {movies.map((movie) => (
            <div key={movie._id} className="min-w-[160px] md:min-w-[240px] lg:min-w-[280px]">
              <MovieCard movie={movie} type="backdrop" />
            </div>
          ))}
        </div>

        <button
          className="absolute top-0 right-0 bottom-0 z-40 m-auto flex h-full w-[4%] cursor-pointer items-center justify-center bg-black/50 opacity-0 transition group-hover/slider:opacity-100 hover:bg-black/80"
          onClick={() => handleClick('right')}
        >
          <ChevronRight className="h-8 w-8 scale-125 text-white transition-transform hover:scale-150" />
        </button>
      </div>
    </div>
  );
}

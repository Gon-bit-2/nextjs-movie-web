import Link from 'next/link';
import type { MovieSortKey } from '@/lib/movies/sort';

interface SortLinksProps {
  basePath: string;
  activeSort: MovieSortKey;
  keyword?: string;
}

const SORT_OPTIONS: { value: MovieSortKey; label: string }[] = [
  { value: 'latest', label: 'Mới nhất' },
  { value: 'year-desc', label: 'Năm mới' },
  { value: 'year-asc', label: 'Năm cũ' },
  { value: 'name-asc', label: 'A-Z' },
];

export default function SortLinks({ basePath, activeSort, keyword }: SortLinksProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {SORT_OPTIONS.map((option) => {
        const params = new URLSearchParams();
        if (keyword) params.set('keyword', keyword);
        if (option.value !== 'latest') params.set('sort', option.value);
        const href = params.toString() ? `${basePath}?${params.toString()}` : basePath;

        return (
          <Link
            key={option.value}
            href={href}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
              activeSort === option.value
                ? 'bg-white text-black'
                : 'bg-white/10 text-gray-300 hover:bg-white/20 hover:text-white'
            }`}
          >
            {option.label}
          </Link>
        );
      })}
    </div>
  );
}

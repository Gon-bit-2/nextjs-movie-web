import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { GENRE_CONFIG } from '@/config/navigation';

export default function GenreRail() {
  return (
    <section className="px-4 md:px-[4%]">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white md:text-2xl">Theo thể loại</h2>
      </div>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        {GENRE_CONFIG.slice(0, 12).map((genre) => (
          <Link
            key={genre.slug}
            href={`/the-loai/${genre.slug}`}
            className="group flex min-h-20 items-center justify-between rounded-lg border border-white/10 bg-white/[0.04] px-4 py-3 transition-colors hover:border-red-500/60 hover:bg-red-600/15"
          >
            <span className="text-sm font-semibold text-white">{genre.label}</span>
            <ChevronRight className="h-4 w-4 text-gray-500 transition-transform group-hover:translate-x-1 group-hover:text-white" />
          </Link>
        ))}
      </div>
    </section>
  );
}

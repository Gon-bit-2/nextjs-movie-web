import Link from 'next/link';
import { Globe, Sparkles } from 'lucide-react';
import type { Taxonomy } from '@/types';

interface GenreRailProps {
  genres: Taxonomy[];
  countries: Taxonomy[];
}

/**
 * Khối khám phá nhanh theo Quốc gia và Thể loại sử dụng dữ liệu trực tiếp từ API v1
 */
export default function GenreRail({ genres, countries }: GenreRailProps) {
  return (
    <section className="mx-auto w-full max-w-[1600px] px-4 md:px-8 xl:px-12">
      <div className="grid gap-6 rounded-[12px] border border-white/10 bg-[#14141A] p-5 md:p-7 lg:grid-cols-2">
        <div>
          <div className="mb-3.5 flex items-center gap-2">
            <Globe className="h-4 w-4 text-[#E50914]" />
            <h2 className="font-display text-lg font-bold tracking-wide text-white uppercase">
              Khám phá theo quốc gia
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {countries.slice(0, 14).map((country) => (
              <Link
                key={country.slug}
                href={`/quoc-gia/${country.slug}`}
                className="rounded-full border border-white/10 bg-[#1E1E26] px-3.5 py-1.5 text-xs font-medium text-[#F2F2F5] transition hover:border-[#E50914]/60 hover:bg-[#E50914]/15 hover:text-white"
              >
                {country.name}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <div className="mb-3.5 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-[#F5C518]" />
            <h2 className="font-display text-lg font-bold tracking-wide text-white uppercase">
              Khám phá theo thể loại
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {genres.slice(0, 16).map((genre) => (
              <Link
                key={genre.slug}
                href={`/the-loai/${genre.slug}`}
                className="rounded-full border border-white/10 bg-[#1E1E26] px-3.5 py-1.5 text-xs font-medium text-[#F2F2F5] transition hover:border-[#E50914]/60 hover:bg-[#E50914]/15 hover:text-white"
              >
                {genre.name}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

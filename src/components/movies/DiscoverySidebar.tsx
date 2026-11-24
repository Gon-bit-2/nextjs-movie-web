import Link from 'next/link';
import { CATEGORY_CONFIG, GENRE_CONFIG } from '@/config/navigation';

interface DiscoverySidebarProps {
  activeCategory?: string;
  activeGenre?: string;
}

export default function DiscoverySidebar({ activeCategory, activeGenre }: DiscoverySidebarProps) {
  return (
    <aside className="w-full shrink-0 border-white/10 pr-0 md:w-64 md:border-r md:pr-6">
      <h2 className="mb-4 text-xl font-bold text-white">Khám phá</h2>

      <div className="mb-6 border-b border-gray-800 pb-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-400 uppercase">Danh mục</h3>
        <ul className="space-y-1">
          {CATEGORY_CONFIG.map((category) => (
            <li key={category.slug}>
              <Link
                href={category.href}
                className={`block rounded-md px-2 py-2 transition-colors ${
                  activeCategory === category.slug
                    ? 'bg-white text-black'
                    : 'text-gray-300 hover:bg-white/10 hover:text-white'
                }`}
              >
                {category.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="pb-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-400 uppercase">Thể loại</h3>
        <div className="grid grid-cols-2 gap-2 text-sm sm:grid-cols-3 md:grid-cols-1">
          {GENRE_CONFIG.map((genre) => (
            <Link
              key={genre.slug}
              href={`/the-loai/${genre.slug}`}
              className={`block rounded-md px-2 py-2 transition-colors ${
                activeGenre === genre.slug
                  ? 'bg-white text-black'
                  : 'text-gray-300 hover:bg-white/10 hover:text-white'
              }`}
            >
              {genre.label}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}

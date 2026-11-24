import Link from 'next/link';
import type { Taxonomy } from '@/types';
import { CATEGORY_CONFIG } from '@/config/navigation';

interface FooterProps {
  genres: Taxonomy[];
  countries: Taxonomy[];
}

/**
 * Chân trang tối giản phong cách Rạp chiếu đêm với các liên kết điều hướng thực tế
 */
export default function Footer({ genres, countries }: FooterProps) {
  return (
    <footer className="mt-20 border-t border-white/10 bg-[#0A0A0D] py-12 text-[#9A9AA8]">
      <div className="mx-auto max-w-[1600px] px-4 md:px-8 xl:px-12">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Link
              href="/"
              className="font-display text-2xl font-bold tracking-wider text-[#E50914]"
            >
              PHIMHAY
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-[#9A9AA8]">
              Rạp chiếu đêm trực tuyến tối ưu tốc độ tải và trải nghiệm xem phim mượt mà, cập nhật
              mỗi ngày với Vietsub, Thuyết minh và Lồng tiếng Full HD.
            </p>
          </div>

          <div>
            <h3 className="font-display mb-3 text-sm font-semibold tracking-wider text-white uppercase">
              Danh mục
            </h3>
            <ul className="space-y-2 text-sm">
              {CATEGORY_CONFIG.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className="transition hover:text-white">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display mb-3 text-sm font-semibold tracking-wider text-white uppercase">
              Thể loại nổi bật
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {genres.map((genre) => (
                <li key={genre.slug}>
                  <Link href={`/the-loai/${genre.slug}`} className="transition hover:text-white">
                    {genre.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="font-display mb-3 text-sm font-semibold tracking-wider text-white uppercase">
              Quốc gia
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm">
              {countries.map((country) => (
                <li key={country.slug}>
                  <Link href={`/quoc-gia/${country.slug}`} className="transition hover:text-white">
                    {country.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-start justify-between gap-2 border-t border-white/10 pt-6 text-xs text-[#9A9AA8] sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} PHIMHAY. Dữ liệu phim cung cấp bởi KKPhim API v1.</p>
          <p>Trình phát tối ưu HLS VOD · Không quảng cáo chen ngang.</p>
        </div>
      </div>
    </footer>
  );
}

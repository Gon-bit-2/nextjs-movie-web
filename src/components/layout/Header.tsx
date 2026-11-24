'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, ChevronDown, Menu, X } from 'lucide-react';
import type { Taxonomy } from '@/types';
import { CATEGORY_CONFIG } from '@/config/navigation';
import HeaderSearch from './HeaderSearch';

interface HeaderProps {
  genres: Taxonomy[];
  countries: Taxonomy[];
}

/**
 * Thanh điều hướng chính toàn site có nền kính mờ, mega-menu động cho Thể loại/Quốc gia và tự ẩn ở trang xem phim
 */
export default function Header({ genres, countries }: HeaderProps) {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<'genre' | 'country' | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navRef = useRef<HTMLDivElement>(null);

  // Theo dõi cuộn trang để chuyển header từ trong suốt sang kính mờ
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 16);
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Đóng dropdown khi nhấn ra ngoài
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setOpenDropdown(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Trang xem phim dùng thanh tiêu đề rạp chiếu mỏng riêng để không che trình phát
  if (pathname.startsWith('/xem-phim/')) {
    return null;
  }

  const primaryLinks = [
    { href: '/', label: 'Trang chủ' },
    ...CATEGORY_CONFIG.filter((c) =>
      ['phim-bo', 'phim-le', 'hoat-hinh', 'phim-chieu-rap'].includes(c.slug),
    ),
  ];

  return (
    <header
      ref={navRef}
      className={`fixed top-0 left-0 z-50 w-full transition-colors duration-300 ${
        isScrolled || isMobileMenuOpen || openDropdown
          ? 'border-b border-white/10 bg-[#0A0A0D]/88 backdrop-blur-xl'
          : 'bg-linear-to-b from-[#0A0A0D]/90 via-[#0A0A0D]/45 to-transparent'
      }`}
    >
      <div className="mx-auto flex h-14 max-w-[1600px] items-center justify-between gap-4 px-4 md:h-[68px] md:px-8 xl:px-12">
        <div className="flex items-center gap-7 xl:gap-9">
          <Link
            href="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="font-display text-2xl font-bold tracking-wider text-[#E50914] transition hover:opacity-90 md:text-[1.85rem]"
          >
            PHIMHAY
          </Link>

          {/* Điều hướng Desktop */}
          <nav aria-label="Điều hướng chính" className="hidden items-center gap-5 lg:flex">
            {primaryLinks.map((item) => {
              const isActive =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpenDropdown(null)}
                  className={`relative py-1 text-sm font-medium transition ${
                    isActive ? 'text-white' : 'text-[#9A9AA8] hover:text-white'
                  }`}
                >
                  {item.label}
                  {isActive && (
                    <span className="absolute right-0 -bottom-1 left-0 h-0.5 rounded-full bg-[#E50914]" />
                  )}
                </Link>
              );
            })}

            {/* Mega-menu Thể loại */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown((cur) => (cur === 'genre' ? null : 'genre'))}
                aria-expanded={openDropdown === 'genre'}
                className={`inline-flex items-center gap-1 py-1 text-sm font-medium transition ${
                  openDropdown === 'genre' || pathname.startsWith('/the-loai/')
                    ? 'text-white'
                    : 'text-[#9A9AA8] hover:text-white'
                }`}
              >
                Thể loại
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openDropdown === 'genre' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openDropdown === 'genre' && (
                <div className="absolute top-full left-0 mt-3 w-[480px] rounded-xl border border-white/10 bg-[#14141A]/95 p-4 shadow-2xl backdrop-blur-xl">
                  <div className="grid grid-cols-3 gap-1.5">
                    {genres.map((genre) => (
                      <Link
                        key={genre.slug}
                        href={`/the-loai/${genre.slug}`}
                        onClick={() => setOpenDropdown(null)}
                        className="rounded-lg px-2.5 py-2 text-xs font-medium text-[#F2F2F5] transition hover:bg-white/10 hover:text-[#E50914]"
                      >
                        {genre.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Mega-menu Quốc gia */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setOpenDropdown((cur) => (cur === 'country' ? null : 'country'))}
                aria-expanded={openDropdown === 'country'}
                className={`inline-flex items-center gap-1 py-1 text-sm font-medium transition ${
                  openDropdown === 'country' || pathname.startsWith('/quoc-gia/')
                    ? 'text-white'
                    : 'text-[#9A9AA8] hover:text-white'
                }`}
              >
                Quốc gia
                <ChevronDown
                  className={`h-4 w-4 transition-transform ${
                    openDropdown === 'country' ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {openDropdown === 'country' && (
                <div className="absolute top-full left-0 mt-3 w-[460px] rounded-xl border border-white/10 bg-[#14141A]/95 p-4 shadow-2xl backdrop-blur-xl">
                  <div className="grid max-h-[340px] grid-cols-3 gap-1.5 overflow-y-auto pr-1">
                    {countries.map((country) => (
                      <Link
                        key={country.slug}
                        href={`/quoc-gia/${country.slug}`}
                        onClick={() => setOpenDropdown(null)}
                        className="rounded-lg px-2.5 py-2 text-xs font-medium text-[#F2F2F5] transition hover:bg-white/10 hover:text-[#E50914]"
                      >
                        {country.name}
                      </Link>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </nav>
        </div>

        {/* Tìm kiếm nhanh Command Palette & Danh sách của tôi */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          <HeaderSearch />

          <Link
            href="/#cua-toi"
            className="hidden items-center gap-1.5 rounded-full border border-white/10 bg-[#14141A]/80 px-3.5 py-1.5 text-xs font-semibold text-[#F2F2F5] transition hover:border-white/25 hover:bg-[#1E1E26] sm:inline-flex"
          >
            <Bookmark className="h-3.5 w-3.5 text-[#E50914]" />
            <span>Của tôi</span>
          </Link>

          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-[#14141A] text-white lg:hidden"
          >
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Menu mở rộng trên di động */}
      {isMobileMenuOpen && (
        <nav
          aria-label="Điều hướng di động"
          className="max-h-[75vh] overflow-y-auto border-t border-white/10 bg-[#0A0A0D] px-4 py-4 lg:hidden"
        >
          <div className="grid grid-cols-2 gap-2">
            {CATEGORY_CONFIG.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`rounded-lg px-3 py-2.5 text-sm font-semibold transition ${
                  pathname.startsWith(item.href)
                    ? 'bg-[#E50914] text-white'
                    : 'border border-white/10 bg-[#14141A] text-[#F2F2F5]'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold tracking-wider text-[#9A9AA8] uppercase">
              Thể loại nổi bật
            </p>
            <div className="flex flex-wrap gap-1.5">
              {genres.slice(0, 12).map((genre) => (
                <Link
                  key={genre.slug}
                  href={`/the-loai/${genre.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full border border-white/10 bg-[#14141A] px-3 py-1.5 text-xs text-[#F2F2F5]"
                >
                  {genre.name}
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-5">
            <p className="mb-2 text-xs font-semibold tracking-wider text-[#9A9AA8] uppercase">
              Quốc gia
            </p>
            <div className="flex flex-wrap gap-1.5">
              {countries.slice(0, 10).map((country) => (
                <Link
                  key={country.slug}
                  href={`/quoc-gia/${country.slug}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="rounded-full border border-white/10 bg-[#14141A] px-3 py-1.5 text-xs text-[#F2F2F5]"
                >
                  {country.name}
                </Link>
              ))}
            </div>
          </div>
        </nav>
      )}
    </header>
  );
}

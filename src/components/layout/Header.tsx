'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, User } from 'lucide-react';
import HeaderSearch from './HeaderSearch';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors duration-500 select-none ${
        isScrolled ? 'bg-background' : 'bg-transparent bg-linear-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex h-[68px] items-center justify-between px-4 md:px-[4%]">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="text-netflix text-[1.8rem] font-bold tracking-tighter transition-transform hover:scale-105"
          >
            NETFLIX
          </Link>
          <nav className="hidden gap-5 text-[14px] font-medium text-[#e5e5e5] lg:flex">
            <Link href="/" className="transition hover:text-gray-300 hover:transition-colors">
              Trang Chủ
            </Link>
            <Link
              href="/danh-sach/phim-bo"
              className="transition hover:text-gray-300 hover:transition-colors"
            >
              Phim Bộ
            </Link>
            <Link
              href="/danh-sach/phim-le"
              className="transition hover:text-gray-300 hover:transition-colors"
            >
              Phim Lẻ
            </Link>
            <Link
              href="/danh-sach/hoat-hinh"
              className="transition hover:text-gray-300 hover:transition-colors"
            >
              Hoạt Hình
            </Link>
            <Link
              href="/danh-sach/tv-shows"
              className="transition hover:text-gray-300 hover:transition-colors"
            >
              TV Shows
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-6 text-white">
          <HeaderSearch />
          <Bell className="hidden h-5 w-5 cursor-pointer transition hover:text-gray-300 sm:block" />
          <div className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded border border-transparent bg-blue-600 shadow-md hover:border-gray-500">
            <User className="mt-1 h-6 w-6 text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}

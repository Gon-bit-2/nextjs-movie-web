'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Bell, Menu, User, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import HeaderSearch from './HeaderSearch';
import { CATEGORY_CONFIG } from '@/config/navigation';

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [{ href: '/', label: 'Trang chủ' }, ...CATEGORY_CONFIG.slice(1)];

  return (
    <header
      className={`fixed top-0 z-50 w-full transition-colors duration-500 select-none ${
        isScrolled || isMobileMenuOpen
          ? 'bg-background/95 backdrop-blur-md'
          : 'bg-transparent bg-linear-to-b from-black/80 to-transparent'
      }`}
    >
      <div className="flex h-[68px] items-center justify-between px-4 md:px-[4%]">
        <div className="flex items-center gap-10">
          <Link
            href="/"
            className="text-netflix text-[1.8rem] font-black tracking-tight transition-transform hover:scale-105"
          >
            PHIMHAY
          </Link>
          <nav className="hidden gap-5 text-[14px] font-medium text-[#e5e5e5] lg:flex">
            {navItems.map((item) => {
              const isActive =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`transition-colors hover:text-white ${
                    isActive ? 'font-bold text-white' : 'text-gray-300'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-6 text-white">
          <HeaderSearch />
          <Bell className="hidden h-5 w-5 cursor-pointer transition hover:text-gray-300 sm:block" />
          <div className="flex h-8 w-8 cursor-pointer items-center justify-center overflow-hidden rounded border border-transparent bg-blue-600 shadow-md hover:border-gray-500">
            <User className="mt-1 h-6 w-6 text-white" />
          </div>
          <button
            type="button"
            aria-label={isMobileMenuOpen ? 'Đóng menu' : 'Mở menu'}
            className="lg:hidden"
            onClick={() => setIsMobileMenuOpen((value) => !value)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <nav className="border-t border-white/10 bg-[#141414] px-4 py-4 shadow-2xl lg:hidden">
          <div className="grid gap-2">
            {navItems.map((item) => {
              const isActive =
                item.href === '/' ? pathname === '/' : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`rounded-md px-3 py-3 text-sm font-semibold transition-colors ${
                    isActive ? 'bg-white text-black' : 'text-gray-200 hover:bg-white/10'
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}

'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Bookmark, Compass, Home, PlayCircle } from 'lucide-react';
import { usePersonalization } from '@/hooks/usePersonalization';

/**
 * Thanh điều hướng dưới đáy màn hình dành riêng cho thiết bị di động (< 1024px)
 */
export default function MobileBottomNav() {
  const pathname = usePathname();
  const { watchProgress } = usePersonalization();

  // Không hiện bottom-nav khi đang xem video toàn tập trung
  if (pathname.startsWith('/xem-phim/')) {
    return null;
  }

  const latestWatch = watchProgress[0];
  const watchHref = latestWatch
    ? `/xem-phim/${latestWatch.slug}?tap=${latestWatch.episodeIndex + 1}${
        latestWatch.serverIndex !== undefined ? `&server=${latestWatch.serverIndex + 1}` : ''
      }`
    : '/danh-sach/phim-chieu-rap';

  const items = [
    { href: '/', label: 'Trang chủ', icon: Home, active: pathname === '/' },
    {
      href: '/danh-sach/phim-moi',
      label: 'Khám phá',
      icon: Compass,
      active:
        pathname.startsWith('/danh-sach/') ||
        pathname.startsWith('/the-loai/') ||
        pathname.startsWith('/quoc-gia/') ||
        pathname.startsWith('/nam/'),
    },
    {
      href: watchHref,
      label: latestWatch ? 'Xem tiếp' : 'Chiếu rạp',
      icon: PlayCircle,
      active: false,
    },
    { href: '/#cua-toi', label: 'Của tôi', icon: Bookmark, active: false },
  ];

  return (
    <nav
      aria-label="Điều hướng nhanh di động"
      className="fixed right-0 bottom-0 left-0 z-50 border-t border-white/10 bg-[#0A0A0D]/92 backdrop-blur-xl lg:hidden"
    >
      <div className="grid h-16 grid-cols-4">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.label}
              href={item.href}
              className={`flex flex-col items-center justify-center gap-1 text-[11px] font-medium transition ${
                item.active ? 'text-[#E50914]' : 'text-[#9A9AA8] hover:text-white'
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

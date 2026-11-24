import Link from 'next/link';
import { ChevronRight, Home } from 'lucide-react';
import type { BreadcrumbItem } from '@/types';

interface BreadcrumbProps {
  items?: BreadcrumbItem[];
  currentLabel?: string;
}

/**
 * Chuẩn hóa đường dẫn slug trả về từ breadCrumb API v1 thành route hợp lệ trong Next.js
 */
function normalizeCrumbHref(slug?: string): string | null {
  if (!slug) return null;
  if (slug.startsWith('/')) return slug;
  return `/${slug}`;
}

/**
 * Thanh điều hướng phân cấp (Breadcrumb) dựa trên dữ liệu breadCrumb từ API v1
 */
export default function Breadcrumb({ items = [], currentLabel }: BreadcrumbProps) {
  const validItems = items.filter((item) => item.name);

  return (
    <nav aria-label="Đường dẫn trang" className="mb-4 flex flex-wrap items-center gap-1.5 text-xs text-[#9A9AA8]">
      <Link href="/" className="inline-flex items-center gap-1 transition hover:text-white">
        <Home className="h-3.5 w-3.5" />
        <span>Trang chủ</span>
      </Link>

      {validItems.map((item, idx) => {
        const href = !item.isCurrent ? normalizeCrumbHref(item.slug) : null;
        return (
          <span key={`${item.name}-${idx}`} className="inline-flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-white/30" />
            {href ? (
              <Link href={href} className="transition hover:text-white">
                {item.name}
              </Link>
            ) : (
              <span className="font-medium text-[#F2F2F5]">{item.name}</span>
            )}
          </span>
        );
      })}

      {validItems.length === 0 && currentLabel && (
        <span className="inline-flex items-center gap-1.5">
          <ChevronRight className="h-3.5 w-3.5 text-white/30" />
          <span className="font-medium text-[#F2F2F5]">{currentLabel}</span>
        </span>
      )}
    </nav>
  );
}

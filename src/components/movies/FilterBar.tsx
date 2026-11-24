'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { SlidersHorizontal, X } from 'lucide-react';
import type { ListFilters, Taxonomy } from '@/types';
import { LANG_OPTIONS, SORT_OPTIONS } from '@/config/navigation';
import { buildFilteredHref } from '@/lib/services/filters';

interface FilterBarProps {
  basePath: string;
  filters: ListFilters;
  genres: Taxonomy[];
  countries: Taxonomy[];
  years: number[];
  /** Ẩn các ô lọc đã cố định bởi chính route hiện tại */
  hideGenre?: boolean;
  hideCountry?: boolean;
  hideYear?: boolean;
  extraParams?: Record<string, string | undefined>;
}

/**
 * Thanh bộ lọc đa tiêu chí đồng bộ trực tiếp với query string để lọc và sắp xếp phía server
 */
export default function FilterBar({
  basePath,
  filters,
  genres,
  countries,
  years,
  hideGenre = false,
  hideCountry = false,
  hideYear = false,
  extraParams,
}: FilterBarProps) {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);

  /**
   * Cập nhật một phần bộ lọc và điều hướng sang URL mới
   */
  const applyFilters = (patch: Partial<ListFilters>) => {
    const next: ListFilters = { ...filters, ...patch };
    router.push(buildFilteredHref(basePath, next, extraParams));
  };

  /**
   * Xóa toàn bộ bộ lọc đang áp dụng
   */
  const clearAll = () => {
    router.push(buildFilteredHref(basePath, {}, extraParams));
    setMobileOpen(false);
  };

  const currentSortValue =
    filters.sort_field && filters.sort_type
      ? `${filters.sort_field}:${filters.sort_type}`
      : 'modified.time:desc';

  const activeChips: { key: keyof ListFilters; label: string }[] = [];
  if (!hideGenre && filters.category) {
    const label = genres.find((g) => g.slug === filters.category)?.name ?? filters.category;
    activeChips.push({ key: 'category', label });
  }
  if (!hideCountry && filters.country) {
    const label = countries.find((c) => c.slug === filters.country)?.name ?? filters.country;
    activeChips.push({ key: 'country', label });
  }
  if (!hideYear && filters.year) {
    activeChips.push({ key: 'year', label: `Năm ${filters.year}` });
  }
  if (filters.sort_lang) {
    const label =
      LANG_OPTIONS.find((opt) => opt.value === filters.sort_lang)?.label ?? filters.sort_lang;
    activeChips.push({ key: 'sort_lang', label });
  }

  const selectClass =
    'rounded-lg border border-white/12 bg-[#14141A] px-3 py-2 text-xs font-medium text-[#F2F2F5] transition hover:border-white/25 focus:border-[#E50914] focus:outline-none';

  const filterSelects = (
    <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:flex lg:flex-wrap lg:items-center">
      {!hideGenre && (
        <select
          aria-label="Lọc theo thể loại"
          value={filters.category ?? ''}
          onChange={(e) => applyFilters({ category: e.target.value || undefined })}
          className={selectClass}
        >
          <option value="">Tất cả thể loại</option>
          {genres.map((genre) => (
            <option key={genre.slug} value={genre.slug}>
              {genre.name}
            </option>
          ))}
        </select>
      )}

      {!hideCountry && (
        <select
          aria-label="Lọc theo quốc gia"
          value={filters.country ?? ''}
          onChange={(e) => applyFilters({ country: e.target.value || undefined })}
          className={selectClass}
        >
          <option value="">Tất cả quốc gia</option>
          {countries.map((country) => (
            <option key={country.slug} value={country.slug}>
              {country.name}
            </option>
          ))}
        </select>
      )}

      {!hideYear && (
        <select
          aria-label="Lọc theo năm phát hành"
          value={filters.year ?? ''}
          onChange={(e) => applyFilters({ year: e.target.value || undefined })}
          className={selectClass}
        >
          <option value="">Tất cả năm</option>
          {years.slice(0, 35).map((year) => (
            <option key={year} value={String(year)}>
              {year}
            </option>
          ))}
        </select>
      )}

      <select
        aria-label="Lọc theo ngôn ngữ"
        value={filters.sort_lang ?? ''}
        onChange={(e) =>
          applyFilters({
            sort_lang: (e.target.value || undefined) as ListFilters['sort_lang'],
          })
        }
        className={selectClass}
      >
        {LANG_OPTIONS.map((opt) => (
          <option key={opt.value || 'all'} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      <select
        aria-label="Sắp xếp kết quả"
        value={currentSortValue}
        onChange={(e) => {
          const [field, type] = e.target.value.split(':');
          applyFilters({
            sort_field: field as ListFilters['sort_field'],
            sort_type: type as ListFilters['sort_type'],
          });
        }}
        className={selectClass}
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            Sắp xếp: {opt.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="sticky top-14 z-30 mb-6 rounded-xl border border-white/10 bg-[#0A0A0D]/90 p-3 backdrop-blur-xl md:top-[68px]">
      {/* Nút mở bộ lọc trên mobile */}
      <div className="flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((prev) => !prev)}
          className="inline-flex items-center gap-2 rounded-lg border border-white/15 bg-[#14141A] px-3.5 py-2 text-xs font-semibold text-white"
        >
          <SlidersHorizontal className="h-4 w-4 text-[#E50914]" />
          <span>Bộ lọc &amp; Sắp xếp</span>
          {activeChips.length > 0 && (
            <span className="rounded-full bg-[#E50914] px-1.5 py-0.5 text-[10px] text-white">
              {activeChips.length}
            </span>
          )}
        </button>

        {activeChips.length > 0 && (
          <button
            type="button"
            onClick={clearAll}
            className="text-xs font-medium text-[#9A9AA8] hover:text-[#E50914]"
          >
            Xóa bộ lọc
          </button>
        )}
      </div>

      {/* Bộ lọc Desktop luôn hiển thị */}
      <div className="hidden lg:block">{filterSelects}</div>

      {/* Bộ lọc mở rộng trên Mobile */}
      {mobileOpen && <div className="mt-3 border-t border-white/10 pt-3 lg:hidden">{filterSelects}</div>}

      {/* Hàng chip các tiêu chí đang lọc */}
      {activeChips.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 border-t border-white/10 pt-2.5">
          <span className="text-[11px] text-[#9A9AA8]">Đang lọc:</span>
          {activeChips.map((chip) => (
            <button
              key={chip.key}
              type="button"
              onClick={() => applyFilters({ [chip.key]: undefined })}
              className="inline-flex items-center gap-1 rounded-full border border-[#E50914]/40 bg-[#E50914]/15 px-2.5 py-1 text-xs font-medium text-[#ffb4aa] transition hover:bg-[#E50914]/25"
            >
              <span>{chip.label}</span>
              <X className="h-3 w-3" />
            </button>
          ))}
          <button
            type="button"
            onClick={clearAll}
            className="ml-1 text-xs font-semibold text-[#9A9AA8] transition hover:text-white"
          >
            Xóa tất cả
          </button>
        </div>
      )}
    </div>
  );
}

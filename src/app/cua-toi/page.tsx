import { Suspense } from 'react';
import type { Metadata } from 'next';
import LibraryView from '@/components/library/LibraryView';

export const metadata: Metadata = {
  title: 'Thư viện của tôi',
  description: 'Quản lý lịch sử đang xem, danh sách phim đã lưu, phim yêu thích và sao lưu dữ liệu.',
};

/**
 * Trang thư viện cá nhân (/cua-toi) bọc trong Suspense cho useSearchParams
 */
export default function MyLibraryPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto min-h-[80vh] max-w-[1600px] px-4 pt-24 md:px-8 xl:px-12">
          <div className="h-10 w-64 animate-pulse rounded bg-[#14141A]" />
        </div>
      }
    >
      <LibraryView />
    </Suspense>
  );
}

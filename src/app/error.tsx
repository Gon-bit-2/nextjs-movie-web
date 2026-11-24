'use client';

import Link from 'next/link';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

/**
 * Trang xử lý lỗi toàn cục phong cách Rạp chiếu đêm với nút thử lại và quay về trang chủ
 */
export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0D] px-4 pt-20 text-center">
      <div className="max-w-md rounded-2xl border border-white/10 bg-[#14141A] p-8">
        <AlertCircle className="mx-auto mb-4 h-12 w-12 text-[#E50914]" />
        <h1 className="font-display mb-2 text-2xl font-bold tracking-wide text-white uppercase">
          Không tải được nội dung
        </h1>
        <p className="mb-6 text-sm text-[#9A9AA8]">
          Kết nối dữ liệu phim tạm thời gián đoạn. Vui lòng thử tải lại hoặc quay về trang chủ.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-lg bg-[#E50914] px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#f40612]"
          >
            <RotateCcw className="h-4 w-4" />
            Thử lại
          </button>
          <Link
            href="/"
            className="rounded-lg border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
          >
            Về trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

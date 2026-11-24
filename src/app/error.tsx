'use client';

import Link from 'next/link';
import { AlertCircle, RotateCcw } from 'lucide-react';

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-20 text-center">
      <div className="max-w-md">
        <AlertCircle className="mx-auto mb-5 h-14 w-14 text-red-500" />
        <h1 className="mb-3 text-2xl font-bold text-white">Không tải được nội dung</h1>
        <p className="mb-6 text-gray-400">
          Dữ liệu phim có thể đang gián đoạn. Thử tải lại hoặc quay về trang chủ.
        </p>
        <div className="flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={reset}
            className="inline-flex items-center gap-2 rounded-md bg-white px-5 py-2.5 font-semibold text-black transition-colors hover:bg-white/80"
          >
            <RotateCcw className="h-4 w-4" />
            Thử lại
          </button>
          <Link
            href="/"
            className="rounded-md bg-white/10 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-white/20"
          >
            Trang chủ
          </Link>
        </div>
      </div>
    </div>
  );
}

import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 pt-20 text-center">
      <div className="max-w-md">
        <p className="mb-3 text-sm font-semibold uppercase tracking-[0.2em] text-red-500">404</p>
        <h1 className="mb-3 text-3xl font-bold text-white">Không tìm thấy phim</h1>
        <p className="mb-6 text-gray-400">
          Nội dung này có thể đã bị gỡ hoặc đường dẫn không còn đúng.
        </p>
        <Link
          href="/"
          className="inline-flex rounded-md bg-white px-5 py-2.5 font-semibold text-black transition-colors hover:bg-white/80"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { Search } from 'lucide-react';

/**
 * Trang 404 kèm ô tìm kiếm nhanh để người dùng tìm lại bộ phim mong muốn ngay lập tức
 */
export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0A0A0D] px-4 pt-20 text-center">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#14141A] p-8">
        <p className="font-display mb-2 text-sm font-semibold tracking-[0.25em] text-[#E50914] uppercase">
          404 · Không tìm thấy
        </p>
        <h1 className="font-display mb-2 text-3xl font-bold tracking-wide text-white uppercase">
          Phim này không tồn tại
        </h1>
        <p className="mb-6 text-sm text-[#9A9AA8]">
          Nội dung có thể đã được chuyển đường dẫn hoặc tạm gỡ. Hãy thử tìm kiếm bằng tên phim:
        </p>

        <form action="/tim-kiem" method="GET" className="relative mb-5">
          <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-[#9A9AA8]" />
          <input
            type="text"
            name="keyword"
            placeholder="Nhập tên phim cần tìm..."
            required
            className="w-full rounded-lg border border-white/15 bg-[#0A0A0D] py-2.5 pr-20 pl-10 text-sm text-white placeholder-[#9A9AA8] focus:border-[#E50914] focus:outline-none"
          />
          <button
            type="submit"
            className="absolute top-1 right-1 bottom-1 rounded-md bg-[#E50914] px-3.5 text-xs font-bold text-white transition hover:bg-[#f40612]"
          >
            Tìm
          </button>
        </form>

        <Link
          href="/"
          className="inline-flex rounded-lg border border-white/15 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-white/20"
        >
          Về trang chủ PHIMHAY
        </Link>
      </div>
    </div>
  );
}

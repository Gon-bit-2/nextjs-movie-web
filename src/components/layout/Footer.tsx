import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-gray-800 py-10 text-gray-400">
      <div className="mx-auto max-w-6xl px-6">
        <p className="mb-6">Bạn có câu hỏi? Liên hệ với chúng tôi.</p>
        <div className="grid grid-cols-2 gap-4 text-sm md:grid-cols-4">
          <Link href="#" className="hover:underline">
            Câu hỏi thường gặp
          </Link>
          <Link href="#" className="hover:underline">
            Trung tâm trợ giúp
          </Link>
          <Link href="#" className="hover:underline">
            Tài khoản
          </Link>
          <Link href="#" className="hover:underline">
            Trung tâm đa phương tiện
          </Link>
          <Link href="#" className="hover:underline">
            Quan hệ với nhà đầu tư
          </Link>
          <Link href="#" className="hover:underline">
            Việc làm
          </Link>
          <Link href="#" className="hover:underline">
            Các cách xem
          </Link>
          <Link href="#" className="hover:underline">
            Điều khoản sử dụng
          </Link>
          <Link href="#" className="hover:underline">
            Quyền riêng tư
          </Link>
          <Link href="#" className="hover:underline">
            Tùy chọn cookie
          </Link>
          <Link href="#" className="hover:underline">
            Thông tin doanh nghiệp
          </Link>
          <Link href="#" className="hover:underline">
            Liên hệ với chúng tôi
          </Link>
        </div>
        <p className="mt-8 text-xs">Netflix Clone By PhimAPI</p>
      </div>
    </footer>
  );
}

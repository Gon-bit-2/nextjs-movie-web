# PHIMHAY — Rạp chiếu đêm trực tuyến

Ứng dụng xem phim trực tuyến xây dựng trên **Next.js 16 (App Router)**, **React 19**, **Tailwind CSS v4**, dữ liệu **KKPhim API v1** và trình phát **Vidstack + hls.js** tối ưu cho phim theo yêu cầu (VOD).

## Tính năng chính

- **Trình phát phim mượt (Vidstack + hls.js VOD):**
  - Tắt `lowLatencyMode`, bật Web Worker, `capLevelToPlayerSize`, đệm trước `30–120s`, mở sẵn kết nối (`preconnect`) và tải trước playlist `.m3u8` tập kế tiếp ở mốc 85%.
  - Đổi tập / đổi server **không tải lại trang**, tự nhớ tốc độ phát & âm lượng (`storage="phimhay-player"`), tự nhớ ngôn ngữ server ưa thích (Vietsub / Thuyết minh / Lồng tiếng).
  - Nút **Bỏ qua intro (+85s)**, **Chia sẻ mốc thời gian** (`?t=...`), **Tự chuyển tập**, **Tắt đèn**, **Chế độ rạp**, phím tắt (`?`), và tự dự phòng sang trình phát nhúng (`player.phimapi.com`) khi luồng HLS gặp sự cố.
- **Dữ liệu KKPhim API v1:** Trang chủ `/v1/api/home`, chi tiết `/v1/api/phim/{slug}`, diễn viên TMDB `/peoples`, ảnh nền HD `/images`, từ khóa `/keywords`, lọc đa tiêu chí phía server (Thể loại, Quốc gia, Năm đơn & Khoảng năm, Ngôn ngữ, Sắp xếp).
- **Thư viện cá nhân (`/cua-toi`):** Quản lý 3 mục *Đang xem*, *Đã lưu*, *Đã thích* kèm **Xuất / Nhập tệp sao lưu JSON** đồng bộ thủ công giữa các thiết bị.
- **PWA & SEO:** Hỗ trợ cài đặt lên màn hình chính điện thoại (`manifest.ts`, `icon.tsx`, `apple-icon.tsx`), JSON-LD `Movie`/`TVSeries` cho Google Rich Results, `sitemap.xml` và `robots.txt` động.

## Biến môi trường

Tạo tệp `.env.local` (tùy chọn khi phát triển nội bộ, khuyến nghị khai báo khi deploy production):

```env
NEXT_PUBLIC_SITE_URL=https://ten-mien-cua-ban.com
```

Nếu không cấu hình, ứng dụng mặc định dùng `http://localhost:3000`.

## Lệnh phát triển

```bash
npm install        # Cài đặt phụ thuộc
npm run dev        # Chạy server phát triển tại http://localhost:3000
npm run lint       # Kiểm tra ESLint
npm run lint:strict # Kiểm tra ESLint nghiêm ngặt (0 cảnh báo)
npm test           # Chạy toàn bộ unit test (Vitest)
npm run test:watch # Chạy Vitest ở chế độ theo dõi thay đổi
npm run build      # Biên dịch bản production
```

## Cấu trúc thư mục chính

```text
src/
├── app/                   # App Router pages, API sitemap/robots/manifest/icons, server actions
├── components/
│   ├── common/            # MovieCard, HorizontalRail (kéo chuột + nút mũi tên), LoadMore, Breadcrumb
│   ├── layout/            # Header (mega-menu + Command Palette), MobileBottomNav, Footer
│   ├── library/           # LibraryView cho trang /cua-toi
│   ├── movies/            # HeroBanner, TopTenRow, MovieRow, FilterBar, CastList, LiteYouTube...
│   ├── player/            # Toàn bộ mã trình phát Vidstack & WatchExperience (cô lập gọn trong 1 thư mục)
│   └── seo/               # MovieJsonLd (Schema.org)
├── config/                # Danh mục điều hướng và tùy chọn lọc/sắp xếp
├── hooks/                 # usePersonalization (useSyncExternalStore)
├── lib/
│   ├── config/            # getSiteUrl()
│   ├── player/            # Chuẩn hóa và chọn server theo ngôn ngữ ưa thích
│   ├── services/          # movie.ts, normalize.ts, filters.ts + unit tests
│   └── storage/           # movie-personalization.ts, backup.ts + unit tests
└── types/                 # Định nghĩa TypeScript cho API v1 và dữ liệu cá nhân hóa
```

## Lưu ý kỹ thuật

- **Trình phát `@vidstack/react`:** Phiên bản `1.15.7` hiện ở chế độ bảo trì vá lỗi bảo mật đến **tháng 01/2028**; hướng nâng cấp dài hạn được tác giả khuyến nghị là **Video.js 10**. Toàn bộ logic trình phát đã được cô lập trong thư mục `src/components/player/` nên khi cần chuyển đổi về sau sẽ không ảnh hưởng các trang khác.

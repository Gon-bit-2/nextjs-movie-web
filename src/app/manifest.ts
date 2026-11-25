import type { MetadataRoute } from 'next';

/**
 * Khai báo Web App Manifest cho phép cài PHIMHAY lên màn hình chính điện thoại như ứng dụng gốc
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'PHIMHAY - Rạp chiếu đêm trực tuyến',
    short_name: 'PHIMHAY',
    description:
      'Xem phim trực tuyến mượt mà chất lượng cao Full HD, Vietsub, Thuyết minh, Lồng tiếng cập nhật mỗi ngày.',
    start_url: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0A0A0D',
    theme_color: '#0A0A0D',
    lang: 'vi',
    icons: [
      {
        src: '/icon?size=192',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon?size=512',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Tiếp tục xem',
        short_name: 'Đang xem',
        url: '/cua-toi?tab=dang-xem',
      },
      {
        name: 'Phim mới cập nhật',
        short_name: 'Phim mới',
        url: '/danh-sach/phim-moi',
      },
    ],
  };
}

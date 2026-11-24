import type { CategoryConfig, GenreConfig } from '@/types';

/**
 * Danh sách các danh mục chính hiển thị trên thanh điều hướng
 */
export const CATEGORY_CONFIG: CategoryConfig[] = [
  { slug: 'phim-moi', label: 'Phim mới', href: '/danh-sach/phim-moi' },
  { slug: 'phim-bo', label: 'Phim bộ', href: '/danh-sach/phim-bo' },
  { slug: 'phim-le', label: 'Phim lẻ', href: '/danh-sach/phim-le' },
  { slug: 'hoat-hinh', label: 'Hoạt hình', href: '/danh-sach/hoat-hinh' },
  { slug: 'tv-shows', label: 'TV Shows', href: '/danh-sach/tv-shows' },
  { slug: 'phim-chieu-rap', label: 'Chiếu rạp', href: '/danh-sach/phim-chieu-rap' },
];

/**
 * Danh sách thể loại dự phòng khi API tạm thời không phản hồi
 */
export const FALLBACK_GENRES: GenreConfig[] = [
  { slug: 'hanh-dong', label: 'Hành động' },
  { slug: 'tinh-cam', label: 'Tình cảm' },
  { slug: 'hai-huoc', label: 'Hài hước' },
  { slug: 'co-trang', label: 'Cổ trang' },
  { slug: 'tam-ly', label: 'Tâm lý' },
  { slug: 'kinh-di', label: 'Kinh dị' },
  { slug: 'vien-tuong', label: 'Viễn tưởng' },
  { slug: 'hinh-su', label: 'Hình sự' },
  { slug: 'phieu-luu', label: 'Phiêu lưu' },
  { slug: 'vo-thuat', label: 'Võ thuật' },
  { slug: 'gia-dinh', label: 'Gia đình' },
  { slug: 'chinh-kich', label: 'Chính kịch' },
];

/**
 * Danh sách quốc gia phổ biến dùng làm gợi ý nhanh và dự phòng
 */
export const FEATURED_COUNTRIES: GenreConfig[] = [
  { slug: 'han-quoc', label: 'Hàn Quốc' },
  { slug: 'trung-quoc', label: 'Trung Quốc' },
  { slug: 'au-my', label: 'Âu Mỹ' },
  { slug: 'nhat-ban', label: 'Nhật Bản' },
  { slug: 'thai-lan', label: 'Thái Lan' },
  { slug: 'viet-nam', label: 'Việt Nam' },
  { slug: 'anh', label: 'Anh' },
  { slug: 'dai-loan', label: 'Đài Loan' },
];

/**
 * Các tùy chọn ngôn ngữ hỗ trợ lọc ở API v1
 */
export const LANG_OPTIONS = [
  { value: '', label: 'Tất cả ngôn ngữ' },
  { value: 'vietsub', label: 'Vietsub' },
  { value: 'thuyet-minh', label: 'Thuyết minh' },
  { value: 'long-tieng', label: 'Lồng tiếng' },
] as const;

/**
 * Các tùy chọn sắp xếp được hỗ trợ bởi API v1
 */
export const SORT_OPTIONS = [
  { value: 'modified.time:desc', label: 'Mới cập nhật' },
  { value: 'year:desc', label: 'Năm mới nhất' },
  { value: 'year:asc', label: 'Năm cũ nhất' },
  { value: '_id:desc', label: 'Mới đăng tải' },
] as const;

/**
 * Trả về tên hiển thị tiếng Việt của một danh mục theo slug
 */
export function getCategoryLabel(slug: string): string {
  return CATEGORY_CONFIG.find((category) => category.slug === slug)?.label ?? slug.replace(/-/g, ' ');
}

/**
 * Trả về tên hiển thị tiếng Việt dự phòng của một thể loại theo slug
 */
export function getGenreLabel(slug: string): string {
  return FALLBACK_GENRES.find((genre) => genre.slug === slug)?.label ?? slug.replace(/-/g, ' ');
}

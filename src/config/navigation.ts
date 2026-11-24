import type { CategoryConfig, GenreConfig } from '@/types';

export const CATEGORY_CONFIG: CategoryConfig[] = [
  { slug: 'phim-moi', label: 'Phim mới', href: '/danh-sach/phim-moi' },
  { slug: 'phim-bo', label: 'Phim bộ', href: '/danh-sach/phim-bo' },
  { slug: 'phim-le', label: 'Phim lẻ', href: '/danh-sach/phim-le' },
  { slug: 'hoat-hinh', label: 'Hoạt hình', href: '/danh-sach/hoat-hinh' },
  { slug: 'tv-shows', label: 'TV Shows', href: '/danh-sach/tv-shows' },
];

export const GENRE_CONFIG: GenreConfig[] = [
  { slug: 'hanh-dong', label: 'Hành động' },
  { slug: 'tinh-cam', label: 'Tình cảm' },
  { slug: 'hai-huoc', label: 'Hài hước' },
  { slug: 'co-trang', label: 'Cổ trang' },
  { slug: 'tam-ly', label: 'Tâm lý' },
  { slug: 'kinh-di', label: 'Kinh dị' },
  { slug: 'khoa-hoc-vien-tuong', label: 'Viễn tưởng' },
  { slug: 'hinh-su', label: 'Hình sự' },
  { slug: 'phieu-luu', label: 'Phiêu lưu' },
  { slug: 'vo-thuat', label: 'Võ thuật' },
  { slug: 'gia-dinh', label: 'Gia đình' },
  { slug: 'the-thao', label: 'Thể thao' },
];

export function getCategoryLabel(slug: string): string {
  return CATEGORY_CONFIG.find((category) => category.slug === slug)?.label ?? slug.replace(/-/g, ' ');
}

export function getGenreLabel(slug: string): string {
  return GENRE_CONFIG.find((genre) => genre.slug === slug)?.label ?? slug.replace(/-/g, ' ');
}

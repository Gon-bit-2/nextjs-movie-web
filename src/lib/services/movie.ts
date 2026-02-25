import { ApiListResponse, ApiDetailResponse } from '@/types';

const API_DOMAIN = 'https://phimapi.com';
export const IMAGE_DOMAIN = 'https://phimimg.com';

export function getImageUrl(path: string | undefined): string {
  if (!path) return '';
  // Nếu đã là link đầy đủ thì trả về nguyên bản
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${IMAGE_DOMAIN}/${cleanPath}`;
}

/**
 * Lấy danh sách phim mới cập nhật (dành cho Home Banner/Row)
 */
export async function getNewMovies(page: number = 1): Promise<ApiListResponse | null> {
  try {
    const res = await fetch(`${API_DOMAIN}/danh-sach/phim-moi-cap-nhat?page=${page}`, {
      next: { revalidate: 3600 }, // Cache 1 giờ
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error('Lỗi khi fetch phim mới cập nhật:', error);
    return null;
  }
}

/**
 * Lấy danh sách phim theo danh mục (phim-bo, phim-le, hoat-hinh, etc.)
 */
export async function getMoviesByCategory(
  categorySlug: string,
  page: number = 1,
): Promise<ApiListResponse | null> {
  try {
    const res = await fetch(`${API_DOMAIN}/v1/api/danh-sach/${categorySlug}?page=${page}`, {
      next: { revalidate: 3600 },
    });
    // phimapi.com sử dụng v1/api/danh-sach/... cho các list thể loại
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data; // tuỳ biến theo format trả về
  } catch (error) {
    console.error(`Lỗi khi fetch danh mục ${categorySlug}:`, error);
    return null;
  }
}

/**
 * Lấy danh sách phim theo thể loại (hanh-dong, tinh-cam, etc.)
 */
export async function getMoviesByGenre(
  genreSlug: string,
  page: number = 1,
): Promise<ApiListResponse | null> {
  try {
    const res = await fetch(`${API_DOMAIN}/v1/api/the-loai/${genreSlug}?page=${page}`, {
      next: { revalidate: 3600 },
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data; // tuỳ biến theo format trả về
  } catch (error) {
    console.error(`Lỗi khi fetch thể loại ${genreSlug}:`, error);
    return null;
  }
}

/**
 * Lấy chi tiết phim
 */
export async function getMovieDetail(slug: string): Promise<ApiDetailResponse | null> {
  try {
    const res = await fetch(`${API_DOMAIN}/phim/${slug}`, {
      next: { revalidate: 86400 }, // Cache 24h cho chi tiết ít đổi
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (error) {
    console.error(`Lỗi khi fetch phim ${slug}:`, error);
    return null;
  }
}

/**
 * Tìm kiếm phim theo keyword
 */
export async function searchMovies(
  keyword: string,
  limit: number = 24,
  page: number = 1,
): Promise<ApiListResponse | null> {
  if (!keyword) return null;
  try {
    const res = await fetch(
      `${API_DOMAIN}/v1/api/tim-kiem?keyword=${encodeURIComponent(keyword)}&limit=${limit}&page=${page}`,
      {
        next: { revalidate: 300 }, // Cache 5 phút cho search
      },
    );
    if (!res.ok) return null;
    const data = await res.json();
    return data.data || data;
  } catch (error) {
    console.error(`Lỗi khi tìm kiếm ${keyword}:`, error);
    return null;
  }
}

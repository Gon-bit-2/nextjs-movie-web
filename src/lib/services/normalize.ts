import type {
  ApiDetailResponse,
  ApiListResponse,
  BreadcrumbItem,
  Episode,
  Movie,
  MovieDetail,
  Pagination,
  SeoOnPage,
} from '@/types';

export const IMAGE_DOMAIN = 'https://phimimg.com';

export interface RawListPayload {
  status?: boolean | string;
  items?: Movie[];
  pagination?: Pagination;
  pathImage?: string;
  titlePage?: string;
  breadCrumb?: BreadcrumbItem[];
  seoOnPage?: SeoOnPage;
  APP_DOMAIN_CDN_IMAGE?: string;
  params?: {
    pagination?: Pagination;
    itemsUpdateInDay?: number;
  };
}

export interface RawListResponse extends RawListPayload {
  data?: RawListPayload;
}

export interface RawDetailResponse {
  status?: boolean | string;
  msg?: string;
  message?: string;
  movie?: MovieDetail;
  episodes?: Episode[];
  episode?: Episode[];
  data?: {
    item?: MovieDetail & { episodes?: Episode[] };
    seoOnPage?: SeoOnPage;
    breadCrumb?: BreadcrumbItem[];
  };
}

/**
 * Chuẩn hóa đường dẫn ảnh từ API KKPhim (hỗ trợ cả URL đầy đủ và đường dẫn tương đối)
 */
export function getImageUrl(path: string | undefined, cdnDomain: string = IMAGE_DOMAIN): string {
  if (!path) return '';
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  const cleanDomain = cdnDomain.replace(/\/+$/, '');
  const cleanPath = path.replace(/^\/+/, '');
  return `${cleanDomain}/${cleanPath}`;
}

/**
 * Ghép đường dẫn ảnh từ TMDB (dùng cho diễn viên và thư viện hình ảnh HD)
 */
export function getTmdbImageUrl(filePath: string | null | undefined, baseUrl: string): string {
  if (!filePath) return '';
  if (filePath.startsWith('http://') || filePath.startsWith('https://')) return filePath;
  const cleanBase = baseUrl.replace(/\/+$/, '');
  const cleanFile = filePath.startsWith('/') ? filePath : `/${filePath}`;
  return `${cleanBase}${cleanFile}`;
}

/**
 * Trích xuất điểm đánh giá hiển thị (ưu tiên IMDb, dự phòng TMDB)
 */
export function getMovieScore(movie: Pick<Movie, 'imdb' | 'tmdb'>): number | null {
  const imdb = movie.imdb?.vote_average;
  if (typeof imdb === 'number' && imdb > 0) return Number(imdb.toFixed(1));
  const tmdb = movie.tmdb?.vote_average;
  if (typeof tmdb === 'number' && tmdb > 0) return Number(tmdb.toFixed(1));
  return null;
}

/**
 * Rút gọn nhãn ngôn ngữ hiển thị trên thẻ phim (Vietsub, Thuyết minh, Lồng tiếng)
 */
export function getShortLangLabel(lang?: string): string {
  if (!lang) return '';
  const lower = lang.toLowerCase();
  const hasVietsub = lower.includes('vietsub');
  const hasTm = lower.includes('thuyết minh');
  const hasLt = lower.includes('lồng tiếng');

  if (hasVietsub && hasTm) return 'VS + TM';
  if (hasVietsub && hasLt) return 'VS + LT';
  if (hasTm) return 'Thuyết minh';
  if (hasLt) return 'Lồng tiếng';
  if (hasVietsub) return 'Vietsub';
  return lang;
}

/**
 * Xác định trạng thái thành công từ API (hỗ trợ cả boolean true và chuỗi "success")
 */
export function isApiSuccess(status: boolean | string | undefined): boolean {
  return status === true || status === 'success';
}

/**
 * Chuẩn hóa đối tượng phân trang từ nhiều phiên bản API KKPhim
 */
export function normalizePagination(data: RawListResponse): Pagination | undefined {
  return data.pagination ?? data.data?.pagination ?? data.data?.params?.pagination;
}

/**
 * Chuẩn hóa dữ liệu danh sách phim trả về từ API v1 và v3 về cùng một cấu trúc ApiListResponse
 */
export function normalizeListResponse(data: RawListResponse | null): ApiListResponse | null {
  if (!data) return null;

  const source = data.data ?? data;
  const cdnDomain = source.APP_DOMAIN_CDN_IMAGE ?? IMAGE_DOMAIN;
  const rawItems = Array.isArray(source.items) ? source.items : [];

  const items: Movie[] = rawItems.map((item) => ({
    ...item,
    thumb_url: getImageUrl(item.thumb_url, cdnDomain),
    poster_url: getImageUrl(item.poster_url, cdnDomain),
  }));

  return {
    status: isApiSuccess(data.status) || isApiSuccess(source.status) || items.length > 0,
    items,
    pagination: normalizePagination(data),
    pathImage: source.pathImage ?? data.pathImage ?? cdnDomain,
    titlePage: source.titlePage ?? data.titlePage,
    breadCrumb: source.breadCrumb ?? data.breadCrumb,
    seoOnPage: source.seoOnPage ?? data.seoOnPage,
    itemsUpdateInDay: source.params?.itemsUpdateInDay,
  };
}

/**
 * Chuẩn hóa dữ liệu chi tiết phim (hỗ trợ cả Format v1 data.item và Format cũ movie/episodes)
 */
export function normalizeDetailResponse(data: RawDetailResponse | null): ApiDetailResponse | null {
  if (!data) return null;

  const itemV1 = data.data?.item;
  if (itemV1) {
    const episodes = Array.isArray(itemV1.episodes) ? itemV1.episodes : [];
    const movie: MovieDetail = {
      ...itemV1,
      thumb_url: getImageUrl(itemV1.thumb_url),
      poster_url: getImageUrl(itemV1.poster_url),
      actor: Array.isArray(itemV1.actor) ? itemV1.actor : [],
      director: Array.isArray(itemV1.director) ? itemV1.director : [],
      category: Array.isArray(itemV1.category) ? itemV1.category : [],
      country: Array.isArray(itemV1.country) ? itemV1.country : [],
    };

    return {
      status: isApiSuccess(data.status) || Boolean(movie._id),
      msg: data.msg ?? data.message ?? '',
      movie,
      episodes,
      servers: episodes,
      seoOnPage: data.data?.seoOnPage,
      breadCrumb: data.data?.breadCrumb,
    };
  }

  if (data.movie) {
    const episodes = Array.isArray(data.episodes) ? data.episodes : data.episode || [];
    const movie: MovieDetail = {
      ...data.movie,
      thumb_url: getImageUrl(data.movie.thumb_url),
      poster_url: getImageUrl(data.movie.poster_url),
      actor: Array.isArray(data.movie.actor) ? data.movie.actor : [],
      director: Array.isArray(data.movie.director) ? data.movie.director : [],
      category: Array.isArray(data.movie.category) ? data.movie.category : [],
      country: Array.isArray(data.movie.country) ? data.movie.country : [],
    };

    return {
      status: isApiSuccess(data.status),
      msg: data.msg ?? data.message ?? '',
      movie,
      episodes,
      servers: episodes,
    };
  }

  return null;
}

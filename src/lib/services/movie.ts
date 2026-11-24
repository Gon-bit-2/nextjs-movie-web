import type {
  ApiDetailResponse,
  ApiListResponse,
  BreadcrumbItem,
  Episode,
  ListFilters,
  Movie,
  MovieDetail,
  MovieImageAsset,
  MovieImagesResponse,
  MovieKeyword,
  MoviePeoplesResponse,
  Pagination,
  Person,
  SeoOnPage,
  Taxonomy,
} from '@/types';
import { buildApiFilterParams } from './filters';

const API_DOMAIN = 'https://phimapi.com';
export const IMAGE_DOMAIN = 'https://phimimg.com';
export const PLAYER_EMBED_BASE = 'https://player.phimapi.com/player/?url=';

const LIST_REVALIDATE_SECONDS = 1800; // 30 phút cho danh sách phim
const DETAIL_REVALIDATE_SECONDS = 3600; // 1 giờ cho chi tiết phim để kịp cập nhật tập mới
const TAXONOMY_REVALIDATE_SECONDS = 86400; // 24 giờ cho danh sách thể loại, quốc gia, năm
const SEARCH_REVALIDATE_SECONDS = 300; // 5 phút cho tìm kiếm

interface RawListPayload {
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

interface RawListResponse extends RawListPayload {
  data?: RawListPayload;
}

interface RawDetailResponse {
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

interface RawTaxonomyResponse {
  status?: boolean | string;
  data?: {
    items?: Taxonomy[];
  };
}

interface RawYearResponse {
  status?: boolean | string;
  data?: {
    items?: { year: number }[];
  };
}

interface RawPeoplesResponse {
  success?: boolean;
  data?: {
    profile_sizes?: {
      w185?: string;
      h632?: string;
      original?: string;
    };
    peoples?: Person[];
  };
}

interface RawImagesResponse {
  success?: boolean;
  data?: {
    image_sizes?: {
      backdrop?: {
        w1280?: string;
        w780?: string;
        original?: string;
      };
      poster?: {
        w500?: string;
        w342?: string;
        original?: string;
      };
    };
    images?: MovieImageAsset[];
  };
}

interface RawKeywordsResponse {
  success?: boolean;
  data?: {
    keywords?: MovieKeyword[];
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
function isApiSuccess(status: boolean | string | undefined): boolean {
  return status === true || status === 'success';
}

/**
 * Chuẩn hóa đối tượng phân trang từ nhiều phiên bản API KKPhim
 */
function normalizePagination(data: RawListResponse): Pagination | undefined {
  return data.pagination ?? data.data?.pagination ?? data.data?.params?.pagination;
}

/**
 * Chuẩn hóa dữ liệu danh sách phim trả về từ API v1 và v3 về cùng một cấu trúc ApiListResponse
 */
function normalizeListResponse(data: RawListResponse | null): ApiListResponse | null {
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
function normalizeDetailResponse(data: RawDetailResponse | null): ApiDetailResponse | null {
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

/**
 * Thực hiện fetch JSON kèm cấu hình cache Next.js và xử lý lỗi an toàn
 */
async function fetchJson<T>(url: string, revalidate: number, tags: string[]): Promise<T | null> {
  try {
    const res = await fetch(url, {
      next: { revalidate, tags },
      headers: { Accept: 'application/json' },
    });

    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (error) {
    console.error(`Lỗi khi gọi API ${url}:`, error);
    return null;
  }
}

/**
 * Lấy danh sách phim nổi bật trang chủ từ API mới /v1/api/home
 */
export async function getHomeMovies(): Promise<ApiListResponse | null> {
  const data = await fetchJson<RawListResponse>(
    `${API_DOMAIN}/v1/api/home`,
    LIST_REVALIDATE_SECONDS,
    ['movies', 'movies:home'],
  );
  return normalizeListResponse(data);
}

/**
 * Lấy danh sách phim mới cập nhật đầy đủ trường TMDB/IMDb (v3 hoặc v1 có lọc)
 */
export async function getNewMovies(
  page: number = 1,
  filters: ListFilters = {},
): Promise<ApiListResponse | null> {
  const hasFilters = Boolean(
    filters.category ||
      filters.country ||
      filters.year ||
      filters.sort_field ||
      filters.sort_type ||
      filters.sort_lang ||
      filters.limit,
  );

  if (hasFilters) {
    const params = buildApiFilterParams({ ...filters, page });
    const data = await fetchJson<RawListResponse>(
      `${API_DOMAIN}/v1/api/danh-sach?${params.toString()}`,
      LIST_REVALIDATE_SECONDS,
      ['movies', 'movies:new'],
    );
    return normalizeListResponse(data);
  }

  const data = await fetchJson<RawListResponse>(
    `${API_DOMAIN}/danh-sach/phim-moi-cap-nhat-v3?page=${page}`,
    LIST_REVALIDATE_SECONDS,
    ['movies', 'movies:new'],
  );
  return normalizeListResponse(data);
}

/**
 * Lấy danh sách phim theo danh mục (phim-moi, phim-bo, phim-le, hoat-hinh, tv-shows, phim-chieu-rap) kèm bộ lọc v1
 */
export async function getMoviesByCategory(
  categorySlug: string,
  page: number = 1,
  filters: ListFilters = {},
): Promise<ApiListResponse | null> {
  const params = buildApiFilterParams({ ...filters, page });
  const query = params.toString();

  const endpoint =
    categorySlug === 'phim-moi'
      ? `${API_DOMAIN}/v1/api/danh-sach${query ? `?${query}` : ''}`
      : `${API_DOMAIN}/v1/api/danh-sach/${categorySlug}${query ? `?${query}` : ''}`;

  const data = await fetchJson<RawListResponse>(endpoint, LIST_REVALIDATE_SECONDS, [
    'movies',
    `category:${categorySlug}`,
  ]);

  return normalizeListResponse(data);
}

/**
 * Lấy danh sách phim theo thể loại kèm bộ lọc và sắp xếp phía server
 */
export async function getMoviesByGenre(
  genreSlug: string,
  page: number = 1,
  filters: ListFilters = {},
): Promise<ApiListResponse | null> {
  const params = buildApiFilterParams({ ...filters, page });
  const data = await fetchJson<RawListResponse>(
    `${API_DOMAIN}/v1/api/the-loai/${genreSlug}?${params.toString()}`,
    LIST_REVALIDATE_SECONDS,
    ['movies', `genre:${genreSlug}`],
  );

  return normalizeListResponse(data);
}

/**
 * Lấy danh sách phim theo quốc gia kèm bộ lọc và sắp xếp phía server
 */
export async function getMoviesByCountry(
  countrySlug: string,
  page: number = 1,
  filters: ListFilters = {},
): Promise<ApiListResponse | null> {
  const params = buildApiFilterParams({ ...filters, page });
  const data = await fetchJson<RawListResponse>(
    `${API_DOMAIN}/v1/api/quoc-gia/${countrySlug}?${params.toString()}`,
    LIST_REVALIDATE_SECONDS,
    ['movies', `country:${countrySlug}`],
  );

  return normalizeListResponse(data);
}

/**
 * Lấy danh sách phim theo năm phát hành kèm bộ lọc và sắp xếp phía server
 */
export async function getMoviesByYear(
  year: string | number,
  page: number = 1,
  filters: ListFilters = {},
): Promise<ApiListResponse | null> {
  const params = buildApiFilterParams({ ...filters, page });
  const data = await fetchJson<RawListResponse>(
    `${API_DOMAIN}/v1/api/nam/${year}?${params.toString()}`,
    LIST_REVALIDATE_SECONDS,
    ['movies', `year:${year}`],
  );

  return normalizeListResponse(data);
}

/**
 * Lấy chi tiết một bộ phim từ API v1 (/v1/api/phim/{slug}), tự fallback sang /phim/{slug} nếu v1 lỗi
 */
export async function getMovieDetail(slug: string): Promise<ApiDetailResponse | null> {
  const v1Data = await fetchJson<RawDetailResponse>(
    `${API_DOMAIN}/v1/api/phim/${slug}`,
    DETAIL_REVALIDATE_SECONDS,
    ['movies', `movie:${slug}`],
  );

  const normalizedV1 = normalizeDetailResponse(v1Data);
  if (normalizedV1) return normalizedV1;

  const legacyData = await fetchJson<RawDetailResponse>(
    `${API_DOMAIN}/phim/${slug}`,
    DETAIL_REVALIDATE_SECONDS,
    ['movies', `movie:${slug}`],
  );

  return normalizeDetailResponse(legacyData);
}

/**
 * Lấy danh sách diễn viên và nhân sự kèm ảnh chân dung TMDB cho một bộ phim
 */
export async function getMoviePeoples(slug: string): Promise<MoviePeoplesResponse> {
  const data = await fetchJson<RawPeoplesResponse>(
    `${API_DOMAIN}/v1/api/phim/${slug}/peoples`,
    TAXONOMY_REVALIDATE_SECONDS,
    ['movies', `movie-peoples:${slug}`],
  );

  return {
    peoples: Array.isArray(data?.data?.peoples) ? data.data.peoples : [],
    profileBaseUrl: data?.data?.profile_sizes?.w185 ?? 'https://image.tmdb.org/t/p/w185',
  };
}

/**
 * Lấy danh sách hình ảnh backdrop & poster độ phân giải cao từ TMDB cho một bộ phim
 */
export async function getMovieImages(slug: string): Promise<MovieImagesResponse> {
  const data = await fetchJson<RawImagesResponse>(
    `${API_DOMAIN}/v1/api/phim/${slug}/images`,
    TAXONOMY_REVALIDATE_SECONDS,
    ['movies', `movie-images:${slug}`],
  );

  return {
    images: Array.isArray(data?.data?.images) ? data.data.images : [],
    backdropBaseUrl:
      data?.data?.image_sizes?.backdrop?.w1280 ?? 'https://image.tmdb.org/t/p/w1280',
    posterBaseUrl: data?.data?.image_sizes?.poster?.w500 ?? 'https://image.tmdb.org/t/p/w500',
  };
}

/**
 * Lấy danh sách từ khóa gắn với một bộ phim
 */
export async function getMovieKeywords(slug: string): Promise<MovieKeyword[]> {
  const data = await fetchJson<RawKeywordsResponse>(
    `${API_DOMAIN}/v1/api/phim/${slug}/keywords`,
    TAXONOMY_REVALIDATE_SECONDS,
    ['movies', `movie-keywords:${slug}`],
  );

  return Array.isArray(data?.data?.keywords) ? data.data.keywords : [];
}

/**
 * Lấy toàn bộ danh sách thể loại từ API v1 (/v1/api/the-loai)
 */
export async function getGenres(): Promise<Taxonomy[]> {
  const data = await fetchJson<RawTaxonomyResponse>(
    `${API_DOMAIN}/v1/api/the-loai`,
    TAXONOMY_REVALIDATE_SECONDS,
    ['taxonomy', 'genres'],
  );

  return Array.isArray(data?.data?.items) ? data.data.items : [];
}

/**
 * Lấy toàn bộ danh sách quốc gia từ API v1 (/v1/api/quoc-gia)
 */
export async function getCountries(): Promise<Taxonomy[]> {
  const data = await fetchJson<RawTaxonomyResponse>(
    `${API_DOMAIN}/v1/api/quoc-gia`,
    TAXONOMY_REVALIDATE_SECONDS,
    ['taxonomy', 'countries'],
  );

  return Array.isArray(data?.data?.items) ? data.data.items : [];
}

/**
 * Lấy danh sách năm phát hành từ API (/nam-phat-hanh vì bản v1 không tồn tại)
 */
export async function getYears(): Promise<number[]> {
  const data = await fetchJson<RawYearResponse>(
    `${API_DOMAIN}/nam-phat-hanh`,
    TAXONOMY_REVALIDATE_SECONDS,
    ['taxonomy', 'years'],
  );

  if (Array.isArray(data?.data?.items) && data.data.items.length > 0) {
    return data.data.items
      .map((item) => item.year)
      .filter((year): year is number => typeof year === 'number' && year >= 1950);
  }

  // Dự phòng tạo danh sách 20 năm gần nhất nếu API lỗi
  const currentYear = new Date().getFullYear();
  return Array.from({ length: 20 }, (_, i) => currentYear - i);
}

/**
 * Tìm kiếm phim theo từ khóa kèm bộ lọc mở rộng v1
 */
export async function searchMovies(
  keyword: string,
  limit: number = 24,
  page: number = 1,
  filters: ListFilters = {},
): Promise<ApiListResponse | null> {
  const cleanKeyword = keyword.trim();
  if (!cleanKeyword) return null;

  const params = buildApiFilterParams({ ...filters, limit, page });
  params.set('keyword', cleanKeyword);

  const data = await fetchJson<RawListResponse>(
    `${API_DOMAIN}/v1/api/tim-kiem?${params.toString()}`,
    SEARCH_REVALIDATE_SECONDS,
    ['movies', 'search'],
  );

  return normalizeListResponse(data);
}

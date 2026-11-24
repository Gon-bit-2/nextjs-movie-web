/**
 * Điểm đánh giá từ nguồn ngoài (IMDb / TMDB)
 */
export interface RatingInfo {
  id: string;
  vote_average: number;
  vote_count: number;
}

/**
 * Tham chiếu TMDB gắn kèm trên mỗi phim từ API v1
 */
export interface TmdbRef extends RatingInfo {
  type: 'movie' | 'tv' | string;
  season?: number | null;
}

/**
 * Thể loại hoặc quốc gia từ API KKPhim
 */
export interface Taxonomy {
  _id?: string;
  id?: string;
  name: string;
  slug: string;
}

/**
 * Mục breadcrumb trả về từ API v1
 */
export interface BreadcrumbItem {
  name: string;
  slug?: string;
  isCurrent?: boolean;
  position: number;
}

/**
 * Metadata SEO trả về trong khối seoOnPage của API v1
 */
export interface SeoOnPage {
  titleHead?: string;
  descriptionHead?: string;
  og_type?: string;
  og_image?: string[];
  og_url?: string;
}

/**
 * Thông tin phân trang chuẩn hóa
 */
export interface Pagination {
  totalItems: number;
  totalItemsPerPage: number;
  currentPage: number;
  totalPages: number;
  pageRanges?: number;
}

/**
 * Thông tin một bộ phim trong danh sách (API v1 & v3)
 */
export interface Movie {
  _id: string;
  name: string;
  slug: string;
  origin_name: string;
  thumb_url: string;
  poster_url: string;
  year: number;
  type?: string;
  quality?: string;
  lang?: string;
  lang_key?: string[];
  episode_current?: string;
  time?: string;
  chieurap?: boolean;
  sub_docquyen?: boolean;
  tmdb?: TmdbRef;
  imdb?: RatingInfo;
  category?: Taxonomy[];
  country?: Taxonomy[];
  modified?: { time: string };
}

/**
 * Kết quả trả về đã chuẩn hóa cho mọi endpoint danh sách
 */
export interface ApiListResponse {
  status: boolean;
  items: Movie[];
  pagination?: Pagination;
  pathImage?: string;
  titlePage?: string;
  breadCrumb?: BreadcrumbItem[];
  seoOnPage?: SeoOnPage;
  itemsUpdateInDay?: number;
}

/**
 * Thông tin một tập phim thuộc một server phát
 */
export interface EpisodeItem {
  name: string;
  slug: string;
  filename: string;
  link_embed: string;
  link_m3u8: string;
}

/**
 * Một server phát chứa danh sách các tập phim
 */
export interface Episode {
  server_name: string;
  is_ai?: boolean;
  server_data: EpisodeItem[];
}

/**
 * Chi tiết đầy đủ của một bộ phim từ API v1
 */
export interface MovieDetail extends Movie {
  content: string;
  type: string;
  status: string;
  trailer_url: string;
  time: string;
  episode_current: string;
  episode_total: string | number;
  quality: string;
  lang: string;
  notify: string;
  showtimes: string;
  view?: number;
  actor: string[];
  director: string[];
  category: Taxonomy[];
  country: Taxonomy[];
  episodes?: Episode[];
}

/**
 * Kết quả trả về đã chuẩn hóa cho chi tiết phim (/v1/api/phim/{slug})
 */
export interface ApiDetailResponse {
  status: boolean;
  msg: string;
  movie: MovieDetail;
  episodes: Episode[];
  servers?: Episode[];
  seoOnPage?: SeoOnPage;
  breadCrumb?: BreadcrumbItem[];
}

/**
 * Thông tin diễn viên / đạo diễn từ /v1/api/phim/{slug}/peoples
 */
export interface Person {
  tmdb_people_id: number;
  name: string;
  original_name?: string;
  character?: string;
  known_for_department?: string;
  profile_path: string | null;
}

export interface MoviePeoplesResponse {
  peoples: Person[];
  profileBaseUrl: string;
}

/**
 * Thông tin hình ảnh HD (backdrop / poster) từ /v1/api/phim/{slug}/images
 */
export interface MovieImageAsset {
  width: number;
  height: number;
  aspect_ratio: number;
  type: 'backdrop' | 'poster' | string;
  file_path: string;
}

export interface MovieImagesResponse {
  images: MovieImageAsset[];
  backdropBaseUrl: string;
  posterBaseUrl: string;
}

/**
 * Từ khóa gắn với phim từ /v1/api/phim/{slug}/keywords
 */
export interface MovieKeyword {
  tmdb_keyword_id?: number | null;
  name: string;
  name_vn?: string;
}

/**
 * Bộ lọc & sắp xếp chung cho các endpoint danh sách API v1
 */
export interface ListFilters {
  page?: number;
  limit?: number;
  category?: string;
  country?: string;
  year?: string;
  sort_field?: 'modified.time' | '_id' | 'year';
  sort_type?: 'asc' | 'desc';
  sort_lang?: 'vietsub' | 'thuyet-minh' | 'long-tieng';
}

/**
 * Tiến độ xem phim lưu ở trình duyệt người dùng
 */
export interface MovieProgress {
  slug: string;
  name: string;
  origin_name?: string;
  thumb_url?: string;
  poster_url?: string;
  episodeName?: string;
  episodeIndex: number;
  serverIndex?: number;
  currentTime: number;
  duration?: number;
  completed?: boolean;
  updatedAt: number;
}

/**
 * Phim đã lưu trong Danh sách của tôi
 */
export interface SavedMovie {
  _id: string;
  name: string;
  slug: string;
  origin_name?: string;
  thumb_url?: string;
  poster_url?: string;
  year?: number;
  quality?: string;
  lang?: string;
  episode_current?: string;
  imdbScore?: number;
  addedAt: number;
}

/**
 * Trạng thái yêu thích của một phim
 */
export interface MovieInteraction {
  slug: string;
  liked: boolean;
  updatedAt: number;
}

export interface GenreConfig {
  slug: string;
  label: string;
}

export interface CategoryConfig {
  slug: string;
  label: string;
  href: string;
}

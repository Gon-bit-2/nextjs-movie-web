import type { MetadataRoute } from 'next';
import { CATEGORY_CONFIG } from '@/config/navigation';
import { getSiteUrl } from '@/lib/config/site';
import { getCountries, getGenres, getNewMovies } from '@/lib/services/movie';

// Tái tạo sitemap mỗi 6 giờ
export const revalidate = 21600;

/**
 * Sinh tệp sitemap.xml động gồm trang tĩnh, danh mục, thể loại, quốc gia và ~240 phim mới nhất
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const now = new Date();

  const moviePageNumbers = Array.from({ length: 10 }, (_, idx) => idx + 1);
  const [genres, countries, ...moviePages] = await Promise.all([
    getGenres(),
    getCountries(),
    ...moviePageNumbers.map((page) => getNewMovies(page)),
  ]);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${siteUrl}/`, lastModified: now, changeFrequency: 'hourly', priority: 1.0 },
    { url: `${siteUrl}/cua-toi`, lastModified: now, changeFrequency: 'weekly', priority: 0.4 },
    ...CATEGORY_CONFIG.map((cat) => ({
      url: `${siteUrl}${cat.href}`,
      lastModified: now,
      changeFrequency: 'hourly' as const,
      priority: 0.8,
    })),
  ];

  const genreEntries: MetadataRoute.Sitemap = genres.map((genre) => ({
    url: `${siteUrl}/the-loai/${genre.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const countryEntries: MetadataRoute.Sitemap = countries.map((country) => ({
    url: `${siteUrl}/quoc-gia/${country.slug}`,
    lastModified: now,
    changeFrequency: 'daily',
    priority: 0.7,
  }));

  const seenSlugs = new Set<string>();
  const movieEntries: MetadataRoute.Sitemap = [];
  for (const res of moviePages) {
    for (const movie of res?.items || []) {
      if (!movie.slug || seenSlugs.has(movie.slug)) continue;
      seenSlugs.add(movie.slug);
      movieEntries.push({
        url: `${siteUrl}/phim/${movie.slug}`,
        lastModified: movie.modified?.time ? new Date(movie.modified.time) : now,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  return [...staticEntries, ...genreEntries, ...countryEntries, ...movieEntries];
}

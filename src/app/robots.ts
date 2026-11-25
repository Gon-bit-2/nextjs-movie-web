import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/config/site';

/**
 * Khai báo quy tắc thu thập dữ liệu cho máy tìm kiếm và vị trí sitemap.xml
 */
export default function robots(): MetadataRoute.Robots {
  const siteUrl = getSiteUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/tim-kiem'],
      },
    ],
    sitemap: `${siteUrl}/sitemap.xml`,
  };
}

/**
 * Trả về tên miền gốc của trang web dùng cho SEO, sitemap và liên kết chia sẻ
 */
export function getSiteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (raw) {
    return raw.replace(/\/+$/, '');
  }
  return 'http://localhost:3000';
}

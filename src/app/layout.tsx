import type { Metadata } from 'next';
import { Be_Vietnam_Pro, Oswald } from 'next/font/google';
import './globals.css';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import MobileBottomNav from '@/components/layout/MobileBottomNav';
import { getCountries, getGenres } from '@/lib/services/movie';
import { FALLBACK_GENRES, FEATURED_COUNTRIES } from '@/config/navigation';

const beVietnamPro = Be_Vietnam_Pro({
  variable: '--font-be-vietnam',
  subsets: ['latin', 'vietnamese'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
});

const oswald = Oswald({
  variable: '--font-oswald',
  subsets: ['latin', 'vietnamese'],
  weight: ['500', '600', '700'],
  display: 'swap',
});

export const metadata: Metadata = {
  title: {
    default: 'PHIMHAY - Rạp chiếu đêm trực tuyến',
    template: '%s | PHIMHAY',
  },
  description:
    'Xem phim trực tuyến mượt mà chất lượng cao Full HD, Vietsub, Thuyết minh, Lồng tiếng cập nhật mỗi ngày trên PHIMHAY.',
};

/**
 * Layout gốc toàn ứng dụng: nạp font tiếng Việt, dữ liệu thể loại/quốc gia cho menu và khung trang
 */
export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [genresRaw, countriesRaw] = await Promise.all([getGenres(), getCountries()]);

  const genres =
    genresRaw.length > 0
      ? genresRaw
      : FALLBACK_GENRES.map((g) => ({ name: g.label, slug: g.slug }));
  const countries =
    countriesRaw.length > 0
      ? countriesRaw
      : FEATURED_COUNTRIES.map((c) => ({ name: c.label, slug: c.slug }));

  return (
    <html lang="vi" className="dark" suppressHydrationWarning>
      <body
        className={`${beVietnamPro.variable} ${oswald.variable} bg-[#0A0A0D] text-[#F2F2F5] antialiased`}
      >
        <Header genres={genres} countries={countries} />
        <main className="min-h-screen pb-16 lg:pb-0">{children}</main>
        <Footer genres={genres.slice(0, 8)} countries={countries.slice(0, 8)} />
        <MobileBottomNav />
      </body>
    </html>
  );
}

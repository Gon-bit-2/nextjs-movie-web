import type { MovieDetail, Person } from '@/types';
import { getSiteUrl } from '@/lib/config/site';
import { getImageUrl } from '@/lib/services/movie';

interface MovieJsonLdProps {
  movie: MovieDetail;
  peoples?: Person[];
}

/**
 * Tạo dữ liệu có cấu trúc JSON-LD (Schema.org Movie / TVSeries) chuẩn hóa theo tên miền của PHIMHAY
 */
export default function MovieJsonLd({ movie, peoples = [] }: MovieJsonLdProps) {
  const siteUrl = getSiteUrl();
  const isSeries = movie.type === 'series' || movie.type === 'tvshows' || movie.type === 'hoathinh';
  const cleanDescription = movie.content
    ? movie.content.replace(/<[^>]+>/g, '').trim().slice(0, 300)
    : undefined;

  const actorNames =
    peoples.length > 0
      ? peoples
          .filter((p) => !p.known_for_department || p.known_for_department === 'Acting')
          .slice(0, 10)
          .map((p) => p.name)
      : (movie.actor || []).filter(Boolean).slice(0, 10);

  const directors = (movie.director || []).filter(
    (name) => Boolean(name && name.trim() && name.toLowerCase() !== 'đang cập nhật'),
  );

  const ratingSource =
    movie.imdb && movie.imdb.vote_average > 0 && movie.imdb.vote_count > 0
      ? movie.imdb
      : movie.tmdb && movie.tmdb.vote_average > 0 && movie.tmdb.vote_count > 0
        ? movie.tmdb
        : null;

  const schema: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': isSeries ? 'TVSeries' : 'Movie',
    name: movie.name,
    alternateName: movie.origin_name || undefined,
    url: `${siteUrl}/phim/${movie.slug}`,
    image: [
      getImageUrl(movie.poster_url),
      getImageUrl(movie.thumb_url),
    ].filter(Boolean),
    description: cleanDescription,
    datePublished: movie.year > 0 ? String(movie.year) : undefined,
    genre: movie.category?.map((c) => c.name).filter(Boolean),
    countryOfOrigin: movie.country?.[0]
      ? { '@type': 'Country', name: movie.country[0].name }
      : undefined,
    director: directors.length > 0 ? directors.map((name) => ({ '@type': 'Person', name })) : undefined,
    actor: actorNames.length > 0 ? actorNames.map((name) => ({ '@type': 'Person', name })) : undefined,
    aggregateRating: ratingSource
      ? {
          '@type': 'AggregateRating',
          ratingValue: Number(ratingSource.vote_average.toFixed(1)),
          bestRating: 10,
          worstRating: 1,
          ratingCount: ratingSource.vote_count,
        }
      : undefined,
  };

  // Tránh chuỗi '</script>' khi nhúng JSON-LD trực tiếp vào HTML
  const jsonText = JSON.stringify(schema).replace(/</g, '\\u003c');

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: jsonText }}
    />
  );
}

import { User } from 'lucide-react';
import type { Person } from '@/types';
import { getTmdbImageUrl } from '@/lib/services/movie';
import ImageWithFallback from '@/components/common/ImageWithFallback';
import HorizontalRail from '@/components/common/HorizontalRail';

interface CastListProps {
  peoples: Person[];
  profileBaseUrl: string;
  fallbackActors?: string[];
}

/**
 * Hàng diễn viên & nhân sự dạng chân dung tròn từ API /peoples (tự dự phòng danh sách tên nếu không có ảnh TMDB)
 */
export default function CastList({
  peoples,
  profileBaseUrl,
  fallbackActors = [],
}: CastListProps) {
  if (peoples.length > 0) {
    return (
      <HorizontalRail ariaLabel="Danh sách diễn viên" gapClassName="gap-4">
        {peoples.slice(0, 18).map((person) => {
          const photoUrl = getTmdbImageUrl(person.profile_path, profileBaseUrl);
          return (
            <div
              key={`${person.tmdb_people_id}-${person.name}`}
              className="flex w-28 shrink-0 flex-col items-center text-center"
            >
              <div className="relative h-22 w-22 overflow-hidden rounded-full border border-white/15 bg-[#1E1E26]">
                {photoUrl ? (
                  <ImageWithFallback
                    src={photoUrl}
                    alt={person.name}
                    fill
                    sizes="88px"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-[#9A9AA8]">
                    <User className="h-8 w-8" />
                  </div>
                )}
              </div>
              <p className="mt-2.5 line-clamp-1 text-xs font-semibold text-[#F2F2F5]">
                {person.name}
              </p>
              {person.character && (
                <p className="mt-0.5 line-clamp-1 text-[11px] text-[#9A9AA8]">
                  {person.character}
                </p>
              )}
            </div>
          );
        })}
      </HorizontalRail>
    );
  }

  const cleanActors = fallbackActors.filter((name) => name && name.trim());
  if (cleanActors.length === 0) {
    return <p className="text-sm text-[#9A9AA8]">Đang cập nhật danh sách diễn viên.</p>;
  }

  return (
    <div className="flex flex-wrap gap-2">
      {cleanActors.map((actor) => (
        <span
          key={actor}
          className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-[#1E1E26] px-3 py-1.5 text-xs font-medium text-[#F2F2F5]"
        >
          <User className="h-3.5 w-3.5 text-[#9A9AA8]" />
          {actor}
        </span>
      ))}
    </div>
  );
}

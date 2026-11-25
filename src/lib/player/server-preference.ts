import type { Episode, PreferredServerLang } from '@/types';

/**
 * Chuẩn hóa tên server phát về dạng mã ngôn ngữ (vietsub / thuyet-minh / long-tieng) để so khớp
 */
export function normalizeServerLang(serverName: string | undefined): PreferredServerLang | null {
  if (!serverName) return null;

  const normalized = serverName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase();

  if (normalized.includes('thuyet minh')) return 'thuyet-minh';
  if (normalized.includes('long tieng')) return 'long-tieng';
  if (normalized.includes('vietsub') || normalized.includes('phu de')) return 'vietsub';

  return null;
}

/**
 * Tìm chỉ số server phù hợp nhất với ngôn ngữ người dùng ưa thích (ưu tiên bản không phải AI nếu cùng ngôn ngữ)
 */
export function findPreferredServerIndex(
  servers: Pick<Episode, 'server_name' | 'is_ai'>[],
  preferredLang: PreferredServerLang | null | undefined,
): number | null {
  if (!preferredLang || servers.length === 0) return null;

  const nonAiMatch = servers.findIndex(
    (s) => !s.is_ai && normalizeServerLang(s.server_name) === preferredLang,
  );
  if (nonAiMatch !== -1) return nonAiMatch;

  const anyMatch = servers.findIndex(
    (s) => normalizeServerLang(s.server_name) === preferredLang,
  );
  return anyMatch !== -1 ? anyMatch : null;
}

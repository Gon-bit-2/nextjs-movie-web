import { describe, expect, it } from 'vitest';
import {
  findPreferredServerIndex,
  normalizeServerLang,
} from '@/lib/player/server-preference';

describe('server-preference.ts — nhận diện và chọn server theo ngôn ngữ ưa thích', () => {
  it('chuẩn hóa đúng tên server tiếng Việt có dấu, viết hoa và cụm chứa server', () => {
    expect(normalizeServerLang('Vietsub')).toBe('vietsub');
    expect(normalizeServerLang('#Hà Nội (Vietsub)')).toBe('vietsub');
    expect(normalizeServerLang('Lồng Tiếng')).toBe('long-tieng');
    expect(normalizeServerLang('Thuyết Minh #1')).toBe('thuyet-minh');
    expect(normalizeServerLang('Phụ đề Việt')).toBe('vietsub');
    expect(normalizeServerLang('Server Dự Phòng')).toBeNull();
    expect(normalizeServerLang(undefined)).toBeNull();
  });

  it('ưu tiên bản không phải AI khi có nhiều server cùng ngôn ngữ', () => {
    const servers = [
      { server_name: 'Vietsub', is_ai: true },
      { server_name: 'Lồng Tiếng', is_ai: false },
      { server_name: 'Vietsub', is_ai: false },
    ];

    expect(findPreferredServerIndex(servers, 'vietsub')).toBe(2);
    expect(findPreferredServerIndex(servers, 'long-tieng')).toBe(1);
  });

  it('dùng bản AI nếu chỉ có bản AI khớp ngôn ngữ ưa thích', () => {
    const servers = [
      { server_name: 'Vietsub', is_ai: false },
      { server_name: 'Thuyết Minh', is_ai: true },
    ];

    expect(findPreferredServerIndex(servers, 'thuyet-minh')).toBe(1);
  });

  it('trả về null nếu phim không có server khớp hoặc người dùng chưa chọn ưu tiên', () => {
    const servers = [{ server_name: 'Vietsub', is_ai: false }];
    expect(findPreferredServerIndex(servers, 'thuyet-minh')).toBeNull();
    expect(findPreferredServerIndex(servers, null)).toBeNull();
    expect(findPreferredServerIndex([], 'vietsub')).toBeNull();
  });
});

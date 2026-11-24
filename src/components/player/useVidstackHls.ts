'use client';

import type { DefaultLayoutTranslations } from '@vidstack/react/player/layouts/default';
import type { HlsConfig } from 'hls.js';

/**
 * Cấu hình hls.js tối ưu cho phim theo yêu cầu (VOD) giúp phát mượt và ít giật khung hình
 */
export const HLS_VOD_CONFIG: Partial<HlsConfig> = {
  enableWorker: true, // Tách giải mã sang Web Worker để luồng giao diện không bị nghẽn
  lowLatencyMode: false, // Tắt chế độ livestream để có vùng đệm dài và ổn định cho VOD
  startLevel: -1, // Tự động chọn độ phân giải khởi đầu theo băng thông thực tế
  capLevelToPlayerSize: true, // Không tải luồng quá lớn so với kích thước khung phát
  abrEwmaDefaultEstimate: 3_000_000, // Ước lượng ban đầu 3Mbps để khởi đầu hình ảnh rõ nét
  maxBufferLength: 30, // Đệm trước 30 giây
  maxMaxBufferLength: 120, // Cho phép mở rộng đệm tối đa 120 giây khi mạng khỏe
  backBufferLength: 30, // Giữ 30 giây phía sau để tua lùi tức thì mà không tốn RAM
  startFragPrefetch: true, // Tải trước phân đoạn đầu tiên ngay khi đọc xong manifest
  fragLoadPolicy: {
    default: {
      maxTimeToFirstByteMs: 10_000,
      maxLoadTimeMs: 60_000,
      timeoutRetry: {
        maxNumRetry: 4,
        retryDelayMs: 0,
        maxRetryDelayMs: 0,
      },
      errorRetry: {
        maxNumRetry: 6,
        retryDelayMs: 1000,
        maxRetryDelayMs: 8000,
      },
    },
  },
};

/**
 * Bộ nhãn giao diện tiếng Việt cho DefaultVideoLayout của Vidstack
 */
export const VIDSTACK_VI_TRANSLATIONS: DefaultLayoutTranslations = {
  'Caption Styles': 'Kiểu phụ đề',
  'Captions look like this': 'Phụ đề hiển thị như thế này',
  'Closed-Captions Off': 'Tắt phụ đề',
  'Closed-Captions On': 'Bật phụ đề',
  'Display Background': 'Nền hiển thị',
  'Enter Fullscreen': 'Toàn màn hình',
  'Enter PiP': 'Hình trong hình',
  'Exit Fullscreen': 'Thoát toàn màn hình',
  'Exit PiP': 'Thoát hình trong hình',
  'Google Cast': 'Phát lên TV',
  'Keyboard Animations': 'Hiệu ứng phím tắt',
  'Seek Backward': 'Tua lùi 10 giây',
  'Seek Forward': 'Tua tới 10 giây',
  'Skip To Live': 'Về trực tiếp',
  'Text Background': 'Nền chữ',
  Accessibility: 'Trợ năng',
  AirPlay: 'AirPlay',
  Announcements: 'Thông báo',
  Audio: 'Âm thanh',
  Auto: 'Tự động',
  Boost: 'Khuếch đại',
  Captions: 'Phụ đề',
  Chapters: 'Chương',
  Color: 'Màu sắc',
  Connected: 'Đã kết nối',
  Connecting: 'Đang kết nối',
  Continue: 'Tiếp tục',
  Default: 'Mặc định',
  Disabled: 'Tắt',
  Disconnected: 'Đã ngắt kết nối',
  Download: 'Tải xuống',
  Family: 'Phông chữ',
  Font: 'Chữ',
  Fullscreen: 'Toàn màn hình',
  LIVE: 'TRỰC TIẾP',
  Loop: 'Lặp lại',
  Mute: 'Tắt tiếng',
  Normal: 'Bình thường',
  Off: 'Tắt',
  Opacity: 'Độ mờ',
  Pause: 'Tạm dừng',
  PiP: 'Hình trong hình',
  Play: 'Phát',
  Playback: 'Phát lại',
  Quality: 'Chất lượng',
  Replay: 'Xem lại',
  Reset: 'Đặt lại',
  Seek: 'Tua',
  Settings: 'Cài đặt',
  Shadow: 'Đổ bóng',
  Size: 'Kích thước',
  Speed: 'Tốc độ',
  Text: 'Văn bản',
  Track: 'Kênh',
  Unmute: 'Bật tiếng',
  Volume: 'Âm lượng',
};

/**
 * Trích xuất origin (protocol + host) từ một URL luồng video để thực hiện preconnect sớm
 */
export function getStreamOrigin(url: string | undefined): string | null {
  if (!url) return null;
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

/**
 * Tải trước file playlist .m3u8 (chỉ vài KB) của tập kế tiếp nhằm làm ấm DNS/CDN
 */
export async function warmNextEpisodeManifest(m3u8Url: string | undefined): Promise<void> {
  if (!m3u8Url || typeof window === 'undefined') return;
  try {
    await fetch(m3u8Url, {
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
    });
  } catch {
    // Bỏ qua lỗi CORS/mạng vì đây chỉ là tối ưu dự phòng
  }
}

/**
 * Định dạng số giây thành chuỗi thời gian mm:ss hoặc hh:mm:ss dễ đọc
 */
export function formatDurationTime(seconds: number): string {
  if (!Number.isFinite(seconds) || seconds < 0) return '00:00';
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hrs > 0) {
    return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

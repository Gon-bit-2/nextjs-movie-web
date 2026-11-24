'use client';

import { useCallback, useEffect, useRef } from 'react';
import {
  clearEpisodeProgress,
  getEpisodeProgress,
  saveWatchProgress,
} from '@/lib/storage/movie-personalization';

interface UseWatchProgressParams {
  movieSlug: string;
  movieName: string;
  originName?: string;
  thumbUrl?: string;
  posterUrl?: string;
  episodeName: string;
  episodeIndex: number;
  serverIndex: number;
}

const SAVE_THROTTLE_MS = 5000;

/**
 * Hook quản lý lưu tiến độ xem phim có giới hạn tần suất (5 giây/lần + lưu ngay khi tạm dừng hoặc rời trang)
 */
export function useWatchProgress({
  movieSlug,
  movieName,
  originName,
  thumbUrl,
  posterUrl,
  episodeName,
  episodeIndex,
  serverIndex,
}: UseWatchProgressParams) {
  const lastSavedAtRef = useRef<number>(0);
  const latestTimeRef = useRef<number>(0);
  const latestDurationRef = useRef<number>(0);

  /**
   * Ghi tiến độ hiện tại xuống localStorage khi đã xem quá 5 giây
   */
  const flushProgress = useCallback(
    (force: boolean = false) => {
      const currentTime = latestTimeRef.current;
      const duration = latestDurationRef.current;
      if (currentTime <= 5) return;

      const now = Date.now();
      if (!force && now - lastSavedAtRef.current < SAVE_THROTTLE_MS) {
        return;
      }

      lastSavedAtRef.current = now;
      saveWatchProgress({
        slug: movieSlug,
        name: movieName,
        origin_name: originName,
        thumb_url: thumbUrl,
        poster_url: posterUrl,
        episodeName,
        episodeIndex,
        serverIndex,
        currentTime,
        duration: duration > 0 ? duration : undefined,
        updatedAt: now,
      });
    },
    [episodeIndex, episodeName, movieName, movieSlug, originName, posterUrl, serverIndex, thumbUrl],
  );

  /**
   * Cập nhật bộ đếm thời gian phát từ sự kiện timeUpdate của trình phát
   */
  const reportTime = useCallback(
    (currentTime: number, duration: number) => {
      latestTimeRef.current = currentTime;
      if (Number.isFinite(duration) && duration > 0) {
        latestDurationRef.current = duration;
      }
      flushProgress(false);
    },
    [flushProgress],
  );

  /**
   * Đọc mốc thời gian đã lưu của tập hiện tại để hiển thị gợi ý Tiếp tục xem
   */
  const readSavedTime = useCallback((): number => {
    const record = getEpisodeProgress(movieSlug, episodeIndex);
    if (!record || record.completed) return 0;
    return record.currentTime > 10 ? record.currentTime : 0;
  }, [episodeIndex, movieSlug]);

  /**
   * Xóa tiến độ của tập hiện tại khi người dùng muốn xem lại từ đầu
   */
  const resetCurrentProgress = useCallback(() => {
    latestTimeRef.current = 0;
    lastSavedAtRef.current = 0;
    clearEpisodeProgress(movieSlug, episodeIndex);
  }, [episodeIndex, movieSlug]);

  // Đặt lại ref khi đổi tập và tự động lưu khi rời tab hoặc ẩn trình duyệt
  useEffect(() => {
    latestTimeRef.current = 0;
    latestDurationRef.current = 0;
    lastSavedAtRef.current = 0;

    const controller = new AbortController();

    const handleVisibility = () => {
      if (document.visibilityState === 'hidden') {
        flushProgress(true);
      }
    };

    const handlePageHide = () => {
      flushProgress(true);
    };

    document.addEventListener('visibilitychange', handleVisibility, { signal: controller.signal });
    window.addEventListener('pagehide', handlePageHide, { signal: controller.signal });

    return () => {
      flushProgress(true);
      controller.abort();
    };
  }, [flushProgress]);

  return {
    reportTime,
    flushProgress,
    readSavedTime,
    resetCurrentProgress,
  };
}

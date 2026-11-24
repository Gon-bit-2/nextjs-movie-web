'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface HorizontalRailProps {
  children: ReactNode;
  ariaLabel?: string;
  /** Khoảng cách giữa các phần tử trong hàng */
  gapClassName?: string;
  /** Cho phép hiển thị nút mũi tên nổi hai mép trái/phải */
  showArrows?: boolean;
}

const DRAG_THRESHOLD_PX = 6;

/**
 * Thanh trượt ngang dùng chung hỗ trợ kéo chuột (drag-to-scroll), cuộn cảm ứng và nút mũi tên trái/phải thông minh
 */
export default function HorizontalRail({
  children,
  ariaLabel = 'Danh sách cuộn ngang',
  gapClassName = 'gap-3.5 md:gap-4',
  showArrows = true,
}: HorizontalRailProps) {
  const railRef = useRef<HTMLDivElement>(null);
  const isPointerDownRef = useRef(false);
  const startXRef = useRef(0);
  const startScrollLeftRef = useRef(0);
  const movedBeyondThresholdRef = useRef(false);
  const suppressClickRef = useRef(false);

  const [isDragging, setIsDragging] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  /**
   * Kiểm tra vị trí cuộn hiện tại để ẩn/hiện chính xác 2 nút mũi tên trái và phải
   */
  const updateScrollEdges = useCallback(() => {
    const el = railRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 8);
    setCanScrollRight(maxScroll - el.scrollLeft > 8);
  }, []);

  /**
   * Cuộn hàng ngang sang trái hoặc phải bằng nút mũi tên
   */
  const scrollByStep = useCallback((direction: 'left' | 'right') => {
    const el = railRef.current;
    if (!el) return;
    const distance = Math.max(280, Math.round(el.clientWidth * 0.8));
    el.scrollBy({
      left: direction === 'left' ? -distance : distance,
      behavior: 'smooth',
    });
  }, []);

  // Cập nhật trạng thái biên cuộn khi scroll hoặc thay đổi kích thước khung nhìn
  useEffect(() => {
    const el = railRef.current;
    if (!el) return;

    updateScrollEdges();
    const observer = new ResizeObserver(updateScrollEdges);
    observer.observe(el);

    return () => observer.disconnect();
  }, [updateScrollEdges]);

  // Xử lý kéo chuột toàn cục trên window để thả chuột ngoài vùng hàng vẫn dừng mượt
  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      if (!isPointerDownRef.current || !railRef.current) return;

      const deltaX = event.clientX - startXRef.current;
      if (!movedBeyondThresholdRef.current && Math.abs(deltaX) > DRAG_THRESHOLD_PX) {
        movedBeyondThresholdRef.current = true;
        setIsDragging(true);
      }

      if (movedBeyondThresholdRef.current) {
        railRef.current.scrollLeft = startScrollLeftRef.current - deltaX;
      }
    };

    const handleMouseUp = () => {
      if (!isPointerDownRef.current) return;
      isPointerDownRef.current = false;

      if (movedBeyondThresholdRef.current) {
        suppressClickRef.current = true;
        window.setTimeout(() => {
          suppressClickRef.current = false;
        }, 80);
      }

      movedBeyondThresholdRef.current = false;
      setIsDragging(false);
      updateScrollEdges();
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [updateScrollEdges]);

  /**
   * Bắt đầu phiên kéo ngang khi người dùng nhấn chuột trái trên hàng
   */
  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
    if (event.button !== 0 || !railRef.current) return;
    isPointerDownRef.current = true;
    movedBeyondThresholdRef.current = false;
    startXRef.current = event.clientX;
    startScrollLeftRef.current = railRef.current.scrollLeft;
  };

  /**
   * Chặn mở link nhầm ngay sau khi người dùng vừa kéo chuột để cuộn ngang
   */
  const handleClickCapture = (event: React.MouseEvent<HTMLDivElement>) => {
    if (suppressClickRef.current) {
      event.preventDefault();
      event.stopPropagation();
      suppressClickRef.current = false;
    }
  };

  return (
    <div className="group/rail relative">
      {/* Nút cuộn trái nổi ở mép trái */}
      {showArrows && canScrollLeft && (
        <div className="pointer-events-none absolute inset-y-0 left-0 z-20 hidden w-16 items-center justify-start bg-linear-to-r from-[#0A0A0D] via-[#0A0A0D]/70 to-transparent md:flex">
          <button
            type="button"
            onClick={() => scrollByStep('left')}
            aria-label={`Cuộn trái ${ariaLabel}`}
            className="pointer-events-auto ml-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#14141A]/90 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:border-[#E50914] hover:bg-[#E50914]"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        </div>
      )}

      {/* Vùng cuộn ngang hỗ trợ kéo chuột và cảm ứng */}
      <div
        ref={railRef}
        aria-label={ariaLabel}
        onScroll={updateScrollEdges}
        onMouseDown={handleMouseDown}
        onClickCapture={handleClickCapture}
        onDragStart={(e) => e.preventDefault()}
        className={`no-scrollbar flex overflow-x-auto pb-3 ${gapClassName} ${
          isDragging
            ? 'cursor-grabbing select-none'
            : 'cursor-grab snap-x snap-mandatory'
        }`}
      >
        {children}
      </div>

      {/* Nút cuộn phải nổi ở mép phải */}
      {showArrows && canScrollRight && (
        <div className="pointer-events-none absolute inset-y-0 right-0 z-20 hidden w-16 items-center justify-end bg-linear-to-l from-[#0A0A0D] via-[#0A0A0D]/70 to-transparent md:flex">
          <button
            type="button"
            onClick={() => scrollByStep('right')}
            aria-label={`Cuộn phải ${ariaLabel}`}
            className="pointer-events-auto mr-1 flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-[#14141A]/90 text-white shadow-lg backdrop-blur-md transition hover:scale-105 hover:border-[#E50914] hover:bg-[#E50914]"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}

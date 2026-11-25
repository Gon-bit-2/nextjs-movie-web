import { ImageResponse } from 'next/og';

export const size = { width: 512, height: 512 };
export const contentType = 'image/png';

/**
 * Sinh biểu tượng ứng dụng PWA & favicon bằng mã (nền đen phòng chiếu + chữ P đỏ điện ảnh)
 */
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0A0A0D',
          borderRadius: '22%',
          border: '18px solid #1E1E26',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 330,
            fontWeight: 900,
            color: '#E50914',
            letterSpacing: '-0.04em',
            lineHeight: 1,
          }}
        >
          P
        </div>
      </div>
    ),
    size,
  );
}

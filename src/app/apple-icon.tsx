import { ImageResponse } from 'next/og';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * Sinh biểu tượng Apple Touch Icon 180x180 cho thiết bị iOS khi thêm ra màn hình chính
 */
export default function AppleIcon() {
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
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 124,
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

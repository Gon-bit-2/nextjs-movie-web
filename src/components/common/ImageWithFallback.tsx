'use client';

import { useState } from 'react';
import Image, { ImageProps } from 'next/image';

const fallbackSvg = `
<svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none">
  <rect width="100%" height="100%" fill="#27272a" />
  <text x="50%" y="50%" font-family="sans-serif" font-size="10" fill="#52525b" text-anchor="middle" dominant-baseline="middle">No Image</text>
</svg>
`;

const fallbackDataUrl = `data:image/svg+xml;base64,${typeof window === 'undefined' ? Buffer.from(fallbackSvg).toString('base64') : btoa(fallbackSvg)}`;

interface ImageWithFallbackProps extends ImageProps {
  fallbackSrc?: string;
}

export default function ImageWithFallback({
  src,
  fallbackSrc = fallbackDataUrl,
  alt,
  ...rest
}: ImageWithFallbackProps) {
  const [errorInfo, setErrorInfo] = useState({ error: false, failedSrc: '' });

  const hasError = errorInfo.error && errorInfo.failedSrc === src;

  return (
    <Image
      {...rest}
      src={hasError ? fallbackSrc : src}
      alt={alt}
      onError={() => {
        setErrorInfo({ error: true, failedSrc: src as string });
      }}
      unoptimized
    />
  );
}

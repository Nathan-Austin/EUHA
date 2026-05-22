'use client';

import Image from 'next/image';

interface SauceImageProps {
  code: string;
  productImageUrl: string | null;
  name: string;
  className?: string;
}

export default function SauceImage({ code, productImageUrl, name, className }: SauceImageProps) {
  return (
    <Image
      src={productImageUrl || `/images/${code}.jpg`}
      alt={name}
      fill
      className={className}
      onError={(e) => {
        const img = e.target as HTMLImageElement;
        const fallback = `/images/${code}.jpg`;
        if (!img.src.endsWith(fallback)) img.src = fallback;
      }}
    />
  );
}

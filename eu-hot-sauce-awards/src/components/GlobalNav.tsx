'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';
import Navigation from './Navigation';

export default function GlobalNav() {
  const pathname = usePathname();

  if (pathname?.startsWith('/dashboard')) return null;

  return (
    <>
      <div className="relative w-full h-24 sm:h-32 md:h-40 lg:h-48 bg-[#fabf14] -mb-px">
        <Image
          src="/cropped-banner-website.png"
          alt="European Hot Sauce Awards Banner"
          fill
          className="object-contain object-center"
          priority
        />
      </div>
      <Navigation />
    </>
  );
}

import Link from 'next/link';
import Image from 'next/image';
import { COMPETITION_YEAR, PREVIOUS_COMPETITION_YEAR } from '@/lib/config';

const NAV_LINKS = [
  { href: '/results', label: `${PREVIOUS_COMPETITION_YEAR} Winners` },
  { href: '/judges', label: 'Judges' },
  { href: '/prizes', label: 'Prizes' },
  { href: '/press', label: 'Press' },
];

// New EHSA-2027-style header, ported from EHC/ehsa-2027/mock-homepage/index.html.
// Only used on the homepage for now — every other route still gets GlobalNav/Navigation.
export default function HeatHeader() {
  return (
    <header className="border-b-4 border-black bg-[#F5C518]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-3.5">
          <Image
            src="/ehsa-badge.png"
            alt="European Hot Sauce Awards"
            width={44}
            height={44}
            className="h-11 w-11 flex-shrink-0"
            priority
          />
          <span className="font-[family-name:var(--font-archivo-black)] text-lg uppercase leading-none text-black">
            European Hot Sauce Awards
            <small className="mt-1 block font-sans text-[11px] font-semibold tracking-[0.12em] text-black/70">
              Heatawards.eu &mdash; the directory
            </small>
          </span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-2">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-bold uppercase tracking-[0.05em] text-black hover:opacity-70"
            >
              {link.label}
            </Link>
          ))}
          <a
            href="https://europeanheatcouncil.eu"
            target="_blank"
            rel="noopener noreferrer"
            title="In partnership with the European Heat Council"
            className="flex-shrink-0 opacity-80 hover:opacity-100"
          >
            <Image src="/ehc-icon.png" alt="European Heat Council" width={28} height={28} className="h-7 w-7" />
          </a>
          <Link
            href="/login"
            className="bg-black px-3.5 py-2 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.03em] text-[#F5C518] hover:bg-black/80"
          >
            Enter {COMPETITION_YEAR}
          </Link>
        </nav>
      </div>
    </header>
  );
}

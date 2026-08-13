import Link from 'next/link';

const NAV_LINKS = [
  { href: '/results', label: 'Results' },
  { href: '/rankings', label: 'Rankings' },
  { href: '/judges', label: 'Judges' },
  { href: '/prizes', label: 'Prizes' },
];

// New EHSA-2027-style header, ported from EHC/ehsa-2027/mock-homepage/index.html.
// Only used on the homepage for now — every other route still gets GlobalNav/Navigation.
export default function HeatHeader() {
  return (
    <header className="border-b-4 border-black bg-[#F5C518]">
      <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-6 py-3">
        <Link href="/" className="flex items-center gap-3.5">
          <span className="grid h-11 w-11 flex-shrink-0 place-items-center rounded-full bg-black font-[family-name:var(--font-archivo-black)] text-xl text-[#F5C518]">
            E
          </span>
          <span className="font-[family-name:var(--font-archivo-black)] text-lg uppercase leading-none text-black">
            EU Hot Sauce Awards
            <small className="mt-1 block font-sans text-[11px] font-semibold normal-case tracking-[0.12em] text-black/70">
              heatawards.eu
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
          <Link
            href="/login"
            className="text-sm font-bold uppercase tracking-[0.05em] text-black hover:opacity-70"
          >
            Login
          </Link>
          <Link
            href="/apply/supplier"
            className="bg-black px-3.5 py-2 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.03em] text-[#F5C518] hover:bg-black/80"
          >
            Enter 2027
          </Link>
        </nav>
      </div>
    </header>
  );
}

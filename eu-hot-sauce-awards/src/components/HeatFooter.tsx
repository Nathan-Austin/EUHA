import Link from 'next/link';

const FooterCol = ({
  title,
  links,
}: {
  title: string;
  links: { href: string; label: string }[];
}) => (
  <div>
    <h4 className="mb-3.5 font-[family-name:var(--font-archivo-black)] text-[13px] uppercase tracking-[0.1em] text-[#F5C518]">
      {title}
    </h4>
    <ul className="space-y-1.5">
      {links.map((l) => (
        <li key={l.href}>
          <Link href={l.href} className="text-sm text-gray-300 hover:text-[#F5C518]">
            {l.label}
          </Link>
        </li>
      ))}
    </ul>
  </div>
);

// New EHSA-2027-style footer, ported from EHC/ehsa-2027/mock-homepage/index.html.
// Only used on the homepage for now — every other route still gets the existing Footer.
export default function HeatFooter() {
  return (
    <footer className="bg-black py-14 text-gray-400">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="grid grid-cols-2 gap-9 border-b border-white/10 pb-9 md:grid-cols-4">
          <div className="col-span-2 md:col-span-1">
            <h4 className="mb-3.5 font-[family-name:var(--font-archivo-black)] text-[13px] uppercase tracking-[0.1em] text-[#F5C518]">
              European Hot Sauce Awards
            </h4>
            <p className="max-w-[380px] text-sm leading-relaxed text-gray-300">
              Independent awards programme for European chilli sauce makers, judged in Berlin.
            </p>
          </div>
          <FooterCol
            title="Competition"
            links={[
              { href: '/login', label: 'Enter' },
              { href: '/prizes', label: 'Prizes' },
              { href: '/judges', label: 'Judges' },
              { href: '/terms', label: 'Terms' },
            ]}
          />
          <FooterCol
            title="Results"
            links={[
              { href: '/results/2026', label: '2026 Results' },
              { href: '/rankings', label: 'Global Rankings' },
              { href: '/results', label: 'Past Results' },
            ]}
          />
          <FooterCol
            title="Contact"
            links={[
              { href: '/sponsors', label: 'Sponsors' },
              { href: '/contact', label: 'Contact' },
              { href: 'https://www.instagram.com/europeanhotsauceawards/', label: 'Instagram' },
            ]}
          />
        </div>
        <div className="flex flex-col gap-2 pt-6 text-xs text-gray-500 sm:flex-row sm:items-center sm:justify-between">
          <span>&copy; {new Date().getFullYear()} European Hot Sauce Awards.</span>
          <div className="flex gap-5">
            <Link href="/terms" className="hover:text-[#F5C518]">Terms</Link>
            <Link href="/privacy" className="hover:text-[#F5C518]">Privacy</Link>
            <Link href="/cookies" className="hover:text-[#F5C518]">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}

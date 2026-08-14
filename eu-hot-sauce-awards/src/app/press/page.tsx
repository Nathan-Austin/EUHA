import Link from 'next/link';
import type { Metadata } from 'next';
import { PREVIOUS_COMPETITION_YEAR } from '@/lib/config';
import { getPressPickups, getPressStats } from '@/lib/press';
import { getYearEntrants, summarizeMakers } from '@/lib/pastResults';
import { slugifyMaker } from '@/lib/categories';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Press',
  description: 'Independently verified media coverage of the European Hot Sauce Awards — real outlets, real articles.',
};

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

function formatDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const PressPage = async () => {
  const [pickups, entrants] = await Promise.all([getPressPickups(), getYearEntrants()]);
  const stats = getPressStats(pickups);
  const validMakerSlugs = new Set(summarizeMakers(entrants).map((m) => m.slug));

  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Press' }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5C518]">
            EHSA {PREVIOUS_COMPETITION_YEAR}
          </p>
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,56px)] uppercase leading-[0.95] text-white">
            In the <span className="bg-[#F5C518] px-2 text-black">press</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/70 sm:text-lg">
            Independently verified coverage of the European Hot Sauce Awards — real outlets, real articles,
            manually checked against the published piece.
          </p>
        </div>
      </section>

      <section className="border-b border-black/10 py-10">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="flex flex-wrap items-center justify-between gap-8">
            <dl className="grid grid-cols-3 gap-6 sm:gap-10">
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Pickups</dt>
                <dd className="mt-2 font-[family-name:var(--font-archivo-black)] text-3xl">{stats.count}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Outlets</dt>
                <dd className="mt-2 font-[family-name:var(--font-archivo-black)] text-3xl">{stats.outlets}</dd>
              </div>
              <div>
                <dt className="text-xs font-semibold uppercase tracking-[0.12em] text-black/50">Countries</dt>
                <dd className="mt-2 font-[family-name:var(--font-archivo-black)] text-3xl">{stats.countries}</dd>
              </div>
            </dl>

            <div className="flex max-w-md flex-col items-start gap-3 border-[3px] border-black bg-white p-6">
              <p className="text-sm leading-relaxed text-black/70">
                Need high-res photography, full release text, and scoring detail for every {PREVIOUS_COMPETITION_YEAR}{' '}
                medallist? Request access to the EHSA press kit — a quick form gets verified press a searchable
                library of releases, photography, and maker contacts.
              </p>
              {/* Placeholder target — the gated press-kit request page isn't built yet on
                  europeanheatcouncil.eu. Swap this href once EHC ships it. */}
              <a
                href="https://europeanheatcouncil.eu/press-kit"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-black px-6 py-3 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-[#F5C518] hover:bg-black/80"
              >
                Request press kit access &rarr;
              </a>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <div className="mb-8 flex items-baseline justify-between border-b-2 border-black pb-4">
            <h2 className="font-[family-name:var(--font-archivo-black)] text-2xl uppercase">
              All <span className="bg-[#F5C518] px-2">pickups</span>.
            </h2>
            <span className="text-xs font-semibold uppercase tracking-[0.1em] text-black/50">Most recent first</span>
          </div>

          <ol className="divide-y divide-black/10">
            {pickups.map((p) => {
              const makerSlug = p.makerName ? slugifyMaker(p.makerName) : null;
              const hasMakerPage = makerSlug && validMakerSlugs.has(makerSlug);
              const linkUrl = p.articleUrl || p.outletUrl;

              return (
                <li key={p.id} className="py-5">
                  <div className="grid grid-cols-12 items-baseline gap-4">
                    <div className="col-span-6 sm:col-span-2">
                      <p className="text-sm text-black/50">{formatDate(p.pickupDate)}</p>
                    </div>
                    <div className="col-span-12 order-last sm:order-none sm:col-span-6">
                      {linkUrl ? (
                        <a
                          href={linkUrl}
                          target="_blank"
                          rel="noopener noreferrer nofollow"
                          className="text-base font-semibold leading-snug hover:text-[#F5C518]"
                        >
                          {p.outletName}
                        </a>
                      ) : (
                        <p className="text-base font-semibold leading-snug">{p.outletName}</p>
                      )}
                      {linkUrl && (
                        <p className="mt-1 break-all text-xs text-black/40">{hostname(linkUrl)}</p>
                      )}
                    </div>
                    <div className="col-span-6 sm:col-span-2">
                      {p.makerName ? (
                        hasMakerPage ? (
                          <Link href={`/maker/${makerSlug}`} className="text-sm hover:text-[#F5C518] hover:underline">
                            {p.makerName}
                          </Link>
                        ) : (
                          <span className="text-sm text-black/70">{p.makerName}</span>
                        )
                      ) : (
                        <span className="text-sm text-black/40">—</span>
                      )}
                    </div>
                    <div className="col-span-6 text-right text-xs font-semibold uppercase tracking-[0.08em] text-black/50 sm:col-span-2">
                      {p.country || '—'}
                    </div>
                  </div>
                </li>
              );
            })}
          </ol>

          <p className="mt-10 max-w-2xl text-xs leading-relaxed text-black/50">
            Every pickup is checked by hand against the outbound article link before it's listed here — this
            isn't a list of releases sent, only coverage confirmed to have actually run.
          </p>
        </div>
      </section>

      <section className="border-t border-black/10 bg-black py-16 text-center text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <h2 className="mb-4 font-[family-name:var(--font-archivo-black)] text-2xl uppercase sm:text-3xl">
            Press <span className="bg-[#F5C518] px-2 text-black">enquiries</span>?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/70">
            Working on a story about EHSA, a winner, or the wider hot sauce scene? Get in touch.
          </p>
          <Link
            href="/contact"
            className="inline-block bg-[#F5C518] px-8 py-4 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-black hover:bg-white"
          >
            Contact us
          </Link>
        </div>
      </section>

      <HeatFooter />
    </div>
  );
};

export default PressPage;

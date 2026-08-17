import Link from 'next/link';
import type { Metadata } from 'next';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';
import Breadcrumbs from '@/components/Breadcrumbs';
import {
  CATEGORY_GROUPS,
  CATEGORY_SLUGS,
  CATEGORY_DESCRIPTIONS,
  HEAT_LEVEL,
  HEAT_NOTES,
  WILDCARD_CATEGORY,
  ALL_CATEGORIES,
} from '@/lib/categories';

const NAMED_CATEGORY_COUNT = ALL_CATEGORIES.length - 1; // excludes the Freestyle wildcard

export const metadata: Metadata = {
  title: 'Prizes, Categories & Judging',
  description: 'Everything you need to know about the European Hot Sauce Awards — competition categories, how judging works, the awards structure, and the Global Rankings.',
};

const AWARD_LEVELS = [
  { medal: '🥇', title: 'Gold Medal — Best in Category', detail: '1st place winner' },
  { medal: '🥇', title: 'Gold Medal', detail: '2 winners per category' },
  { medal: '🥈', title: 'Silver Medal', detail: '3 winners per category' },
  { medal: '🥉', title: 'Bronze Medal', detail: '6 winners per category' },
];

const WINNER_PACKAGE = [
  { icon: '📜', title: 'Commemorative certificate', detail: 'Official recognition of your achievement' },
  { icon: '🏷️', title: "Winner's merchandise", detail: 'Exclusive bottle stickers to showcase your award' },
  { icon: '📢', title: 'Digital marketing kit', detail: 'Digital badges and press releases' },
];

const HEAT_MAX = 5;

function HeatMeter({ level }: { level: number }) {
  return (
    <span className="flex flex-shrink-0 items-center gap-[3px]" aria-label={`Heat level ${level} of ${HEAT_MAX}`}>
      {Array.from({ length: HEAT_MAX }).map((_, i) => (
        <span key={i} className={`h-3 w-[5px] ${i < level ? 'bg-red-600' : 'bg-black/15'}`} />
      ))}
    </span>
  );
}

const PrizesPage = () => {
  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Prizes' }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,56px)] uppercase leading-[0.95] text-white">
            Prizes &amp; <span className="bg-[#F5C518] px-2 text-black">recognition</span>.
          </h1>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <h2 className="mb-3 font-[family-name:var(--font-archivo-black)] text-2xl uppercase">
            Competition <span className="bg-[#F5C518] px-2">categories</span>.
          </h2>
          <p className="mb-10 max-w-2xl text-sm leading-relaxed text-black/70">
            {NAMED_CATEGORY_COUNT} categories across three groups, plus one wildcard. The <strong>Heat ladder</strong> is about how
            spicy your sauce is — pick the rung that matches. <strong>Styles &amp; flavours</strong> and{' '}
            <strong>Pantry &amp; condiments</strong> are about format and flavor, not heat — enter whichever best
            describes what&apos;s in the bottle. Not sure where you fit? Enter <strong>Freestyle</strong> or{' '}
            <Link href="/contact" className="underline hover:opacity-70">get in touch</Link> and we&apos;ll help.
          </p>

          {CATEGORY_GROUPS.map((group) => (
            <div key={group.title} className="mb-12">
              <div className="mb-5 flex items-baseline justify-between border-b-2 border-black pb-2">
                <h3 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase tracking-[0.02em]">
                  {group.title}
                </h3>
                <span className="text-xs font-semibold uppercase tracking-[0.1em] text-black/50">{group.meta}</span>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {group.categories.map((category) => {
                  const heat = HEAT_LEVEL[category];
                  return (
                    <Link
                      key={category}
                      href={`/category/${CATEGORY_SLUGS[category]}`}
                      className="flex flex-col gap-2 border-2 border-black bg-white p-5 transition hover:-translate-y-0.5 hover:shadow-lg"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <h4 className="font-[family-name:var(--font-archivo-black)] text-sm uppercase leading-tight">
                          {category}
                        </h4>
                        {heat && <HeatMeter level={heat} />}
                      </div>
                      <p className="text-sm leading-relaxed text-black/60">{CATEGORY_DESCRIPTIONS[category]}</p>
                      {HEAT_NOTES[category] && (
                        <p className="text-xs leading-relaxed text-black/45">{HEAT_NOTES[category]}</p>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          <div>
            <div className="mb-5 flex items-baseline justify-between border-b-2 border-black pb-2">
              <h3 className="font-[family-name:var(--font-archivo-black)] text-lg uppercase tracking-[0.02em]">
                Wildcard
              </h3>
              <span className="text-xs font-semibold uppercase tracking-[0.1em] text-black/50">
                Anything goes, 1 category
              </span>
            </div>
            <Link
              href={`/category/${CATEGORY_SLUGS[WILDCARD_CATEGORY]}`}
              className="flex flex-col gap-2 border-2 border-[#F5C518] bg-black p-5 text-white transition hover:-translate-y-0.5 sm:max-w-sm"
            >
              <h4 className="font-[family-name:var(--font-archivo-black)] text-sm uppercase leading-tight text-[#F5C518]">
                {WILDCARD_CATEGORY}
              </h4>
              <p className="text-sm leading-relaxed text-white/70">{CATEGORY_DESCRIPTIONS[WILDCARD_CATEGORY]}</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <h2 className="mb-8 font-[family-name:var(--font-archivo-black)] text-2xl uppercase">
            Award <span className="bg-[#F5C518] px-2">levels</span>.
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {AWARD_LEVELS.map((level) => (
              <div key={level.title} className="border-[3px] border-black bg-white p-6 text-center">
                <div className="mb-3 text-3xl">{level.medal}</div>
                <h3 className="mb-2 font-[family-name:var(--font-archivo-black)] text-base uppercase leading-tight">
                  {level.title}
                </h3>
                <p className="text-sm text-black/60">{level.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <h2 className="mb-8 font-[family-name:var(--font-archivo-black)] text-2xl uppercase">
            Winner’s <span className="bg-[#F5C518] px-2">package</span>.
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            {WINNER_PACKAGE.map((item) => (
              <div key={item.title} className="border-[3px] border-black bg-white p-6 text-center">
                <div className="mb-3 text-3xl">{item.icon}</div>
                <h3 className="mb-2 font-[family-name:var(--font-archivo-black)] text-base uppercase">
                  {item.title}
                </h3>
                <p className="text-sm text-black/60">{item.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 py-16">
        <div className="mx-auto max-w-[1240px] px-6 text-center">
          <h2 className="mb-4 font-[family-name:var(--font-archivo-black)] text-2xl uppercase">
            Global <span className="bg-[#F5C518] px-2">rankings</span>.
          </h2>
          <p className="mx-auto mb-6 max-w-2xl text-base leading-relaxed text-black/70">
            The top 20 sauces from the competition receive a special certificate and a prestigious placement in
            our international rankings, showcasing them to a global audience of hot sauce enthusiasts and
            industry professionals.
          </p>
          <Link href="/rankings" className="border-b-2 border-black text-sm font-semibold uppercase tracking-[0.06em] hover:opacity-70">
            View current rankings &rarr;
          </Link>
        </div>
      </section>

      <section className="border-t border-black/10 bg-black py-16 text-center">
        <div className="mx-auto max-w-[1240px] px-6">
          <Link
            href="/login"
            className="inline-block bg-[#F5C518] px-8 py-4 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-black hover:bg-white"
          >
            Log in to enter
          </Link>
        </div>
      </section>

      <HeatFooter />
    </div>
  );
};

export default PrizesPage;

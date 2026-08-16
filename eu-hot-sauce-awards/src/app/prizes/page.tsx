import Link from 'next/link';
import type { Metadata } from 'next';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Prizes & Recognition',
  description: 'Learn about the awards structure for the European Hot Sauce Awards, including Gold, Silver, and Bronze medals, and the coveted Global Rankings.',
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

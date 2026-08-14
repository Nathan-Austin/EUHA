import Link from 'next/link';
import type { Metadata } from 'next';
import { COMPETITION_YEAR } from '@/lib/config';
import HeatHeader from '@/components/HeatHeader';
import HeatFooter from '@/components/HeatFooter';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata: Metadata = {
  title: 'Judges',
  description: 'Apply to join the judging panel for the European Hot Sauce Awards — a live tasting congress in Berlin for food and hot sauce professionals.',
};

const REQUIREMENTS = [
  'Professional standing in the hot sauce, food, or drinks industry — chefs, critics, writers, educators, retailers, and distributors are all welcome',
  'Not currently entering a sauce into this year’s competition, to keep judging independent',
  'Able to attend the congress in Berlin in person for the judging dates',
  'Comfortable giving structured, detailed tasting feedback',
];

const STEPS = [
  {
    n: '01',
    title: 'Apply',
    body: 'Tell us a little about your professional background and why you want to judge.',
  },
  {
    n: '02',
    title: 'We review',
    body: 'Every application is checked by our team — we’re looking for genuine industry experience.',
  },
  {
    n: '03',
    title: 'Approval & invitation',
    body: 'If you’re approved, we’ll invite you to join the panel and send full details, including the participation fee to attend — food, drink, and hospitality are included throughout.',
  },
  {
    n: '04',
    title: 'Judge live in Berlin',
    body: 'Taste, score, and help decide who takes the podium alongside your fellow judges.',
  },
];

const JudgesPage = () => {
  return (
    <div className="min-h-screen bg-[#faf6ec] text-black">
      <HeatHeader />
      <Breadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Judges' }]} />

      <section className="bg-black py-16 text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <p className="mb-5 text-sm font-bold uppercase tracking-[0.18em] text-[#F5C518]">
            EHSA {COMPETITION_YEAR}
          </p>
          <h1 className="font-[family-name:var(--font-archivo-black)] text-[clamp(36px,6vw,56px)] uppercase leading-[0.95] text-white">
            Judge the <span className="bg-[#F5C518] px-2 text-black">awards</span>.
          </h1>
          <p className="mt-6 max-w-2xl text-base text-white/70 sm:text-lg">
            EHSA {COMPETITION_YEAR} is a live tasting congress in Berlin. We’re looking for professional,
            non-entering members of the hot sauce and wider food industry to join the judging panel.
          </p>
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <h2 className="mb-8 font-[family-name:var(--font-archivo-black)] text-2xl uppercase">
            Who we’re <span className="bg-[#F5C518] px-2">looking for</span>.
          </h2>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="border-[3px] border-black bg-white p-8">
              <p className="text-base leading-relaxed text-black/75">
                Chefs, food and drink critics, culinary educators, hot sauce retailers, distributors, and other
                food-industry professionals with a genuine working knowledge of spicy food. This isn’t open to
                the general public or to anyone entering a sauce this year — the panel is kept strictly independent
                and professional.
              </p>
            </div>
            <div className="border-[3px] border-black bg-white p-8">
              <h3 className="mb-4 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.08em] text-black/50">
                Requirements
              </h3>
              <ul className="space-y-3">
                {REQUIREMENTS.map((req) => (
                  <li key={req} className="flex items-start gap-3 text-sm leading-relaxed text-black/75">
                    <span className="mt-0.5 flex-shrink-0 bg-[#F5C518] px-1.5 py-0.5 text-xs font-bold text-black">✓</span>
                    <span>{req}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 py-16">
        <div className="mx-auto max-w-[1240px] px-6">
          <h2 className="mb-8 font-[family-name:var(--font-archivo-black)] text-2xl uppercase">
            How it <span className="bg-[#F5C518] px-2">works</span>.
          </h2>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((step) => (
              <div key={step.n} className="border-[3px] border-black bg-white p-6">
                <p className="mb-3 font-[family-name:var(--font-archivo-black)] text-3xl text-[#F5C518]" style={{ WebkitTextStroke: '1.5px black' }}>
                  {step.n}
                </p>
                <h3 className="mb-2 font-[family-name:var(--font-archivo-black)] text-base uppercase tracking-[0.03em]">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-black/70">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-black/10 bg-black py-16 text-center text-white">
        <div className="mx-auto max-w-[1240px] px-6">
          <h2 className="mb-4 font-[family-name:var(--font-archivo-black)] text-2xl uppercase sm:text-3xl">
            Ready to <span className="bg-[#F5C518] px-2 text-black">apply</span>?
          </h2>
          <p className="mx-auto mb-8 max-w-xl text-white/70">
            Tell us about your background and we’ll be in touch once applications open.
          </p>
          <Link
            href="/apply/judge"
            className="inline-block bg-[#F5C518] px-8 py-4 font-[family-name:var(--font-archivo-black)] text-sm uppercase tracking-[0.06em] text-black hover:bg-white"
          >
            Apply to judge
          </Link>
        </div>
      </section>

      <HeatFooter />
    </div>
  );
};

export default JudgesPage;

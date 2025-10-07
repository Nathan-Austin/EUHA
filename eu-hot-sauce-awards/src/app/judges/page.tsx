
import Hero from '@/components/Hero';
import SectionContainer from '@/components/SectionContainer';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Judging Criteria & Application',
  description: 'Learn about the judging process for the European Hot Sauce Awards and how to apply to become a judge.',
};

const JudgingPage = () => {
  return (
    <div className="bg-[#08040e] min-h-screen">
      <Hero title="The Judges" subtitle="European Hot Sauce Awards: Judging Opportunity" />

      <div className="space-y-10 md:space-y-16 py-10 md:py-16">
        <SectionContainer>
          <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur">
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-6">About Our Judging Process</h2>
            <p className="text-center text-base text-white/75 sm:text-lg max-w-3xl mx-auto mb-8">
              The European Hot Sauce Awards brings together a distinguished panel of culinary experts, food professionals, and chili sauce enthusiasts to evaluate our exceptional entries. Our comprehensive judging process combines:
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">👨‍🍳</div>
                <p className="text-white/80 text-sm">Professional Expert Evaluation</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">👅</div>
                <p className="text-white/80 text-sm">Specialized Tasting Techniques</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">📊</div>
                <p className="text-white/80 text-sm">Comprehensive Scoring Methodology</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <div className="text-2xl mb-2">🗳️</div>
                <p className="text-white/80 text-sm">Public Audience Vote</p>
              </div>
            </div>
          </div>
        </SectionContainer>

        <SectionContainer>
          <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur">
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-6">Judging Criteria</h2>
            <p className="text-center text-base text-white/75 sm:text-lg mb-8">Our judges assess entries based on:</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <p className="text-white/80 font-semibold">🌶️ Flavor complexity</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <p className="text-white/80 font-semibold">🔥 Heat balance</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <p className="text-white/80 font-semibold">✨ Ingredient quality</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <p className="text-white/80 font-semibold">💡 Originality</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <p className="text-white/80 font-semibold">👁️ Visual presentation</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center">
                <p className="text-white/80 font-semibold">👃 Aroma</p>
              </div>
              <div className="bg-black/30 p-4 rounded-lg text-center md:col-span-2">
                <p className="text-white/80 font-semibold">🎯 Overall sensory experience</p>
              </div>
            </div>
          </div>
        </SectionContainer>

        <SectionContainer>
          <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur">
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-8">Become a Judge</h2>
            <div className="grid md:grid-cols-2 gap-8 mb-8">
              <div className="bg-black/30 p-6 rounded-lg">
                <h3 className="font-semibold text-lg text-amber-200 mb-3">Who We're Looking For</h3>
                <p className="text-white/75 leading-relaxed">
                  We welcome applications from professional chefs, food critics, culinary educators, and passionate enthusiasts with demonstrable expertise in the world of hot sauces and spicy foods.
                </p>
              </div>
              <div className="bg-black/30 p-6 rounded-lg">
                <h3 className="font-semibold text-lg text-amber-200 mb-3">Requirements</h3>
                <ul className="space-y-2 text-white/75">
                  <li className="flex items-start">
                    <span className="text-amber-200 mr-2">•</span>
                    <span>Demonstrated knowledge of hot sauces</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-200 mr-2">•</span>
                    <span>Refined palate and tasting skills</span>
                  </li>
                  <li className="flex items-start">
                    <span className="text-amber-200 mr-2">•</span>
                    <span>Ability to provide objective, detailed feedback</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="text-center">
              <Link href="/apply/judge" className="inline-block rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:from-[#ff7033] hover:to-[#ffd060]">
                Complete Application Form
              </Link>
            </div>
          </div>
        </SectionContainer>
      </div>
    </div>
  );
};

export default JudgingPage;

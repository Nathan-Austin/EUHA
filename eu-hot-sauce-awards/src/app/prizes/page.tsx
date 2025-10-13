
import Hero from '@/components/Hero';
import SectionContainer from '@/components/SectionContainer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Prizes & Recognition',
  description: 'Learn about the awards structure for the EU Hot Sauce Awards, including Gold, Silver, and Bronze medals, and the coveted Global Rankings.',
};

const PrizesPage = () => {
  return (
    <div className="bg-[#08040e] min-h-screen">
      <Hero title="Prizes & Recognition" />

      <div className="space-y-10 md:space-y-16 py-10 md:py-16">
        <SectionContainer>
          <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur">
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-8">Award Levels</h2>
            <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              <div className="bg-black/30 p-6 rounded-lg text-center">
                <div className="text-2xl mb-2">🥇</div>
                <h3 className="font-bold text-lg text-amber-200 mb-2">Gold Medal Best in Category</h3>
                <p className="text-white/70 text-sm mb-1">⭐⭐⭐⭐⭐</p>
                <p className="text-white/80">1st place winner</p>
              </div>
              <div className="bg-black/30 p-6 rounded-lg text-center">
                <div className="text-2xl mb-2">🥇</div>
                <h3 className="font-bold text-lg text-amber-200 mb-2">Gold Medal</h3>
                <p className="text-white/70 text-sm mb-1">⭐⭐⭐⭐</p>
                <p className="text-white/80">2 winners per category</p>
              </div>
              <div className="bg-black/30 p-6 rounded-lg text-center">
                <div className="text-2xl mb-2">🥈</div>
                <h3 className="font-bold text-lg text-amber-200 mb-2">Silver Medal</h3>
                <p className="text-white/70 text-sm mb-1">⭐⭐⭐</p>
                <p className="text-white/80">3 winners per category</p>
              </div>
              <div className="bg-black/30 p-6 rounded-lg text-center">
                <div className="text-2xl mb-2">🥉</div>
                <h3 className="font-bold text-lg text-amber-200 mb-2">Bronze Medal</h3>
                <p className="text-white/70 text-sm mb-1">⭐⭐</p>
                <p className="text-white/80">6 winners per category</p>
              </div>
            </div>
          </div>
        </SectionContainer>

        <SectionContainer>
          <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur">
            <h2 className="text-center text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-6">Winner's Package</h2>
            <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto text-center">
              <div className="bg-black/30 p-6 rounded-lg">
                <div className="text-3xl mb-3">📜</div>
                <h3 className="font-semibold text-white mb-2">Commemorative Certificate</h3>
                <p className="text-white/70 text-sm">Official recognition of your achievement</p>
              </div>
              <div className="bg-black/30 p-6 rounded-lg">
                <div className="text-3xl mb-3">🏷️</div>
                <h3 className="font-semibold text-white mb-2">Winner's Merchandise</h3>
                <p className="text-white/70 text-sm">Exclusive bottle stickers to showcase your award</p>
              </div>
              <div className="bg-black/30 p-6 rounded-lg">
                <div className="text-3xl mb-3">📢</div>
                <h3 className="font-semibold text-white mb-2">Digital Marketing Kit</h3>
                <p className="text-white/70 text-sm">Digital badges and press releases</p>
              </div>
            </div>
          </div>
        </SectionContainer>

        <SectionContainer>
          <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur text-center">
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-6">Global Rankings</h2>
            <p className="text-base text-white/75 sm:text-lg max-w-2xl mx-auto mb-8">
              The top 20 sauces from the competition receive a special certificate and a prestigious placement in our international rankings, showcasing them to a global audience of hot sauce enthusiasts and industry professionals.
            </p>
            <Link href="/rankings" className="text-xs uppercase tracking-[0.2em] text-amber-200/70 transition hover:text-amber-200">
              View Current Rankings &rarr;
            </Link>
          </div>
        </SectionContainer>

        <SectionContainer>
          <div className="text-center">
            <Link href="/apply/supplier" className="rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:from-[#ff7033] hover:to-[#ffd060]">
              Enter Competition
            </Link>
          </div>
        </SectionContainer>
      </div>
    </div>
  );
};

export default PrizesPage;

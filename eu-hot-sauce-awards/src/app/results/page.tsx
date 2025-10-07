
import Hero from '@/components/Hero';
import SectionContainer from '@/components/SectionContainer';
import Link from 'next/link';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Past Results',
  description: 'Browse the archives of past winners from the EU Hot Sauce Awards.',
};

// Mock data
const availableYears = [2025, 2024];

const ResultsPage = () => {
  return (
    <div className="bg-[#08040e] min-h-screen">
      <Hero title="Past Results" />

      <div className="space-y-10 md:space-y-16 py-10 md:py-16">
        <SectionContainer>
          <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur text-center">
            <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-8">Select a Year</h2>
            <div className="flex flex-wrap justify-center gap-6">
              {availableYears.map(year => (
                <Link key={year} href={`/results/${year}`}>
                  <div className="bg-black/30 p-10 rounded-2xl text-4xl font-bold text-white hover:bg-black/40 hover:text-amber-200 transition-all border border-white/10 hover:border-amber-200/50">
                    {year}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </SectionContainer>
      </div>
    </div>
  );
};

export default ResultsPage;

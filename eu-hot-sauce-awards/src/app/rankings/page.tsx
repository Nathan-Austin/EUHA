
import Hero from '@/components/Hero';
import SectionContainer from '@/components/SectionContainer';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';
import { COMPETITION_YEAR } from '@/lib/config';

export const metadata: Metadata = {
  title: 'Global Rankings | EU Hot Sauce Awards',
  description: 'Discover the top 20 hot sauces from the European Hot Sauce Awards global rankings.',
};

interface RankedSauce {
  id: string;
  global_rank: number;
  code: string;
  entry_name: string;
  company_name: string;
  country: string | null;
  category: string;
  award: string;
  product_image_url: string | null;
  short_description: string | null;
  product_url: string | null;
  website: string | null;
  year: number;
}

async function getTopRankings(year: number = 2025) {
  const { cookies } = await import('next/headers');
  const supabase = createClient(cookies());

  const { data, error } = await supabase
    .from('past_results')
    .select('*')
    .eq('year', year)
    .not('global_rank', 'is', null)
    .order('global_rank', { ascending: true })
    .limit(20);

  if (error) {
    console.error('Error fetching rankings:', error);
    return [];
  }

  return data as RankedSauce[];
}

const RankingsPage = async () => {
  const rankings = await getTopRankings();

  const getCountryFlag = (country: string | null) => {
    if (!country) return '';
    const countryFlags: { [key: string]: string } = {
      'Germany': '🇩🇪',
      'UK': '🇬🇧',
      'Poland': '🇵🇱',
      'Austria': '🇦🇹',
      'Norway': '🇳🇴',
      'Netherlands': '🇳🇱',
      'Belgium': '🇧🇪',
      'France': '🇫🇷',
      'Italy': '🇮🇹',
      'Spain': '🇪🇸',
      'USA': '🇺🇸',
      'Northern Ireland': '🇬🇧',
      'Ireland': '🇮🇪',
    };
    return countryFlags[country] || '🌍';
  };

  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };
  return (
    <div className="bg-[#08040e] min-h-screen">
      <Hero
        title="Global Rankings"
        subtitle={`Top ${rankings.length} Hot Sauces of ${COMPETITION_YEAR}`}
      />

      <div className="space-y-10 md:space-y-16 py-10 md:py-16">
        <SectionContainer>
          <div className="max-w-6xl mx-auto">
            <div className="flex justify-center mb-8">
              <div className="bg-black/30 py-3 px-6 rounded-full border border-white/20">
                <span className="text-xl font-bold text-amber-200 uppercase tracking-wider">{COMPETITION_YEAR} Rankings</span>
              </div>
            </div>

            {rankings.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-white/70 text-lg">Rankings will be available after the competition.</p>
                <Link href="/results" className="mt-4 inline-block text-amber-200 hover:text-amber-100">
                  View all results →
                </Link>
              </div>
            ) : (
              <>
                <div className="rounded-3xl border border-white/15 bg-white/[0.07] backdrop-blur overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="min-w-full">
                      <thead className="bg-black/30 border-b border-white/20">
                        <tr>
                          <th className="p-4 text-left text-xs uppercase tracking-wider text-white/60">Rank</th>
                          <th className="p-4 text-left text-xs uppercase tracking-wider text-white/60">Product</th>
                          <th className="p-4 text-left text-xs uppercase tracking-wider text-white/60">Company</th>
                          <th className="p-4 text-left text-xs uppercase tracking-wider text-white/60">Category</th>
                          <th className="p-4 text-center text-xs uppercase tracking-wider text-white/60">Award</th>
                        </tr>
                      </thead>
                      <tbody>
                        {rankings.map((sauce) => (
                          <tr
                            key={sauce.id}
                            className={`border-b border-white/5 ${sauce.global_rank <= 3 ? 'bg-amber-200/5' : 'hover:bg-white/5'} transition cursor-pointer group`}
                          >
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <span className={`font-bold text-2xl ${sauce.global_rank <= 3 ? 'text-amber-200' : 'text-white/80'}`}>
                                  #{sauce.global_rank}
                                </span>
                                <span className="text-2xl">{getMedalIcon(sauce.global_rank)}</span>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-4">
                                {sauce.code && (
                                  <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-black/20 flex-shrink-0">
                                    <Image
                                      src={`/images/${sauce.code}.jpg`}
                                      alt={sauce.entry_name}
                                      fill
                                      className="object-contain"
                                    />
                                  </div>
                                )}
                                <div>
                                  <div className="font-semibold text-white group-hover:text-amber-200 transition">
                                    {sauce.entry_name}
                                  </div>
                                  {sauce.short_description && (
                                    <div className="text-xs text-white/60 line-clamp-1 mt-1 max-w-xs">
                                      {sauce.short_description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-white/80">
                                {sauce.company_name}
                                {sauce.country && (
                                  <span className="ml-2">{getCountryFlag(sauce.country)}</span>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-white/70 text-sm">{sauce.category}</div>
                            </td>
                            <td className="p-4 text-center">
                              <span className="inline-block px-3 py-1 rounded-full bg-amber-200/20 text-amber-200 text-xs font-semibold uppercase tracking-wider">
                                {sauce.award}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="mt-8 rounded-3xl border border-white/15 bg-white/[0.07] p-8 backdrop-blur">
                  <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-4">Methodology</h3>
                  <p className="text-white/75 leading-relaxed mb-4">
                    The Global Rankings represent the top 20 sauces from the European Hot Sauce Awards, selected through our comprehensive judging process. These rankings are determined by a weighted average of scores from our expert panel of professional tasters, community judges, and industry suppliers.
                  </p>
                  <p className="text-white/75 leading-relaxed">
                    Each sauce is evaluated across multiple criteria including flavor complexity, heat balance, ingredient quality, originality, and overall sensory experience. The top 20 sauces receive special recognition and a coveted placement certificate.
                  </p>
                </div>

                <div className="mt-8 text-center">
                  <Link
                    href={`/results/${COMPETITION_YEAR}`}
                    className="inline-block rounded-full bg-gradient-to-r from-[#ff4d00] to-[#f1b12e] px-8 py-4 text-sm font-semibold uppercase tracking-[0.2em] text-white transition hover:from-[#ff7033] hover:to-[#ffd060]"
                  >
                    View All {COMPETITION_YEAR} Results
                  </Link>
                </div>
              </>
            )}
          </div>
        </SectionContainer>
      </div>
    </div>
  );
};

export default RankingsPage;

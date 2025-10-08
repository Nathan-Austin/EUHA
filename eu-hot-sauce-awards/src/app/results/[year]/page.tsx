
import Hero from '@/components/Hero';
import SectionContainer from '@/components/SectionContainer';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import Image from 'next/image';
import Link from 'next/link';

type Props = {
    params: { year: string };
};

interface PastResult {
  id: string;
  code: string;
  area: string;
  category: string;
  award: string;
  position: number;
  global_rank: number | null;
  company_name: string;
  country: string | null;
  entry_name: string;
  short_description: string | null;
  flavor_profile: string | null;
  product_image_url: string | null;
  product_url: string | null;
  website: string | null;
}

interface CategoryResults {
  category: string;
  winners: PastResult[];
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const year = params.year;
    return {
        title: `${year} Winners | EU Hot Sauce Awards`,
        description: `See the full list of award-winning hot sauces from the ${year} European Hot Sauce Awards competition.`,
    };
}

async function getResultsByYear(year: string) {
  const { cookies } = await import('next/headers');
  const supabase = createClient(cookies());

  const { data, error } = await supabase
    .from('past_results')
    .select('*')
    .eq('year', parseInt(year))
    .order('category', { ascending: true })
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching results:', error);
    return [];
  }

  return data as PastResult[];
}

// The page component receives params from the dynamic route
const YearResultsPage = async ({ params }: { params: { year: string } }) => {
  const { year } = params;
  const results = await getResultsByYear(year);

  // Group results by category
  const categorizedResults: CategoryResults[] = [];
  const categoryMap = new Map<string, PastResult[]>();

  results.forEach((result) => {
    if (!categoryMap.has(result.category)) {
      categoryMap.set(result.category, []);
    }
    categoryMap.get(result.category)!.push(result);
  });

  categoryMap.forEach((winners, category) => {
    categorizedResults.push({ category, winners });
  });

  const getAwardIcon = (award: string) => {
    if (award.includes('GOLD')) return '🥇';
    if (award.includes('SILVER')) return '🥈';
    if (award.includes('BRONZE')) return '🥉';
    return '🏆';
  };

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

  if (categorizedResults.length === 0) {
    return (
      <div className="bg-[#08040e] min-h-screen">
        <Hero title={`${year} Winners`} />
        <SectionContainer>
          <div className="text-center py-20">
            <p className="text-white/70 text-lg">No results found for {year}</p>
            <Link href="/results" className="mt-4 inline-block text-amber-200 hover:text-amber-100">
              ← Back to all results
            </Link>
          </div>
        </SectionContainer>
      </div>
    );
  }

  return (
    <div className="bg-[#08040e] min-h-screen">
      <Hero title={`${year} Winners`} subtitle={`${results.length} award-winning sauces`} />

      <div className="space-y-10 md:space-y-16 py-10 md:py-16">
        <SectionContainer>
          {categorizedResults.map((categoryGroup, idx) => (
            <div key={categoryGroup.category} className={idx > 0 ? 'mt-12' : ''}>
              <div className="rounded-3xl border border-white/15 bg-white/[0.07] p-8 md:p-12 backdrop-blur">
                <h2 className="text-sm font-semibold uppercase tracking-[0.25em] text-amber-200/80 mb-8 text-center">
                  {categoryGroup.category}
                </h2>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {categoryGroup.winners.map((winner) => (
                    <div
                      key={winner.id}
                      className="bg-black/30 p-6 rounded-lg border border-white/10 hover:border-amber-200/30 transition group cursor-pointer"
                    >
                      {/* Product Image */}
                      {winner.product_image_url && (
                        <div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden bg-black/20">
                          <Image
                            src={winner.product_image_url}
                            alt={winner.entry_name}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform"
                          />
                        </div>
                      )}

                      {/* Award Icon & Rank */}
                      <div className="text-center mb-3">
                        <div className="text-3xl mb-1">{getAwardIcon(winner.award)}</div>
                        {winner.global_rank && (
                          <div className="text-xs uppercase tracking-wider text-amber-200 font-bold">
                            Global Rank #{winner.global_rank}
                          </div>
                        )}
                      </div>

                      {/* Product Name */}
                      <h3 className="text-lg font-bold text-white mb-1 text-center line-clamp-2">
                        {winner.entry_name}
                      </h3>

                      {/* Company & Country */}
                      <p className="text-sm text-white/70 text-center mb-3">
                        by {winner.company_name} {getCountryFlag(winner.country)}
                      </p>

                      {/* Award Badge */}
                      <div className="text-center mb-3">
                        <span className="inline-block px-3 py-1 rounded-full bg-amber-200/20 text-amber-200 text-xs font-semibold uppercase tracking-wider">
                          {winner.award}
                        </span>
                      </div>

                      {/* Description */}
                      {winner.short_description && (
                        <p className="text-xs text-white/60 text-center line-clamp-3 mb-3">
                          {winner.short_description}
                        </p>
                      )}

                      {/* Links */}
                      <div className="flex justify-center gap-2 mt-4">
                        {winner.product_url && (
                          <a
                            href={winner.product_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-amber-200 hover:text-amber-100 transition"
                          >
                            View Product →
                          </a>
                        )}
                        {winner.website && (
                          <a
                            href={winner.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs text-white/60 hover:text-white/80 transition"
                          >
                            Website
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </SectionContainer>
      </div>
    </div>
  );
};

export default YearResultsPage;

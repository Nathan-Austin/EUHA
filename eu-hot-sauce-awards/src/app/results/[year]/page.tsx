
import Hero from '@/components/Hero';
import SectionContainer from '@/components/SectionContainer';
import ResultsFilter from '@/components/ResultsFilter';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
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

  if (results.length === 0) {
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
          <ResultsFilter results={results} />
        </SectionContainer>
      </div>
    </div>
  );
};

export default YearResultsPage;

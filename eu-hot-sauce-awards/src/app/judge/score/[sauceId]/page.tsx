import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation';
import ScoringForm from './ScoringForm';

interface ScorePageProps {
  params: {
    sauceId: string;
  }
}

export default async function ScorePage({ params }: ScorePageProps) {
  const { sauceId } = params;
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Fetch sauce details and categories in parallel
  const [
    { data: sauce, error: sauceError },
    { data: categories, error: categoriesError }
  ] = await Promise.all([
    supabase.from('sauces').select('*, suppliers(brand_name)').eq('id', sauceId).single(),
    supabase.from('judging_categories').select('*')
  ]);

  if (sauceError || !sauce || categoriesError || !categories) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold">{sauce.name}</h1>
          <p className="text-lg text-gray-600">by {sauce.suppliers[0]?.brand_name}</p>
          <div className="mt-4 pt-4 border-t">
            <h2 className="text-2xl font-semibold mb-4">Submit Your Scores</h2>
            <ScoringForm
              sauceId={sauce.id}
              sauceName={sauce.name}
              categories={categories}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

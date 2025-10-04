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

  // Get current user/judge
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    notFound();
  }

  const { data: judge } = await supabase
    .from('judges')
    .select('id')
    .eq('email', user.email)
    .single();

  if (!judge) {
    notFound();
  }

  // Fetch sauce details and categories in parallel
  const [
    { data: sauce, error: sauceError },
    { data: categories, error: categoriesError },
    { data: existingScores }
  ] = await Promise.all([
    supabase.from('sauces').select('id, name, supplier_id, suppliers(brand_name)').eq('id', sauceId).single(),
    supabase.from('judging_categories').select('*'),
    supabase.from('judging_scores').select('id').eq('judge_id', judge.id).eq('sauce_id', sauceId).limit(1)
  ]);

  // Log errors for debugging
  if (sauceError) {
    console.error('Sauce query error:', sauceError);
  }
  if (categoriesError) {
    console.error('Categories query error:', categoriesError);
  }

  if (sauceError || !sauce || categoriesError || !categories) {
    notFound();
  }

  // Check if judge has already scored this sauce
  const alreadyScored = existingScores && existingScores.length > 0;

  // Get brand name safely
  const brandName = Array.isArray(sauce.suppliers) && sauce.suppliers.length > 0
    ? sauce.suppliers[0]?.brand_name
    : (sauce.suppliers as any)?.brand_name || 'Unknown Brand';

  if (alreadyScored) {
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-300 p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-yellow-800 mb-4">Already Scored</h1>
            <p className="text-yellow-700 mb-4">
              You have already submitted scores for <strong>{sauce.name}</strong> by {brandName}.
            </p>
            <p className="text-sm text-yellow-600 mb-6">
              Each sauce can only be scored once. If you need to update your score, please contact an administrator.
            </p>
            <a
              href="/judge/scan"
              className="inline-block px-6 py-3 bg-yellow-600 text-white font-semibold rounded-md hover:bg-yellow-700"
            >
              Scan Next Sauce
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <h1 className="text-3xl font-bold text-gray-900">{sauce.name}</h1>
          <p className="text-lg text-gray-700">by {brandName}</p>
          <div className="mt-4 pt-4 border-t border-gray-300">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">Submit Your Scores</h2>
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

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
    .select('id, type, open_judging')
    .ilike('email', user.email)
    .single();

  if (!judge) {
    notFound();
  }

  const OPEN_JUDGING_LIMIT = 10;

  // Fetch sauce details, categories, and verify assignment in parallel
  // IMPORTANT: Only allow scoring of PAID sauces
  const [
    { data: sauce, error: sauceError },
    { data: categories, error: categoriesError },
    { data: existingScores },
    { data: existingScoreValues },
    { data: assignment, error: assignmentError },
    { count: scoredSauceCount }
  ] = await Promise.all([
    supabase.from('sauces').select('id, name, sauce_code, payment_status, event_open, supplier_id, ingredients, allergens, suppliers(brand_name)').eq('id', sauceId).or('payment_status.eq.paid,event_open.eq.true').single(),
    supabase.from('judging_categories').select('*'),
    supabase.from('judging_scores').select('id').eq('judge_id', judge.id).eq('sauce_id', sauceId).limit(1),
    supabase.from('judging_scores').select('category_id, score, comments').eq('judge_id', judge.id).eq('sauce_id', sauceId),
    supabase.from('box_assignments').select('id').eq('judge_id', judge.id).eq('sauce_id', sauceId).single(),
    judge.open_judging
      ? supabase.from('judging_scores').select('sauce_id', { count: 'exact', head: true }).eq('judge_id', judge.id)
      : Promise.resolve({ count: 0 })
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

  // For open judging judges, check sauce limit instead of assignment
  // Event judges (type === 'event') have no limit — they score all sauces at the live event
  if (judge.open_judging) {
    const alreadyScoredThis = existingScores && existingScores.length > 0;
    if (!alreadyScoredThis && judge.type !== 'event' && (scoredSauceCount ?? 0) >= OPEN_JUDGING_LIMIT) {
      return (
        <div className="container mx-auto p-4 md:p-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-red-50 border border-red-300 p-8 rounded-lg shadow-md">
              <h1 className="text-2xl font-bold text-red-800 mb-4">Limit Reached</h1>
              <p className="text-red-700 mb-4">
                You have already scored {OPEN_JUDGING_LIMIT} sauces, which is the maximum for your judging box.
              </p>
              <p className="text-sm text-red-600 mb-6">
                If you believe this is an error, please contact an administrator.
              </p>
              <a
                href="/dashboard"
                className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700"
              >
                Return to Dashboard
              </a>
            </div>
          </div>
        </div>
      );
    }
  } else if (assignmentError || !assignment) {
    // Check if this sauce is assigned to the judge
    return (
      <div className="container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="bg-red-50 border border-red-300 p-8 rounded-lg shadow-md">
            <h1 className="text-2xl font-bold text-red-800 mb-4">Not Assigned</h1>
            <p className="text-red-700 mb-4">
              This sauce is not assigned to you. Please only score sauces in your judging box.
            </p>
            <p className="text-sm text-red-600 mb-6">
              If you believe this is an error, please contact an administrator.
            </p>
            <a
              href="/dashboard"
              className="inline-block px-6 py-3 bg-red-600 text-white font-semibold rounded-md hover:bg-red-700"
            >
              Return to Dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Check if judge has already scored this sauce
  const alreadyScored = existingScores && existingScores.length > 0;

  // Build initial scores map from DB values (used when re-editing)
  const initialScores: Record<string, number> = {};
  let initialComment = '';
  if (alreadyScored && existingScoreValues) {
    for (const row of existingScoreValues) {
      initialScores[row.category_id] = row.score;
    }
    initialComment = existingScoreValues[0]?.comments || '';
  }

  // Get brand name safely
  const brandName = Array.isArray(sauce.suppliers) && sauce.suppliers.length > 0
    ? sauce.suppliers[0]?.brand_name
    : (sauce.suppliers as any)?.brand_name || 'Unknown Brand';

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="mb-6">
            <div className="inline-block px-4 py-2 bg-orange-100 border-2 border-orange-600 rounded-lg mb-3">
              <p className="text-2xl font-bold text-orange-900">Code: {sauce.sauce_code || 'N/A'}</p>
            </div>
            <p className="text-lg text-gray-700">by {brandName}</p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-300">
            <h2 className="text-2xl font-semibold mb-4 text-gray-900">
              {alreadyScored ? 'Edit Your Scores' : 'Submit Your Scores'}
            </h2>
            {alreadyScored && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-300 rounded-md text-yellow-800 text-sm">
                You have already submitted scores for this sauce. You can update them below.
              </div>
            )}
            <ScoringForm
              sauceId={sauce.id}
              sauceCode={sauce.sauce_code || 'N/A'}
              categories={categories}
              ingredients={sauce.ingredients || null}
              allergens={sauce.allergens || null}
              initialScores={alreadyScored ? initialScores : undefined}
              initialComment={alreadyScored ? initialComment : undefined}
              isEdit={alreadyScored ?? false}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

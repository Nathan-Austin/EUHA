'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

type SauceStatus = 'registered' | 'arrived' | 'boxed' | 'judged';

export async function updateSauceStatus(sauceId: string, newStatus: SauceStatus) {
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Check if the user is an admin before proceeding
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You must be logged in to perform this action.' };
  }
  const { data: judge, error: judgeError } = await supabase
    .from('judges')
    .select('type')
    .eq('id', user.id)
    .single();

  if (judgeError || judge?.type !== 'admin') {
    return { error: 'You are not authorized to perform this action.' };
  }

  // Update the sauce status
  const { error } = await supabase
    .from('sauces')
    .update({ status: newStatus })
    .eq('id', sauceId)

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function assignSaucesToBox(formData: FormData) {
  const boxLabel = formData.get('boxLabel') as string;
  const sauceIds = formData.getAll('sauceIds') as string[];

  if (!boxLabel || sauceIds.length === 0) {
    return { error: 'Box label and at least one sauce are required.' };
  }

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  // Admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You must be logged in.' };
  }
  const { data: judge, error: judgeError } = await supabase
    .from('judges')
    .select('type')
    .eq('id', user.id)
    .single();

  if (judgeError || judge?.type !== 'admin') {
    return { error: 'You are not authorized.' };
  }

  // Prepare data for upsert
  const assignments = sauceIds.map(sauceId => ({
    sauce_id: sauceId,
    box_label: boxLabel,
  }));

  // Upsert into box_assignments
  const { error: upsertError } = await supabase
    .from('box_assignments')
    .upsert(assignments, { onConflict: 'sauce_id' });

  if (upsertError) {
    return { error: `Failed to assign sauces: ${upsertError.message}` };
  }

  // Update status of the sauces to 'boxed'
  const { error: updateError } = await supabase
    .from('sauces')
    .update({ status: 'boxed' })
    .in('id', sauceIds);

  if (updateError) {
    return { error: `Failed to update sauce status: ${updateError.message}` };
  }

  revalidatePath('/dashboard');
  return { success: true };
}



interface StoredScoreData {
  sauceId: string;
  sauceName: string;
  scores: Record<string, number>;
  comment: string;
}

export async function submitAllScores(scoresJSON: string) {
  const storedScores: StoredScoreData[] = JSON.parse(scoresJSON);

  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { error: 'You must be logged in to submit scores.' };
  }

  const scoresToInsert = storedScores.flatMap(sauceScore => {
    const { sauceId, scores, comment } = sauceScore;
    return Object.entries(scores).map(([categoryId, score]) => ({
      sauce_id: sauceId,
      judge_id: user.id,
      category_id: categoryId,
      score: score,
      comments: comment,
    }));
  });

  if (scoresToInsert.length === 0) {
    return { error: 'No scores to submit.' };
  }

  const { error } = await supabase
    .from('judging_scores')
    .insert(scoresToInsert);

  if (error) {
    if (error.code === '23505') {
      return { error: 'One or more of these sauces have already been scored by you. Your pending scores have not been cleared.' };
    }
    return { error: `Failed to submit scores: ${error.message}` };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

export async function exportResults() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'You must be logged in.' };
  const { data: adminCheck, error: adminError } = await supabase.from('judges').select('type').eq('id', user.id).single();
  if (adminError || adminCheck?.type !== 'admin') return { error: 'You are not authorized.' };

  // 1. Fetch all scores with judge and category info
  const { data: scoresData, error: scoresError } = await supabase
    .from('judging_scores')
    .select(`
      score,
      sauce_id,
      sauces ( name, suppliers ( brand_name ) ),
      judges ( type ),
      judging_categories ( name, weight )
    `);

  if (scoresError) return { error: `Error fetching scores: ${scoresError.message}` };
  if (!scoresData || scoresData.length === 0) return { error: 'No scores to export.' };

  // 2. Process data
  const JUDGE_WEIGHTS = { pro: 0.8, community: 1.5, supplier: 0.8 };
  const sauceAggregates = new Map();

  // First pass: group all scores by sauce
  scoresData.forEach(item => {
    if (!item.sauces || !item.judges || !item.judging_categories) return;
    const { sauce_id, sauces, judges, score } = item;

    if (!sauceAggregates.has(sauce_id)) {
      sauceAggregates.set(sauce_id, {
        name: sauces.name,
        brand: sauces.suppliers.brand_name,
        scoresByJudgeType: { pro: [], community: [], supplier: [] }
      });
    }
    const sauce = sauceAggregates.get(sauce_id);
    if (sauce.scoresByJudgeType[judges.type]) {
      sauce.scoresByJudgeType[judges.type].push(score);
    }
  });

  // 3. Calculate final scores and prepare rows
  const finalResults = [];

  for (const [sauceId, sauceData] of sauceAggregates.entries()) {
    const row: any = {
      Brand: sauceData.brand,
      Sauce: sauceData.name,
      'Avg Pro Score': 'N/A',
      'Avg Community Score': 'N/A',
      'Avg Supplier Score': 'N/A',
      'Final Weighted Score': 0,
    };

    let finalWeightedSum = 0;
    let finalWeightDivisor = 0;

    for (const type of ['pro', 'community', 'supplier']) {
        const scores = sauceData.scoresByJudgeType[type];
        if (scores.length > 0) {
            const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
            row[`Avg ${type.charAt(0).toUpperCase() + type.slice(1)} Score`] = avg.toFixed(2);
            
            finalWeightedSum += avg * scores.length * JUDGE_WEIGHTS[type];
            finalWeightDivisor += scores.length * JUDGE_WEIGHTS[type];
        }
    }

    row['Final Weighted Score'] = (finalWeightDivisor > 0 ? finalWeightedSum / finalWeightDivisor : 0).toFixed(2);
    finalResults.push(row);
  }

  // 4. Sort and convert to CSV
  finalResults.sort((a, b) => b['Final Weighted Score'] - a['Final Weighted Score']);

  const headers = ['Brand', 'Sauce', 'Final Weighted Score', 'Avg Pro Score', 'Avg Community Score', 'Avg Supplier Score'];
  const csvRows = [headers.join(',')];
  finalResults.forEach(row => {
    const csvRow = headers.map(header => (String(row[header] || 'N/A')).includes(',') ? `"${row[header]}"` : row[header]).join(',');
    csvRows.push(csvRow);
  });

  return { csv: csvRows.join('\n') };
}

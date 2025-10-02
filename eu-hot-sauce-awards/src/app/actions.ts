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
  if (!user?.email) {
    return { error: 'You must be logged in to perform this action.' };
  }
  const { data: judge, error: judgeError } = await supabase
    .from('judges')
    .select('type')
    .eq('email', user.email)
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
  if (!user?.email) {
    return { error: 'You must be logged in.' };
  }
  const { data: judge, error: judgeError } = await supabase
    .from('judges')
    .select('type')
    .eq('email', user.email)
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
  if (!user?.email) {
    return { error: 'You must be logged in to submit scores.' };
  }

  const { data: judge, error: judgeError } = await supabase
    .from('judges')
    .select('id')
    .eq('email', user.email)
    .single();

  if (judgeError || !judge) {
    return { error: 'Unable to identify your judge profile. Please contact support.' };
  }

  const scoresToInsert = storedScores.flatMap(sauceScore => {
    const { sauceId, scores, comment } = sauceScore;
    return Object.entries(scores).map(([categoryId, score]) => ({
      sauce_id: sauceId,
      judge_id: judge.id,
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

interface ResultRow {
  Brand: string;
  Sauce: string;
  'Avg Pro Score': string | number;
  'Avg Community Score': string | number;
  'Avg Supplier Score': string | number;
  'Final Weighted Score': string | number;
  [key: string]: string | number;
}

export async function exportResults() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: 'You must be logged in.' };
  const { data: adminCheck, error: adminError } = await supabase.from('judges').select('type').eq('email', user.email).single();
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

  type JudgeType = 'pro' | 'community' | 'supplier';
  type JudgeRecord = { type: JudgeType | 'admin' | null };
  type SupplierRecord = { brand_name: string | null };
  type SauceRecord = { name: string | null; suppliers: SupplierRecord | SupplierRecord[] | null };

  const normalise = <T>(value: T | T[] | null | undefined): T | null => {
    if (Array.isArray(value)) {
      return value[0] ?? null;
    }
    return value ?? null;
  };

  // 2. Process data
  const JUDGE_WEIGHTS: Record<JudgeType, number> = { pro: 0.8, community: 1.5, supplier: 0.8 };
  const sauceAggregates = new Map<string, {
    name: string;
    brand: string;
    scoresByJudgeType: Record<JudgeType, number[]>;
  }>();

  scoresData.forEach((item) => {
    const sauceRecord = normalise<SauceRecord>(item.sauces as SauceRecord | SauceRecord[] | null);
    const judgeRecord = normalise<JudgeRecord>(item.judges as JudgeRecord | JudgeRecord[] | null);

    if (!sauceRecord || !judgeRecord) {
      return;
    }

    const judgeType = judgeRecord.type as JudgeType;
    if (!judgeType || !(judgeType in JUDGE_WEIGHTS)) {
      return;
    }

    const supplierRecord = normalise<SupplierRecord>(sauceRecord.suppliers);
    const sauceName = sauceRecord.name ?? 'Unknown Sauce';
    const brandName = supplierRecord?.brand_name ?? 'Unknown Brand';
    const scoreValue = typeof item.score === 'number' ? item.score : null;

    if (!sauceAggregates.has(item.sauce_id)) {
      sauceAggregates.set(item.sauce_id, {
        name: sauceName,
        brand: brandName,
        scoresByJudgeType: { pro: [], community: [], supplier: [] },
      });
    }

    if (scoreValue !== null) {
      sauceAggregates.get(item.sauce_id)!.scoresByJudgeType[judgeType].push(scoreValue);
    }
  });

  // 3. Calculate final scores and prepare rows
  const finalResults = [];

  for (const [sauceId, sauceData] of sauceAggregates.entries()) {
    const row: ResultRow = {
      Brand: sauceData.brand,
      Sauce: sauceData.name,
      'Avg Pro Score': 'N/A',
      'Avg Community Score': 'N/A',
      'Avg Supplier Score': 'N/A',
      'Final Weighted Score': 0,
    };

    let finalWeightedSum = 0;
    let finalWeightDivisor = 0;

    for (const type of ['pro', 'community', 'supplier'] as const) {
        const scores = sauceData.scoresByJudgeType[type];
        if (scores.length > 0) {
            const avg = scores.reduce((a: number, b: number) => a + b, 0) / scores.length;
            row[`Avg ${type.charAt(0).toUpperCase() + type.slice(1)} Score`] = avg.toFixed(2);
            
            finalWeightedSum += avg * scores.length * JUDGE_WEIGHTS[type];
            finalWeightDivisor += scores.length * JUDGE_WEIGHTS[type];
        }
    }

    row['Final Weighted Score'] = (finalWeightDivisor > 0 ? finalWeightedSum / finalWeightDivisor : 0).toFixed(2);
    finalResults.push(row);
  }

  // 4. Sort and convert to CSV
  finalResults.sort((a, b) => Number(b['Final Weighted Score']) - Number(a['Final Weighted Score']));

  const headers = ['Brand', 'Sauce', 'Final Weighted Score', 'Avg Pro Score', 'Avg Community Score', 'Avg Supplier Score'];
  const csvRows = [headers.join(',')];
  finalResults.forEach(row => {
    const csvRow = headers.map(header => (String(row[header] || 'N/A')).includes(',') ? `"${row[header]}"` : row[header]).join(',');
    csvRows.push(csvRow);
  });

  return { csv: csvRows.join('\n') };
}

export async function addAdminUser(email: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Check if current user is admin
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: 'You must be logged in.' };

  const { data: adminCheck, error: adminError } = await supabase
    .from('judges')
    .select('type')
    .eq('email', user.email)
    .single();

  if (adminError || adminCheck?.type !== 'admin') {
    return { error: 'You are not authorized to add admin users.' };
  }

  if (!email || !email.includes('@')) {
    return { error: 'Please provide a valid email address.' };
  }

  // Check if user already exists
  const { data: existing } = await supabase
    .from('judges')
    .select('id, type')
    .eq('email', email)
    .single();

  if (existing) {
    if (existing.type === 'admin') {
      return { error: 'This user is already an admin.' };
    }
    // Update existing user to admin
    const { error: updateError } = await supabase
      .from('judges')
      .update({ type: 'admin' })
      .eq('email', email);

    if (updateError) {
      return { error: `Failed to update user: ${updateError.message}` };
    }

    revalidatePath('/dashboard');
    return { success: true, message: 'User updated to admin.' };
  }

  // Create new admin user
  const { error: insertError } = await supabase
    .from('judges')
    .insert({
      email,
      type: 'admin',
      active: true
    });

  if (insertError) {
    return { error: `Failed to create admin user: ${insertError.message}` };
  }

  revalidatePath('/dashboard');
  return { success: true, message: 'Admin user created successfully.' };
}

export interface StickerData {
  sauceId: string;
  sauceCode: string;
  sauceName: string;
  brandName: string;
  stickersNeeded: number;
}

export interface SaucePackingStatus {
  sauceId: string;
  sauceCode: string;
  sauceName: string;
  brandName: string;
  status: string;
  scanCount: number;
}

export async function generateStickerData() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: 'You must be logged in.' };

  const { data: adminCheck, error: adminError } = await supabase
    .from('judges')
    .select('type')
    .eq('email', user.email)
    .single();

  if (adminError || adminCheck?.type !== 'admin') {
    return { error: 'You are not authorized.' };
  }

  // Count active judges
  const { count: judgeCount, error: judgeError } = await supabase
    .from('judges')
    .select('*', { count: 'exact', head: true })
    .eq('active', true);

  if (judgeError) {
    return { error: `Failed to count judges: ${judgeError.message}` };
  }

  // Fetch sauces that are ready for judging (arrived or boxed)
  const { data: sauces, error: sauceError } = await supabase
    .from('sauces')
    .select(`
      id,
      sauce_code,
      name,
      suppliers ( brand_name )
    `)
    .in('status', ['arrived', 'boxed']);

  if (sauceError) {
    return { error: `Failed to fetch sauces: ${sauceError.message}` };
  }

  if (!sauces || sauces.length === 0) {
    return { error: 'No sauces ready for judging. Update sauce status to "arrived" or "boxed" first.' };
  }

  const totalJudges = judgeCount || 0;
  const boxesNeeded = Math.ceil(totalJudges / 12);
  const stickersPerSauce = boxesNeeded * 7 + 2;

  const stickerData: StickerData[] = sauces.map((sauce: any) => ({
    sauceId: sauce.id,
    sauceCode: sauce.sauce_code || 'N/A',
    sauceName: sauce.name,
    brandName: sauce.suppliers?.brand_name || 'Unknown',
    stickersNeeded: stickersPerSauce,
  }));

  return {
    stickerData,
    totalJudges,
    boxesNeeded,
    stickersPerSauce,
  };
}

export async function getPackingStatus() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: 'You must be logged in.' };

  const { data: adminCheck, error: adminError } = await supabase
    .from('judges')
    .select('type')
    .eq('email', user.email)
    .single();

  if (adminError || adminCheck?.type !== 'admin') {
    return { error: 'You are not authorized.' };
  }

  // Fetch sauces with status 'arrived'
  const { data: sauces, error: sauceError } = await supabase
    .from('sauces')
    .select(`
      id,
      sauce_code,
      name,
      status,
      suppliers ( brand_name )
    `)
    .eq('status', 'arrived');

  if (sauceError) {
    return { error: `Failed to fetch sauces: ${sauceError.message}` };
  }

  if (!sauces || sauces.length === 0) {
    return { sauces: [] };
  }

  // Fetch scan counts for each sauce
  const sauceIds = sauces.map((s: any) => s.id);
  const { data: scans, error: scanError } = await supabase
    .from('bottle_scans')
    .select('sauce_id')
    .in('sauce_id', sauceIds);

  if (scanError) {
    return { error: `Failed to fetch scans: ${scanError.message}` };
  }

  // Count scans per sauce
  const scanCounts = new Map<string, number>();
  (scans || []).forEach((scan: any) => {
    scanCounts.set(scan.sauce_id, (scanCounts.get(scan.sauce_id) || 0) + 1);
  });

  const packingStatus: SaucePackingStatus[] = sauces.map((sauce: any) => ({
    sauceId: sauce.id,
    sauceCode: sauce.sauce_code || 'N/A',
    sauceName: sauce.name,
    brandName: sauce.suppliers?.brand_name || 'Unknown',
    status: sauce.status,
    scanCount: scanCounts.get(sauce.id) || 0,
  }));

  return { sauces: packingStatus };
}

export async function recordBottleScan(sauceId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: 'You must be logged in.' };

  const { data: adminCheck, error: adminError } = await supabase
    .from('judges')
    .select('type')
    .eq('email', user.email)
    .single();

  if (adminError || adminCheck?.type !== 'admin') {
    return { error: 'You are not authorized.' };
  }

  // Check sauce exists and is in 'arrived' status
  const { data: sauce, error: sauceError } = await supabase
    .from('sauces')
    .select('id, status, sauce_code, name')
    .eq('id', sauceId)
    .single();

  if (sauceError || !sauce) {
    return { error: 'Sauce not found.' };
  }

  if (sauce.status !== 'arrived') {
    return { error: `Sauce ${sauce.sauce_code} is not in "arrived" status. Current status: ${sauce.status}` };
  }

  // Record the scan
  const { error: insertError } = await supabase
    .from('bottle_scans')
    .insert({
      sauce_id: sauceId,
      scanned_by: user.email,
    });

  if (insertError) {
    return { error: `Failed to record scan: ${insertError.message}` };
  }

  // Count total scans for this sauce
  const { count: scanCount, error: countError } = await supabase
    .from('bottle_scans')
    .select('*', { count: 'exact', head: true })
    .eq('sauce_id', sauceId);

  if (countError) {
    return { error: `Failed to count scans: ${countError.message}` };
  }

  const totalScans = scanCount || 0;

  // Auto-update to 'boxed' if 7 scans reached
  if (totalScans >= 7) {
    const { error: updateError } = await supabase
      .from('sauces')
      .update({ status: 'boxed' })
      .eq('id', sauceId);

    if (updateError) {
      return { error: `Failed to update status: ${updateError.message}` };
    }

    revalidatePath('/dashboard');
    return {
      success: true,
      scanCount: totalScans,
      autoBoxed: true,
      message: `✓ ${sauce.sauce_code} - ${sauce.name}: All 7 bottles scanned! Status updated to BOXED.`
    };
  }

  revalidatePath('/dashboard');
  return {
    success: true,
    scanCount: totalScans,
    autoBoxed: false,
    message: `✓ ${sauce.sauce_code} - ${sauce.name}: ${totalScans}/7 bottles scanned`
  };
}

export async function manuallyMarkAsBoxed(sauceId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  // Admin check
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { error: 'You must be logged in.' };

  const { data: adminCheck, error: adminError } = await supabase
    .from('judges')
    .select('type')
    .eq('email', user.email)
    .single();

  if (adminError || adminCheck?.type !== 'admin') {
    return { error: 'You are not authorized.' };
  }

  // Update status to boxed
  const { error: updateError } = await supabase
    .from('sauces')
    .update({ status: 'boxed' })
    .eq('id', sauceId);

  if (updateError) {
    return { error: `Failed to update status: ${updateError.message}` };
  }

  revalidatePath('/dashboard');
  return { success: true, message: 'Sauce manually marked as boxed.' };
}

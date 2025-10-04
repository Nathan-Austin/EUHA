'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
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
  supplierId?: string;
}

export interface JudgeLabelData {
  judgeId: string;
  name: string;
  email: string;
  type: string;
  addressLine1: string;
  addressLine2: string;
  qrCodeUrl: string;
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;

function getServiceSupabase() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !serviceRoleKey) {
    return { error: 'Service role key not configured.' } as const;
  }

  const client = createServiceClient(SUPABASE_URL, serviceRoleKey, {
    auth: { persistSession: false },
  });

  return { client } as const;
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
  // Each sauce needs 7 bottles for packing verification
  const stickersPerSauce = 7;

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

export interface JudgeBoxAssignment {
  sauceId: string;
  sauceCode: string;
  sauceName: string;
  brandName: string;
}

export async function getJudgeBoxAssignments(judgeId: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

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

  // Use service client for admin operations
  const serviceClientResult = getServiceSupabase();
  if ('error' in serviceClientResult) {
    return { error: serviceClientResult.error };
  }

  const adminSupabase = serviceClientResult.client;

  const { data: judge, error: judgeFetchError } = await adminSupabase
    .from('judges')
    .select('name, email')
    .eq('id', judgeId)
    .single();

  if (judgeFetchError) {
    return { error: `Failed to load judge: ${judgeFetchError.message}` };
  }

  const { data: assignments, error: assignmentError } = await adminSupabase
    .from('box_assignments')
    .select(`
      sauce_id,
      sauces (
        sauce_code,
        name,
        suppliers ( brand_name )
      )
    `)
    .eq('judge_id', judgeId);

  if (assignmentError) {
    return { error: `Failed to load box assignments: ${assignmentError.message}` };
  }

  const mappedAssignments: JudgeBoxAssignment[] = (assignments || []).map((assignment: any) => ({
    sauceId: assignment.sauce_id,
    sauceCode: assignment.sauces?.sauce_code || 'N/A',
    sauceName: assignment.sauces?.name || 'Unknown sauce',
    brandName: assignment.sauces?.suppliers?.brand_name || 'Unknown brand',
  }));

  const judgeName = judge?.name || judge?.email?.split('@')[0] || 'Unknown judge';

  return {
    judgeName,
    assignments: mappedAssignments,
  };
}

export async function recordBottleScan(judgeId: string, sauceId: string) {
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

  if (!judgeId) {
    return { error: 'Scan a judge QR code before scanning sauces.' };
  }

  const serviceClientResult = getServiceSupabase();
  if ('error' in serviceClientResult) {
    return { error: serviceClientResult.error };
  }

  const adminSupabase = serviceClientResult.client;

  // Validate judge
  const { data: judge, error: judgeError } = await adminSupabase
    .from('judges')
    .select('id, name, email, active')
    .eq('id', judgeId)
    .single();

  if (judgeError || !judge) {
    return { error: `Judge not found. Error: ${judgeError?.message || 'No judge data'}` };
  }

  if (judge.active === false) {
    return { error: 'This judge is not active.' };
  }

  // Check sauce exists and is in 'arrived' status
  const { data: sauce, error: sauceError } = await adminSupabase
    .from('sauces')
    .select('id, status, sauce_code, name, suppliers ( brand_name )')
    .eq('id', sauceId)
    .single();

  if (sauceError || !sauce) {
    return { error: 'Sauce not found.' };
  }

  if (sauce.status !== 'arrived') {
    return { error: `Sauce ${sauce.sauce_code} is not in "arrived" status. Current status: ${sauce.status}` };
  }

  // Ensure sauce is not already assigned to another judge
  const { data: existingAssignments, error: existingError } = await adminSupabase
    .from('box_assignments')
    .select('id, judge_id')
    .eq('sauce_id', sauceId);

  if (existingError) {
    return { error: `Failed to check existing assignments: ${existingError.message}` };
  }

  const assignedToOtherJudge = (existingAssignments || []).find((assignment: any) => assignment.judge_id && assignment.judge_id !== judgeId);

  if (assignedToOtherJudge) {
    return { error: 'This sauce is already assigned to a different judge box.' };
  }

  // Record the scan
  const { error: insertError } = await adminSupabase
    .from('bottle_scans')
    .insert({
      sauce_id: sauceId,
      scanned_by: user.email,
    });

  if (insertError) {
    return { error: `Failed to record scan: ${insertError.message}` };
  }

  // Count total scans for this sauce
  const { count: scanCount, error: countError } = await adminSupabase
    .from('bottle_scans')
    .select('*', { count: 'exact', head: true })
    .eq('sauce_id', sauceId);

  if (countError) {
    return { error: `Failed to count scans: ${countError.message}` };
  }

  const totalScans = scanCount || 0;

  const judgeDisplayName = judge.name || judge.email?.split('@')[0] || `Judge ${judge.id.substring(0, 8)}`;
  const boxLabel = `Judge ${judgeDisplayName}`;

  if ((existingAssignments || []).length > 0) {
    const assignmentId = existingAssignments?.[0]?.id;
    if (assignmentId) {
      const { error: updateAssignmentError } = await adminSupabase
        .from('box_assignments')
        .update({ judge_id: judgeId, box_label: boxLabel })
        .eq('id', assignmentId);

      if (updateAssignmentError) {
        return { error: `Failed to update box assignment: ${updateAssignmentError.message}` };
      }
    }
  } else {
    const { error: assignmentInsertError } = await adminSupabase
      .from('box_assignments')
      .insert({
        sauce_id: sauceId,
        judge_id: judgeId,
        box_label: boxLabel,
      });

    if (assignmentInsertError) {
      return { error: `Failed to assign sauce to judge box: ${assignmentInsertError.message}` };
    }
  }

  const { count: assignedCount, error: assignedCountError } = await adminSupabase
    .from('box_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('judge_id', judgeId);

  if (assignedCountError) {
    return { error: `Failed to count box assignments: ${assignedCountError.message}` };
  }

  const assignmentSummary: JudgeBoxAssignment = {
    sauceId: sauce.id,
    sauceCode: (sauce as any).sauce_code || 'N/A',
    sauceName: sauce.name,
    brandName: (sauce as any).suppliers?.brand_name || 'Unknown brand',
  };

  const boxMessage = `Box progress for ${judgeDisplayName}: ${(assignedCount || 0)}/12 sauces assigned`;

  // Auto-update to 'boxed' if 7 scans reached
  if (totalScans >= 7) {
    const { error: updateError } = await adminSupabase
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
      message: `✓ ${(sauce as any).sauce_code} - ${sauce.name}: All 7 bottles scanned! Status updated to BOXED.`,
      assignment: assignmentSummary,
      assignedCount: assignedCount || 0,
      boxMessage,
      judgeName: judgeDisplayName,
    };
  }

  revalidatePath('/dashboard');
  return {
    success: true,
    scanCount: totalScans,
    autoBoxed: false,
    message: `✓ ${(sauce as any).sauce_code} - ${sauce.name}: ${totalScans}/7 bottles scanned`,
    assignment: assignmentSummary,
    assignedCount: assignedCount || 0,
    boxMessage,
    judgeName: judgeDisplayName,
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

export async function generateJudgeQRCodes() {
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

  const serviceClientResult = getServiceSupabase();
  if ('error' in serviceClientResult) {
    return { error: serviceClientResult.error };
  }

  const adminSupabase = serviceClientResult.client;

  // Fetch all active judges
  const { data: judges, error: judgeError } = await adminSupabase
    .from('judges')
    .select('id, email, name, type, active, stripe_payment_status, address, city, postal_code, country')
    .in('type', ['admin', 'pro', 'community'])
    .or('active.eq.true,type.eq.admin');

  if (judgeError) {
    return { error: `Failed to fetch judges: ${judgeError.message}` };
  }

  const eligibleCurrentJudges = (judges || []).filter((judge) => {
    if (judge.type === 'community') {
      return judge.stripe_payment_status === 'succeeded';
    }
    return judge.type === 'admin' || judge.active;
  });

  if (eligibleCurrentJudges.length === 0) {
    return { error: 'No active judges found.' };
  }

  // Generate and update QR codes for judges without them
  const updates = [];
  for (const judge of eligibleCurrentJudges) {
    if (!judge.id) continue;

    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?data=${judge.id}&size=200x200`;

    updates.push(
      adminSupabase
        .from('judges')
        .update({ qr_code_url: qrCodeUrl })
        .eq('id', judge.id)
    );
  }

  const results = await Promise.all(updates);
  const errors = results.filter(r => r.error);

  if (errors.length > 0) {
    return { error: `Failed to update some QR codes: ${errors[0].error?.message}` };
  }

  // Fetch updated judge data
  const { data: updatedJudges, error: fetchError } = await adminSupabase
    .from('judges')
    .select('id, email, name, type, qr_code_url, address, city, postal_code, country, active, stripe_payment_status')
    .in('type', ['admin', 'pro', 'community'])
    .or('active.eq.true,type.eq.admin');

  if (fetchError) {
    return { error: `Failed to fetch updated judges: ${fetchError.message}` };
  }

  const filteredJudges = (updatedJudges || []).filter((judge: any) => {
    if (judge.type === 'community') {
      return judge.stripe_payment_status === 'succeeded';
    }
    return judge.type === 'admin' || judge.active;
  });

  const judgeLabelData: JudgeLabelData[] = filteredJudges.map((judge: any) => {
    const line1 = judge.address || '';
    const cityParts = [judge.city, judge.postal_code, judge.country].filter(Boolean);
    const line2 = cityParts.join(', ');

    return {
      judgeId: judge.id,
      name: judge.name || judge.email.split('@')[0],
      email: judge.email,
      type: judge.type,
      addressLine1: line1,
      addressLine2: line2,
      qrCodeUrl: judge.qr_code_url || '',
    };
  });

  return { judges: judgeLabelData };
}

export async function checkConflictOfInterest(judgeId: string, sauceId: string) {
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

  // Use service client to bypass RLS
  const serviceClientResult = getServiceSupabase();
  if ('error' in serviceClientResult) {
    return { error: serviceClientResult.error };
  }

  const adminSupabase = serviceClientResult.client;

  // Get judge info
  const { data: judge, error: judgeError } = await adminSupabase
    .from('judges')
    .select('email, type, name')
    .eq('id', judgeId)
    .single();

  if (judgeError || !judge) {
    return { error: `Judge not found. ${judgeError?.message || ''}` };
  }

  // Get sauce info with supplier
  const { data: sauce, error: sauceError } = await adminSupabase
    .from('sauces')
    .select('id, name, sauce_code, suppliers ( email, brand_name )')
    .eq('id', sauceId)
    .single();

  if (sauceError || !sauce) {
    return { error: 'Sauce not found.' };
  }

  // Check if judge is a supplier judge and owns this sauce
  const supplierEmail = (sauce as any).suppliers?.email;

  if (judge.type === 'supplier' && judge.email === supplierEmail) {
    return {
      conflict: true,
      message: `⚠️ CONFLICT OF INTEREST: Judge ${judge.name || judge.email} is the supplier of ${(sauce as any).sauce_code} - ${sauce.name}`,
      judgeEmail: judge.email,
      sauceCode: (sauce as any).sauce_code,
    };
  }

  return {
    conflict: false,
    message: '✓ No conflict of interest detected',
  };
}

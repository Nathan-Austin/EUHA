'use server'

import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { sendEmail, emailTemplates } from '@/lib/email'

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
  const JUDGE_WEIGHTS: Record<JudgeType, number> = { pro: 2.0, community: 1.0, supplier: 1.0 };
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

  // Count judges participating in current year (2026)
  const currentYear = new Date().getFullYear();
  const { count: judgeCount, error: judgeError } = await supabase
    .from('judge_participations')
    .select('*', { count: 'exact', head: true })
    .eq('year', currentYear)
    .eq('accepted', true);

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

  // Validate judge and check if participating in current year
  const { data: judge, error: judgeError } = await adminSupabase
    .from('judges')
    .select('id, name, email')
    .eq('id', judgeId)
    .single();

  if (judgeError || !judge) {
    return { error: `Judge not found. Error: ${judgeError?.message || 'No judge data'}` };
  }

  // Check if judge is participating in current year
  const currentYear = new Date().getFullYear();
  const { data: participation, error: participationError } = await adminSupabase
    .from('judge_participations')
    .select('email, accepted')
    .eq('email', judge.email)
    .eq('year', currentYear)
    .single();

  if (participationError || !participation) {
    return { error: 'This judge is not registered for the current year.' };
  }

  if (!participation.accepted) {
    return { error: 'This judge has not been accepted for the current year.' };
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

  // Check if sauce is already assigned to THIS judge (prevent duplicates in same box)
  const { data: existingAssignments, error: existingError } = await adminSupabase
    .from('box_assignments')
    .select('id, judge_id')
    .eq('sauce_id', sauceId)
    .eq('judge_id', judgeId);

  if (existingError) {
    return { error: `Failed to check existing assignments: ${existingError.message}` };
  }

  if (existingAssignments && existingAssignments.length > 0) {
    return { error: 'This sauce is already in this judge\'s box.' };
  }

  // Check if sauce has reached maximum assignments (7 bottles total)
  const { count: totalAssignments, error: countError } = await adminSupabase
    .from('box_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('sauce_id', sauceId);

  if (countError) {
    return { error: `Failed to count assignments: ${countError.message}` };
  }

  if ((totalAssignments || 0) >= 7) {
    return { error: 'This sauce has already been assigned to 7 judges (maximum reached).' };
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
  const { count: scanCount, error: scanCountError } = await adminSupabase
    .from('bottle_scans')
    .select('*', { count: 'exact', head: true })
    .eq('sauce_id', sauceId);

  if (scanCountError) {
    return { error: `Failed to count scans: ${scanCountError.message}` };
  }

  const totalScans = scanCount || 0;

  const judgeDisplayName = judge.name || judge.email?.split('@')[0] || `Judge ${judge.id.substring(0, 8)}`;
  const boxLabel = `Judge ${judgeDisplayName}`;

  // Create new assignment (we already checked this judge doesn't have this sauce)
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

  // Fetch judges participating in current year (2026)
  const currentYear = new Date().getFullYear();
  const { data: participations, error: participationError } = await adminSupabase
    .from('judge_participations')
    .select('email, judge_type')
    .eq('year', currentYear)
    .eq('accepted', true)
    .in('judge_type', ['pro', 'community']);

  if (participationError) {
    return { error: `Failed to fetch judge participations: ${participationError.message}` };
  }

  if (!participations || participations.length === 0) {
    return { error: 'No accepted judges found for current year.' };
  }

  // Get emails of participating judges
  const participatingEmails = participations.map(p => p.email);

  // Fetch full judge details from judges table
  const { data: judges, error: judgeError } = await adminSupabase
    .from('judges')
    .select('id, email, name, type, stripe_payment_status, address, city, postal_code, country')
    .in('email', participatingEmails);

  if (judgeError) {
    return { error: `Failed to fetch judge details: ${judgeError.message}` };
  }

  const eligibleCurrentJudges = (judges || []).filter((judge) => {
    if (judge.type === 'community') {
      return judge.stripe_payment_status === 'succeeded';
    }
    return true; // Pro judges don't need payment
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

  // Fetch updated judge data (re-query the same participating emails)
  const { data: updatedJudges, error: fetchError } = await adminSupabase
    .from('judges')
    .select('id, email, name, type, qr_code_url, address, city, postal_code, country, stripe_payment_status')
    .in('email', participatingEmails);

  if (fetchError) {
    return { error: `Failed to fetch updated judges: ${fetchError.message}` };
  }

  const filteredJudges = (updatedJudges || []).filter((judge: any) => {
    if (judge.type === 'community') {
      return judge.stripe_payment_status === 'succeeded';
    }
    return true; // Pro judges don't need payment
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

// Supplier tracking submission
export async function submitTrackingInfo(trackingNumber: string, postalServiceName: string) {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return { error: 'You must be logged in.' };
  }

  // Verify user is a supplier
  const { data: judge } = await supabase
    .from('judges')
    .select('type')
    .eq('email', user.email)
    .single();

  if (!judge || judge.type !== 'supplier') {
    return { error: 'Only suppliers can submit tracking information.' };
  }

  // Update supplier record
  const { error } = await supabase
    .from('suppliers')
    .update({
      tracking_number: trackingNumber,
      postal_service_name: postalServiceName,
      package_status: 'shipped',
    })
    .eq('email', user.email);

  if (error) {
    return { error: `Failed to submit tracking: ${error.message}` };
  }

  // Send confirmation email
  try {
    const { data: supplier } = await supabase
      .from('suppliers')
      .select('brand_name')
      .eq('email', user.email)
      .single();

    if (supplier) {
      await sendEmail({
        to: user.email,
        ...emailTemplates.supplierTrackingConfirmation(
          supplier.brand_name,
          trackingNumber,
          postalServiceName
        )
      });
    }
  } catch (emailError) {
    console.error('Failed to send tracking confirmation email:', emailError);
    // Don't throw - tracking already submitted, email is non-critical
  }

  revalidatePath('/dashboard');
  return { success: true };
}

// Admin: Mark package as received
export async function markPackageReceived(supplierId: string) {
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

  // Get supplier details for email
  const { data: supplier } = await supabase
    .from('suppliers')
    .select('email, brand_name')
    .eq('id', supplierId)
    .single();

  if (!supplier) {
    return { error: 'Supplier not found.' };
  }

  // Update supplier status
  const { error } = await supabase
    .from('suppliers')
    .update({
      package_status: 'received',
      package_received_at: new Date().toISOString(),
    })
    .eq('id', supplierId);

  if (error) {
    return { error: `Failed to update package status: ${error.message}` };
  }

  // Get sauce names for email
  const { data: sauces } = await supabase
    .from('sauces')
    .select('name')
    .eq('supplier_id', supplierId);

  const sauceNames = sauces?.map(s => s.name) || [];

  // Send confirmation email
  try {
    await sendEmail({
      to: supplier.email,
      ...emailTemplates.supplierPackageReceived(
        supplier.brand_name,
        sauceNames
      )
    });
  } catch (emailError) {
    console.error('Failed to send package received email:', emailError);
    // Don't throw - package already marked as received, email is non-critical
  }

  revalidatePath('/dashboard');
  return { success: true, brandName: supplier.brand_name };
}

export async function getJudgeScoredSauces() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) {
    return { error: 'Not authenticated' };
  }

  // Get judge ID
  const { data: judge } = await supabase
    .from('judges')
    .select('id')
    .eq('email', user.email)
    .single();

  if (!judge) {
    return { error: 'Judge not found' };
  }

  // Get distinct sauces that this judge has scored
  const { data: scores, error } = await supabase
    .from('judging_scores')
    .select('sauce_id, sauces(sauce_code)')
    .eq('judge_id', judge.id);

  if (error) {
    return { error: error.message };
  }

  // Get unique sauce codes
  const uniqueSauces = scores?.reduce((acc: { sauceId: string; sauceCode: string }[], score) => {
    const sauceCode = (score.sauces as any)?.sauce_code || 'N/A';
    const existing = acc.find(s => s.sauceId === score.sauce_id);
    if (!existing) {
      acc.push({ sauceId: score.sauce_id, sauceCode });
    }
    return acc;
  }, []) || [];

  // Get total assigned sauces count
  const { count: assignedCount } = await supabase
    .from('box_assignments')
    .select('*', { count: 'exact', head: true })
    .eq('judge_id', judge.id);

  return { scoredSauces: uniqueSauces, totalAssigned: assignedCount || 0 };
}

// Email Campaign Actions for 2026 Invitations

export interface PreviousParticipant {
  email: string;
  name: string;
  lastParticipated: number;
  invitedDate?: string;
}

export interface EmailTemplate {
  id: string;
  template_key: string;
  name: string;
  description?: string;
  subject: string;
  html_body: string;
  text_body?: string;
  variables?: string[];
  is_active: boolean;
}

export async function getPreviousSuppliers() {
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

  // Get all suppliers from participation table
  const { data: supplierParticipations, error: suppliersError } = await supabase
    .from('supplier_participations')
    .select('email, company_name, year, invited_date')
    .order('year', { ascending: false });

  if (suppliersError) {
    return { error: `Failed to fetch suppliers: ${suppliersError.message}` };
  }

  // Get all judge emails to exclude supplier-judges
  const { data: judges, error: judgesError } = await supabase
    .from('judges')
    .select('email, type')
    .eq('type', 'supplier');

  if (judgesError) {
    return { error: `Failed to fetch judges: ${judgesError.message}` };
  }

  const judgeEmails = new Set(judges?.map(j => j.email.toLowerCase()) || []);

  // Deduplicate and exclude supplier-judges
  const uniqueSuppliers = new Map<string, PreviousParticipant>();

  supplierParticipations?.forEach((sp: any) => {
    const emailLower = sp.email.toLowerCase();

    // Skip if this email is a judge
    if (judgeEmails.has(emailLower)) {
      return;
    }

    const existing = uniqueSuppliers.get(emailLower);
    if (!existing || sp.year > existing.lastParticipated) {
      uniqueSuppliers.set(emailLower, {
        email: sp.email,
        name: sp.company_name || sp.email.split('@')[0],
        lastParticipated: sp.year,
        invitedDate: sp.invited_date,
      });
    }
  });

  const suppliers = Array.from(uniqueSuppliers.values()).sort((a, b) =>
    b.lastParticipated - a.lastParticipated
  );

  return { suppliers };
}

export async function getPreviousJudges() {
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

  // Get all judge participations
  const { data: judgeParticipations, error: judgesError } = await supabase
    .from('judge_participations')
    .select('email, full_name, year, judge_type, invited_date')
    .order('year', { ascending: false });

  if (judgesError) {
    return { error: `Failed to fetch judges: ${judgesError.message}` };
  }

  // Get supplier emails to exclude
  const { data: suppliers, error: suppliersError } = await supabase
    .from('suppliers')
    .select('email');

  if (suppliersError) {
    return { error: `Failed to fetch suppliers: ${suppliersError.message}` };
  }

  const supplierEmails = new Set(suppliers?.map(s => s.email.toLowerCase()) || []);

  // Deduplicate and exclude suppliers
  const uniqueJudges = new Map<string, PreviousParticipant & { judgeType: string }>();

  judgeParticipations?.forEach((jp: any) => {
    const emailLower = jp.email.toLowerCase();

    // Skip if this email is a supplier (non-judge supplier)
    if (supplierEmails.has(emailLower) && jp.judge_type === 'supplier') {
      return;
    }

    const existing = uniqueJudges.get(emailLower);
    if (!existing || jp.year > existing.lastParticipated) {
      uniqueJudges.set(emailLower, {
        email: jp.email,
        name: jp.full_name || jp.email.split('@')[0],
        lastParticipated: jp.year,
        invitedDate: jp.invited_date,
        judgeType: jp.judge_type || 'community',
      });
    }
  });

  const judges = Array.from(uniqueJudges.values()).sort((a, b) =>
    b.lastParticipated - a.lastParticipated
  );

  return { judges };
}

export async function sendSupplierInvitations(emails: string[]) {
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

  if (!emails || emails.length === 0) {
    return { error: 'No emails provided.' };
  }

  // Get supplier details for personalization
  const { data: supplierParticipations } = await supabase
    .from('supplier_participations')
    .select('email, company_name')
    .in('email', emails);

  const supplierMap = new Map(
    supplierParticipations?.map((sp: any) => [sp.email.toLowerCase(), sp.company_name]) || []
  );

  const results = {
    sent: [] as string[],
    failed: [] as { email: string; error: string }[],
  };

  // Get email template from database
  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('template_key', 'supplier_2026_invitation')
    .eq('is_active', true)
    .single();

  if (templateError || !template) {
    return { error: 'Email template not found. Please configure templates first.' };
  }

  // Send emails
  for (const email of emails) {
    try {
      const brandName = supplierMap.get(email.toLowerCase()) || email.split('@')[0];

      // Replace variables in template
      const emailContent = {
        subject: replaceTemplateVariables(template.subject, { brandName }),
        html: replaceTemplateVariables(template.html_body, { brandName }),
        text: template.text_body ? replaceTemplateVariables(template.text_body, { brandName }) : undefined,
      };

      await sendEmail({
        to: email,
        ...emailContent,
      });
      results.sent.push(email);

      // Update invited_date in database
      await supabase
        .from('supplier_participations')
        .update({ invited_date: new Date().toISOString(), responded: false })
        .eq('email', email);
    } catch (error: any) {
      results.failed.push({ email, error: error.message });
    }
  }

  return {
    success: true,
    sent: results.sent.length,
    failed: results.failed.length,
    failedEmails: results.failed,
  };
}

export async function sendJudgeInvitations(emails: string[]) {
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

  if (!emails || emails.length === 0) {
    return { error: 'No emails provided.' };
  }

  // Get judge details for personalization
  const { data: judgeParticipations } = await supabase
    .from('judge_participations')
    .select('email, full_name, judge_type')
    .in('email', emails);

  const judgeMap = new Map(
    judgeParticipations?.map((jp: any) => [
      jp.email.toLowerCase(),
      { name: jp.full_name, type: jp.judge_type }
    ]) || []
  );

  const results = {
    sent: [] as string[],
    failed: [] as { email: string; error: string }[],
  };

  // Get email template from database
  const { data: template, error: templateError } = await supabase
    .from('email_templates')
    .select('*')
    .eq('template_key', 'judge_2026_invitation')
    .eq('is_active', true)
    .single();

  if (templateError || !template) {
    return { error: 'Email template not found. Please configure templates first.' };
  }

  // Send emails
  for (const email of emails) {
    try {
      const judgeInfo = judgeMap.get(email.toLowerCase());
      const name = judgeInfo?.name || email.split('@')[0];
      const judgeType = judgeInfo?.type || 'community';

      // Replace variables in template
      const emailContent = {
        subject: replaceTemplateVariables(template.subject, { name, judgeType }),
        html: replaceTemplateVariables(template.html_body, { name, judgeType }),
        text: template.text_body ? replaceTemplateVariables(template.text_body, { name, judgeType }) : undefined,
      };

      await sendEmail({
        to: email,
        ...emailContent,
      });
      results.sent.push(email);

      // Update invited_date in database
      await supabase
        .from('judge_participations')
        .update({ invited_date: new Date().toISOString(), responded: false })
        .eq('email', email);
    } catch (error: any) {
      results.failed.push({ email, error: error.message });
    }
  }

  return {
    success: true,
    sent: results.sent.length,
    failed: results.failed.length,
    failedEmails: results.failed,
  };
}


// Email Template Management Actions

export async function getEmailTemplates() {
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

  const { data: templates, error } = await supabase
    .from('email_templates')
    .select('*')
    .order('name', { ascending: true });

  if (error) {
    return { error: `Failed to fetch templates: ${error.message}` };
  }

  return { templates: templates as EmailTemplate[] };
}

export async function getEmailTemplate(templateKey: string) {
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

  const { data: template, error } = await supabase
    .from('email_templates')
    .select('*')
    .eq('template_key', templateKey)
    .single();

  if (error) {
    return { error: `Failed to fetch template: ${error.message}` };
  }

  return { template: template as EmailTemplate };
}

export async function updateEmailTemplate(
  templateKey: string,
  updates: {
    subject?: string;
    html_body?: string;
    text_body?: string;
    is_active?: boolean;
  }
) {
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

  const { error } = await supabase
    .from('email_templates')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('template_key', templateKey);

  if (error) {
    return { error: `Failed to update template: ${error.message}` };
  }

  revalidatePath('/dashboard');
  return { success: true };
}

// Helper function to replace variables in template
function replaceTemplateVariables(template: string, variables: Record<string, string>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(regex, value);
  }
  return result;
}


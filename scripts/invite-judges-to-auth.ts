import { createClient } from '@supabase/supabase-js';

/**
 * Script to invite judges to Supabase Auth
 *
 * This script finds judges who are accepted for 2026 but don't have auth accounts,
 * and creates auth accounts for them so they can use magic link login.
 *
 * Run with: npx tsx scripts/invite-judges-to-auth.ts
 */

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing required environment variables:');
  console.error('  NEXT_PUBLIC_SUPABASE_URL');
  console.error('  SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function findJudgesWithoutAuth() {
  // Get all accepted judges for 2026
  const { data: participations, error: participationError } = await supabase
    .from('judge_participations')
    .select('email, full_name, judge_type')
    .eq('year', 2026)
    .eq('accepted', true);

  if (participationError) {
    throw new Error(`Failed to fetch judge participations: ${participationError.message}`);
  }

  if (!participations || participations.length === 0) {
    return [];
  }

  // Get all auth users once
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();

  if (authError) {
    throw new Error(`Failed to fetch auth users: ${authError.message}`);
  }

  // Create a Set of existing auth emails for quick lookup
  const authEmails = new Set(
    authData.users.map(u => u.email?.toLowerCase()).filter(Boolean)
  );

  // Filter judges who don't have auth accounts
  const judgesWithoutAuth = participations.filter(
    judge => !authEmails.has(judge.email.toLowerCase())
  );

  return judgesWithoutAuth;
}

async function inviteJudgeToAuth(email: string, metadata: any) {
  console.log(`Inviting ${email} to auth...`);

  try {
    // Create auth user using Admin API
    // This creates a user account that can receive magic links
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      email_confirm: true, // Auto-confirm email so they can log in immediately
      user_metadata: {
        full_name: metadata.full_name,
        judge_type: metadata.judge_type,
        invited_by_script: true,
        invited_at: new Date().toISOString()
      }
    });

    if (error) {
      console.error(`  ❌ Failed to invite ${email}: ${error.message}`);
      return { email, success: false, error: error.message };
    }

    console.log(`  ✅ Successfully invited ${email} (User ID: ${data.user?.id})`);
    return { email, success: true, userId: data.user?.id };
  } catch (err: any) {
    console.error(`  ❌ Exception inviting ${email}: ${err.message}`);
    return { email, success: false, error: err.message };
  }
}

async function main() {
  console.log('🔍 Finding judges without auth accounts...\n');

  // Find judges who need auth accounts
  const judges = await findJudgesWithoutAuth();

  if (!judges || judges.length === 0) {
    console.log('✅ All accepted judges for 2026 have auth accounts!');
    return;
  }

  console.log(`Found ${judges.length} judges without auth accounts:\n`);

  // Display list
  judges.forEach((judge: any, index: number) => {
    console.log(`${index + 1}. ${judge.email} (${judge.full_name}, ${judge.judge_type})`);
  });

  console.log('\n🚀 Starting invitation process...\n');

  // Invite each judge
  const results = [];
  for (const judge of judges) {
    const result = await inviteJudgeToAuth(judge.email, {
      full_name: judge.full_name,
      judge_type: judge.judge_type
    });
    results.push(result);

    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Summary
  console.log('\n📊 Summary:');
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  console.log(`  ✅ Successful: ${successful}`);
  console.log(`  ❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log('\n❌ Failed invitations:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  - ${r.email}: ${r.error}`);
    });
  }
}

main()
  .then(() => {
    console.log('\n✅ Script completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  });

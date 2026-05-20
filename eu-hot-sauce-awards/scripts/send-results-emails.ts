/**
 * Send 2026 judging results to all suppliers.
 *
 * Each supplier gets one email covering all their sauces, with:
 * - Per-category average scores (7 categories)
 * - Judge comments (anonymised, no count)
 * - Medal result or category position (e.g. "4th out of 16")
 * - Award sticker PNG attachments for medal-winning sauces
 *
 * Run from eu-hot-sauce-awards/:
 *   npx tsx scripts/send-results-emails.ts [--dry-run] [--test=email@example.com]
 *
 * --dry-run        Print email HTML to stdout, do not send or write audit rows
 * --test=X         Only process the supplier with this email address
 * --override-to=X  Send to this address instead of the supplier's real email (for previewing)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import nodemailer from 'nodemailer';

dotenv.config({ path: path.join(__dirname, '..', '.env.local') });

const DRY_RUN = process.argv.includes('--dry-run');
const TEST_EMAIL = process.argv.find(a => a.startsWith('--test='))?.split('=')[1];
const OVERRIDE_TO = process.argv.find(a => a.startsWith('--override-to='))?.split('=')[1];
const EMAIL_TYPE = 'results_feedback_2026';

// ---------------------------------------------------------------------------
// Supabase
// ---------------------------------------------------------------------------

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!supabaseUrl || !serviceKey) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
  process.exit(1);
}
const supabase = createClient(supabaseUrl, serviceKey);

// ---------------------------------------------------------------------------
// SMTP
// ---------------------------------------------------------------------------

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASS) {
    if (!DRY_RUN) {
      console.error('Missing SMTP_* env vars — needed to send emails');
      process.exit(1);
    }
    return null;
  }
  const port = Number(SMTP_PORT);
  return nodemailer.createTransport({
    pool: true,
    maxConnections: 1,
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

// ---------------------------------------------------------------------------
// Sticker paths
// ---------------------------------------------------------------------------

const STICKERS_DIR = path.join(__dirname, '..', '..', 'Award_stickers', 'Prizes');

const stickerMap: Record<string, string> = {
  'GOLD (winner)': path.join(STICKERS_DIR, 'bottle sticker GOLD Catogory Winner.png'),
  'GOLD':          path.join(STICKERS_DIR, 'bottle sticker GOLD.png'),
  'SILVER':        path.join(STICKERS_DIR, 'bottle sticker SILVER.png'),
  'BRONZE':        path.join(STICKERS_DIR, 'bottle sticker BRONZE.png'),
};

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface CategoryScore {
  category: string;
  avg_score: number;
}

interface SauceResult {
  sauce_code: string;
  sauce_name: string;
  sauce_category: string;
  // from past_results (medal winners)
  award: string | null;
  position: number | null;
  area: string | null;
  global_rank: number | null;
  // computed
  category_rank: number | null;
  category_total: number | null;
  overall_avg: number;
  scores: CategoryScore[];
  comments: string[];
}

// ---------------------------------------------------------------------------
// Ordinal suffix
// ---------------------------------------------------------------------------

function ordinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

// ---------------------------------------------------------------------------
// HTML email template
// ---------------------------------------------------------------------------

const emailBanner = '<div style="background-color: #fabf14; padding: 20px 0; text-align: center;"><img src="https://heatawards.eu/cropped-banner-website.png" alt="European Hot Sauce Awards" style="max-width: 600px; width: 100%; height: auto;" /></div>';

function resultBadge(sauce: SauceResult): string {
  if (sauce.award) {
    const awardColors: Record<string, string> = {
      'GOLD (winner)': '#B8860B',
      'GOLD':    '#B8860B',
      'SILVER':  '#707070',
      'BRONZE':  '#8B4513',
    };
    const bg = awardColors[sauce.award] ?? '#555';
    return `<span style="display:inline-block;padding:4px 14px;border-radius:20px;background:${bg};color:#fff;font-weight:bold;font-size:13px;letter-spacing:1px;text-transform:uppercase">${sauce.award}</span>`;
  }
  if (sauce.category_rank && sauce.category_total) {
    return `<span style="display:inline-block;padding:4px 14px;border-radius:20px;background:#444;color:#ccc;font-size:13px">${ordinal(sauce.category_rank)} out of ${sauce.category_total} in ${sauce.sauce_category}</span>`;
  }
  return '';
}

function scoresTable(scores: CategoryScore[], overall: number): string {
  const rows = scores.map(s => `
    <tr>
      <td style="padding:6px 12px;border-bottom:1px solid #333;color:#ccc">${s.category}</td>
      <td style="padding:6px 12px;border-bottom:1px solid #333;text-align:right;font-weight:bold;color:#fabf14">${s.avg_score.toFixed(1)}<span style="color:#888;font-size:11px">/10</span></td>
    </tr>`).join('');

  return `
    <table style="width:100%;border-collapse:collapse;background:#1a1a1a;border-radius:8px;overflow:hidden;margin:12px 0">
      <thead>
        <tr style="background:#111">
          <th style="padding:8px 12px;text-align:left;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px">Category</th>
          <th style="padding:8px 12px;text-align:right;color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px">Score</th>
        </tr>
      </thead>
      <tbody>
        ${rows}
        <tr style="background:#222">
          <td style="padding:8px 12px;color:#fff;font-weight:bold">Overall Average</td>
          <td style="padding:8px 12px;text-align:right;font-weight:bold;color:#fabf14;font-size:16px">${overall.toFixed(2)}<span style="color:#888;font-size:11px">/10</span></td>
        </tr>
      </tbody>
    </table>`;
}

function commentsSection(comments: string[]): string {
  if (comments.length === 0) return '';
  const items = comments.map(c =>
    `<li style="margin-bottom:8px;color:#bbb;line-height:1.5">"${c}"</li>`
  ).join('');
  return `
    <div style="margin-top:16px">
      <p style="color:#888;font-size:11px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Judge Comments</p>
      <ul style="list-style:none;padding:0;margin:0;background:#1a1a1a;border-left:3px solid #ff4d00;padding:12px 16px;border-radius:0 6px 6px 0">
        ${items}
      </ul>
    </div>`;
}

function sauceSection(sauce: SauceResult): string {
  const stickerNote = sauce.award
    ? `<p style="margin:12px 0 0;color:#fabf14;font-size:12px">🏆 Your award sticker is attached — feel free to use it on your packaging!</p>`
    : '';

  return `
    <div style="margin-bottom:32px;padding:20px;background:#111;border-radius:10px;border:1px solid #2a2a2a">
      <div style="margin-bottom:12px">
        <h2 style="margin:0 0 4px;color:#fff;font-size:18px">${sauce.sauce_name}</h2>
        <p style="margin:0;color:#888;font-size:13px">${sauce.sauce_category}</p>
      </div>
      <div style="margin-bottom:16px">${resultBadge(sauce)}</div>
      ${sauce.global_rank ? `<p style="color:#fabf14;font-size:12px;margin:0 0 12px">🌍 Global Rank #${sauce.global_rank}</p>` : ''}
      ${scoresTable(sauce.scores, sauce.overall_avg)}
      ${commentsSection(sauce.comments)}
      ${stickerNote}
    </div>`;
}

function buildEmail(brandName: string, sauces: SauceResult[]): { subject: string; html: string } {
  const hasMedals = sauces.some(s => s.award);
  const medalCount = sauces.filter(s => s.award).length;

  const intro = hasMedals
    ? `<p>Congratulations on your result${medalCount > 1 ? 's' : ''} at the <strong>2026 European Hot Sauce Awards</strong>! Below you'll find the detailed judging scores and feedback for each of your sauces.</p>`
    : `<p>Thank you for entering the <strong>2026 European Hot Sauce Awards</strong>. Below you'll find the detailed judging scores and feedback for your sauce${sauces.length > 1 ? 's' : ''}.</p>`;

  const stickerNote = hasMedals
    ? `<div style="background:#1a1a1a;border:1px solid #fabf14;border-radius:8px;padding:16px;margin:20px 0">
        <p style="margin:0;color:#fabf14;font-weight:bold">🏅 Award Stickers</p>
        <p style="margin:8px 0 0;color:#ccc;font-size:14px">Your award sticker${medalCount > 1 ? 's are' : ' is'} attached to this email as PNG files. You're welcome to use them on your bottle labels, packaging, and marketing materials.</p>
      </div>`
    : '';

  return {
    subject: hasMedals
      ? `🏆 Your 2026 EU Hot Sauce Awards Results & Award Stickers`
      : `Your 2026 EU Hot Sauce Awards Results & Feedback`,
    html: `
      ${emailBanner}
      <div style="background:#08040e;padding:24px;font-family:Arial,sans-serif;max-width:600px;margin:0 auto;color:#fff">
        <h1 style="color:#ff4d00;margin-top:0">Your 2026 Results</h1>
        <p>Dear ${brandName},</p>
        ${intro}
        <p style="color:#888;font-size:13px">Scores are averaged across all judges on a scale of 1–10. We don't share individual judge details or how many judges scored each sauce.</p>
        ${stickerNote}
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:24px 0">
        ${sauces.map(sauceSection).join('')}
        <hr style="border:none;border-top:1px solid #2a2a2a;margin:24px 0">
        <p style="color:#888;font-size:13px">We hope the feedback is valuable. Results are also published at <a href="https://heatawards.eu/results/2026" style="color:#ff4d00">heatawards.eu/results/2026</a>.</p>
        <p style="color:#888;font-size:13px">Questions? Reply to this email or contact us at <a href="mailto:heataward@gmail.com" style="color:#ff4d00">heataward@gmail.com</a></p>
        <p style="color:#555;font-size:12px;margin-top:24px">European Hot Sauce Awards 2026</p>
      </div>`,
  };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  console.log(`🌶️  Results email sender — ${DRY_RUN ? 'DRY RUN' : 'LIVE'}`);
  if (TEST_EMAIL) console.log(`   Test mode: only sending to ${TEST_EMAIL}`);

  // Load all judging scores + comments per sauce
  console.log('Fetching judging scores...');
  const { data: scoreRows, error: scoreErr } = await supabase.rpc('get_sauce_judging_scores');
  if (scoreErr) { console.error('RPC error:', scoreErr); process.exit(1); }

  const scoresByCode = new Map<string, { scores: CategoryScore[]; comments: string[] }>();
  for (const row of (scoreRows ?? []) as any[]) {
    scoresByCode.set(row.sauce_code, {
      scores: row.category_scores as CategoryScore[],
      comments: (row.all_comments as string[]) ?? [],
    });
  }
  console.log(`  Loaded scores for ${scoresByCode.size} sauces`);

  // Load category rankings for non-medal sauces
  console.log('Fetching category rankings...');
  const { data: rankRows, error: rankErr } = await supabase.rpc('get_sauce_category_rankings');
  if (rankErr) { console.error('RPC error:', rankErr); process.exit(1); }

  const rankByCode = new Map<string, { rank: number; total: number }>();
  for (const row of (rankRows ?? []) as any[]) {
    rankByCode.set(row.sauce_code, { rank: Number(row.category_rank), total: Number(row.category_total) });
  }

  // Load past_results for 2026 (medal data)
  const { data: results2026, error: resultErr } = await supabase
    .from('past_results')
    .select('code, award, position, area, global_rank, entry_name, category')
    .eq('year', 2026);
  if (resultErr) { console.error('past_results error:', resultErr); process.exit(1); }

  const resultByCode = new Map<string, typeof results2026[0]>();
  for (const r of results2026 ?? []) resultByCode.set(r.code, r);

  // Load all suppliers with their sauces
  let suppliersQuery = supabase
    .from('suppliers')
    .select('id, email, brand_name, contact_name');
  if (TEST_EMAIL) suppliersQuery = suppliersQuery.ilike('email', TEST_EMAIL);

  const { data: suppliers, error: supErr } = await suppliersQuery;
  if (supErr) { console.error('suppliers error:', supErr); process.exit(1); }
  console.log(`  Processing ${suppliers?.length ?? 0} suppliers`);

  const { data: allSauces, error: sauceErr } = await supabase
    .from('sauces')
    .select('id, supplier_id, name, sauce_code, category')
    .not('sauce_code', 'is', null);
  if (sauceErr) { console.error('sauces error:', sauceErr); process.exit(1); }

  const saucesBySupplier = new Map<string, typeof allSauces>();
  for (const s of allSauces ?? []) {
    if (!saucesBySupplier.has(s.supplier_id)) saucesBySupplier.set(s.supplier_id, []);
    saucesBySupplier.get(s.supplier_id)!.push(s);
  }

  // Check already-sent audit log
  const { data: auditRows } = await supabase
    .from('email_audit')
    .select('recipient_email')
    .eq('email_type', EMAIL_TYPE)
    .eq('status', 'sent');
  const alreadySent = new Set((auditRows ?? []).map((r: any) => r.recipient_email.toLowerCase()));

  const transporter = createTransporter();

  let sent = 0, skipped = 0, errors = 0;

  for (const supplier of suppliers ?? []) {
    if (!supplier.email) { skipped++; continue; }

    const email = supplier.email.toLowerCase();
    if (!DRY_RUN && alreadySent.has(email)) {
      console.log(`  SKIP (already sent): ${supplier.email}`);
      skipped++;
      continue;
    }

    const sauces = saucesBySupplier.get(supplier.id) ?? [];
    if (sauces.length === 0) {
      console.log(`  SKIP (no sauces): ${supplier.email}`);
      skipped++;
      continue;
    }

    // Build sauce data
    const sauceResults: SauceResult[] = [];
    for (const sauce of sauces) {
      if (!sauce.sauce_code) continue;
      const judging = scoresByCode.get(sauce.sauce_code);
      if (!judging || judging.scores.length === 0) continue; // not judged

      const result = resultByCode.get(sauce.sauce_code);
      const ranking = rankByCode.get(sauce.sauce_code);
      const overall = judging.scores.reduce((sum, s) => sum + s.avg_score, 0) / judging.scores.length;

      sauceResults.push({
        sauce_code: sauce.sauce_code,
        sauce_name: result?.entry_name ?? sauce.name,
        sauce_category: result?.category ?? sauce.category ?? '',
        award: result?.award ?? null,
        position: result?.position ?? null,
        area: result?.area ?? null,
        global_rank: result?.global_rank ?? null,
        category_rank: result ? null : (ranking?.rank ?? null),
        category_total: result ? null : (ranking?.total ?? null),
        overall_avg: overall,
        scores: judging.scores,
        comments: judging.comments,
      });
    }

    if (sauceResults.length === 0) {
      console.log(`  SKIP (no judged sauces): ${supplier.email}`);
      skipped++;
      continue;
    }

    const brandName = supplier.brand_name || supplier.contact_name || supplier.email;
    const { subject, html } = buildEmail(brandName, sauceResults);

    // Build attachments for medal winners (unique sticker types only)
    const awardTypes = new Set(sauceResults.map(s => s.award).filter(Boolean) as string[]);
    const attachments = Array.from(awardTypes)
      .filter(award => stickerMap[award] && fs.existsSync(stickerMap[award]))
      .map(award => ({
        filename: path.basename(stickerMap[award]),
        path: stickerMap[award],
      }));

    if (DRY_RUN) {
      console.log(`\n${'='.repeat(60)}`);
      console.log(`TO: ${supplier.email} (${brandName})`);
      console.log(`SUBJECT: ${subject}`);
      console.log(`SAUCES: ${sauceResults.map(s => `${s.sauce_name} (${s.award ?? `${s.category_rank}/${s.category_total}`})`).join(', ')}`);
      console.log(`ATTACHMENTS: ${attachments.map(a => a.filename).join(', ') || 'none'}`);
      sent++;
      continue;
    }

    try {
      await transporter!.sendMail({
        from: process.env.SMTP_FROM || process.env.SMTP_USER,
        to: OVERRIDE_TO ?? supplier.email,
        subject,
        html,
        attachments,
      });

      await supabase.from('email_audit').insert({
        email_type: EMAIL_TYPE,
        recipient_email: supplier.email,
        supplier_id: supplier.id,
        year: 2026,
        status: 'sent',
        sent_at: new Date().toISOString(),
        metadata: {
          sauce_codes: sauceResults.map(s => s.sauce_code),
          awards: sauceResults.map(s => s.award).filter(Boolean),
        },
      });

      console.log(`  ✓ Sent: ${supplier.email} (${sauceResults.length} sauce${sauceResults.length > 1 ? 's' : ''})`);
      sent++;
      await new Promise(r => setTimeout(r, 150));
    } catch (err) {
      console.error(`  ✗ Failed: ${supplier.email}`, err);
      await supabase.from('email_audit').insert({
        email_type: EMAIL_TYPE,
        recipient_email: supplier.email,
        supplier_id: supplier.id,
        year: 2026,
        status: 'error',
        error_message: String(err),
      });
      errors++;
    }
  }

  console.log(`\nDone. Sent: ${sent}, Skipped: ${skipped}, Errors: ${errors}`);
}

main().catch(err => { console.error(err); process.exit(1); });

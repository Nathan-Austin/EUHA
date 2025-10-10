#!/usr/bin/env node

/**
 * Import historical judge and supplier data from CSV files (2024-2026)
 *
 * This script:
 * 1. Parses CSV files for judges (2024, 2025, 2026) and suppliers (2025)
 * 2. Classifies judge types based on experience and affiliations
 * 3. Cross-references suppliers with judges using exact and fuzzy matching
 * 4. Populates participation tracking tables
 * 5. Syncs latest contact data to main judges/suppliers tables
 */

import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';

// Fuzzy string matching for name comparison
import Fuse from 'fuse.js';

// Supabase setup
const SUPABASE_URL = process.env.PROJECT_URL || '';
const SUPABASE_SERVICE_KEY = process.env.SERVICE_ROLE_KEY || '';

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// CSV file paths
const CSV_DIR = join(process.cwd(), 'eu-hot-sauce-awards', 'past_results');
const JUDGE_2024_CSV = join(CSV_DIR, 'Heat_Awards_2024_Judges.csv');
const JUDGE_2025_CSV = join(CSV_DIR, 'Judge_applications_2025_awards.csv');
const JUDGE_2026_CSV = join(CSV_DIR, 'Judge_applications_2026_awards.csv');
const SUPPLIER_2025_CSV = join(CSV_DIR, 'Enriched_Chillifest_Results_2025.csv');

interface Judge2024 {
  id: string;
  Name: string;
  'Source-affiliation': string;
  Address: string;
  Email: string;
  Status: string;
}

interface Judge2025_2026 {
  '#': string;
  'Date Submitted': string;
  'Full Name :': string;
  'Email for tracking : ': string;
  Address: string;
  Zip: string;
  City: string;
  Country: string;
  'What is your hotsauce experience?': string;
  'Please tell us if you are affiliated with any hot sauce company\'s please.': string;
}

interface Supplier2025 {
  COMPANY: string;
  'CONTACT NAME': string;
  EMAIL: string;
  AWARD?: string;
  [key: string]: any;
}

// Judge type classification for 2024 data
function classify2024JudgeType(sourceAffiliation: string): {
  judgeType: 'pro' | 'community' | 'supplier';
  sourceChannel?: string;
  companyAffiliation?: string;
} {
  const lower = sourceAffiliation.toLowerCase().trim();

  // Professional indicators
  if (lower === 'pro' || lower === 'sof') {
    return { judgeType: 'pro', companyAffiliation: lower };
  }

  // Social media channels (likely community judges)
  if (lower === 'facebook' || lower === 'telegram' || lower === 'whatsapp' || lower === 'email') {
    return { judgeType: 'community', sourceChannel: lower };
  }

  // Empty or generic
  if (lower === '' || lower === 'facebook' || lower === 'whatsapp') {
    return { judgeType: 'community' };
  }

  // Anything else is likely a company name (supplier)
  return { judgeType: 'supplier', companyAffiliation: sourceAffiliation };
}

// Map 2025/2026 experience levels to judge types
function mapExperienceToJudgeType(experience: string): 'pro' | 'community' {
  if (experience.includes('professional-chili-person') || experience.includes('experienced-food-chili-person')) {
    return 'pro';
  }
  return 'community';
}

// Fuzzy match names (for cross-referencing)
function fuzzyMatchName(name1: string, name2: string, threshold = 0.7): boolean {
  const fuse = new Fuse([name1], { threshold });
  const result = fuse.search(name2);
  return result.length > 0;
}

async function import2024Judges() {
  console.log('\n📋 Importing 2024 judges...');

  const csvContent = readFileSync(JUDGE_2024_CSV, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as Judge2024[];

  let imported = 0;
  let skipped = 0;

  for (const record of records) {
    // Skip if no email
    if (!record.Email || record.Email.trim() === '') {
      console.log(`⚠️  Skipping ${record.Name} - no email`);
      skipped++;
      continue;
    }

    const { judgeType, sourceChannel, companyAffiliation } = classify2024JudgeType(record['Source-affiliation']);

    const { error} = await supabase
      .from('judge_participations')
      .upsert({
        email: record.Email.trim().toLowerCase(),
        full_name: record.Name,
        year: 2024,
        judge_type: judgeType,
        source_channel: sourceChannel || 'csv_import_2024',
        company_affiliation: companyAffiliation,
        accepted: record.Status === 'done'
      }, {
        onConflict: 'email,year'
      });

    if (error) {
      console.error(`❌ Error importing ${record.Name}:`, error.message);
    } else {
      imported++;
    }
  }

  console.log(`✅ Imported ${imported} judges from 2024 (skipped ${skipped})`);
}

async function import2025Judges() {
  console.log('\n📋 Importing 2025 judges...');

  const csvContent = readFileSync(JUDGE_2025_CSV, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as Judge2025_2026[];

  let imported = 0;

  for (const record of records) {
    const email = record['Email for tracking : '].trim().toLowerCase();
    if (!email) continue;

    const judgeType = mapExperienceToJudgeType(record['What is your hotsauce experience?']);
    const affiliation = record['Please tell us if you are affiliated with any hot sauce company\'s please.'];

    const { error } = await supabase
      .from('judge_participations')
      .upsert({
        email,
        full_name: record['Full Name :'],
        year: 2025,
        application_date: new Date(record['Date Submitted']).toISOString(),
        judge_type: judgeType,
        experience_level: record['What is your hotsauce experience?'],
        company_affiliation: affiliation && affiliation.trim() !== '' ? affiliation : null,
        accepted: true,
        source_channel: 'csv_import_2025'
      }, {
        onConflict: 'email,year'
      });

    if (error) {
      console.error(`❌ Error importing ${record['Full Name :']}:`, error.message);
    } else {
      imported++;
    }
  }

  console.log(`✅ Imported ${imported} judges from 2025`);
}

async function import2026Judges() {
  console.log('\n📋 Importing 2026 judges...');

  const csvContent = readFileSync(JUDGE_2026_CSV, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as Judge2025_2026[];

  let imported = 0;

  for (const record of records) {
    const email = record['Email for tracking : '].trim().toLowerCase();
    if (!email) continue;

    const judgeType = mapExperienceToJudgeType(record['What is your hotsauce experience?']);
    const affiliation = record['Please tell us if you are affiliated with any hot sauce company\'s please.'];

    const { error } = await supabase
      .from('judge_participations')
      .upsert({
        email,
        full_name: record['Full Name :'],
        year: 2026,
        application_date: new Date(record['Date Submitted']).toISOString(),
        judge_type: judgeType,
        experience_level: record['What is your hotsauce experience?'],
        company_affiliation: affiliation && affiliation.trim() !== '' ? affiliation : null,
        accepted: false, // Not yet accepted
        source_channel: 'csv_import_2026'
      }, {
        onConflict: 'email,year'
      });

    if (error) {
      console.error(`❌ Error importing ${record['Full Name :']}:`, error.message);
    } else {
      imported++;
    }
  }

  console.log(`✅ Imported ${imported} judges from 2026`);
}

async function import2025Suppliers() {
  console.log('\n🏭 Importing 2025 suppliers...');

  const csvContent = readFileSync(SUPPLIER_2025_CSV, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true
  }) as Supplier2025[];

  // Group by company email to count sauces and detect awards
  const supplierMap = new Map<string, {
    company: string;
    contactName: string;
    email: string;
    sauceCount: number;
    hasAwards: boolean;
  }>();

  for (const record of records) {
    const email = record.EMAIL?.trim().toLowerCase();
    if (!email) continue;

    const existing = supplierMap.get(email);
    const hasAward = record.AWARD && (
      record.AWARD.includes('GOLD') ||
      record.AWARD.includes('SILVER') ||
      record.AWARD.includes('BRONZE')
    );

    if (existing) {
      existing.sauceCount++;
      if (hasAward) existing.hasAwards = true;
    } else {
      supplierMap.set(email, {
        company: record.COMPANY,
        contactName: record['CONTACT NAME'],
        email,
        sauceCount: 1,
        hasAwards: hasAward || false
      });
    }
  }

  let imported = 0;

  for (const [email, data] of supplierMap) {
    const { error } = await supabase
      .from('supplier_participations')
      .upsert({
        email,
        company_name: data.company,
        year: 2025,
        sauce_count: data.sauceCount,
        has_awards: data.hasAwards,
        participated: true,
        source: 'csv_import_2025'
      }, {
        onConflict: 'email,year'
      });

    if (error) {
      console.error(`❌ Error importing supplier ${data.company}:`, error.message);
    } else {
      imported++;
    }
  }

  console.log(`✅ Imported ${imported} suppliers from 2025`);
}

async function crossReferenceSuppliers() {
  console.log('\n🔗 Cross-referencing suppliers with judges...');

  // Get all supplier participations
  const { data: suppliers } = await supabase
    .from('supplier_participations')
    .select('email, company_name');

  // Get all judge participations
  const { data: judges } = await supabase
    .from('judge_participations')
    .select('email, full_name, year, judge_type');

  if (!suppliers || !judges) {
    console.error('❌ Failed to fetch data for cross-referencing');
    return;
  }

  let exactMatches = 0;
  let fuzzyMatches = 0;

  for (const supplier of suppliers) {
    // Try exact email match first
    const exactMatch = judges.find(j => j.email === supplier.email);

    if (exactMatch && exactMatch.judge_type !== 'supplier') {
      await supabase
        .from('judge_participations')
        .update({
          judge_type: 'supplier',
          company_affiliation: supplier.company_name
        })
        .eq('email', supplier.email)
        .eq('year', exactMatch.year);

      exactMatches++;
      console.log(`✅ Exact match: ${supplier.email} → ${supplier.company_name}`);
    }

    // TODO: Implement fuzzy name matching for suppliers without exact email match
    // This would require matching company names with judge names
  }

  console.log(`✅ Cross-referenced: ${exactMatches} exact matches, ${fuzzyMatches} fuzzy matches`);
}

async function syncContactData() {
  console.log('\n🔄 Syncing contact data to main tables...');

  // We need to get address data from the original CSV files since judge_participations doesn't store it
  // Let's create a map of email -> address data from the CSVs
  const addressMap = new Map<string, { address?: string; city?: string; postal_code?: string; country?: string }>();

  // Parse 2024 judges for address data
  try {
    const csv2024 = readFileSync(JUDGE_2024_CSV, 'utf-8');
    const records2024 = parse(csv2024, { columns: true, skip_empty_lines: true, trim: true }) as Judge2024[];
    for (const record of records2024) {
      if (record.Email) {
        const email = record.Email.trim().toLowerCase();
        addressMap.set(email, { address: record.Address || undefined });
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not parse 2024 addresses:', error);
  }

  // Parse 2025 judges for address data
  try {
    const csv2025 = readFileSync(JUDGE_2025_CSV, 'utf-8');
    const records2025 = parse(csv2025, { columns: true, skip_empty_lines: true, trim: true }) as Judge2025_2026[];
    for (const record of records2025) {
      const email = record['Email for tracking : ']?.trim().toLowerCase();
      if (email) {
        addressMap.set(email, {
          address: record.Address || undefined,
          city: record.City || undefined,
          postal_code: record.Zip || undefined,
          country: record.Country || undefined
        });
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not parse 2025 addresses:', error);
  }

  // Parse 2026 judges for address data (most recent, takes priority)
  try {
    const csv2026 = readFileSync(JUDGE_2026_CSV, 'utf-8');
    const records2026 = parse(csv2026, { columns: true, skip_empty_lines: true, trim: true }) as Judge2025_2026[];
    for (const record of records2026) {
      const email = record['Email for tracking : ']?.trim().toLowerCase();
      if (email) {
        addressMap.set(email, {
          address: record.Address || undefined,
          city: record.City || undefined,
          postal_code: record.Zip || undefined,
          country: record.Country || undefined
        });
      }
    }
  } catch (error) {
    console.warn('⚠️  Could not parse 2026 addresses:', error);
  }

  // Get latest judge data (most recent year)
  const { data: latestJudges } = await supabase
    .from('judge_participations')
    .select('email, full_name')
    .order('year', { ascending: false });

  if (latestJudges) {
    const uniqueJudges = new Map();
    for (const judge of latestJudges) {
      if (!uniqueJudges.has(judge.email)) {
        uniqueJudges.set(judge.email, judge);
      }
    }

    for (const [email, judge] of uniqueJudges) {
      const addressData = addressMap.get(email) || {};
      await supabase
        .from('judges')
        .upsert({
          email,
          name: judge.full_name,
          type: 'community', // Default, will be updated by participations
          active: false,
          address: addressData.address,
          city: addressData.city,
          postal_code: addressData.postal_code,
          country: addressData.country
        }, {
          onConflict: 'email',
          ignoreDuplicates: false
        });
    }

    console.log(`✅ Synced ${uniqueJudges.size} judges to main table (with addresses)`);
  }

  // Get latest supplier data
  const { data: latestSuppliers } = await supabase
    .from('supplier_participations')
    .select('email, company_name')
    .order('year', { ascending: false });

  if (latestSuppliers) {
    const uniqueSuppliers = new Map();
    for (const supplier of latestSuppliers) {
      if (!uniqueSuppliers.has(supplier.email)) {
        uniqueSuppliers.set(supplier.email, supplier);
      }
    }

    for (const [email, supplier] of uniqueSuppliers) {
      await supabase
        .from('suppliers')
        .upsert({
          email,
          brand_name: supplier.company_name
        }, {
          onConflict: 'email',
          ignoreDuplicates: false
        });
    }

    console.log(`✅ Synced ${uniqueSuppliers.size} suppliers to main table`);
  }
}

async function main() {
  console.log('🚀 Starting historical data import...\n');

  try {
    // Import all judge data
    await import2024Judges();
    await import2025Judges();
    await import2026Judges();

    // Import supplier data
    await import2025Suppliers();

    // Cross-reference
    await crossReferenceSuppliers();

    // Sync to main tables
    await syncContactData();

    console.log('\n✨ Import complete!');
  } catch (error) {
    console.error('\n❌ Import failed:', error);
    process.exit(1);
  }
}

main();

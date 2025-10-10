/**
 * Import 2024 results to Supabase past_results table
 *
 * Reads the enriched 2024 CSV and imports to database
 */

import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';
import { readFileSync } from 'fs';
import { join } from 'path';

const CSV_PATH = join(
  process.cwd(),
  'past_results',
  '2024_enriched_results.csv'
);

interface EnrichedRow {
  year: string;
  area: string;
  code: string;
  category: string;
  sauce_name: string;
  company: string;
  contact_name: string;
  country: string;
  award: string;
  position: string;
  total_score: string;
}

async function importResults() {
  // Check for required environment variables
  const projectUrl = process.env.PROJECT_URL;
  const serviceRoleKey = process.env.SERVICE_ROLE_KEY;

  if (!projectUrl || !serviceRoleKey) {
    console.error('❌ Missing environment variables:');
    console.error('   PROJECT_URL:', projectUrl ? '✅' : '❌');
    console.error('   SERVICE_ROLE_KEY:', serviceRoleKey ? '✅' : '❌');
    console.error('\nPlease set these environment variables and try again.');
    process.exit(1);
  }

  const supabase = createClient(projectUrl, serviceRoleKey);

  console.log('📊 Loading enriched 2024 results...\n');

  const csvContent = readFileSync(CSV_PATH, 'utf-8');
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as EnrichedRow[];

  console.log(`✅ Found ${records.length} results to import\n`);

  let imported = 0;
  let errors = 0;
  const errorDetails: string[] = [];

  for (const record of records) {
    // Skip header rows that got into the data
    if (record.code === 'Code' || !record.code || !record.sauce_name) {
      continue;
    }

    try {
      const { error } = await supabase.from('past_results').upsert(
        {
          year: parseInt(record.year),
          area: record.area || null,
          code: record.code,
          category: record.category,
          award: record.award || null,
          position: record.position ? parseInt(record.position) : null,
          company_name: record.company || null,
          contact_name: record.contact_name || null,
          email: null, // Not available for 2024
          website: null, // Not available for 2024
          country: record.country || null,
          company_description: null,
          company_logo_url: null,
          entry_name: record.sauce_name,
          short_description: null,
          flavor_profile: null,
          chilli_types: null,
          pairings: null,
          bottle_size: null,
          retail_price: null,
          product_url: null,
          product_image_url: null,
        },
        {
          onConflict: 'code', // CODE is unique
        }
      );

      if (error) {
        console.error(
          `❌ Error importing ${record.code} (${record.sauce_name}):`,
          error.message
        );
        errorDetails.push(`${record.code}: ${error.message}`);
        errors++;
      } else {
        imported++;
        if (imported % 50 === 0) {
          console.log(`   Imported ${imported}/${records.length}...`);
        }
      }
    } catch (err) {
      console.error(
        `❌ Exception importing ${record.code} (${record.sauce_name}):`,
        err
      );
      errorDetails.push(`${record.code}: ${err}`);
      errors++;
    }
  }

  console.log(`\n✅ Successfully imported ${imported} results`);
  console.log(`❌ Errors: ${errors}`);

  if (errorDetails.length > 0) {
    console.log('\n⚠️  Error details:');
    errorDetails.slice(0, 10).forEach((detail) => console.log(`   ${detail}`));
    if (errorDetails.length > 10) {
      console.log(`   ... and ${errorDetails.length - 10} more errors`);
    }
  }

  // Show some stats
  console.log('\n📊 Import Statistics:');
  console.log(`   Total results: ${records.length}`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Failed: ${errors}`);

  // Show category breakdown
  const categories = new Map<string, number>();
  for (const record of records) {
    categories.set(
      record.category,
      (categories.get(record.category) || 0) + 1
    );
  }

  console.log('\n📋 Results by Category:');
  Array.from(categories.entries())
    .sort((a, b) => b[1] - a[1])
    .forEach(([cat, count]) => {
      console.log(`   ${cat}: ${count}`);
    });

  // Show winners
  console.log('\n🏆 First Place Winners:');
  const winners = records.filter((r) => r.position === '1');
  winners.forEach((w) => {
    console.log(
      `   ${w.category}: ${w.sauce_name} by ${w.company || 'Unknown'}`
    );
  });
}

importResults().catch((err) => {
  console.error('❌ Fatal error:', err);
  process.exit(1);
});

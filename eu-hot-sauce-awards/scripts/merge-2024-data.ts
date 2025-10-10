/**
 * Merge 2024 entries and results data
 *
 * This script combines:
 * - 2024_entries.csv: Has company/contact names and sauce codes
 * - 2024_results_by_category.csv: Has awards, placements, and scores
 *
 * Output: Enriched CSV ready for database import
 */

import { parse } from 'csv-parse/sync';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const ENTRIES_PATH = join(process.cwd(), 'past_results', '2024_entries.csv');
const RESULTS_PATH = join(process.cwd(), 'past_results', '2024_results_by_category.csv');
const OUTPUT_PATH = join(process.cwd(), 'past_results', '2024_enriched_results.csv');

interface EntryRow {
  Order: string;
  Contact: string;
  Company: string;
  Contry: string;
  Comp: string;
  Sauces: string;
  Arrived: string;
  Cat: string;
  'Sauce Name': string;
  code: string;
  [key: string]: string;
}

interface ResultRow {
  Comp: string;
  Cat: string;
  'Sauce Name': string;
  Code: string;
  'Total Points': string;
  Prize: string;
  [key: string]: string;
}

interface EnrichedResult {
  year: number;
  area: string;
  code: string;
  category: string;
  sauce_name: string;
  company: string;
  contact_name: string;
  country: string;
  award: string;
  position: number | null;
  total_score: number | null;
}

function parseCategoryCode(catCode: string): string {
  const categoryMap: { [key: string]: string } = {
    'BBQ': 'BBQ Sauce',
    'Extact': 'Extract Based',
    'Free': 'Freestyle',
    'Honey': 'Chili Honey',
    'Hot': 'Hot',
    'Jam': 'Chili Jam',
    'Med': 'Medium',
    'Mild': 'Mild',
    'Oil': 'Chili Oil',
    'Pickles': 'Pickles',
    'X Hot': 'Extra Hot',
  };

  return categoryMap[catCode] || catCode;
}

function parsePosition(prize: string): number | null {
  if (!prize) return null;
  const match = prize.match(/(\d+)(st|nd|rd|th)\s+Place/i);
  return match ? parseInt(match[1]) : null;
}

async function mergeData() {
  console.log('📊 Loading 2024 data files...\n');

  // Load entries CSV
  const entriesContent = readFileSync(ENTRIES_PATH, 'utf-8');
  const entries = parse(entriesContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as EntryRow[];

  console.log(`✅ Loaded ${entries.length} entries from 2024_entries.csv`);

  // Load results CSV
  const resultsContent = readFileSync(RESULTS_PATH, 'utf-8');
  const results = parse(resultsContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  }) as ResultRow[];

  console.log(`✅ Loaded ${results.length} results from 2024_results_by_category.csv\n`);

  // Create lookup map from entries by sauce code
  const entriesMap = new Map<string, EntryRow>();
  for (const entry of entries) {
    if (entry.code) {
      entriesMap.set(entry.code.trim(), entry);
    }
  }

  console.log(`📋 Processing results and enriching with entry data...\n`);

  // Merge data
  const enriched: EnrichedResult[] = [];
  let matched = 0;
  let unmatched = 0;

  for (const result of results) {
    // Skip empty rows and header rows
    if (!result.Code || !result['Sauce Name'] || result.Code === 'Code') continue;

    const code = result.Code.trim();
    const entry = entriesMap.get(code);

    if (entry) {
      matched++;
      enriched.push({
        year: 2024,
        area: result.Comp || 'EURO',
        code: code,
        category: parseCategoryCode(result.Cat),
        sauce_name: result['Sauce Name'].trim(),
        company: entry.Company || '',
        contact_name: entry.Contact || '',
        country: entry.Contry || '',
        award: result.Prize || '',
        position: parsePosition(result.Prize),
        total_score: result['Total Points'] ? parseInt(result['Total Points']) : null,
      });
    } else {
      unmatched++;
      console.log(`⚠️  No entry found for code: ${code} (${result['Sauce Name']})`);

      // Add result without company info
      enriched.push({
        year: 2024,
        area: result.Comp || 'EURO',
        code: code,
        category: parseCategoryCode(result.Cat),
        sauce_name: result['Sauce Name'].trim(),
        company: '',
        contact_name: '',
        country: '',
        award: result.Prize || '',
        position: parsePosition(result.Prize),
        total_score: result['Total Points'] ? parseInt(result['Total Points']) : null,
      });
    }
  }

  console.log(`\n✅ Matched: ${matched} results with entry data`);
  console.log(`⚠️  Unmatched: ${unmatched} results (missing entry data)`);
  console.log(`📊 Total enriched results: ${enriched.length}\n`);

  // Write enriched CSV manually
  const headers = [
    'year',
    'area',
    'code',
    'category',
    'sauce_name',
    'company',
    'contact_name',
    'country',
    'award',
    'position',
    'total_score',
  ];

  const escapeCsv = (value: any): string => {
    if (value === null || value === undefined) return '';
    const str = String(value);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const csvLines = [headers.join(',')];
  for (const row of enriched) {
    const values = headers.map(h => escapeCsv(row[h as keyof EnrichedResult]));
    csvLines.push(values.join(','));
  }

  writeFileSync(OUTPUT_PATH, csvLines.join('\n'), 'utf-8');
  console.log(`✅ Wrote enriched data to: ${OUTPUT_PATH}`);

  // Show sample winners
  console.log('\n🏆 Sample Winners:');
  const winners = enriched.filter(r => r.position === 1).slice(0, 5);
  winners.forEach(w => {
    console.log(`  ${w.category}: ${w.sauce_name} by ${w.company}`);
  });
}

mergeData().catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});

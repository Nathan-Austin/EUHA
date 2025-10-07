/**
 * Import 2025 results from CSV files into Supabase
 *
 * This script:
 * 1. Reads both CSV files (basic results + enriched data)
 * 2. Merges data by CODE
 * 3. Parses awards and rankings
 * 4. Uploads product images to Supabase Storage
 * 5. Inserts data into past_results table
 *
 * Run from project root:
 * npx tsx eu-hot-sauce-awards/scripts/import-2025-results.ts
 */

import * as fs from 'fs';
import * as path from 'path';
import { createClient } from '@supabase/supabase-js';

// Types
interface BasicResult {
  COMPANY: string;
  ENTRY: string;
  AREA: string;
  CATOGORY: string; // Note the typo in CSV
  CODE: string;
  PLACE: string;
  'TOP 20': string;
}

interface EnrichedResult {
  COMPANY: string;
  'CONTACT NAME': string;
  EMAIL: string;
  'WEBSITE OR SOCIAL MEDIA LINK': string;
  COUNTRY: string;
  'COMPANY DESCRIPTION OR MOTTO': string;
  'LINK TO COMPANY LOGO IMAGE': string;
  AREA: string;
  CATOGORY: string;
  CODE: string;
  AWARD: string;
  'AWARD RANK': string;
  ENTRY: string;
  'SHORT DESCRIPTION': string;
  'FLAVOR PROFILE': string;
  'CHILLI TYPES': string;
  PAIRINGS: string;
  'BOTTLE SIZE': string;
  'RETAIL PRICE': string;
  'DIRECT PRODUCT LINK': string;
  'LINK TO PRODUCT IMAGE': string;
}

interface MergedResult {
  year: number;
  area: string;
  code: string;
  category: string;
  award: string;
  position: number;
  global_rank: number | null;
  company_name: string;
  contact_name: string | null;
  email: string | null;
  website: string | null;
  country: string | null;
  company_description: string | null;
  company_logo_url: string | null;
  entry_name: string;
  short_description: string | null;
  flavor_profile: string | null;
  chilli_types: string | null;
  pairings: string | null;
  bottle_size: string | null;
  retail_price: string | null;
  product_url: string | null;
  product_image_url: string | null;
  sauce_name: string; // Legacy
  supplier_name: string; // Legacy
}

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Helper functions
function parseCSV(content: string): any[] {
  const lines = content.split('\n');
  const headers = lines[0].split(',');
  const results: any[] = [];

  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    // Simple CSV parsing (doesn't handle quoted commas)
    const values = line.split(',');
    const obj: any = {};

    headers.forEach((header, index) => {
      obj[header.trim()] = values[index]?.trim() || '';
    });

    // Only add if CODE exists
    if (obj.CODE) {
      results.push(obj);
    }
  }

  return results;
}

function parsePosition(award: string): number {
  if (award.includes('winner') || award === 'GOLD (winner)') return 1;
  if (award === 'GOLD') return 2;
  if (award === 'SILVER') return 3;
  if (award === 'BRONZE') return 4;
  return 0;
}

function parseGlobalRank(topTwenty: string): number | null {
  if (!topTwenty) return null;
  const match = topTwenty.match(/Rank (\d+)/);
  return match ? parseInt(match[1]) : null;
}

async function uploadImage(code: string, imageUrl: string): Promise<string | null> {
  if (!imageUrl || imageUrl.startsWith('http')) {
    // Already a URL, return as-is
    return imageUrl || null;
  }

  // If it's a local file path, upload to Supabase Storage
  try {
    const imagePath = path.join(__dirname, '../../past_results/images', `${code}.jpg`);

    if (fs.existsSync(imagePath)) {
      const fileBuffer = fs.readFileSync(imagePath);
      const fileName = `2025/${code}.jpg`;

      const { data, error } = await supabase.storage
        .from('past-results-images')
        .upload(fileName, fileBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        });

      if (error) {
        console.error(`Error uploading image for ${code}:`, error);
        return null;
      }

      // Get public URL
      const { data: publicData } = supabase.storage
        .from('past-results-images')
        .getPublicUrl(fileName);

      return publicData.publicUrl;
    }
  } catch (err) {
    console.error(`Error processing image for ${code}:`, err);
  }

  return null;
}

async function main() {
  console.log('🌶️  Starting 2025 results import...\n');

  // Read CSV files
  const basicResultsPath = path.join(__dirname, '../../past_results/2025_results_and_placements.csv');
  const enrichedResultsPath = path.join(__dirname, '../../past_results/Enriched_Chillifest_Results - Enriched_Chillifest_Results.csv');

  const basicContent = fs.readFileSync(basicResultsPath, 'utf-8');
  const enrichedContent = fs.readFileSync(enrichedResultsPath, 'utf-8');

  const basicResults: BasicResult[] = parseCSV(basicContent);
  const enrichedResults: EnrichedResult[] = parseCSV(enrichedContent);

  console.log(`📊 Loaded ${basicResults.length} basic results`);
  console.log(`📊 Loaded ${enrichedResults.length} enriched results\n`);

  // Create a map of enriched results by CODE
  const enrichedMap = new Map<string, EnrichedResult>();
  enrichedResults.forEach(result => {
    if (result.CODE) {
      enrichedMap.set(result.CODE, result);
    }
  });

  // Merge data
  const mergedResults: MergedResult[] = basicResults.map(basic => {
    const enriched = enrichedMap.get(basic.CODE);
    const globalRank = parseGlobalRank(basic['TOP 20']);

    return {
      year: 2025,
      area: basic.AREA,
      code: basic.CODE,
      category: basic.CATOGORY,
      award: basic.PLACE,
      position: parsePosition(basic.PLACE),
      global_rank: globalRank,
      company_name: enriched?.COMPANY || basic.COMPANY,
      contact_name: enriched?.['CONTACT NAME'] || null,
      email: enriched?.EMAIL || null,
      website: enriched?.['WEBSITE OR SOCIAL MEDIA LINK'] || null,
      country: enriched?.COUNTRY || null,
      company_description: enriched?.['COMPANY DESCRIPTION OR MOTTO'] || null,
      company_logo_url: enriched?.['LINK TO COMPANY LOGO IMAGE'] || null,
      entry_name: enriched?.ENTRY || basic.ENTRY,
      short_description: enriched?.['SHORT DESCRIPTION'] || null,
      flavor_profile: enriched?.['FLAVOR PROFILE'] || null,
      chilli_types: enriched?.['CHILLI TYPES'] || null,
      pairings: enriched?.PAIRINGS || null,
      bottle_size: enriched?.['BOTTLE SIZE'] || null,
      retail_price: enriched?.['RETAIL PRICE'] || null,
      product_url: enriched?.['DIRECT PRODUCT LINK'] || null,
      product_image_url: enriched?.['LINK TO PRODUCT IMAGE'] || null,
      sauce_name: enriched?.ENTRY || basic.ENTRY,
      supplier_name: enriched?.COMPANY || basic.COMPANY,
    };
  });

  console.log(`✅ Merged ${mergedResults.length} results\n`);

  // Upload images and insert data
  let successCount = 0;
  let errorCount = 0;

  for (const result of mergedResults) {
    try {
      // Upload image if needed
      if (result.product_image_url && !result.product_image_url.startsWith('http')) {
        const uploadedUrl = await uploadImage(result.code, result.product_image_url);
        if (uploadedUrl) {
          result.product_image_url = uploadedUrl;
        }
      }

      // Insert into database
      const { error } = await supabase
        .from('past_results')
        .insert(result);

      if (error) {
        console.error(`❌ Error inserting ${result.code} (${result.entry_name}):`, error.message);
        errorCount++;
      } else {
        successCount++;
        if (result.global_rank) {
          console.log(`✅ Inserted #${result.global_rank}: ${result.entry_name} (${result.code})`);
        } else {
          console.log(`✅ Inserted: ${result.entry_name} (${result.code})`);
        }
      }
    } catch (err) {
      console.error(`❌ Exception inserting ${result.code}:`, err);
      errorCount++;
    }
  }

  console.log(`\n🎉 Import complete!`);
  console.log(`✅ Successfully imported: ${successCount}`);
  console.log(`❌ Errors: ${errorCount}`);
}

main().catch(console.error);

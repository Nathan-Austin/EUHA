
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const pastResults = [
  {
    year: 2024,
    category: 'Mild Chili Sauce',
    sauce_name: 'Sunset Mild',
    supplier_name: 'Coastal Heat',
    position: 1,
    award_type: 'gold_best',
  },
  {
    year: 2024,
    category: 'Medium Chili Sauce',
    sauce_name: 'Forest Fire',
    supplier_name: 'Mountain Spice',
    position: 1,
    award_type: 'gold_best',
  },
  {
    year: 2024,
    category: 'Hot Chili Sauce',
    sauce_name: 'Dragons Breath',
    supplier_name: 'Mythic Peppers',
    position: 1,
    award_type: 'gold_best',
  },
  {
    year: 2024,
    category: 'Hot Chili Sauce',
    sauce_name: 'Red Giant',
    supplier_name: 'Stellar Sauces',
    position: 2,
    award_type: 'gold',
  },
];

async function seedPastResults() {
  console.log('Seeding past results...');

  const { error } = await supabase
    .from('past_results')
    .upsert(pastResults, { onConflict: 'year,category,sauce_name' }); // A bit arbitrary, but prevents exact duplicates

  if (error) {
    console.error('Error seeding past results:', error);
  } else {
    console.log('Successfully seeded past results.');
  }
}

seedPastResults();

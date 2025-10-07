
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

// IMPORTANT: Make sure to set these environment variables before running the script.
// You can create a .env file in the root of the project and run `deno run --allow-env --allow-net scripts/seed-sponsors.ts`
const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const sponsors = [
  {
    name: "Flying Goose Brand",
    logo_url: "/sponsors/flying-goose.png", // Assuming you will add this image to /public/sponsors
    website: "https://flyinggoosebrand.com",
    tier: "gold",
    display_order: 1,
    active: true
  },
  {
    name: "Chilisaus.be",
    logo_url: "/sponsors/chilisaus.png", // Assuming you will add this image to /public/sponsors
    website: "https://chilisaus.be",
    tier: "gold",
    display_order: 2,
    active: true
  }
];

async function seedSponsors() {
  console.log('Seeding sponsors...');

  const { data, error } = await supabase
    .from('sponsors')
    .upsert(sponsors, { onConflict: 'name' }); // Upsert on name to avoid duplicates

  if (error) {
    console.error('Error seeding sponsors:', error);
  } else {
    console.log('Successfully seeded sponsors:', data);
  }
}

seedSponsors();

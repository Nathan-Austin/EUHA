
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('NEXT_PUBLIC_SUPABASE_URL');
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required.');
  Deno.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

const events = [
  {
    title: 'BERLIN CHILI FEST : SPICY CHRISTMAS MARKET',
    description: 'A very spicy Christmas Market at Berliner Berg Brauerei.',
    event_date: '2025-12-06',
    end_date: '2025-12-07',
    location: 'Berlin, Germany',
    venue: 'Berliner Berg Brauerei',
    featured: true,
    active: true,
  },
  {
    title: 'EU Hot Sauce Awards Judging Weekend',
    description: 'Our panel of expert and community judges taste and score this year\'s entries.',
    event_date: '2026-04-11',
    end_date: '2026-04-12',
    location: 'Various / Online',
    featured: true,
    active: true,
  },
];

async function seedEvents() {
  console.log('Seeding events...');

  const { error } = await supabase
    .from('events')
    .upsert(events, { onConflict: 'title,event_date' }); // Prevent duplicates based on name and date

  if (error) {
    console.error('Error seeding events:', error);
  } else {
    console.log('Successfully seeded events.');
  }
}

seedEvents();

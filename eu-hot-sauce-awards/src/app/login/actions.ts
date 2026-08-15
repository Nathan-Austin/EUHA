'use server';

import { createClient as createServiceClient } from '@supabase/supabase-js';
import { validateEmail } from '@/lib/validation';

// Broad but not exhaustive — good enough for a default; admins can correct via
// updateSupplierCountryRegion (src/app/actions.ts) if a country lands wrong.
const EUROPEAN_COUNTRIES = new Set([
  'Austria', 'Belgium', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic', 'Czechia',
  'Denmark', 'Estonia', 'Finland', 'France', 'Germany', 'Greece', 'Hungary', 'Iceland',
  'Ireland', 'Italy', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta',
  'Netherlands', 'Norway', 'Poland', 'Portugal', 'Romania', 'Slovakia', 'Slovenia',
  'Spain', 'Sweden', 'Switzerland', 'UK', 'United Kingdom',
]);

interface RegisterResult {
  success?: true;
  error?: string;
}

export async function registerNewSupplier(formData: FormData): Promise<RegisterResult> {
  const brandName = ((formData.get('brandName') as string) || '').trim();
  const contactName = ((formData.get('contactName') as string) || '').trim();
  const email = ((formData.get('email') as string) || '').trim().toLowerCase();
  const country = ((formData.get('country') as string) || '').trim();

  if (!brandName || !contactName || !email || !country) {
    return { error: 'Please fill in all fields.' };
  }

  const emailValidation = validateEmail(email);
  if (!emailValidation.isValid) {
    return { error: emailValidation.error || 'Please enter a valid email address.' };
  }

  const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
    return { error: 'Registration service is not configured.' };
  }

  const supabase = createServiceClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
    auth: { persistSession: false },
  });

  const { data: existing } = await supabase
    .from('suppliers')
    .select('id')
    .ilike('email', email)
    .maybeSingle();

  if (existing) {
    return { error: 'An account already exists for this email — use "Returning" and log in instead.' };
  }

  const region = EUROPEAN_COUNTRIES.has(country) ? 'european' : 'international';

  const { error: insertError } = await supabase.from('suppliers').insert({
    brand_name: brandName,
    contact_name: contactName,
    email,
    country,
    region,
  });

  if (insertError) {
    console.error('Failed to create supplier during registration', insertError);
    return { error: 'Something went wrong creating your account. Please try again.' };
  }

  return { success: true };
}

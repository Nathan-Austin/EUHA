'use server';

import { createClient as createServiceClient } from '@supabase/supabase-js';
import { validateEmail } from '@/lib/validation';
import { findCountry, isRecognizedCountry } from '@/lib/countries';

interface RegisterResult {
  success?: true;
  error?: string;
}

export async function registerNewSupplier(formData: FormData): Promise<RegisterResult> {
  // Honeypot: a hidden "website" field real users never see or fill (see
  // login/page.tsx). A non-empty value means a bot filled every field it
  // found. Report success so it doesn't retry — just skip creating anything.
  const honeypot = ((formData.get('website') as string) || '').trim();
  if (honeypot) {
    return { success: true };
  }

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

  if (!isRecognizedCountry(country)) {
    return { error: 'Please select a valid country.' };
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

  const region = findCountry(country)?.region === 'Europe' ? 'european' : 'international';

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

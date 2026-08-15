/**
 * EHC Membership Verification — EU Hot Sauce Awards
 * Calls EHC's read-only membership verify endpoint to check whether a
 * producer is an EHC member (or has committed to join) for the free-3rd-entry
 * discount. Server-only — the bearer token must never reach the browser.
 */

import type { EhcVerifyApiResponse, EhcVerifyRequest, EhcVerifyResult } from './types';

const EHC_CONFIG = {
  baseUrl: process.env.EHC_API_BASE_URL,
  apiToken: process.env.EHC_API_TOKEN,
} as const;

function validateConfig(): void {
  const missing: string[] = [];
  if (!EHC_CONFIG.baseUrl) missing.push('EHC_API_BASE_URL');
  if (!EHC_CONFIG.apiToken) missing.push('EHC_API_TOKEN');

  if (missing.length > 0) {
    throw new Error(`Missing EHC environment variables: ${missing.join(', ')}`);
  }
}

/**
 * Verifies an EHC membership number against the supplier's email and company
 * name on file. Distinguishes "the endpoint said no" (not_found/mismatch)
 * from "we couldn't reach the endpoint" (unavailable) — the latter must never
 * be shown to a producer as "not found", since it's not a statement about
 * their membership at all. EHC's endpoint isn't live yet as of this build,
 * so `unavailable` is the expected outcome until it ships.
 */
export async function verifyEhcMembership(request: EhcVerifyRequest): Promise<EhcVerifyResult> {
  try {
    validateConfig();

    const url = new URL('/api/membership/verify', EHC_CONFIG.baseUrl);
    url.searchParams.set('ehc_id', request.ehcId);
    url.searchParams.set('email', request.email);
    url.searchParams.set('company_name', request.companyName);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${EHC_CONFIG.apiToken}`,
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      const text = await response.text();
      return { outcome: 'unavailable', error: `EHC verify failed: ${response.status} ${text}` };
    }

    const data: EhcVerifyApiResponse = await response.json();

    if (!data.valid) {
      return { outcome: 'not_found' };
    }

    if (!data.match.email_match || !data.match.company_match) {
      return { outcome: 'mismatch', status: data.status };
    }

    if (data.status === 'member') {
      return { outcome: 'verified', status: 'member' };
    }
    if (data.status === 'pending') {
      return { outcome: 'pending_payment', status: 'pending' };
    }
    if (data.status) {
      return { outcome: 'not_qualifying', status: data.status };
    }

    return { outcome: 'not_found' };
  } catch (error) {
    return {
      outcome: 'unavailable',
      error: error instanceof Error ? error.message : 'Unknown error contacting EHC',
    };
  }
}
